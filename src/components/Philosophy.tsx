"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const statements = [
  "We don\u2019t create stories.",
  "We reveal them.",
];

export default function Philosophy() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<HTMLParagraphElement[]>([]);
  const secondRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // First statement
      gsap.fromTo(
        linesRef.current,
        { opacity: 0, y: 30, filter: "blur(4px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1,
          ease: "power3.out",
          stagger: 0.3,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 50%",
            toggleActions: "play none none none",
          },
        }
      );

      // Second statement
      if (secondRef.current) {
        gsap.fromTo(
          secondRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: secondRef.current,
              start: "top 70%",
              toggleActions: "play none none none",
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

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
      <div style={{ maxWidth: "48rem" }}>
        {statements.map((text, i) => (
          <p
            key={i}
            ref={(el) => {
              if (el) linesRef.current[i] = el;
            }}
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "var(--text-massive)",
              lineHeight: "var(--leading-massive)",
              letterSpacing: "var(--tracking-massive)",
              color: "var(--white)",
              opacity: 0,
              marginBottom: i === 0 ? "var(--space-md)" : 0,
            }}
          >
            {text}
          </p>
        ))}

        <div
          ref={secondRef}
          style={{
            marginTop: "var(--space-4xl)",
            opacity: 0,
          }}
        >
          <div
            style={{
              width: "3rem",
              height: "1px",
              background: "var(--border)",
              marginInline: "auto",
              marginBottom: "var(--space-xl)",
            }}
          />
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "var(--text-h3)",
              lineHeight: "var(--leading-body)",
              color: "var(--text-secondary)",
              fontStyle: "italic",
              maxWidth: "30ch",
              marginInline: "auto",
            }}
          >
            Good testimonials aren\u2019t written.
            <br />
            They\u2019re remembered.
          </p>
        </div>
      </div>
    </section>
  );
}
