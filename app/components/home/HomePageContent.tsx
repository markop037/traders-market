"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ImageLightboxModal } from "@/app/components/ImageLightboxModal";
import { trackPdfLeadFormViewed, trackPdfGuideRequested, trackCtaClicked } from "@/lib/posthog";
import { AnimatedSection, reveal, useScrollReveal } from "@/lib/scrollReveal";

// Image Carousel Component for Backtesting Results (optional currencyLabel e.g. EURUSD / GBPUSD, strategyName for lightbox)
function ImageCarousel({ images, altPrefix, currencyLabel, strategyName }: { images: string[]; altPrefix: string; currencyLabel?: string; strategyName?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="relative w-full mb-6">
      {currencyLabel && (
        <p className="text-xs font-semibold text-amber-400/90 uppercase tracking-wider mb-2">{currencyLabel}</p>
      )}
      {/* Carousel Container */}
      <div className="relative aspect-[16/9] rounded-lg overflow-hidden bg-gradient-to-br from-slate-900/90 to-black/90 border border-amber-500/20">
        {/* Current Image - click to open full-screen lightbox */}
        <button
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          className="absolute inset-0 flex items-center justify-center w-full h-full cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-inset rounded-lg"
          aria-label="View image full screen"
        >
          <img
            src={images[currentIndex]}
            alt={`${altPrefix} - Backtesting Result ${currentIndex + 1}`}
            className="w-full h-full object-contain pointer-events-none"
          />
        </button>

        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            {/* Previous Button */}
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-amber-500/30 flex items-center justify-center text-white hover:bg-amber-600/30 hover:border-amber-500/50 transition-all duration-300 group"
              aria-label="Previous image"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Next Button */}
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-amber-500/30 flex items-center justify-center text-white hover:bg-amber-600/30 hover:border-amber-500/50 transition-all duration-300 group"
              aria-label="Next image"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Slide Indicator Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-amber-400 w-6'
                    : 'bg-gray-500/50 hover:bg-gray-400/70'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-amber-500/30">
            <span className="text-xs text-amber-400 font-mono">
              {currentIndex + 1} / {images.length}
            </span>
          </div>
        )}
      </div>

      <ImageLightboxModal
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        images={images}
        initialIndex={currentIndex}
        altPrefix={altPrefix}
        strategyName={strategyName}
        tradingPair={currencyLabel}
      />

      {!currencyLabel && (
        <div className="mt-2 text-center">
          <span className="text-xs text-gray-500 italic">Backtesting results</span>
        </div>
      )}
    </div>
  );
}

