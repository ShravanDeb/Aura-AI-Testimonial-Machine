// ── AI Provider Configuration ─────────────────────────────────────────────────

export const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
export const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// Agent 1 — Interview Agent (Groq Llama 70B, best reasoning)
export const AGENT1_MODEL = "llama-3.3-70b-versatile";

// Agent 2 — Options Agent (OpenRouter Nemotron, creative option generation)
export const AGENT2_MODEL = "nvidia/nemotron-3-super-120b-a12b:free";

// Agent 3 — Testimonial Writer (Groq Llama 70B — fast, fits Hobby 10s limit)
export const AGENT3_MODEL = "llama-3.3-70b-versatile";

// Agent 4 — Authenticity Checker (Groq Llama 70B — fast, fits Hobby 10s limit)
export const AGENT4_MODEL = "llama-3.3-70b-versatile";

// Fallback models
export const FALLBACK_GROQ = "llama-3.1-8b-instant";
export const FALLBACK_OR = "google/gemma-4-31b-it:free";

export const MAX_INTERVIEW_ROUNDS = 5;
export const MAX_REWRITE_ATTEMPTS = 3;
