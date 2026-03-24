"use client";

import Link from "next/link";
import { trackCtaClicked } from "@/lib/posthog";

export function HeroCtaClient() {
  return (
    <div className="mt-10 flex justify-center lg:justify-start">
      <Link
        href="/bundle"
        onClick={() =>
          trackCtaClicked("hero_buy_bundle", "Buy for $259", "homepage_hero", "/bundle")
        }
        className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r from-blue-700 to-blue-600 px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:from-blue-600 hover:to-blue-500 hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] hover:scale-105 border border-blue-600/30"
      >
        <span className="relative z-10 flex flex-col items-center leading-tight">
          <span className="text-white/70 line-through text-base">$399</span>
          <span className="text-xs text-gray-300/90 uppercase tracking-wider mt-0.5">
            Limited time
          </span>
          <span className="text-amber-300 font-semibold">Buy for $259</span>
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </Link>
    </div>
  );
}
