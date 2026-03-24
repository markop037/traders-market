"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ImageLightboxModal } from "../components/ImageLightboxModal";
import { AnimatedSection, reveal } from "@/lib/scrollReveal";

/* ─── Indicator image slider (marketing page only) ─── */

const INDICATOR_IMAGE_BASE: Record<string, string> = {
  "session-marker": "SessionMarker",
  "previous-high-low-toolkit-sessions": "SessionHighLow",
  "previous-high-low-toolkit": "DailyWeeklyMonthlyHighLow",
  "atr-stop-loss-indicator": "ATRStopLoss",
  "drawdown-limiter-indicator": "DrawdownLimiter",
  "risk-reward-visualizer-indicator": "RiskRewardVisualizer",
  "pair-history-analyzer-indicator": "PairHistoryAnalyzer",
  "swing-high-low-scanner-indicator": "SwingHighLowScanner",
};

function getIndicatorImages(id: string) {
  const base = INDICATOR_IMAGE_BASE[id];
  if (!base) return [];
  const folder = encodeURI("/Indicators sc");
  return [`${folder}/${base}-1.png`, `${folder}/${base}-2.png`];
}

function IndicatorImageSlider({ id, name }: { id: string; name: string }) {
  const images = getIndicatorImages(id);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  if (images.length === 0) return null;

  const goToPrevious = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="relative mt-4 w-full min-w-0 max-w-full">
      <div className="relative aspect-[16/9] w-full max-w-full rounded-lg overflow-hidden bg-gradient-to-br from-slate-900/90 to-black/90 border border-blue-500/20">
        <button
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          className="absolute inset-0 flex items-center justify-center w-full h-full cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-inset rounded-lg"
          aria-label="View image full screen"
        >
          <img
            src={images[currentIndex]}
            alt={`${name} screenshot ${currentIndex + 1}`}
            className="max-h-full max-w-full h-full w-full object-contain pointer-events-none"
            loading="lazy"
            decoding="async"
          />
        </button>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-blue-500/30 flex items-center justify-center text-white hover:bg-blue-600/30 hover:border-blue-500/50 transition-all duration-300 group/nav"
              aria-label="Previous image"
            >
              <svg className="w-5 h-5 group-hover/nav:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              type="button"
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-blue-500/30 flex items-center justify-center text-white hover:bg-blue-600/30 hover:border-blue-500/50 transition-all duration-300 group/nav"
              aria-label="Next image"
            >
              <svg className="w-5 h-5 group-hover/nav:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentIndex(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? "bg-blue-400 w-6"
                    : "bg-gray-500/50 hover:bg-gray-400/70"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}

        {images.length > 1 && (
          <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-blue-500/30">
            <span className="text-xs text-blue-400 font-mono">
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
        altPrefix={name}
        strategyName={name}
      />
    </div>
  );
}

/* ─── Data ─── */

const TOOLS = [
  {
    id: "previous-high-low-toolkit",
    name: "Daily/Weekly/Monthly High/Low Indicator",
    description:
      "Displays the previous Daily, Weekly, and Monthly High and Low levels directly on the chart. The indicator automatically marks these key market levels and extends them until the first touch or break, helping traders easily identify important support and resistance zones based on higher-timeframe price action.",
  },
  {
    id: "previous-high-low-toolkit-sessions",
    name: "Session High/Low Indicator",
    description:
      "Displays the High and Low levels of major trading sessions directly on the chart. The indicator tracks sessions such as New York, London, and Tokyo and marks their price ranges, allowing traders to quickly identify session liquidity zones, potential breakout areas, and important intraday support and resistance levels.",
  },
  {
    id: "session-marker",
    name: "Session Marker Indicator",
    description:
      "Highlights the major trading sessions directly on the chart by shading the background for New York, London, and Tokyo sessions. This makes it easy to visually track when each market session is active and identify periods of increased volatility and trading opportunities.",
  },
  {
    id: "atr-stop-loss-indicator",
    name: "ATR Stop Loss Indicator",
    description:
      "Displays volatility-based stop loss levels directly on the chart using the Average True Range (ATR). The indicator calculates and shows multiple ATR-based levels for both BUY and SELL scenarios, helping traders quickly determine logical stop loss distances based on current market volatility.",
  },
  {
    id: "drawdown-limiter-indicator",
    name: "Drawdown Limiter Indicator",
    description:
      "Monitors account equity in real time and tracks both drawdown and profit percentages based on peak or daily reset equity. The indicator displays a customizable on-chart info panel and automatically triggers alerts when predefined risk or profit thresholds are reached, helping traders stay within their risk management rules without executing any trades.",
  },
  {
    id: "risk-reward-visualizer-indicator",
    name: "Risk Reward Visualizer Indicator",
    description:
      "Displays entry, stop loss, and multiple risk-to-reward target levels (1R, 2R, 3R, 5R) directly on the chart. The indicator dynamically calculates and visualizes trade structure, showing key price levels and an info panel with risk metrics, allowing traders to clearly plan and evaluate trade setups based on risk-to-reward ratios.",
  },
  {
    id: "pair-history-analyzer-indicator",
    name: "Pair History Analyzer Indicator",
    description:
      "Displays comprehensive statistics of closed trades for the current symbol directly on the chart. The indicator analyzes historical performance within a customizable date range and presents key metrics such as total number of trades, win rate, average profit and loss, risk-to-reward ratio, profit factor, and overall net result. With built-in filters for trade direction and flexible display options (pips, currency, or percentage), it helps traders quickly evaluate strategy effectiveness and gain deeper insight into their trading performance.",
  },
  {
    id: "swing-high-low-scanner-indicator",
    name: "Swing High/Low Scanner Indicator",
    description:
      "Scans price history in real time and automatically identifies confirmed Swing High and Swing Low points based on a configurable lookback period. The indicator marks each detected swing directly on the chart with color-coded labels and optional horizontal dotted rays projected forward in time, giving traders an instant visual map of key structural levels. All detections are non-repainting - a swing is only confirmed once the required number of candles have fully closed on both sides of the candidate bar, ensuring reliable and accurate level identification without false early signals.",
  },
];

