// ── Agent 2: Options Agent ────────────────────────────────────────────────────
// Model: Groq Qwen 3.6 27B — fast JSON output, 500+ TPS on Groq LPU
// Role: Generate 5 multiple-choice options for each question

import { GROQ_URL, AGENT2_MODEL } from "./config";
import type { Company, Message, Agent2Response } from "./types";

const SYSTEM_PROMPT = (company: Company, previousAnswers: string[]) =>
  `You generate multiple-choice answer options for testimonial collection questions about ${company.name}.

PRODUCT: ${company.description}
TARGET CUSTOMERS: ${company.targetAudience}

RULES:
- Generate exactly 5 options (A through E)
- Options A-D: Realistic answers a ${company.targetAudience} customer would give
- Option E: ALWAYS "Write your own answer"
- Options must be SPECIFIC to ${company.name}, not generic
- Each option should be 5-15 words max — concise and natural
- Include at least one option with a potential metric (time saved, money earned, percentage)
- Do NOT repeat previous answers the customer already gave
- Match the emotional tone of the question
- Never make options sound like marketing copy — they should sound like real customer words

PREVIOUS CUSTOMER ANSWERS (avoid repeating these):
${previousAnswers.length > 0 ? previousAnswers.join("\n") : "(none yet — first question)"}

You MUST respond with valid JSON matching this schema:
{
  "options": [
    { "id": "a", "text": "First option" },
    { "id": "b", "text": "Second option" },
    { "id": "c", "text": "Third option" },
    { "id": "d", "text": "Fourth option" },
    { "id": "e", "text": "Write your own answer" }
  ]
}`;

export async function callAgent2(
  question: string,
  company: Company,
  messages: Message[]
): Promise<Agent2Response> {
  const previousAnswers = messages
    .filter((m) => m.role === "user")
    .map((m) => m.answer);

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return fallbackAgent2(question, company);
  }

  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: AGENT2_MODEL,
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT(company, previousAnswers),
          },
          {
            role: "user",
            content: `Generate 5 options for this question:\n\n"${question}"`,
          },
        ],
        temperature: 0.8,
        max_tokens: 400,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      console.error(`Agent 2 (${AGENT2_MODEL}) error:`, res.status);
      return fallbackAgent2(question, company);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return fallbackAgent2(question, company);

    const parsed = JSON.parse(content) as Agent2Response;

    // Ensure option E always exists
    if (!parsed.options || parsed.options.length < 5) {
      return fallbackAgent2(question, company);
    }

    // Force option E to be "Write your own answer"
    parsed.options[4] = { id: "e", text: "Write your own answer" };
    return parsed;
  } catch (err) {
    console.error("Agent 2 failed:", err);
    return fallbackAgent2(question, company);
  }
}

function fallbackAgent2(
  question: string,
  company: Company
): Agent2Response {
  const name = company.name;
  return {
    options: [
      { id: "a", text: `It solved a major problem for our team at ${name}` },
      { id: "b", text: `We saw real results within the first few weeks` },
      { id: "c", text: `Our team's productivity improved significantly` },
      { id: "d", text: `I'd recommend it to anyone in our industry` },
      { id: "e", text: "Write your own answer" },
    ],
  };
}
