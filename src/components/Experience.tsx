"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import { useScrollLock } from "@/lib/scroll-lock";

type Scene = "q1" | "q2" | "q3" | "processing" | "reveal";

const QUESTIONS = [
  "What problem did your product solve?",
  "What changed after they started using it?",
  "What would they tell a friend?",
];

const PROCESSING_MESSAGES = [
  "Understanding your story\u2026",
  "Finding what mattered\u2026",
  "Preserving your voice\u2026",
];

const CASUAL_REPLACEMENTS: [RegExp, string][] = [
  [/\bidk\b/gi, ""],
  [/\bi guess\b/gi, ""],
  [/\bpretty cool\b/gi, "exceptional"],
  [/\bcool\b/gi, "remarkable"],
  [/\bnice\b/gi, "impressive"],
  [/\bbad\b/gi, "below expectations"],
  [/\bgood\b/gi, "excellent"],
  [/\bgreat\b/gi, "outstanding"],
  [/\bawesome\b/gi, "remarkable"],
  [/\bamazing\b/gi, "extraordinary"],
  [/\blove\b/gi, "appreciate"],
  [/\bkinda\b/gi, ""],
  [/\bsorta\b/gi, ""],
  [/\bthing\b/gi, "solution"],
  [/\bstuff\b/gi, ""],
  [/\breally\b/gi, "genuinely"],
  [/\bvery\b/gi, "exceptionally"],
  [/\bso\b/gi, ""],
  [/\bjust\b/gi, ""],
];

function polishText(raw: string): string {
  let text = raw.trim();
  if (!text) return "";
  CASUAL_REPLACEMENTS.forEach(([p, r]) => { text = text.replace(p, r); });
  text = text.replace(/\s+/g, " ").trim();
  text = text.replace(/[,;]{2,}/g, ".");
  text = text.replace(/\.{2,}/g, ".");
  text = text.replace(/^[a-z]/, (c) => c.toUpperCase());
  if (!/[.!?]$/.test(text)) text += ".";
  const words = text.split(" ");
  if (words.length <= 3) text = `${text.slice(0, -1)} \u2014 and it delivered.`;
  return text;
}

const SCENE_ORDER: Scene[] = ["q1", "q2", "q3", "processing", "reveal"];

const QUESTION_EXAMPLES: string[][] = [
  [
    "We save teachers hours every week",
    "We help cafés collect customer reviews",
    "We make hiring faster",
  ],
  [
    "Their revenue went up 40%",
    "They stopped losing customers to competitors",
    "Their team finally works together",
  ],
  [
    "You have to try this tool",
    "It changed how we do business",
    "Best investment we made this year",
  ],
];

