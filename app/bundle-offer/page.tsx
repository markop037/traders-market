"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  trackBundleCheckoutPageViewed,
  trackCheckoutInitiated,
  trackCheckoutLoginRequired,
  trackPdfLeadFormViewed,
  trackPdfGuideRequested,
} from '@/lib/posthog';
const CHECKOUT_BASE = "https://www.momentumdigital.online/checkout";

export default function BundleOffer() {
  const { user, hasActiveSubscription } = useAuth();
  const router = useRouter();

  const hasPaid = hasActiveSubscription === true;
  const checkoutHref = user?.email
    ? `${CHECKOUT_BASE}?email=${encodeURIComponent(user.email)}`
    : CHECKOUT_BASE;

  useEffect(() => {
    trackBundleCheckoutPageViewed(!!user, hasPaid);
  }, [user, hasPaid]);

  const handlePurchase = () => {
    if (!user) {
      trackCheckoutLoginRequired();
      router.push("/login?redirect=/bundle-offer");
      return;
    }
    if (hasPaid) {
      router.push("/dashboard/bots");
      return;
    }
    trackCheckoutInitiated('bundle-offer', checkoutHref);
    window.open(checkoutHref, "_blank", "noopener,noreferrer");
  };
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#050816] via-[#0f172a] via-[#0f1f4a] to-[#050816]">
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            <span className="bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
              TradersMarket.io Bundle
            </span>
          </h1>
        </div>

        {/* Pricing Card */}
        <div className="mt-16 flex justify-center">
          <div className="relative w-full max-w-2xl rounded-2xl border border-blue-600/40 bg-gradient-to-br from-blue-950/40 via-[#0f1f4a]/35 to-blue-900/40 p-8 shadow-2xl backdrop-blur-sm">
            {/* Glow effect */}
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-700 via-blue-700/35 to-blue-600 opacity-25 blur-lg"></div>
            
            <div className="relative">
              <div className="text-center">
                <div className="mb-4">
                  <div className="flex flex-col items-center gap-0.5 border border-amber-500/20 rounded-lg bg-amber-500/5 px-6 py-4">
                    <span className="text-2xl font-bold text-white/60 line-through">$399</span>
                    <span className="text-xs text-gray-400 uppercase tracking-wider">Limited time price</span>
                    <span className="text-5xl font-bold text-amber-300">$259</span>
                  </div>
                  <span className="text-gray-400 mt-2 block">one-time payment</span>
                </div>
                
                {/* Money-Back Guarantee Badge - Top */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-600/20 border border-green-500/40 mb-4">
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="text-sm font-semibold text-green-300">30-Day Money-Back Guarantee</span>
                </div>
                
                <p className="text-gray-300 mb-8">
                  Complete bundle with all Expert Advisors and lifetime updates
                </p>
              </div>

              {/* Section 1 - What's Included */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-4">What's Included</h2>
                <div className="space-y-3">
                  {[
                    "10 MetaTrader 5 trading bots (EAs)",
                    "Ready-to-use strategies with price action confirmation",
                    "Instant digital download",
                    "Lifetime license – no hidden fees",
                    "Step-by-step setup guide",
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 group">
                      <svg
                        className="h-6 w-6 flex-shrink-0 text-blue-400 group-hover:text-[#1e40af] transition-colors"
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
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 2 - Why Choose TradersMarket.io Bots */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-4">Why Choose TradersMarket.io Bots</h2>
                <div className="space-y-3">
                  {[
                    "Trade multiple proven strategies at once",
                    "Reduce emotions and stick to rules-based trading",
                    "Diversify across strategies for risk management",
                    "Easy installation, beginner-friendly setup",
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 group">
                      <svg
                        className="h-6 w-6 flex-shrink-0 text-blue-400 group-hover:text-[#1e40af] transition-colors"
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
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Button */}
              <button 
                onClick={handlePurchase}
                className="w-full rounded-lg bg-gradient-to-r from-blue-700 to-blue-600 px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:from-blue-600 hover:to-blue-500 hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] hover:scale-105 border border-blue-600/30"
              >
                <span className="flex flex-col items-center leading-tight">
                <span className="text-white/70 line-through text-sm">$399</span>
                <span className="text-amber-300 font-semibold">Purchase Bundle - $259</span>
              </span>
              </button>

              {/* Money-Back Guarantee - Detailed */}
              <div className="mt-6 rounded-xl border border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-600/10 p-6 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500/30 to-emerald-600/30 border border-green-500/40 flex items-center justify-center">
                      <svg className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2">
                      100% No Questions Asked Money-Back Guarantee
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      Try the bundle risk-free for 30 days. If you're not completely satisfied, simply contact us for a full refund—no questions asked. We stand behind the quality of our trading bots.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PDF Download Section */}
      <EmailSubscriptionSection />
    </main>
  );
}

function EmailSubscriptionSection() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    trackPdfLeadFormViewed('bundle-offer');
  }, []);

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

      trackPdfGuideRequested(email, 'bundle-offer');
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
    <section className="bg-gradient-to-br from-[#050816] via-[#0f172a] via-[#0f1f4a] to-[#050816] py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-fade-in">
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
  );
}
