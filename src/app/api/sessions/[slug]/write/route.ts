import { NextResponse } from "next/server";
import { runWritingPipeline, getSessionById, getSessionBySlug } from "@/lib/ai/pipeline";
import { adminDb } from "@/lib/firebase-admin";

// POST — Trigger the writing pipeline for a session
// Called by the client after interview_complete, with its own timeout budget
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json().catch(() => ({}));
    const { sessionId: bodySessionId } = body;

    let session;
    if (bodySessionId) {
      session = await getSessionById(bodySessionId);
    } else {
      session = await getSessionBySlug(slug);
    }

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.testimonialId) {
      return NextResponse.json({ testimonialId: session.testimonialId, status: "already_completed" });
    }

    if (session.status !== "writing") {
      return NextResponse.json({ error: "Session is not in writing state" }, { status: 400 });
    }

    // Look up company userId from campaigns if not in session
    const companyDoc = await adminDb.collection("campaigns").doc(session.companyId).get();
    const companyData = companyDoc.data();

    const company = {
      id: session.companyId,
      name: session.company_name,
      description: session.company_description,
      targetAudience: session.company_target_audience,
      slug: session.company_slug,
      userId: companyData?.user_id || session.company_user_id || "",
    };

    const testimonialId = await runWritingPipeline(
      session.id,
      company,
      session.messages || [],
      session.context || {
        problem: null,
        impact: null,
        transformation: null,
        recommendation: null,
        detectedEmotion: "neutral",
        warmthLevel: 5,
        metrics: [],
        completeness: 100,
        readyForAgent3: true,
      }
    );

    await adminDb.collection("interview_sessions").doc(session.id).update({
      testimonialId,
      status: "completed",
    });

    return NextResponse.json({ testimonialId, status: "completed" });
  } catch (err) {
    console.error("Write pipeline error:", err);
    return NextResponse.json(
      { error: "Failed to generate testimonial" },
      { status: 500 }
    );
  }
}