export default function Experience() {
  const [scene, setScene] = useState<Scene>("q1");
  const [answers, setAnswers] = useState<string[]>(["", "", ""]);
  const [currentInput, setCurrentInput] = useState("");
  const [polishedWords, setPolishedWords] = useState<string[]>([]);

  const { lock, unlock } = useScrollLock();

  const sectionRef = useRef<HTMLDivElement>(null);
  const hiddenInputRef = useRef<HTMLTextAreaElement>(null);

  const q1Ref = useRef<HTMLDivElement>(null);
  const q2Ref = useRef<HTMLDivElement>(null);
  const q3Ref = useRef<HTMLDivElement>(null);
  const processingRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);

  const q1TextRef = useRef<HTMLSpanElement>(null);
  const q2TextRef = useRef<HTMLSpanElement>(null);
  const q3TextRef = useRef<HTMLSpanElement>(null);

  const q1TypedRef = useRef<HTMLParagraphElement>(null);
  const q2TypedRef = useRef<HTMLParagraphElement>(null);
  const q3TypedRef = useRef<HTMLParagraphElement>(null);

  const q1CursorRef = useRef<HTMLSpanElement>(null);
  const q2CursorRef = useRef<HTMLSpanElement>(null);
  const q3CursorRef = useRef<HTMLSpanElement>(null);

  const q1ExamplesRef = useRef<HTMLDivElement>(null);
  const q2ExamplesRef = useRef<HTMLDivElement>(null);
  const q3ExamplesRef = useRef<HTMLDivElement>(null);

  const procMsgRef = useRef<HTMLParagraphElement>(null);
  const revealLabelRef = useRef<HTMLParagraphElement>(null);
  const revealQuoteRef = useRef<HTMLParagraphElement>(null);
  const reflection1Ref = useRef<HTMLDivElement>(null);
  const reflection2Ref = useRef<HTMLDivElement>(null);

  const inputLocked = useRef(false);
  const hasInitialized = useRef(false);

  const sceneRefMap: Record<Scene, React.RefObject<HTMLDivElement | null>> = {
    q1: q1Ref, q2: q2Ref, q3: q3Ref, processing: processingRef, reveal: revealRef,
  };

  const qTextMap: Record<"q1"|"q2"|"q3", React.RefObject<HTMLSpanElement | null>> = {
    q1: q1TextRef, q2: q2TextRef, q3: q3TextRef,
  };

  const typedMap: Record<"q1"|"q2"|"q3", React.RefObject<HTMLParagraphElement | null>> = {
    q1: q1TypedRef, q2: q2TypedRef, q3: q3TypedRef,
  };

  const cursorMap: Record<"q1"|"q2"|"q3", React.RefObject<HTMLSpanElement | null>> = {
    q1: q1CursorRef, q2: q2CursorRef, q3: q3CursorRef,
  };

  const examplesMap: Record<"q1"|"q2"|"q3", React.RefObject<HTMLDivElement | null>> = {
    q1: q1ExamplesRef, q2: q2ExamplesRef, q3: q3ExamplesRef,
  };

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const checkPosition = () => {
      if (hasInitialized.current) return;
      const rect = section.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.05) {
        hasInitialized.current = true;
        lock();
        startQuestionScene("q1");
      }
    };

    window.addEventListener("scroll", checkPosition, { passive: true });
    checkPosition();
    return () => window.removeEventListener("scroll", checkPosition);
  }, []);

  const typewrite = useCallback(
    (el: HTMLSpanElement | null, text: string, speed: number, onComplete?: () => void) => {
      if (!el) return;
      el.textContent = "";
      gsap.to({ val: 0 }, {
        val: text.length,
        duration: text.length * speed,
        ease: "none",
        onUpdate: function () {
          const count = Math.floor(this.targets()[0].val);
          el.textContent = text.slice(0, count);
        },
        onComplete,
      });
    },
    []
  );

  const startQuestionScene = useCallback(
    (s: "q1" | "q2" | "q3") => {
      const sceneEl = sceneRefMap[s].current;
      const textEl = qTextMap[s].current;
      if (!sceneEl || !textEl) return;

      setCurrentInput("");
      inputLocked.current = false;

      gsap.fromTo(sceneEl, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" });

      const qIndex = s === "q1" ? 0 : s === "q2" ? 1 : 2;
      setTimeout(() => {
        typewrite(textEl, QUESTIONS[qIndex], 0.04, () => {
          const cursorEl = cursorMap[s].current;
          if (cursorEl) {
            gsap.set(cursorEl, { opacity: 1 });
            gsap.to(cursorEl, { opacity: 0, duration: 0.5, repeat: -1, yoyo: true, ease: "steps(1)" });
          }

          hiddenInputRef.current?.focus();

          const examplesEl = examplesMap[s].current;
          if (examplesEl) {
            const exampleEls = examplesEl.querySelectorAll(".q-example");
            const exampleTexts = QUESTION_EXAMPLES[qIndex];
            const tl = gsap.timeline({ delay: 0.15 });

            exampleEls.forEach((el, i) => {
              const textSpan = el.querySelector(".q-example-text");
              if (!textSpan || !textSpan.parentNode) return;

              tl.call(() => {
                (textSpan as HTMLElement).textContent = "";
                gsap.set(el, { opacity: 1 });
              });
              tl.to({ val: 0 }, {
                val: exampleTexts[i].length,
                duration: exampleTexts[i].length * 0.025,
                ease: "none",
                onUpdate: function () {
                  const count = Math.floor(this.targets()[0].val);
                  (textSpan as HTMLElement).textContent = exampleTexts[i].slice(0, count);
                },
              });
              tl.to({}, { duration: 0.15 });
            });
          }
        });
      }, 400);
    },
    [typewrite]
  );

  const transitionTo = useCallback(
    (from: Scene, to: Scene, onComplete?: () => void) => {
      const fromEl = sceneRefMap[from].current;
      const toEl = sceneRefMap[to].current;
      if (!fromEl || !toEl) return;

      const tl = gsap.timeline({
        onComplete: () => {
          setScene(to);
          onComplete?.();
        },
      });

      tl.to(fromEl, { opacity: 0, y: -60, duration: 0.7, ease: "power2.in" });
      gsap.set(toEl, { opacity: 0, y: 60 });
      tl.to(toEl, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, "-=0.2");
    },
    []
  );

  const startReveal = useCallback(() => {
    const tl = gsap.timeline({ onComplete: () => { unlock(); } });

    if (revealLabelRef.current) {
      tl.fromTo(revealLabelRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "power2.out" }, 0.3);
    }

    if (revealQuoteRef.current) {
      tl.fromTo(revealQuoteRef.current, { opacity: 0, y: 20, filter: "blur(10px)" }, {
        opacity: 1, y: 0, filter: "blur(0px)", duration: 1.4, ease: "power3.out",
      }, 0.5);
    }

    tl.to({}, { duration: 1.5 });

    if (reflection1Ref.current) {
      tl.fromTo(reflection1Ref.current, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 1, ease: "power2.out" }, "-=0.3");
    }

    tl.to({}, { duration: 1.5 });

    if (reflection2Ref.current) {
      tl.fromTo(reflection2Ref.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 1, ease: "power2.out" });
    }

    tl.to({}, { duration: 1 });
  }, [unlock]);

  const runProcessing = useCallback(
    (allAnswers: string[]) => {
      if (!procMsgRef.current) return;

      const tl = gsap.timeline();

      PROCESSING_MESSAGES.forEach((msg) => {
        tl.call(() => { if (procMsgRef.current) procMsgRef.current.textContent = msg; });
        tl.fromTo(procMsgRef.current!, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" });
        tl.to({}, { duration: 0.2 });
        tl.to(procMsgRef.current!, { opacity: 0, y: -10, duration: 0.2, ease: "power2.in" });
      });

      const combined = allAnswers.join(". ");

      tl.call(async () => {
        try {
          const res = await fetch("/api/polish", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: combined }),
          });
          const data = await res.json();
          setPolishedWords((data.polished || polishText(combined)).split(" "));
        } catch {
          setPolishedWords(polishText(combined).split(" "));
        }
        transitionTo("processing", "reveal", () => { startReveal(); });
      });
    },
    [transitionTo, startReveal]
  );

  const submitAnswer = useCallback((textOverride?: string) => {
    if (inputLocked.current) return;
    const text = (textOverride ?? currentInput).trim();
    if (!text) return;
    inputLocked.current = true;

    const qKey = scene as "q1" | "q2" | "q3";
    const cursorEl = cursorMap[qKey].current;
    if (cursorEl) {
      gsap.killTweensOf(cursorEl);
      gsap.set(cursorEl, { opacity: 0 });
    }

    const qIndex = scene === "q1" ? 0 : scene === "q2" ? 1 : 2;
    const newAnswers = [...answers];
    newAnswers[qIndex] = text;
    setAnswers(newAnswers);

    const nextScene = SCENE_ORDER[qIndex + 1];

    if (nextScene === "processing") {
      transitionTo(scene, "processing", () => {
        runProcessing(newAnswers);
      });
    } else {
      transitionTo(scene, nextScene, () => {
        startQuestionScene(nextScene as "q1" | "q2" | "q3");
      });
    }
  }, [currentInput, answers, scene, transitionTo, startQuestionScene, runProcessing]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (scene === "q1" || scene === "q2" || scene === "q3") {
          submitAnswer();
        }
      }
    },
    [scene, submitAnswer]
  );

  useEffect(() => {
    const isInputScene = scene === "q1" || scene === "q2" || scene === "q3";
    if (!isInputScene) return;
    const qKey = scene as "q1" | "q2" | "q3";
    const typedEl = typedMap[qKey].current;
    if (!typedEl) return;
    const cursorEl = cursorMap[qKey].current;
    const textNode = typedEl.childNodes[0];
    if (textNode && textNode.nodeType === Node.TEXT_NODE) {
      textNode.textContent = currentInput;
    } else {
      typedEl.insertBefore(document.createTextNode(currentInput), typedEl.firstChild);
    }
  }, [currentInput, scene]);

  const handleContainerClick = useCallback(() => {
    hiddenInputRef.current?.focus();
  }, []);

  const isInputScene = scene === "q1" || scene === "q2" || scene === "q3";

  const handleExampleClick = useCallback((text: string) => {
    setCurrentInput(text);
    submitAnswer(text);
  }, [submitAnswer]);

  function renderQuestionScene(
    s: "q1" | "q2" | "q3",
    num: number,
    sceneRef: React.RefObject<HTMLDivElement | null>,
    textRef: React.RefObject<HTMLSpanElement | null>,
    typedRef: React.RefObject<HTMLParagraphElement | null>,
    cursorRef: React.RefObject<HTMLSpanElement | null>,
    examplesRef: React.RefObject<HTMLDivElement | null>
  ) {
    const isActive = scene === s;
    return (
      <div
        ref={sceneRef}
        onClick={handleContainerClick}
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingInline: "var(--side-padding)",
          opacity: 0,
          pointerEvents: isActive ? "auto" : "none",
          cursor: isActive && !inputLocked.current ? "text" : "default",
        }}
      >
        <div style={{ maxWidth: "40rem", width: "100%" }}>
          <p style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-micro)",
            color: "var(--text-dim)",
            letterSpacing: "var(--tracking-wide)",
            textTransform: "uppercase",
            marginBottom: "var(--space-2xl)",
          }}>
            Question {num} of 3
          </p>

          <div style={{ marginBottom: "var(--space-3xl)", minHeight: "3em" }}>
            <p style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              color: "var(--white)",
            }}>
              <span ref={textRef} />
            </p>
          </div>

          <div style={{ minHeight: "4em" }}>
            <p
              ref={typedRef}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-body-lg)",
                lineHeight: 1.6,
                color: "var(--text-secondary)",
                maxWidth: "36ch",
                display: "inline",
              }}
            >
              {isActive && !inputLocked.current && (
                <span
                  ref={cursorRef}
                  style={{
                    display: "inline-block",
                    width: "2px",
                    height: "1em",
                    background: "var(--text-muted)",
                    verticalAlign: "text-bottom",
                    marginLeft: "1px",
                    opacity: 0,
                  }}
                />
              )}
            </p>
          </div>

          <div
            ref={examplesRef}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-xs)",
              marginTop: "var(--space-xl)",
            }}
          >
            {QUESTION_EXAMPLES[num - 1].map((ex, i) => (
              <button
                key={i}
                className="q-example"
                onClick={(e) => {
                  e.stopPropagation();
                  handleExampleClick(ex);
                }}
                style={{
                  opacity: 0,
                  textAlign: "left",
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--text-small)",
                  color: "var(--text-muted)",
                  padding: "var(--space-sm) var(--space-md)",
                  borderLeft: "2px solid var(--border)",
                  transition: "border-color 0.2s var(--ease-out), color 0.2s var(--ease-out), padding-left 0.2s var(--ease-out)",
                  lineHeight: 1.5,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--white)";
                  e.currentTarget.style.color = "var(--text-secondary)";
                  e.currentTarget.style.paddingLeft = "var(--space-lg)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.color = "var(--text-muted)";
                  e.currentTarget.style.paddingLeft = "var(--space-md)";
                }}
              >
                <span className="q-example-text" />
              </button>
            ))}
          </div>

          {isActive && (
            <p style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-micro)",
              color: "var(--text-dim)",
              letterSpacing: "var(--tracking-wide)",
              marginTop: "var(--space-2xl)",
            }}>
              Press Enter to continue
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <section
      ref={sectionRef}
      style={{
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <textarea
        ref={hiddenInputRef}
        value={currentInput}
        onChange={(e) => { if (!inputLocked.current) setCurrentInput(e.target.value); }}
        onKeyDown={handleKeyDown}
        aria-label="Your answer"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          opacity: 0,
          width: 0,
          height: 0,
          padding: 0,
          border: "none",
          resize: "none",
        }}
        tabIndex={0}
      />

      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        {renderQuestionScene("q1", 1, q1Ref, q1TextRef, q1TypedRef, q1CursorRef, q1ExamplesRef)}
        {renderQuestionScene("q2", 2, q2Ref, q2TextRef, q2TypedRef, q2CursorRef, q2ExamplesRef)}
        {renderQuestionScene("q3", 3, q3Ref, q3TextRef, q3TypedRef, q3CursorRef, q3ExamplesRef)}

        <div
          ref={processingRef}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            paddingInline: "var(--side-padding)",
            opacity: 0,
            pointerEvents: "none",
          }}
        >
          <p
            ref={procMsgRef}
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)",
              lineHeight: 1.4,
              color: "var(--text-secondary)",
              fontStyle: "italic",
              textAlign: "center",
              maxWidth: "30ch",
            }}
          />
        </div>

        <div
          ref={revealRef}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            paddingInline: "var(--side-padding)",
            opacity: 0,
            pointerEvents: "none",
          }}
        >
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "var(--space-3xl)",
            textAlign: "center",
            maxWidth: "40rem",
          }}>
            <p
              ref={revealLabelRef}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-micro)",
                color: "var(--text-muted)",
                letterSpacing: "var(--tracking-wide)",
                textTransform: "uppercase",
                opacity: 0,
              }}
            >
              Your customers said
            </p>

            <p
              ref={revealQuoteRef}
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
                lineHeight: 1.35,
                letterSpacing: "-0.01em",
                color: "var(--white)",
                maxWidth: "32ch",
                fontStyle: "italic",
                opacity: 0,
              }}
            >
              &ldquo;{polishedWords.join(" ")}&rdquo;
            </p>

            <div ref={reflection1Ref} style={{ opacity: 0 }}>
              <div style={{
                width: "3rem",
                height: "1px",
                background: "var(--border)",
                marginInline: "auto",
                marginBottom: "var(--space-xl)",
              }} />
              <p style={{
                fontFamily: "var(--font-serif)",
                fontSize: "var(--text-body-lg)",
                lineHeight: 1.5,
                color: "var(--text-secondary)",
                fontStyle: "italic",
                maxWidth: "28ch",
              }}>
                The first testimonial isn&apos;t your customer&apos;s.
                <br />
                It&apos;s yours.
              </p>
            </div>

            <div ref={reflection2Ref} style={{ opacity: 0 }}>
              <p style={{
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-body-lg)",
                color: "var(--text-muted)",
                lineHeight: 1.6,
              }}>
                Now imagine every customer experiencing this.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
