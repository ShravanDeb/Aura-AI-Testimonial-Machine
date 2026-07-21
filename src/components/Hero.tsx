"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

export default function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLParagraphElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(badgeRef.current, { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, 0.3);
      tl.fromTo(headlineRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, 0.45);
      tl.fromTo(subRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, 0.65);
      tl.fromTo(ctaRef.current, { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, 0.8);

      gsap.to(headlineRef.current, {
        y: -40,
        scrollTrigger: { trigger: sectionRef.current, start: "top top", end: "bottom top", scrub: 1 },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        overflow: "hidden",
        padding: "var(--space-section-lg) var(--space-lg) var(--space-section)",
      }}
    >
      <div style={{
        position: "relative",
        zIndex: 1,
        width: "100%",
        maxWidth: "52rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}>
        <p
          ref={badgeRef}
          style={{
            fontSize: "var(--text-small)",
            fontFamily: "var(--font-body)",
            fontWeight: 400,
            color: "var(--text-muted)",
            marginBottom: "var(--space-xl)",
            opacity: 0,
            letterSpacing: "var(--tracking-wide)",
            textTransform: "uppercase",
          }}
        >
          Free forever &middot; No credit card
        </p>

        <h1
          ref={headlineRef}
          style={{
            fontSize: "var(--text-hero)",
            lineHeight: "var(--leading-hero)",
            letterSpacing: "var(--tracking-hero)",
            fontWeight: 700,
            marginBottom: "var(--space-xl)",
            textWrap: "balance",
            color: "var(--white)",
            opacity: 0,
          }}
        >
          Customer quotes
          <br />
          that sell themselves
        </h1>

        <p
          ref={subRef}
          style={{
            fontSize: "var(--text-body-lg)",
            fontFamily: "var(--font-body)",
            lineHeight: 1.6,
            color: "var(--text-secondary)",
            maxWidth: "34ch",
            marginInline: "auto",
            marginBottom: "var(--space-2xl)",
            textAlign: "center",
            opacity: 0,
          }}
        >
          AI interviews your customers, writes a polished testimonial in their voice, and hands you one line of code to embed it anywhere.
        </p>

        <div
          ref={ctaRef}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "var(--space-md)",
            flexWrap: "wrap",
            opacity: 0,
          }}
        >
          <a
            href="#pricing"
            style={{
              padding: "0.75rem 1.75rem",
              fontSize: "var(--text-small)",
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              background: "var(--white)",
              color: "var(--bg)",
              borderRadius: "var(--radius-pill)",
              transition: "opacity 0.2s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
          >
            Get started free
          </a>
          <a
            href="#how-it-works"
            style={{
              padding: "0.75rem 1.75rem",
              fontSize: "var(--text-small)",
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              color: "var(--text-secondary)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-pill)",
              transition: "border-color 0.2s ease, color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--border-hover)";
              e.currentTarget.style.color = "var(--white)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            See how it works
          </a>
        </div>
      </div>
    </section>
  );
}
