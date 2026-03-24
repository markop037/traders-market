import { HeroCtaClient } from "./components/home/HeroCtaClient";
import { HeroImageCarousel } from "./components/home/HeroImageCarousel";
import { HomePageContent } from "./components/home/HomePageContent";
import { SubscriptionGate } from "./components/home/SubscriptionGate";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#050816] via-[#0f172a] via-[#0f1f4a] to-[#0a0e27]">
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                Unlock 10+ Proven Trading Strategies for{" "}
                <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-blue-400 bg-clip-text text-transparent">
                  MetaTrader 5
                </span>
              </h1>

              <p className="mt-6 text-lg leading-8 text-gray-300 sm:text-xl max-w-2xl mx-auto lg:mx-0">
                Automate your trading with the most impactful, battle-tested strategies trusted by traders
                worldwide.
              </p>

              <HeroCtaClient />
            </div>

            <div className="relative flex items-center justify-center">
              <div className="relative w-full max-w-2xl">
                <div className="absolute -inset-6 rounded-3xl bg-gradient-to-r from-blue-800/30 via-blue-700/25 to-blue-800/30 blur-3xl" />

                <div className="relative rounded-2xl bg-gradient-to-br from-slate-950/95 via-[#0a0e27]/95 to-slate-950/95 p-6 backdrop-blur-sm border border-blue-600/40 overflow-hidden shadow-lg">
                  <div className="relative w-full">
                    <HeroImageCarousel />
                    <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-950/25 via-[#0a0e27]/18 to-slate-950/25 pointer-events-none" />
                    <div className="absolute inset-0 z-0 bg-gradient-to-r from-blue-500/5 via-transparent to-blue-500/5 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-800/12 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob pointer-events-none" />
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-800/10 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob animation-delay-2000 pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-blue-800/12 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob animation-delay-4000 pointer-events-none" />
      </section>

      <SubscriptionGate />

      <HomePageContent />
    </div>
  );
}
