"use client";

import { useEffect, useState } from "react";
import { auth, db, collection, getDocs, query, where, deleteDoc, updateDoc, doc } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

interface Testimonial {
  id: string;
  customer_name: string;
  customer_email: string;
  content: string;
  polished_content: string;
  status: string;
  campaign_id: string;
  created_at: string;
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const hasFirebase = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  useEffect(() => {
    if (!hasFirebase) {
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        let q = query(collection(db, "testimonials"), where("user_id", "==", user.uid));
        if (filter !== "all") {
          q = query(collection(db, "testimonials"), where("user_id", "==", user.uid), where("status", "==", filter));
        }
        const snap = await getDocs(q);
        const items: Testimonial[] = [];
        snap.forEach((d) => {
          const data = d.data();
          const raw = data.created_at;
          let dateStr = "";
          if (raw?.toDate) dateStr = raw.toDate().toISOString();
          else if (typeof raw === "string") dateStr = raw;
          items.push({ id: d.id, ...data, created_at: dateStr } as Testimonial);
        });
        items.sort((a, b) => {
          const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
          const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
          return bTime - aTime;
        });
        setTestimonials(items);
      } catch {
        // Firestore not configured
      }
      setLoading(false);
    });

    return () => unsub();
  }, [filter, hasFirebase]);

  async function updateStatus(id: string, status: string) {
    if (!hasFirebase) return;
    await updateDoc(doc(db, "testimonials", id), { status });
    setTestimonials((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  }

  async function deleteTestimonial(id: string) {
    if (!hasFirebase) return;
    await deleteDoc(doc(db, "testimonials", id));
    setTestimonials((prev) => prev.filter((t) => t.id !== id));
  }

  const filters: Array<{ label: string; value: typeof filter }> = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
  ];

  return (
    <div>
      <div style={{ marginBottom: "var(--space-2xl)" }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "var(--text-h2)", color: "var(--white)", marginBottom: "var(--space-xs)" }}>Testimonials</h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", color: "var(--text-muted)" }}>Review and manage collected testimonials</p>
      </div>

      <div style={{ display: "flex", gap: "var(--space-xs)", marginBottom: "var(--space-xl)" }}>
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => { setFilter(f.value); setLoading(true); }}
            style={{
              padding: "var(--space-xs) var(--space-md)",
              borderRadius: "6px",
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-micro)",
              textTransform: "uppercase",
              letterSpacing: "var(--tracking-wide)",
              color: filter === f.value ? "var(--bg)" : "var(--text-muted)",
              background: filter === f.value ? "var(--white)" : "var(--bg-subtle)",
              border: `1px solid ${filter === f.value ? "var(--white)" : "var(--border)"}`,
              transition: "all 0.15s var(--ease-out)",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-small)", color: "var(--text-dim)" }}>Loading...</p>
      ) : testimonials.length === 0 ? (
        <div style={{ padding: "var(--space-4xl)", border: "1px dashed var(--border)", borderRadius: "12px", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-serif)", fontSize: "var(--text-body-lg)", color: "var(--text-muted)", fontStyle: "italic" }}>No testimonials found</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
          {testimonials.map((t) => (
            <div key={t.id} style={{ padding: "var(--space-lg)", background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-md)" }}>
                <div>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-small)", color: "var(--text-primary)", fontWeight: 500 }}>{t.customer_name || "Anonymous"}</p>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-micro)", color: "var(--text-dim)" }}>{t.customer_email || "No email"} &middot; {new Date(t.created_at).toLocaleDateString()}</p>
                </div>
                <div style={{ display: "flex", gap: "var(--space-xs)" }}>
                  {t.status !== "approved" && (
                    <button onClick={() => updateStatus(t.id, "approved")} style={{ padding: "4px var(--space-sm)", borderRadius: "4px", fontFamily: "var(--font-mono)", fontSize: "var(--text-micro)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.3)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)" }}>Approve</button>
                  )}
                  {t.status !== "rejected" && (
                    <button onClick={() => updateStatus(t.id, "rejected")} style={{ padding: "4px var(--space-sm)", borderRadius: "4px", fontFamily: "var(--font-mono)", fontSize: "var(--text-micro)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)" }}>Reject</button>
                  )}
                  <button onClick={() => deleteTestimonial(t.id)} style={{ padding: "4px var(--space-sm)", borderRadius: "4px", fontFamily: "var(--font-mono)", fontSize: "var(--text-micro)", color: "var(--text-dim)", border: "1px solid var(--border)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)" }}>Delete</button>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-lg)" }}>
                <div>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-micro)", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", marginBottom: "var(--space-xs)" }}>Raw</p>
                  <p className="raw-text" style={{ fontSize: "var(--text-small)" }}>{t.content}</p>
                </div>
                {t.polished_content && (
                  <div>
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-micro)", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "var(--tracking-wide)", marginBottom: "var(--space-xs)" }}>Polished</p>
                    <p style={{ fontFamily: "var(--font-serif)", fontSize: "var(--text-body)", color: "var(--white)", fontStyle: "italic", lineHeight: 1.5 }}>&ldquo;{t.polished_content}&rdquo;</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
