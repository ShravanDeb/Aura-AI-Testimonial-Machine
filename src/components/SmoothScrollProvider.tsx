"use client";

import { ReactNode, useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useScrollLock } from "@/lib/scroll-lock";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScrollProvider({
  children,
}: {
  children: ReactNode;
}) {
  const lenisRef = useRef<Lenis | null>(null);
  const { isLocked } = useScrollLock();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
    };
  }, []);

  // Handle scroll lock
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;

    if (isLocked) {
      lenis.stop();
    } else {
      lenis.start();
    }
  }, [isLocked]);

  // Prevent ALL scroll when locked
  useEffect(() => {
    if (!isLocked) return;

    const preventWheel = (e: WheelEvent) => e.preventDefault();
    const preventTouch = (e: TouchEvent) => e.preventDefault();
    const preventKeys = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isEditing = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
      const keys = ["ArrowDown","ArrowUp","PageDown","PageUp","Home","End"," "];
      if (keys.includes(e.key) && !isEditing) e.preventDefault();
    };

    window.addEventListener("wheel", preventWheel, { passive: false });
    window.addEventListener("touchmove", preventTouch, { passive: false });
    window.addEventListener("keydown", preventKeys);

    return () => {
      window.removeEventListener("wheel", preventWheel);
      window.removeEventListener("touchmove", preventTouch);
      window.removeEventListener("keydown", preventKeys);
    };
  }, [isLocked]);

  return <>{children}</>;
}
