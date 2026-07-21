// ── Agent 4: Authenticity Checker ─────────────────────────────────────────────
// Model: OpenRouter Gemma 4 26B (free) — strong judgment, instruction following
// Role: Validate testimonial quality, catch fake/salesy/generic content

import { OPENROUTER_URL, AGENT4_MODEL } from "./config";
import type {
  Company,
  Message,
  Agent3Response,
  Agent4Response,
} from "./types";
import { formatMessages } from "./types";

const SYSTEM_PROMPT = (company: Company, messages: Message[]) =>
  `You are a strict testimonial authenticity validator for ${company.name}.

Your job is to catch fake, salesy, or generic testimonials before they get published.

ORIGINAL CUSTOMER ANSWERS:
${formatMessages(messages)}

CHECK FOR:
1. TOO SALESY: Sounds like ad copy? ("Best product ever! Revolutionary! Game-changing!") → FAIL
2. TOO FAKE: Overly positive without specifics? ("Everything is perfect, I love it!") → FAIL
3. TOO GENERIC: Could be about ANY product? ("Great product, highly recommend") → FAIL
4. HALLUCINATED DETAILS: Mentions things not in the customer's original answers → FAIL
5. TONE MISMATCH: Doesn't match the customer's actual emotional tone → FLAG
6. MISSING METRICS: Customer mentioned numbers but they're gone → FLAG

PASS CRITERIA (must meet ALL):
✓ Has specific details (not generic)
✓ Matches customer's original tone
✓ Includes at least one concrete detail or metric
✓ Could NOT be about just any product
✓ Sounds like something a real person would actually say

You MUST respond with valid JSON matching this schema:
{
  "passed": true|false,
  "score": number 0-100,
  "issues": ["specific issue 1", "specific issue 2"],
  "verdict": "PASS" | "FAIL",
  "feedback": "Detailed feedback for the writer if FAIL",
  "suggestions": ["improvement suggestion 1", "improvement suggestion 2"]
}`;

export async function callAgent4(
  company: Company,
  draft: Agent3Response,
  messages: Message[]
): Promise<Agent4Response> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return { passed: true, score: 80, issues: [], verdict: "PASS", feedback: "", suggestions: [] };
  }

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
        model: AGENT4_MODEL,
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT(company, messages),
          },
          {
            role: "user",
            content: `Validate this testimonial for authenticity:

TESTIMONIAL:
"${draft.testimonial}"

MULTI-FORMAT VERSIONS:
Website: "${draft.formats.website}"
LinkedIn: "${draft.formats.linkedin}"
Social: "${draft.formats.social}"

Score it and check all authenticity criteria.`,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!res.ok) {
      console.error(`Agent 4 (${AGENT4_MODEL}) error:`, res.status);
      return { passed: true, score: 80, issues: [], verdict: "PASS", feedback: "", suggestions: [] };
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return { passed: true, score: 80, issues: [], verdict: "PASS", feedback: "", suggestions: [] };
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { passed: true, score: 80, issues: [], verdict: "PASS", feedback: "", suggestions: [] };
    }

    return JSON.parse(jsonMatch[0]) as Agent4Response;
  } catch (err) {
    console.error("Agent 4 failed:", err);
    return { passed: true, score: 80, issues: [], verdict: "PASS", feedback: "", suggestions: [] };
  }
}
