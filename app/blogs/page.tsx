"use client";

import Image from "next/image";
import Link from "next/link";
import { trackBlogPostSelected } from '@/lib/posthog';

const BLOG_SLUGS = [
  "future-algorithmic-trading-retail-traders",
  "choose-right-trading-bot-trading-style",
  "our-story-trading-bots-metatrader5",
  "common-mistakes-trading-bots-avoid",
  "logic-behind-trading-bots-transparency",
  "automated-vs-manual-trading-pros-cons",
  "risk-management-more-important-strategy",
  "price-action-improve-trading-strategy",
  "5-popular-trading-strategies-know",
  "trading-bots-how-work-metatrader5",
];

export default function Blogs() {
  const blogPosts = [
    {
      title: "The Future of Algorithmic Trading for Retail Traders",
      excerpt: "For decades, algorithmic trading was reserved for hedge funds and institutions with deep pockets, advanced infrastructure, and teams of quant...",
      date: "March 20, 2024",
      category: "Education",
      image: "/blogs-images/future-algorithmic-trading-retail-traders.jpg",
    },
    {
      title: "How to Choose the Right Trading Bot for Your Trading Style",
      excerpt: "Not all trading strategies work for every trader. The same applies to trading bots: the best results come when you...",
      date: "March 15, 2024",
      category: "Tutorial",
      image: "/blogs-images/choose-right-trading-bot-trading-style.jpg",
    },
    {
      title: "Our Story: Why We Built Trading Bots for MetaTrader 5",
      excerpt: "When we first started trading, we did what most traders do—spend hours analyzing charts, watching indicators, and trying to balance...",
      date: "March 10, 2024",
      category: "Platform",
      image: "/blogs-images/our-story-trading-bots-metatrader5.jpg",
    },
    {
      title: "Common Mistakes Traders Make with Trading Bots (And How to Avoid Them)",
      excerpt: "Automated trading is one of the most powerful tools available to retail traders today. With trading bots, you can execute...",
      date: "March 5, 2024",
      category: "Education",
      image: "/blogs-images/common-mistakes-trading-bots-avoid.jpg",
    },
    {
      title: "The Logic Behind Our Trading Bots: Transparency in Strategy",
      excerpt: "When traders hear the term 'trading bot,' skepticism is natural. Too many products in the market promise outsized returns without...",
      date: "February 28, 2024",
      category: "Tutorial",
      image: "/blogs-images/logic-behind-trading-bots-transparency.jpg",
    },
    {
      title: "Automated Trading vs. Manual Trading: Pros and Cons",
      excerpt: "Trading the financial markets has always been a balance between skill, discipline, and decision-making speed. With the rise of trading...",
      date: "February 25, 2024",
      category: "Education",
      image: "/blogs-images/automated-vs-manual-trading-pros-cons.jpg",
    },
    {
      title: "Why Risk Management Is More Important Than the Strategy",
      excerpt: "Most traders spend the majority of their time searching for the \"perfect\" strategy—whether it's an EMA crossover, RSI divergence, or...",
      date: "February 20, 2024",
      category: "Education",
      image: "/blogs-images/risk-management-more-important-strategy.jpg",
    },
    {
      title: "How to Use Price Action to Improve Any Trading Strategy",
      excerpt: "Every trader knows the frustration of a strategy that looks perfect in theory but struggles in live markets. Indicators like...",
      date: "February 18, 2024",
      category: "Tutorial",
      image: "/blogs-images/price-action-improve-trading-strategy.jpg",
    },
    {
      title: "The 5 Most Popular Trading Strategies Every Trader Should Know",
      excerpt: "In trading, the right strategy often makes the difference between consistency and chaos. While every trader develops their own style,...",
      date: "February 15, 2024",
      category: "Education",
      image: "/blogs-images/5-popular-trading-strategies-know.jpg",
    },
    {
      title: "What Are Trading Bots and How Do They Work in MetaTrader 5?",
      excerpt: "Trading in today's markets is fast-paced, and decisions often need to be made in seconds. While discretionary trading has its...",
      date: "February 12, 2024",
      category: "Platform",
      image: "/blogs-images/trading-bots-how-work-metatrader5.jpg",
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#050816] via-[#0f172a] via-[#0f1f4a] to-[#050816]">
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            <span className="bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
              Trading Blogs
            </span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-300 sm:text-xl max-w-2xl mx-auto">
            Insights, tutorials, and strategies to help you succeed in algorithmic trading
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post, index) => (
            <article
              key={index}
              className="group rounded-xl border border-blue-900/40 bg-gradient-to-br from-blue-950/20 via-[#0f1f4a]/20 to-blue-900/15 p-6 backdrop-blur-sm transition-all duration-300 hover:border-blue-800/50 hover:shadow-lg hover:shadow-blue-600/25 hover:shadow-blue-800/25"
            >
              <div className="mb-4 overflow-hidden rounded-lg">
                <Image
                  src={post.image}
                  alt={post.title}
                  width={400}
                  height={250}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="mb-4">
                <span className="inline-block rounded-full bg-gradient-to-r from-blue-600/25 to-blue-800/25 px-3 py-1 text-xs font-semibold text-blue-300">
                  {post.category}
                </span>
              </div>
              <h2 className="text-xl font-semibold text-white mb-3 group-hover:text-blue-400 transition-colors">
                {post.title}
              </h2>
              <p className="text-gray-400 mb-4">{post.excerpt}</p>
              {BLOG_SLUGS[index] ? (
                <Link
                  href={`/blogs/${BLOG_SLUGS[index]}`}
                  onClick={() => trackBlogPostSelected(BLOG_SLUGS[index], post.title)}
                  className="inline-flex items-center text-sm font-medium text-blue-400 hover:text-[#1e40af] transition-colors cursor-pointer no-underline"
                >
                  Read more
                  <svg
                    className="ml-2 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              ) : (
                <a
                  href="#"
                  className="inline-flex items-center text-sm font-medium text-blue-400 hover:text-[#1e40af] transition-colors cursor-pointer no-underline"
                >
                  Read more
                  <svg
                    className="ml-2 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </a>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
