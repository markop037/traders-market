"use client";

import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { ImageLightboxModal } from "../components/ImageLightboxModal";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { tradingBots } from "@/lib/bot-picker/bots";
import { logAnalyticsEvent, logCheckoutEvent, logCtaClick, logPdfGuideRequest } from "@/lib/analytics";
import {
  STRATEGY_LABELS,
  TIMEFRAME_LABELS,
  TRADE_FREQUENCY_LABELS,
  STRATEGY_TAG_COLORS,
  TIMEFRAME_TAG_COLORS,
  FREQUENCY_TAG_COLORS,
  TradingBot,
} from "@/lib/bot-picker/types";

// Lookup map: classificationId → TradingBot
const botClassification = new Map<string, TradingBot>(
  tradingBots.map((b) => [b.id, b])
);

// Custom hook for scroll-triggered animations
function useScrollAnimation(options = { threshold: 0.15, rootMargin: '0px 0px -100px 0px' }) {
  const [isVisible, setIsVisible] = useState(false);
  const hasAnimated = useRef(false);
  const ref = useRef<HTMLDivElement>(null);
  const optionsRef = useRef(options);

  // Update options ref when they change
  useEffect(() => {
    optionsRef.current = options;
  }, [options.threshold, options.rootMargin]);

  useEffect(() => {
    // If already animated, don't set up observer again
    if (hasAnimated.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          setIsVisible(true);
          hasAnimated.current = true;
        }
      },
      optionsRef.current
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []); // Empty dependency array - only run once

  return [ref, isVisible] as const;
}

// Wrapper component for animated sections
function AnimatedSection({ children }: { children: (isVisible: boolean) => React.ReactNode }) {
  const [ref, isVisible] = useScrollAnimation();
  return <div ref={ref}>{children(isVisible)}</div>;
}

// Image Carousel Component for Backtesting Results (optional currencyLabel e.g. EURUSD / GBPUSD, strategyName for lightbox)
function ImageCarousel({ images, altPrefix, currencyLabel, strategyName }: { images: string[]; altPrefix: string; currencyLabel?: string; strategyName?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="relative w-full mb-6">
      {currencyLabel && (
        <p className="text-xs font-semibold text-amber-400/90 uppercase tracking-wider mb-2">{currencyLabel}</p>
      )}
      {/* Carousel Container */}
      <div className="relative aspect-[16/9] rounded-lg overflow-hidden bg-gradient-to-br from-slate-900/90 to-black/90 border border-amber-500/20">
        {/* Current Image - click to open full-screen lightbox */}
        <button
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          className="absolute inset-0 flex items-center justify-center w-full h-full cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-inset rounded-lg"
          aria-label="View image full screen"
        >
          <img
            src={images[currentIndex]}
            alt={`${altPrefix} - Backtesting Result ${currentIndex + 1}`}
            className="w-full h-full object-contain pointer-events-none"
          />
        </button>

        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            {/* Previous Button */}
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-amber-500/30 flex items-center justify-center text-white hover:bg-amber-600/30 hover:border-amber-500/50 transition-all duration-300 group"
              aria-label="Previous image"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Next Button */}
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-amber-500/30 flex items-center justify-center text-white hover:bg-amber-600/30 hover:border-amber-500/50 transition-all duration-300 group"
              aria-label="Next image"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Slide Indicator Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-amber-400 w-6'
                    : 'bg-gray-500/50 hover:bg-gray-400/70'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-amber-500/30">
            <span className="text-xs text-amber-400 font-mono">
              {currentIndex + 1} / {images.length}
            </span>
          </div>
        )}
      </div>

      <ImageLightboxModal
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        images={images}
        initialIndex={currentIndex}
        altPrefix={altPrefix}
        strategyName={strategyName}
        tradingPair={currencyLabel}
      />

      {!currencyLabel && (
        <div className="mt-2 text-center">
          <span className="text-xs text-gray-500 italic">Backtesting results</span>
        </div>
      )}
    </div>
  );
}

type Bot = {
  name: string;
  classificationId: string;
  icon: React.ReactNode;
  indicator: string;
  signal: string;
  confirmation: string;
  entryLogic: string;
};

