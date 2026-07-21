"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  auth,
  db,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  deleteDoc,
  doc,
} from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

interface Session {
  id: string;
  slug: string;
  customerName: string;
  customerEmail: string;
  status: string;
  messages: Array<{ role: string; question?: string; answer?: string }>;
  context: { completeness?: number; detectedEmotion?: string };
  created_at: { seconds: number } | string;
  testimonialId: string | null;
}

interface Testimonial {
  id: string;
  sessionId: string;
  generatedText: string;
  generatedFormats: {
    website: string;
    linkedin: string;
    social: string;
    caseStudy: string;
  };
  attribution: { name: string; role: string; company: string };
  starRating: number;
  authenticityScore: number;
  status: string;
  rewriteCount: number;
  created_at: { seconds: number } | string;
}

type Tab = "sessions" | "testimonials";

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;

  const [company, setCompany] = useState<any>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [tab, setTab] = useState<Tab>("sessions");
  const [loading, setLoading] = useState(true);
  const [activeFormat, setActiveFormat] = useState<string>("website");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const hasFirebase = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  useEffect(() => {
    if (!hasFirebase) {
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        // Fetch company
        const campSnap = await getDocs(
          query(
            collection(db, "campaigns"),
            where("__name__", "==", companyId),
            where("user_id", "==", user.uid),
            limit(1)
          )
        );

        if (!campSnap.empty) {
          setCompany({ id: campSnap.docs[0].id, ...campSnap.docs[0].data() });
        }

        // Fetch sessions for this company
        const sessSnap = await getDocs(
          query(
            collection(db, "interview_sessions"),
            where("companyId", "==", companyId),
            orderBy("created_at", "desc")
          )
        );
        const sessItems: Session[] = [];
        sessSnap.forEach((d) => sessItems.push({ id: d.id, ...d.data() } as Session));
        setSessions(sessItems);

        // Fetch testimonials for this company
        const testSnap = await getDocs(
          query(
            collection(db, "testimonials"),
            where("companyId", "==", companyId),
            orderBy("created_at", "desc")
          )
        );
        const testItems: Testimonial[] = [];
        testSnap.forEach((d) => testItems.push({ id: d.id, ...d.data() } as Testimonial));
        setTestimonials(testItems);
      } catch {
        // Firestore not configured
      }
      setLoading(false);
    });

    return () => unsub();
  }, [companyId, hasFirebase]);

  async function approveTestimonial(id: string) {
    if (!hasFirebase) return;
    await updateDoc(doc(db, "testimonials", id), { status: "approved" });
    setTestimonials((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "approved" } : t))
    );
  }

  async function rejectTestimonial(id: string) {
    if (!hasFirebase) return;
    await updateDoc(doc(db, "testimonials", id), { status: "rejected" });
    setTestimonials((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "rejected" } : t))
    );
  }

  async function saveEdit(id: string) {
    if (!hasFirebase) return;
    await updateDoc(doc(db, "testimonials", id), { generatedText: editText });
    setTestimonials((prev) =>
      prev.map((t) => (t.id === id ? { ...t, generatedText: editText } : t))
    );
    setEditingId(null);
  }

  function copyEmbedCode(slug: string) {
    const code = `<script src="${typeof window !== "undefined" ? window.location.origin : ""}/company/${slug}" async></script>`;
    navigator.clipboard.writeText(code);
  }

  if (loading) {
    return <p style={mutedStyle}>Loading...</p>;
  }

  if (!company) {
    return (
      <div>
        <p style={headingStyle}>Company not found</p>
        <Link href="/dashboard/companies" style={backLinkStyle}>Back to Companies</Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "var(--space-2xl)" }}>
        <Link href="/dashboard/companies" style={backLinkStyle}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Companies
        </Link>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={headingStyle}>{company.name}</h1>
            <p style={mutedStyle}>{company.description || "No description"}</p>
          </div>
          <div style={{ display: "flex", gap: "var(--space-xs)" }}>
            <Link
              href={`/company/${company.share_token}`}
              target="_blank"
              style={actionButtonStyle}
            >
              View Wall
            </Link>
            <button
              onClick={() => copyEmbedCode(company.share_token)}
              style={actionButtonStyle}
            >
              Copy Embed
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "var(--space-xs)", marginBottom: "var(--space-xl)" }}>
        {(["sessions", "testimonials"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "var(--space-xs) var(--space-md)",
              borderRadius: "6px",
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-micro)",
              textTransform: "uppercase",
              letterSpacing: "var(--tracking-wide)",
              color: tab === t ? "var(--bg)" : "var(--text-muted)",
              background: tab === t ? "var(--white)" : "var(--bg-subtle)",
              border: `1px solid ${tab === t ? "var(--white)" : "var(--border)"}`,
              transition: "all 0.15s var(--ease-out)",
            }}
          >
            {t} ({t === "sessions" ? sessions.length : testimonials.length})
          </button>
        ))}
      </div>

      {/* Sessions Tab */}
      {tab === "sessions" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
          {sessions.length === 0 ? (
            <div style={emptyStyle}>
              <p style={{ fontFamily: "var(--font-serif)", fontSize: "var(--text-body-lg)", color: "var(--text-muted)", fontStyle: "italic" }}>
                No interview sessions yet
              </p>
            </div>
          ) : (
            sessions.map((s) => (
              <div key={s.id} style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--white)", fontWeight: 500 }}>
                      {s.customerName || "Anonymous"}
                    </p>
                    <p style={metaStyle}>
                      {s.customerEmail || "No email"} &middot; {formatDate(s.created_at)} &middot;{" "}
                      <span style={{ color: s.status === "completed" ? "#22c55e" : "var(--text-dim)" }}>
                        {s.status}
                      </span>
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "var(--space-xs)", alignItems: "center" }}>
                    <span style={metaStyle}>
                      {s.context?.completeness || 0}% complete
                    </span>
                    <Link
                      href={`/collect/${s.slug}`}
                      target="_blank"
                      style={actionButtonStyle}
                    >
                      View
                    </Link>
                  </div>
                </div>
                {s.messages && s.messages.length > 0 && (
                  <div style={{ marginTop: "var(--space-md)", padding: "var(--space-md)", background: "var(--bg-elevated)", borderRadius: "8px" }}>
                    {s.messages
                      .filter((m) => m.role === "user")
                      .map((m, i) => (
                        <p key={i} style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", color: "var(--text-secondary)", marginBottom: "var(--space-xs)" }}>
                          &bull; {m.answer}
                        </p>
                      ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Testimonials Tab */}
      {tab === "testimonials" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
          {testimonials.length === 0 ? (
            <div style={emptyStyle}>
              <p style={{ fontFamily: "var(--font-serif)", fontSize: "var(--text-body-lg)", color: "var(--text-muted)", fontStyle: "italic" }}>
                No testimonials yet
              </p>
            </div>
          ) : (
            testimonials.map((t) => (
              <div key={t.id} style={cardStyle}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-md)" }}>
                  <div>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--white)", fontWeight: 500 }}>
                      {t.attribution?.name || "Anonymous"}
                    </p>
                    <p style={metaStyle}>
                      {t.attribution?.role || "Customer"} &middot; Score: {t.authenticityScore || "N/A"}/100 &middot; Rewrites: {t.rewriteCount || 0}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "var(--space-xs)" }}>
                    {t.status !== "approved" && (
                      <button onClick={() => approveTestimonial(t.id)} style={{ ...actionButtonStyle, color: "#22c55e", borderColor: "rgba(34,197,94,0.3)" }}>
                        Approve
                      </button>
                    )}
                    {t.status !== "rejected" && (
                      <button onClick={() => rejectTestimonial(t.id)} style={{ ...actionButtonStyle, color: "#ef4444", borderColor: "rgba(239,68,68,0.3)" }}>
                        Reject
                      </button>
                    )}
                  </div>
                </div>

                {/* Format Tabs */}
                {t.generatedFormats && (
                  <div style={{ display: "flex", gap: "var(--space-xs)", marginBottom: "var(--space-md)" }}>
                    {["website", "linkedin", "social", "caseStudy"].map((f) => (
                      <button
                        key={f}
                        onClick={() => setActiveFormat(f)}
                        style={{
                          padding: "2px var(--space-sm)",
                          borderRadius: "4px",
                          fontFamily: "var(--font-mono)",
                          fontSize: "10px",
                          textTransform: "uppercase",
                          letterSpacing: "var(--tracking-wide)",
                          color: activeFormat === f ? "var(--bg)" : "var(--text-dim)",
                          background: activeFormat === f ? "var(--white)" : "transparent",
                          border: `1px solid ${activeFormat === f ? "var(--white)" : "var(--border)"}`,
                        }}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                )}

                {/* Testimonial Text */}
                {editingId === t.id ? (
                  <div>
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={4}
                      style={{ width: "100%", padding: "var(--space-md)", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "8px", fontFamily: "var(--font-body)", fontSize: "var(--text-small)", color: "var(--white)", resize: "vertical" }}
                    />
                    <div style={{ display: "flex", gap: "var(--space-xs)", marginTop: "var(--space-sm)" }}>
                      <button onClick={() => saveEdit(t.id)} style={{ ...actionButtonStyle, color: "#22c55e" }}>Save</button>
                      <button onClick={() => setEditingId(null)} style={actionButtonStyle}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setEditingId(t.id);
                      setEditText(
                        t.generatedFormats?.[activeFormat as keyof typeof t.generatedFormats] ||
                          t.generatedText ||
                          ""
                      );
                    }}
                  >
                    <div style={{ padding: "var(--space-lg)", borderLeft: "2px solid var(--white)", marginBottom: "var(--space-md)" }}>
                      <p
                        style={{
                          fontFamily: "var(--font-serif)",
                          fontSize: "var(--text-body)",
                          color: "var(--white)",
                          fontStyle: "italic",
                          lineHeight: 1.6,
                        }}
                        dangerouslySetInnerHTML={{
                          __html:
                            t.generatedFormats?.[activeFormat as keyof typeof t.generatedFormats] ||
                            t.generatedText ||
                            "",
                        }}
                      />
                    </div>
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-dim)", textTransform: "uppercase" }}>
                      Click to edit &middot; {t.status}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function formatDate(d: { seconds: number } | string) {
  if (typeof d === "string") return new Date(d).toLocaleDateString();
  return new Date(d.seconds * 1000).toLocaleDateString();
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

const metaStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-micro)",
  color: "var(--text-dim)",
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

const cardStyle: React.CSSProperties = {
  padding: "var(--space-lg)",
  background: "var(--bg-subtle)",
  border: "1px solid var(--border)",
  borderRadius: "12px",
};

const emptyStyle: React.CSSProperties = {
  padding: "var(--space-4xl)",
  border: "1px dashed var(--border)",
  borderRadius: "12px",
  textAlign: "center",
};

const actionButtonStyle: React.CSSProperties = {
  padding: "4px var(--space-sm)",
  borderRadius: "4px",
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-micro)",
  color: "var(--text-muted)",
  border: "1px solid var(--border)",
  textTransform: "uppercase",
  letterSpacing: "var(--tracking-wide)",
};
