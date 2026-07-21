"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const paragraphs = [
  "Every founder knows their customers love their product.",
  "The problem is — most customers never learn how to express that feeling.",
  "So businesses lose hundreds of incredible stories every year.",
  "Not because customers didn\u2019t care.",
  "Because writing is difficult.",
  "Remembering is easy. Talking is easy. Answering questions is easy.",
  "We built AI Testimonial Machine to preserve people\u2019s authentic voice \u2014 not replace it.",
  "The goal is not to make testimonials sound artificial.",
  "The goal is to help people express what they already wanted to say.",
];

export default function WhyWeBuiltThis() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const paragraphsRef = useRef<HTMLParagraphElement[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      paragraphsRef.current.forEach((el, i) => {
        if (!el) return;

        gsap.fromTo(
          el,
          { opacity: 0, y: 25 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
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
          maxWidth: "38rem",
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
          Why we built this
        </p>

        {paragraphs.map((text, i) => (
          <p
            key={i}
            ref={(el) => {
              if (el) paragraphsRef.current[i] = el;
            }}
            style={{
              fontFamily: i < 6 ? "var(--font-body)" : "var(--font-serif)",
              fontSize: i < 6 ? "var(--text-body-lg)" : "var(--text-h3)",
              lineHeight: "var(--leading-body)",
              color: i < 6 ? "var(--text-secondary)" : "var(--text-primary)",
              marginBottom:
                i === 3 || i === 4
                  ? "var(--space-xs)"
                  : "var(--space-xl)",
              opacity: 0,
              fontStyle: i >= 6 ? "italic" : "normal",
            }}
          >
            {text}
          </p>
        ))}
      </div>
    </section>
  );
}
