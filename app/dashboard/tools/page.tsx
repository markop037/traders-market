"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

// Sample tools – to be replaced with real tools and file URLs when implemented
const SAMPLE_TOOLS = [
  {
    id: "position-size-calculator",
    name: "Position Size Calculator",
    description:
      "Calculate lot sizes based on account balance, risk percentage, and stop loss. Ensures you never risk more than you intend per trade.",
    format: "Spreadsheet",
    status: "Coming soon",
  },
  {
    id: "risk-reward-helper",
    name: "Risk/Reward Helper",
    description:
      "Quick reference for setting take-profit and stop-loss levels to maintain consistent risk-reward ratios across timeframes.",
    format: "PDF",
    status: "Coming soon",
  },
  {
    id: "session-times-cheatsheet",
    name: "Trading Session Times Cheatsheet",
    description:
      "London, New York, and Asian session open/close times in your timezone. Handy for session-based strategies.",
    format: "PDF",
    status: "Coming soon",
  },
];

export default function DashboardToolsPage() {
  const { user } = useAuth();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async (toolId: string) => {
    if (!user) return;
    setError(null);
    setDownloadingId(toolId);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/download-tool?toolId=${encodeURIComponent(toolId)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Download failed (${res.status})`);
      }
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition");
      const match = disposition?.match(/filename="?([^";]+)"?/);
      const filename = match ? match[1] : `${toolId}.txt`;
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
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Tools</h1>
          <p className="mt-2 text-gray-400">
            Free tools for logged-in users. Download and use them to support your trading.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {SAMPLE_TOOLS.map((tool) => (
            <article
              key={tool.id}
              className="rounded-2xl border border-blue-600/25 bg-gradient-to-br from-blue-950/30 via-[#0f1f4a]/25 to-blue-900/20 p-6 shadow-xl"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold text-white">{tool.name}</h2>
                    <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-300">
                      {tool.status}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-400 text-sm leading-relaxed">{tool.description}</p>
                  <p className="mt-2 text-xs text-gray-500">Format: {tool.format}</p>
                </div>
                <div className="flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleDownload(tool.id)}
                    disabled={downloadingId !== null}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {downloadingId === tool.id ? (
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
              </div>
            </article>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-gray-500">
          More tools will be added here. You must be logged in to download.
        </p>
      </div>
    </main>
  );
}
