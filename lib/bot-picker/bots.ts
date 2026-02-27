import { TradingBot } from "./types";

// ─── Bot Configuration ───────────────────────────────────────────────────────
// Central registry of every trading bot in the bundle, with classification
// attributes. Add new bots here and they automatically appear in the picker.

export const tradingBots: TradingBot[] = [
  // ── Standard Bots ──────────────────────────────────────────────────────────

  {
    id: "ema-crossover",
    name: "EMA Crossover",
    description:
      "Trend-following strategy using Fast vs. Slow EMA crossovers with price action confirmation for higher-quality entries.",
    timeframePreference: "MEDIUM",
    strategyType: "TREND_FOLLOWING",
    tradeFrequency: "MEDIUM",
  },
  {
    id: "rsi-overbought-oversold",
    name: "RSI Overbought/Oversold",
    description:
      "Mean-reversion strategy that enters when RSI reaches extremes, confirmed by reversal candlestick patterns.",
    timeframePreference: "MEDIUM",
    strategyType: "MEAN_REVERSION",
    tradeFrequency: "MEDIUM",
  },
  {
    id: "macd",
    name: "MACD Strategy",
    description:
      "Trend-following bot using MACD crossovers and histogram momentum with price action confirmation.",
    timeframePreference: "MEDIUM",
    strategyType: "TREND_FOLLOWING",
    tradeFrequency: "LOW",
  },
  {
    id: "heiken-ashi",
    name: "Heiken Ashi",
    description:
      "Swing-oriented trend strategy using Heiken Ashi candle color changes confirmed by standard candlestick patterns.",
    timeframePreference: "HIGH",
    strategyType: "TREND_FOLLOWING",
    tradeFrequency: "LOW",
  },
  {
    id: "inside-bar-breakout",
    name: "Inside Bar Breakout",
    description:
      "Breakout strategy that waits for price consolidation inside a mother bar, then trades the directional break.",
    timeframePreference: "HIGH",
    strategyType: "BREAKOUT",
    tradeFrequency: "LOW",
  },
  {
    id: "stochastics",
    name: "Stochastics",
    description:
      "Mean-reversion oscillator strategy entering on overbought/oversold reversals with candlestick confirmation.",
    timeframePreference: "MEDIUM",
    strategyType: "MEAN_REVERSION",
    tradeFrequency: "MEDIUM",
  },
  {
    id: "bollinger-bands",
    name: "Bollinger Bands",
    description:
      "Volatility-based mean-reversion strategy trading band touches and breakouts with price action confirmation.",
    timeframePreference: "MEDIUM",
    strategyType: "MEAN_REVERSION",
    tradeFrequency: "MEDIUM",
  },
  {
    id: "fibonacci-retracement",
    name: "Fibonacci Retracement",
    description:
      "Trend-continuation strategy entering on pullbacks to key Fibonacci levels after strong impulse moves.",
    timeframePreference: "HIGH",
    strategyType: "TREND_FOLLOWING",
    tradeFrequency: "LOW",
  },
  {
    id: "daily-range-breakout",
    name: "Daily Range Breakout",
    description:
      "Breakout strategy trading breaks of the previous day's high or low with ATR-based risk management.",
    timeframePreference: "MEDIUM",
    strategyType: "BREAKOUT",
    tradeFrequency: "MEDIUM",
  },
  {
    id: "pivot-point",
    name: "Pivot Point",
    description:
      "Mean-reversion strategy trading reversals at daily pivot, support, and resistance levels with candlestick confirmation.",
    timeframePreference: "MEDIUM",
    strategyType: "MEAN_REVERSION",
    tradeFrequency: "MEDIUM",
  },
  {
    id: "rsi-divergence",
    name: "RSI Divergence",
    description:
      "Divergence-based reversal strategy detecting mismatches between price and RSI momentum for high-probability entries.",
    timeframePreference: "HIGH",
    strategyType: "MEAN_REVERSION",
    tradeFrequency: "LOW",
  },

  // ── Premium Bots ───────────────────────────────────────────────────────────

  {
    id: "ny-london-breakout",
    name: "NewYork–London Breakout",
    description:
      "Session-based breakout strategy trading high-probability moves from London and New York pre-session ranges with ATR risk control.",
    timeframePreference: "LOW",
    strategyType: "BREAKOUT",
    tradeFrequency: "MEDIUM",
    isPremium: true,
  },
  {
    id: "anchor-grid",
    name: "Grid",
    description:
      "Anchored grid strategy capturing market oscillations with balance-based lot sizing and profit-targeted cycle management.",
    timeframePreference: "LOW",
    strategyType: "MEAN_REVERSION",
    tradeFrequency: "HIGH",
    isPremium: true,
  },
];
