import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import mongoose from "mongoose";
import { auth } from "@/lib/auth/auth";
import dbConnect from "@/lib/db/mongoose";
import Project from "@/models/Project";
import GenerationCache from "@/models/GenerationCache";
import { AVAILABLE_MODELS, getModelById, type AIModel } from "@/lib/ai/models";

// Tunable: how long a cache-hit replay should appear to take. Real generations
// run as fast as the LLM streams; cache replays are paced to match this so
// fresh and cached generations look identical to the user.
const CACHE_REPLAY_MS = 20_000;

function hashPrompt(userMessage: string, isIteration: boolean): string {
  // Cache key: trimmed user message + a flag for whether this is a fresh
  // generation or an iteration. Iteration prompts are only meaningful in the
  // context of a specific codebase, so we don't try to share their cache
  // across projects — the flag isolates them from fresh-generation hits.
  const normalized = userMessage.trim().toLowerCase().replace(/\s+/g, " ");
  return createHash("sha256")
    .update(`${isIteration ? "iter:" : "fresh:"}${normalized}`)
    .digest("hex")
    .slice(0, 32);
}

const BASE_SYSTEM_PROMPT = `You are RapidMVP, an expert full-stack developer. When the user describes what they want to build, generate clean, production-ready code.

IMPORTANT: Return your response in this exact format:

1. First, provide a brief explanation of what you built or changed (2-3 sentences max).

2. Then output each file using this exact format:

---FILE: path/to/file.tsx---
<file content here>
---END FILE---

Rules:
- Use React with JSX and Tailwind CSS
- Be concise — favor short, focused components over verbose ones. A typical landing page is 4–6 small components, NOT 12. Skip excessive boilerplate, long mocked data arrays, or repeated decorative sections.
- Use modern React patterns (hooks, functional components)
- Make the UI look polished and professional with Tailwind CSS
- Generate multiple files with proper separation of concerns (e.g. components/Header.tsx, components/PricingCard.tsx, pages/App.tsx)
- Use descriptive file paths like "components/ProductCard.tsx"
- The LAST file you output should be the main entry point (e.g. App.tsx or index.tsx) that composes all the other components

CRITICAL rules for browser preview compatibility:
- Do NOT use TypeScript syntax (no type annotations, no interfaces, no generics, no "as" casts, no enum). Write plain JavaScript/JSX.
- Do NOT use import/export statements. React, useState, useEffect, useRef, useCallback, useMemo, useReducer, createContext, useContext, and Fragment are available as globals.
- Since there are no imports, components from other files are available by their function name. Just define each component as a plain function (e.g. "function Header() { ... }") — no "export default", no "import".
- The main/entry file MUST have "export default function AppName()" — this is the ONLY export in the entire codebase.
- Tailwind CSS is loaded via CDN — use className with Tailwind utility classes freely.
- For icons, use inline SVGs or emoji instead of importing icon libraries (NO lucide-react, NO react-icons, NO heroicons).
- Do NOT use framer-motion, react-spring, GSAP, or any other animation library. Use CSS transitions and Tailwind's built-in animation utilities (animate-pulse, animate-bounce, transition-all, duration-*, hover:, group-hover:, etc.) for all motion.
- Do NOT use chart libraries (no recharts, chart.js, d3). If you need charts, draw them with plain SVG + divs.
- Do NOT use Next.js-specific features (no next/link, next/image, next/router, "use client", etc.)
- Do NOT configure Tailwind with a config object — it works out of the box via CDN.
- Stick to React + Tailwind only. Anything outside that list will fail to render.`;

const ITERATION_APPENDIX = `
ITERATION MODE — THE USER ALREADY HAS A PROJECT:
You are NOT building from scratch. The user's current codebase is provided below. Your job is to MODIFY it based on their new request.

CRITICAL iteration rules:
- You MUST return the COMPLETE updated project — every file the project needs to keep running, not just the ones you changed.
- Files you omit from your response will be DELETED. Always re-emit unchanged files too.
- Preserve as much of the existing structure, file paths, component names, and styling as possible. Change only what the user asked for.
- If the user asks for a new feature, ADD to the existing code. Do not regenerate unrelated components from scratch.
- If the user asks to "start over" or "build something completely different", you may discard the existing code.
- Keep the same main entry file name if possible (e.g. if it was App.jsx, keep it App.jsx).

CURRENT CODEBASE (this is the source of truth — more recent than any code shown in chat history):
{{CURRENT_FILES}}
`;

