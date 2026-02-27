// ─── Bot Classification System ───────────────────────────────────────────────
// Extensible type definitions for classifying trading bots.

/** How long the bot typically holds positions / which timeframes it targets. */
export type TimeframePreference = "LOW" | "MEDIUM" | "HIGH";

/** The core trading strategy the bot uses. */
export type StrategyType =
  | "MEAN_REVERSION"
  | "TREND_FOLLOWING"
  | "BREAKOUT";
// Add future strategy types here (e.g. "MOMENTUM", "ARBITRAGE")

/** How often the bot opens new trades. */
export type TradeFrequency = "LOW" | "MEDIUM" | "HIGH";

// ─── Bot Data Model ──────────────────────────────────────────────────────────

export interface TradingBot {
  /** Unique slug (kebab-case) used for keying & future routing */
  id: string;
  /** Display name shown in the UI */
  name: string;
  /** Short marketing description */
  description: string;
  /** Classification attributes */
  timeframePreference: TimeframePreference;
  strategyType: StrategyType;
  tradeFrequency: TradeFrequency;
  /** Whether this is a premium-tier bot */
  isPremium?: boolean;
  // ── Future extension slots ──
  // riskLevel?: "LOW" | "MEDIUM" | "HIGH";
  // recommendedPairs?: string[];
  // minAccountSize?: number;
}

// ─── User Preferences (what the picker collects) ─────────────────────────────

export interface UserPreferences {
  strategyType: StrategyType | null;
  timeframePreference: TimeframePreference | null;
  tradeFrequency: TradeFrequency | null;
}

// ─── Match Result ────────────────────────────────────────────────────────────

export interface BotMatch {
  bot: TradingBot;
  /** Number of attributes that matched (0–3) */
  score: number;
  /** Percentage representation (0–100) */
  matchPercentage: number;
  /** Which specific attributes matched */
  matchedAttributes: string[];
}

// ─── Label Helpers (human-readable labels for UI) ────────────────────────────

/** Short labels for tags and compact displays */
export const TIMEFRAME_LABELS: Record<TimeframePreference, string> = {
  LOW: "Scalping · M1 – M15",
  MEDIUM: "Intraday · H1 – H4",
  HIGH: "Swing · H4 – Daily",
};

export const STRATEGY_LABELS: Record<StrategyType, string> = {
  MEAN_REVERSION: "Mean Reversion",
  TREND_FOLLOWING: "Trend Following",
  BREAKOUT: "Breakout",
};

export const TRADE_FREQUENCY_LABELS: Record<TradeFrequency, string> = {
  LOW: "Few Trades",
  MEDIUM: "Moderate",
  HIGH: "Many Trades",
};

/** Colour hint per strategy (tailwind class fragments for tags) */
export const STRATEGY_TAG_COLORS: Record<StrategyType, string> = {
  MEAN_REVERSION: "border-purple-500/40 bg-purple-500/15 text-purple-300",
  TREND_FOLLOWING: "border-blue-500/40 bg-blue-500/15 text-blue-300",
  BREAKOUT: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
};

export const TIMEFRAME_TAG_COLORS: Record<TimeframePreference, string> = {
  LOW: "border-amber-500/40 bg-amber-500/15 text-amber-300",
  MEDIUM: "border-cyan-500/40 bg-cyan-500/15 text-cyan-300",
  HIGH: "border-indigo-500/40 bg-indigo-500/15 text-indigo-300",
};

export const FREQUENCY_TAG_COLORS: Record<TradeFrequency, string> = {
  LOW: "border-slate-400/40 bg-slate-400/15 text-slate-300",
  MEDIUM: "border-sky-500/40 bg-sky-500/15 text-sky-300",
  HIGH: "border-rose-500/40 bg-rose-500/15 text-rose-300",
};
