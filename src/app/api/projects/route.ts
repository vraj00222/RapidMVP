import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import dbConnect from "@/lib/db/mongoose";
import Project from "@/models/Project";

// GET /api/projects — list all projects for the authenticated user
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const projects = await Project.find({ owner: session.user.id })
    .sort({ updatedAt: -1 })
    .select("-chatHistory -files")
    .lean();

  return NextResponse.json({ projects });
}

// POST /api/projects — create a new project
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, description } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json(
      { error: "Project name is required" },
      { status: 400 }
    );
  }

  if (name.trim().length > 100) {
    return NextResponse.json(
      { error: "Project name cannot exceed 100 characters" },
      { status: 400 }
    );
  }

  await dbConnect();

  const project = await Project.create({
    name: name.trim(),
    description: description?.trim() || "",
    owner: session.user.id,
  });

  return NextResponse.json({ project }, { status: 201 });
}
