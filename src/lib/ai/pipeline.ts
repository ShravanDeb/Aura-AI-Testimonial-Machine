// ── Interview Pipeline Orchestrator ───────────────────────────────────────────
// Runs Agent 1+2 in rounds until interview is complete, then Agent 3+4

import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { callAgent1 } from "./agent1";
import { callAgent2 } from "./agent2";
import { callAgent3 } from "./agent3";
import { callAgent4 } from "./agent4";
import { MAX_INTERVIEW_ROUNDS, MAX_REWRITE_ATTEMPTS } from "./config";
import type {
  Company,
  Message,
  InterviewContext,
  Agent1Response,
  Agent3Response,
} from "./types";
import { createEmptyContext } from "./types";

// ── Session document type (matches Firestore structure) ──────────────────────

interface SessionDoc {
  id: string;
  slug: string;
  companyId: string;
  company_name: string;
  company_description: string;
  company_target_audience: string;
  company_slug: string;
  company_user_id: string;
  customerName: string;
  customerEmail: string;
  customerRole?: string;
  customerCompany?: string;
  messages: Message[];
  context: InterviewContext;
  status: string;
  testimonialId: string | null;
  created_at: unknown;
  completed_at: unknown;
}

// ── Create a new interview session ──────────────────────────────────────────

export async function createSession(
  companyId: string,
  company: Company,
  customerName: string,
  customerEmail: string
): Promise<{ sessionId: string; slug: string }> {
  const slug = generateSlug();

  const sessionData = {
    slug,
    companyId,
    company_name: company.name,
    company_description: company.description,
    company_target_audience: company.targetAudience,
    company_slug: company.slug,
    company_user_id: company.userId || "",
    customerName,
    customerEmail,
    messages: [],
    context: createEmptyContext(),
    status: "active",
    testimonialId: null,
    created_at: FieldValue.serverTimestamp(),
    completed_at: null,
  };

  const docRef = await adminDb.collection("interview_sessions").add(sessionData);

  return { sessionId: docRef.id, slug };
}

// ── Get session by slug ─────────────────────────────────────────────────────

export async function getSessionBySlug(slug: string) {
  const snap = await adminDb
    .collection("interview_sessions")
    .where("slug", "==", slug)
    .limit(1)
    .get();

  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as SessionDoc;
}

// ── Get session by ID ─────────────────────────────────────────────────────

export async function getSessionById(sessionId: string): Promise<SessionDoc | null> {
  try {
    const snap = await adminDb.collection("interview_sessions").doc(sessionId).get();
    if (!snap.exists) return null;
    return { id: snap.id, ...snap.data()! } as SessionDoc;
  } catch {
    return null;
  }
}

// ── Run one interview round (Agent 1 → Agent 2) ─────────────────────────────

export async function runInterviewRound(sessionId: string) {
  // 1. Load session from DB
  const sessionDoc = await getSessionById(sessionId);
  if (!sessionDoc) throw new Error("Session not found");
  if (sessionDoc.status !== "active") throw new Error("Session not active");

  const messages: Message[] = sessionDoc.messages || [];
  const context: InterviewContext = sessionDoc.context || createEmptyContext();

  const company: Company = {
    id: sessionDoc.companyId,
    name: sessionDoc.company_name,
    description: sessionDoc.company_description,
    targetAudience: sessionDoc.company_target_audience,
    slug: sessionDoc.company_slug,
    userId: sessionDoc.company_user_id || "",
  };

  // Safety: prevent infinite loops
  const roundCount = messages.filter((m) => m.role === "assistant").length;
  if (roundCount >= MAX_INTERVIEW_ROUNDS) {
    return forceComplete(sessionDoc, company, messages, context);
  }

  // 2. AGENT 1 — Decide the next question
  const agent1: Agent1Response = await callAgent1(company, messages, context);

  // 3. Check if Agent 1 says we have enough info
  if (agent1.ready && agent1.summary) {
    const updatedContext = { ...context, ...agent1.summary, readyForAgent3: true, completeness: 100 };

    await adminDb.collection("interview_sessions").doc(sessionId).update({
      context: updatedContext,
      status: "writing",
      completed_at: FieldValue.serverTimestamp(),
    });

    return {
      status: "interview_complete" as const,
      completeness: 100,
      testimonialId: null,
      company,
      messages,
      context: updatedContext,
    };
  }

  // 4. AGENT 2 — Generate answer options
  const agent2 = await callAgent2(agent1.question!, company, messages);

  // 5. Save the assistant message to conversation history
  const assistantMsg: Message = {
    role: "assistant",
    question: agent1.question!,
    options: agent2.options,
    detectedEmotion: agent1.detectedEmotion,
    metricsFound: agent1.metricsFound,
    completeness: agent1.completeness,
  };

  const updatedMessages = [...messages, assistantMsg];

  // 6. Update context and messages in DB
  await adminDb.collection("interview_sessions").doc(sessionId).update({
    messages: updatedMessages,
    context: {
      ...context,
      detectedEmotion: agent1.detectedEmotion,
      metrics: [...(context.metrics || []), ...agent1.metricsFound],
      completeness: agent1.completeness,
    },
  });

  // 7. Return question + options to frontend
  return {
    status: "question_ready" as const,
    question: agent1.question,
    options: agent2.options,
    completeness: agent1.completeness,
    detectedEmotion: agent1.detectedEmotion,
    round: roundCount + 1,
  };
}

