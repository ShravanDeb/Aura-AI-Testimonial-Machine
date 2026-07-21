"use client";

import { useState, useRef } from "react";
import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const faqs = [
  {
    question: "How does the AI interview work?",
    answer:
      "Your customer opens a link and has a natural conversation with an AI agent. It asks about their experience, follows up on specifics, and detects when they mention metrics or emotions. The interview takes about 5 minutes.",
  },
  {
    question: "Does the testimonial sound like the customer?",
    answer:
      "Yes. The AI preserves their voice: contractions, pacing, tone. It does not rewrite their words into marketing copy. The output sounds like a polished version of what they actually said.",
  },
  {
    question: "What if the customer says something too salesy?",
    answer:
      "A second AI agent reads every testimonial for authenticity. It checks for generic phrases, exaggeration, and marketing buzzwords. If it fails, it sends feedback to the writer and asks for a rewrite, up to 3 times.",
  },
  {
    question: "Is it really free?",
    answer:
      "The AI models are free. The Starter plan is free forever and includes 10 testimonials per month. You only pay if you need more volume or advanced features like custom branding and analytics.",
  },
  {
    question: "Can I embed it on any website?",
    answer:
      "Yes. You get a single script tag that loads the widget asynchronously. It works on any site without slowing it down. You can customize colors, fonts, and layout to match your brand.",
  },
  {
    question: "What formats does the testimonial come in?",
    answer:
      "One interview produces six formats: website card, LinkedIn post, tweet, Instagram caption, case study snippet, and raw text. You can copy any format with one click.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

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

      gsap.fromTo(
        listRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.7, ease: "power3.out",
          scrollTrigger: { trigger: listRef.current, start: "top 88%", toggleActions: "play none none none" },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="faq"
      ref={sectionRef}
      className="section"
      style={{ position: "relative", borderTop: "1px solid var(--border)" }}
    >
      <div className="container-narrow">
        <div ref={headingRef} style={{
          textAlign: "center",
          marginBottom: "var(--space-section)",
          opacity: 0,
        }}>
          <h2 style={{
            fontSize: "var(--text-h2)",
            color: "var(--white)",
          }}>
            Frequently asked questions
          </h2>
        </div>

        <div
          ref={listRef}
          style={{
            display: "flex",
            flexDirection: "column",
            opacity: 0,
          }}
        >
          {faqs.map((faq, i) => (
            <div
              key={faq.question}
              style={{
                borderBottom: "1px solid var(--border)",
              }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "var(--space-lg) 0",
                  textAlign: "left",
                  fontSize: "var(--text-body)",
                  fontFamily: "var(--font-body)",
                  fontWeight: 400,
                  color: openIndex === i ? "var(--white)" : "var(--text-primary)",
                  transition: "color 0.15s ease",
                }}
              >
                {faq.question}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  style={{
                    color: "var(--text-muted)",
                    flexShrink: 0,
                    marginLeft: "var(--space-md)",
                    transform: openIndex === i ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <div
                style={{
                  display: "grid",
                  gridTemplateRows: openIndex === i ? "1fr" : "0fr",
                  transition: "grid-template-rows 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                <div style={{ overflow: "hidden" }}>
                  <p style={{
                    fontSize: "var(--text-body)",
                    fontFamily: "var(--font-body)",
                    lineHeight: "var(--leading-body)",
                    color: "var(--text-secondary)",
                    paddingBottom: "var(--space-lg)",
                    maxWidth: "50ch",
                  }}>
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
