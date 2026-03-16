"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { trackWelcomeModalShown, trackWelcomeModalDismissed, trackPdfLeadFormViewed, trackPdfGuideRequested } from '@/lib/posthog';

const STORAGE_KEY = "traders-market-pdf-modal-seen";
const SHOW_DELAY_MS = 800;

export function FirstTimeVisitorModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || typeof window === "undefined") return;
    const seen = localStorage.getItem(STORAGE_KEY);
    if (seen) return;
    const timer = setTimeout(() => {
      setIsOpen(true);
      trackWelcomeModalShown();
      trackPdfLeadFormViewed('welcome-modal');
    }, SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, [isMounted]);

  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen]);

  const markSeenAndClose = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, "true");
    }
    trackWelcomeModalDismissed();
    setIsOpen(false);
  };

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
    setEmail(e.target.value);
    if (emailError) setEmailError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/send-pdf-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (!response.ok) {
        setEmailError(data.error || "Failed to send. Please try again.");
        setIsSubmitting(false);
        return;
      }

      trackPdfGuideRequested(email, 'welcome-modal');
      setIsSubmitted(true);
      setIsSubmitting(false);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, "true");
      }
    } catch (err) {
      console.error("Error submitting email:", err);
      setEmailError("Something went wrong. Please try again later.");
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) markSeenAndClose();
  };

  if (!isMounted || !isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="first-time-modal-title"
      onClick={handleBackdropClick}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-blue-600/30 bg-gradient-to-b from-[#0f1f4a] via-[#0f172a] to-[#050816] p-8 shadow-xl shadow-blue-900/20"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={markSeenAndClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <h2 id="first-time-modal-title" className="text-xl font-bold text-white sm:text-2xl mb-2">
            Enter your email and get a free PDF
          </h2>
          <p className="text-sm text-gray-400">
            We&apos;ll send you the guide right away.
          </p>
        </div>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="Enter your email"
                className={`w-full rounded-lg border ${
                  emailError ? "border-red-500/60" : "border-blue-600/40"
                } bg-[#050816] px-4 py-3 text-white placeholder-gray-500 focus:border-[#1e40af] focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors`}
                autoComplete="email"
              />
              {emailError && (
                <p className="mt-2 text-sm text-red-400">{emailError}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-3.5 text-base font-semibold text-white transition-all duration-300 hover:from-blue-600 hover:to-blue-500 hover:shadow-[0_0_24px_rgba(59,130,246,0.5)] border border-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10">
                {isSubmitting ? "Sending…" : "Send me the free PDF"}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </button>
          </form>
        ) : (
          <div className="text-center py-4">
            <div className="flex items-center justify-center gap-2 mb-3">
              <svg className="w-6 h-6 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-lg font-semibold text-green-400">Check your inbox</p>
            </div>
            <p className="text-sm text-gray-400 mb-6">
              We&apos;ve sent the PDF to your email.
            </p>
            <button
              type="button"
              onClick={markSeenAndClose}
              className="w-full rounded-lg border border-blue-600/40 bg-blue-600/10 px-6 py-3 text-base font-medium text-white hover:bg-blue-600/20 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modalContent, document.body);
}
