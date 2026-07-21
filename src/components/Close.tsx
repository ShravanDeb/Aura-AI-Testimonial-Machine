"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Close() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const wordsRef = useRef<HTMLSpanElement[]>([]);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        wordsRef.current,
        {
          opacity: 0,
          y: 40,
          filter: "blur(8px)",
        },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1.2,
          ease: "power3.out",
          stagger: 0.15,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 60%",
            toggleActions: "play none none none",
          },
        }
      );

      gsap.fromTo(
        ctaRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          delay: 0.6,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 60%",
            toggleActions: "play none none none",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const words = ["They", "already", "said", "it."];

  return (
    <section
      ref={sectionRef}
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingInline: "var(--side-padding)",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "var(--text-massive)",
          lineHeight: "var(--leading-massive)",
          letterSpacing: "var(--tracking-massive)",
          fontWeight: 400,
          color: "var(--white)",
          marginBottom: "var(--space-3xl)",
        }}
      >
        {words.map((word, i) => (
          <span
            key={i}
            ref={(el) => {
              if (el) wordsRef.current[i] = el;
            }}
            style={{
              display: "inline-block",
              opacity: 0,
              marginRight: "0.25em",
            }}
          >
            {word}
          </span>
        ))}
      </h1>

      <div ref={ctaRef} style={{ opacity: 0 }}>
        <a
          href="/register"
          style={{
            display: "inline-block",
            padding: "var(--space-md) var(--space-2xl)",
            background: "var(--white)",
            color: "var(--bg)",
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-body)",
            fontWeight: 500,
            borderRadius: "8px",
            transition: "opacity 0.2s var(--ease-out)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.9";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
          }}
        >
          Start free
        </a>

        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-micro)",
            color: "var(--text-muted)",
            letterSpacing: "var(--tracking-wide)",
            marginTop: "var(--space-lg)",
          }}
        >
          No credit card required
        </p>
      </div>
    </section>
  );
}
