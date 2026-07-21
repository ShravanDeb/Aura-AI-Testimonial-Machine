"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  db,
  collection,
  query,
  where,
  limit,
  getDocs,
} from "@/lib/firebase";

interface Testimonial {
  id: string;
  generatedText: string;
  attribution: { name: string; role: string; company: string };
  starRating: number;
  highlightedMetrics: { text: string; type: string }[];
  created_at: { seconds: number } | string;
}

interface CompanyData {
  id: string;
  name: string;
  description: string;
  targetAudience: string;
  slug: string;
}

export default function CompanyWallPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [company, setCompany] = useState<CompanyData | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        // Find campaign by slug (share_token)
        const campQ = query(
          collection(db, "campaigns"),
          where("share_token", "==", slug),
          limit(1)
        );
        const campSnap = await getDocs(campQ);

        if (campSnap.empty) {
          setError("Company not found");
          setLoading(false);
          return;
        }

        const campDoc = campSnap.docs[0];
        const campData = campDoc.data();

        setCompany({
          id: campDoc.id,
          name: campData.name || "Company",
          description: campData.description || "",
          targetAudience: campData.target_audience || "",
          slug,
        });

        // Fetch approved testimonials for this company
        const testQ = query(
          collection(db, "testimonials"),
          where("company_name", "==", campData.name),
          where("status", "==", "approved"),
          limit(50)
        );
        const testSnap = await getDocs(testQ);

        const items: Testimonial[] = [];
        testSnap.forEach((d) => items.push({ id: d.id, ...d.data() } as Testimonial));
        setTestimonials(items);
      } catch {
        setError("Failed to load testimonials");
      }
      setLoading(false);
    }

    load();
  }, [slug]);

  if (loading) {
    return (
      <div style={containerStyle}>
        <p style={mutedStyle}>Loading...</p>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: "center", maxWidth: "32rem" }}>
          <p style={headingStyle}>{error || "Not found"}</p>
          <p style={mutedStyle}>
            This company page doesn&apos;t exist or has no published testimonials yet.
          </p>
        </div>
      </div>
    );
  }

  const avgRating =
    testimonials.length > 0
      ? (
          testimonials.reduce((sum, t) => sum + (t.starRating || 5), 0) /
          testimonials.length
        ).toFixed(1)
      : "5.0";

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Header */}
      <div
        style={{
          padding: "var(--space-4xl) var(--space-xl) var(--space-2xl)",
          textAlign: "center",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <h1 style={headingStyle}>{company.name}</h1>
        {company.description && (
          <p
            style={{
              ...mutedStyle,
              maxWidth: "32rem",
              margin: "0 auto var(--space-lg)",
            }}
          >
            {company.description}
          </p>
        )}
        <div style={{ display: "flex", justifyContent: "center", gap: "var(--space-lg)", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "2px" }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill={star <= Math.round(parseFloat(avgRating)) ? "var(--white)" : "none"}
                stroke="var(--white)"
                strokeWidth="1.5"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            ))}
          </div>
          <p style={mutedStyle}>
            {avgRating}/5 &middot; {testimonials.length} testimonial{testimonials.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Testimonial Grid */}
      <div
        style={{
          maxWidth: "72rem",
          margin: "0 auto",
          padding: "var(--space-2xl) var(--space-xl)",
        }}
      >
        {testimonials.length === 0 ? (
          <div style={{ textAlign: "center", padding: "var(--space-4xl)" }}>
            <p style={{ ...mutedStyle, fontStyle: "italic" }}>
              No testimonials published yet. Check back soon.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(28rem, 1fr))",
              gap: "var(--space-lg)",
            }}
          >
            {testimonials.map((t) => (
              <div key={t.id} style={cardStyle}>
                {/* Stars */}
                <div style={{ display: "flex", gap: "2px", marginBottom: "var(--space-md)" }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill={star <= (t.starRating || 5) ? "var(--white)" : "none"}
                      stroke="var(--white)"
                      strokeWidth="1.5"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>

                {/* Quote */}
                <p
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "var(--text-body)",
                    color: "var(--white)",
                    fontStyle: "italic",
                    lineHeight: 1.6,
                    marginBottom: "var(--space-lg)",
                  }}
                >
                  &ldquo;{t.generatedText}&rdquo;
                </p>

                {/* Attribution */}
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: "var(--bg-elevated)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "var(--font-mono)",
                      fontSize: "var(--text-micro)",
                      color: "var(--text-dim)",
                      flexShrink: 0,
                    }}
                  >
                    {(t.attribution?.name || "A")[0].toUpperCase()}
                  </div>
                  <div>
                    <p
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "var(--text-small)",
                        color: "var(--text-primary)",
                        fontWeight: 500,
                      }}
                    >
                      {t.attribution?.name || "A valued customer"}
                    </p>
                    <p
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "var(--text-micro)",
                        color: "var(--text-dim)",
                      }}
                    >
                      {t.attribution?.role || "Customer"}
                      {t.attribution?.company ? `, ${t.attribution.company}` : ""}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "var(--space-2xl) var(--space-xl)",
          borderTop: "1px solid var(--border)",
          textAlign: "center",
        }}
      >
        <p style={mutedStyle}>
          Powered by{" "}
          <span
            style={{
              fontFamily: "var(--font-serif)",
              color: "var(--white)",
              fontStyle: "italic",
            }}
          >
            testimonial machine.
          </span>
        </p>
      </div>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "var(--bg)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "var(--space-xl)",
};

const headingStyle: React.CSSProperties = {
  fontFamily: "var(--font-serif)",
  fontSize: "var(--text-h2)",
  color: "var(--white)",
  lineHeight: 1.15,
  marginBottom: "var(--space-sm)",
};

const mutedStyle: React.CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: "var(--text-small)",
  color: "var(--text-dim)",
};

const cardStyle: React.CSSProperties = {
  padding: "var(--space-xl)",
  background: "var(--bg-subtle)",
  border: "1px solid var(--border)",
  borderRadius: "12px",
  transition: "border-color 0.2s var(--ease-out)",
};
