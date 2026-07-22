import { NextResponse } from "next/server";
import { runInterviewRound, processAnswer, getSessionById, getSessionBySlug } from "@/lib/ai/pipeline";

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