const bots: Bot[] = [
  {
    name: "EMA Crossover with Price Action Confirmation",
    classificationId: "ema-crossover",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {/* Two moving averages crossing */}
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16c3-4 6-4 9 0s6 4 7 0" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 10c3 2 6 2 9 0s6-2 7 0" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 20h16" />
      </svg>
    ),
    indicator: "Fast EMA vs. Slow EMA",
    signal: "Fast EMA crossing above (bullish) or below (bearish) the slow EMA",
    confirmation: "Price action in the crossover direction (e.g., breakout candle)",
    entryLogic:
      "Enter long on bullish cross with confirmation; enter short on bearish cross with confirmation",
  },
  {
    name: "RSI Overbought/Oversold with Price Action Confirmation",
    classificationId: "rsi-overbought-oversold",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {/* RSI gauge */}
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 19.5h15" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5a7.5 7.5 0 00-7.5 7.5 7.5 7.5 0 001.2 4.1" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5a7.5 7.5 0 017.5 7.5 7.5 7.5 0 01-1.2 4.1" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12l4-2.5" />
      </svg>
    ),
    indicator: "RSI",
    signal: "RSI enters overbought or oversold territory",
    confirmation: "Reversal candlestick pattern or rejection from a key level",
    entryLogic:
      "Enter long when RSI is oversold and price confirms reversal; enter short when RSI is overbought and price confirms rejection",
  },
  {
    name: "MACD with Price Action Confirmation",
    classificationId: "macd",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {/* Histogram + signal line */}
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 20V6m0 14h16" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20v-6M10 20v-10M13 20v-7M16 20v-12M19 20v-8" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9c2.2-2 4.6-2 6.6 0s4.4 2 6.4 0" />
      </svg>
    ),
    indicator: "MACD line cross and histogram momentum",
    signal: "MACD crossover or divergence in trend direction",
    confirmation: "Price action supports the MACD signal (e.g., breakout, rejection)",
    entryLogic:
      "Enter long on bullish MACD signals with confirmation; enter short on bearish signals with confirmation",
  },
  {
    name: "Heiken Ashi with Price Action Confirmation",
    classificationId: "heiken-ashi",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {/* Candles */}
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 5v14M7 8h3v8H7z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5v14M14 10h3v6h-3z" />
      </svg>
    ),
    indicator: "Heiken Ashi candles",
    signal: "Color change signaling potential trend reversal or continuation",
    confirmation: "Standard candlestick price action in the same direction",
    entryLogic:
      "Enter trades in the direction of the Heiken Ashi shift when supported by candlestick confirmation",
  },
  {
    name: "Inside Bar Breakout",
    classificationId: "inside-bar-breakout",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {/* Inside bar range + breakout */}
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 6v12M17 6v12" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9v6M15 9v6" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v4m0 12v-4" />
      </svg>
    ),
    indicator: "Inside bar formation (candle fully inside the previous one)",
    signal: "Price breaks above or below the inside bar range",
    confirmation: "Breakout candle larger than ATR × X",
    entryLogic:
      "Enter in breakout direction after confirmation, capturing momentum from consolidation",
  },
  {
    name: "Stochastics with Price Action Confirmation",
    classificationId: "stochastics",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {/* Oscillator waves */}
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 17h16" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15c2-6 4-6 6 0s4 6 8-2" />
      </svg>
    ),
    indicator: "Stochastic oscillator",
    signal: "Stochastics enters overbought/oversold and signals reversal",
    confirmation: "Reversal candlestick or rejection pattern",
    entryLogic:
      "Enter long on oversold reversals with confirmation; enter short on overbought reversals with confirmation",
  },
  {
    name: "Bollinger Bands with Price Action Confirmation",
    classificationId: "bollinger-bands",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {/* Bollinger channel */}
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 7c4-3 10-3 14 0" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12c4-2 10-2 14 0" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 17c4-3 10-3 14 0" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8" />
      </svg>
    ),
    indicator: "Bollinger Bands",
    signal: "Price touches or breaks the upper or lower band",
    confirmation: "Reversal or breakout candlestick pattern",
    entryLogic:
      "Enter reversal trades from overextended levels or continuation trades on confirmed breakouts",
  },
  {
    name: "Fibonacci Retracement",
    classificationId: "fibonacci-retracement",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {/* Fib levels */}
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6h12M6 10h10M6 14h8M6 18h6" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 6v12" />
      </svg>
    ),
    indicator: "Fibonacci retracement levels (commonly 35–50%)",
    signal: "Strong daily impulse candle above ATR × X, followed by pullback into retracement zone",
    confirmation: "Rejection candlestick pattern inside the retracement zone",
    entryLogic:
      "Enter in direction of the original impulse once pullback confirms continuation",
  },
  {
    name: "Daily Range Breakout",
    classificationId: "daily-range-breakout",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {/* Range box + breakout arrow */}
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 8h12v8H6z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v4m0 8v4" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 6l3-3 3 3" />
      </svg>
    ),
    indicator: "Previous day’s high and low",
    signal: "Price breaks the daily high (bullish) or low (bearish)",
    confirmation: "Breakout candle larger than ATR × X",
    entryLogic:
      "Enter in breakout direction, using ATR-based stop-loss and take-profit for risk/reward consistency",
  },
  {
    name: "Pivot Point with Price Action Confirmation",
    classificationId: "pivot-point",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8" />
      </svg>
    ),
    indicator: "Daily Pivot Points (Classic), R1–R3, S1–S3",
    signal: "Price approaches pivot, support, or resistance levels",
    confirmation: "Candlestick patterns (Engulfing or Pin Bar) near pivot levels",
    entryLogic:
      "Enter trades when price is near a pivot level and a bullish or bearish candlestick pattern confirms the direction. Optionally supports ATR-based stop loss, trailing stops, and risk management for daily profit/loss limits.",
  },
  {
    name: "RSI Divergence with Price Action Confirmation",
    classificationId: "rsi-divergence",
    icon: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 17h16" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 14l3-6 3 4 3-8" />
      </svg>
    ),
    indicator: "Relative Strength Index (RSI)",
    signal: "Bullish or bearish RSI divergence",
    confirmation: "Candlestick patterns (Engulfing or Pin Bar) aligned with divergence signals",
    entryLogic:
      "Enter trades when RSI divergence occurs. If confirmation is enabled, require supporting bullish/bearish candlestick patterns. Supports ATR-based stop loss, trailing stops, and configurable risk per trade and daily limits.",
  },
];

