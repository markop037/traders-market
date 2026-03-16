"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { measureOperation, TraderMarketTraces } from '@/lib/performance';
import { trackFirestoreError } from '@/lib/errorTracking';
import { useRenderPerformance } from '@/hooks/usePerformance';
import {
  trackBotDownloaded,
  trackAllBotsDownloaded,
  trackDashboardVisited,
  trackBotsPaywallShown,
  trackUnlockBotsClicked,
  trackCheckoutInitiated,
} from '@/lib/posthog';

// Premium bots (gold styling, shown first)
const PREMIUM_BOTS = [
  {
    name: 'NewYork–London Breakout',
    tagline: 'Session-based breakout strategy with ATR risk control and smart trade management',
    coreConcept: 'Trades high-probability breakouts from the London and New York pre-session ranges, targeting strong liquidity-driven moves at session open',
    marketStructure: 'Session Range (Breakout Box): High and Low calculated from predefined time window before session open, using M1 price data for precise range detection',
    keyHighlights: ['ATR-Based Stop Loss', 'Fixed R:R Take Profit', 'Auto Position Sizing', 'Built-in Trailing Stop', 'Daily P&L Limits', 'Session Control'],
  },
  {
    name: 'Grid',
    tagline: 'Anchored grid trading strategy with dynamic lot sizing and profit-targeted cycle management',
    coreConcept: 'A symmetric, anchored grid strategy designed to capture market oscillations while maintaining controlled risk through balance-based position sizing. Unlike martingale grids, this bot uses a fixed lot size per grid cycle and closes the entire basket at a predefined profit target, preventing risk escalation.',
    marketStructure: 'Anchored Grid Framework: The grid is built around an anchor price (midpoint) with Buy Stops placed above and Sell Stops below. Grid levels expand symmetrically using a configurable pip step, with dynamic lot sizing based on account balance.',
    keyHighlights: ['Balance-Based Lot Sizing', 'No Martingale Risk', 'Basket Profit Target', 'Anchor Price Logic', 'Auto Grid Cleanup', 'Symbol-Independent'],
  },
];

// Bot name → Supabase Storage .ex5 filename (ea-bots bucket)
const BOT_NAME_TO_FILE: Record<string, string> = {
  'NewYork–London Breakout': 'NY-London Breakout.ex5',
  'Grid': 'grid_strategy.ex5',
  'EMA Crossover with Price Action Confirmation': 'SMA.ex5',
  'RSI Overbought/Oversold with Price Action Confirmation': 'RSI.ex5',
  'MACD with Price Action Confirmation': 'MACD.ex5',
  'Heiken Ashi with Price Action Confirmation': 'HeikinAshi.ex5',
  'Inside Bar Breakout': 'InsideBarBreakout.ex5',
  'Stochastics with Price Action Confirmation': 'Stochastic.ex5',
  'Bollinger Bands with Price Action Confirmation': 'BB.ex5',
  'Fibonacci Retracement': 'FibonacciDailyRetrace.ex5',
  'Daily Range Breakout': 'DailyBreakoutATR.ex5',
  'Pivot Point with Price Action Confirmation': 'PivotPoint.ex5',
  'RSI Divergence with Price Action Confirmation': 'DivergenceRSI.ex5',
};

