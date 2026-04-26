import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/lib/auth/auth";
import dbConnect from "@/lib/db/mongoose";
import Project from "@/models/Project";
import {
  buildPreviewHtml,
  parseFilesFromMessage,
  type PreviewFile,
} from "@/lib/preview/build-preview";

// GET /api/preview/[id] — serve preview HTML for a project (same-origin, no CORS issues)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("<html><body><p>Unauthorized</p></body></html>", {
      status: 401,
      headers: { "Content-Type": "text/html" },
    });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return new Response("<html><body><p>Invalid project ID</p></body></html>", {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  await dbConnect();

  const project = await Project.findOne({
    _id: id,
    owner: session.user.id,
  }).lean();

  if (!project) {
    return new Response("<html><body><p>Project not found</p></body></html>", {
      status: 404,
      headers: { "Content-Type": "text/html" },
    });
  }

  // Optional ?version=N — render files from the Nth (1-based) file-emitting
  // assistant message in chat history. Omit to render the latest project.files.
  const versionParam = req.nextUrl.searchParams.get("version");
  let files: PreviewFile[] = [];

  if (versionParam) {
    const target = parseInt(versionParam, 10);
    if (Number.isFinite(target) && target >= 1) {
      let seen = 0;
      for (const msg of project.chatHistory || []) {
        if (msg.role !== "assistant") continue;
        const parsed = parseFilesFromMessage(msg.content);
        if (parsed.length === 0) continue;
        seen += 1;
        if (seen === target) {
          files = parsed;
          break;
        }
      }
    }
  }

  if (files.length === 0) {
    files = (project.files || []).map((f: { path: string; content: string; language: string }) => ({
      path: f.path,
      content: f.content,
      language: f.language,
    }));
  }

  const html = buildPreviewHtml(files);

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
