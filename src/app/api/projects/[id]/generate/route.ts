import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@/lib/auth/auth";
import dbConnect from "@/lib/db/mongoose";
import Project from "@/models/Project";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are RapidMVP, an expert full-stack developer. When the user describes what they want to build, generate clean, production-ready code.

IMPORTANT: Return your response in this exact format:

1. First, provide a brief explanation of what you built (2-3 sentences max).

2. Then output each file using this exact format:

---FILE: path/to/file.tsx---
<file content here>
---END FILE---

Rules:
- Use React with TypeScript and Tailwind CSS
- Create complete, working components
- Use modern React patterns (hooks, functional components)
- Include proper TypeScript types
- Make the UI look polished with Tailwind CSS
- Each file should be self-contained and importable
- Use descriptive file paths like "components/ProductCard.tsx"
- You can generate multiple files if the request is complex`;

interface ParsedFile {
  path: string;
  content: string;
  language: string;
}

function parseFilesFromResponse(response: string): ParsedFile[] {
  const files: ParsedFile[] = [];
  const fileRegex = /---FILE:\s*(.+?)---\n([\s\S]*?)---END FILE---/g;

  let match;
  while ((match = fileRegex.exec(response)) !== null) {
    const filePath = match[1].trim();
    const content = match[2].trim();
    const ext = filePath.split(".").pop()?.toLowerCase() || "";

    const langMap: Record<string, string> = {
      tsx: "typescript",
      ts: "typescript",
      jsx: "javascript",
      js: "javascript",
      css: "css",
      html: "html",
      json: "json",
    };

    files.push({
      path: filePath,
      content,
      language: langMap[ext] || "text",
    });
  }

  return files;
}

function extractExplanation(response: string): string {
  const firstFileIndex = response.indexOf("---FILE:");
  if (firstFileIndex === -1) return response.trim();
  return response.substring(0, firstFileIndex).trim();
}

// POST /api/projects/[id]/generate — generate code with AI
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
  const { message } = body;

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return NextResponse.json(
      { error: "Message is required" },
      { status: 400 }
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "AI service not configured. Set ANTHROPIC_API_KEY in .env.local" },
      { status: 503 }
    );
  }

  await dbConnect();

  // Get the project and its chat history for context
  const project = await Project.findOne({
    _id: id,
    owner: session.user.id,
  }).lean();

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Build messages array from chat history for context
  const chatMessages: { role: "user" | "assistant"; content: string }[] =
    project.chatHistory.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

  // Add the current user message
  chatMessages.push({ role: "user", content: message.trim() });

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: chatMessages,
    });

    const assistantText =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Parse files from the response
    const files = parseFilesFromResponse(assistantText);
    const explanation = extractExplanation(assistantText);

    // Save user message, assistant message, and files to DB
    await Project.findByIdAndUpdate(id, {
      $push: {
        chatHistory: {
          $each: [
            { role: "user", content: message.trim(), timestamp: new Date() },
            {
              role: "assistant",
              content: assistantText,
              timestamp: new Date(),
            },
          ],
        },
      },
      $set: {
        files: files.length > 0 ? files : project.files,
        status: "ready",
      },
      $inc: { generationCount: 1 },
    });

    // Auto-name the project from the first user message if it's still "New Project"
    if (project.name === "New Project" && chatMessages.length <= 2) {
      const shortName =
        message.trim().length > 50
          ? message.trim().substring(0, 47) + "..."
          : message.trim();
      await Project.findByIdAndUpdate(id, {
        $set: { name: shortName },
      });
    }

    return NextResponse.json({
      explanation,
      files,
      fullResponse: assistantText,
    });
  } catch (error) {
    console.error("AI generation error:", error);

    if (error instanceof Anthropic.APIError) {
      if (error.status === 401) {
        return NextResponse.json(
          { error: "Invalid API key. Check your ANTHROPIC_API_KEY." },
          { status: 503 }
        );
      }
      if (error.status === 429) {
        return NextResponse.json(
          { error: "Rate limited. Please wait a moment and try again." },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: "AI generation failed. Please try again." },
      { status: 500 }
    );
  }
}
