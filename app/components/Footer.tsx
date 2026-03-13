"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logNavigationClick, logExternalLinkClick, logAnalyticsEvent } from "@/lib/analytics";

export default function Footer() {
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);
  const emailAddress = "admin@tradersmarket.io";

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    logNavigationClick(href, 'footer');
    if (pathname === href) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(emailAddress);
      setCopied(true);
      logAnalyticsEvent('external_link_click', { url: `mailto:${emailAddress}`, label: 'copy_email' });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy email:", err);
    }
  };

  return (
    <footer className="bg-gradient-to-br from-[#050816] via-[#0f172a] to-[#050816] border-t border-blue-900/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/tradersmarket-logo.png"
                alt="TradersMarket.io"
                width={250}
                height={60}
                className="h-7 w-auto sm:h-9 md:h-10"
                style={{ width: 'auto', height: 'auto' }}
              />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-md">
              Automate your trading with the most impactful, battle-tested strategies trusted by traders worldwide.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  onClick={(e) => handleLinkClick(e, "/")}
                  className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/bundle"
                  onClick={(e) => handleLinkClick(e, "/bundle")}
                  className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                >
                  Bundle Offer
                </Link>
              </li>
              <li>
                <Link
                  href="/indicators"
                  onClick={(e) => handleLinkClick(e, "/indicators")}
                  className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                >
                  Indicators
                </Link>
              </li>
              <li>
                <Link
                  href="/bot-picker"
                  onClick={(e) => handleLinkClick(e, "/bot-picker")}
                  className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                >
                  Bot Picker
                </Link>
              </li>
              <li>
                <Link
                  href="/blogs"
                  onClick={(e) => handleLinkClick(e, "/blogs")}
                  className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                >
                  Blogs
                </Link>
              </li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Information
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/privacy-policy"
                  onClick={(e) => handleLinkClick(e, "/privacy-policy")}
                  className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-and-conditions"
                  onClick={(e) => handleLinkClick(e, "/terms-and-conditions")}
                  className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                >
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-12 pt-8 border-t border-blue-900/30">
          <div className="flex flex-col items-center justify-center gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 flex-wrap justify-center">
              {/* Contact Information */}
              <div className="flex flex-col items-center sm:items-start gap-2 text-center sm:text-left">
                {/* Clickable Email for Copying */}
                <button
                  onClick={handleCopyEmail}
                  className="text-gray-300 text-sm sm:text-base font-medium hover:text-blue-400 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded px-1 -mx-1"
                  title="Click to copy email address"
                >
                  {emailAddress}
                </button>
                <p className="text-gray-400 text-sm">
                  Momentum Digital LLC
                </p>
                <p className="text-gray-400 text-sm">
                  30 N Gould St Ste R, Sheridan, WY 82801, USA
                </p>
              </div>

              {/* Instagram Icon */}
              <a
                href="https://www.instagram.com/tradersmarket.io?igsh=N280MGY4aG1yZW13"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => logExternalLinkClick('https://www.instagram.com/tradersmarket.io', 'instagram')}
                className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-600/20 border border-blue-600/40 hover:bg-blue-600/30 hover:border-blue-500 transition-all duration-300 hover:scale-110"
                aria-label="Visit our Instagram"
              >
                <svg
                  className="w-6 h-6 text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
            {copied && (
              <div className="text-green-400 text-sm font-medium animate-fade-in">
                Email address copied to clipboard!
              </div>
            )}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-blue-900/30">
          <p className="text-center text-gray-500 text-sm">
            © 2025 Tradersmarket.io. All rights reserved.
          </p>
        </div>

        {/* Risk Disclosure */}
        <div className="mt-8 pt-6 border-t border-blue-900/20 mx-auto max-w-2xl">
          <p className="text-gray-500/90 text-xs font-medium uppercase tracking-wider mb-3 text-center">
            Risk Disclosure
          </p>
          <div className="text-gray-500 text-xs leading-relaxed space-y-3 text-justify">
            <p>
              Trading foreign exchange on margin carries a high level of risk and may not be suitable for all investors. The use of leverage can work against you as well as for you. Before deciding to trade foreign exchange or use automated trading systems (Expert Advisors), you should carefully consider your investment objectives, level of experience, and risk appetite.
            </p>
            <p>
              There is a possibility that you may sustain a loss of some or all of your initial investment, and therefore you should not invest money that you cannot afford to lose.
            </p>
            <p>
              Past performance, including backtested or simulated results, is not indicative of future results. Simulated or hypothetical performance results have inherent limitations and do not represent actual trading. No representation is being made that any account will or is likely to achieve profits or losses similar to those shown.
            </p>
            <p>
              The information provided on this website is for informational and educational purposes only and does not constitute investment advice, financial advice, or a recommendation to buy or sell any financial instrument. Any trading decisions you make are solely your responsibility.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