// Standard strategy bots (from bundle)
type StrategyBot = { name: string; description?: string; indicator: string; signal: string; confirmation: string; entryLogic: string };
const STRATEGY_BOTS: StrategyBot[] = [
  { name: 'EMA Crossover with Price Action Confirmation', indicator: 'Fast EMA vs. Slow EMA', signal: 'Fast EMA crossing above (bullish) or below (bearish) the slow EMA', confirmation: 'Price action in the crossover direction (e.g., breakout candle)', entryLogic: 'Enter long on bullish cross with confirmation; enter short on bearish cross with confirmation' },
  { name: 'RSI Overbought/Oversold with Price Action Confirmation', indicator: 'RSI', signal: 'RSI enters overbought or oversold territory', confirmation: 'Reversal candlestick pattern or rejection from a key level', entryLogic: 'Enter long when RSI is oversold and price confirms reversal; enter short when RSI is overbought and price confirms rejection' },
  { name: 'MACD with Price Action Confirmation', indicator: 'MACD line cross and histogram momentum', signal: 'MACD crossover or divergence in trend direction', confirmation: 'Price action supports the MACD signal (e.g., breakout, rejection)', entryLogic: 'Enter long on bullish MACD signals with confirmation; enter short on bearish signals with confirmation' },
  { name: 'Heiken Ashi with Price Action Confirmation', indicator: 'Heiken Ashi candles', signal: 'Color change signaling potential trend reversal or continuation', confirmation: 'Standard candlestick price action in the same direction', entryLogic: 'Enter trades in the direction of the Heiken Ashi shift when supported by candlestick confirmation' },
  { name: 'Inside Bar Breakout', indicator: 'Inside bar formation (candle fully inside the previous one)', signal: 'Price breaks above or below the inside bar range', confirmation: 'Breakout candle larger than ATR × X', entryLogic: 'Enter in breakout direction after confirmation, capturing momentum from consolidation' },
  { name: 'Stochastics with Price Action Confirmation', indicator: 'Stochastic oscillator', signal: 'Stochastics enters overbought/oversold and signals reversal', confirmation: 'Reversal candlestick or rejection pattern', entryLogic: 'Enter long on oversold reversals with confirmation; enter short on overbought reversals with confirmation' },
  { name: 'Bollinger Bands with Price Action Confirmation', indicator: 'Bollinger Bands', signal: 'Price touches or breaks the upper or lower band', confirmation: 'Reversal or breakout candlestick pattern', entryLogic: 'Enter reversal trades from overextended levels or continuation trades on confirmed breakouts' },
  { name: 'Fibonacci Retracement', indicator: 'Fibonacci retracement levels (commonly 35–50%)', signal: 'Strong daily impulse candle above ATR × X, followed by pullback into retracement zone', confirmation: 'Rejection candlestick pattern inside the retracement zone', entryLogic: 'Enter in direction of the original impulse once pullback confirms continuation' },
  { name: 'Daily Range Breakout', indicator: "Previous day's high and low", signal: 'Price breaks the daily high (bullish) or low (bearish)', confirmation: 'Breakout candle larger than ATR × X', entryLogic: 'Enter in breakout direction, using ATR-based stop-loss and take-profit for risk/reward consistency' },
  { name: 'Pivot Point with Price Action Confirmation', description: 'Level-based trading logic using pivot points for precise entries.', indicator: 'Daily Pivot Points (Classic), R1–R3, S1–S3', signal: 'Price approaches pivot, support, or resistance levels', confirmation: 'Candlestick patterns (Engulfing or Pin Bar) near pivot levels', entryLogic: 'Enter trades when price is near a pivot level and a bullish or bearish candlestick pattern confirms the direction. Optionally supports ATR-based stop loss, trailing stops, and risk management for daily profit/loss limits.' },
  { name: 'RSI Divergence with Price Action Confirmation', description: 'Momentum-based logic detecting divergences for trend reversals.', indicator: 'Relative Strength Index (RSI)', signal: 'Bullish or bearish RSI divergence', confirmation: 'Candlestick patterns (Engulfing or Pin Bar) aligned with divergence signals', entryLogic: 'Enter trades when RSI divergence occurs. If confirmation is enabled, require supporting bullish/bearish candlestick patterns. Supports ATR-based stop loss, trailing stops, and configurable risk per trade and daily limits.' },
];

