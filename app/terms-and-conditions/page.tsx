"use client";

import { useState } from "react";

export default function TermsAndConditions() {
  const [copied, setCopied] = useState(false);
  const emailAddress = "admin@tradersmarket.io";

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(emailAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy email:", err);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#050816] via-[#0f172a] via-[#0f1f4a] to-[#050816]">
      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="prose prose-invert max-w-none">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl mb-8">
            Terms and Conditions
          </h1>
          
          <p className="text-gray-400 mb-8">
            Last Updated: August 15, 2025
          </p>

          <div className="space-y-6 text-gray-300 leading-relaxed">
            <p>
              By accessing or using tradersmarket.io (the "Site"), and purchasing any products offered, you agree to the following Terms and Conditions. Please read them carefully.
            </p>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">
              1. Use at Your Own Risk
            </h2>
            <p>
              The software products (MT5 Expert Advisors or "bots") offered on this site are for educational and informational purposes only.
            </p>
            <p>
              They are not investment advice, not a guarantee of profits, and not a substitute for independent financial decision-making.
            </p>
            <p>
              You are solely responsible for how you use any bot or strategy purchased from us. Trading carries risk, and past performance does not guarantee future results.
            </p>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">
              2. No Financial Advice
            </h2>
            <p>
              We are not a licensed financial advisor, broker, or investment firm.
            </p>
            <p>
              Nothing on this website — including written content, bots, or communication — should be interpreted as financial advice, recommendation, or endorsement of any specific trading strategy or instrument.
            </p>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">
              3. Product Use and Ownership
            </h2>
            <p>
              When you purchase our bots, you receive a license for personal use only.
            </p>
            <p>
              You may not copy, share, resell, or distribute our software without written permission.
            </p>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">
              4. Refund Policy
            </h2>
            <p>
              Due to the digital nature of our products, all sales are final.
            </p>
            <p>
              We do not offer refunds once a product has been delivered. If you experience a technical issue, we will make reasonable efforts to help.
            </p>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">
              5. No Guarantee of Results
            </h2>
            <p>
              We make no guarantees or promises about the performance of any bot.
            </p>
            <p>
              Markets change, and results can vary significantly. You assume all risk when using our products on live or demo accounts.
            </p>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">
              6. Limitation of Liability
            </h2>
            <p>
              To the fullest extent permitted by law, we shall not be held liable for any loss, damage, or expense — direct or indirect — arising from your use or inability to use our products or website.
            </p>
            <p>
              This includes, but is not limited to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Trading losses</li>
              <li>Missed profits</li>
              <li>System or software errors</li>
              <li>Account issues with MetaTrader or your broker</li>
            </ul>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">
              7. External Platforms
            </h2>
            <p>
              Our products are built for MetaTrader 5 (MT5) only. We are not affiliated with MetaTrader, brokers, or any third-party platforms you may use. You are responsible for ensuring your system meets the technical requirements.
            </p>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">
              8. Changes to These Terms
            </h2>
            <p>
              We reserve the right to update or change these Terms & Conditions at any time. Changes will be posted on this page, and continued use of the site or our products constitutes your acceptance of those changes.
            </p>

            <h2 className="text-2xl font-bold text-white mt-8 mb-4">
              9. Contact Us
            </h2>
            <p>
              If you have any questions about these terms, please contact us at:
            </p>
            <p>
              📧 Email: <button
                onClick={handleCopyEmail}
                className="text-blue-400 hover:text-blue-300 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded px-1 -mx-1 underline"
                title="Click to copy email address"
              >
                {emailAddress}
              </button>
              {copied && (
                <span className="ml-2 text-green-400 text-sm animate-fade-in">
                  (Copied!)
                </span>
              )}
            </p>
            <p>
              🌐 Website: <a 
                href="/" 
                className="text-blue-400 hover:text-blue-300 underline"
              >
                tradersmarket.io
              </a>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
