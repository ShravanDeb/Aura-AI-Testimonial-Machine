"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const transformations = [
  {
    raw: "your product is really good, it helped our team a lot with the daily stuff we do",
    polished:
      "This tool has fundamentally improved how our team operates on a daily basis.",
    why: "Removed filler. Replaced vague praise with specific impact.",
  },
  {
    raw: "idk i just think its cool that you can do all this with ai, never seen anything like it before",
    polished:
      "The AI capabilities here are unlike anything I\u2019ve encountered \u2014 genuinely innovative.",
    why: "Preserved the enthusiasm. Elevated the language.",
  },
  {
    raw: "we were skeptical at first but after using it for a month our customers love the testimonials",
    polished:
      "After a month of use, our customers consistently praise the testimonials \u2014 and so do we.",
    why: "Kept the honest skepticism. Made the conclusion stronger.",
  },
  {
    raw: "honestly this saved us so much time, we used to spend hours writing these ourselves",
    polished:
      "We\u2019ve reclaimed hours each week \u2014 time previously spent writing testimonials manually.",
    why: "Quantified the benefit. Removed the casual opener.",
  },
];

export default function RealTransformations() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      itemsRef.current.forEach((el) => {
        if (!el) return;

        gsap.fromTo(
          el,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          }
        );
      });
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
        style={{
          maxWidth: "var(--max-width)",
          marginInline: "auto",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-micro)",
            color: "var(--text-muted)",
            letterSpacing: "var(--tracking-wide)",
            textTransform: "uppercase",
            marginBottom: "var(--space-3xl)",
          }}
        >
          Real transformations
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-4xl)",
          }}
        >
          {transformations.map((t, i) => (
            <div
              key={i}
              ref={(el) => {
                if (el) itemsRef.current[i] = el;
              }}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "var(--space-4xl)",
                alignItems: "start",
                opacity: 0,
                paddingBottom: "var(--space-4xl)",
                borderBottom:
                  i < transformations.length - 1
                    ? "1px solid var(--border)"
                    : "none",
              }}
            >
              {/* Raw */}
              <div>
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--text-micro)",
                    color: "var(--text-muted)",
                    letterSpacing: "var(--tracking-wide)",
                    textTransform: "uppercase",
                    marginBottom: "var(--space-md)",
                  }}
                >
                  Customer said
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--text-small)",
                    color: "var(--text-muted)",
                    lineHeight: 1.7,
                    maxWidth: "35ch",
                  }}
                >
                  &ldquo;{t.raw}&rdquo;
                </p>
              </div>

              {/* Polished */}
              <div>
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--text-micro)",
                    color: "var(--text-muted)",
                    letterSpacing: "var(--tracking-wide)",
                    textTransform: "uppercase",
                    marginBottom: "var(--space-md)",
                  }}
                >
                  We helped them say
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "var(--text-h3)",
                    lineHeight: "var(--leading-body)",
                    color: "var(--white)",
                    maxWidth: "35ch",
                    marginBottom: "var(--space-lg)",
                  }}
                >
                  &ldquo;{t.polished}&rdquo;
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "var(--text-small)",
                    color: "var(--text-muted)",
                    lineHeight: 1.6,
                    fontStyle: "italic",
                  }}
                >
                  {t.why}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
