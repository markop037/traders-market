"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  UserPreferences,
  BotMatch,
  StrategyType,
  TimeframePreference,
  TradeFrequency,
  STRATEGY_LABELS,
  TIMEFRAME_LABELS,
  TRADE_FREQUENCY_LABELS,
} from "@/lib/bot-picker/types";
import { getTopMatches } from "@/lib/bot-picker/matching";
import {
  trackBotPickerStarted,
  trackBotPickerQuestionAnswered,
  trackBotPickerCompleted,
  trackBotPickerReset,
  trackBotPickerCtaClicked,
} from '@/lib/posthog';
import { useScrollReveal, reveal } from "@/lib/scrollReveal";

// ─── Option Card (reusable radio-style selector) ────────────────────────────
function OptionCard({
  label,
  sublabel,
  selected,
  onClick,
}: {
  label: string;
  sublabel?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative w-full text-left rounded-xl border p-4 transition-all duration-300 ${
        selected
          ? "border-blue-500/60 bg-gradient-to-br from-blue-950/55 via-[#0f1f4a]/45 to-blue-900/40 shadow-lg shadow-blue-900/25"
          : "border-blue-600/25 bg-gradient-to-br from-blue-950/20 via-[#0f1f4a]/15 to-blue-900/15 hover:border-blue-500/40 hover:shadow-md hover:shadow-blue-900/15"
      }`}
    >
      {/* Glow on selected */}
      <div
        className={`pointer-events-none absolute -inset-0.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 blur-xl transition-opacity duration-300 ${
          selected ? "opacity-15" : "opacity-0"
        }`}
      />
      <div className="relative flex items-center gap-3">
        {/* Radio dot */}
        <div
          className={`flex-shrink-0 h-5 w-5 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
            selected
              ? "border-blue-400 bg-blue-500/20"
              : "border-blue-600/40 bg-transparent group-hover:border-blue-500/50"
          }`}
        >
          <div
            className={`h-2.5 w-2.5 rounded-full bg-blue-400 transition-all duration-300 ${
              selected ? "scale-100 opacity-100" : "scale-0 opacity-0"
            }`}
          />
        </div>
        <div>
          <p
            className={`text-sm font-semibold transition-colors duration-300 ${
              selected ? "text-white" : "text-gray-200 group-hover:text-white"
            }`}
          >
            {label}
          </p>
          {sublabel && (
            <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>
          )}
        </div>
      </div>
    </button>
  );
}

// ─── Attribute Tag (bot profile visualiser) ──────────────────────────────────
function AttributeTag({
  label,
  matched,
}: {
  label: string;
  matched: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
        matched
          ? "border-blue-500/40 bg-blue-500/15 text-blue-300"
          : "border-blue-600/20 bg-blue-950/30 text-gray-400"
      }`}
    >
      {matched && (
        <svg
          className="w-3 h-3 text-blue-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M5 13l4 4L19 7"
          />
        </svg>
      )}
      {label}
    </span>
  );
}