export default function BotsDashboardPage() {
  // Track component render performance
  useRenderPerformance('BotsDashboardPage');
  
  const { user, loading } = useAuth();
  const router = useRouter();
  const [hasPaid, setHasPaid] = useState<boolean>(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [expandedStrategyIndex, setExpandedStrategyIndex] = useState<number | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadingFileName, setDownloadingFileName] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    trackDashboardVisited('bots');

    const loadSubscriptionStatus = async () => {
      if (user) {
        try {
          // Measure subscription status loading performance
          const data = await measureOperation(
            TraderMarketTraces.LOAD_SUBSCRIPTION_STATUS,
            async () => {
              const userDocRef = doc(db, 'users', user.uid);
              const userDoc = await getDoc(userDocRef);
              return userDoc.exists() ? userDoc.data() : null;
            },
            { userId: user.uid }
          );
          
          if (data) {
            const paid = data.hasPaid === true;
            setHasPaid(paid);
          } else {
            setHasPaid(false);
          }
        } catch (error) {
          console.error('Error loading subscription status:', error);
          trackFirestoreError(
            'loadSubscriptionStatus',
            error instanceof Error ? error.message : 'Unknown error'
          );
          setHasPaid(false);
        } finally {
          setIsLoadingStatus(false);
        }
      }
    };

    loadSubscriptionStatus();
  }, [user, loading, router]);

  if (loading || isLoadingStatus) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </main>
    );
  }

  const CHECKOUT_BASE = 'https://www.momentumdigital.online/checkout';
  const checkoutHref = user?.email
    ? `${CHECKOUT_BASE}?email=${encodeURIComponent(user.email)}`
    : CHECKOUT_BASE;

  if (!hasPaid) {
    trackBotsPaywallShown();
    return (
      <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/20 via-[#0f1f4a]/25 to-blue-900/20 p-8 shadow-2xl">
            <div className="absolute top-6 right-6">
              <span className="rounded-full border border-amber-500/40 bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-300 uppercase tracking-wider">
                Premium
              </span>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 inline-flex p-4 rounded-xl bg-amber-500/20 border border-amber-500/40">
                <svg className="w-12 h-12 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">Bots are locked</h1>
              <p className="mt-3 text-gray-400">
                Unlock access to all 10+ trading bots with a one-time payment. Download and use every bot in the bundle.
              </p>
              <a
                href={checkoutHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  trackUnlockBotsClicked();
                  trackCheckoutInitiated('dashboard-bots', checkoutHref);
                }}
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 px-6 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:from-amber-500 hover:to-amber-400 hover:shadow-amber-500/30 sm:w-auto"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Unlock Bots – $259
              </a>
              <p className="mt-4 text-sm text-gray-500">One-time payment · Lifetime access</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  async function downloadAll() {
    setDownloadingAll(true);
    setDownloadError(null);
    try {
      const res = await fetch('/api/download-ex5');
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      trackAllBotsDownloaded();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ea-bots-ex5.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      setDownloadError(e instanceof Error ? e.message : 'Download failed');
    } finally {
      setDownloadingAll(false);
    }
  }

  async function downloadOne(filename: string) {
    if (downloadingFileName || downloadingAll) return;
    setDownloadingFileName(filename);
    setDownloadError(null);
    try {
      const res = await fetch(`/api/download-ex5?name=${encodeURIComponent(filename)}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      const botName = Object.entries(BOT_NAME_TO_FILE).find(([, f]) => f === filename)?.[0] || filename;
      trackBotDownloaded(botName);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      setDownloadError(e instanceof Error ? e.message : 'Download failed');
    } finally {
      setDownloadingFileName(null);
    }
  }

  if (!user || !hasPaid) {
    return null;
  }

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <h1 className="text-4xl font-bold text-white">
              Trading Bots Library
            </h1>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-600/20 border border-green-500/40">
              <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm font-bold text-green-300 uppercase tracking-wider">Premium Access Active</span>
            </div>
            <button
              type="button"
              onClick={downloadAll}
              disabled={downloadingAll}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl border border-blue-500/40 bg-gradient-to-r from-blue-600/90 to-indigo-600/90 text-sm font-semibold text-white shadow-lg shadow-blue-900/25 transition-all duration-200 hover:from-blue-500 hover:to-indigo-500 hover:border-blue-400/60 hover:shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:from-blue-600/90 disabled:to-indigo-600/90"
              aria-busy={downloadingAll}
            >
              {downloadingAll ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/80 border-t-transparent rounded-full animate-spin" aria-hidden />
                  Preparing…
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download All
                </>
              )}
            </button>
          </div>
          {downloadError && (
            <p className="mb-4 text-sm text-red-400" role="alert">
              {downloadError}
            </p>
          )}

          {/* Info module - clean, minimal */}
          <section
            className="flex gap-4 rounded-lg border border-slate-600/40 bg-slate-800/30 px-5 py-4"
            aria-label="About this dashboard"
          >
            <div className="flex-shrink-0 mt-0.5 text-slate-500">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-slate-300 text-sm leading-relaxed">
                This page contains all available trading bots. You can browse, download, and manage your bots from here in one place. Premium bots are clearly highlighted with gold styling and appear first in the list for easy access.
              </p>
            </div>
          </section>
        </div>

        {/* Premium Bots - gold styling, first */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-amber-400 font-semibold text-sm uppercase tracking-wide">Premium</span>
            <span className="h-px flex-1 bg-gradient-to-r from-amber-500/40 to-transparent" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
            {PREMIUM_BOTS.map((bot) => (
              <article
                key={bot.name}
                className="relative overflow-hidden rounded-xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-950/25 via-slate-900/80 to-amber-900/20 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300 flex flex-col"
              >
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Premium
                  </span>
                </div>
                <div className="p-6 flex flex-col flex-1 min-h-0">
                  <div className="flex items-center gap-2 mb-1 pr-20">
                    <h3 className="text-lg font-bold text-white">{bot.name}</h3>
                    {BOT_NAME_TO_FILE[bot.name] && (
                      <button
                        type="button"
                        onClick={() => downloadOne(BOT_NAME_TO_FILE[bot.name]!)}
                        disabled={downloadingFileName !== null}
                        title={`Download ${BOT_NAME_TO_FILE[bot.name]}`}
                        className="shrink-0 p-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400 transition-all duration-200 hover:bg-amber-500/20 hover:border-amber-500/50 hover:text-amber-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={`Download ${bot.name}`}
                      >
                        {downloadingFileName === BOT_NAME_TO_FILE[bot.name] ? (
                          <span className="w-4 h-4 block border-2 border-amber-400 border-t-transparent rounded-full animate-spin" aria-hidden />
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                  <p className="text-amber-400/90 text-sm font-medium mb-4">{bot.tagline}</p>
                  <div className="space-y-3 flex-1 min-h-0">
                    <div className="rounded-lg border border-amber-500/15 bg-black/20 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-wider text-amber-400/90 mb-1">Core Concept</p>
                      <p className="text-slate-300 text-sm leading-relaxed">{bot.coreConcept}</p>
                    </div>
                    <div className="rounded-lg border border-amber-500/15 bg-black/20 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-wider text-amber-400/90 mb-1">Market Structure</p>
                      <p className="text-slate-300 text-sm leading-relaxed">{bot.marketStructure}</p>
                    </div>
                    <div className="rounded-lg border border-amber-500/15 bg-black/20 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-wider text-amber-400/90 mb-2">Key Highlights</p>
                      <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-slate-300 text-xs">
                        {bot.keyHighlights.map((item) => (
                          <li key={item} className="flex items-center gap-2">
                            <span className="text-amber-400 shrink-0">✓</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <p className="mt-auto pt-4 border-t border-white/5 text-slate-500 text-[11px] leading-relaxed shrink-0">
                    Disclaimer: Past performance, including backtested or simulated results, is not indicative of future results. Trading foreign exchange involves significant risk and may result in the loss of some or all of your capital.
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Standard Bots - blue-accented card styling */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <span className="text-blue-300 font-semibold text-sm uppercase tracking-widest">Standard</span>
            <span className="h-px flex-1 bg-gradient-to-r from-blue-500/50 via-blue-600/30 to-transparent" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {STRATEGY_BOTS.map((bot, index) => {
              const isOpen = expandedStrategyIndex === index;
              return (
                <article
                  key={`${bot.name}-${index}`}
                  className="group relative rounded-2xl border border-blue-900/50 bg-gradient-to-br from-slate-800/60 via-slate-800/50 to-blue-950/20 shadow-xl shadow-slate-950/50 overflow-hidden transition-all duration-300 hover:border-blue-600/50 hover:shadow-2xl hover:shadow-blue-950/30 hover:from-slate-800/70 hover:to-blue-950/30 flex flex-col"
                >
                  {/* Top accent line - blue */}
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500/70 to-transparent opacity-90" />
                  <div className="p-6 flex flex-col flex-1 min-h-0">
                    {/* Header: title + download */}
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-semibold text-white leading-snug tracking-tight">
                          {bot.name}
                        </h3>
                        <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                          {bot.description ?? 'Indicator-driven logic with confirmation for higher-quality entries.'}
                        </p>
                      </div>
                      {BOT_NAME_TO_FILE[bot.name] && (
                        <button
                          type="button"
                          onClick={() => downloadOne(BOT_NAME_TO_FILE[bot.name]!)}
                          disabled={downloadingFileName !== null}
                          title={`Download ${BOT_NAME_TO_FILE[bot.name]}`}
                          className="shrink-0 p-2 rounded-xl border border-blue-700/40 bg-blue-950/30 text-blue-400 transition-all duration-200 hover:bg-blue-800/40 hover:border-blue-500/50 hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label={`Download ${bot.name}`}
                        >
                          {downloadingFileName === BOT_NAME_TO_FILE[bot.name] ? (
                            <span className="w-4 h-4 block border-2 border-blue-400 border-t-transparent rounded-full animate-spin" aria-hidden />
                          ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          )}
                        </button>
                      )}
                    </div>
                    {/* Expandable strategy details */}
                    <div className={`grid transition-all duration-300 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-6' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
                      <div className="overflow-hidden">
                        <div className="space-y-4 pt-1">
                          {[
                            { label: 'Indicator', value: bot.indicator },
                            { label: 'Signal', value: bot.signal },
                            { label: 'Confirmation', value: bot.confirmation },
                            { label: 'Entry Logic', value: bot.entryLogic },
                          ].map(({ label, value }) => (
                            <div
                              key={label}
                              className="rounded-xl border border-blue-900/40 bg-blue-950/20 px-4 py-3.5 backdrop-blur-sm"
                            >
                              <p className="text-[11px] font-medium uppercase tracking-wider text-blue-400/90 mb-2">
                                {label}
                              </p>
                              <p className="text-slate-300 text-sm leading-relaxed">{value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setExpandedStrategyIndex(isOpen ? null : index)}
                      className="mt-5 w-full rounded-xl border border-blue-700/40 bg-blue-950/30 px-4 py-3 text-sm font-medium text-blue-200/90 transition-all duration-200 hover:bg-blue-800/40 hover:text-blue-100 hover:border-blue-500/50 flex items-center justify-center gap-2 shrink-0"
                      aria-expanded={isOpen}
                    >
                      {isOpen ? 'Show less' : 'Read more'}
                      <svg className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                  <p className="mt-auto pt-4 border-t border-white/5 text-slate-500 text-[11px] leading-relaxed px-6 pb-6 shrink-0">
                    Disclaimer: Past performance, including backtested or simulated results, is not indicative of future results. Trading foreign exchange involves significant risk and may result in the loss of some or all of your capital.
                  </p>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
