"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function WhoBuiltIt() {
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
            start: "top 65%",
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
          maxWidth: "38rem",
          marginInline: "auto",
          opacity: 0,
        }}
      >
        <div
          style={{
            width: "3rem",
            height: "1px",
            background: "var(--border)",
            marginBottom: "var(--space-2xl)",
          }}
        />

        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-micro)",
            color: "var(--text-muted)",
            letterSpacing: "var(--tracking-wide)",
            textTransform: "uppercase",
            marginBottom: "var(--space-xl)",
          }}
        >
          Who built it
        </p>

        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "var(--text-h2)",
            lineHeight: "var(--leading-h2)",
            letterSpacing: "var(--tracking-h2)",
            color: "var(--white)",
            marginBottom: "var(--space-2xl)",
          }}
        >
          A small team that believes words matter.
        </p>

        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-body-lg)",
            lineHeight: "var(--leading-body)",
            color: "var(--text-secondary)",
            marginBottom: "var(--space-xl)",
          }}
        >
          We\u2019ve spent years watching businesses collect testimonials
          that sound nothing like their customers. Polished by marketers.
          Sanitized by legal. Stripped of personality.
        </p>

        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-body-lg)",
            lineHeight: "var(--leading-body)",
            color: "var(--text-secondary)",
            marginBottom: "var(--space-xl)",
          }}
        >
          We wanted to build something different. A tool that lets
          customers speak naturally \u2014 and preserves exactly what
          they said.
        </p>

        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-body-lg)",
            lineHeight: "var(--leading-body)",
            color: "var(--text-secondary)",
          }}
        >
          No templates. No form fields. No leading questions.
          Just a conversation. And the AI does the rest.
        </p>

        <div
          style={{
            marginTop: "var(--space-3xl)",
            paddingTop: "var(--space-xl)",
            borderTop: "1px solid var(--border)",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-micro)",
              color: "var(--text-muted)",
              letterSpacing: "var(--tracking-wide)",
            }}
          >
            We refuse to become another AI startup that prioritizes
            growth over craft.
          </p>
        </div>
      </div>
    </section>
  );
}
