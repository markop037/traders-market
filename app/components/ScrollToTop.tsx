"use client";

import {
  useEffect,
  useLayoutEffect,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import {
  ScrollRevealQuietContext,
} from "@/lib/scrollReveal";

/**
 * Scrolls to top on every client-side route change and during a short window
 * ignores scroll/wheel/touch for scroll-reveal "user scrolled" detection so
 * programmatic scroll-to-top does not enable entrance animations on load.
 */
export function ScrollToTop({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [quietUntil, setQuietUntil] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  }, []);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    setQuietUntil(Date.now() + 320);
  }, [pathname]);

  return (
    <ScrollRevealQuietContext.Provider value={quietUntil}>
      {children}
    </ScrollRevealQuietContext.Provider>
  );
}
