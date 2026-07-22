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
  `You are a world-class testimonial writer. Given a customer's interview answers, write a short, authentic testimonial that sounds like a real person talking — not marketing copy.

COMPANY: ${company.name}
DESCRIPTION: ${company.description}

CUSTOMER ANSWERS:
${formatMessages(messages)}

EXTRACTED CONTEXT:
${JSON.stringify(context, null, 2)}

TESTIMONIAL RULES:
1. 1-2 sentences MAX. Short is better than long.
2. Write in FIRST PERSON as the customer
3. Sound CONVERSATIONAL — like someone telling a friend about the product
4. Pick ONE metric max, don't cram stats
5. Before/After structure: brief problem → what changed
6. NEVER use these words: game-changer, revolutionary, incredible, seamless, transformative, empowering, worth every minute, game-changing, cutting-edge
7. Never fabricate details not in their answers
8. Match their emotional tone (relieved, excited, frustrated, neutral)
9. No HTML tags — plain text only

EXAMPLES OF GREAT TESTIMONIALS:
- "I was drowning in spreadsheets. Now I spend 20 minutes a week on reporting instead of 10 hours."
- "We picked this over two competitors because onboarding took 2 hours, not 2 weeks."
- "My team actually asks to use it. That never happens with internal tools."
- "Saved us 5 hours a week on status updates alone."

RESPOND WITH VALID JSON:
{
  "testimonial": "1-2 sentence testimonial, plain text, conversational",
  "attribution": {
    "name": "Customer name (use 'A valued customer' if unknown)",
    "role": "Their role (use 'Customer' if unknown)",
    "company": "Their company (use '${company.name} user' if unknown)"
  },
  "starRating": 5,
  "formats": {
    "website": "1-2 sentence version for website",
    "linkedin": "Professional version for LinkedIn, 1 sentence",
    "social": "Punchy 1 sentence for social media",
    "caseStudy": "2-3 sentence case study snippet with the key metric"
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
