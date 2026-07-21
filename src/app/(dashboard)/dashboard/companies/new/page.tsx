"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth, db, collection, addDoc, serverTimestamp } from "@/lib/firebase";

export default function NewCompanyPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
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
      setError("Company name is required");
      setLoading(false);
      return;
    }

    if (!description.trim()) {
      setError("Description is required — helps the AI ask better questions");
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
        description: description.trim(),
        target_audience: targetAudience.trim() || "customers",
        share_token: generateToken(),
        status: "active",
        response_count: 0,
        created_at: serverTimestamp(),
      });
    }

    router.push("/dashboard/companies");
    router.refresh();
  }

  return (
    <div style={{ maxWidth: "36rem" }}>
      <div style={{ marginBottom: "var(--space-2xl)" }}>
        <Link href="/dashboard/companies" style={backLinkStyle}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Companies
        </Link>
        <h1 style={headingStyle}>New Company</h1>
        <p style={mutedStyle}>Set up a company profile to start collecting AI-powered testimonials</p>
      </div>

      <form onSubmit={handleCreate}>
        <div style={formCardStyle}>
          <div style={{ marginBottom: "var(--space-xl)" }}>
            <label style={labelStyle}>Company Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., TaskFlow"
              required
              style={inputStyle}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--border-hover)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
            />
          </div>

          <div style={{ marginBottom: "var(--space-xl)" }}>
            <label style={labelStyle}>What does this company do?</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Project management software that helps teams ship faster with fewer meetings"
              rows={3}
              required
              style={{ ...inputStyle, resize: "vertical" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--border-hover)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
            />
            <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-micro)", color: "var(--text-dim)", marginTop: "var(--space-xs)", lineHeight: 1.4 }}>
              This helps the AI interviewer ask relevant, specific questions to your customers.
            </p>
          </div>

          <div>
            <label style={labelStyle}>Target Audience</label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g., Marketing directors at mid-size SaaS companies"
              style={inputStyle}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--border-hover)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
            />
            <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-micro)", color: "var(--text-dim)", marginTop: "var(--space-xs)", lineHeight: 1.4 }}>
              Optional. Helps generate answer options that match your actual customers.
            </p>
          </div>
        </div>

        {error && <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-micro)", color: "#ef4444", marginTop: "var(--space-md)" }}>{error}</p>}

        <div style={{ display: "flex", gap: "var(--space-sm)", marginTop: "var(--space-xl)" }}>
          <Link href="/dashboard/companies" style={cancelButtonStyle}>Cancel</Link>
          <button type="submit" disabled={loading} style={{ ...primaryButtonStyle, opacity: loading ? 0.5 : 1 }}>
            {loading ? "Creating..." : "Create Company"}
          </button>
        </div>
      </form>
    </div>
  );
}

const headingStyle: React.CSSProperties = {
  fontFamily: "var(--font-serif)",
  fontSize: "var(--text-h2)",
  color: "var(--white)",
  marginBottom: "var(--space-xs)",
};

const mutedStyle: React.CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: "var(--text-small)",
  color: "var(--text-muted)",
};

const backLinkStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-micro)",
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "var(--tracking-wide)",
  display: "inline-flex",
  alignItems: "center",
  gap: "var(--space-xs)",
  marginBottom: "var(--space-lg)",
};

const formCardStyle: React.CSSProperties = {
  background: "var(--bg-subtle)",
  border: "1px solid var(--border)",
  borderRadius: "12px",
  padding: "var(--space-xl)",
};

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-micro)",
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "var(--tracking-wide)",
  display: "block",
  marginBottom: "var(--space-xs)",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "var(--space-sm) var(--space-md)",
  background: "var(--bg-elevated)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  fontFamily: "var(--font-body)",
  fontSize: "var(--text-small)",
  color: "var(--white)",
  transition: "border-color 0.2s var(--ease-out)",
};

const primaryButtonStyle: React.CSSProperties = {
  padding: "var(--space-sm) var(--space-lg)",
  background: "var(--white)",
  color: "var(--bg)",
  borderRadius: "8px",
  fontFamily: "var(--font-body)",
  fontSize: "var(--text-small)",
  fontWeight: 500,
};

const cancelButtonStyle: React.CSSProperties = {
  padding: "var(--space-sm) var(--space-lg)",
  borderRadius: "8px",
  border: "1px solid var(--border)",
  fontFamily: "var(--font-body)",
  fontSize: "var(--text-small)",
  color: "var(--text-muted)",
};
