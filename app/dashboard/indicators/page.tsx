"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { trackIndicatorDownloaded, trackDashboardVisited } from '@/lib/posthog';

const INDICATORS = [
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
    downloadFilename: "DrawdownLimiter.ex5",
    description:
      "Monitors account equity in real time and tracks both drawdown and profit percentages based on peak or daily reset equity. The indicator displays a customizable on-chart info panel and automatically triggers alerts when predefined risk or profit thresholds are reached, helping traders stay within their risk management rules without executing any trades.",
  },
  {
    id: "risk-reward-visualizer-indicator",
    name: "Risk Reward Visualizer Indicator",
    downloadFilename: "RiskRewardVisualizer.ex5",
    description:
      "Displays entry, stop loss, and multiple risk-to-reward target levels (1R, 2R, 3R, 5R) directly on the chart. The indicator dynamically calculates and visualizes trade structure, showing key price levels and an info panel with risk metrics, allowing traders to clearly plan and evaluate trade setups based on risk-to-reward ratios.",
  },
];

export default function DashboardIndicatorsPage() {
  const { user } = useAuth();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
    trackDashboardVisited('indicators');
  }, []);

  const handleDownload = async (indicatorId: string) => {
    if (!user) return;
    setError(null);
    setDownloadingId(indicatorId);
    try {
      const token = await user.getIdToken();
      const res = await fetch(
        `/api/download-tool?toolId=${encodeURIComponent(indicatorId)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Download failed (${res.status})`);
      }
      const indicator = INDICATORS.find((i) => i.id === indicatorId);
      trackIndicatorDownloaded(indicator?.name || indicatorId, indicatorId);
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition");
      const match = disposition?.match(/filename="?([^";]+)"?/);
      const filename =
        indicator?.downloadFilename || (match ? match[1] : `${indicatorId}.ex5`);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Download failed");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#020617] via-[#020617] to-[#020617] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Your Traders Market Indicators
            </h1>
            <p className="mt-3 text-sm sm:text-base text-gray-300 max-w-xl">
              All indicators below are included with your account and are designed to give you clearer levels,
              session context, and more confident trade decisions inside MetaTrader 5.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {INDICATORS.map((indicator) => (
            <article
              key={indicator.id}
              className="rounded-2xl border border-blue-600/30 bg-gradient-to-br from-blue-950/40 via-[#0f172a] to-blue-900/30 p-6 shadow-[0_0_24px_rgba(15,23,42,0.9)]"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-blue-300/80">
                    MT5 Indicator
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-white">
                    {indicator.name}
                  </h2>
                </div>
                <span className="inline-flex items-center rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-200">
                  Included
                </span>
              </div>

              <p className="text-sm leading-relaxed text-gray-300">
                {indicator.description}
              </p>

              <div className="mt-5 flex items-center justify-between gap-3">
                <div className="flex-1" />
                <button
                  type="button"
                  onClick={() => handleDownload(indicator.id)}
                  disabled={downloadingId !== null}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {downloadingId === indicator.id ? (
                    <>
                      <svg
                        className="h-4 w-4 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-hidden
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Downloading…
                    </>
                  ) : (
                    <>
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      Download
                    </>
                  )}
                </button>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-8 text-center text-xs sm:text-sm text-gray-500">
          Indicators are free for all logged‑in users. More tools will be added to this dashboard over time.
        </p>
      </div>
    </main>
  );
}

