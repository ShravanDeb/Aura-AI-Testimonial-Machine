import { NextResponse } from "next/server";

// Campaign data is fetched client-side via Firestore (no admin SDK needed)
// This endpoint is for server-side operations if needed in the future

export async function GET() {
  return NextResponse.json({
    error: "Campaign data is fetched client-side. Use the collect page directly.",
    hint: "GET /api/campaigns?token=YOUR_SHARE_TOKEN — coming soon with Firebase Admin SDK"
  }, { status: 501 });
}
