"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    gsap.fromTo(
      navRef.current,
      { y: -10, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, delay: 0.1, ease: "power3.out" }
    );
  }, []);

  return (
    <nav
      ref={navRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        borderBottom: "1px solid var(--border)",
        opacity: 0,
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "3.5rem",
        }}
      >
        <a href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            background: "var(--white)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: "var(--text-small)",
            letterSpacing: "-0.02em",
            color: "var(--white)",
          }}>
            Testimonial Machine
          </span>
        </a>

        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2xl)" }}>
          <div style={{ display: "flex", gap: "var(--space-xl)" }}>
            {["How it works", "Features", "Pricing"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                style={{
                  fontSize: "var(--text-small)",
                  fontFamily: "var(--font-body)",
                  fontWeight: 400,
                  color: "var(--text-secondary)",
                  transition: "color 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--white)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
              >
                {item}
              </a>
            ))}
          </div>

          <a
            href="#pricing"
            style={{
              padding: "0.5rem 1rem",
              fontSize: "var(--text-small)",
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              background: "var(--white)",
              color: "var(--bg)",
              borderRadius: "var(--radius-pill)",
              transition: "opacity 0.15s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
          >
            Start Free
          </a>
        </div>
      </div>
    </nav>
  );
}
