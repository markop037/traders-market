import { tradingBots } from "./bots";
import {
  BotMatch,
  TradingBot,
  UserPreferences,
  TimeframePreference,
  StrategyType,
  TradeFrequency,
} from "./types";

// ─── Matching Engine ─────────────────────────────────────────────────────────
// Scores every bot against user preferences and returns ranked results.

const TOTAL_ATTRIBUTES = 3; // strategy + timeframe + frequency

/**
 * Score a single bot against user preferences.
 * +1 for each matching attribute. Null preferences are ignored in scoring
 * but reduce the denominator so partial selections still produce
 * meaningful percentages.
 */
function scoreBot(bot: TradingBot, prefs: UserPreferences): BotMatch {
  const matchedAttributes: string[] = [];
  let answeredCount = 0;

  if (prefs.strategyType !== null) {
    answeredCount++;
    if (bot.strategyType === prefs.strategyType) {
      matchedAttributes.push("strategy");
    }
  }

  if (prefs.timeframePreference !== null) {
    answeredCount++;
    if (bot.timeframePreference === prefs.timeframePreference) {
      matchedAttributes.push("timeframe");
    }
  }

  if (prefs.tradeFrequency !== null) {
    answeredCount++;
    if (bot.tradeFrequency === prefs.tradeFrequency) {
      matchedAttributes.push("tradeFrequency");
    }
  }

  const score = matchedAttributes.length;
  const denominator = answeredCount > 0 ? answeredCount : TOTAL_ATTRIBUTES;
  const matchPercentage = Math.round((score / denominator) * 100);

  return { bot, score, matchPercentage, matchedAttributes };
}

/**
 * Match all bots against user preferences.
 * Returns results sorted by score (desc), then alphabetically.
 */
export function matchBots(prefs: UserPreferences): BotMatch[] {
  return tradingBots
    .map((bot) => scoreBot(bot, prefs))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.bot.name.localeCompare(b.bot.name);
    });
}

/**
 * Return the top N matching bots.
 * Defaults to 3 results.
 */
export function getTopMatches(
  prefs: UserPreferences,
  limit: number = 3
): BotMatch[] {
  return matchBots(prefs).slice(0, limit);
}

// ─── Filtering Helpers ───────────────────────────────────────────────────────
// Useful for building filtered views outside the picker.

export function filterByStrategy(strategy: StrategyType): TradingBot[] {
  return tradingBots.filter((b) => b.strategyType === strategy);
}

export function filterByTimeframe(tf: TimeframePreference): TradingBot[] {
  return tradingBots.filter((b) => b.timeframePreference === tf);
}

export function filterByFrequency(freq: TradeFrequency): TradingBot[] {
  return tradingBots.filter((b) => b.tradeFrequency === freq);
}

export function getPremiumBots(): TradingBot[] {
  return tradingBots.filter((b) => b.isPremium);
}

export function getStandardBots(): TradingBot[] {
  return tradingBots.filter((b) => !b.isPremium);
}
