import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/lib/auth/auth";
import dbConnect from "@/lib/db/mongoose";
import Project from "@/models/Project";

// GET /api/projects/[id]/messages — get chat history for a project
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

  const project = await Project.findOne(
    { _id: id, owner: session.user.id },
    { chatHistory: 1, name: 1 }
  ).lean();

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json({
    projectName: project.name,
    messages: project.chatHistory,
  });
}

// POST /api/projects/[id]/messages — add a message to chat history
export async function POST(
  req: NextRequest,
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

  const body = await req.json();
  const { role, content } = body;

  if (!role || !content) {
    return NextResponse.json(
      { error: "Role and content are required" },
      { status: 400 }
    );
  }

  if (!["user", "assistant"].includes(role)) {
    return NextResponse.json(
      { error: "Role must be 'user' or 'assistant'" },
      { status: 400 }
    );
  }

  await dbConnect();

  const project = await Project.findOneAndUpdate(
    { _id: id, owner: session.user.id },
    {
      $push: {
        chatHistory: { role, content, timestamp: new Date() },
      },
    },
    { new: true, projection: { chatHistory: { $slice: -1 }, name: 1 } }
  ).lean();

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const addedMessage = project.chatHistory[project.chatHistory.length - 1];

  return NextResponse.json({ message: addedMessage }, { status: 201 });
}
