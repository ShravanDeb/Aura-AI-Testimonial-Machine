// ── Agent 3: Testimonial Writer ───────────────────────────────────────────────
// Model: OpenRouter Nemotron 3 Super 120B (free) — best creative writing at $0
// Role: Craft polished testimonial from interview data, generate multi-format output

import { GROQ_URL, AGENT3_MODEL, FALLBACK_GROQ } from "./config";
import type {
  Company,
  Message,
  InterviewContext,
  Agent3Response,
} from "./types";
import { formatMessages } from "./types";

const SYSTEM_PROMPT = (company: Company, context: InterviewContext, messages: Message[]) =>
  `You are a world-class testimonial writer. Given a customer's interview answers and company context, write a polished, authentic testimonial.

COMPANY: ${company.name}
DESCRIPTION: ${company.description}
TARGET AUDIENCE: ${company.targetAudience}

INTERVIEW DATA:
${formatMessages(messages)}

EXTRACTED CONTEXT:
${JSON.stringify(context, null, 2)}

RULES:
1. Write in FIRST PERSON as the customer
2. Preserve the customer's original voice and emotional tone
3. Be SPECIFIC — keep numbers, names, details they mentioned
4. BOLD specific metrics: wrap numbers in <strong> tags
   Example: "I saved <strong>6 hours every week</strong>"
5. Structure: Problem → Solution → Result → Recommendation
6. Length: 2-4 sentences for the main testimonial
7. Never fabricate details not in their answers
8. The tone should match their detected emotion:
   - Frustrated → emphasize the contrast/relief
   - Excited → match their energy
   - Neutral → professional but warm
9. Generate multi-format versions:

You MUST respond with valid JSON matching this schema:
{
  "testimonial": "Main 2-4 sentence testimonial with <strong>metrics</strong>",
  "attribution": {
    "name": "Customer name (use 'A valued customer' if unknown)",
    "role": "Their role (use 'Customer' if unknown)",
    "company": "Their company (use '${company.name} user' if unknown)"
  },
  "starRating": 5,
  "formats": {
    "website": "Full testimonial for website embed",
    "linkedin": "Shorter, professional version for LinkedIn",
    "social": "Punchy 1-2 sentence version for social media",
    "caseStudy": "2-3 sentence case study snippet with metrics"
  },
  "highlightedMetrics": [
    { "text": "specific metric text", "type": "time"|"money"|"percentage"|"count" }
  ]
}`;

export async function callAgent3(
  company: Company,
  messages: Message[],
  context: InterviewContext,
  customerName?: string,
  customerRole?: string,
  customerCompany?: string
): Promise<Agent3Response> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return fallbackAgent3(company, messages, context, customerName);
  }

  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: AGENT3_MODEL,
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT(company, context, messages),
          },
          {
            role: "user",
            content: `Write a polished testimonial from this interview. Customer name: ${customerName || "A valued customer"}, Role: ${customerRole || "Customer"}, Company: ${customerCompany || "N/A"}.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!res.ok) {
      console.error(`Agent 3 (${AGENT3_MODEL}) error:`, res.status);
      return fallbackAgent3(company, messages, context, customerName);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return fallbackAgent3(company, messages, context, customerName);

    // Extract JSON from response (may be wrapped in markdown code block)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return fallbackAgent3(company, messages, context, customerName);

    return JSON.parse(jsonMatch[0]) as Agent3Response;
  } catch (err) {
    console.error("Agent 3 failed:", err);
    return fallbackAgent3(company, messages, context, customerName);
  }
}

function fallbackAgent3(
  company: Company,
  messages: Message[],
  context: InterviewContext,
  customerName?: string
): Agent3Response {
  const answers = messages.filter((m) => m.role === "user").map((m) => m.answer);
  const name = customerName || "A valued customer";

  let testimonial = "";
  if (answers.length >= 3) {
    testimonial = `Before ${company.name}, ${answers[0][0].toLowerCase() + answers[0].slice(1)} ${answers[1][0].toLowerCase() + answers[1].slice(1)} Now, ${answers[2][0].toLowerCase() + answers[2].slice(1)}`;
  } else if (answers.length >= 1) {
    testimonial = answers.join(" ");
  } else {
    testimonial = `I love using ${company.name}.`;
  }

  const sentences = testimonial.split(/(?<=[.!?])\s+/);
  if (sentences.length > 4) {
    testimonial = sentences.slice(0, 4).join(" ");
  }
  if (!testimonial.endsWith(".") && !testimonial.endsWith("!") && !testimonial.endsWith("?")) {
    testimonial += ".";
  }

  return {
    testimonial,
    attribution: {
      name,
      role: "Customer",
      company: company.name + " user",
    },
    starRating: 5,
    formats: {
      website: testimonial,
      linkedin: testimonial,
      social: testimonial,
      caseStudy: testimonial,
    },
    highlightedMetrics: context.metrics.map((m) => ({
      text: m.value,
      type: m.type,
    })),
  };
}
