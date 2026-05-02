export interface AIModel {
  id: string;
  name: string;
  provider: "novita" | "openrouter" | "gemini" | "anthropic";
  modelId: string; // actual model ID sent to the API
  tier: "fast" | "standard" | "premium";
  description: string;
  contextWindow: number;
  inputPrice: string;  // per million tokens
  outputPrice: string; // per million tokens
}

// Models available for code generation, ordered by recommendation.
// The first entry is the default selection in the chat UI.
//
// Order policy:
//   1. Novita models (verified working with current account credit, fast streaming)
//   2. Gemini free-tier models (verified working, but rate-limited)
//   3. OpenRouter free model (verified working)
//   4. Anthropic premium (highest code quality; requires Anthropic credit)
//
// Stale entries removed:
//   - THUDM/glm-5 (404 model not found on Novita as of 2026-05)
//   - deepseek/deepseek-chat-v3-0324:free on OpenRouter (404 — model retired)
//   - gemini-2.0-flash (replaced by gemini-2.5-flash; older endpoint deprecated)
export const AVAILABLE_MODELS: AIModel[] = [
  // --- Novita (primary provider — verified working) ---
  {
    id: "novita-deepseek-v3",
    name: "DeepSeek V3",
    provider: "novita",
    modelId: "deepseek/deepseek-v3-0324",
    tier: "standard",
    description: "Recommended default. Fast streaming, strong code quality.",
    contextWindow: 163840,
    inputPrice: "$0.27",
    outputPrice: "$0.40",
  },
  {
    id: "novita-qwen3-coder",
    name: "Qwen3 Coder 480B",
    provider: "novita",
    modelId: "qwen/qwen3-coder-480b-a35b-instruct",
    tier: "premium",
    description: "Specialized code model. Best for complex multi-file projects.",
    contextWindow: 262144,
    inputPrice: "$0.30",
    outputPrice: "$2.40",
  },
  {
    id: "novita-deepseek-r1",
    name: "DeepSeek R1",
    provider: "novita",
    modelId: "deepseek/deepseek-r1-0528",
    tier: "premium",
    description: "Reasoning model. Best for complex architecture and logic.",
    contextWindow: 163840,
    inputPrice: "$0.55",
    outputPrice: "$2.19",
  },
  {
    id: "novita-qwen3-235b",
    name: "Qwen3 235B",
    provider: "novita",
    modelId: "qwen/qwen3-235b-a22b-instruct-2507",
    tier: "premium",
    description: "Large reasoning model. Detailed, production-ready output.",
    contextWindow: 262144,
    inputPrice: "$0.30",
    outputPrice: "$2.40",
  },
  {
    id: "novita-llama-70b",
    name: "Llama 3.3 70B",
    provider: "novita",
    modelId: "meta-llama/llama-3.3-70b-instruct",
    tier: "standard",
    description: "Strong general-purpose model. Good quality at moderate cost.",
    contextWindow: 131072,
    inputPrice: "$0.14",
    outputPrice: "$0.40",
  },
  {
    id: "novita-llama-8b",
    name: "Llama 3.1 8B",
    provider: "novita",
    modelId: "meta-llama/llama-3.1-8b-instruct",
    tier: "fast",
    description: "Fastest and cheapest. Good for quick iterations.",
    contextWindow: 16384,
    inputPrice: "$0.02",
    outputPrice: "$0.05",
  },

  // --- Gemini (free tier — works but per-model rate limits) ---
  {
    id: "gemini-2-5-flash",
    name: "Gemini 2.5 Flash",
    provider: "gemini",
    modelId: "gemini-2.5-flash",
    tier: "fast",
    description: "Google's fast model. Free tier; may rate-limit under load.",
    contextWindow: 1048576,
    inputPrice: "$0.10",
    outputPrice: "$0.40",
  },
  {
    id: "gemini-2-5-flash-lite",
    name: "Gemini 2.5 Flash Lite",
    provider: "gemini",
    modelId: "gemini-2.5-flash-lite",
    tier: "fast",
    description: "Fastest Gemini variant. Best for tiny prototypes.",
    contextWindow: 1048576,
    inputPrice: "$0.05",
    outputPrice: "$0.20",
  },

  // --- OpenRouter (free fallback — heavily rate-limited) ---
  {
    id: "openrouter-glm-air",
    name: "GLM 4.5 Air (Free)",
    provider: "openrouter",
    modelId: "z-ai/glm-4.5-air:free",
    tier: "fast",
    description: "Free via OpenRouter. May 429 under load.",
    contextWindow: 131072,
    inputPrice: "Free",
    outputPrice: "Free",
  },

  // --- Anthropic (highest quality — requires account credit) ---
  {
    id: "anthropic-sonnet",
    name: "Claude Sonnet 4",
    provider: "anthropic",
    modelId: "claude-sonnet-4-20250514",
    tier: "premium",
    description: "Best code quality. Requires Anthropic credit.",
    contextWindow: 200000,
    inputPrice: "$3.00",
    outputPrice: "$15.00",
  },
];

export function getModelById(id: string): AIModel | undefined {
  return AVAILABLE_MODELS.find((m) => m.id === id);
}

export function getModelsByTier(tier: AIModel["tier"]): AIModel[] {
  return AVAILABLE_MODELS.filter((m) => m.tier === tier);
}
