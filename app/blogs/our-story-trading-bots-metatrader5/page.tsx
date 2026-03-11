import Image from "next/image";
import Link from "next/link";
import BlogViewTracker from "../BlogViewTracker";

export default function BlogPost() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#050816] via-[#0f172a] via-[#0f1f4a] to-[#050816]">
      <BlogViewTracker title="Our Story: Why We Built Trading Bots for MetaTrader 5" slug="our-story-trading-bots-metatrader5" />
      <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/blogs"
          className="inline-flex items-center text-sm font-medium text-blue-400 hover:text-[#1e40af] transition-colors mb-8 cursor-pointer no-underline"
        >
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Blogs
        </Link>

        {/* Blog Image */}
        <div className="mb-8 overflow-hidden rounded-xl">
          <Image
            src="/blogs-images/our-story-trading-bots-metatrader5.jpg"
            alt="Our Story: Why We Built Trading Bots for MetaTrader 5"
            width={800}
            height={400}
            className="w-full h-auto object-cover max-h-96"
            priority
          />
        </div>

        {/* Category Badge */}
        <div className="mb-6">
          <span className="inline-block rounded-full bg-gradient-to-r from-blue-600/25 to-blue-800/25 px-3 py-1 text-xs font-semibold text-blue-300">
            Platform
          </span>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl mb-8">
          Our Story: Why We Built Trading Bots for MetaTrader 5
        </h1>

        {/* Content */}
        <div className="prose prose-invert prose-lg max-w-none">
          <div className="text-gray-300 leading-relaxed space-y-6 text-base sm:text-lg">
            <p>
              When we first started trading, we did what most traders do—spend hours analyzing charts, watching indicators, and trying to balance trading with everything else in life. It didn't take long to realize that even the most disciplined trader has limits. Fatigue, missed signals, hesitation, or overtrading—these all get in the way of consistent results.
            </p>

            <p>
              That's why we decided to build something better.
            </p>

            <p>
              We come from a background in both trading and software development. Over the years, we noticed a clear pattern: while strategies like EMA crossovers, RSI signals, or Bollinger Band setups are reliable foundations, traders often fail to execute them consistently. Emotions take over, or opportunities are simply missed. Automating these strategies was the natural solution.
            </p>

            <p>
              But we didn't want to create just another set of bots. Our mission from the start was simplicity and reliability. Many trading bots you'll find online are either overcomplicated, poorly documented, or built on untested strategies. We wanted to do the opposite:
            </p>

            <ul className="list-disc pl-6 space-y-2 text-gray-300">
              <li>Focus on well-known, time-tested strategies (EMA crossover, RSI, Fibonacci retracement, daily breakouts, etc.).</li>
              <li>Add price action confirmation so the bots don't just fire off random trades, but act with discipline.</li>
              <li>Package them in a way that traders could install, understand, and start using without months of tinkering.</li>
            </ul>

            <p>
              We believe trading should be professional but also approachable. You shouldn't need to be a coder or spend weeks debugging someone else's bot to automate your trading. That's why we built our MetaTrader 5 bot bundle: ten reliable bots, ready to use, built on strategies that traders already know and trust.
            </p>

            <p>
              At the end of the day, our goal is simple—help traders take the strategies they already believe in and execute them with consistency, discipline, and efficiency.
            </p>

            <p className="mt-8">
              If you'd like to try the bots we've built, you can check out our Trading Bots Bundle here: <Link href="/bundle" className="text-blue-400 hover:text-blue-300 underline">Bundle Offer</Link>
            </p>
          </div>
        </div>
      </article>
    </main>
  );
}
