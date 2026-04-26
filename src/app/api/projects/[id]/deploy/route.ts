import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/lib/auth/auth";
import dbConnect from "@/lib/db/mongoose";
import Project from "@/models/Project";
import { buildPreviewHtml } from "@/lib/preview/build-preview";

// POST /api/projects/[id]/deploy
//
// Deploy the project's current preview HTML to Vercel as a single-file static
// site, returning a publicly accessible *.vercel.app URL. The deployment is
// recorded with an expiry; subsequent GETs lazily delete it once the TTL is
// reached. Intended for short, demo-only shares — not production hosting.

const VERCEL_API_BASE = "https://api.vercel.com";

function safeProjectName(raw: string): string {
  // Vercel project names: lowercase, alphanumeric, dashes, underscores; <= 100 chars.
  const cleaned = raw
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return cleaned || "rapidmvp-demo";
}

async function deleteVercelDeployment(deploymentId: string, token: string) {
  try {
    await fetch(`${VERCEL_API_BASE}/v13/deployments/${deploymentId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    console.error("Failed to delete expired Vercel deployment", deploymentId, err);
  }
}

// New Vercel projects default to enforcing Vercel Authentication (SSO) on
// preview/production deployments — that breaks the "share with anyone" use
// case for demo links. We strip protections off the project right after
// creating the deployment so the URL is immediately public.
async function disableProjectProtections(projectName: string, token: string) {
  try {
    await fetch(`${VERCEL_API_BASE}/v9/projects/${encodeURIComponent(projectName)}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ssoProtection: null, passwordProtection: null }),
    });
  } catch (err) {
    console.error("Failed to disable Vercel project protections", projectName, err);
  }
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
  }

  const token = process.env.VERCEL_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "VERCEL_TOKEN is not configured. Add it to .env.local." },
      { status: 503 }
    );
  }

  await dbConnect();

  const project = await Project.findOne({
    _id: id,
    owner: session.user.id,
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  if (!project.files || project.files.length === 0) {
    return NextResponse.json(
      { error: "Nothing to deploy yet — generate code first." },
      { status: 400 }
    );
  }

  // If a previous deployment exists, fire-and-forget delete it before the new one.
  if (project.deployment?.deploymentId) {
    deleteVercelDeployment(project.deployment.deploymentId, token);
    project.deployment = null;
  }

  const html = buildPreviewHtml(
    project.files.map((f) => ({ path: f.path, content: f.content, language: f.language }))
  );

  const ttlMinutes = Math.max(
    1,
    Math.min(60, parseInt(process.env.DEPLOYMENT_TTL_MINUTES || "15", 10) || 15)
  );

  // Single-file static deployment. Vercel's v13 deployments API accepts an
  // inline file array — no SHA upload step needed for tiny payloads.
  const deployBody = {
    name: safeProjectName(project.name || "rapidmvp-demo"),
    files: [
      {
        file: "index.html",
        data: html,
      },
    ],
    projectSettings: {
      framework: null,
      buildCommand: null,
      installCommand: null,
      outputDirectory: null,
      devCommand: null,
    },
    target: "production",
  };

  let vercelRes: Response;
  try {
    vercelRes = await fetch(`${VERCEL_API_BASE}/v13/deployments?forceNew=1`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(deployBody),
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to reach Vercel API: ${(err as Error).message}` },
      { status: 502 }
    );
  }

  const vercelData = await vercelRes.json().catch(() => ({}));

  if (!vercelRes.ok) {
    const message =
      vercelData?.error?.message ||
      vercelData?.message ||
      `Vercel API returned ${vercelRes.status}`;
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const deploymentUrl = vercelData?.url ? `https://${vercelData.url}` : null;
  const deploymentId = vercelData?.id || vercelData?.uid || null;
  const projectNameUsed = deployBody.name;

  if (!deploymentUrl || !deploymentId) {
    return NextResponse.json(
      { error: "Vercel deployment succeeded but returned no URL" },
      { status: 502 }
    );
  }

  // Strip SSO/password protection so the demo URL is shareable to anyone.
  // Fire-and-forget: the deployment is already alive; protection takes effect
  // server-side immediately and applies to subsequent requests.
  await disableProjectProtections(projectNameUsed, token);

  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlMinutes * 60 * 1000);

  project.deployment = {
    url: deploymentUrl,
    deploymentId,
    createdAt: now,
    expiresAt,
  };
  await project.save();

  return NextResponse.json({
    url: deploymentUrl,
    expiresAt: expiresAt.toISOString(),
    ttlMinutes,
  });
}

// GET /api/projects/[id]/deploy — return current deployment status.
// Lazily deletes the deployment on Vercel and clears the field if expired.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
  }

  await dbConnect();

  const project = await Project.findOne({
    _id: id,
    owner: session.user.id,
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  if (!project.deployment) {
    return NextResponse.json({ deployment: null });
  }

  const now = new Date();
  if (project.deployment.expiresAt && project.deployment.expiresAt <= now) {
    const token = process.env.VERCEL_TOKEN;
    if (token && project.deployment.deploymentId) {
      deleteVercelDeployment(project.deployment.deploymentId, token);
    }
    project.deployment = null;
    await project.save();
    return NextResponse.json({ deployment: null, expired: true });
  }

  return NextResponse.json({
    deployment: {
      url: project.deployment.url,
      expiresAt: project.deployment.expiresAt.toISOString(),
    },
  });
}

// DELETE /api/projects/[id]/deploy — manually tear down the current demo.
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
  }

  await dbConnect();

  const project = await Project.findOne({
    _id: id,
    owner: session.user.id,
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  if (project.deployment?.deploymentId && process.env.VERCEL_TOKEN) {
    await deleteVercelDeployment(
      project.deployment.deploymentId,
      process.env.VERCEL_TOKEN
    );
  }

  project.deployment = null;
  await project.save();

  return NextResponse.json({ ok: true });
}
