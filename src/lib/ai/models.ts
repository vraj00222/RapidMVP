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

// Models available for code generation, ordered by recommendation
export const AVAILABLE_MODELS: AIModel[] = [
  // --- Novita (priority provider) ---
  {
    id: "novita-deepseek-v3",
    name: "DeepSeek V3",
    provider: "novita",
    modelId: "deepseek/deepseek-v3-0324",
    tier: "standard",
    description: "Fast & capable code generation. Best balance of speed and quality.",
    contextWindow: 163840,
    inputPrice: "$0.27",
    outputPrice: "$0.40",
  },
  {
    id: "novita-deepseek-r1",
    name: "DeepSeek R1",
    provider: "novita",
    modelId: "deepseek/deepseek-r1-0528",
    tier: "premium",
    description: "Advanced reasoning model. Best for complex architecture and logic.",
    contextWindow: 163840,
    inputPrice: "$0.55",
    outputPrice: "$2.19",
  },
  {
    id: "novita-qwen3-coder",
    name: "Qwen3 Coder 480B",
    provider: "novita",
    modelId: "qwen/qwen3-coder-480b-a35b-instruct",
    tier: "premium",
    description: "Specialized code model. Excellent for complex multi-file projects.",
    contextWindow: 262144,
    inputPrice: "$0.30",
    outputPrice: "$2.40",
  },
  {
    id: "novita-qwen3-235b",
    name: "Qwen3 235B",
    provider: "novita",
    modelId: "qwen/qwen3-235b-a22b-instruct-2507",
    tier: "premium",
    description: "Large reasoning model. Great for detailed, production-ready code.",
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
    description: "Fastest and cheapest. Good for simple components and quick iterations.",
    contextWindow: 16384,
    inputPrice: "$0.02",
    outputPrice: "$0.05",
  },
  {
    id: "novita-glm5",
    name: "GLM-5",
    provider: "novita",
    modelId: "THUDM/glm-5",
    tier: "premium",
    description: "High-capability reasoning model from Zhipu AI.",
    contextWindow: 202800,
    inputPrice: "$1.00",
    outputPrice: "$3.20",
  },

  // --- Fallback providers ---
  {
    id: "openrouter-deepseek",
    name: "DeepSeek V3 (Free)",
    provider: "openrouter",
    modelId: "deepseek/deepseek-chat-v3-0324:free",
    tier: "fast",
    description: "Free tier via OpenRouter. May have rate limits.",
    contextWindow: 131072,
    inputPrice: "Free",
    outputPrice: "Free",
  },
  {
    id: "gemini-flash",
    name: "Gemini 2.0 Flash",
    provider: "gemini",
    modelId: "gemini-2.0-flash",
    tier: "fast",
    description: "Google's fast model. Good for quick prototypes.",
    contextWindow: 1048576,
    inputPrice: "$0.10",
    outputPrice: "$0.40",
  },
  {
    id: "anthropic-sonnet",
    name: "Claude Sonnet 4",
    provider: "anthropic",
    modelId: "claude-sonnet-4-20250514",
    tier: "premium",
    description: "Anthropic's balanced model. Excellent code quality.",
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
