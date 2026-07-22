import { NextResponse, after } from "next/server";
import { runInterviewRound, processAnswer, getSessionById, getSessionBySlug, runWritingPipeline } from "@/lib/ai/pipeline";
import { adminDb } from "@/lib/firebase-admin";
import type { Company, Message, InterviewContext } from "@/lib/ai/types";

function scheduleWritingPipeline(sessionId: string, company: Company, messages: Message[], context: InterviewContext) {
  // Backup trigger: runs after response via after().
  // Idempotent — safe even if the client also calls /write.
  after(async () => {
    try {
      const testimonialId = await runWritingPipeline(sessionId, company, messages, context);
      await adminDb.collection("interview_sessions").doc(sessionId).update({
        testimonialId,
        status: "completed",
      });
    } catch (err) {
      console.error("after() writing pipeline backup failed:", err);
      // Don't overwrite status — the /write endpoint or recovery will handle it
    }
  });
}

// POST — Process a customer answer and get the next question
// Accepts either slug (via URL) or sessionId (via body) for session lookup
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { answer, selectedOptionId, action, sessionId: bodySessionId } = body;

    // Prefer sessionId from body (direct doc lookup), fall back to slug query
    let session;
    if (bodySessionId) {
      session = await getSessionById(bodySessionId);
    } else {
      session = await getSessionBySlug(slug);
    }

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.status !== "active") {
      return NextResponse.json(
        { error: "Session is no longer active" },
        { status: 400 }
      );
    }

    if (action === "start") {
      const result = await runInterviewRound(session.id);

      if (result.status === "interview_complete" && result.company && result.messages && result.context) {
        scheduleWritingPipeline(session.id, result.company, result.messages, result.context);
      }

      return NextResponse.json({
        status: result.status,
        completeness: result.completeness,
        ...(result.status === "question_ready"
          ? { question: result.question, options: result.options, detectedEmotion: result.detectedEmotion, round: result.round }
          : {}),
      });
    }

    if (action === "answer") {
      if (!answer) {
        return NextResponse.json({ error: "answer is required" }, { status: 400 });
      }
      const result = await processAnswer(session.id, answer, selectedOptionId || null);

      if (result.status === "interview_complete" && result.company && result.messages && result.context) {
        scheduleWritingPipeline(session.id, result.company, result.messages, result.context);
      }

      return NextResponse.json({
        status: result.status,
        completeness: result.completeness,
        ...(result.status === "question_ready"
          ? { question: result.question, options: result.options, detectedEmotion: result.detectedEmotion, round: result.round }
          : {}),
      });
    }

    return NextResponse.json(
      { error: "action must be 'start' or 'answer'" },
      { status: 400 }
    );
  } catch (err) {
    console.error("Message error:", err);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}
