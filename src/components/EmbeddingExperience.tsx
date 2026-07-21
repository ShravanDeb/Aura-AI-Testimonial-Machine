"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  { number: "01", label: "Collect", description: "Share a link. Customers answer three questions." },
  { number: "02", label: "Approve", description: "Review the AI-polished testimonial. Edit if you want." },
  { number: "03", label: "Embed", description: "One line of code. Works on any website." },
  { number: "04", label: "Done.", description: "Authentic social proof. Live in minutes." },
];

const sampleTestimonial =
  "Testimonial Machine turned our customer\u2019s casual feedback into the most convincing quote on our landing page.";

export default function EmbeddingExperience() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement[]>([]);

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

      stepsRef.current.forEach((el) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { opacity: 0, x: -20 },
          {
            opacity: 1,
            x: 0,
            duration: 0.6,
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
          How it works
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "var(--space-4xl)",
            alignItems: "start",
          }}
        >
          {/* Steps */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-2xl)",
            }}
          >
            {steps.map((step, i) => (
              <div
                key={step.number}
                ref={(el) => {
                  if (el) stepsRef.current[i] = el;
                }}
                style={{
                  display: "grid",
                  gridTemplateColumns: "3rem 1fr",
                  gap: "var(--space-lg)",
                  alignItems: "start",
                  opacity: 0,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--text-micro)",
                    color: "var(--text-muted)",
                    letterSpacing: "var(--tracking-wide)",
                    paddingTop: "0.15em",
                  }}
                >
                  {step.number}
                </span>
                <div>
                  <p
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "var(--text-h3)",
                      color: "var(--white)",
                      marginBottom: "var(--space-xs)",
                    }}
                  >
                    {step.label}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "var(--text-small)",
                      color: "var(--text-muted)",
                      lineHeight: 1.6,
                    }}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Live preview */}
          <div
            ref={previewRef}
            style={{
              border: "1px solid var(--border)",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            {/* Browser chrome */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-sm)",
                padding: "var(--space-md) var(--space-lg)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                }}
              >
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: "var(--text-dim)",
                  }}
                />
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: "var(--text-dim)",
                  }}
                />
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: "var(--text-dim)",
                  }}
                />
              </div>
              <div
                style={{
                  flex: 1,
                  padding: "4px var(--space-md)",
                  background: "var(--bg-subtle)",
                  borderRadius: "6px",
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--text-micro)",
                  color: "var(--text-muted)",
                }}
              >
                yourwebsite.com
              </div>
            </div>

            {/* Preview content */}
            <div
              style={{
                padding: "var(--space-3xl) var(--space-2xl)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                gap: "var(--space-xl)",
                minHeight: "18rem",
                justifyContent: "center",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-micro)",
                  color: "var(--text-muted)",
                  letterSpacing: "var(--tracking-wide)",
                  textTransform: "uppercase",
                }}
              >
                Live on your site
              </p>

              <div
                style={{
                  width: "2.5rem",
                  height: "1px",
                  background: "var(--border)",
                }}
              />

              <p
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "var(--text-h3)",
                  lineHeight: "var(--leading-body)",
                  color: "var(--white)",
                  maxWidth: "28ch",
                  fontStyle: "italic",
                }}
              >
                &ldquo;{sampleTestimonial}&rdquo;
              </p>

              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-small)",
                  color: "var(--text-muted)",
                }}
              >
                \u2014 Sarah Chen, Head of Marketing
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "var(--space-xs)",
                  marginTop: "var(--space-md)",
                }}
              >
                {[1, 2, 3, 4, 5].map((i) => (
                  <span
                    key={i}
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "var(--text-body)",
                      color:
                        i <= 4
                          ? "var(--text-secondary)"
                          : "var(--text-dim)",
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
