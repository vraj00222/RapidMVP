import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { AVAILABLE_MODELS } from "@/lib/ai/models";

// GET /api/models — list available AI models (only those with configured API keys)
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const configuredProviders = new Set<string>();
  if (process.env.NOVITA_API_KEY) configuredProviders.add("novita");
  if (process.env.OPENROUTER_API_KEY) configuredProviders.add("openrouter");
  if (process.env.GOOGLE_GEMINI_API_KEY) configuredProviders.add("gemini");
  if (process.env.ANTHROPIC_API_KEY) configuredProviders.add("anthropic");

  const models = AVAILABLE_MODELS.filter((m) =>
    configuredProviders.has(m.provider)
  ).map((m) => ({
    id: m.id,
    name: m.name,
    provider: m.provider,
    tier: m.tier,
    description: m.description,
    contextWindow: m.contextWindow,
    inputPrice: m.inputPrice,
    outputPrice: m.outputPrice,
  }));

  return NextResponse.json({ models });
}
