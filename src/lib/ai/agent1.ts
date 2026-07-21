// ── Agent 1: Interview Agent ──────────────────────────────────────────────────
// Model: Groq Llama 3.3 70B Versatile
// Role: Decide what to ask next, detect emotion, track completeness

import { GROQ_URL, AGENT1_MODEL, FALLBACK_GROQ } from "./config";
import type {
  Company,
  Message,
  InterviewContext,
  Agent1Response,
} from "./types";
import { formatMessages } from "./types";

const SYSTEM_PROMPT = (company: Company, context: InterviewContext, messages: Message[]) =>
  `You are an expert testimonial interviewer having a natural conversation with a customer of ${company.name}.

COMPANY: ${company.name}
DESCRIPTION: ${company.description}
TARGET AUDIENCE: ${company.targetAudience}

You are building a powerful testimonial. A great testimonial needs 4 pillars:
1. PROBLEM — What was the pain point before?
2. IMPACT — What was the consequence of that problem?
3. TRANSFORMATION — What changed after using the product?
4. RECOMMENDATION — Who would they tell about this?

TRACK what's been covered and what's missing.

RULES:
- Ask ONE question at a time — never multiple
- Be conversational, warm, and human — not robotic
- If they express frustration, acknowledge it empathetically before moving on
- If they mention numbers, note the metric in metricsFound
- Adapt your follow-up based on what they actually said
- When all 4 pillars are covered AND completeness > 85%, set ready: true
- Questions should feel like a curious friend, not a survey

EMOTION DETECTION:
- "I literally cried", "blown away", "amazing" → positive
- "nightmare", "losing sleep", "frustrated" → frustrated
- "saved us", "finally", "relief" → relieved
- "everyone loves it", "team is happier" → positive
- Numbers like "6 hours", "$10k", "3x" → note as metric

CURRENT CONTEXT:
${JSON.stringify(context, null, 2)}

CONVERSATION SO FAR:
${formatMessages(messages)}

You MUST respond with valid JSON matching this schema:
{
  "question": "Your next question as a string (null if ready)",
  "detectedEmotion": "positive" | "negative" | "neutral" | "frustrated" | "excited" | "relieved",
  "metricsFound": [{"raw": "...", "type": "time"|"money"|"percentage"|"count", "value": "...", "context": "..."}],
  "missingInfo": ["problem", "impact", "transformation", "recommendation"] (only list what's still missing),
  "completeness": number 0-100,
  "ready": boolean
}

When ready, also include "summary" with all 4 pillars filled in and "warmthLevel" (1-10).`;

export async function callAgent1(
  company: Company,
  messages: Message[],
  context: InterviewContext
): Promise<Agent1Response> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return fallbackAgent1(context, messages);
  }

  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: AGENT1_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT(company, context, messages) },
          { role: "user", content: "Generate the next interview question or signal ready." },
        ],
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      console.error(`Agent 1 (${AGENT1_MODEL}) error:`, res.status);
      return fallbackAgent1(context, messages);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return fallbackAgent1(context, messages);

    return JSON.parse(content) as Agent1Response;
  } catch (err) {
    console.error("Agent 1 failed:", err);
    return fallbackAgent1(context, messages);
  }
}

function fallbackAgent1(
  context: InterviewContext,
  messages: Message[]
): Agent1Response {
  const pillars = [
    { key: "problem", label: "problem" },
    { key: "impact", label: "impact" },
    { key: "transformation", label: "transformation" },
    { key: "recommendation", label: "recommendation" },
  ];

  const missing = pillars
    .filter((p) => !context[p.key as keyof InterviewContext])
    .map((p) => p.label);

  if (missing.length === 0) {
    return {
      question: null,
      detectedEmotion: context.detectedEmotion,
      metricsFound: [],
      missingInfo: [],
      completeness: 100,
      ready: true,
      summary: {
        problem: context.problem || "",
        impact: context.impact || "",
        transformation: context.transformation || "",
        recommendation: context.recommendation || "",
        emotion: context.detectedEmotion,
        warmthLevel: context.warmthLevel,
        metrics: context.metrics,
      },
    };
  }

  const fallbackQuestions: Record<string, string> = {
    problem: `What was the biggest challenge you faced before using ${messages.length > 0 ? "this solution" : "our product"}?`,
    impact: "How did that affect your work or business?",
    transformation: "What's different now compared to before?",
    recommendation: "Who would you recommend this to?",
  };

  return {
    question: fallbackQuestions[missing[0]] || "Tell me about your experience.",
    detectedEmotion: "neutral",
    metricsFound: [],
    missingInfo: missing,
    completeness: Math.round(((4 - missing.length) / 4) * 100),
    ready: false,
  };
}