const STEPS = [
  {
    number: "1",
    title: "Create a Free TradersMarket Account",
    text: "Takes less than 30 seconds.",
  },
  {
    number: "2",
    title: "Access the Indicator Bundle",
    text: "Download the full package of MT5 indicators.",
  },
  {
    number: "3",
    title: "Install in MetaTrader 5",
    text: "Simple installation instructions included.",
  },
];

const AUDIENCE = [
  <>Trade forex or futures using MetaTrader&nbsp;5</>,
  "Want simple tools to improve chart analysis",
  "Trade prop firm accounts and need risk limits",
  <>Prefer lightweight indicators that don&apos;t slow down MT5</>,
];

/* ─── Page ─── */

export default function IndicatorsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleCtaClick = () => {
    if (loading) return;
    if (user) {
      router.push("/dashboard/indicators");
    } else {
      router.push("/signup");
    }
  };

  const ctaLabel = user
    ? "Go to Downloads"
    : "Create Free Account to Download";
  const ctaLabelShort = user ? "Go to Downloads" : "Create Free Account";

  return (
    <div className="min-h-screen w-full min-w-0 max-w-[100vw] overflow-x-clip bg-gradient-to-b from-[#050816] via-[#050816] to-[#020617]">
      {/* ── Hero ── */}
      <section className="relative overflow-x-clip border-b border-blue-900/40">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 left-1/2 h-72 w-[min(42rem,100vw)] max-w-[100vw] -translate-x-1/2 rounded-full bg-blue-700/20 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(59,130,246,0.12),transparent_60%)]" />
        </div>

        <div className="relative mx-auto w-full min-w-0 max-w-3xl px-4 pt-24 pb-16 text-center sm:px-6 sm:pt-28 sm:pb-20 lg:pt-32 lg:pb-24">
          <p className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-blue-200/90">
            MT5 Trader Toolkit
          </p>

          <h1 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Free MT5 Trader Toolkit
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-gray-300 sm:text-lg">
            Download a bundle of practical indicators and utilities for
            MetaTrader&nbsp;5 — designed for discretionary traders.
            <br className="hidden sm:block" />
            Sessions markers, drawdown limiters, trade analytics and more.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={handleCtaClick}
              disabled={loading}
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-3 text-sm font-semibold text-white transition-[transform,box-shadow,background-color] duration-300 hover:from-blue-600 hover:to-blue-500 hover:shadow-[0_0_24px_rgba(59,130,246,0.5)] hover:scale-[1.02] border border-blue-600/40 disabled:opacity-50 disabled:cursor-not-allowed sm:px-8 sm:py-3.5 sm:text-base"
            >
              {ctaLabel}
            </button>
            <p className="text-xs text-gray-400 sm:text-sm">
              No payment required. Instant download after signup.
            </p>
          </div>

          <div className="mt-7 flex flex-col items-center gap-2 text-sm text-gray-300 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-6 sm:gap-y-2">
            {["MT5 compatible", "Free lifetime access", "Simple installation guide"].map((label) => (
              <span key={label} className="flex items-center gap-1.5">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300 text-[10px] border border-emerald-500/30">
                  &#10003;
                </span>
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── What You Get (no scroll-in: often visible with hero on first paint) ── */}
      <section className="relative overflow-x-clip border-b border-blue-900/40 bg-gradient-to-b from-[#020617] to-[#050816] py-14 sm:py-20 lg:py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.08),transparent_55%)]" />
        <div className="relative mx-auto w-full min-w-0 max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            What You Get
          </h2>
          <div className="mt-5 space-y-4 text-sm leading-relaxed text-gray-300 sm:text-base">
            <p>
              This bundle contains a set of useful MetaTrader&nbsp;5
              indicators and utilities that help traders analyze markets and
              manage risk.
            </p>
            <p>
              These tools were built for active FX and futures traders who
              want practical chart tools without unnecessary complexity.
            </p>
            <p>
              You can download the entire bundle after creating a free
              TradersMarket account.
            </p>
          </div>
        </div>
      </section>

      {/* ── Indicator List ── */}
      <AnimatedSection options={{ threshold: 0.02 }}>
        {({ isVisible, animateEntrance }) => (
          <section className="relative overflow-x-clip border-b border-blue-900/40 bg-gradient-to-b from-[#050816] to-[#020617] py-14 sm:py-20 lg:py-24">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(15,118,110,0.1),transparent_60%)] opacity-70" />
            <div className="relative mx-auto w-full min-w-0 max-w-5xl px-4 sm:px-6 lg:px-8">
              <h2
                className={`text-2xl font-bold text-white sm:text-3xl ${reveal(isVisible, animateEntrance)("opacity-0 translate-y-6", "opacity-100 translate-y-0")}`}
              >
                Included Indicators
              </h2>
              <p
                className={`mt-2 text-sm text-gray-400 ${reveal(isVisible, animateEntrance)("opacity-0 translate-y-6", "opacity-100 translate-y-0")}`}
                style={{ transitionDelay: isVisible && animateEntrance ? "100ms" : "0ms" }}
              >
                All indicators are for MetaTrader&nbsp;5 (.ex5).
              </p>

              <div className="mt-8 grid grid-cols-1 gap-6 sm:gap-7 md:grid-cols-2">
                {TOOLS.map((tool, i) => (
                  <div
                    key={tool.id}
                    className={`group flex min-h-0 min-w-0 flex-col rounded-2xl border border-blue-700/30 bg-gradient-to-br from-blue-950/50 via-[#020617] to-blue-900/40 p-6 shadow-[0_0_24px_rgba(15,23,42,0.9)] hover:-translate-y-1.5 hover:border-blue-500/60 hover:shadow-[0_0_32px_rgba(59,130,246,0.35)] sm:p-7 min-h-[360px] ${reveal(isVisible, animateEntrance)("opacity-0 translate-y-6", "opacity-100 translate-y-0")} hover:transition-[opacity,transform,box-shadow] hover:duration-300`}
                    style={{
                      transitionDelay:
                        isVisible && animateEntrance
                          ? `${200 + i * 120}ms`
                          : "0ms",
                    }}
                  >
                    <p className="text-[11px] uppercase tracking-wide text-blue-300/80">
                      MT5 Indicator
                    </p>
                    <h3 className="mt-1.5 text-base font-semibold text-white sm:text-lg">
                      {tool.name}
                    </h3>
                    <IndicatorImageSlider id={tool.id} name={tool.name} />
                    <p className="mt-3 flex-1 break-words text-sm leading-relaxed text-gray-300">
                      {tool.description}
                    </p>
                    <div className="mt-5 flex items-center justify-between border-t border-blue-900/40 pt-4">
                      <span className="inline-block rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300">
                        Included free
                      </span>
                      <span className="text-[11px] text-gray-500">
                        MetaTrader 5
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </AnimatedSection>

      {/* ── Who This Is For ── */}
      <AnimatedSection>
        {({ isVisible, animateEntrance }) => (
          <section className="relative overflow-x-clip border-b border-blue-900/40 bg-gradient-to-b from-[#020617] to-[#050816] py-14 sm:py-20 lg:py-24">
            <div className="relative mx-auto w-full min-w-0 max-w-3xl px-4 sm:px-6 lg:px-8">
              <h2
                className={`text-2xl font-bold text-white sm:text-3xl ${reveal(isVisible, animateEntrance)("opacity-0 translate-y-6", "opacity-100 translate-y-0")}`}
              >
                Built For MT5 Traders Who:
              </h2>
              <ul className="mt-6 space-y-4 text-sm text-gray-300 sm:text-base">
                {AUDIENCE.map((item, i) => (
                  <li
                    key={i}
                    className={`flex items-start gap-3 ${reveal(isVisible, animateEntrance)("opacity-0 translate-y-4", "opacity-100 translate-y-0")}`}
                    style={{
                      transitionDelay:
                        isVisible && animateEntrance
                          ? `${150 + i * 100}ms`
                          : "0ms",
                    }}
                  >
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30 text-[11px]">
                      &#10003;
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </AnimatedSection>

      {/* ── How It Works ── */}
      <AnimatedSection>
        {({ isVisible, animateEntrance }) => (
          <section className="relative overflow-x-clip border-b border-blue-900/40 bg-gradient-to-b from-[#050816] to-[#020617] py-14 sm:py-20 lg:py-24">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.06),transparent_55%)]" />
            <div className="relative mx-auto w-full min-w-0 max-w-3xl px-4 sm:px-6 lg:px-8">
              <h2
                className={`text-2xl font-bold text-white sm:text-3xl ${reveal(isVisible, animateEntrance)("opacity-0 translate-y-6", "opacity-100 translate-y-0")}`}
              >
                How It Works
              </h2>

              <div className="mt-8 space-y-4 sm:space-y-5">
                {STEPS.map((step, i) => (
                  <div
                    key={step.number}
                    className={`flex items-start gap-3 rounded-xl border border-blue-900/30 bg-blue-950/20 p-4 sm:gap-4 sm:p-5 hover:border-blue-800/40 ${reveal(isVisible, animateEntrance)("opacity-0 translate-y-6", "opacity-100 translate-y-0")} hover:transition-colors hover:duration-300`}
                    style={{
                      transitionDelay:
                        isVisible && animateEntrance
                          ? `${150 + i * 120}ms`
                          : "0ms",
                    }}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/10 text-sm font-semibold text-emerald-300 sm:h-9 sm:w-9">
                      {step.number}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white sm:text-base">
                        {step.title}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-400 sm:mt-1 sm:text-sm">
                        {step.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </AnimatedSection>

      {/* ── Final CTA ── */}
      <AnimatedSection>
        {({ isVisible, animateEntrance }) => (
          <section className="relative overflow-x-clip border-b border-blue-900/40 bg-gradient-to-b from-[#020617] to-[#050816] py-14 sm:py-20 lg:py-24">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute bottom-0 left-1/2 h-60 w-[min(36rem,100vw)] max-w-[100vw] -translate-x-1/2 rounded-full bg-blue-700/10 blur-3xl" />
            </div>
            <div className="relative mx-auto w-full min-w-0 max-w-3xl px-4 text-center sm:px-6 lg:px-8">
              <h2
                className={`text-2xl font-bold text-white sm:text-3xl ${reveal(isVisible, animateEntrance)("opacity-0 translate-y-6", "opacity-100 translate-y-0")}`}
              >
                Download the Free MT5 Trader Toolkit
              </h2>
              <p
                className={`mt-4 text-sm text-gray-300 sm:text-base ${reveal(isVisible, animateEntrance)("opacity-0 translate-y-6", "opacity-100 translate-y-0")}`}
                style={{ transitionDelay: isVisible && animateEntrance ? "100ms" : "0ms" }}
              >
                Sessions markers, risk tools, analytics and more — all designed
                for active traders.
              </p>

              <div
                className={`mt-8 flex flex-col items-center gap-3 ${reveal(isVisible, animateEntrance)("opacity-0 translate-y-6", "opacity-100 translate-y-0")}`}
                style={{ transitionDelay: isVisible && animateEntrance ? "200ms" : "0ms" }}
              >
                <button
                  type="button"
                  onClick={handleCtaClick}
                  disabled={loading}
                  className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-3 text-sm font-semibold text-white transition-[transform,box-shadow,background-color] duration-300 hover:from-blue-600 hover:to-blue-500 hover:shadow-[0_0_24px_rgba(59,130,246,0.5)] hover:scale-[1.02] border border-blue-600/40 disabled:opacity-50 disabled:cursor-not-allowed sm:px-8 sm:py-3.5 sm:text-base"
                >
                  {ctaLabelShort}
                </button>
                <p className="text-xs text-gray-400 sm:text-sm">
                  Instant download after signup.
                </p>
              </div>
            </div>
          </section>
        )}
      </AnimatedSection>

      {/* ── Trust ── */}
      <AnimatedSection>
        {({ isVisible, animateEntrance }) => (
          <section className="overflow-x-clip py-14 sm:py-20 lg:py-24">
            <div className="mx-auto w-full min-w-0 max-w-3xl px-4 text-center sm:px-6 lg:px-8">
              <div
                className={`rounded-2xl border border-blue-900/30 bg-blue-950/20 px-5 py-7 sm:px-6 sm:py-8 ${reveal(isVisible, animateEntrance)("opacity-0 translate-y-6", "opacity-100 translate-y-0")}`}
              >
                <p className="text-sm font-medium text-gray-300">
                  No upsells. No hidden payments.
                </p>
                <p className="mt-2 text-xs text-gray-400 sm:text-sm">
                  We built these tools for our own trading and decided to share
                  them with the TradersMarket community.
                </p>
              </div>
            </div>
          </section>
        )}
      </AnimatedSection>
    </div>
  );
}
