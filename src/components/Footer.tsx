"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        footerRef.current,
        { opacity: 0 },
        {
          opacity: 1, duration: 0.6, ease: "power2.out",
          scrollTrigger: { trigger: footerRef.current, start: "top 92%", toggleActions: "play none none none" },
        }
      );
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={footerRef}
      style={{
        borderTop: "1px solid var(--border)",
        padding: "var(--space-3xl) 0 var(--space-2xl)",
        opacity: 0,
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "start",
          flexWrap: "wrap",
          gap: "var(--space-2xl)",
        }}
      >
        <div style={{ maxWidth: "18rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "var(--space-sm)" }}>
            <div style={{
              width: 20,
              height: 20,
              borderRadius: 4,
              background: "var(--white)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M9 12l2 2 4-4" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span style={{
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: "var(--text-small)",
              color: "var(--white)",
            }}>
              Testimonial Machine
            </span>
          </div>
          <p style={{
            fontSize: "var(--text-small)",
            fontFamily: "var(--font-body)",
            color: "var(--text-muted)",
            lineHeight: "var(--leading-body)",
          }}>
            AI-powered testimonials that sound like your customers, not your marketing team.
          </p>
        </div>

        <div style={{ display: "flex", gap: "var(--space-4xl)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
            <p style={{
              fontSize: "var(--text-tiny)",
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "var(--tracking-wide)",
              marginBottom: "var(--space-xs)",
            }}>
              Product
            </p>
            {["How it works", "Features", "Pricing", "FAQ"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                style={{
                  fontSize: "var(--text-small)",
                  fontFamily: "var(--font-body)",
                  color: "var(--text-muted)",
                  transition: "color 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
              >
                {item}
              </a>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
            <p style={{
              fontSize: "var(--text-tiny)",
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "var(--tracking-wide)",
              marginBottom: "var(--space-xs)",
            }}>
              Legal
            </p>
            {["Privacy Policy", "Terms of Service"].map((item) => (
              <a
                key={item}
                href="#"
                style={{
                  fontSize: "var(--text-small)",
                  fontFamily: "var(--font-body)",
                  color: "var(--text-muted)",
                  transition: "color 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div
        className="container"
        style={{
          marginTop: "var(--space-2xl)",
          paddingTop: "var(--space-lg)",
          borderTop: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <p style={{
          fontSize: "var(--text-tiny)",
          fontFamily: "var(--font-body)",
          color: "var(--text-muted)",
        }}>
          &copy; {new Date().getFullYear()} Testimonial Machine.
        </p>
      </div>
    </footer>
  );
}