// ─── Match Percentage Ring ───────────────────────────────────────────────────
function MatchRing({ percentage }: { percentage: number }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const color =
    percentage >= 80
      ? "text-green-400"
      : percentage >= 50
      ? "text-blue-400"
      : "text-gray-400";

  const strokeColor =
    percentage >= 80
      ? "stroke-green-400"
      : percentage >= 50
      ? "stroke-blue-400"
      : "stroke-gray-500";

  return (
    <div className="relative flex-shrink-0 w-16 h-16">
      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="rgba(59,130,246,0.15)"
          strokeWidth="4"
        />
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          className={strokeColor}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-sm font-bold ${color}`}>{percentage}%</span>
      </div>
    </div>
  );
}

// ─── Result Card ─────────────────────────────────────────────────────────────
function ResultCard({
  match,
  rank,
  delay,
}: {
  match: BotMatch;
  rank: number;
  delay: number;
}) {
  const { bot, matchPercentage, matchedAttributes } = match;

  const rankBadge =
    rank === 1
      ? "from-amber-500/25 to-yellow-600/25 border-amber-500/40 text-amber-400"
      : rank === 2
      ? "from-gray-400/20 to-gray-500/20 border-gray-400/40 text-gray-300"
      : "from-amber-700/20 to-amber-800/20 border-amber-700/40 text-amber-600";

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-blue-600/25 bg-gradient-to-br from-blue-950/30 via-[#0f1f4a]/20 to-blue-900/20 transition-all duration-500 hover:border-blue-500/45 hover:shadow-xl hover:shadow-blue-900/15 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-10" />

      <div className="relative p-6">
        <div className="flex items-start gap-4">
          {/* Match ring */}
          <MatchRing percentage={matchPercentage} />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {/* Rank badge */}
              <span
                className={`inline-flex items-center rounded-full bg-gradient-to-r ${rankBadge} border px-2.5 py-0.5 text-xs font-bold`}
              >
                #{rank}
              </span>
              {bot.isPremium && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-600/20 border border-amber-500/40 px-2.5 py-0.5 text-xs font-bold text-amber-400">
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Premium
                </span>
              )}
            </div>

            <h3 className="text-lg font-bold text-white leading-tight">
              {bot.name}
            </h3>
            <p className="mt-1 text-sm text-gray-400 leading-relaxed">
              {bot.description}
            </p>
          </div>
        </div>

        {/* Attribute tags */}
        <div className="mt-4 flex flex-wrap gap-2">
          <AttributeTag
            label={STRATEGY_LABELS[bot.strategyType]}
            matched={matchedAttributes.includes("strategy")}
          />
          <AttributeTag
            label={TIMEFRAME_LABELS[bot.timeframePreference]}
            matched={matchedAttributes.includes("timeframe")}
          />
          <AttributeTag
            label={TRADE_FREQUENCY_LABELS[bot.tradeFrequency]}
            matched={matchedAttributes.includes("tradeFrequency")}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function BotPickerPage() {
  const [heroRef, heroVisible, heroAnimateEntrance] = useScrollReveal({
    threshold: 0,
    rootMargin: "0px 0px 0px 0px",
  });

  const [preferences, setPreferences] = useState<UserPreferences>({
    strategyType: null,
    timeframePreference: null,
    tradeFrequency: null,
  });

  const [results, setResults] = useState<BotMatch[] | null>(null);
  const [showResults, setShowResults] = useState(false);

  const [resultsRef, resultsVisible, resultsAnimateEntrance] = useScrollReveal({
    threshold: 0.05,
    rootMargin: "0px",
    observeKey: showResults,
  });
  const hasStartedRef = useRef(false);

  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Count how many questions answered
  const answeredCount = [
    preferences.strategyType,
    preferences.timeframePreference,
    preferences.tradeFrequency,
  ].filter(Boolean).length;

  const canSubmit = answeredCount > 0;

  const trackQuestionIfFirst = () => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      trackBotPickerStarted();
    }
  };

  const handleFindBots = () => {
    const matches = getTopMatches(preferences, 3);
    setResults(matches);
    setShowResults(true);
    trackBotPickerCompleted(
      preferences.strategyType,
      preferences.timeframePreference,
      preferences.tradeFrequency,
      matches[0]?.bot.name || '',
    );

    setTimeout(() => {
      resultsContainerRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const handleReset = () => {
    setPreferences({
      strategyType: null,
      timeframePreference: null,
      tradeFrequency: null,
    });
    setResults(null);
    setShowResults(false);
    hasStartedRef.current = false;
    trackBotPickerReset();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#050816] via-[#0f172a] via-[#0f1f4a] to-[#050816]">
      {/* ── Hero / Intro ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-blue-600/10 blur-3xl" />
          <div className="absolute -bottom-40 right-[-10rem] h-80 w-80 rounded-full bg-blue-800/10 blur-3xl" />
        </div>

        <div
          ref={heroRef}
          className="mx-auto max-w-4xl px-4 pt-20 pb-12 sm:px-6 lg:px-8"
        >
          <div
            className={`text-center ${reveal(heroVisible, heroAnimateEntrance)("opacity-0 translate-y-4", "opacity-100 translate-y-0")}`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-500/30 mb-6">
              <svg
                className="w-5 h-5 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              <span className="text-blue-400 font-semibold text-sm uppercase tracking-wide">
                Bot Picker Tool
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl mb-4">
              Find Your{" "}
              <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-blue-400 bg-clip-text text-transparent">
                Perfect Trading Bot
              </span>
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Answer a few quick questions about your trading style and we'll
              recommend the best bots from our bundle for you.
            </p>
          </div>
        </div>
      </section>

      {/* ── Preference Questions ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Q1 — Strategy */}
          <div className="rounded-2xl border border-blue-600/25 bg-gradient-to-br from-blue-950/30 via-[#0f1f4a]/20 to-blue-900/20 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 h-8 w-8 rounded-lg border border-blue-500/30 bg-gradient-to-br from-blue-600/25 to-blue-800/25 flex items-center justify-center">
                <span className="text-sm font-bold text-blue-300">1</span>
              </div>
              <h2 className="text-lg font-semibold text-white">
                What strategy type do you prefer?
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(
                [
                  ["MEAN_REVERSION", "Mean Reversion", "Profits when price returns to average levels"],
                  ["TREND_FOLLOWING", "Trend Following", "Rides momentum in established market trends"],
                  ["BREAKOUT", "Breakout", "Catches explosive moves from consolidation zones"],
                ] as [StrategyType, string, string][]
              ).map(([value, label, sublabel]) => (
                <OptionCard
                  key={value}
                  label={label}
                  sublabel={sublabel}
                  selected={preferences.strategyType === value}
                  onClick={() => {
                    trackQuestionIfFirst();
                    const newVal = preferences.strategyType === value ? null : value;
                    if (newVal) trackBotPickerQuestionAnswered('strategy_type', label);
                    setPreferences((p) => ({ ...p, strategyType: newVal }));
                  }}
                />
              ))}
            </div>
          </div>

          {/* Q2 — Timeframe */}
          <div className="rounded-2xl border border-blue-600/25 bg-gradient-to-br from-blue-950/30 via-[#0f1f4a]/20 to-blue-900/20 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 h-8 w-8 rounded-lg border border-blue-500/30 bg-gradient-to-br from-blue-600/25 to-blue-800/25 flex items-center justify-center">
                <span className="text-sm font-bold text-blue-300">2</span>
              </div>
              <h2 className="text-lg font-semibold text-white">
                What timeframe do you prefer?
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(
                [
                  ["LOW", "Scalping", "M1 – M5 – M15 · Fast entries & exits"],
                  ["MEDIUM", "Intraday", "H1 – H4 · Trades within the day"],
                  ["HIGH", "Swing Trading", "H4 – Daily – Weekly · Multi-day holds"],
                ] as [TimeframePreference, string, string][]
              ).map(([value, label, sublabel]) => (
                <OptionCard
                  key={value}
                  label={label}
                  sublabel={sublabel}
                  selected={preferences.timeframePreference === value}
                  onClick={() => {
                    trackQuestionIfFirst();
                    const newVal = preferences.timeframePreference === value ? null : value;
                    if (newVal) trackBotPickerQuestionAnswered('timeframe', label);
                    setPreferences((p) => ({ ...p, timeframePreference: newVal }));
                  }}
                />
              ))}
            </div>
          </div>

          {/* Q3 — Trade Frequency */}
          <div className="rounded-2xl border border-blue-600/25 bg-gradient-to-br from-blue-950/30 via-[#0f1f4a]/20 to-blue-900/20 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 h-8 w-8 rounded-lg border border-blue-500/30 bg-gradient-to-br from-blue-600/25 to-blue-800/25 flex items-center justify-center">
                <span className="text-sm font-bold text-blue-300">3</span>
              </div>
              <h2 className="text-lg font-semibold text-white">
                How often should the bot trade?
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(
                [
                  ["LOW", "Few Trades", "~1–3 per week · High conviction setups"],
                  ["MEDIUM", "Moderate", "~1–3 per day · Balanced activity"],
                  ["HIGH", "Many Trades", "5+ per day · Frequent entries & exits"],
                ] as [TradeFrequency, string, string][]
              ).map(([value, label, sublabel]) => (
                <OptionCard
                  key={value}
                  label={label}
                  sublabel={sublabel}
                  selected={preferences.tradeFrequency === value}
                  onClick={() => {
                    trackQuestionIfFirst();
                    const newVal = preferences.tradeFrequency === value ? null : value;
                    if (newVal) trackBotPickerQuestionAnswered('trade_frequency', label);
                    setPreferences((p) => ({ ...p, tradeFrequency: newVal }));
                  }}
                />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center pt-2">
            <button
              onClick={handleFindBots}
              disabled={!canSubmit}
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r from-blue-700 to-blue-600 px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:from-blue-600 hover:to-blue-500 hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] hover:scale-105 border border-blue-600/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                Find My Bots
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </button>

            {answeredCount > 0 && (
              <button
                onClick={handleReset}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Reset selections
              </button>
            )}
          </div>

          {!canSubmit && (
            <p className="text-center text-sm text-gray-500">
              Select at least one preference to get recommendations
            </p>
          )}
        </div>
      </section>

      {/* ── Results Section ───────────────────────────────────────────────── */}
      {showResults && results && (
        <section
          ref={resultsContainerRef}
          className="relative bg-gradient-to-b from-[#0f1f4a]/30 via-[#0f172a] to-[#050816] border-t border-blue-400/10"
        >
          <div
            ref={resultsRef}
            className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8"
          >
            {/* Results Header */}
            <div
              className={`text-center mb-10 ${reveal(resultsVisible, resultsAnimateEntrance)("opacity-0 translate-y-4", "opacity-100 translate-y-0")}`}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Your Top Matches
              </h2>
              <p className="text-gray-400">
                Based on {answeredCount} preference
                {answeredCount !== 1 ? "s" : ""} selected
              </p>
            </div>

            {/* Result Cards */}
            <div className="space-y-4">
              {results.map((match, idx) => (
                <ResultCard
                  key={match.bot.id}
                  match={match}
                  rank={idx + 1}
                  delay={idx * 120}
                />
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="text-center mt-12 space-y-4">
              <p className="text-gray-300">
                All {results.length} bots are included in the bundle
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/bundle"
                  onClick={() => trackBotPickerCtaClicked('bundle')}
                  className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r from-blue-700 to-blue-600 px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:from-blue-600 hover:to-blue-500 hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] hover:scale-105 border border-blue-600/30"
                >
                  <span className="relative z-10">
                    Explore the Full Bundle
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </Link>
                <button
                  onClick={handleReset}
                  className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Try different preferences →
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
