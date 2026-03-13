import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/lib/auth/auth";
import dbConnect from "@/lib/db/mongoose";
import Project from "@/models/Project";
import { AVAILABLE_MODELS, getModelById, type AIModel } from "@/lib/ai/models";

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

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

// --- Provider call functions ---

async function callOpenAICompatible(
  url: string,
  apiKey: string,
  model: string,
  messages: ChatMessage[]
): Promise<string> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 4096,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `API error ${res.status}: ${err.error?.message || err.message || JSON.stringify(err)}`
    );
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

async function callGemini(
  apiKey: string,
  model: string,
  messages: ChatMessage[]
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const contents = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  const systemInstruction = messages.find((m) => m.role === "system");

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      ...(systemInstruction && {
        systemInstruction: { parts: [{ text: systemInstruction.content }] },
      }),
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `Gemini error ${res.status}: ${err.error?.message || JSON.stringify(err)}`
    );
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function callAnthropic(
  apiKey: string,
  model: string,
  messages: ChatMessage[]
): Promise<string> {
  const systemMsg = messages.find((m) => m.role === "system");
  const chatMsgs = messages.filter((m) => m.role !== "system");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system: systemMsg?.content || "",
      messages: chatMsgs.map((m) => ({ role: m.role, content: m.content })),
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `Anthropic error ${res.status}: ${err.error?.message || JSON.stringify(err)}`
    );
  }

  const data = await res.json();
  return data.content?.[0]?.text || "";
}

// --- Generate with selected model or fallback ---

async function callModel(
  model: AIModel,
  messages: ChatMessage[]
): Promise<string> {
  const apiKey = getApiKeyForProvider(model.provider);
  if (!apiKey) {
    throw new Error(`No API key configured for ${model.provider}`);
  }

  switch (model.provider) {
    case "novita":
      return callOpenAICompatible(
        "https://api.novita.ai/v3/openai/chat/completions",
        apiKey,
        model.modelId,
        messages
      );
    case "openrouter":
      return callOpenAICompatible(
        "https://openrouter.ai/api/v1/chat/completions",
        apiKey,
        model.modelId,
        messages
      );
    case "gemini":
      return callGemini(apiKey, model.modelId, messages);
    case "anthropic":
      return callAnthropic(apiKey, model.modelId, messages);
    default:
      throw new Error(`Unknown provider: ${model.provider}`);
  }
}

function getApiKeyForProvider(
  provider: string
): string | undefined {
  switch (provider) {
    case "novita":
      return process.env.NOVITA_API_KEY;
    case "openrouter":
      return process.env.OPENROUTER_API_KEY;
    case "gemini":
      return process.env.GOOGLE_GEMINI_API_KEY;
    case "anthropic":
      return process.env.ANTHROPIC_API_KEY;
    default:
      return undefined;
  }
}

async function generateWithModel(
  messages: ChatMessage[],
  selectedModelId?: string
): Promise<{ text: string; model: AIModel }> {
  // If user selected a specific model, try it first
  if (selectedModelId) {
    const model = getModelById(selectedModelId);
    if (model) {
      const apiKey = getApiKeyForProvider(model.provider);
      if (apiKey) {
        const text = await callModel(model, messages);
        if (text) return { text, model };
        throw new Error(`${model.name}: empty response`);
      }
    }
  }

  // Fallback: try all available models in order
  const errors: string[] = [];
  for (const model of AVAILABLE_MODELS) {
    const apiKey = getApiKeyForProvider(model.provider);
    if (!apiKey) continue;

    try {
      const text = await callModel(model, messages);
      if (text) return { text, model };
      errors.push(`${model.name}: empty response`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`Model ${model.name} failed:`, msg);
      errors.push(`${model.name}: ${msg}`);
    }
  }

  throw new Error(
    errors.length > 0
      ? `All AI models failed:\n${errors.join("\n")}`
      : "No AI provider configured. Add NOVITA_API_KEY to .env.local"
  );
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
  const { message, modelId } = body;

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return NextResponse.json(
      { error: "Message is required" },
      { status: 400 }
    );
  }

  // Check at least one provider is configured
  const hasProvider = AVAILABLE_MODELS.some(
    (m) => !!getApiKeyForProvider(m.provider)
  );
  if (!hasProvider) {
    return NextResponse.json(
      { error: "No AI provider configured. Add NOVITA_API_KEY to .env.local" },
      { status: 503 }
    );
  }

  await dbConnect();

  const project = await Project.findOne({
    _id: id,
    owner: session.user.id,
  }).lean();

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const chatMessages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...project.chatHistory.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })),
    { role: "user" as const, content: message.trim() },
  ];

  try {
    const { text: assistantText, model: usedModel } = await generateWithModel(
      chatMessages,
      modelId
    );

    console.log(`Generation succeeded via ${usedModel.name} (${usedModel.provider})`);

    const files = parseFilesFromResponse(assistantText);
    const explanation = extractExplanation(assistantText);

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

    // Auto-name the project from the first user message
    if (project.name === "New Project" && chatMessages.length <= 3) {
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
      provider: usedModel.provider,
      model: usedModel.id,
      modelName: usedModel.name,
    });
  } catch (error) {
    console.error("AI generation error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "AI generation failed";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
