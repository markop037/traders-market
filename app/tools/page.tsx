import Link from "next/link";

const TOOLS = [
  {
    id: "previous-high-low-toolkit",
    name: "Previous High/Low Toolkit",
    description:
      "Automatically displays Yesterday, Last Week, and Last Month High/Low levels directly on the chart for quick market reference.",
  },
  {
    id: "previous-high-low-toolkit-sessions",
    name: "Previous High/Low Toolkit (Session Timezones)",
    description:
      "Shows High and Low levels for the Asian, London, and New York trading sessions based on their respective timezones.",
  },
  {
    id: "sessions-marker",
    name: "Sessions Marker",
    description:
      "Highlights the Asian, London, and New York trading sessions directly on the chart by coloring the background, making it easy to see when each session is active.",
    status: "Coming Soon",
  },
];

export default function ToolsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#050816] via-[#0f172a] to-[#050816]">
      <section className="relative overflow-hidden border-b border-blue-900/40">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-blue-600/10 blur-3xl" />
          <div className="absolute -bottom-40 right-[-10rem] h-80 w-80 rounded-full bg-blue-800/10 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(59,130,246,0.08),transparent_60%)]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pt-20 pb-14 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-200/90">
              Tools
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              Trading Tools Built Around Real Levels
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300 sm:text-xl">
              Our indicators and utilities help you visualize important market levels and trading sessions directly on the chart — from yesterday’s high and low to session-based ranges and when each session is active — so you spend less time calculating and more time trading.
            </p>
          </div>
        </div>
      </section>

      <section className="relative py-14 sm:py-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_55%)]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Your Trading Toolbox
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-gray-300 sm:text-base">
                The tools below are designed to help you quickly identify key price levels and trading sessions on the chart. Each one focuses on a single job so you get clear, chart-ready context without the guesswork.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {TOOLS.map((tool) => (
              <article
                key={tool.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-blue-700/30 bg-gradient-to-br from-blue-950/40 via-[#0f172a] to-blue-900/30 p-6 shadow-[0_0_25px_rgba(15,23,42,0.8)] transition-transform duration-300 hover:-translate-y-1 hover:border-blue-400/60 hover:shadow-[0_0_35px_rgba(59,130,246,0.45)]"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-white sm:text-xl">
                    {tool.name}
                  </h3>
                  {tool.status && (
                    <span
                      className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium border-amber-400/30 bg-amber-500/10 text-amber-200"
                    >
                      {tool.status}
                    </span>
                  )}
                </div>

                <p className="mb-6 flex-1 text-sm leading-relaxed text-gray-300">
                  {tool.description}
                </p>

                <div className="mt-auto flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-xs text-blue-200/80">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/15 text-[11px] font-semibold text-blue-200">
                      TM
                    </span>
                    <span>Part of the Traders Market toolkit</span>
                  </div>

                  {tool.status === "Coming Soon" && (
                    <button
                      type="button"
                      disabled
                      className="inline-flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-900/40 px-3 py-1.5 text-xs font-semibold text-blue-200/80"
                    >
                      <span>Coming soon</span>
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

