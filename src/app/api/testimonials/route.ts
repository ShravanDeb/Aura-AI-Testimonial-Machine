import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ error: "Firebase handles auth client-side" }, { status: 501 });
}

export async function POST() {
  return NextResponse.json({ error: "Firebase handles auth client-side" }, { status: 501 });
}
