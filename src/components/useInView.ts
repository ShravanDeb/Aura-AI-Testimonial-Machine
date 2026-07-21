"use client";

import { RefObject, useEffect, useState } from "react";

interface UseInViewOptions {
  threshold?: number;
  rootMargin?: string;
}

export function useInView(
  ref: RefObject<HTMLElement | null>,
  options: UseInViewOptions = {}
): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(el);
        }
      },
      { threshold: options.threshold ?? 0.1, rootMargin: options.rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, options.threshold, options.rootMargin]);

  return inView;
}
