"use client";

import { useEffect, useState } from "react";
import { auth, db, collection, getDocs, query, where } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

interface Stats {
  totalTestimonials: number;
  totalCampaigns: number;
}

interface RecentTestimonial {
  id: string;
  customer_name: string;
  content: string;
  status: string;
  created_at: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ totalTestimonials: 0, totalCampaigns: 0 });
  const [recent, setRecent] = useState<RecentTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const hasFirebase = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  useEffect(() => {
    if (!hasFirebase) {
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      try {
        const campaignSnap = await getDocs(query(collection(db, "campaigns"), where("user_id", "==", user.uid)));
        const testimonialSnap = await getDocs(query(collection(db, "testimonials"), where("user_id", "==", user.uid)));

        setStats({
          totalCampaigns: campaignSnap.size,
          totalTestimonials: testimonialSnap.size,
        });

        const items: RecentTestimonial[] = [];
        testimonialSnap.forEach((d) => {
          items.push({ id: d.id, ...d.data() } as RecentTestimonial);
        });
        items.sort((a, b) => {
          const aTime = typeof a.created_at === "string" ? new Date(a.created_at).getTime() : 0;
          const bTime = typeof b.created_at === "string" ? new Date(b.created_at).getTime() : 0;
          return bTime - aTime;
        });
        setRecent(items.slice(0, 5));
      } catch {
        // Firestore not configured yet
      }
      setLoading(false);
    });

    return () => unsub();
  }, [hasFirebase]);

  const statCards = [
    { label: "Testimonials", value: stats.totalTestimonials, sub: "collected" },
    { label: "Campaigns", value: stats.totalCampaigns, sub: "active" },
    { label: "Views", value: 0, sub: "total impressions" },
    { label: "Approval Rate", value: "0%", sub: "approved" },
  ];

  return (
    <div>
      <div style={{ marginBottom: "var(--space-2xl)" }}>
        <h1 style={{
          fontFamily: "var(--font-serif)",
          fontSize: "var(--text-h2)",
          color: "var(--white)",
          marginBottom: "var(--space-xs)",
        }}>
          Dashboard
        </h1>
        <p style={{
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-small)",
          color: "var(--text-muted)",
        }}>
          Overview of your testimonial collection
        </p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "var(--space-md)",
        marginBottom: "var(--space-3xl)",
      }}>
        {statCards.map((card) => (
          <div
            key={card.label}
            style={{
              padding: "var(--space-lg)",
              background: "var(--bg-subtle)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
            }}
          >
            <p style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-micro)",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "var(--tracking-wide)",
              marginBottom: "var(--space-sm)",
            }}>
              {card.label}
            </p>
            <p style={{
              fontFamily: "var(--font-serif)",
              fontSize: "var(--text-h2)",
              color: "var(--white)",
              lineHeight: 1,
            }}>
              {loading ? "—" : card.value}
            </p>
            <p style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-micro)",
              color: "var(--text-dim)",
              marginTop: "var(--space-xs)",
            }}>
              {card.sub}
            </p>
          </div>
        ))}
      </div>

      <div>
        <h2 style={{
          fontFamily: "var(--font-serif)",
          fontSize: "var(--text-h3)",
          color: "var(--white)",
          marginBottom: "var(--space-lg)",
        }}>
          Recent Testimonials
        </h2>

        {loading ? (
          <p style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-small)",
            color: "var(--text-dim)",
          }}>
            Loading...
          </p>
        ) : recent.length === 0 ? (
          <div style={{
            padding: "var(--space-3xl)",
            border: "1px dashed var(--border)",
            borderRadius: "12px",
            textAlign: "center",
          }}>
            <p style={{
              fontFamily: "var(--font-serif)",
              fontSize: "var(--text-body-lg)",
              color: "var(--text-muted)",
              fontStyle: "italic",
              marginBottom: "var(--space-sm)",
            }}>
              No testimonials yet
            </p>
            <p style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-small)",
              color: "var(--text-dim)",
            }}>
              Create a campaign to start collecting testimonials from your customers.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
            {recent.map((t) => (
              <div
                key={t.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  padding: "var(--space-md) var(--space-lg)",
                  background: "var(--bg-subtle)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  gap: "var(--space-lg)",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "var(--text-small)",
                    color: "var(--text-primary)",
                    marginBottom: "var(--space-xs)",
                    fontWeight: 500,
                  }}>
                    {t.customer_name || "Anonymous"}
                  </p>
                  <p style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "var(--text-body)",
                    color: "var(--text-secondary)",
                    fontStyle: "italic",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: "50ch",
                  }}>
                    &ldquo;{t.content}&rdquo;
                  </p>
                </div>
                <span style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--text-micro)",
                  color: t.status === "approved" ? "#22c55e" : t.status === "pending" ? "#eab308" : "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "var(--tracking-wide)",
                  flexShrink: 0,
                  padding: "2px var(--space-sm)",
                  border: `1px solid ${t.status === "approved" ? "rgba(34,197,94,0.3)" : t.status === "pending" ? "rgba(234,179,8,0.3)" : "var(--border)"}`,
                  borderRadius: "4px",
                }}>
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