function buildSystemPrompt(existingFiles: { path: string; content: string }[]): string {
  if (existingFiles.length === 0) return BASE_SYSTEM_PROMPT;

  const filesBlock = existingFiles
    .map((f) => `---FILE: ${f.path}---\n${f.content}\n---END FILE---`)
    .join("\n\n");

  return BASE_SYSTEM_PROMPT + "\n\n" + ITERATION_APPENDIX.replace("{{CURRENT_FILES}}", filesBlock);
}

function stripFilesFromHistory(content: string): string {
  const idx = content.indexOf("---FILE:");
  return idx === -1 ? content : content.substring(0, idx).trim();
}

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

// --- Streaming provider functions ---
// Each returns a ReadableStream of text chunks

async function streamOpenAICompatible(
  url: string,
  apiKey: string,
  model: string,
  messages: ChatMessage[]
): Promise<ReadableStream<string>> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 5000,
      temperature: 0.7,
      stream: true,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `API error ${res.status}: ${err.error?.message || err.message || JSON.stringify(err)}`
    );
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();

  return new ReadableStream<string>({
    async pull(controller) {
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          return;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;
          const data = trimmed.slice(6);
          if (data === "[DONE]") {
            controller.close();
            return;
          }
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              controller.enqueue(content);
            }
          } catch {
            // skip malformed chunks
          }
        }
      }
    },
  });
}

async function streamGemini(
  apiKey: string,
  model: string,
  messages: ChatMessage[]
): Promise<ReadableStream<string>> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;

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

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();

  return new ReadableStream<string>({
    async pull(controller) {
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          return;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;
          try {
            const parsed = JSON.parse(trimmed.slice(6));
            const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              controller.enqueue(text);
            }
          } catch {
            // skip
          }
        }
      }
    },
  });
}

async function streamAnthropic(
  apiKey: string,
  model: string,
  messages: ChatMessage[]
): Promise<ReadableStream<string>> {
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
      max_tokens: 5000,
      stream: true,
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

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();

  return new ReadableStream<string>({
    async pull(controller) {
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          return;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;
          try {
            const parsed = JSON.parse(trimmed.slice(6));
            if (parsed.type === "content_block_delta") {
              const text = parsed.delta?.text;
              if (text) controller.enqueue(text);
            }
          } catch {
            // skip
          }
        }
      }
    },
  });
}

// --- Provider dispatching ---

