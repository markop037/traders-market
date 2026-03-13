"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

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

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#050816] via-[#050816] to-[#020617]">
      {/* Hero / Value Proposition */}
      <section className="relative overflow-hidden border-b border-blue-900/40">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-blue-700/20 blur-3xl" />
          <div className="absolute -bottom-40 right-[-10rem] h-80 w-80 rounded-full bg-indigo-800/20 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_30%_0%,rgba(59,130,246,0.18),transparent_60%)]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pt-20 pb-16 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] items-center">
            <div>
              <p className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-blue-200/90">
                Precision MT5 Indicators
              </p>
              <h1 className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl leading-tight">
                Turn Raw Price Action
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">
                  into Clear, Actionable Levels
                </span>
              </h1>
              <p className="mt-6 text-base sm:text-lg leading-relaxed text-gray-300 max-w-xl">
                Stop reacting late to what the market already did. Our MT5 indicator suite helps you read
                structure, sessions, volatility, and risk on a single glance — so every trade idea starts from
                clear, objective context instead of guesswork.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={handleCtaClick}
                  disabled={loading}
                  className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r from-blue-700 to-blue-600 px-8 py-3.5 text-sm sm:text-base font-semibold text-white transition-all duration-300 hover:from-blue-600 hover:to-blue-500 hover:shadow-[0_0_30px_rgba(59,130,246,0.65)] hover:scale-[1.02] border border-blue-600/40 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10">
                    Sign up and download all indicators for FREE!
                  </span>
                  <svg
                    className="relative z-10 ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-blue-700 to-blue-800 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </button>

                <div className="text-xs sm:text-sm text-gray-400">
                  <p className="font-medium text-gray-300">Free for all logged-in users.</p>
                  <p>No credit card required for indicators.</p>
                </div>
              </div>

              <div className="mt-8 grid gap-4 text-xs sm:text-sm text-gray-300 sm:grid-cols-3 max-w-2xl">
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/40 text-[11px]">
                    1
                  </span>
                  <p>
                    <span className="font-semibold text-white">See the story of price instantly</span> – key
                    zones, swings, and session behavior visualized for you instead of buried in raw candles.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/40 text-[11px]">
                    2
                  </span>
                  <p>
                    <span className="font-semibold text-white">Make cleaner, faster decisions</span> – know
                    when market conditions support your plan, when risk is elevated, and when to simply stay out.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/40 text-[11px]">
                    3
                  </span>
                  <p>
                    <span className="font-semibold text-white">Trade and review with confidence</span> – the
                    same objective visuals support your live trading, backtests, and journal so you can improve
                    with real data.
                  </p>
                </div>
              </div>
            </div>

            {/* Right column: simple visual summary */}
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-blue-500/10 via-cyan-400/5 to-emerald-400/5 blur-2xl" />
              <div className="relative rounded-3xl border border-blue-500/30 bg-gradient-to-br from-slate-950/90 via-[#020617] to-slate-950/90 p-6 shadow-[0_0_40px_rgba(15,23,42,0.9)]">
                <div className="mb-4 flex items-center justify-between text-xs text-gray-400">
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    EURUSD M15
                  </span>
                  <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] text-blue-200 border border-blue-500/30">
                    Levels + Sessions
                  </span>
                </div>
                <div className="aspect-[4/3] rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-black border border-blue-500/30 p-4 relative overflow-hidden">
                  {/* Horizontal levels */}
                  <div className="absolute inset-x-4 top-10 border-t border-emerald-400/70 border-dashed" />
                  <div className="absolute inset-x-4 top-24 border-t border-amber-300/70 border-dashed" />
                  <div className="absolute inset-x-4 top-40 border-t border-rose-400/70 border-dashed" />

                  {/* Session background blocks */}
                  <div className="absolute inset-y-6 left-4 w-1/3 rounded-md bg-blue-500/10 border border-blue-500/20" />
                  <div className="absolute inset-y-10 left-1/3 w-1/3 rounded-md bg-emerald-500/10 border border-emerald-500/20" />
                  <div className="absolute inset-y-8 right-4 w-1/3 rounded-md bg-fuchsia-500/10 border border-fuchsia-500/25" />

                  {/* Simple candles polyline */}
                  <svg
                    viewBox="0 0 300 160"
                    className="relative z-10 h-full w-full"
                    preserveAspectRatio="none"
                  >
                    <polyline
                      points="10,130 40,110 70,115 100,90 130,100 160,80 190,95 220,75 250,85 290,70"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  {/* Legend */}
                  <div className="absolute bottom-3 left-4 flex gap-2 text-[10px]">
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/70 px-2 py-0.5 border border-emerald-400/40 text-emerald-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Daily High/Low
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/70 px-2 py-0.5 border border-blue-400/40 text-blue-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                      London Session
                    </span>
                    <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-slate-900/70 px-2 py-0.5 border border-fuchsia-400/40 text-fuchsia-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400" />
                      New York Session
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-[11px] text-gray-300">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/40 text-[11px]">
                      85%
                    </span>
                    <p>
                      Of traders say they{" "}
                      <span className="font-semibold text-white">spot setups faster</span> with clear levels on
                      the chart.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/40 text-[11px]">
                      5m
                    </span>
                    <p>
                      Typical time to install and{" "}
                      <span className="font-semibold text-white">have all indicators running</span> in MT5.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits / Why these indicators */}
      <section className="relative border-b border-blue-900/40 bg-gradient-to-b from-[#020617] via-[#020617] to-[#020617] py-14 sm:py-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.28),_transparent_55%)] opacity-60" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Turn Your Charts into a Decision‑Making Dashboard
            </h2>
            <p className="mt-4 text-sm sm:text-base text-gray-300">
              Instead of stacking dozens of lagging indicators, this suite helps you{" "}
              <span className="font-semibold text-white">
                see where price is, where it&apos;s been, and when it tends to move
              </span>
              — combining structure, sessions, and volatility into a clean visual framework you can trust.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-blue-600/30 bg-blue-950/40 p-6">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20 text-blue-300 border border-blue-500/40">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">Stronger, more objective context</h3>
              <p className="mt-3 text-sm text-gray-300">
                Quickly understand where price sits within recent structure and major areas of interest so your
                entries, stops, and targets are based on logic — not lines drawn from memory or feeling.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-500/25 bg-emerald-950/10 p-6">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/40">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 7M7 13l-2.293 2.293A1 1 0 005.414 17H19m0 0a2 2 0 11-4 0m4 0a2 2 0 104 0"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">Cleaner charts, fewer blind spots</h3>
              <p className="mt-3 text-sm text-gray-300">
                With key information mapped visually — sessions, ranges, and reaction zones — you can spend less
                time redrawing the same things and more time focusing on risk, execution, and trade management.
              </p>
            </div>

            <div className="rounded-2xl border border-sky-500/25 bg-sky-950/10 p-6">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 text-sky-300 border border-sky-500/40">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-4-9h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">Built for analysis, execution & review</h3>
              <p className="mt-3 text-sm text-gray-300">
                The same visuals support your discretionary trading, automated systems, and post‑trade reviews,
                making it easier to refine strategies, pass prop evaluations, and scale what already works.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Individual indicator breakdown */}
      <section className="relative bg-gradient-to-b from-[#020617] via-[#020617] to-[#020617] py-16 sm:py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.2),_transparent_60%)] opacity-70" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8 sm:mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                What&apos;s Included in Your Indicator Suite
              </h2>
              <p className="mt-2 max-w-2xl text-sm sm:text-base text-gray-300">
                Your access unlocks a growing suite of professional MT5 indicators designed to help you read{" "}
                <span className="font-semibold text-white">market structure</span>,{" "}
                <span className="font-semibold text-white">identify key price zones</span>, and{" "}
                <span className="font-semibold text-white">understand session behavior and volatility</span> at
                a glance — so every decision is made with clearer context, not cluttered charts.
              </p>
            </div>
            <div className="text-xs sm:text-sm text-gray-400">
              <p className="text-gray-300 font-medium">Platform: MetaTrader 5 (MT5)</p>
              <p>Download instantly after signing in.</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {TOOLS.map((tool) => (
              <article
                key={tool.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-blue-700/35 bg-gradient-to-br from-blue-950/40 via-[#020617] to-blue-900/30 p-6 shadow-[0_0_22px_rgba(15,23,42,0.9)] transition-transform duration-300 hover:-translate-y-1 hover:border-blue-400/70 hover:shadow-[0_0_32px_rgba(59,130,246,0.65)]"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-blue-300/80">
                      MT5 Indicator
                    </p>
                    <h3 className="mt-1 text-lg sm:text-xl font-semibold text-white">
                      {tool.name}
                    </h3>
                  </div>
                  <span className="inline-flex items-center rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-200">
                    Included
                  </span>
                </div>

                <p className="mb-4 flex-1 text-sm leading-relaxed text-gray-300">
                  {tool.description}
                </p>

                <div className="mb-4 text-[11px] text-gray-300">
                  {tool.id === "previous-high-low-toolkit" && (
                    <ul className="space-y-1.5">
                      <li className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-400" />
                        <span>Auto‑plots prior day, week, and month highs/lows with clean labels.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-400" />
                        <span>Perfect for liquidity grabs, mean‑reversion, and breakout strategies.</span>
                      </li>
                    </ul>
                  )}
                  {tool.id === "previous-high-low-toolkit-sessions" && (
                    <ul className="space-y-1.5">
                      <li className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-400" />
                        <span>Draws Asian, London, and New York session highs/lows based on your settings.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-400" />
                        <span>Quickly see where each session expanded or respected prior ranges.</span>
                      </li>
                    </ul>
                  )}
                  {tool.id === "session-marker" && (
                    <ul className="space-y-1.5">
                      <li className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-400" />
                        <span>Color‑codes Asian, London, and New York sessions in the chart background.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-400" />
                        <span>Know instantly which session you&apos;re trading and how price behaved before.</span>
                      </li>
                    </ul>
                  )}
                </div>

                <div className="mt-auto flex items-center justify-between pt-2 border-t border-blue-900/50">
                  <div className="flex items-center gap-2 text-[11px] text-blue-200/80">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/15 text-[11px] font-semibold text-blue-200">
                      TM
                    </span>
                    <span>Part of the Traders Market indicator toolkit</span>
                  </div>
                  <span className="text-[11px] text-gray-400">
                    For MetaTrader 5 (MT5)
                  </span>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center gap-4 text-center">
            <button
              type="button"
              onClick={handleCtaClick}
              disabled={loading}
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r from-blue-700 to-blue-600 px-8 py-3.5 text-sm sm:text-base font-semibold text-white transition-all duration-300 hover:from-blue-600 hover:to-blue-500 hover:shadow-[0_0_30px_rgba(59,130,246,0.65)] hover:scale-[1.02] border border-blue-600/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10">
                Create your free account & unlock all indicators
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-blue-700 to-blue-800 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </button>
            <p className="text-xs sm:text-sm text-gray-400 max-w-md">
              Indicators are free for all logged‑in users. You can upgrade later if you decide to unlock the
              full bot bundle.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

