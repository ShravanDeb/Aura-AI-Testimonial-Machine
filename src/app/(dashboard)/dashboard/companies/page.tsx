"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { auth, db, collection, getDocs, query, where, deleteDoc, doc } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

interface Company {
  id: string;
  name: string;
  description: string;
  share_token: string;
  status: string;
  response_count: number;
  created_at: { seconds: number } | string;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const hasFirebase = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  useEffect(() => {
    if (!hasFirebase) {
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        // No orderBy — avoids needing composite index
        const snap = await getDocs(
          query(
            collection(db, "campaigns"),
            where("user_id", "==", user.uid)
          )
        );
        const items: Company[] = [];
        snap.forEach((d) => items.push({ id: d.id, ...d.data() } as Company));
        // Sort client-side
        items.sort((a, b) => {
          const aTime = typeof a.created_at === "string" ? new Date(a.created_at).getTime() : (a.created_at?.seconds || 0) * 1000;
          const bTime = typeof b.created_at === "string" ? new Date(b.created_at).getTime() : (b.created_at?.seconds || 0) * 1000;
          return bTime - aTime;
        });
        setCompanies(items);
      } catch (err) {
        console.error("Failed to load companies:", err);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [hasFirebase]);

  function getShareUrl(token: string) {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/collect/${token}`;
    }
    return `/collect/${token}`;
  }

  function getWallUrl(token: string) {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/company/${token}`;
    }
    return `/company/${token}`;
  }

  async function copyLink(url: string, id: string) {
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function deleteCompany(id: string) {
    if (!confirm("Delete this company? This cannot be undone.")) return;
    if (!hasFirebase) return;
    await deleteDoc(doc(db, "campaigns", id));
    setCompanies((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-2xl)" }}>
        <div>
          <h1 style={headingStyle}>Companies</h1>
          <p style={mutedStyle}>Manage your company profiles and collect testimonials</p>
        </div>
        <Link href="/dashboard/companies/new" style={primaryButtonStyle}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Company
        </Link>
      </div>

      {loading ? (
        <p style={mutedStyle}>Loading...</p>
      ) : companies.length === 0 ? (
        <div style={emptyStyle}>
          <p style={{ fontFamily: "var(--font-serif)", fontSize: "var(--text-body-lg)", color: "var(--text-muted)", fontStyle: "italic", marginBottom: "var(--space-sm)" }}>
            No companies yet
          </p>
          <p style={mutedStyle}>Create your first company to start collecting testimonials.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
          {companies.map((c) => (
            <div key={c.id} style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-md)" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", marginBottom: "var(--space-xs)" }}>
                    <h3 style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--white)", fontWeight: 500 }}>{c.name}</h3>
                    <span style={statusBadge(c.status === "active")}>{c.status}</span>
                  </div>
                  <p style={metaStyle}>{c.response_count || 0} responses &middot; Created {formatDate(c.created_at)}</p>
                </div>
                <div style={{ display: "flex", gap: "var(--space-xs)" }}>
                  <Link href={`/dashboard/companies/${c.id}`} style={actionButtonStyle}>View</Link>
                  <button onClick={() => copyLink(getShareUrl(c.share_token), `collect-${c.id}`)} style={{ ...actionButtonStyle, color: copiedId === `collect-${c.id}` ? "#22c55e" : "var(--text-muted)" }}>
                    {copiedId === `collect-${c.id}` ? "Copied!" : "Copy Link"}
                  </button>
                  <button onClick={() => copyLink(getWallUrl(c.share_token), `wall-${c.id}`)} style={{ ...actionButtonStyle, color: copiedId === `wall-${c.id}` ? "#22c55e" : "var(--text-muted)" }}>
                    {copiedId === `wall-${c.id}` ? "Copied!" : "Wall"}
                  </button>
                  <button onClick={() => deleteCompany(c.id)} style={{ ...actionButtonStyle, color: "var(--text-dim)" }}>Delete</button>
                </div>
              </div>
              {c.description && (
                <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", color: "var(--text-muted)", lineHeight: 1.5 }}>{c.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatDate(d: { seconds: number } | string) {
  if (typeof d === "string") return new Date(d).toLocaleDateString();
  return new Date(d.seconds * 1000).toLocaleDateString();
}

function statusBadge(active: boolean) {
  return {
    fontFamily: "var(--font-mono)" as const,
    fontSize: "var(--text-micro)" as const,
    color: active ? "#22c55e" : "var(--text-dim)",
    textTransform: "uppercase" as const,
    letterSpacing: "var(--tracking-wide)",
    padding: "1px var(--space-xs)",
    border: `1px solid ${active ? "rgba(34,197,94,0.3)" : "var(--border)"}`,
    borderRadius: "3px",
  };
}

const headingStyle: React.CSSProperties = { fontFamily: "var(--font-serif)", fontSize: "var(--text-h2)", color: "var(--white)", marginBottom: "var(--space-xs)" };
const mutedStyle: React.CSSProperties = { fontFamily: "var(--font-body)", fontSize: "var(--text-small)", color: "var(--text-muted)" };
const metaStyle: React.CSSProperties = { fontFamily: "var(--font-mono)", fontSize: "var(--text-micro)", color: "var(--text-dim)" };
const primaryButtonStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: "var(--space-xs)", padding: "var(--space-sm) var(--space-lg)", background: "var(--white)", color: "var(--bg)", borderRadius: "8px", fontFamily: "var(--font-body)", fontSize: "var(--text-small)", fontWeight: 500, flexShrink: 0 };
const emptyStyle: React.CSSProperties = { padding: "var(--space-4xl)", border: "1px dashed var(--border)", borderRadius: "12px", textAlign: "center" };
const cardStyle: React.CSSProperties = { padding: "var(--space-lg)", background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "12px" };
const actionButtonStyle: React.CSSProperties = { padding: "4px var(--space-sm)", borderRadius: "4px", fontFamily: "var(--font-mono)", fontSize: "var(--text-micro)", color: "var(--text-muted)", border: "1px solid var(--border)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)" };
