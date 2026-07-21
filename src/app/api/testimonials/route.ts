import { NextResponse } from "next/server";
import { polishTestimonial, analyzeSentiment, checkContentSafety } from "@/lib/openrouter";

// Testimonials are stored via client-side Firestore
// This API handles AI processing (polish + sentiment + safety)

export async function POST(request: Request) {
  try {
    const { text, campaign_id, customer_name, customer_email } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const [polished, sentiment, isSafe] = await Promise.all([
      polishTestimonial(text),
      analyzeSentiment(text),
      checkContentSafety(text),
    ]);

    return NextResponse.json({
      polished,
      sentiment,
      is_safe: isSafe,
      warning: !isSafe ? "Content flagged as potentially unsafe" : undefined,
    });
  } catch {
    return NextResponse.json({ error: "Failed to process testimonial" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    info: "Testimonials are fetched via client-side Firestore. This endpoint processes AI analysis."
  });
}