export default function BundleInfoPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    logAnalyticsEvent('bundle_view', { page: 'bundle', price: 259 });
  }, []);

  const handleGetBundle = () => {
    logCheckoutEvent('checkout_initiated', 259, 'USD');
    if (user?.email) {
      const checkoutUrl = `https://www.momentumdigital.online/checkout?email=${encodeURIComponent(user.email)}`;
      window.location.href = checkoutUrl;
    } else {
      router.push('/bundle-offer');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#050816] via-[#0f172a] via-[#0f1f4a] to-[#050816]">
      {/* Text Section */}
      <section className="relative overflow-hidden">
        {/* Decorative background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-blue-600/10 blur-3xl" />
          <div className="absolute -bottom-40 right-[-10rem] h-80 w-80 rounded-full bg-blue-800/10 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(59,130,246,0.06),transparent_60%)]" />
        </div>

        <div className="mx-auto max-w-7xl px-4 pt-20 pb-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            <div className="relative lg:col-span-7">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
                <span className="bg-gradient-to-r from-blue-400 via-blue-200 to-blue-400 bg-clip-text text-transparent">
                  The Ultimate Trading Bot Bundle for MT5
                </span>
              </h1>

              <p className="mt-6 text-lg leading-8 text-gray-300 sm:text-xl">
                Get instant access to 10+ of the most powerful trading strategies. Fully automated. Fully customizable.
                Yours for a one-time price.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  href="/bundle-offer"
                  className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r from-blue-700 to-blue-600 px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:from-blue-600 hover:to-blue-500 hover:shadow-[0_0_34px_rgba(59,130,246,0.65)] hover:scale-[1.03] border border-blue-600/30"
                >
                  <span className="relative z-10 flex flex-col items-center leading-tight">
                  <span className="text-white/70 line-through text-base">$399</span>
                  <span className="text-xs text-gray-300/90 uppercase tracking-wider mt-0.5">Limited time</span>
                  <span className="text-amber-300 font-semibold">Buy for $259</span>
                </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </Link>

                <div className="text-sm text-gray-400">
                  One-time payment • Instant download • Lifetime access
                </div>
              </div>
            </div>

            {/* Visual block */}
            <div className="relative lg:col-span-5">
              <div className="relative overflow-hidden rounded-2xl border border-blue-600/25 bg-gradient-to-br from-blue-950/30 via-[#0f1f4a]/25 to-blue-900/20 p-6 shadow-2xl shadow-blue-900/20">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-600/20 via-blue-700/20 to-blue-600/20 blur-xl" />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-300">Strategy Pack</div>
                    <div className="rounded-full border border-blue-500/20 bg-black/20 px-3 py-1 text-xs text-blue-200/80">
                      10+ Bots
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    {["Trend", "Reversal", "Breakout", "Momentum"].map((tag) => (
                      <div
                        key={tag}
                        className="rounded-xl border border-blue-600/15 bg-black/20 px-4 py-3 text-sm text-gray-200"
                      >
                        <div className="text-xs text-blue-300/80 mb-1">Mode</div>
                        <div className="font-semibold">{tag}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-xl border border-blue-600/15 bg-black/20 px-4 py-4">
                    <div className="flex items-center justify-between text-xs text-blue-300/80">
                      <span>Execution</span>
                      <span>Rule-based</span>
                    </div>
                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-blue-950/50">
                      <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-blue-500 to-blue-800" />
                    </div>
                    <div className="mt-2 text-xs text-gray-400">Optimized for clarity, consistency, and control.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cards Section */}
      <AnimatedSection>
        {(isVisible) => (
          <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
            <div className="mx-auto mt-6 max-w-5xl">
              <div
                className={`mb-8 flex flex-col gap-3 transition-all duration-700 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
              >
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                  Explore What’s Inside the Bundle
                </h2>
                <p className="text-gray-300 text-base sm:text-lg">
                  Click any strategy to expand the full logic (indicator, signal, confirmation, and entry rules).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {bots.map((bot, index) => {
                  const isOpen = openIndex === index;
                  const classification = botClassification.get(bot.classificationId);
                  return (
                    <article
                      key={bot.name}
                      className={`group relative overflow-hidden rounded-2xl border transition-all duration-700 ${
                        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                      } ${
                        isOpen
                          ? "border-blue-500/60 bg-gradient-to-br from-blue-950/55 via-[#0f1f4a]/45 to-blue-900/40 shadow-2xl shadow-blue-900/25"
                          : "border-blue-600/25 bg-gradient-to-br from-blue-950/30 via-[#0f1f4a]/20 to-blue-900/20 hover:border-blue-500/45 hover:shadow-xl hover:shadow-blue-900/15"
                      }`}
                      style={{
                        transitionDelay: isVisible ? `${120 + index * 60}ms` : "0ms",
                      }}
                    >
                      {/* Ambient glow */}
                      <div
                        className={`pointer-events-none absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 opacity-0 blur-xl transition-opacity duration-300 ${
                          isOpen ? "opacity-20" : "group-hover:opacity-10"
                        }`}
                      />

                      <div className="relative p-6">
                        <div className="flex items-start gap-4">
                          <div
                            className={`flex-shrink-0 rounded-xl border transition-all duration-300 ${
                              isOpen
                                ? "border-blue-500/45 bg-gradient-to-br from-blue-600/35 to-blue-800/35"
                                : "border-blue-600/25 bg-gradient-to-br from-blue-600/15 to-blue-800/15 group-hover:from-blue-600/25 group-hover:to-blue-800/25"
                            }`}
                          >
                            <div
                              className={`h-11 w-11 p-2.5 transition-colors duration-300 ${
                                isOpen ? "text-blue-200" : "text-blue-300 group-hover:text-blue-200"
                              }`}
                            >
                              {bot.icon}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-semibold text-white leading-snug">
                              {bot.name}
                            </h3>
                            <p className="mt-2 text-sm text-gray-400">
                              Indicator-driven logic with confirmation for higher-quality entries.
                            </p>
                          </div>
                        </div>

                        {/* Classification Tags — always visible */}
                        {classification && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold border ${STRATEGY_TAG_COLORS[classification.strategyType]}`}>
                              {STRATEGY_LABELS[classification.strategyType]}
                            </span>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold border ${TIMEFRAME_TAG_COLORS[classification.timeframePreference]}`}>
                              {TIMEFRAME_LABELS[classification.timeframePreference]}
                            </span>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold border ${FREQUENCY_TAG_COLORS[classification.tradeFrequency]}`}>
                              {TRADE_FREQUENCY_LABELS[classification.tradeFrequency]}
                            </span>
                          </div>
                        )}

                        {/* Expandable Content */}
                        <div
                          className={`grid transition-all duration-500 ease-out ${
                            isOpen ? "grid-rows-[1fr] opacity-100 mt-5" : "grid-rows-[0fr] opacity-0 mt-0"
                          }`}
                        >
                          <div className="overflow-hidden">
                            <div className="grid grid-cols-1 gap-3">
                              <div className="rounded-xl border border-blue-600/15 bg-black/20 px-4 py-3.5">
                                <p className="text-[11px] uppercase tracking-wider text-blue-300/80 mb-1">Indicator</p>
                                <p className="text-gray-200 text-sm leading-relaxed">{bot.indicator}</p>
                              </div>

                              <div className="rounded-xl border border-blue-600/15 bg-black/20 px-4 py-3.5">
                                <p className="text-[11px] uppercase tracking-wider text-blue-300/80 mb-1">Signal</p>
                                <p className="text-gray-200 text-sm leading-relaxed">{bot.signal}</p>
                              </div>

                              <div className="rounded-xl border border-blue-600/15 bg-black/20 px-4 py-3.5">
                                <p className="text-[11px] uppercase tracking-wider text-blue-300/80 mb-1">Confirmation</p>
                                <p className="text-gray-200 text-sm leading-relaxed">{bot.confirmation}</p>
                              </div>

                              <div className="rounded-xl border border-blue-600/15 bg-black/20 px-4 py-3.5">
                                <p className="text-[11px] uppercase tracking-wider text-blue-300/80 mb-1">Entry Logic</p>
                                <p className="text-gray-200 text-sm leading-relaxed">{bot.entryLogic}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Click to read more */}
                        <button
                          onClick={() => setOpenIndex(isOpen ? null : index)}
                          className={`mt-5 w-full rounded-xl border border-blue-600/15 bg-black/10 px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                            isOpen
                              ? "text-blue-200 hover:text-white hover:border-blue-500/30"
                              : "text-blue-300 hover:text-white hover:border-blue-500/30"
                          } hover:bg-black/20 hover:shadow-[0_0_18px_rgba(59,130,246,0.35)]`}
                          aria-expanded={isOpen}
                          aria-controls={`bot-details-${index}`}
                        >
                          <span className="flex items-center justify-center gap-2">
                            <span>{isOpen ? "Show Less" : "Click to Read More"}</span>
                            <svg
                              className={`h-4 w-4 transition-transform duration-300 ${
                                isOpen ? "rotate-180" : "group-hover:translate-y-0.5"
                              }`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </span>
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </AnimatedSection>

      {/* Transition Divider - Cards to Premium Bots */}
      <div className="relative h-6 bg-gradient-to-b from-[#050816] via-[#0f1f4a]/20 to-[#0a0e27]">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-600/10 to-transparent"></div>
      </div>

      {/* Premium Bots Section */}
      <AnimatedSection>
        {(isVisible) => (
          <section className="relative bg-gradient-to-b from-[#0a0e27] via-[#0f172a] to-[#0f1f4a] py-20 border-y border-amber-500/10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {/* Section Header */}
              <div className={`mx-auto max-w-5xl mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-600/20 border border-amber-500/30 mb-6">
                  <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-amber-400 font-semibold text-sm uppercase tracking-wide">Exclusive Premium Collection</span>
                </div>
                
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                  Premium Trading Bots
                </h2>
                <p className="text-base sm:text-lg text-gray-300">
                  Advanced algorithmic strategies with institutional-grade logic, precision risk control, and proven market edge
                </p>
              </div>

              {/* Premium Bots Grid */}
              <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Premium Bot #1: NewYork-London Breakout */}
                <article className={`group relative overflow-hidden rounded-2xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-950/30 via-[#0f172a]/90 to-amber-900/20 transition-all duration-700 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/20 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                     style={{ transitionDelay: isVisible ? '120ms' : '0ms' }}>
                  <div className="absolute -inset-1 bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition duration-500"></div>
                  
                  <div className="relative p-6">
                    {/* Premium Badge */}
                    <div className="absolute top-4 right-4">
                      <div className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-600/20 border border-amber-500/40">
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Premium</span>
                      </div>
                    </div>

                    {/* Bot Header */}
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-white mb-2">
                        NewYork–London Breakout
                      </h3>
                      <p className="text-amber-400/90 font-medium text-sm">
                        Session-based breakout strategy with ATR risk control and smart trade management
                      </p>
                    </div>

                    {/* Classification Tags */}
                    <div className="mb-6 flex flex-wrap gap-2">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold border ${STRATEGY_TAG_COLORS.BREAKOUT}`}>
                        {STRATEGY_LABELS.BREAKOUT}
                      </span>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold border ${TIMEFRAME_TAG_COLORS.LOW}`}>
                        {TIMEFRAME_LABELS.LOW}
                      </span>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold border ${FREQUENCY_TAG_COLORS.MEDIUM}`}>
                        {TRADE_FREQUENCY_LABELS.MEDIUM}
                      </span>
                    </div>

                    {/* Backtesting Results: 2 images EURUSD, 2 images GBPUSD */}
                    <ImageCarousel
                      currencyLabel="EURUSD"
                      strategyName="NewYork–London Breakout"
                      images={['/premium-bots/ny-london-breakout-eurusd-1.jpg', '/premium-bots/ny-london-breakout-eurusd-2.jpg']}
                      altPrefix="NewYork-London Breakout EURUSD"
                    />
                    <ImageCarousel
                      currencyLabel="GBPUSD"
                      strategyName="NewYork–London Breakout"
                      images={['/premium-bots/ny-london-breakout-gbpusd-1.jpg', '/premium-bots/ny-london-breakout-gbpusd-2.jpg']}
                      altPrefix="NewYork-London Breakout GBPUSD"
                    />

                    {/* Core Concepts (Collapsed) */}
                    <div className="space-y-3">
                      <div className="rounded-xl border border-amber-500/15 bg-black/20 px-4 py-3">
                        <p className="text-[11px] uppercase tracking-wider text-amber-400 mb-1">Core Concept</p>
                        <p className="text-gray-200 text-sm leading-relaxed">
                          Trades high-probability breakouts from the London and New York pre-session ranges, targeting strong liquidity-driven moves at session open
                        </p>
                      </div>

                      <div className="rounded-xl border border-amber-500/15 bg-black/20 px-4 py-3">
                        <p className="text-[11px] uppercase tracking-wider text-amber-400 mb-1">Market Structure</p>
                        <p className="text-gray-200 text-sm leading-relaxed">
                          Session Range (Breakout Box): High and Low calculated from predefined time window before session open, using M1 price data for precise range detection
                        </p>
                      </div>

                      <div className="rounded-xl border border-amber-500/15 bg-black/20 px-4 py-3">
                        <p className="text-[11px] uppercase tracking-wider text-amber-400 mb-1">Key Highlights</p>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {[
                            "ATR-Based Stop Loss",
                            "Fixed R:R Take Profit",
                            "Auto Position Sizing",
                            "Built-in Trailing Stop",
                            "Daily P&L Limits",
                            "Session Control"
                          ].map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <svg className="w-3 h-3 text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-gray-300 text-xs">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>

                {/* Premium Bot #2: Grid */}
                <article className={`group relative overflow-hidden rounded-2xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-950/30 via-[#0f172a]/90 to-amber-900/20 transition-all duration-700 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/20 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                     style={{ transitionDelay: isVisible ? '180ms' : '0ms' }}>
                  <div className="absolute -inset-1 bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition duration-500"></div>
                  
                  <div className="relative p-6">
                    {/* Premium Badge */}
                    <div className="absolute top-4 right-4">
                      <div className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-600/20 border border-amber-500/40">
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Premium</span>
                      </div>
                    </div>

                    {/* Bot Header */}
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-white mb-2">
                        Grid
                      </h3>
                      <p className="text-amber-400/90 font-medium text-sm">
                        Anchored grid trading strategy with dynamic lot sizing and profit-targeted cycle management
                      </p>
                    </div>

                    {/* Classification Tags */}
                    <div className="mb-6 flex flex-wrap gap-2">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold border ${STRATEGY_TAG_COLORS.MEAN_REVERSION}`}>
                        {STRATEGY_LABELS.MEAN_REVERSION}
                      </span>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold border ${TIMEFRAME_TAG_COLORS.LOW}`}>
                        {TIMEFRAME_LABELS.LOW}
                      </span>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold border ${FREQUENCY_TAG_COLORS.HIGH}`}>
                        {TRADE_FREQUENCY_LABELS.HIGH}
                      </span>
                    </div>

                    {/* Backtesting Results: 2 images EURUSD, 2 images GBPUSD */}
                    <ImageCarousel
                      currencyLabel="EURUSD"
                      strategyName="Grid"
                      images={['/premium-bots/grid-eurusd-1.jpg', '/premium-bots/grid-eurusd-2.jpg']}
                      altPrefix="Grid EURUSD"
                    />
                    <ImageCarousel
                      currencyLabel="GBPUSD"
                      strategyName="Grid"
                      images={['/premium-bots/grid-gbpusd-1.jpg', '/premium-bots/grid-gbpusd-2.jpg']}
                      altPrefix="Grid GBPUSD"
                    />

                    {/* Core Concepts (Collapsed) */}
                    <div className="space-y-3">
                      <div className="rounded-xl border border-amber-500/15 bg-black/20 px-4 py-3">
                        <p className="text-[11px] uppercase tracking-wider text-amber-400 mb-1">Core Concept</p>
                        <p className="text-gray-200 text-sm leading-relaxed">
                          A symmetric, anchored grid strategy designed to capture market oscillations while maintaining controlled risk through balance-based position sizing. Unlike martingale grids, this bot uses a fixed lot size per grid cycle and closes the entire basket at a predefined profit target, preventing risk escalation.
                        </p>
                      </div>

                      <div className="rounded-xl border border-amber-500/15 bg-black/20 px-4 py-3">
                        <p className="text-[11px] uppercase tracking-wider text-amber-400 mb-1">Market Structure</p>
                        <p className="text-gray-200 text-sm leading-relaxed">
                          Anchored Grid Framework: The grid is built around an anchor price (midpoint) with Buy Stops placed above and Sell Stops below. Grid levels expand symmetrically using a configurable pip step, with dynamic lot sizing based on account balance.
                        </p>
                      </div>

                      <div className="rounded-xl border border-amber-500/15 bg-black/20 px-4 py-3">
                        <p className="text-[11px] uppercase tracking-wider text-amber-400 mb-1">Key Highlights</p>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {[
                            "Balance-Based Lot Sizing",
                            "No Martingale Risk",
                            "Basket Profit Target",
                            "Anchor Price Logic",
                            "Auto Grid Cleanup",
                            "Symbol-Independent"
                          ].map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <svg className="w-3 h-3 text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-gray-300 text-xs">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </div>

              {/* Bottom Note & CTA */}
              <div className={`text-center mt-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                   style={{ transitionDelay: isVisible ? '300ms' : '0ms' }}>
                <p className="text-gray-400 text-sm mb-6">
                  Both premium bots are included in the complete bundle
                </p>

                {/* CTA Button to Bundle Offer */}
                <Link
                  href="/bundle-offer"
                  className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-600 px-10 py-4 text-lg font-bold text-white transition-all duration-300 hover:from-amber-500 hover:via-yellow-500 hover:to-amber-500 hover:shadow-[0_0_40px_rgba(251,191,36,0.6)] hover:scale-[1.05] border-2 border-amber-500/40 active:scale-[0.98]"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Get Premium Access Now</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-amber-600 to-yellow-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-xl" />
                </Link>
                <p className="text-amber-400/80 text-sm mt-4 font-medium">
                  Instant access to all premium bots and features
                </p>
              </div>
            </div>
          </section>
        )}
      </AnimatedSection>

      {/* Transition Divider - Premium Bots to Works Seamlessly */}
      <div className="relative h-6 bg-gradient-to-b from-[#0f1f4a] via-[#0f172a] to-[#050816]">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-600/10 to-transparent"></div>
      </div>

      {/* Works Seamlessly on MT5 */}
      <AnimatedSection>
        {(isVisible) => (
          <section className="relative bg-gradient-to-b from-[#0f1f4a] via-[#0f172a] to-[#050816] py-20 border-t border-blue-400/10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-5xl">
                {/* Header */}
                <div className={`text-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <div className="inline-flex items-center justify-center mb-6">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-blue-600/20 blur-xl"></div>
                      <div className="relative rounded-full border border-blue-500/30 bg-gradient-to-br from-blue-600/20 to-blue-800/20 p-4">
                        <svg className="w-12 h-12 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                    Works Seamlessly on MT5
                  </h2>
                  <p className="mt-4 text-lg leading-8 text-gray-300 max-w-2xl mx-auto">
                    Our bots are fully compatible with MetaTrader 5. Just load them into your platform and start testing or trading.
                  </p>
                </div>

                {/* Feature Grid */}
                <div className={`mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                     style={{ transitionDelay: isVisible ? '200ms' : '0ms' }}>
                  {[
                    {
                      icon: (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      ),
                      title: "Easy Installation",
                      description: "Drag and drop into your MT5 platform"
                    },
                    {
                      icon: (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                      ),
                      title: "Instant Testing",
                      description: "Run backtests immediately after setup"
                    },
                    {
                      icon: (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      ),
                      title: "Live Trading Ready",
                      description: "Deploy on demo or live accounts"
                    }
                  ].map((feature, index) => (
                    <div
                      key={feature.title}
                      className="group relative overflow-hidden rounded-xl border border-blue-600/25 bg-gradient-to-br from-blue-950/30 via-[#0f1f4a]/20 to-blue-900/20 p-6 backdrop-blur-sm transition-all duration-300 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/10 hover:scale-[1.02]"
                      style={{ transitionDelay: isVisible ? `${300 + index * 100}ms` : '0ms' }}
                    >
                      <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-blue-600/10 via-blue-700/10 to-blue-600/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"></div>
                      <div className="relative">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex-shrink-0 rounded-lg border border-blue-500/30 bg-gradient-to-br from-blue-600/25 to-blue-800/25 p-3 group-hover:from-blue-600/35 group-hover:to-blue-800/35 transition-all duration-300">
                            <div className="text-blue-300 group-hover:text-blue-200 transition-colors duration-300">
                              {feature.icon}
                            </div>
                          </div>
                          <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Compatibility Badge */}
                <div className={`mt-10 flex justify-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                     style={{ transitionDelay: isVisible ? '600ms' : '0ms' }}>
                  <div className="inline-flex items-center gap-3 rounded-full border border-blue-500/30 bg-black/20 px-6 py-3 backdrop-blur-sm">
                    <svg className="w-5 h-5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm font-medium text-gray-200">100% Compatible with MetaTrader 5</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </AnimatedSection>

      {/* Transition Divider - Works Seamlessly to Smarter Safer */}
      <div className="relative h-6 bg-gradient-to-b from-[#050816] via-[#0a0e27] to-[#050816]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(59,130,246,0.02),transparent)]"></div>
      </div>

      {/* Smarter, Safer Trading with Built-in Controls */}
      <AnimatedSection>
        {(isVisible) => (
          <section className="relative bg-gradient-to-b from-[#050816] via-[#0a0e27] to-[#050816] py-20 border-t border-blue-400/10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
                <div className="lg:col-span-7">
            <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Smarter, Safer Trading with Built-in Controls
              </h2>
              <p className="mt-4 text-lg leading-8 text-gray-300">
                Each bot comes with advanced safety and customization features:
              </p>
            </div>

            <ul className={`mt-6 space-y-3 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ transitionDelay: isVisible ? '200ms' : '0ms' }}>
              {[
                ["Trailing Stop Losses", "lock in profits as the trade moves"],
                ["Daily Profit & Loss Limits", "stop trading after your preset gain or loss"],
                ["Max Trades Per Day", "prevent overtrading"],
                ["Time Filters", "restrict trading to your preferred hours"],
                ["No-Martingale Mode", "avoid risky compounding"],
                ["Custom Lot Sizing", "full control over position size"],
                ["News Filter (in selected bots)", "avoid trading during high volatility events"],
              ].map(([title, desc]) => (
                <li key={title} className="flex gap-3">
                  <div className="mt-1.5 h-5 w-5 flex-shrink-0 rounded-md border border-blue-500/30 bg-gradient-to-br from-blue-600/25 to-blue-800/25 flex items-center justify-center">
                    <svg className="h-3.5 w-3.5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="text-gray-300">
                    <span className="font-semibold text-white">{title}</span>{" "}
                    <span className="text-gray-300">– {desc}</span>
                  </div>
                </li>
              ))}
            </ul>

            <div className={`mt-10 flex flex-col gap-3 sm:flex-row sm:items-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                 style={{ transitionDelay: isVisible ? '400ms' : '0ms' }}>
              <Link
                href="/bundle-offer"
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r from-blue-700 to-blue-600 px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:from-blue-600 hover:to-blue-500 hover:shadow-[0_0_34px_rgba(59,130,246,0.65)] hover:scale-[1.03] border border-blue-600/30"
              >
                <span className="relative z-10 flex flex-col items-center leading-tight">
                  <span className="text-white/70 line-through text-base">$399</span>
                  <span className="text-xs text-gray-300/90 uppercase tracking-wider mt-0.5">Limited time</span>
                  <span className="text-amber-300 font-semibold">Buy for $259</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </Link>
              <div className="text-sm text-gray-400">
                Safety-first controls built into every bot.
              </div>
            </div>
          </div>

                <div className={`lg:col-span-5 transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
               style={{ transitionDelay: isVisible ? '300ms' : '0ms' }}>
            <div className="relative overflow-hidden rounded-2xl border border-blue-600/25 bg-gradient-to-br from-blue-950/30 via-[#0f1f4a]/25 to-blue-900/20 p-6 shadow-xl shadow-blue-900/10">
              <div className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-600/15 via-blue-700/15 to-blue-600/15 blur-xl" />

              {/* Inline illustration: safety + automation + charts */}
              <svg
                className="relative h-auto w-full"
                viewBox="0 0 520 420"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Safety and automation illustration"
              >
                <defs>
                  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#0b1026" />
                    <stop offset="55%" stopColor="#0f1f4a" />
                    <stop offset="100%" stopColor="#0f172a" />
                  </linearGradient>
                  <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.95" />
                    <stop offset="55%" stopColor="#60a5fa" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#1e40af" stopOpacity="0.9" />
                  </linearGradient>
                  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="10" result="blur" />
                    <feColorMatrix
                      in="blur"
                      type="matrix"
                      values="0 0 0 0 0.23  0 0 0 0 0.51  0 0 0 0 0.96  0 0 0 0.35 0"
                      result="blueGlow"
                    />
                    <feMerge>
                      <feMergeNode in="blueGlow" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Card background */}
                <rect x="18" y="18" width="484" height="384" rx="24" fill="url(#bg)" stroke="rgba(59,130,246,0.25)" />

                {/* Grid */}
                <g opacity="0.35">
                  {Array.from({ length: 11 }).map((_, i) => (
                    <line
                      key={`h-${i}`}
                      x1="38"
                      y1={60 + i * 30}
                      x2="482"
                      y2={60 + i * 30}
                      stroke="rgba(59,130,246,0.15)"
                      strokeWidth="1"
                    />
                  ))}
                  {Array.from({ length: 13 }).map((_, i) => (
                    <line
                      key={`v-${i}`}
                      x1={38 + i * 35}
                      y1="50"
                      x2={38 + i * 35}
                      y2="372"
                      stroke="rgba(59,130,246,0.10)"
                      strokeWidth="1"
                    />
                  ))}
                </g>

                {/* Chart line */}
                <path
                  d="M55 320 C95 295 120 310 150 275 C190 228 225 265 260 210 C295 160 330 190 360 155 C395 115 430 145 468 95"
                  stroke="url(#accent)"
                  strokeWidth="4"
                  fill="none"
                  filter="url(#glow)"
                />
                <path
                  d="M55 320 C95 295 120 310 150 275 C190 228 225 265 260 210 C295 160 330 190 360 155 C395 115 430 145 468 95 L468 372 L55 372 Z"
                  fill="rgba(59,130,246,0.08)"
                />

                {/* Shield */}
                <g transform="translate(70 80)" filter="url(#glow)">
                  <path
                    d="M90 0 L160 30 V110 C160 165 122 205 90 220 C58 205 20 165 20 110 V30 L90 0Z"
                    fill="rgba(91,33,182,0.18)"
                    stroke="rgba(96,165,250,0.6)"
                    strokeWidth="2"
                  />
                  <path
                    d="M60 110l20 20 45-55"
                    stroke="rgba(191,219,254,0.95)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>

                {/* Control sliders */}
                <g transform="translate(270 85)">
                  {[
                    { y: 0, x: 120 },
                    { y: 42, x: 70 },
                    { y: 84, x: 150 },
                  ].map((row, idx) => (
                    <g key={`s-${idx}`}>
                      <rect x="0" y={row.y} width="200" height="10" rx="5" fill="rgba(59,130,246,0.15)" />
                      <rect x="0" y={row.y} width={row.x} height="10" rx="5" fill="rgba(59,130,246,0.55)" />
                      <circle cx={row.x} cy={row.y + 5} r="10" fill="rgba(91,33,182,0.55)" stroke="rgba(191,219,254,0.8)" />
                    </g>
                  ))}
                </g>

                {/* Small robot/automation node */}
                <g transform="translate(305 250)">
                  <rect x="0" y="0" width="150" height="95" rx="18" fill="rgba(15,23,42,0.55)" stroke="rgba(59,130,246,0.25)" />
                  <circle cx="40" cy="38" r="10" fill="rgba(96,165,250,0.85)" />
                  <circle cx="75" cy="38" r="10" fill="rgba(96,165,250,0.85)" />
                  <path d="M30 70c16 14 48 14 64 0" stroke="rgba(191,219,254,0.75)" strokeWidth="4" strokeLinecap="round" />
                  <path d="M75 -10v18" stroke="rgba(59,130,246,0.4)" strokeWidth="4" strokeLinecap="round" />
                  <circle cx="75" cy="-14" r="8" fill="rgba(59,130,246,0.25)" stroke="rgba(96,165,250,0.6)" />
                </g>
              </svg>
            </div>
          </div>
        </div>
            </div>
          </section>
        )}
      </AnimatedSection>

      {/* Transition Divider - Smarter Safer to Bonus */}
      <div className="relative h-6 bg-gradient-to-b from-[#050816] via-[#0f172a] to-[#050816]">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,transparent_30%,rgba(59,130,246,0.01)_50%,transparent_70%)]"></div>
      </div>

      {/* Bonus Section */}
      <AnimatedSection>
        {(isVisible) => (
          <section className="relative bg-gradient-to-b from-[#0f1f4a] via-[#0f172a] to-[#050816] py-20 border-t border-blue-400/10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-5xl">
                <div className="relative overflow-hidden rounded-2xl border border-blue-600/25 bg-gradient-to-br from-blue-950/35 via-[#0f1f4a]/25 to-blue-900/20 p-8 shadow-xl shadow-blue-900/10">
                  <div className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-600/15 via-blue-700/15 to-blue-600/15 blur-xl" />
                  <div className="relative">
                    <div
                      className={`inline-flex items-center rounded-full border border-blue-500/25 bg-black/20 px-4 py-1.5 text-xs font-semibold tracking-wider text-blue-200/80 transition-all duration-700 ${
                        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
                      }`}
                    >
                      Bonus
                    </div>

                    <div
                      className={`mt-4 transition-all duration-700 ${
                        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                      }`}
                    >
                      <h2 className="text-2xl sm:text-3xl font-bold text-white">
                        BONUS: Strategy Testing Guide Included
                      </h2>
                      <p className="mt-4 text-gray-300 text-base sm:text-lg leading-relaxed">
                        Not sure how to test bots? We include a simple guide on how to run backtests in MT4 &amp; MT5, find
                        the best parameters, and analyze performance even if you’re just starting out.
                      </p>
                    </div>

                    <div
                      className={`mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 transition-all duration-700 ${
                        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                      }`}
                      style={{ transitionDelay: isVisible ? "200ms" : "0ms" }}
                    >
                      {[
                        "Free Strategy Testing Guide",
                        "Free Telegram Support Group",
                        "Lifetime access",
                      ].map((item) => (
                        <div
                          key={item}
                          className="rounded-xl border border-blue-600/15 bg-black/20 px-5 py-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg border border-blue-500/30 bg-gradient-to-br from-blue-600/25 to-blue-800/25 flex items-center justify-center">
                              <svg className="h-5 w-5 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <div className="text-white font-semibold">{item}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </AnimatedSection>

      {/* Transition Divider - Bonus to Access & Purchase */}
      <div className="relative h-8 bg-gradient-to-b from-[#050816] via-[#0a0e27] to-[#050816]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(59,130,246,0.03),transparent)]"></div>
      </div>

      {/* Access & Purchase Section */}
      <AnimatedSection>
        {(isVisible) => (
          <section className="relative bg-gradient-to-b from-[#050816] via-[#0a0e27] to-[#050816] py-20 border-t border-blue-400/10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-5xl">
                <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
                  <div className="lg:col-span-7">
                  <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                      Get Instant Access to All 10+ Bots
                    </h2>
                  </div>

                  <ul className={`mt-6 space-y-3 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                      style={{ transitionDelay: isVisible ? '200ms' : '0ms' }}>
                {[
                  "One-Time Payment – No Recurring Fees",
                  "Immediate Download",
                  "Lifetime Access & Updates",
                  "Works on All Account Types",
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <div className="mt-1.5 h-5 w-5 flex-shrink-0 rounded-md border border-blue-500/30 bg-gradient-to-br from-blue-600/25 to-blue-800/25 flex items-center justify-center">
                      <svg className="h-3.5 w-3.5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="text-gray-300">{item}</div>
                  </li>
                ))}
              </ul>

                  <div className={`mt-10 flex flex-col gap-4 sm:flex-row sm:items-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                       style={{ transitionDelay: isVisible ? '400ms' : '0ms' }}>
                    <button
                      onClick={handleGetBundle}
                      className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r from-blue-700 to-blue-600 px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:from-blue-600 hover:to-blue-500 hover:shadow-[0_0_34px_rgba(59,130,246,0.65)] hover:scale-[1.03] border border-blue-600/30"
                    >
                      <span className="relative z-10">Get the Bundle</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </button>

                    <div className="text-sm text-gray-400">
                      Secure checkout. Instant access.
                    </div>
                  </div>
                  </div>

                  <div className={`lg:col-span-5 transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
                     style={{ transitionDelay: isVisible ? '300ms' : '0ms' }}>
                  <div className="relative overflow-hidden rounded-2xl border border-blue-600/25 bg-gradient-to-br from-blue-950/35 via-[#0f1f4a]/25 to-blue-900/20 p-8 shadow-xl shadow-blue-900/10">
                    <div className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-600/15 via-blue-700/15 to-blue-600/15 blur-xl" />
                    <div className="relative">
                      <div className="text-sm text-gray-300">Only</div>
                      <div className="mt-2 flex flex-col items-start gap-0.5 border-l-2 border-amber-500/30 pl-3">
                        <div className="text-2xl font-bold text-white/60 line-through">€399</div>
                        <span className="text-xs text-gray-400 uppercase tracking-wider">Today&apos;s price</span>
                        <div className="text-5xl font-bold text-amber-300">€259</div>
                      </div>
                      <div className="mt-4 text-gray-300">
                        One-time payment • Immediate download • Lifetime access
                      </div>
                    </div>
                  </div>
                  </div>
              </div>
            </div>
            </div>
          </section>
        )}
      </AnimatedSection>

      {/* Transition Divider - Access & Purchase to PDF */}
      <div className="relative h-8 bg-gradient-to-b from-[#050816] via-[#0f172a] to-[#050816]">
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(59,130,246,0.02)_0%,transparent_100%)]"></div>
      </div>

      {/* PDF Download Section (existing design/functionality) */}
      <AnimatedSection>
        {(isVisible) => (
          <div className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <EmailSubscriptionSection />
          </div>
        )}
      </AnimatedSection>
    </main>
  );
}

function EmailSubscriptionSection() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState("");

  const validateEmail = (emailValue: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailValue.trim() || !emailRegex.test(emailValue)) {
      setEmailError("Enter a valid email address.");
      return false;
    }
    
    setEmailError("");
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    // Clear error when user starts typing
    if (emailError) {
      setEmailError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/send-pdf-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setEmailError(data.error || 'Failed to send email. Please try again.');
        setIsSubmitting(false);
        return;
      }

      setIsSubmitted(true);
      setIsSubmitting(false);
      logPdfGuideRequest('bundle_page');

      // Reset after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setEmail("");
        setEmailError("");
      }, 5000);
    } catch (error) {
      console.error('Error submitting email:', error);
      setEmailError('An error occurred. Please try again later.');
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-gradient-to-br from-[#050816] via-[#0f172a] via-[#0f1f4a] to-[#050816] py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl mb-4">
            Get Your Copy of &quot;Top 5 Trading Bots for MT5&quot; PDF!
          </h2>
          <p className="text-lg sm:text-xl text-gray-300">
            Enter your email and we&apos;ll send it right over.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={email}
                      onChange={handleEmailChange}
                      placeholder="Enter your email"
                      className={`flex-1 w-full rounded-lg border ${
                        emailError 
                          ? "border-red-500/60 bg-[#050816]" 
                          : "border-blue-600/40 bg-[#050816]"
                      } px-6 py-4 text-white placeholder-gray-500 focus:border-[#1e40af] focus:outline-none transition-colors`}
                    />
                    {emailError && (
                      <p className="mt-2 text-sm text-red-400 animate-fade-in">
                        {emailError}
                      </p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r from-blue-700 to-blue-600 px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:from-blue-600 hover:to-blue-500 hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] hover:scale-105 border border-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <span className="relative z-10">{isSubmitting ? "Sending..." : "Send Me the Guide"}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="text-center p-8 rounded-xl border border-green-500/50 bg-green-500/10 backdrop-blur-sm animate-fade-in">
              <div className="flex items-center justify-center gap-3 mb-2">
                <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-xl font-semibold text-green-400">
                  Successfully sent to your email!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

