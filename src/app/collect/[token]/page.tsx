"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";

interface Option {
  id: string;
  text: string;
}

interface InterviewState {
  status: "loading" | "intro" | "collecting_info" | "interview" | "processing" | "done" | "error";
  question: string;
  options: Option[];
  completeness: number;
  round: number;
  selectedOption: string | null;
  customAnswer: string;
  showCustomInput: boolean;
  error: string;
  companyName: string;
  polished: string;
  companyId: string;
  sessionSlug: string;
  sessionId: string;
  customerName: string;
  customerEmail: string;
}

export default function CollectPage() {
  const params = useParams();
  const slug = params.token as string;

  const [state, setState] = useState<InterviewState>({
    status: "loading",
    question: "",
    options: [],
    completeness: 0,
    round: 0,
    selectedOption: null,
    customAnswer: "",
    showCustomInput: false,
    error: "",
    companyName: "",
    polished: "",
    companyId: "",
    sessionSlug: "",
    sessionId: "",
    customerName: "",
    customerEmail: "",
  });

  const [messages, setMessages] = useState<
    Array<{ role: "assistant"; question: string; options: Option[] } | { role: "user"; answer: string }>
  >([]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch company/session data on mount
  useEffect(() => {
    if (!slug) {
      setState((s) => ({ ...s, status: "error", error: "Invalid link" }));
      return;
    }

    async function loadSession() {
      try {
        const res = await fetch(`/api/sessions?slug=${slug}`);
        if (!res.ok) {
          setState((s) => ({ ...s, status: "error", error: "Session not found" }));
          return;
        }
        const data = await res.json();

        if (data.type === "session" && data.status === "active") {
          // Already has an active session — resume it
          setState((s) => ({
            ...s,
            status: "interview",
            companyName: data.company_name || "this company",
            sessionSlug: data.slug,
          }));
        } else if (data.type === "company") {
          // Company found, no session yet — show intro
          setState((s) => ({
            ...s,
            status: "intro",
            companyName: data.company_name || "this company",
            companyId: data.companyId,
          }));
        } else {
          setState((s) => ({ ...s, status: "error", error: "Link is no longer active" }));
        }
      } catch {
        setState((s) => ({ ...s, status: "error", error: "Failed to load" }));
      }
    }

    loadSession();
  }, [slug]);

  const handleGetStarted = useCallback(() => {
    setState((s) => ({ ...s, status: "collecting_info" }));
  }, []);

  const createSessionAndStart = useCallback(async () => {
    const name = state.customerName.trim();
    if (!name) return;

    setState((s) => ({ ...s, status: "interview" }));

    try {
      // Create a new session
      const createRes = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: state.companyId,
          customerName: name,
          customerEmail: state.customerEmail.trim(),
        }),
      });

      if (!createRes.ok) throw new Error("Failed to create session");
      const { sessionId: newSessionId, slug: newSlug } = await createRes.json();

      setState((s) => ({ ...s, sessionSlug: newSlug, sessionId: newSessionId }));

      // Start the interview
      const startRes = await fetch(`/api/sessions/${newSlug}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start", sessionId: newSessionId }),
      });

      if (!startRes.ok) throw new Error("Failed to start interview");
      const data = await startRes.json();

      if (data.status === "interview_complete") {
        setState((s) => ({ ...s, status: "processing", completeness: 100 }));
        return;
      }

      setState((s) => ({
        ...s,
        question: data.question,
        options: data.options,
        completeness: data.completeness,
        round: data.round || 1,
        selectedOption: null,
        customAnswer: "",
        showCustomInput: false,
      }));

      setMessages([
        { role: "assistant", question: data.question, options: data.options },
      ]);
    } catch {
      setState((s) => ({
        ...s,
        status: "error",
        error: "Failed to start interview. Please try again.",
      }));
    }
  }, [state.companyId, state.customerName, state.customerEmail]);

  const selectOption = useCallback(
    (optionId: string) => {
      const option = state.options.find((o) => o.id === optionId);
      if (!option) return;

      if (optionId === "e") {
        setState((s) => ({ ...s, showCustomInput: true, selectedOption: optionId }));
        return;
      }

      setState((s) => ({ ...s, selectedOption: optionId }));
    },
    [state.options]
  );

  const submitAnswer = useCallback(async () => {
    let answer = "";
    let selectedOptionId = state.selectedOption;

    if (state.showCustomInput) {
      answer = state.customAnswer.trim();
      if (!answer) return;
      selectedOptionId = "e";
    } else if (state.selectedOption) {
      const option = state.options.find((o) => o.id === state.selectedOption);
      answer = option?.text || "";
    } else {
      return;
    }

    setMessages((prev) => [...prev, { role: "user", answer }]);

    setState((s) => ({
      ...s,
      selectedOption: null,
      customAnswer: "",
      showCustomInput: false,
      question: "",
      options: [],
    }));

    try {
      const res = await fetch(`/api/sessions/${state.sessionSlug}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "answer", answer, selectedOptionId, sessionId: state.sessionId }),
      });

      if (!res.ok) throw new Error("Failed to process answer");

      const data = await res.json();

      if (data.status === "interview_complete") {
        setState((s) => ({ ...s, status: "processing", completeness: 100 }));
        setTimeout(() => {
          setState((s) => ({ ...s, status: "done" }));
        }, 3000);
        return;
      }

      setState((s) => ({
        ...s,
        question: data.question,
        options: data.options,
        completeness: data.completeness,
        round: data.round || s.round + 1,
      }));

      setMessages((prev) => [
        ...prev,
        { role: "assistant", question: data.question, options: data.options },
      ]);
    } catch {
      setState((s) => ({
        ...s,
        status: "error",
        error: "Something went wrong. Please try again.",
      }));
    }
  }, [state.sessionSlug, state.sessionId, state.selectedOption, state.options, state.showCustomInput, state.customAnswer]);

  // ── Render ──────────────────────────────────────────────────────────────────

  if (state.status === "error") {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: "center", maxWidth: "32rem" }}>
          <p style={headingStyle}>{state.error}</p>
          <p style={mutedStyle}>
            If you believe this is a mistake, please contact the person who
            shared this link.
          </p>
        </div>
      </div>
    );
  }

  if (state.status === "loading") {
    return (
      <div style={containerStyle}>
        <p style={mutedStyle}>Loading...</p>
      </div>
    );
  }

  if (state.status === "intro") {
    return (
      <div style={containerStyle}>
        <div style={{ maxWidth: "40rem", width: "100%" }}>
          <p style={labelStyle}>Interview</p>
          <h1 style={headingStyle}>
            We&apos;d love to hear
            <br />
            about your experience with {state.companyName}.
          </h1>
          <p style={{ ...bodyStyle, marginBottom: "var(--space-2xl)", maxWidth: "30rem" }}>
            A few quick questions. Takes about 2 minutes. Your words will be
            polished by AI and shared with your permission.
          </p>
          <button onClick={handleGetStarted} style={primaryButtonStyle}>
            Get started
          </button>
        </div>
      </div>
    );
  }

  if (state.status === "collecting_info") {
    return (
      <div style={containerStyle}>
        <div style={{ maxWidth: "40rem", width: "100%" }}>
          <p style={labelStyle}>Before we begin</p>
          <h1 style={{ ...headingStyle, fontSize: "var(--text-h3)" }}>
            A couple quick details
          </h1>
          <p style={{ ...bodyStyle, marginBottom: "var(--space-2xl)", maxWidth: "30rem" }}>
            We need your name so we can attribute the testimonial to you.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
            <div>
              <label style={fieldLabelStyle}>Your name *</label>
              <input
                type="text"
                value={state.customerName}
                onChange={(e) => setState((s) => ({ ...s, customerName: e.target.value }))}
                placeholder="Jane Smith"
                style={inputStyle}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && state.customerName.trim()) {
                    createSessionAndStart();
                  }
                }}
              />
            </div>
            <div>
              <label style={fieldLabelStyle}>Email (optional)</label>
              <input
                type="email"
                value={state.customerEmail}
                onChange={(e) => setState((s) => ({ ...s, customerEmail: e.target.value }))}
                placeholder="jane@company.com"
                style={inputStyle}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && state.customerName.trim()) {
                    createSessionAndStart();
                  }
                }}
              />
            </div>
            <button
              onClick={createSessionAndStart}
              disabled={!state.customerName.trim()}
              style={{
                ...primaryButtonStyle,
                opacity: state.customerName.trim() ? 1 : 0.4,
                cursor: state.customerName.trim() ? "pointer" : "not-allowed",
              }}
            >
              Start interview
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Processing / Done
  if (state.status === "processing" || state.status === "done") {
    return (
      <div style={containerStyle}>
        <div style={{ maxWidth: "40rem", width: "100%" }}>
          {state.status === "processing" ? (
            <div style={{ textAlign: "center" }}>
              <p style={headingStyle}>Polishing your words...</p>
              <p style={mutedStyle}>AI is crafting your testimonial</p>
              <div style={progressBarStyle}>
                <div style={{ ...progressFillStyle, width: "100%" }} />
              </div>
            </div>
          ) : (
            <div>
              <p style={labelStyle}>Thank you</p>
              <div style={quoteBlockStyle}>
                <p style={quoteTextStyle}>
                  Your testimonial has been generated and sent to the business
                  owner for review.
                </p>
              </div>
              <p style={mutedStyle}>
                They&apos;ll review it and share it with your approval.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Interview state — chat-style UI
  return (
    <div style={containerStyle}>
      <div style={{ maxWidth: "40rem", width: "100%" }}>
        <div style={{ marginBottom: "var(--space-2xl)" }}>
          <div style={progressBarStyle}>
            <div
              style={{
                ...progressFillStyle,
                width: `${state.completeness}%`,
                transition: "width 0.5s var(--ease-out)",
              }}
            />
          </div>
          <p style={mutedStyle}>
            {state.completeness}% complete &middot; Round {state.round}
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
          {messages.map((msg, i) => (
            <div key={i}>
              {msg.role === "assistant" && (
                <div style={questionBubbleStyle}>
                  <p style={questionTextStyle}>{msg.question}</p>
                </div>
              )}
              {msg.role === "user" && (
                <div style={answerBubbleStyle}>
                  <p style={answerTextStyle}>{msg.answer}</p>
                </div>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {state.question && state.options.length > 0 && (
          <div style={{ marginTop: "var(--space-lg)" }}>
            <div style={optionsContainerStyle}>
              {state.options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => selectOption(opt.id)}
                  style={{
                    ...optionStyle,
                    ...(state.selectedOption === opt.id ? optionSelectedStyle : {}),
                  }}
                >
                  <span style={optionLetterStyle}>
                    {opt.id.toUpperCase()}
                  </span>
                  <span>{opt.text}</span>
                </button>
              ))}
            </div>

            {state.showCustomInput && (
              <div style={{ marginTop: "var(--space-md)" }}>
                <textarea
                  value={state.customAnswer}
                  onChange={(e) =>
                    setState((s) => ({ ...s, customAnswer: e.target.value }))
                  }
                  placeholder="Type your answer here..."
                  rows={3}
                  style={textareaStyle}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      submitAnswer();
                    }
                  }}
                />
              </div>
            )}

            {state.selectedOption && (
              <button
                onClick={submitAnswer}
                style={{
                  ...primaryButtonStyle,
                  marginTop: "var(--space-md)",
                  width: "100%",
                }}
              >
                {state.showCustomInput ? "Submit answer" : "Continue"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const containerStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "var(--bg)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "var(--space-xl)",
};

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-micro)",
  color: "var(--text-dim)",
  textTransform: "uppercase",
  letterSpacing: "var(--tracking-wide)",
  marginBottom: "var(--space-lg)",
};

const headingStyle: React.CSSProperties = {
  fontFamily: "var(--font-serif)",
  fontSize: "var(--text-h2)",
  color: "var(--white)",
  lineHeight: 1.15,
  marginBottom: "var(--space-lg)",
};

const bodyStyle: React.CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: "var(--text-body)",
  color: "var(--text-muted)",
};

const mutedStyle: React.CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: "var(--text-small)",
  color: "var(--text-dim)",
};

const primaryButtonStyle: React.CSSProperties = {
  padding: "var(--space-sm) var(--space-xl)",
  background: "var(--white)",
  color: "var(--bg)",
  borderRadius: "8px",
  fontFamily: "var(--font-body)",
  fontSize: "var(--text-body)",
  fontWeight: 500,
  cursor: "pointer",
};

const fieldLabelStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-micro)",
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "var(--tracking-wide)",
  display: "block",
  marginBottom: "var(--space-xs)",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "var(--space-sm) var(--space-md)",
  background: "var(--bg-subtle)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  fontFamily: "var(--font-body)",
  fontSize: "var(--text-body)",
  color: "var(--white)",
  outline: "none",
  boxSizing: "border-box",
};

const progressBarStyle: React.CSSProperties = {
  width: "100%",
  height: "2px",
  background: "var(--border)",
  borderRadius: "1px",
  overflow: "hidden",
  marginBottom: "var(--space-xs)",
};

const progressFillStyle: React.CSSProperties = {
  height: "100%",
  background: "var(--white)",
  borderRadius: "1px",
};

const questionBubbleStyle: React.CSSProperties = {
  padding: "var(--space-md) var(--space-lg)",
  background: "var(--bg-subtle)",
  borderRadius: "12px 12px 12px 0",
  border: "1px solid var(--border)",
};

const questionTextStyle: React.CSSProperties = {
  fontFamily: "var(--font-serif)",
  fontSize: "var(--text-body-lg)",
  color: "var(--white)",
  lineHeight: 1.4,
  fontStyle: "italic",
};

const answerBubbleStyle: React.CSSProperties = {
  padding: "var(--space-md) var(--space-lg)",
  background: "rgba(255,255,255,0.05)",
  borderRadius: "12px 12px 0 12px",
  border: "1px solid var(--border)",
  marginLeft: "var(--space-xl)",
};

const answerTextStyle: React.CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: "var(--text-body)",
  color: "var(--text-primary)",
  lineHeight: 1.4,
};

const optionsContainerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-xs)",
};

const optionStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "var(--space-sm)",
  padding: "var(--space-sm) var(--space-md)",
  background: "var(--bg-subtle)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  fontFamily: "var(--font-body)",
  fontSize: "var(--text-small)",
  color: "var(--text-primary)",
  textAlign: "left",
  cursor: "pointer",
  transition: "all 0.15s var(--ease-out)",
};

const optionSelectedStyle: React.CSSProperties = {
  borderColor: "var(--white)",
  background: "rgba(255,255,255,0.05)",
};

const optionLetterStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-micro)",
  color: "var(--text-dim)",
  width: "1.5rem",
  flexShrink: 0,
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  padding: "var(--space-md)",
  background: "var(--bg-subtle)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  fontFamily: "var(--font-body)",
  fontSize: "var(--text-body)",
  color: "var(--white)",
  resize: "vertical",
  outline: "none",
  transition: "border-color 0.2s var(--ease-out)",
};

const quoteBlockStyle: React.CSSProperties = {
  padding: "var(--space-xl)",
  borderLeft: "2px solid var(--white)",
  marginBottom: "var(--space-2xl)",
};

const quoteTextStyle: React.CSSProperties = {
  fontFamily: "var(--font-serif)",
  fontSize: "var(--text-body-lg)",
  color: "var(--white)",
  fontStyle: "italic",
  lineHeight: 1.5,
};
