const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// ── Groq models (ultra-fast ~100ms, paid but free tier generous) ────────────
const GROQ = {
  polish: "llama-3.3-70b-versatile",       // Best quality, fast
  instant: "llama-3.1-8b-instant",         // Cheapest, still good
  qwen: "qwen/qwen3.6-27b",              // Alternative
} as const;

// ── OpenRouter free models (specialized, slower) ─────────────────────────────
const OR = {
  safety: "nvidia/nemotron-3.5-content-safety:free",
  reasoning: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
  gemma: "google/gemma-4-31b-it:free",
  general: "openrouter/free",
} as const;

// ── Low-level callers ────────────────────────────────────────────────────────

async function callGroq(
  model: string,
  systemPrompt: string,
  userMessage: string,
  maxTokens = 300
): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      console.error(`Groq ${model} error:`, res.status);
      return null;
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (err) {
    console.error(`Groq ${model} failed:`, err);
    return null;
  }
}

async function callOpenRouter(
  model: string,
  systemPrompt: string,
  userMessage: string,
  maxTokens = 300
): Promise<string | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "Aura AI Testimonial Machine",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      console.error(`OpenRouter ${model} error:`, res.status);
      return null;
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (err) {
    console.error(`OpenRouter ${model} failed:`, err);
    return null;
  }
}

// ── Public API ───────────────────────────────────────────────────────────────

export async function polishTestimonial(rawText: string): Promise<string> {
  const systemPrompt = `You are a world-class copywriter who transforms raw customer feedback into polished, authentic testimonials.

Rules:
- Preserve the customer's original meaning and voice
- Elevate the language without making it sound artificial
- Keep it concise (1-3 sentences)
- Use strong, confident language
- Remove filler words and redundancy
- Ensure proper grammar and punctuation
- If the input is very short, expand it naturally without adding claims
- Never fabricate details not present in the original
- Return ONLY the polished testimonial text, nothing else`;

  const userMessage = `Transform this raw customer feedback into a polished testimonial:\n\n"${rawText}"`;

  // Try Groq first (fast), fall back to OpenRouter Gemma (free)
  const result = await callGroq(GROQ.polish, systemPrompt, userMessage, 200)
    || await callOpenRouter(OR.gemma, systemPrompt, userMessage, 200);

  return result || fallbackPolish(rawText);
}

export async function analyzeSentiment(text: string): Promise<{
  sentiment: "positive" | "neutral" | "negative";
  confidence: number;
  key_themes: string[];
}> {
  const systemPrompt = `You are a sentiment analyzer. Analyze the customer feedback and return a JSON object with:
- "sentiment": one of "positive", "neutral", "negative"
- "confidence": a number 0-1
- "key_themes": an array of 1-3 key themes mentioned
Return ONLY valid JSON, no other text.`;

  // Use OpenRouter reasoning model (free, specialized for analysis)
  const result = await callOpenRouter(OR.reasoning, systemPrompt, text, 150);

  if (result) {
    try {
      return JSON.parse(result);
    } catch {}
  }

  return { sentiment: "neutral", confidence: 0.5, key_themes: ["general feedback"] };
}

export async function checkContentSafety(text: string): Promise<boolean> {
  const systemPrompt = `You are a content safety classifier. Determine if the text is safe to use as a public testimonial.
Return ONLY "safe" or "unsafe" — nothing else.`;

  // Use OpenRouter content safety model (purpose-built for this)
  const result = await callOpenRouter(OR.safety, systemPrompt, text, 10);

  if (!result) return true;
  const lower = result.toLowerCase();
  return lower.includes("safe") && !lower.includes("unsafe");
}

export async function generateVariations(
  polishedText: string,
  count: number
): Promise<string[]> {
  const systemPrompt = `You are a copywriter. Generate ${count} variations of this testimonial for different contexts (website, social media, email).
Return each variation on a new line. No numbering or labels.`;

  // Use Groq for speed (variations are displayed immediately)
  const result = await callGroq(GROQ.polish, systemPrompt, polishedText, 400)
    || await callOpenRouter(OR.gemma, systemPrompt, polishedText, 400);

  if (!result) return [polishedText];
  return result.split("\n").filter((l) => l.trim());
}

// ── Fallback (no API needed) ─────────────────────────────────────────────────

function fallbackPolish(raw: string): string {
  let text = raw.trim();
  if (!text) return "";

  const replacements: [RegExp, string][] = [
    [/\bcool\b/gi, "remarkable"],
    [/\bnice\b/gi, "impressive"],
    [/\bbad\b/gi, "below expectations"],
    [/\bgood\b/gi, "excellent"],
    [/\bgreat\b/gi, "outstanding"],
    [/\bawesome\b/gi, "remarkable"],
    [/\bamazing\b/gi, "extraordinary"],
    [/\breally\b/gi, "genuinely"],
    [/\bvery\b/gi, "exceptionally"],
    [/\bso\b/gi, ""],
    [/\bjust\b/gi, ""],
    [/\bstuff\b/gi, ""],
    [/\bthing\b/gi, "solution"],
  ];

  replacements.forEach(([p, r]) => { text = text.replace(p, r); });
  text = text.replace(/\s+/g, " ").trim();
  text = text.replace(/^[a-z]/, (c) => c.toUpperCase());
  if (!/[.!?]$/.test(text)) text += ".";
  return text;
}
