"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useScrollLock } from "@/lib/scroll-lock";

export default function Opening() {
  const containerRef = useRef<HTMLDivElement>(null);
  const wordsRef = useRef<HTMLSpanElement[]>([]);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const { unlock } = useScrollLock();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.fromTo(
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
          delay: 0.3,
        }
      );

      if (indicatorRef.current) {
        tl.fromTo(
          indicatorRef.current,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
            onComplete: () => {
              unlock();
            },
          },
          "+=0.4"
        );

        gsap.to(indicatorRef.current.querySelector(".scroll-arrow"), {
          y: 6,
          duration: 1.2,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      }
    }, el);

    return () => {
      ctx.revert();
    };
  }, [unlock]);

  const words = ["They", "said."];

  return (
    <section
      ref={containerRef}
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingInline: "var(--side-padding)",
        overflow: "hidden",
        flexShrink: 0,
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

      <div
        ref={indicatorRef}
        style={{
          position: "absolute",
          bottom: "var(--space-2xl)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "var(--space-sm)",
          opacity: 0,
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-micro)",
            color: "var(--text-dim)",
            letterSpacing: "var(--tracking-wide)",
            textTransform: "uppercase",
          }}
        >
          Scroll to begin
        </p>
        <svg
          className="scroll-arrow"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          style={{ color: "var(--text-dim)" }}
        >
          <path
            d="M7 2v10M3 8l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </section>
  );
}
