// ── AI Provider Configuration ─────────────────────────────────────────────────
// All models are FREE tier — no credit card, no cost

export const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
export const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// Agent 1 — Interview Agent (Groq Llama 70B, best reasoning)
export const AGENT1_MODEL = "llama-3.3-70b-versatile";

// Agent 2 — Options Agent (Groq Qwen, fast JSON output)
export const AGENT2_MODEL = "qwen/qwen3.6-27b";

// Agent 3 — Testimonial Writer (OpenRouter Nemotron 120B free, creative writing)
export const AGENT3_MODEL = "nvidia/nemotron-3-super-120b-a12b:free";

// Agent 4 — Authenticity Checker (OpenRouter Gemma 4 26B free, judgment)
export const AGENT4_MODEL = "google/gemma-4-26b-a4b-it:free";

// Fallback models
export const FALLBACK_GROQ = "llama-3.1-8b-instant";
export const FALLBACK_OR = "google/gemma-4-31b-it:free";

export const MAX_INTERVIEW_ROUNDS = 8;
export const MAX_REWRITE_ATTEMPTS = 3;
