"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const audiences = [
  {
    label: "Founder",
    raw: "your product helped us get our first 100 customers, really changed everything for us",
    polished:
      "This product was instrumental in acquiring our first 100 customers \u2014 a genuine turning point for our company.",
  },
  {
    label: "Agency",
    raw: "we use this for all our clients now, saves us hours of back and forth collecting quotes",
    polished:
      "We\u2019ve integrated this into every client workflow. The time savings alone justify the investment.",
  },
  {
    label: "SaaS",
    raw: "our nps score went up after we started using better testimonials on our landing page",
    polished:
      "Since implementing authentic testimonials, our NPS score has measurably improved across all cohorts.",
  },
  {
    label: "Healthcare",
    raw: "patients trust us more now that they can read real stories from other patients like them",
    polished:
      "Patient trust has deepened significantly \u2014 real stories from real patients speak louder than any marketing copy.",
  },
  {
    label: "Education",
    raw: "our students love sharing their experience, its so much easier now to get their words out",
    polished:
      "Students are eager to share their experiences. This tool makes capturing their authentic voices effortless.",
  },
  {
    label: "Ecommerce",
    raw: "conversion went up 23% after we added real customer quotes to our product pages",
    polished:
      "Product page conversions increased 23% after we replaced generic reviews with authentic customer testimonials.",
  },
];

export default function WhoItsBuiltFor() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const rawRef = useRef<HTMLParagraphElement>(null);
  const polishedRef = useRef<HTMLParagraphElement>(null);

  const handleSelect = useCallback(
    (index: number) => {
      if (index === activeIndex) return;

      // Fade out
      gsap.to([rawRef.current, polishedRef.current], {
        opacity: 0,
        y: -10,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          setActiveIndex(index);
          // Fade in after state update
          requestAnimationFrame(() => {
            gsap.fromTo(
              [rawRef.current, polishedRef.current],
              { opacity: 0, y: 10 },
              {
                opacity: 1,
                y: 0,
                duration: 0.5,
                ease: "power2.out",
                stagger: 0.1,
              }
            );
          });
        },
      });
    },
    [activeIndex]
  );

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

  const active = audiences[activeIndex];

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
          opacity: 0,
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
          Who it&apos;s built for
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "14rem 1fr",
            gap: "var(--space-4xl)",
            alignItems: "start",
          }}
        >
          {/* Audience tabs */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-xs)",
            }}
          >
            {audiences.map((a, i) => (
              <button
                key={a.label}
                onClick={() => handleSelect(i)}
                style={{
                  textAlign: "left",
                  fontFamily:
                    i === activeIndex
                      ? "var(--font-serif)"
                      : "var(--font-body)",
                  fontSize:
                    i === activeIndex
                      ? "var(--text-h3)"
                      : "var(--text-body)",
                  color:
                    i === activeIndex
                      ? "var(--white)"
                      : "var(--text-muted)",
                  padding: "var(--space-sm) var(--space-md)",
                  borderLeft:
                    i === activeIndex
                      ? "2px solid var(--white)"
                      : "2px solid transparent",
                  transition: "all 0.3s var(--ease-out)",
                }}
              >
                {a.label}
              </button>
            ))}
          </div>

          {/* Transformation display */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-2xl)",
              paddingTop: "var(--space-md)",
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--text-micro)",
                  color: "var(--text-muted)",
                  letterSpacing: "var(--tracking-wide)",
                  textTransform: "uppercase",
                  marginBottom: "var(--space-sm)",
                }}
              >
                They said
              </p>
              <p
                ref={rawRef}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--text-small)",
                  color: "var(--text-muted)",
                  lineHeight: 1.7,
                  maxWidth: "40ch",
                }}
              >
                &ldquo;{active.raw}&rdquo;
              </p>
            </div>

            <div>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--text-micro)",
                  color: "var(--text-muted)",
                  letterSpacing: "var(--tracking-wide)",
                  textTransform: "uppercase",
                  marginBottom: "var(--space-sm)",
                }}
              >
                We helped them say
              </p>
              <p
                ref={polishedRef}
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "var(--text-h3)",
                  lineHeight: "var(--leading-body)",
                  color: "var(--white)",
                  maxWidth: "38ch",
                }}
              >
                &ldquo;{active.polished}&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
