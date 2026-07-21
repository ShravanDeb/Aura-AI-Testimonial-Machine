// ── Agent 2: Options Agent ────────────────────────────────────────────────────
// Model: Groq Qwen 3.6 27B — fast JSON output, 500+ TPS on Groq LPU
// Role: Generate 5 multiple-choice options for each question

import { OPENROUTER_URL, AGENT2_MODEL } from "./config";
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

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return fallbackAgent2(question, company);
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
  const q = question.toLowerCase();
  const name = company.name;

  // Vary options based on question content
  if (q.includes("challeng") || q.includes("problem") || q.includes("struggle") || q.includes("before")) {
    return {
      options: [
        { id: "a", text: `We were spending hours on manual work every week at ${name}` },
        { id: "b", text: `Our old process kept breaking down and causing delays` },
        { id: "c", text: `I was frustrated with how long everything took` },
        { id: "d", text: `We tried other solutions but nothing quite fit our needs` },
        { id: "e", text: "Write your own answer" },
      ],
    };
  }

  if (q.includes("impact") || q.includes("effect") || q.includes("consequence") || q.includes("cost")) {
    return {
      options: [
        { id: "a", text: `It was costing us about $2,000 a month in wasted time` },
        { id: "b", text: `Our team morale was dropping because of the repetitive work` },
        { id: "c", text: `We were falling behind competitors who had better tools` },
        { id: "d", text: `Customers started noticing the delays and some left` },
        { id: "e", text: "Write your own answer" },
      ],
    };
  }

  if (q.includes("different") || q.includes("change") || q.includes("now") || q.includes("after") || q.includes("improv")) {
    return {
      options: [
        { id: "a", text: `We cut our process time in half using ${name}` },
        { id: "b", text: `Our team can now focus on work that actually matters` },
        { id: "c", text: `Everything runs smoothly — I barely think about it anymore` },
        { id: "d", text: `The quality of our output improved dramatically` },
        { id: "e", text: "Write your own answer" },
      ],
    };
  }

  if (q.includes("recommend") || q.includes("tell") || q.includes("who")) {
    return {
      options: [
        { id: "a", text: `I'd tell any startup founder — just use ${name}` },
        { id: "b", text: `Anyone in our industry who handles similar workflows` },
        { id: "c", text: `My whole team already switched after seeing our results` },
        { id: "d", text: `I posted about it on LinkedIn because I was that impressed` },
        { id: "e", text: "Write your own answer" },
      ],
    };
  }

  // Generic varied fallback
  return {
    options: [
      { id: "a", text: `It transformed how our team operates at ${name}` },
      { id: "b", text: `The ROI was clear within the first month` },
      { id: "c", text: `Honestly, I wish I had found it sooner` },
      { id: "d", text: `Our clients noticed the improvement immediately` },
      { id: "e", text: "Write your own answer" },
    ],
  };
}
