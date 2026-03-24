"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const SLIDES = [
  { src: "/Premium%20Bots%20sc.png", alt: "Premium Bots" },
  { src: "/Indicators%20sc.png", alt: "Indicators" },
] as const;

const HERO_IMAGE_SIZES =
  "(max-width: 1024px) min(100vw - 2rem, 672px), 672px";

const BASE_W = 1200;
const BASE_H = 800;

function useDeferAdjacentSlides() {
  const [deferAdjacent, setDeferAdjacent] = useState(false);

  useEffect(() => {
    const enable = () => setDeferAdjacent(true);
    if (typeof window === "undefined") return;

    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(enable, { timeout: 2500 });
    } else {
      timeoutId = globalThis.setTimeout(enable, 800);
    }

    return () => {
      if (idleId !== undefined) window.cancelIdleCallback(idleId);
      if (timeoutId !== undefined) globalThis.clearTimeout(timeoutId);
    };
  }, []);

  const ensureAdjacent = useCallback(() => setDeferAdjacent(true), []);

  return { deferAdjacent, ensureAdjacent };
}

export function HeroImageCarousel() {
  const slides = SLIDES;
  const slideCount = slides.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [shift, setShift] = useState<-1 | 0 | 1>(0);
  const [isTransitionEnabled, setIsTransitionEnabled] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<-1 | 0 | 1>(0);
  const hasHandledTransitionRef = useRef(false);
  const transitionMs = 700;
  const { deferAdjacent, ensureAdjacent } = useDeferAdjacentSlides();

  const prevIndex = (currentIndex - 1 + slideCount) % slideCount;
  const nextIndex = (currentIndex + 1) % slideCount;

  const moveBy = useCallback(
    (delta: -1 | 1) => {
      ensureAdjacent();
      if (slideCount <= 1 || isAnimating || !isTransitionEnabled) return;
      hasHandledTransitionRef.current = false;
      setIsAnimating(true);
      setDirection(delta);
      setShift(delta === 1 ? -1 : 1);
    },
    [ensureAdjacent, slideCount, isAnimating, isTransitionEnabled]
  );

  const moveByRef = useRef(moveBy);
  moveByRef.current = moveBy;

  useEffect(() => {
    if (isPaused || slideCount <= 1) return;

    const intervalId = window.setInterval(() => {
      moveByRef.current(1);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [isPaused, slideCount]);

  const handleTrackTransitionEnd = () => {
    if (slideCount <= 1 || !isAnimating || hasHandledTransitionRef.current) return;
    hasHandledTransitionRef.current = true;

    setIsTransitionEnabled(false);
    setCurrentIndex((prev) => {
      if (direction === 1) return (prev + 1) % slideCount;
      if (direction === -1) return (prev - 1 + slideCount) % slideCount;
      return prev;
    });
    setShift(0);
    setDirection(0);
  };

  useEffect(() => {
    if (isTransitionEnabled) return;

    const timeoutId = window.setTimeout(() => {
      setIsTransitionEnabled(true);
      setIsAnimating(false);
      hasHandledTransitionRef.current = false;
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [isTransitionEnabled]);

  useEffect(() => {
    if (slideCount <= 1) return;
    setIsTransitionEnabled(true);
    setIsAnimating(false);
    setShift(0);
    setDirection(0);
    setCurrentIndex(0);
  }, [slideCount]);

  if (slideCount <= 1) {
    return (
      <div className="relative z-10 w-full aspect-[4/3]" aria-label="Hero image">
        <div className="relative w-full h-full overflow-hidden bg-[#050816]">
          <Image
            src={slides[0].src}
            alt={slides[0].alt}
            width={BASE_W}
            height={BASE_H}
            priority
            sizes={HERO_IMAGE_SIZES}
            className="w-full h-full object-contain block"
            draggable={false}
          />
        </div>
      </div>
    );
  }

  const showTrack = deferAdjacent;

  return (
    <div
      className="relative z-10 w-full aspect-[4/3]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
      aria-roledescription="carousel"
      aria-label="Hero images"
    >
      <div className="relative w-full h-full overflow-hidden bg-[#050816]">
        {showTrack ? (
          [prevIndex, currentIndex, nextIndex].map((slideIndex, slotIndex) => {
            const slot = slotIndex - 1;
            const slide = slides[slideIndex];
            const isCurrent = slotIndex === 1;
            return (
              <div
                key={`${slide.src}-${slot}`}
                className="absolute inset-0 w-full h-full origin-center ease-in-out"
                style={{
                  transform: `translateX(${(slot + shift) * 100}%)`,
                  transitionProperty: "transform",
                  transitionDuration: isTransitionEnabled ? `${transitionMs}ms` : "0ms",
                }}
                onTransitionEnd={handleTrackTransitionEnd}
              >
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  width={BASE_W}
                  height={BASE_H}
                  priority={isCurrent}
                  loading={isCurrent ? "eager" : "lazy"}
                  sizes={HERO_IMAGE_SIZES}
                  className="w-full h-full object-contain block pointer-events-none select-none"
                  draggable={false}
                />
              </div>
            );
          })
        ) : (
          <div className="absolute inset-0 w-full h-full">
            <Image
              src={slides[currentIndex].src}
              alt={slides[currentIndex].alt}
              width={BASE_W}
              height={BASE_H}
              priority
              sizes={HERO_IMAGE_SIZES}
              className="w-full h-full object-contain block pointer-events-none select-none"
              draggable={false}
            />
          </div>
        )}

        {slideCount > 1 && (
          <>
            <button
              type="button"
              onClick={() => moveBy(-1)}
              aria-label="Previous hero image"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-blue-500/30 flex items-center justify-center text-white hover:bg-blue-600/30 hover:border-blue-500/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 pointer-events-auto touch-manipulation"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => moveBy(1)}
              aria-label="Next hero image"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-blue-500/30 flex items-center justify-center text-white hover:bg-blue-600/30 hover:border-blue-500/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 pointer-events-auto touch-manipulation"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      <div className="sr-only" aria-live="polite">
        Slide {currentIndex + 1} of {slideCount}
      </div>
    </div>
  );
}
