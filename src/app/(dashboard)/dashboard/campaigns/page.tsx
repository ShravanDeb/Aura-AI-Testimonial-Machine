"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { auth, db, collection, getDocs, query, where, orderBy, deleteDoc, updateDoc, doc } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

interface Campaign {
  id: string;
  name: string;
  share_token: string;
  question_1: string;
  question_2: string;
  question_3: string;
  status: string;
  response_count: number;
  created_at: string;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
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
        const snap = await getDocs(query(collection(db, "campaigns"), where("user_id", "==", user.uid), orderBy("created_at", "desc")));
        const items: Campaign[] = [];
        snap.forEach((d) => items.push({ id: d.id, ...d.data() } as Campaign));
        setCampaigns(items);
      } catch {
        // Firestore not configured
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

  async function copyShareLink(token: string) {
    const url = getShareUrl(token);
    await navigator.clipboard.writeText(url);
    setCopiedId(token);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function toggleStatus(id: string, currentStatus: string) {
    if (!hasFirebase) return;
    const newStatus = currentStatus === "active" ? "paused" : "active";
    await updateDoc(doc(db, "campaigns", id), { status: newStatus });
    setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c)));
  }

  async function deleteCampaign(id: string) {
    if (!confirm("Delete this campaign? This cannot be undone.")) return;
    if (!hasFirebase) return;
    await deleteDoc(doc(db, "campaigns", id));
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-2xl)" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "var(--text-h2)", color: "var(--white)", marginBottom: "var(--space-xs)" }}>Campaigns</h1>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", color: "var(--text-muted)" }}>Create and manage testimonial collection campaigns</p>
        </div>
        <Link href="/dashboard/campaigns/new" style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)", padding: "var(--space-sm) var(--space-lg)", background: "var(--white)", color: "var(--bg)", borderRadius: "8px", fontFamily: "var(--font-body)", fontSize: "var(--text-small)", fontWeight: 500, flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          New Campaign
        </Link>
      </div>

      {loading ? (
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-small)", color: "var(--text-dim)" }}>Loading...</p>
      ) : campaigns.length === 0 ? (
        <div style={{ padding: "var(--space-4xl)", border: "1px dashed var(--border)", borderRadius: "12px", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-serif)", fontSize: "var(--text-body-lg)", color: "var(--text-muted)", fontStyle: "italic", marginBottom: "var(--space-sm)" }}>No campaigns yet</p>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", color: "var(--text-dim)" }}>Create your first campaign to start collecting testimonials.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
          {campaigns.map((c) => (
            <div key={c.id} style={{ padding: "var(--space-lg)", background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-md)" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", marginBottom: "var(--space-xs)" }}>
                    <h3 style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-body)", color: "var(--white)", fontWeight: 500 }}>{c.name}</h3>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-micro)", color: c.status === "active" ? "#22c55e" : "var(--text-dim)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", padding: "1px var(--space-xs)", border: `1px solid ${c.status === "active" ? "rgba(34,197,94,0.3)" : "var(--border)"}`, borderRadius: "3px" }}>{c.status}</span>
                  </div>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-micro)", color: "var(--text-dim)" }}>{c.response_count || 0} responses &middot; Created {new Date(c.created_at).toLocaleDateString()}</p>
                </div>
                <div style={{ display: "flex", gap: "var(--space-xs)" }}>
                  <button onClick={() => copyShareLink(c.share_token)} style={{ padding: "4px var(--space-sm)", borderRadius: "4px", fontFamily: "var(--font-mono)", fontSize: "var(--text-micro)", color: copiedId === c.share_token ? "#22c55e" : "var(--text-muted)", border: `1px solid ${copiedId === c.share_token ? "rgba(34,197,94,0.3)" : "var(--border)"}`, textTransform: "uppercase", letterSpacing: "var(--tracking-wide)" }}>{copiedId === c.share_token ? "Copied!" : "Copy Link"}</button>
                  <button onClick={() => toggleStatus(c.id, c.status)} style={{ padding: "4px var(--space-sm)", borderRadius: "4px", fontFamily: "var(--font-mono)", fontSize: "var(--text-micro)", color: "var(--text-muted)", border: "1px solid var(--border)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)" }}>{c.status === "active" ? "Pause" : "Activate"}</button>
                  <button onClick={() => deleteCampaign(c.id)} style={{ padding: "4px var(--space-sm)", borderRadius: "4px", fontFamily: "var(--font-mono)", fontSize: "var(--text-micro)", color: "var(--text-dim)", border: "1px solid var(--border)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)" }}>Delete</button>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)", padding: "var(--space-md)", background: "var(--bg-elevated)", borderRadius: "8px" }}>
                {[c.question_1, c.question_2, c.question_3].filter(Boolean).map((q, i) => (
                  <div key={i} style={{ display: "flex", gap: "var(--space-sm)", alignItems: "baseline" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-micro)", color: "var(--text-dim)", flexShrink: 0 }}>Q{i + 1}</span>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", color: "var(--text-secondary)" }}>{q}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
