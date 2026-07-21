"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    title: "Adaptive interview",
    description:
      "The AI detects emotion, follows up on specifics, and asks for numbers when it senses a story hiding in the details.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
  },
  {
    title: "Voice-preserved writing",
    description:
      "The testimonial sounds like your customer, not like a marketing team rewrote it. Contractions, pacing, and tone stay intact.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 00-3 3v4a3 3 0 006 0V5a3 3 0 00-3-3z" />
        <path d="M19 10v1a7 7 0 01-14 0v-1M12 18v4M9 22h6" />
      </svg>
    ),
  },
  {
    title: "Authenticity check",
    description:
      "A second AI reads the output for salesy language, generic phrases, and exaggeration. Fails get rewritten up to 3 times.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Multi-format output",
    description:
      "One interview, six formats: website card, LinkedIn post, tweet, Instagram caption, case study snippet, and raw text.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    title: "One-line embed",
    description:
      "Paste a script tag. The widget loads async, respects your brand, and works on any site without slowing it down.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
];

export default function Features() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headingRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.7, ease: "power3.out",
          scrollTrigger: { trigger: headingRef.current, start: "top 85%", toggleActions: "play none none none" },
        }
      );

      rowsRef.current.forEach((row, i) => {
        if (!row) return;
        gsap.fromTo(
          row,
          { y: 30, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.6, delay: i * 0.08, ease: "power3.out",
            scrollTrigger: { trigger: row, start: "top 90%", toggleActions: "play none none none" },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="features"
      ref={sectionRef}
      className="section"
      style={{ position: "relative", borderTop: "1px solid var(--border)" }}
    >
      <div className="container">
        <div ref={headingRef} style={{
          marginBottom: "var(--space-section)",
          opacity: 0,
        }}>
          <h2 style={{
            fontSize: "var(--text-h2)",
            color: "var(--white)",
            marginBottom: "var(--space-md)",
          }}>
            What you get
          </h2>
          <p style={{
            fontSize: "var(--text-body)",
            fontFamily: "var(--font-body)",
            color: "var(--text-secondary)",
            maxWidth: "38ch",
          }}>
            Every testimonial goes through 4 AI agents. Each one has a job.
            None of them are filler.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1px",
          maxWidth: "60rem",
          backgroundColor: "var(--border)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
        }}>
          {features.map((feature, i) => (
            <div
              key={feature.title}
              ref={(el) => { rowsRef.current[i] = el; }}
              style={{
                padding: "var(--space-2xl) var(--space-xl)",
                backgroundColor: "var(--bg)",
                opacity: 0,
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-sm)",
                transition: "background-color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--bg-subtle)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--bg)";
              }}
            >
              <div style={{
                color: "var(--text-muted)",
                marginBottom: "var(--space-xs)",
              }}>
                {feature.icon}
              </div>
              <h3 style={{
                fontSize: "var(--text-body)",
                fontWeight: 500,
                color: "var(--white)",
                marginBottom: "var(--space-xs)",
              }}>
                {feature.title}
              </h3>
              <p style={{
                fontSize: "var(--text-small)",
                fontFamily: "var(--font-body)",
                color: "var(--text-secondary)",
                lineHeight: "var(--leading-body)",
                maxWidth: "36ch",
              }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
