"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

interface ShimmerButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
}

export function ShimmerButton({ children, className = "", onClick, href }: ShimmerButtonProps) {
  const btnRef = useRef<HTMLAnchorElement | HTMLButtonElement>(null);

  const Tag = href ? "a" : "button";

  return (
    <Tag
      ref={btnRef as any}
      href={href}
      onClick={onClick}
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem 2.5rem",
        fontSize: "1.0625rem",
        fontWeight: 600,
        color: "#000",
        borderRadius: "var(--radius-pill)",
        background: "linear-gradient(135deg, var(--accent) 0%, #ea580c 100%)",
        boxShadow: "0 0 30px rgba(245, 158, 11, 0.2)",
        transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        cursor: "pointer",
        border: "none",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
        e.currentTarget.style.boxShadow = "0 8px 40px rgba(245, 158, 11, 0.35)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0) scale(1)";
        e.currentTarget.style.boxShadow = "0 0 30px rgba(245, 158, 11, 0.2)";
      }}
    >
      <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
      <ShimmerOverlay />
    </Tag>
  );
}

function ShimmerOverlay() {
  const overlayRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if (!overlayRef.current) return;
    gsap.fromTo(
      overlayRef.current,
      { x: "-100%" },
      {
        x: "200%",
        duration: 2,
        repeat: -1,
        ease: "none",
        delay: 1,
      }
    );
  }, []);

  return (
    <span
      ref={overlayRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "50%",
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
