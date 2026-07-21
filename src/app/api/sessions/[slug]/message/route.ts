import { NextResponse } from "next/server";
import { runInterviewRound, processAnswer, getSessionById } from "@/lib/ai/pipeline";
import { runWritingPipeline } from "@/lib/ai/pipeline";
import { adminDb } from "@/lib/firebase-admin";

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
      const { getSessionBySlug } = await import("@/lib/ai/pipeline");
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

      const result = await runInterviewRound(session.id);
      // Run writing pipeline in background
      (async () => {
        try {
          const testimonialId = await runWritingPipeline(
            session.id,
            {
              id: session.companyId,
              name: session.company_name,
              description: session.company_description,
              targetAudience: session.company_target_audience,
              slug: session.company_slug,
              userId: "",
            },
            session.messages || [],
            session.context || {
              problem: null,
              impact: null,
              transformation: null,
              recommendation: null,
              detectedEmotion: "neutral",
              warmthLevel: 5,
              metrics: [],
              completeness: 0,
              readyForAgent3: true,
            },
          );
          await adminDb.collection("interview_sessions").doc(session.id).update({
            testimonialId,
            status: "completed",
          });
        } catch (err) {
          console.error("Background writing pipeline failed:", err);
          await adminDb.collection("interview_sessions").doc(session.id).update({
            status: "completed",
            testimonialId: null,
          });
        }
      })();
      return NextResponse.json(result);

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
