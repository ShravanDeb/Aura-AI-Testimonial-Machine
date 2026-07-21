"use client";

import { cn } from "@/lib/utils";

interface MarqueeProps {
  children: React.ReactNode;
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  vertical?: boolean;
  duration?: string;
}

export function Marquee({
  children,
  className,
  reverse = false,
  pauseOnHover = false,
  vertical = false,
  duration = "30s",
}: MarqueeProps) {
  const direction = vertical
    ? reverse ? "marquee-vertical-reverse" : "marquee-vertical"
    : reverse ? "marquee-reverse" : "marquee-normal";

  return (
    <div
      className={cn(
        "group flex overflow-hidden",
        vertical ? "flex-col" : "flex-row",
        className
      )}
      style={{
        "--duration": duration,
      } as React.CSSProperties}
    >
      <div
        className={cn(
          "flex shrink-0",
          vertical ? "flex-col" : "flex-row",
          direction,
          pauseOnHover && "group-hover:[animation-play-state:paused]"
        )}
        style={{
          animation: `${direction === "marquee-normal" ? "marquee" : direction === "marquee-reverse" ? "marquee-reverse" : direction === "marquee-vertical" ? "marquee-vertical" : "marquee-vertical-reverse"} var(--duration) linear infinite`,
        }}
      >
        {children}
      </div>
      <div
        className={cn(
          "flex shrink-0",
          vertical ? "flex-col" : "flex-row",
          direction,
          pauseOnHover && "group-hover:[animation-play-state:paused]"
        )}
        aria-hidden
        style={{
          animation: `${direction === "marquee-normal" ? "marquee" : direction === "marquee-reverse" ? "marquee-reverse" : direction === "marquee-vertical" ? "marquee-vertical" : "marquee-vertical-reverse"} var(--duration) linear infinite`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