export function HomePageContent() {
  return (
    <div className="min-h-screen">
      {/* Transition Divider - Hero to Premium Bots */}
      <div className="relative h-8 -mt-8 bg-gradient-to-b from-[#050816] via-[#0f172a] to-[#0a0e27]">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,transparent_30%,rgba(234,179,8,0.02)_50%,transparent_70%)]"></div>
      </div>

      {/* Premium Bots Section */}
      <AnimatedSection>
        {({ isVisible, animateEntrance }) => (
          <section className="relative bg-gradient-to-b from-[#0a0e27] via-[#0f172a] to-[#0f1f4a] py-24 border-y border-amber-500/10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {/* Section Header */}
              <div className={`text-center mb-16 ${reveal(isVisible, animateEntrance)('opacity-0 translate-y-4', 'opacity-100 translate-y-0')}`}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-600/20 border border-amber-500/30 mb-6">
                  <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-amber-400 font-semibold text-sm uppercase tracking-wide">Exclusive Premium Collection</span>
                </div>
                
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl mb-4">
                  Premium Trading Bots
                </h2>
                <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
                  Advanced algorithmic strategies with institutional-grade logic, precision risk control, and proven market edge
                </p>
              </div>

              {/* Premium Bots Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {/* Premium Bot #1: NewYork-London Breakout */}
                <div className={`group relative ${reveal(isVisible, animateEntrance)('opacity-0 translate-y-6', 'opacity-100 translate-y-0')}`}
                     style={{ transitionDelay: isVisible && animateEntrance ? '200ms' : '0ms' }}>
                  <div className="absolute -inset-1 bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-600 rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition duration-500"></div>
                  <div className="relative rounded-2xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-950/30 via-[#0f172a]/90 to-amber-900/20 p-8 backdrop-blur-sm h-full transition-all duration-300 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/20">
                    {/* Premium Badge */}
                    <div className="absolute top-4 right-4">
                      <div className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-600/20 border border-amber-500/40">
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Premium</span>
                      </div>
                    </div>

                    {/* Bot Header */}
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        NewYork–London Breakout
                      </h3>
                      <p className="text-amber-400/90 font-medium text-sm">
                        Session-based breakout strategy with ATR risk control and smart trade management
                      </p>
                    </div>

                    {/* Backtesting Results: 2 images EURUSD, 2 images GBPUSD */}
                    <ImageCarousel
                      currencyLabel="EURUSD"
                      strategyName="NewYork–London Breakout"
                      images={['/premium-bots/ny-london-breakout-eurusd-1.jpg', '/premium-bots/ny-london-breakout-eurusd-2.jpg']}
                      altPrefix="NewYork-London Breakout EURUSD"
                    />
                    <ImageCarousel
                      currencyLabel="GBPUSD"
                      strategyName="NewYork–London Breakout"
                      images={['/premium-bots/ny-london-breakout-gbpusd-1.jpg', '/premium-bots/ny-london-breakout-gbpusd-2.jpg']}
                      altPrefix="NewYork-London Breakout GBPUSD"
                    />

                    {/* Core Features */}
                    <div className="space-y-4 mb-6">
                      <div>
                        <h4 className="text-sm font-semibold text-amber-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                          </svg>
                          Core Concept
                        </h4>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          Trades high-probability breakouts from the London and New York pre-session ranges, targeting strong liquidity-driven moves at session open
                        </p>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-amber-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                          </svg>
                          Market Structure
                        </h4>
                        <p className="text-gray-400 text-sm">
                          <span className="font-medium text-gray-300">Session Range (Breakout Box):</span> High and Low calculated from predefined time window before session open, using M1 price data for precise range detection
                        </p>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-amber-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          Signal & Confirmation
                        </h4>
                        <p className="text-gray-400 text-sm mb-2">
                          <span className="font-medium text-gray-300">Session Open Breakout:</span> Valid signal when price breaks above or below session range at official session open
                        </p>
                        <p className="text-gray-400 text-sm">
                          <span className="font-medium text-gray-300">Volatility-Based Validation (ATR):</span> Dynamically validates market conditions and defines adaptive Stop Loss distances
                        </p>
                      </div>
                    </div>

                    {/* Key Highlights */}
                    <div className="pt-6 border-t border-amber-500/20">
                      <h4 className="text-sm font-semibold text-white mb-3">Key Highlights</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          "ATR-Based Stop Loss",
                          "Fixed R:R Take Profit",
                          "Auto Position Sizing",
                          "Built-in Trailing Stop",
                          "Daily P&L Limits",
                          "Session Control"
                        ].map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-300 text-xs">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Premium Bot #2: Grid */}
                <div className={`group relative ${reveal(isVisible, animateEntrance)('opacity-0 translate-y-6', 'opacity-100 translate-y-0')}`}
                     style={{ transitionDelay: isVisible && animateEntrance ? '400ms' : '0ms' }}>
                  <div className="absolute -inset-1 bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-600 rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition duration-500"></div>
                  <div className="relative rounded-2xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-950/30 via-[#0f172a]/90 to-amber-900/20 p-8 backdrop-blur-sm h-full transition-all duration-300 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/20">
                    {/* Premium Badge */}
                    <div className="absolute top-4 right-4">
                      <div className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-600/20 border border-amber-500/40">
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Premium</span>
                      </div>
                    </div>

                    {/* Bot Header */}
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        Grid
                      </h3>
                      <p className="text-amber-400/90 font-medium text-sm">
                        Anchored grid trading strategy with dynamic lot sizing and profit-targeted cycle management
                      </p>
                    </div>

                    {/* Backtesting Results: 2 images EURUSD, 2 images GBPUSD */}
                    <ImageCarousel
                      currencyLabel="EURUSD"
                      strategyName="Grid"
                      images={['/premium-bots/grid-eurusd-1.jpg', '/premium-bots/grid-eurusd-2.jpg']}
                      altPrefix="Grid EURUSD"
                    />
                    <ImageCarousel
                      currencyLabel="GBPUSD"
                      strategyName="Grid"
                      images={['/premium-bots/grid-gbpusd-1.jpg', '/premium-bots/grid-gbpusd-2.jpg']}
                      altPrefix="Grid GBPUSD"
                    />

                    {/* Core Features */}
                    <div className="space-y-4 mb-6">
                      <div>
                        <h4 className="text-sm font-semibold text-amber-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                          </svg>
                          Core Concept
                        </h4>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          A symmetric, anchored grid strategy capturing market oscillations while keeping risk controlled via balance-based lot sizing. Unlike martingale grids, it uses a fixed lot size per cycle and closes the entire basket at a set profit target.
                        </p>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-amber-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                          </svg>
                          Market Structure
                        </h4>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          The grid centers on an anchor price, with Buy Stops above and Sell Stops below. Levels expand symmetrically using a configurable pip step. Lot size is dynamically calculated from account balance and applied consistently across the cycle.
                        </p>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-amber-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          Signal & Confirmation
                        </h4>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          The first grid layer is placed only when no trades are active. Additional layers are added as long as the grid remains balanced. Once combined profit hits the target, all positions close, pending orders cancel, and the grid resets.
                        </p>
                      </div>
                    </div>

                    {/* Key Highlights */}
                    <div className="pt-6 border-t border-amber-500/20">
                      <h4 className="text-sm font-semibold text-white mb-3">Key Highlights</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          "Balance-Based Lot Sizing",
                          "No Martingale Risk",
                          "Basket Profit Target",
                          "Anchor Price Logic",
                          "Auto Grid Cleanup",
                          "Symbol-Independent"
                        ].map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-300 text-xs">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom CTA */}
              <div className={`text-center mt-12 ${reveal(isVisible, animateEntrance)('opacity-0 translate-y-4', 'opacity-100 translate-y-0')}`}
                   style={{ transitionDelay: isVisible && animateEntrance ? '600ms' : '0ms' }}>
                <p className="text-gray-300 mb-6 text-lg">
                  Both premium bots are included in the complete bundle
                </p>
                <Link
                  href="/bundle"
                  onClick={() => trackCtaClicked('homepage_premium_access', 'Get Premium Access Now', 'homepage_premium_bots', '/bundle')}
                  className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r from-amber-600 to-yellow-600 px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:from-amber-500 hover:to-yellow-500 hover:shadow-[0_0_30px_rgba(251,191,36,0.5)] hover:scale-105 border border-amber-500/30"
                >
                  <span className="relative z-10">Get Premium Access Now</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-amber-600 to-amber-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                </Link>
              </div>
            </div>
          </section>
        )}
      </AnimatedSection>

      {/* Transition Divider - Premium Bots to Manual vs Automated */}
      <div className="relative h-8 bg-gradient-to-b from-[#0f1f4a] via-[#0f172a] to-[#0f1f4a]">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,transparent_30%,rgba(59,130,246,0.01)_50%,transparent_70%)]"></div>
      </div>

      {/* Manual vs Automated Trading Section - scroll-triggered animation */}
      <AnimatedSection>
        {({ isVisible, animateEntrance }) => (
          <section
            className="relative bg-gradient-to-b from-[#0f1f4a] via-[#0f172a] to-[#050816] py-24 border-t border-blue-400/10"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className={`text-center mb-16 ${reveal(isVisible, animateEntrance)("opacity-0 translate-y-4", "opacity-100 translate-y-0")}`}>
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
                  Manual vs Automated Trading
                </h2>
                <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
                  See the difference between traditional manual trading and modern automated solutions
                </p>
              </div>

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
                {/* Manual Trading - Left Column */}
                <div
                  className={`${reveal(isVisible, animateEntrance)("opacity-0 -translate-x-6", "opacity-100 translate-x-0")} hover:scale-[1.02] hover:transition-transform hover:duration-300`}
                  style={{ transitionDelay: isVisible && animateEntrance ? "0.2s" : "0ms" }}
                >
                  <div className="rounded-xl border-2 border-red-500/30 bg-gradient-to-br from-red-900/10 to-slate-900/40 p-8 backdrop-blur-sm h-full transition-all duration-300 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-lg bg-red-500/20">
                    <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Manual Trading</h3>
                </div>
                <p className="text-xl font-semibold text-red-400 mb-8">Is Holding You Back</p>
                
                <div className="space-y-6">
                  {[
                    {
                      icon: (
                        <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      ),
                      title: "Hard to Backtest",
                      description: "Testing strategies manually requires extensive time and resources, making it difficult to validate trading ideas."
                    },
                    {
                      icon: (
                        <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ),
                      title: "Time-Consuming",
                      description: "Requires constant monitoring of markets, charts, and news, leaving little time for other activities."
                    },
                    {
                      icon: (
                        <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      ),
                      title: "Emotion-Driven Trades",
                      description: "Human emotions like fear and greed can lead to irrational decisions and poor trading outcomes."
                    }
                  ].map((item, index) => (
                    <div key={index} className="flex gap-4 group">
                      <div className="flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-300">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-1">{item.title}</h4>
                        <p className="text-gray-400 text-sm">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

                {/* Automated Trading - Right Column */}
                <div
                  className={`${reveal(isVisible, animateEntrance)("opacity-0 translate-x-6", "opacity-100 translate-x-0")} hover:scale-[1.02] hover:transition-transform hover:duration-300`}
                  style={{ transitionDelay: isVisible && animateEntrance ? "0.4s" : "0ms" }}
                >
                  <div className="rounded-xl border-2 border-blue-600/30 bg-gradient-to-br from-blue-950/30 via-[#0f1f4a]/25 to-blue-900/20 p-8 backdrop-blur-sm h-full transition-all duration-300 hover:border-blue-800/50 hover:shadow-lg hover:shadow-blue-600/25 hover:shadow-blue-800/25">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-blue-600/25 to-blue-800/25">
                    <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Automated Trading</h3>
                </div>
                <p className="text-xl font-semibold text-blue-400 mb-8">Does the Work for You</p>
                
                <div className="space-y-6">
                  {[
                    {
                      icon: (
                        <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                      ),
                      title: "Easy Backtesting",
                      description: "Test strategies against historical data in minutes, allowing you to validate and optimize your approach quickly."
                    },
                    {
                      icon: (
                        <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ),
                      title: "Trades 24/7",
                      description: "Never miss an opportunity. Automated systems monitor markets continuously and execute trades at optimal times."
                    },
                    {
                      icon: (
                        <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      ),
                      title: "Emotion-Free Logic",
                      description: "Trading decisions are based purely on predefined rules and algorithms, eliminating emotional biases."
                    }
                  ].map((item, index) => (
                    <div key={index} className="flex gap-4 group">
                      <div className="flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-300">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-1">{item.title}</h4>
                        <p className="text-gray-400 text-sm">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </AnimatedSection>

      {/* Transition Divider - Manual vs Automated to No One-Size-Fits-All */}
      <div className="relative h-6 bg-gradient-to-b from-[#050816] via-[#0f1f4a]/20 to-[#050816]">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-600/10 to-transparent"></div>
      </div>

      {/* No One-Size-Fits-All Strategy Section */}
      <AnimatedSection>
        {({ isVisible, animateEntrance }) => (
          <section className="relative bg-gradient-to-br from-[#050816] via-[#0b1026] to-[#050816] py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className={`text-center mb-16 ${reveal(isVisible, animateEntrance)('opacity-0 translate-y-4', 'opacity-100 translate-y-0')}`}>
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl mb-4">
                  There's No One-Size-Fits-All Strategy
                </h2>
                <p className="text-xl sm:text-2xl text-blue-400 font-semibold">
                  And That's the Point
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto mb-12">
                {/* Markets Evolving */}
                <div className={`group rounded-xl border border-blue-600/30 bg-gradient-to-br from-blue-950/30 via-[#0f1f4a]/20 to-blue-900/20 p-6 backdrop-blur-sm transition-all duration-700 hover:border-blue-800/50 hover:shadow-lg hover:shadow-blue-600/25 hover:shadow-blue-800/25 hover:scale-[1.02] ${reveal(isVisible, animateEntrance)('opacity-0 translate-y-6', 'opacity-100 translate-y-0')} hover:transition-transform hover:duration-300`}
                     style={{ transitionDelay: isVisible && animateEntrance ? '100ms' : '0ms' }}>
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 p-2 rounded-lg bg-gradient-to-br from-blue-600/25 to-blue-800/25">
                  <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white">Markets are constantly evolving</h3>
              </div>
            </div>

                {/* Robotic Trading Bots */}
                <div className={`group rounded-xl border border-blue-600/30 bg-gradient-to-br from-blue-950/30 via-[#0f1f4a]/20 to-blue-900/20 p-6 backdrop-blur-sm transition-all duration-700 hover:border-blue-800/50 hover:shadow-lg hover:shadow-blue-600/25 hover:shadow-blue-800/25 hover:scale-[1.02] ${reveal(isVisible, animateEntrance)('opacity-0 translate-y-6', 'opacity-100 translate-y-0')} hover:transition-transform hover:duration-300`}
                     style={{ transitionDelay: isVisible && animateEntrance ? '200ms' : '0ms' }}>
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 p-2 rounded-lg bg-gradient-to-br from-blue-600/25 to-blue-800/25">
                      <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                      Many trading bots work in the market
                    </h3>
                  </div>
                </div>

                {/* Strategic Planning */}
                <div className={`group rounded-xl border border-blue-600/30 bg-gradient-to-br from-blue-950/30 via-[#0f1f4a]/20 to-blue-900/20 p-6 backdrop-blur-sm transition-all duration-700 hover:border-blue-800/50 hover:shadow-lg hover:shadow-blue-600/25 hover:shadow-blue-800/25 hover:scale-[1.02] md:col-span-2 lg:col-span-1 ${reveal(isVisible, animateEntrance)('opacity-0 translate-y-6', 'opacity-100 translate-y-0')} hover:transition-transform hover:duration-300`}
                     style={{ transitionDelay: isVisible && animateEntrance ? '300ms' : '0ms' }}>
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 p-2 rounded-lg bg-gradient-to-br from-blue-600/25 to-blue-800/25">
                      <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                      Some strategies have higher risk but higher reward
                    </h3>
                  </div>
                </div>
          </div>

              {/* Final Message */}
              <div className={`text-center ${reveal(isVisible, animateEntrance)('opacity-0 translate-y-4', 'opacity-100 translate-y-0')}`}
                   style={{ transitionDelay: isVisible && animateEntrance ? '400ms' : '0ms' }}>
                <p className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-blue-400 via-blue-300 to-blue-400 bg-clip-text text-transparent">
                  The best strategy is the one you pick
                </p>
              </div>
            </div>
          </section>
        )}
      </AnimatedSection>

      {/* Transition Divider - No One-Size-Fits-All to Bot Picker CTA */}
      <div className="relative h-6 bg-gradient-to-b from-[#050816] via-[#0a0e27] to-[#050816]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent"></div>
      </div>

      {/* Bot Picker CTA Section */}
      <AnimatedSection>
        {({ isVisible, animateEntrance }) => (
          <section className="relative bg-gradient-to-br from-[#050816] via-[#0f172a] to-[#050816] py-24 overflow-hidden">
            {/* Subtle background accents */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl"></div>
            </div>

            <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <div className={`rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-950/40 via-[#0f1f4a]/30 to-blue-900/30 p-8 sm:p-12 backdrop-blur-sm ${reveal(isVisible, animateEntrance)('opacity-0 translate-y-6', 'opacity-100 translate-y-0')}`}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                  {/* Left – Copy */}
                  <div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/15 border border-blue-500/30 mb-6">
                      <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <span className="text-blue-400 font-semibold text-sm uppercase tracking-wide">Bot Picker Tool</span>
                    </div>

                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
                      Not Sure Which Bot <br className="hidden sm:block" />
                      <span className="bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">Fits Your Style?</span>
                    </h2>

                    <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                      Answer 3 quick questions about your trading preferences and our <span className="text-white font-medium">Bot Picker</span> will recommend the best strategies for you — with a match score for every bot.
                    </p>

                    <ul className="space-y-3 mb-8">
                      {[
                        "Pick your preferred strategy type",
                        "Choose your ideal timeframe",
                        "Set your trade frequency preference",
                      ].map((step, idx) => (
                        <li key={idx} className="flex items-center gap-3">
                          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-xs font-bold text-blue-400">
                            {idx + 1}
                          </span>
                          <span className="text-gray-300 text-sm">{step}</span>
                        </li>
                      ))}
                    </ul>

                    <Link
                      href="/bot-picker"
                      onClick={() => trackCtaClicked('homepage_find_bot', 'Find My Perfect Bot', 'homepage_bot_picker', '/bot-picker')}
                      className="group relative inline-flex items-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-blue-700 to-blue-600 px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:from-blue-600 hover:to-blue-500 hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] hover:scale-105 border border-blue-600/30"
                    >
                      <span className="relative z-10">Find My Perfect Bot</span>
                      <svg className="relative z-10 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                    </Link>
                  </div>

                  {/* Right – Visual preview card */}
                  <div className={`${reveal(isVisible, animateEntrance)('opacity-0 translate-x-6', 'opacity-100 translate-x-0')}`} style={{ transitionDelay: isVisible && animateEntrance ? '200ms' : '0ms' }}>
                    <div className="relative rounded-xl border border-blue-600/30 bg-gradient-to-br from-slate-950/90 to-[#0a0e27]/90 p-6 backdrop-blur-sm shadow-2xl">
                      {/* Mock header */}
                      <div className="flex items-center gap-2 mb-5">
                        <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/60"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/60"></div>
                        <span className="ml-2 text-xs text-gray-500 font-mono">bot-picker</span>
                      </div>

                      {/* Simulated result cards */}
                      {[
                        { name: "EMA Crossover", match: 100, tags: ["Trend Following", "Intraday", "Moderate"] },
                        { name: "RSI Mean Reversion", match: 67, tags: ["Mean Reversion", "Scalping", "Many Trades"] },
                        { name: "Bollinger Breakout", match: 33, tags: ["Breakout", "Swing", "Few Trades"] },
                      ].map((bot, idx) => (
                        <div
                          key={idx}
                          className={`mb-3 last:mb-0 rounded-lg border p-4 transition-all duration-500 ${
                            idx === 0
                              ? "border-blue-500/40 bg-blue-500/10"
                              : "border-blue-600/20 bg-blue-950/20"
                          } ${reveal(isVisible, animateEntrance)('opacity-0 translate-y-3', 'opacity-100 translate-y-0')}`}
                          style={{ transitionDelay: isVisible && animateEntrance ? `${400 + idx * 150}ms` : '0ms' }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-semibold text-sm">{bot.name}</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              bot.match === 100
                                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                : bot.match >= 67
                                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                            }`}>
                              {bot.match}% match
                            </span>
                          </div>
                          {/* Match bar */}
                          <div className="w-full h-1.5 rounded-full bg-blue-950/50 mb-2.5">
                            <div
                              className={`h-full rounded-full transition-all duration-1000 ${
                                bot.match === 100
                                  ? "bg-gradient-to-r from-green-500 to-emerald-400"
                                  : bot.match >= 67
                                  ? "bg-gradient-to-r from-blue-500 to-blue-400"
                                  : "bg-gradient-to-r from-gray-500 to-gray-400"
                              }`}
                              style={{ width: isVisible ? `${bot.match}%` : '0%', transitionDelay: isVisible && animateEntrance ? `${600 + idx * 150}ms` : '0ms' }}
                            ></div>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {bot.tags.map((tag, tIdx) => (
                              <span key={tIdx} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </AnimatedSection>

      {/* Indicators Highlight Section - preview of /indicators page */}
      <AnimatedSection>
        {({ isVisible, animateEntrance }) => (
          <section className="relative overflow-hidden border-t border-blue-900/40 bg-gradient-to-b from-[#050816] to-[#020617] py-14 sm:py-16 lg:py-20">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(15,118,110,0.08),transparent_55%)]" />
            <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <div
                className={`text-center mb-8 ${reveal(isVisible, animateEntrance)("opacity-0 translate-y-4", "opacity-100 translate-y-0")}`}
              >
                <p className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-blue-200/90">
                  MT5 Trader Toolkit
                </p>
                <h2 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Free MT5 Trader Toolkit
                </h2>
                <p className="mt-3 text-sm text-gray-300 max-w-2xl mx-auto sm:text-base">
                  Practical indicators and utilities for MetaTrader&nbsp;5 — sessions markers, drawdown limiters, trade analytics and more. Download free after signup.
                </p>
              </div>

              <div
                className={`grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3 ${reveal(isVisible, animateEntrance)("opacity-0 translate-y-6", "opacity-100 translate-y-0")}`}
                style={{ transitionDelay: isVisible && animateEntrance ? "100ms" : "0ms" }}
              >
                <div
                  className={`group flex flex-col rounded-2xl border border-blue-700/30 bg-gradient-to-br from-blue-950/40 via-[#0b1120] to-blue-900/20 p-4 shadow-[0_0_20px_rgba(15,23,42,0.8)] transition-all duration-700 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-[0_0_28px_rgba(59,130,246,0.3)] sm:p-5 ${reveal(isVisible, animateEntrance)("opacity-0 translate-y-6", "opacity-100 translate-y-0")} hover:transition-transform hover:duration-300`}
                  style={{ transitionDelay: isVisible && animateEntrance ? "180ms" : "0ms" }}
                >
                  <h3 className="text-base font-semibold text-white sm:text-lg">Read structure at a glance</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-300">
                    See where price sits within recent swings, ranges, and key zones instead of trying to
                    reconstruct the entire story from raw candles every time you open a chart.
                  </p>
                </div>
                <div
                  className={`group flex flex-col rounded-2xl border border-blue-700/30 bg-gradient-to-br from-blue-950/40 via-[#0b1120] to-blue-900/20 p-4 shadow-[0_0_20px_rgba(15,23,42,0.8)] transition-all duration-700 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-[0_0_28px_rgba(59,130,246,0.3)] sm:p-5 ${reveal(isVisible, animateEntrance)("opacity-0 translate-y-6", "opacity-100 translate-y-0")} hover:transition-transform hover:duration-300`}
                  style={{ transitionDelay: isVisible && animateEntrance ? "260ms" : "0ms" }}
                >
                  <h3 className="text-base font-semibold text-white sm:text-lg">Understand sessions &amp; volatility</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-300">
                    Easily spot when Asian, London, or New York flow is driving the market, how far each
                    session expanded, and when conditions actually fit your playbook.
                  </p>
                </div>
                <div
                  className={`group flex flex-col rounded-2xl border border-blue-700/30 bg-gradient-to-br from-blue-950/40 via-[#0b1120] to-blue-900/20 p-4 shadow-[0_0_20px_rgba(15,23,42,0.8)] transition-all duration-700 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-[0_0_28px_rgba(59,130,246,0.3)] sm:p-5 ${reveal(isVisible, animateEntrance)("opacity-0 translate-y-6", "opacity-100 translate-y-0")} hover:transition-transform hover:duration-300`}
                  style={{ transitionDelay: isVisible && animateEntrance ? "340ms" : "0ms" }}
                >
                  <h3 className="text-base font-semibold text-white sm:text-lg">Make faster, cleaner decisions</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-300">
                    With levels, sessions, and context handled for you, you can focus on execution, risk, and
                    trade management — not redrawing the same information over and over.
                  </p>
                </div>
              </div>

              <div
                className={`mt-8 flex justify-center ${reveal(isVisible, animateEntrance)("opacity-0 translate-y-4", "opacity-100 translate-y-0")}`}
                style={{ transitionDelay: isVisible && animateEntrance ? "400ms" : "0ms" }}
              >
                <Link
                  href="/indicators"
                  onClick={() => trackCtaClicked('homepage_view_toolkit', 'View full toolkit & download', 'homepage_indicators', '/indicators')}
                  className="group inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:from-blue-600 hover:to-blue-500 hover:shadow-[0_0_24px_rgba(59,130,246,0.5)] hover:scale-[1.02] border border-blue-600/40 sm:px-8 sm:py-3.5 sm:text-base"
                >
                  View full toolkit &amp; download
                  <svg className="ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </div>
          </section>
        )}
      </AnimatedSection>

      {/* Transition Divider - Bot Picker CTA to Full Strategy Arsenal */}
      <div className="relative h-6 bg-gradient-to-b from-[#050816] via-[#0a0e27] to-[#0b1b40]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent"></div>
      </div>

      {/* Full Strategy Arsenal Section */}
      <AnimatedSection>
        {({ isVisible, animateEntrance }) => (
          <section className="relative bg-gradient-to-t from-[#050816] via-[#0f172a] to-[#0b1b40] py-24 border-t border-blue-400/10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {/* Main Heading */}
              <div className={`text-center mb-8 ${reveal(isVisible, animateEntrance)('opacity-0 translate-y-4', 'opacity-100 translate-y-0')}`}>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl mb-4">
              That's Why You Need a Full Strategy Arsenal
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
              With 10+ expert-designed bots, you're never stuck with just one approach…
            </p>
          </div>

            <div className="max-w-5xl mx-auto">
              {/* Secondary Heading */}
              <div className={`mb-8 ${reveal(isVisible, animateEntrance)('opacity-0 translate-y-4', 'opacity-100 translate-y-0')}`}
                   style={{ transitionDelay: isVisible && animateEntrance ? '200ms' : '0ms' }}>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                  What's Inside the Bundle?
                </h3>
                <p className="text-gray-300 text-lg">
                  Explore 10+ expertly designed strategies that cover every market condition…
                </p>
              </div>

              {/* Strategy List */}
              <div className="mb-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "NewYork–London Breakout",
                    "Grid",
                    "EMA Crossover with Price Action Confirmation",
                    "RSI Overbought/Oversold with Price Action Confirmation",
                    "MACD with Price Action Confirmation",
                    "Heiken Ashi with Price Action Confirmation",
                    "Inside Bar Breakout",
                    "Stochastics with Price Action Confirmation",
                    "Bollinger Bands with Price Action Confirmation",
                    "Fibonacci Retracement",
                    "Daily Range Breakout",
                    "Pivot Point with Price Action Confirmation",
                    "RSI Divergence with Price Action Confirmation",
                  ].map((strategy, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-3 p-4 rounded-lg border border-blue-600/20 bg-gradient-to-br from-blue-950/20 via-[#0f1f4a]/15 to-blue-900/20 backdrop-blur-sm hover:border-blue-800/40 hover:bg-gradient-to-br hover:from-blue-950/30 hover:via-[#0f1f4a]/25 hover:to-blue-900/30 ${reveal(isVisible, animateEntrance)('opacity-0 translate-y-4', 'opacity-100 translate-y-0')} hover:transition-colors hover:duration-300`}
                      style={{ transitionDelay: isVisible && animateEntrance ? `${100 + index * 50}ms` : '0ms' }}
                    >
                    <svg
                      className="h-6 w-6 flex-shrink-0 text-blue-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-white font-medium">{strategy}</span>
                  </div>
                ))}
              </div>
            </div>

              {/* Call-to-Action Button */}
              <div className={`text-center ${reveal(isVisible, animateEntrance)('opacity-0 translate-y-4', 'opacity-100 translate-y-0')}`}
                   style={{ transitionDelay: isVisible && animateEntrance ? '400ms' : '0ms' }}>
                <Link
                  href="/bundle"
                  onClick={() => trackCtaClicked('homepage_strategy_arsenal', 'Get Full Strategy Arsenal', 'homepage_strategy_list', '/bundle')}
                  className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r from-blue-700 to-blue-600 px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:from-blue-600 hover:to-blue-500 hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] hover:scale-105 border border-blue-600/30"
                >
                  <span className="relative z-10">Get Full Strategy Arsenal</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                </Link>
              </div>
            </div>
          </div>
        </section>
        )}
      </AnimatedSection>

      {/* Transition Divider - Full Strategy Arsenal to Are They Good */}
      <div className="relative h-6 bg-gradient-to-b from-[#0b1b40] via-[#0a0e27] to-[#050816]">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(59,130,246,0.02)_0%,transparent_50%,rgba(59,130,246,0.02)_100%)]"></div>
      </div>

      {/* Are They Good Section */}
      <AnimatedSection>
        {({ isVisible, animateEntrance }) => (
          <section className="relative bg-gradient-to-b from-[#050816] via-[#0a0e27] to-[#050816] py-24">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              {/* Main Heading */}
              <div className={`text-center mb-12 ${reveal(isVisible, animateEntrance)('opacity-0 translate-y-4', 'opacity-100 translate-y-0')}`}>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl mb-4">
              Are they good?
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
              In order to make them as robust as possible, we implemented the following features for every strategy:
            </p>
          </div>

              {/* Features List - Different Card Design */}
              <div className="max-w-4xl mx-auto space-y-4">
                {/* Trailing Stop Losses */}
                <div className={`group relative overflow-hidden rounded-lg border-l-4 border-blue-500 bg-gradient-to-r from-blue-950/40 to-[#0f1f4a]/30 p-6 transition-all duration-700 hover:border-blue-800 hover:shadow-lg hover:shadow-blue-800/20 hover:-translate-x-1 ${reveal(isVisible, animateEntrance)('opacity-0 -translate-x-4', 'opacity-100 translate-x-0')} hover:transition-transform hover:duration-300`}
                     style={{ transitionDelay: isVisible && animateEntrance ? '100ms' : '0ms' }}>
                  <div className="flex items-center gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600/30 to-blue-800/30 flex items-center justify-center border border-blue-500/30">
                        <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-white flex-1">Trailing Stop Losses</h3>
                  </div>
                </div>

                {/* Daily Trade Limits */}
                <div className={`group relative overflow-hidden rounded-lg border-l-4 border-blue-500 bg-gradient-to-r from-blue-950/40 to-[#0f1f4a]/30 p-6 transition-all duration-700 hover:border-blue-800 hover:shadow-lg hover:shadow-blue-800/20 hover:-translate-x-1 ${reveal(isVisible, animateEntrance)('opacity-0 -translate-x-4', 'opacity-100 translate-x-0')} hover:transition-transform hover:duration-300`}
                     style={{ transitionDelay: isVisible && animateEntrance ? '200ms' : '0ms' }}>
                  <div className="flex items-center gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600/30 to-blue-800/30 flex items-center justify-center border border-blue-500/30">
                        <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-white flex-1">Daily Trade Limits</h3>
                  </div>
                </div>

                {/* Gain / Loss Filters */}
                <div className={`group relative overflow-hidden rounded-lg border-l-4 border-blue-500 bg-gradient-to-r from-blue-950/40 to-[#0f1f4a]/30 p-6 transition-all duration-700 hover:border-blue-800 hover:shadow-lg hover:shadow-blue-800/20 hover:-translate-x-1 ${reveal(isVisible, animateEntrance)('opacity-0 -translate-x-4', 'opacity-100 translate-x-0')} hover:transition-transform hover:duration-300`}
                     style={{ transitionDelay: isVisible && animateEntrance ? '300ms' : '0ms' }}>
                  <div className="flex items-center gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600/30 to-blue-800/30 flex items-center justify-center border border-blue-500/30">
                        <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-white flex-1">Gain / Loss Filters</h3>
                  </div>
                </div>

                {/* Hour Filters */}
                <div className={`group relative overflow-hidden rounded-lg border-l-4 border-blue-500 bg-gradient-to-r from-blue-950/40 to-[#0f1f4a]/30 p-6 transition-all duration-700 hover:border-blue-800 hover:shadow-lg hover:shadow-blue-800/20 hover:-translate-x-1 ${reveal(isVisible, animateEntrance)('opacity-0 -translate-x-4', 'opacity-100 translate-x-0')} hover:transition-transform hover:duration-300`}
                     style={{ transitionDelay: isVisible && animateEntrance ? '400ms' : '0ms' }}>
                  <div className="flex items-center gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600/30 to-blue-800/30 flex items-center justify-center border border-blue-500/30">
                        <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-white flex-1">Hour Filters</h3>
                  </div>
                </div>

                {/* Overtrading Protection */}
                <div className={`group relative overflow-hidden rounded-lg border-l-4 border-blue-500 bg-gradient-to-r from-blue-950/40 to-[#0f1f4a]/30 p-6 transition-all duration-700 hover:border-blue-800 hover:shadow-lg hover:shadow-blue-800/20 hover:-translate-x-1 ${reveal(isVisible, animateEntrance)('opacity-0 -translate-x-4', 'opacity-100 translate-x-0')} hover:transition-transform hover:duration-300`}
                     style={{ transitionDelay: isVisible && animateEntrance ? '500ms' : '0ms' }}>
                  <div className="flex items-center gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600/30 to-blue-800/30 flex items-center justify-center border border-blue-500/30">
                        <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-white flex-1">Overtrading Protection</h3>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </AnimatedSection>

      {/* Transition Divider - Are They Good to Test Everything */}
      <div className="relative h-6 bg-gradient-to-b from-[#050816] to-[#0f1f4a]">
      </div>

      {/* Test Everything Yourself Section */}
      <AnimatedSection>
        {({ isVisible, animateEntrance }) => (
          <section className="relative bg-gradient-to-br from-[#0f1f4a] via-[#0f172a] to-[#050816] py-24 border-t border-blue-400/10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto text-center">
                {/* Main Heading */}
                <div className={`mb-8 ${reveal(isVisible, animateEntrance)('opacity-0 translate-y-4', 'opacity-100 translate-y-0')}`}>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl mb-4">
                Test Everything Yourself
              </h2>
              <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
                Once you download the bundle, you can backtest in MT5 using any historical data. No guesswork — just clear results.
              </p>
            </div>

                {/* Call-to-Action Button */}
                <div className={`mt-10 ${reveal(isVisible, animateEntrance)('opacity-0 translate-y-4', 'opacity-100 translate-y-0')}`}
                     style={{ transitionDelay: isVisible && animateEntrance ? '200ms' : '0ms' }}>
                  <Link
                    href="/bundle"
                    onClick={() => trackCtaClicked('homepage_get_bundle', 'Get the Bundle Now', 'homepage_test_yourself', '/bundle')}
                    className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r from-blue-700 to-blue-600 px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:from-blue-600 hover:to-blue-500 hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] hover:scale-105 border border-blue-600/30"
                  >
                    <span className="relative z-10">Get the Bundle Now</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}
      </AnimatedSection>

      {/* Transition Divider - Test Everything to Reviews */}
      <div className="relative h-8 bg-gradient-to-b from-[#050816] via-[#0a0e27] to-[#050816]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(59,130,246,0.03),transparent)]"></div>
      </div>

      {/* Reviews Section */}
      <AnimatedSection>
        {({ isVisible, animateEntrance }) => (
          <section className="relative bg-gradient-to-b from-[#0a0e27] via-[#050816] to-[#050816] py-24 overflow-hidden border-t border-blue-900/20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {/* Main Heading */}
              <div className={`text-center mb-12 ${reveal(isVisible, animateEntrance)('opacity-0 translate-y-4', 'opacity-100 translate-y-0')}`}>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl mb-4">
              Excellent 4.9 of 5 Stars Rating
            </h2>
            <p className="text-lg sm:text-xl text-gray-300">
              Based on 5,000+ real user reviews
            </p>
          </div>

              {/* Auto-Rotating Carousel */}
              <div className={`relative overflow-hidden carousel-container-auto ${reveal(isVisible, animateEntrance)('opacity-0 translate-y-4', 'opacity-100 translate-y-0')}`}
                   style={{ transitionDelay: isVisible && animateEntrance ? '200ms' : '0ms' }}>
                <div className="carousel-track-auto">
                  {/* First Set of Cards */}
                  {[
                {
                  text: "What I like is that the bundle isn't just one type of bot. There are scalpers, trend-followers, and some grid logic too. I'm still forward-testing on demo, but so far execution is smooth and no crazy spread sensitivity. Would be nice to see some set files shared from the community.",
                  author: "Trader Marko P"
                },
                {
                  text: "The strategies are well-designed and easy to backtest. The interface in MT5 is intuitive, and I've seen consistent results on demo. Highly recommended.",
                  author: "Trader Ana L"
                },
                {
                  text: "I appreciate the variety in the bundle. Each bot feels unique and adaptable to different market conditions. Customer support is quick and helpful as well.",
                  author: "Trader John D"
                },
                {
                  text: "Excellent execution and minimal latency. I was worried about slippage, but it's been very stable so far. Great for both scalping and trend-following strategies.",
                  author: "Trader Sofia K"
                },
                {
                  text: "Backtesting was straightforward, and results were clear. The bundle really saves time and gives a comprehensive approach to trading multiple strategies.",
                  author: "Trader Luka S"
                },
              ].map((review, index) => (
                <div key={`first-${index}`} className="carousel-card-auto">
                  <div className="rounded-xl border border-blue-600/30 bg-gradient-to-br from-blue-950/40 via-[#0f1f4a]/30 to-blue-900/40 p-8 backdrop-blur-sm h-full">
                    <p className="text-gray-300 mb-6 leading-relaxed">
                      "{review.text}"
                    </p>
                    <p className="text-blue-400 font-semibold">— {review.author}</p>
                  </div>
                </div>
              ))}
              
              {/* Duplicate Set for Seamless Loop */}
              {[
                {
                  text: "What I like is that the bundle isn't just one type of bot. There are scalpers, trend-followers, and some grid logic too. I'm still forward-testing on demo, but so far execution is smooth and no crazy spread sensitivity. Would be nice to see some set files shared from the community.",
                  author: "Trader Marko P"
                },
                {
                  text: "The strategies are well-designed and easy to backtest. The interface in MT5 is intuitive, and I've seen consistent results on demo. Highly recommended.",
                  author: "Trader Ana L"
                },
                {
                  text: "I appreciate the variety in the bundle. Each bot feels unique and adaptable to different market conditions. Customer support is quick and helpful as well.",
                  author: "Trader John D"
                },
                {
                  text: "Excellent execution and minimal latency. I was worried about slippage, but it's been very stable so far. Great for both scalping and trend-following strategies.",
                  author: "Trader Sofia K"
                },
                {
                  text: "Backtesting was straightforward, and results were clear. The bundle really saves time and gives a comprehensive approach to trading multiple strategies.",
                  author: "Trader Luka S"
                },
              ].map((review, index) => (
                <div key={`second-${index}`} className="carousel-card-auto">
                  <div className="rounded-xl border border-blue-600/30 bg-gradient-to-br from-blue-950/40 via-[#0f1f4a]/30 to-blue-900/40 p-8 backdrop-blur-sm h-full">
                    <p className="text-gray-300 mb-6 leading-relaxed">
                      "{review.text}"
                    </p>
                    <p className="text-blue-400 font-semibold">— {review.author}</p>
                  </div>
                </div>
              ))}
              </div>
            </div>
            </div>
          </section>
        )}
      </AnimatedSection>

      {/* Email Subscription Section */}
      <EmailSubscriptionSection />
    </div>
  );
}

function EmailSubscriptionSection() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [ref, isVisible, animateEntrance] = useScrollReveal();

  useEffect(() => {
    if (isVisible) trackPdfLeadFormViewed('home');
  }, [isVisible]);

  const validateEmail = (emailValue: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailValue.trim() || !emailRegex.test(emailValue)) {
      setEmailError("Enter a valid email address.");
      return false;
    }
    
    setEmailError("");
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    // Clear error when user starts typing
    if (emailError) {
      setEmailError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/send-pdf-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setEmailError(data.error || 'Failed to send email. Please try again.');
        setIsSubmitting(false);
        return;
      }

      trackPdfGuideRequested(email, 'home');
      setIsSubmitted(true);
      setIsSubmitting(false);

      // Reset after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setEmail("");
        setEmailError("");
      }, 5000);
    } catch (error) {
      console.error('Error submitting email:', error);
      setEmailError('An error occurred. Please try again later.');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Transition Divider - Reviews to Email Subscription */}
      <div className="relative h-8 bg-gradient-to-b from-[#050816] to-[#0f1f4a]">
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(59,130,246,0.02)_0%,transparent_100%)]"></div>
      </div>
      <section ref={ref} className="relative bg-gradient-to-b from-[#0f1f4a] via-[#0f172a] to-[#050816] py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-12 ${reveal(isVisible, animateEntrance)('opacity-0 translate-y-4', 'opacity-100 translate-y-0')}`}>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl mb-4">
            Get Your Copy of "Top 5 Trading Bots for MT5" PDF!
          </h2>
          <p className="text-lg sm:text-xl text-gray-300">
            Enter your email and we'll send it right over.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={email}
                      onChange={handleEmailChange}
                      placeholder="Enter your email"
                      className={`flex-1 w-full rounded-lg border ${
                        emailError 
                          ? "border-red-500/60 bg-[#050816]" 
                          : "border-blue-600/40 bg-[#050816]"
                      } px-6 py-4 text-white placeholder-gray-500 focus:border-[#1e40af] focus:outline-none transition-colors`}
                    />
                    {emailError && (
                      <p className="mt-2 text-sm text-red-400 animate-fade-in">
                        {emailError}
                      </p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r from-blue-700 to-blue-600 px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:from-blue-600 hover:to-blue-500 hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] hover:scale-105 border border-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <span className="relative z-10">{isSubmitting ? "Sending..." : "Send Me the Guide"}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="text-center p-8 rounded-xl border border-green-500/50 bg-green-500/10 backdrop-blur-sm animate-fade-in">
              <div className="flex items-center justify-center gap-3 mb-2">
                <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-xl font-semibold text-green-400">
                  Successfully sent to your email!
                </p>
              </div>
            </div>
          )}
          </div>
        </div>
      </section>
    </>
  );
}

