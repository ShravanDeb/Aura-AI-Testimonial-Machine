import { NextResponse } from "next/server";
import {
  polishTestimonial,
  analyzeSentiment,
  checkContentSafety,
} from "@/lib/openrouter";

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Run all three in parallel for speed
    const [polished, sentiment, isSafe] = await Promise.all([
      polishTestimonial(text),
      analyzeSentiment(text),
      checkContentSafety(text),
    ]);

    if (!isSafe) {
      return NextResponse.json({
        polished,
        sentiment,
        warning: "Content flagged as potentially unsafe for public display.",
      });
    }

    return NextResponse.json({ polished, sentiment });
  } catch {
    return NextResponse.json({ error: "Failed to polish text" }, { status: 500 });
  }
}
