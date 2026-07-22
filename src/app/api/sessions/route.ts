import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

// POST — Create a new interview session
export async function POST(request: Request) {
  try {
    const { companyId, customerName, customerEmail } = await request.json();

    if (!companyId || !customerName) {
      return NextResponse.json(
        { error: "companyId and customerName are required" },
        { status: 400 }
      );
    }

    // Fetch company details from Firestore using admin SDK
    const companyDoc = await adminDb.collection("campaigns").doc(companyId).get();

    if (!companyDoc.exists) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const companyData = companyDoc.data()!;

    const company = {
      id: companyDoc.id,
      name: companyData.name || companyData.company_name || "Unknown",
      description: companyData.description || companyData.company_description || "",
      targetAudience: companyData.targetAudience || companyData.target_audience || "customers",
      slug: companyData.slug || companyData.share_token || companyDoc.id,
      userId: companyData.user_id || "",
    };

    const { createSession } = await import("@/lib/ai/pipeline");
    const { sessionId, slug } = await createSession(
      companyId,
      company,
      customerName,
      customerEmail || ""
    );

    return NextResponse.json({ sessionId, slug });
  } catch (err) {
    console.error("Create session error:", err);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}

// GET — Get session by slug, OR lookup company by share_token
export async function GET(request: Request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }

  // Try session lookup first
  try {
    const sessionSnap = await adminDb
      .collection("interview_sessions")
      .where("slug", "==", slug)
      .limit(1)
      .get();

    if (!sessionSnap.empty) {
      const doc = sessionSnap.docs[0];
      return NextResponse.json({ type: "session", id: doc.id, ...doc.data() });
    }
  } catch (err) {
    console.error("Session lookup failed:", err);
  }

  // Try company lookup by share_token
  try {
    const companySnap = await adminDb
      .collection("campaigns")
      .where("share_token", "==", slug)
      .limit(1)
      .get();

    if (!companySnap.empty) {
      const doc = companySnap.docs[0];
      const data = doc.data();
      return NextResponse.json({
        type: "company",
        companyId: doc.id,
        company_name: data.name || "Unknown",
        company_description: data.description || "",
        company_target_audience: data.target_audience || "customers",
        share_token: data.share_token,
        status: "active",
      });
    }
  } catch (err) {
    console.error("Company lookup failed:", err);
  }

  return NextResponse.json({ error: "Session not found" }, { status: 404 });
}