function getApiKeyForProvider(provider: string): string | undefined {
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

async function streamModel(
  model: AIModel,
  messages: ChatMessage[]
): Promise<ReadableStream<string>> {
  const apiKey = getApiKeyForProvider(model.provider);
  if (!apiKey) {
    throw new Error(`No API key configured for ${model.provider}`);
  }

  switch (model.provider) {
    case "novita":
      return streamOpenAICompatible(
        "https://api.novita.ai/v3/openai/chat/completions",
        apiKey,
        model.modelId,
        messages
      );
    case "openrouter":
      return streamOpenAICompatible(
        "https://openrouter.ai/api/v1/chat/completions",
        apiKey,
        model.modelId,
        messages
      );
    case "gemini":
      return streamGemini(apiKey, model.modelId, messages);
    case "anthropic":
      return streamAnthropic(apiKey, model.modelId, messages);
    default:
      throw new Error(`Unknown provider: ${model.provider}`);
  }
}

function resolveModel(selectedModelId?: string): AIModel {
  if (selectedModelId) {
    const model = getModelById(selectedModelId);
    if (model) {
      const apiKey = getApiKeyForProvider(model.provider);
      if (apiKey) return model;
    }
  }

  for (const model of AVAILABLE_MODELS) {
    const apiKey = getApiKeyForProvider(model.provider);
    if (apiKey) return model;
  }

  throw new Error("No AI provider configured. Add NOVITA_API_KEY to .env.local");
}

// POST /api/projects/[id]/generate — stream AI generation via SSE
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

  const existingFiles = (project.files || []).map((f) => ({
    path: f.path,
    content: f.content,
  }));
  const isIteration = existingFiles.length > 0;

  const chatMessages: ChatMessage[] = [
    { role: "system", content: buildSystemPrompt(existingFiles) },
    ...project.chatHistory.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.role === "assistant" ? stripFilesFromHistory(msg.content) : msg.content,
    })),
    { role: "user" as const, content: message.trim() },
  ];

  let usedModel: AIModel;
  try {
    usedModel = resolveModel(modelId);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "No model available";
    return NextResponse.json({ error: msg }, { status: 503 });
  }

  // Cache lookup: same prompt → same output. Iteration prompts are cached
  // separately because they only make sense in context of an existing project.
  const promptHash = hashPrompt(message, isIteration);
  const cached = await GenerationCache.findOne({ promptHash }).lean();

  // Return SSE stream
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      };

      try {
        send("meta", {
          provider: cached ? cached.provider : usedModel.provider,
          model: cached ? cached.modelId : usedModel.id,
          modelName: cached ? cached.modelName : usedModel.name,
          mode: isIteration ? "iteration" : "initial",
          cached: !!cached,
        });

        let fullText = "";

        if (cached) {
          // --- Cache replay path: simulate streaming over CACHE_REPLAY_MS ---
          fullText = cached.fullText;
          // Split into ~80 chunks so the cursor moves visibly throughout the
          // replay. Pace evenly across the target duration.
          const total = fullText.length;
          const chunkCount = Math.min(80, Math.max(20, Math.ceil(total / 200)));
          const chunkSize = Math.ceil(total / chunkCount);
          const intervalMs = Math.max(50, Math.floor(CACHE_REPLAY_MS / chunkCount));
          for (let i = 0; i < total; i += chunkSize) {
            const chunk = fullText.slice(i, i + chunkSize);
            send("token", { token: chunk });
            await new Promise((r) => setTimeout(r, intervalMs));
          }
          // Bump hit count async; don't block the response
          GenerationCache.updateOne(
            { promptHash },
            { $inc: { hitCount: 1 } }
          ).exec().catch(() => {});
          console.log(`Cache hit: ${promptHash} (${total} chars)`);
        } else {
          // --- Fresh generation path ---
          const aiStream = await streamModel(usedModel, chatMessages);
          const reader = aiStream.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            fullText += value;
            send("token", { token: value });
          }
          console.log(`Generation streamed via ${usedModel.name} (${usedModel.provider})`);

          // Save to cache for next time. Only cache successful generations
          // that produced at least one file block.
          if (fullText.includes("---FILE:") && fullText.includes("---END FILE---")) {
            GenerationCache.create({
              promptHash,
              userMessage: message.trim().slice(0, 4000),
              modelId: usedModel.id,
              modelName: usedModel.name,
              provider: usedModel.provider,
              fullText,
            }).catch((err) => console.error("Cache write failed:", err.message));
          }
        }

        // Parse final result
        const files = parseFilesFromResponse(fullText);
        const explanation = extractExplanation(fullText);

        // Save to DB
        await Project.findByIdAndUpdate(id, {
          $push: {
            chatHistory: {
              $each: [
                { role: "user", content: message.trim(), timestamp: new Date() },
                { role: "assistant", content: fullText, timestamp: new Date() },
              ],
            },
          },
          $set: {
            files: files.length > 0 ? files : project.files,
            status: "ready",
          },
          $inc: { generationCount: 1 },
        });

        // Auto-name project
        if (project.name === "New Project" && chatMessages.length <= 3) {
          const shortName =
            message.trim().length > 50
              ? message.trim().substring(0, 47) + "..."
              : message.trim();
          await Project.findByIdAndUpdate(id, {
            $set: { name: shortName },
          });
        }

        send("done", { explanation, files, fullResponse: fullText, cached: !!cached });
      } catch (error) {
        console.error("AI generation error:", error);
        const errorMessage =
          error instanceof Error ? error.message : "AI generation failed";
        send("error", { error: errorMessage });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-store",
      Connection: "keep-alive",
    },
  });
}
