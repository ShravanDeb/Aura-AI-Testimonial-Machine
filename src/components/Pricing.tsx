"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Pricing() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            toggleActions: "play none none none",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        paddingBlock: "var(--space-section)",
        paddingInline: "var(--side-padding)",
      }}
    >
      <div
        ref={contentRef}
        style={{
          maxWidth: "var(--max-width)",
          marginInline: "auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "var(--space-4xl)",
          alignItems: "start",
          opacity: 0,
        }}
      >
        {/* Left — Statement */}
        <div>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "var(--text-display)",
              lineHeight: "var(--leading-display)",
              letterSpacing: "var(--tracking-display)",
              color: "var(--white)",
              marginBottom: "var(--space-xl)",
            }}
          >
            Simple pricing.
          </h2>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-body-lg)",
              lineHeight: "var(--leading-body)",
              color: "var(--text-secondary)",
              maxWidth: "30ch",
            }}
          >
            The AI is free. You only pay for the infrastructure.
          </p>
        </div>

        {/* Right — Options */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-lg)",
          }}
        >
          {/* Free */}
          <div
            style={{
              padding: "var(--space-xl)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: "var(--space-md)",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--text-micro)",
                  color: "var(--text-muted)",
                  letterSpacing: "var(--tracking-wide)",
                  textTransform: "uppercase",
                }}
              >
                Free
              </span>
              <span
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "var(--text-h2)",
                  color: "var(--white)",
                }}
              >
                $0
              </span>
            </div>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-small)",
                color: "var(--text-secondary)",
                lineHeight: 1.6,
                marginBottom: "var(--space-lg)",
              }}
            >
              10 testimonials per month. Everything you need to start.
            </p>
            <a
              href="/register"
              style={{
                display: "block",
                width: "100%",
                padding: "var(--space-sm) var(--space-lg)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-small)",
                color: "var(--text-primary)",
                textAlign: "center",
                transition: "all 0.2s var(--ease-out)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--border-hover)";
                e.currentTarget.style.background = "var(--bg-elevated)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              Get started
            </a>
          </div>

          {/* Growth */}
          <div
            style={{
              padding: "var(--space-xl)",
              border: "1px solid rgba(250, 250, 250, 0.15)",
              borderRadius: "12px",
              background: "var(--bg-subtle)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: "var(--space-md)",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--text-micro)",
                  color: "var(--text-muted)",
                  letterSpacing: "var(--tracking-wide)",
                  textTransform: "uppercase",
                }}
              >
                Growth
              </span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.2em" }}>
                <span
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "var(--text-h2)",
                    color: "var(--white)",
                  }}
                >
                  $29
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "var(--text-small)",
                    color: "var(--text-muted)",
                  }}
                >
                  /mo
                </span>
              </div>
            </div>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-small)",
                color: "var(--text-secondary)",
                lineHeight: 1.6,
                marginBottom: "var(--space-lg)",
              }}
            >
              100 testimonials per month. Custom branding, priority support.
            </p>
            <a
              href="/register"
              style={{
                display: "block",
                width: "100%",
                padding: "var(--space-sm) var(--space-lg)",
                border: "1px solid var(--white)",
                borderRadius: "8px",
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-small)",
                color: "var(--bg)",
                background: "var(--white)",
                textAlign: "center",
                transition: "all 0.2s var(--ease-out)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.9";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
            >
              Start free trial
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
