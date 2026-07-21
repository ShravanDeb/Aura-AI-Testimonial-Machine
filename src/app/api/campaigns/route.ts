import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ error: "Firebase handles data client-side" }, { status: 501 });
}

export async function POST() {
  return NextResponse.json({ error: "Firebase handles data client-side" }, { status: 501 });
}