// ── Process a customer answer (save + trigger next round) ────────────────────

export async function processAnswer(
  sessionId: string,
  answer: string,
  selectedOptionId: string | null
) {
  const sessionDoc = await getSessionById(sessionId);
  if (!sessionDoc) throw new Error("Session not found");

  const messages: Message[] = sessionDoc.messages || [];
  const context: InterviewContext = sessionDoc.context || createEmptyContext();

  const userMsg: Message = {
    role: "user",
    answer,
    selectedOptionId,
  };

  const updatedContext = inferContextFromAnswer(context, answer);

  await adminDb.collection("interview_sessions").doc(sessionId).update({
    messages: [...messages, userMsg],
    context: updatedContext,
  });

  return runInterviewRound(sessionId);
}

// ── Agent 3+4 Writing Pipeline ───────────────────────────────────────────────

export async function runWritingPipeline(
  sessionId: string,
  company: Company,
  messages: Message[],
  context: InterviewContext
): Promise<string> {
  try {
    const sessionDoc = await getSessionById(sessionId);
    const customerName = sessionDoc?.customerName || "";
    const customerRole = sessionDoc?.customerRole || "";
    const customerCompany = sessionDoc?.customerCompany || "";

    let draft: Agent3Response = await callAgent3(
      company,
      messages,
      context,
      customerName,
      customerRole,
      customerCompany
    );

    let rewriteCount = 0;
    let check = await callAgent4(company, draft, messages);

    while (!check.passed && rewriteCount < MAX_REWRITE_ATTEMPTS) {
      rewriteCount++;
      draft = await callAgent3WithFeedback(
        company,
        messages,
        context,
        check.feedback,
        check.suggestions,
        customerName,
        customerRole,
        customerCompany
      );
      check = await callAgent4(company, draft, messages);
    }

    const testimonialData = {
      sessionId,
      companyId: company.id,
      company_name: company.name,
      generatedText: draft.testimonial,
      generatedFormats: draft.formats,
      starRating: draft.starRating,
      attribution: draft.attribution,
      highlightedMetrics: draft.highlightedMetrics,
      authenticityScore: check.score,
      authenticityIssues: check.issues,
      rewriteCount,
      status: check.passed ? "approved" : "pending",
      user_id: company.userId,
      raw_answers: messages.filter((m) => m.role === "user").map((m) => m.answer),
      context_snapshot: context,
      created_at: FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb.collection("testimonials").add(testimonialData);

    await adminDb.collection("interview_sessions").doc(sessionId).update({
      testimonialId: docRef.id,
    });

    return docRef.id;
  } catch (err) {
    console.error("Writing pipeline failed:", err);
    // Don't propagate the error - we've already updated the session status
    throw new Error("Writing pipeline failed silently");
  }
}

// ── Agent 3 with Agent 4 feedback ───────────────────────────────────────────

async function callAgent3WithFeedback(
  company: Company,
  messages: Message[],
  context: InterviewContext,
  feedback: string,
  suggestions: string[],
  customerName?: string,
  customerRole?: string,
  customerCompany?: string
): Promise<Agent3Response> {
  const { OPENROUTER_URL, AGENT3_MODEL } = await import("./config");
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return callAgent3(company, messages, context, customerName, customerRole, customerCompany);

  const { formatMessages } = await import("./types");

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
        model: AGENT3_MODEL,
        messages: [
          {
            role: "system",
            content: `You are a world-class testimonial writer. Rewrite this testimonial based on feedback.

COMPANY: ${company.name}
DESCRIPTION: ${company.description}

ORIGINAL ANSWERS:
${formatMessages(messages)}

EXTRACTED CONTEXT:
${JSON.stringify(context, null, 2)}

PREVIOUS FEEDBACK FROM AUTHENTICITY CHECKER:
${feedback}

IMPROVEMENT SUGGESTIONS:
${suggestions.join("\n")}

RULES:
1. Fix ALL issues mentioned in the feedback
2. Follow ALL suggestions
3. Keep the customer's voice and tone
4. Bold metrics with <strong> tags
5. Preserve all specific details from the original answers
6. Never fabricate new details

Respond with valid JSON matching the Agent 3 schema.`,
          },
          {
            role: "user",
            content: `Rewrite the testimonial fixing the issues above. Customer: ${customerName || "A valued customer"}.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 800,
        reasoning: { effort: "none" },
      }),
    });

    if (!res.ok) return callAgent3(company, messages, context, customerName, customerRole, customerCompany);

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return callAgent3(company, messages, context, customerName, customerRole, customerCompany);

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return callAgent3(company, messages, context, customerName, customerRole, customerCompany);

    return JSON.parse(jsonMatch[0]) as Agent3Response;
  } catch {
    return callAgent3(company, messages, context, customerName, customerRole, customerCompany);
  }
}

// ── Force complete when max rounds reached ───────────────────────────────────

async function forceComplete(
  sessionDoc: SessionDoc,
  company: Company,
  messages: Message[],
  context: InterviewContext
) {
  const updatedContext = { ...context, completeness: 100, readyForAgent3: true };

  await adminDb.collection("interview_sessions").doc(sessionDoc.id).update({
    context: updatedContext,
    status: "writing",
    completed_at: FieldValue.serverTimestamp(),
  });

  return {
    status: "interview_complete" as const,
    completeness: 100,
    testimonialId: null,
    company,
    messages,
    context: updatedContext,
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function generateSlug(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let slug = "";
  for (let i = 0; i < 8; i++) {
    slug += chars[Math.floor(Math.random() * chars.length)];
  }
  return slug;
}

function inferContextFromAnswer(
  context: InterviewContext,
  answer: string
): InterviewContext {
  const lower = answer.toLowerCase();
  const updated = { ...context };

  if (
    !updated.problem &&
    (lower.includes("before") ||
      lower.includes("used to") ||
      lower.includes("was") ||
      lower.includes("had") ||
      lower.includes("struggle") ||
      lower.includes("challenge") ||
      lower.includes("problem") ||
      lower.includes("difficult"))
  ) {
    updated.problem = answer;
  } else if (
    !updated.impact &&
    (lower.includes("so") ||
      lower.includes("because") ||
      lower.includes("lost") ||
      lower.includes("wasted") ||
      lower.includes("missed") ||
      lower.includes("cost"))
  ) {
    updated.impact = answer;
  } else if (
    !updated.transformation &&
    (lower.includes("now") ||
      lower.includes("after") ||
      lower.includes("changed") ||
      lower.includes("better") ||
      lower.includes("saved") ||
      lower.includes("improved"))
  ) {
    updated.transformation = answer;
  } else if (
    !updated.recommendation &&
    (lower.includes("tell") ||
      lower.includes("recommend") ||
      lower.includes("friend") ||
      lower.includes("anyone") ||
      lower.includes("who"))
  ) {
    updated.recommendation = answer;
  }

  const metricPatterns = [
    { regex: /(\d+)\s*hours?/i, type: "time" as const },
    { regex: /(\d+)\s*minutes?/i, type: "time" as const },
    { regex: /\$[\d,]+/i, type: "money" as const },
    { regex: /(\d+)%/i, type: "percentage" as const },
    { regex: /(\d+)\s*x/i, type: "count" as const },
  ];

  for (const { regex, type } of metricPatterns) {
    const match = answer.match(regex);
    if (match) {
      const existing = updated.metrics.find((m) => m.raw === answer);
      if (!existing) {
        updated.metrics.push({
          raw: answer,
          type,
          value: match[0],
          context: answer,
        });
      }
    }
  }

  const pillars = [updated.problem, updated.impact, updated.transformation, updated.recommendation];
  const filled = pillars.filter(Boolean).length;
  updated.completeness = Math.round((filled / 4) * 100);

  return updated;
}
