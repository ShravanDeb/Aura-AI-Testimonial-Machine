"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "./useInView";

interface NumberTickerProps {
  value: number;
  className?: string;
  duration?: number;
  direction?: "up" | "down";
}

export function NumberTicker({
  value,
  className = "",
  duration = 2000,
  direction = "up",
}: NumberTickerProps) {
  const [display, setDisplay] = useState(direction === "down" ? value : 0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { threshold: 0.3 });
  const animated = useRef(false);

  useEffect(() => {
    if (!inView || animated.current) return;
    animated.current = true;

    const start = direction === "down" ? value : 0;
    const end = direction === "down" ? 0 : value;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = Math.round(start + (end - start) * eased);
      setDisplay(current);
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [inView, value, duration, direction]);

  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {display.toLocaleString()}
    </span>
  );
}
