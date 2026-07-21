import { NextResponse } from "next/server";
import { getSessionBySlug } from "@/lib/ai/pipeline";

// GET — Get session by slug (public, for customer-facing page)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await getSessionBySlug(slug);

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Strip sensitive data for public view
    const publicSession = {
      id: session.id,
      slug: session.slug,
      company_name: session.company_name,
      company_description: session.company_description,
      company_target_audience: session.company_target_audience,
      status: session.status,
      messages: session.messages,
      context: session.context,
      customerName: session.customerName,
    };

    return NextResponse.json(publicSession);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 }
    );
  }
}
