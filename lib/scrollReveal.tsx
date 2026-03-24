"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

/** Start of navigation / restore — scroll handlers ignore events until this instant (ms since epoch). */
export const ScrollRevealQuietContext = createContext(0);

export function useScrollRevealQuietUntil() {
  return useContext(ScrollRevealQuietContext);
}

const DEFAULT_OPTS: IntersectionObserverInit = {
  threshold: 0.15,
  rootMargin: "0px 0px -100px 0px",
};

/** Classes for hidden vs shown; adds entrance transition only after real user scroll (post–route quiet window). */
export function reveal(isVisible: boolean, animateEntrance: boolean) {
  return (hidden: string, shown: string) =>
    isVisible
      ? `${shown} ${animateEntrance ? "transition-all duration-700" : "transition-none"}`
      : `${hidden} transition-none`;
}

export type UseScrollRevealOptions = Partial<
  Pick<IntersectionObserverInit, "threshold" | "rootMargin" | "root">
> & {
  /** When set, the observer re-attaches when this value changes (e.g. `showResults` for a conditionally mounted node). */
  observeKey?: unknown;
};

export function useScrollReveal(
  options: UseScrollRevealOptions = {}
): readonly [RefObject<HTMLDivElement | null>, boolean, boolean] {
  const { observeKey, threshold, rootMargin, root } = options;
  const quietUntil = useScrollRevealQuietUntil();
  const quietRef = useRef(quietUntil);
  const [visible, setVisible] = useState(false);
  const [animateEntrance, setAnimateEntrance] = useState(false);
  const userScrolled = useRef(false);
  const optsRef = useRef({
    ...DEFAULT_OPTS,
    ...(threshold !== undefined ? { threshold } : {}),
    ...(rootMargin !== undefined ? { rootMargin } : {}),
    ...(root !== undefined ? { root } : {}),
  });
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    quietRef.current = quietUntil;
  }, [quietUntil]);

  useEffect(() => {
    optsRef.current = {
      ...DEFAULT_OPTS,
      ...(threshold !== undefined ? { threshold } : {}),
      ...(rootMargin !== undefined ? { rootMargin } : {}),
      ...(root !== undefined ? { root } : {}),
    };
  }, [threshold, rootMargin, root]);

  useEffect(() => {
    if (observeKey === undefined) return;
    setVisible(false);
    setAnimateEntrance(false);
    userScrolled.current = false;
  }, [observeKey]);

  useEffect(() => {
    userScrolled.current = false;
  }, [quietUntil]);

  useEffect(() => {
    const onUserMove = () => {
      const q = quietRef.current;
      if (q === 0 || Date.now() < q) return;
      userScrolled.current = true;
    };
    window.addEventListener("scroll", onUserMove, { passive: true });
    window.addEventListener("wheel", onUserMove, { passive: true });
    window.addEventListener("touchmove", onUserMove, { passive: true });
    return () => {
      window.removeEventListener("scroll", onUserMove);
      window.removeEventListener("wheel", onUserMove);
      window.removeEventListener("touchmove", onUserMove);
    };
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let revealed = false;

    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || revealed) return;
      revealed = true;
      const q = quietRef.current;
      const pastQuiet = q !== 0 && Date.now() >= q;
      setAnimateEntrance(userScrolled.current && pastQuiet);
      setVisible(true);
    }, optsRef.current);

    obs.observe(el);
    return () => obs.disconnect();
  }, [observeKey ?? null]);

  return [ref, visible, animateEntrance] as const;
}

export function AnimatedSection({
  children,
  options,
}: {
  children: (args: { isVisible: boolean; animateEntrance: boolean }) => ReactNode;
  options?: UseScrollRevealOptions;
}) {
  const [ref, isVisible, animateEntrance] = useScrollReveal(options ?? {});
  return (
    <div ref={ref} className="w-full min-w-0">
      {children({ isVisible, animateEntrance })}
    </div>
  );
}
