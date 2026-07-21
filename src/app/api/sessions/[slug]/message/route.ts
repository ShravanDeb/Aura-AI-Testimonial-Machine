import { NextResponse } from "next/server";
import { runInterviewRound, processAnswer, getSessionBySlug } from "@/lib/ai/pipeline";

// POST — Process a customer answer and get the next question
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { answer, selectedOptionId, action } = await request.json();

    // Get session by slug
    const session = await getSessionBySlug(slug);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.status !== "active") {
      return NextResponse.json(
        { error: "Session is no longer active" },
        { status: 400 }
      );
    }

    // Action: "start" — get the first question
    if (action === "start") {
      const result = await runInterviewRound(session.id);
      return NextResponse.json(result);
    }

    // Action: "answer" — process answer and get next question
    if (action === "answer") {
      if (!answer || typeof answer !== "string") {
        return NextResponse.json(
          { error: "answer is required" },
          { status: 400 }
        );
      }

      const result = await processAnswer(session.id, answer, selectedOptionId || null);
      return NextResponse.json(result);
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
