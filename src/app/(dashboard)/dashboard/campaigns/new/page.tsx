"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth, db, collection, addDoc, serverTimestamp } from "@/lib/firebase";

export default function NewCampaignPage() {
  const [name, setName] = useState("");
  const [question1, setQuestion1] = useState("What problem did our product solve for you?");
  const [question2, setQuestion2] = useState("What changed after you started using it?");
  const [question3, setQuestion3] = useState("What would you tell a friend about us?");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const hasFirebase = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  function generateToken() {
    return Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!name.trim()) {
      setError("Campaign name is required");
      setLoading(false);
      return;
    }

    const user = auth.currentUser;
    if (!user && hasFirebase) {
      setError("You must be logged in");
      setLoading(false);
      return;
    }

    if (hasFirebase) {
      await addDoc(collection(db, "campaigns"), {
        user_id: user!.uid,
        name: name.trim(),
        question_1: question1.trim(),
        question_2: question2.trim(),
        question_3: question3.trim(),
        share_token: generateToken(),
        status: "active",
        response_count: 0,
        created_at: serverTimestamp(),
      });
    }

    router.push("/dashboard/campaigns");
    router.refresh();
  }

  const inputStyle = {
    width: "100%",
    padding: "var(--space-sm) var(--space-md)",
    background: "var(--bg-elevated)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    fontFamily: "var(--font-body)",
    fontSize: "var(--text-small)" as const,
    color: "var(--white)",
    transition: "border-color 0.2s var(--ease-out)",
  };

  const labelStyle = {
    fontFamily: "var(--font-mono)" as const,
    fontSize: "var(--text-micro)",
    color: "var(--text-muted)",
    textTransform: "uppercase" as const,
    letterSpacing: "var(--tracking-wide)",
    display: "block" as const,
    marginBottom: "var(--space-xs)",
  };

  return (
    <div style={{ maxWidth: "36rem" }}>
      <div style={{ marginBottom: "var(--space-2xl)" }}>
        <Link href="/dashboard/campaigns" style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-micro)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", display: "inline-flex", alignItems: "center", gap: "var(--space-xs)", marginBottom: "var(--space-lg)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          Back to Campaigns
        </Link>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "var(--text-h2)", color: "var(--white)", marginBottom: "var(--space-xs)" }}>New Campaign</h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", color: "var(--text-muted)" }}>Create a testimonial collection campaign with custom questions</p>
      </div>

      <form onSubmit={handleCreate}>
        <div style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "12px", padding: "var(--space-xl)" }}>
          <div style={{ marginBottom: "var(--space-xl)" }}>
            <label style={labelStyle}>Campaign Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Q1 Customer Feedback" required style={inputStyle} onFocus={(e) => (e.currentTarget.style.borderColor = "var(--border-hover)")} onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
          </div>

          <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-micro)", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", marginBottom: "var(--space-lg)" }}>Questions</div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
            {[
              { label: "Question 1", value: question1, setter: setQuestion1 },
              { label: "Question 2", value: question2, setter: setQuestion2 },
              { label: "Question 3", value: question3, setter: setQuestion3 },
            ].map((q) => (
              <div key={q.label}>
                <label style={labelStyle}>{q.label}</label>
                <input type="text" value={q.value} onChange={(e) => q.setter(e.target.value)} style={inputStyle} onFocus={(e) => (e.currentTarget.style.borderColor = "var(--border-hover)")} onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
              </div>
            ))}
          </div>

          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-micro)", color: "var(--text-dim)", marginTop: "var(--space-lg)", lineHeight: 1.5 }}>
            These questions will be shown to your customers when they open the collection link. You can customize them or keep the defaults.
          </p>
        </div>

        {error && <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-micro)", color: "#ef4444", marginTop: "var(--space-md)" }}>{error}</p>}

        <div style={{ display: "flex", gap: "var(--space-sm)", marginTop: "var(--space-xl)" }}>
          <Link href="/dashboard/campaigns" style={{ padding: "var(--space-sm) var(--space-lg)", borderRadius: "8px", border: "1px solid var(--border)", fontFamily: "var(--font-body)", fontSize: "var(--text-small)", color: "var(--text-muted)" }}>Cancel</Link>
          <button type="submit" disabled={loading} style={{ padding: "var(--space-sm) var(--space-lg)", background: "var(--white)", color: "var(--bg)", borderRadius: "8px", fontFamily: "var(--font-body)", fontSize: "var(--text-small)", fontWeight: 500, opacity: loading ? 0.5 : 1, transition: "opacity 0.2s var(--ease-out)" }}>
            {loading ? "Creating..." : "Create Campaign"}
          </button>
        </div>
      </form>
    </div>
  );
}
