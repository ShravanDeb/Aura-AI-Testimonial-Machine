"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    number: "01",
    title: "Share your link",
    description:
      "Send a branded page to your customer. Takes 30 seconds to set up.",
  },
  {
    number: "02",
    title: "AI does the interview",
    description:
      "A conversational agent asks smart follow-up questions and extracts the metrics that matter.",
  },
  {
    number: "03",
    title: "Embed the quote",
    description:
      "Get a polished testimonial in your customer's voice. One script tag to embed anywhere.",
  },
];

export default function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

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

      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        gsap.fromTo(
          card,
          { y: 40, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.7, delay: i * 0.12, ease: "power3.out",
            scrollTrigger: { trigger: card, start: "top 88%", toggleActions: "play none none none" },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="section"
      style={{ position: "relative", borderTop: "1px solid var(--border)" }}
    >
      <div className="container">
        <div ref={headingRef} style={{
          textAlign: "center",
          marginBottom: "var(--space-section)",
          opacity: 0,
          maxWidth: "40rem",
          marginInline: "auto",
        }}>
          <h2 style={{
            fontSize: "var(--text-h2)",
            color: "var(--white)",
            marginBottom: "var(--space-lg)",
          }}>
            How it works
          </h2>
          <p style={{
            fontSize: "var(--text-body)",
            fontFamily: "var(--font-body)",
            color: "var(--text-secondary)",
            maxWidth: "32ch",
            marginInline: "auto",
          }}>
            Three steps. No complex setup. No learning curve.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "var(--space-4xl)",
          maxWidth: "60rem",
          marginInline: "auto",
          alignItems: "start",
        }}>
          {steps.map((step, i) => (
            <div
              key={step.number}
              ref={(el) => { cardsRef.current[i] = el; }}
              style={{
                position: "relative",
                opacity: 0,
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-tiny)",
                fontWeight: 500,
                color: "var(--text-muted)",
                letterSpacing: "var(--tracking-wide)",
                textTransform: "uppercase",
                marginBottom: "var(--space-lg)",
              }}>
                Step {step.number}
              </span>
              <h3 style={{
                fontSize: "var(--text-h3)",
                fontWeight: 500,
                marginBottom: "var(--space-sm)",
                color: "var(--white)",
              }}>
                {step.title}
              </h3>
              <p style={{
                fontSize: "var(--text-body)",
                fontFamily: "var(--font-body)",
                color: "var(--text-secondary)",
                maxWidth: "28ch",
                lineHeight: "var(--leading-body)",
              }}>
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
