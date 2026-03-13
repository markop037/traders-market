"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

/* ─── Scroll animation (same hook used across the site) ─── */

function useScrollAnimation(
  options = { threshold: 0.15, rootMargin: "0px 0px -100px 0px" }
) {
  const [isVisible, setIsVisible] = useState(false);
  const hasAnimated = useRef(false);
  const ref = useRef<HTMLDivElement>(null);
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  }, [options.threshold, options.rootMargin]);

  useEffect(() => {
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
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);

  return [ref, isVisible] as const;
}

function AnimatedSection({
  children,
}: {
  children: (isVisible: boolean) => React.ReactNode;
}) {
  const [ref, isVisible] = useScrollAnimation();
  return <div ref={ref}>{children(isVisible)}</div>;
}

/* ─── Data ─── */

const TOOLS = [
  {
    id: "previous-high-low-toolkit",
    name: "Daily/Weekly/Monthly High/Low Indicator",
    description:
      "Automatically displays Yesterday, Last Week, and Last Month High/Low levels directly on the chart for quick market reference.",
  },
  {
    id: "previous-high-low-toolkit-sessions",
    name: "Session High/Low Indicator",
    description:
      "Shows High and Low levels for the Asian, London, and New York trading sessions based on their respective timezones.",
  },
  {
    id: "session-marker",
    name: "Session Marker Indicator",
    description:
      "Highlights the Asian, London, and New York trading sessions directly on the chart by coloring the background, making it easy to see when each session is active.",
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
  const [heroRef, heroVisible] = useScrollAnimation();

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
    <main className="min-h-screen bg-gradient-to-b from-[#050816] via-[#050816] to-[#020617]">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-blue-900/40">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-blue-700/20 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(59,130,246,0.12),transparent_60%)]" />
        </div>

        <div
          ref={heroRef}
          className="relative mx-auto max-w-3xl px-4 pt-24 pb-16 text-center sm:px-6 sm:pt-28 sm:pb-20 lg:pt-32 lg:pb-24"
        >
          <p
            className={`inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-blue-200/90 transition-all duration-700 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            MT5 Trader Toolkit
          </p>

          <h1
            className={`mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl transition-all duration-700 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            style={{ transitionDelay: heroVisible ? "100ms" : "0ms" }}
          >
            Free MT5 Trader Toolkit
          </h1>
          <p
            className={`mx-auto mt-5 max-w-2xl text-base leading-relaxed text-gray-300 sm:text-lg transition-all duration-700 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            style={{ transitionDelay: heroVisible ? "200ms" : "0ms" }}
          >
            Download a bundle of practical indicators and utilities for
            MetaTrader&nbsp;5 — designed for discretionary traders.
            <br className="hidden sm:block" />
            Sessions markers, drawdown limiters, trade analytics and more.
          </p>

          <div
            className={`mt-8 flex flex-col items-center gap-3 transition-all duration-700 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            style={{ transitionDelay: heroVisible ? "300ms" : "0ms" }}
          >
            <button
              type="button"
              onClick={handleCtaClick}
              disabled={loading}
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:from-blue-600 hover:to-blue-500 hover:shadow-[0_0_24px_rgba(59,130,246,0.5)] hover:scale-[1.02] border border-blue-600/40 disabled:opacity-50 disabled:cursor-not-allowed sm:px-8 sm:py-3.5 sm:text-base"
            >
              {ctaLabel}
            </button>
            <p className="text-xs text-gray-400 sm:text-sm">
              No payment required. Instant download after signup.
            </p>
          </div>

          <div
            className={`mt-7 flex flex-col items-center gap-2 text-sm text-gray-300 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-6 sm:gap-y-2 transition-all duration-700 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            style={{ transitionDelay: heroVisible ? "400ms" : "0ms" }}
          >
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

      {/* ── What You Get ── */}
      <AnimatedSection>
        {(isVisible) => (
          <section className="relative border-b border-blue-900/40 bg-gradient-to-b from-[#020617] to-[#050816] py-14 sm:py-20 lg:py-24">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.08),transparent_55%)]" />
            <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <h2
                className={`text-2xl font-bold text-white sm:text-3xl transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
              >
                What You Get
              </h2>
              <div
                className={`mt-5 space-y-4 text-sm leading-relaxed text-gray-300 sm:text-base transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                style={{ transitionDelay: isVisible ? "150ms" : "0ms" }}
              >
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
        )}
      </AnimatedSection>

      {/* ── Indicator List ── */}
      <AnimatedSection>
        {(isVisible) => (
          <section className="relative border-b border-blue-900/40 bg-gradient-to-b from-[#050816] to-[#020617] py-14 sm:py-20 lg:py-24">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(15,118,110,0.1),transparent_60%)] opacity-70" />
            <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <h2
                className={`text-2xl font-bold text-white sm:text-3xl transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
              >
                Included Indicators
              </h2>
              <p
                className={`mt-2 text-sm text-gray-400 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                style={{ transitionDelay: isVisible ? "100ms" : "0ms" }}
              >
                All indicators are for MetaTrader&nbsp;5 (.ex5).
              </p>

              <div className="mt-8 grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                {TOOLS.map((tool, i) => (
                  <div
                    key={tool.id}
                    className={`group flex flex-col rounded-2xl border border-blue-700/30 bg-gradient-to-br from-blue-950/40 via-[#0b1120] to-blue-900/20 p-5 shadow-[0_0_20px_rgba(15,23,42,0.8)] transition-all duration-700 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-[0_0_28px_rgba(59,130,246,0.3)] sm:p-6 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                    style={{
                      transitionDelay: isVisible
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
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-gray-300">
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
        {(isVisible) => (
          <section className="relative border-b border-blue-900/40 bg-gradient-to-b from-[#020617] to-[#050816] py-14 sm:py-20 lg:py-24">
            <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <h2
                className={`text-2xl font-bold text-white sm:text-3xl transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
              >
                Built For MT5 Traders Who:
              </h2>
              <ul className="mt-6 space-y-4 text-sm text-gray-300 sm:text-base">
                {AUDIENCE.map((item, i) => (
                  <li
                    key={i}
                    className={`flex items-start gap-3 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                    style={{
                      transitionDelay: isVisible
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
        {(isVisible) => (
          <section className="relative border-b border-blue-900/40 bg-gradient-to-b from-[#050816] to-[#020617] py-14 sm:py-20 lg:py-24">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.06),transparent_55%)]" />
            <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <h2
                className={`text-2xl font-bold text-white sm:text-3xl transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
              >
                How It Works
              </h2>

              <div className="mt-8 space-y-4 sm:space-y-5">
                {STEPS.map((step, i) => (
                  <div
                    key={step.number}
                    className={`flex items-start gap-3 rounded-xl border border-blue-900/30 bg-blue-950/20 p-4 transition-all duration-700 hover:border-blue-800/40 sm:gap-4 sm:p-5 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                    style={{
                      transitionDelay: isVisible
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
        {(isVisible) => (
          <section className="relative border-b border-blue-900/40 bg-gradient-to-b from-[#020617] to-[#050816] py-14 sm:py-20 lg:py-24">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute bottom-0 left-1/2 h-60 w-[36rem] -translate-x-1/2 rounded-full bg-blue-700/10 blur-3xl" />
            </div>
            <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
              <h2
                className={`text-2xl font-bold text-white sm:text-3xl transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
              >
                Download the Free MT5 Trader Toolkit
              </h2>
              <p
                className={`mt-4 text-sm text-gray-300 sm:text-base transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                style={{ transitionDelay: isVisible ? "100ms" : "0ms" }}
              >
                Sessions markers, risk tools, analytics and more — all designed
                for active traders.
              </p>

              <div
                className={`mt-8 flex flex-col items-center gap-3 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                style={{ transitionDelay: isVisible ? "200ms" : "0ms" }}
              >
                <button
                  type="button"
                  onClick={handleCtaClick}
                  disabled={loading}
                  className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:from-blue-600 hover:to-blue-500 hover:shadow-[0_0_24px_rgba(59,130,246,0.5)] hover:scale-[1.02] border border-blue-600/40 disabled:opacity-50 disabled:cursor-not-allowed sm:px-8 sm:py-3.5 sm:text-base"
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
        {(isVisible) => (
          <section className="py-14 sm:py-20 lg:py-24">
            <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
              <div
                className={`rounded-2xl border border-blue-900/30 bg-blue-950/20 px-5 py-7 transition-all duration-700 sm:px-6 sm:py-8 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
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
    </main>
  );
}
