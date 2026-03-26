"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, loading, signOut, hasActiveSubscription } = useAuth();
  const dashboardHref = "/dashboard";
  const bundleHref = "/bundle";
  const router = useRouter();
  const pathname = usePathname();
  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleNavLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (pathname === href) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/');
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Landing/opt-in page: keep a single focused action (no nav distractions)
  if (pathname === "/indicators") return null;

  return (
    <nav className="sticky top-0 w-full border-b border-blue-900/40 bg-gradient-to-r from-[#050816] via-[#0f172a] to-[#050816] backdrop-blur-sm z-[1000]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo - always navigates to home */}
        <Link href="/" className="flex items-center" onClick={(e) => handleNavLinkClick(e, "/")}>
          <Image
            src="/tradersmarket-logo.png"
            alt="TradersMarket.io"
            width={250}
            height={60}
            className="h-7 w-auto sm:h-9 md:h-11"
            priority
            style={{ width: 'auto', height: 'auto' }}
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center space-x-8 md:flex">
          <Link
            href="/"
            className="text-sm font-medium text-white transition-colors hover:text-blue-400 hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.7)]"
            onClick={(e) => handleNavLinkClick(e, "/")}
          >
            Home
          </Link>
          <Link
            href="/bundle"
            className="text-sm font-medium text-white transition-colors hover:text-blue-400 hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.7)]"
            onClick={(e) => handleNavLinkClick(e, "/bundle")}
          >
            Bundle Offer
          </Link>
          <Link
            href="/indicators"
            className="text-sm font-medium text-white transition-colors hover:text-blue-400 hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.7)]"
            onClick={(e) => handleNavLinkClick(e, "/indicators")}
          >
            Indicators
          </Link>
          <Link
            href="/bot-picker"
            className="text-sm font-medium text-white transition-colors hover:text-blue-400 hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.7)]"
            onClick={(e) => handleNavLinkClick(e, "/bot-picker")}
          >
            Bot Picker
          </Link>
          <Link
            href="/blogs"
            className="text-sm font-medium text-white transition-colors hover:text-blue-400 hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.7)]"
            onClick={(e) => handleNavLinkClick(e, "/blogs")}
          >
            Blogs
          </Link>

          {/* Auth Buttons - Desktop */}
          {!loading && (
            <>
              {!user ? (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/login"
                    className="text-sm font-medium text-white transition-colors hover:text-blue-400 hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.7)]"
                    onClick={(e) => handleNavLinkClick(e, "/login")}
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="rounded-lg bg-gradient-to-r from-blue-700 to-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:from-blue-600 hover:to-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                    onClick={(e) => handleNavLinkClick(e, "/signup")}
                  >
                    Sign Up
                  </Link>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  {hasActiveSubscription === undefined ? (
                    <div
                      className="h-10 w-[140px] rounded-lg border border-blue-600/20 bg-blue-950/20 animate-pulse"
                      aria-hidden
                    />
                  ) : hasActiveSubscription === true ? (
                    <Link
                      href={dashboardHref}
                      className="flex items-center space-x-2 rounded-lg border border-blue-600/30 bg-blue-950/30 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-950/50 hover:border-blue-500/50"
                      onClick={(e) => handleNavLinkClick(e, dashboardHref)}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span>Dashboard</span>
                    </Link>
                  ) : (
                    <Link
                      href={bundleHref}
                      className="flex items-center space-x-2 rounded-lg border border-amber-500/40 bg-amber-950/20 px-4 py-2 text-sm font-medium text-amber-100 transition-colors hover:bg-amber-950/40 hover:border-amber-400/60"
                      onClick={(e) => handleNavLinkClick(e, bundleHref)}
                    >
                      <span>Get bundle</span>
                    </Link>
                  )}

                  {/* User Menu */}
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-2 rounded-lg border border-blue-600/30 bg-blue-950/30 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-950/50 hover:border-blue-500/50"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="max-w-[120px] truncate">
                        {user.displayName || user.email}
                      </span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* User Dropdown Menu */}
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 rounded-lg border border-blue-600/30 bg-[#0f172a] shadow-xl z-[1001]">
                        <div className="p-4 border-b border-blue-600/20">
                          <p className="text-sm text-gray-400">Signed in as</p>
                          <p className="text-sm font-medium text-white truncate">{user.email}</p>
                        </div>
                        <div className="py-2">
                          <Link
                            href="/dashboard/settings"
                            className="block px-4 py-2 text-sm text-white hover:bg-blue-950/50 transition-colors"
                            onClick={(e) => { handleNavLinkClick(e, "/dashboard/settings"); setIsUserMenuOpen(false); }}
                          >
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span>Settings</span>
                            </div>
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-blue-950/50 transition-colors"
                          >
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            className="text-white"
            aria-label="Toggle menu"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
        <div className={`${isMobileMenuOpen ? "block" : "hidden"} border-t border-blue-900/30 md:hidden`}>
        <div className="flex flex-col space-y-4 px-4 py-4">
          <Link
            href="/"
            className="text-sm font-medium text-white transition-colors hover:text-blue-400 hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.7)]"
            onClick={(e) => { handleNavLinkClick(e, "/"); setIsMobileMenuOpen(false); }}
          >
            Home
          </Link>
          <Link
            href="/bundle"
            className="text-sm font-medium text-white transition-colors hover:text-blue-400 hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.7)]"
            onClick={(e) => { handleNavLinkClick(e, "/bundle"); setIsMobileMenuOpen(false); }}
          >
            Bundle Offer
          </Link>
          <Link
            href="/indicators"
            className="text-sm font-medium text-white transition-colors hover:text-blue-400 hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.7)]"
            onClick={(e) => { handleNavLinkClick(e, "/indicators"); setIsMobileMenuOpen(false); }}
          >
            Indicators
          </Link>
          <Link
            href="/bot-picker"
            className="text-sm font-medium text-white transition-colors hover:text-blue-400 hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.7)]"
            onClick={(e) => { handleNavLinkClick(e, "/bot-picker"); setIsMobileMenuOpen(false); }}
          >
            Bot Picker
          </Link>
          <Link
            href="/blogs"
            className="text-sm font-medium text-white transition-colors hover:text-blue-400 hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.7)]"
            onClick={(e) => { handleNavLinkClick(e, "/blogs"); setIsMobileMenuOpen(false); }}
          >
            Blogs
          </Link>

          {/* Auth Buttons - Mobile */}
          {!loading && (
            <>
              {!user ? (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-medium text-white transition-colors hover:text-blue-400 hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.7)]"
                    onClick={(e) => { handleNavLinkClick(e, "/login"); setIsMobileMenuOpen(false); }}
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="inline-block text-center rounded-lg bg-gradient-to-r from-blue-700 to-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:from-blue-600 hover:to-blue-500"
                    onClick={(e) => { handleNavLinkClick(e, "/signup"); setIsMobileMenuOpen(false); }}
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                <>
                  <div className="border-t border-blue-900/30 pt-4">
                    <p className="text-sm text-gray-400 mb-2">Signed in as</p>
                    <p className="text-sm font-medium text-white truncate mb-4">{user.email}</p>
                  </div>

                  {hasActiveSubscription === undefined ? (
                    <div
                      className="h-10 w-full rounded-lg border border-blue-600/20 bg-blue-950/20 animate-pulse mb-2"
                      aria-hidden
                    />
                  ) : hasActiveSubscription === true ? (
                    <Link
                      href={dashboardHref}
                      className="flex items-center gap-2 text-sm font-medium text-white transition-colors hover:text-blue-400"
                      onClick={(e) => {
                        handleNavLinkClick(e, dashboardHref);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Dashboard
                    </Link>
                  ) : (
                    <Link
                      href={bundleHref}
                      className="flex items-center gap-2 text-sm font-medium text-amber-200 transition-colors hover:text-amber-100 mb-2"
                      onClick={(e) => {
                        handleNavLinkClick(e, bundleHref);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Get bundle
                    </Link>
                  )}

                  {/* Settings Link - Mobile */}
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-2 text-sm font-medium text-white transition-colors hover:text-blue-400"
                    onClick={(e) => { handleNavLinkClick(e, "/dashboard/settings"); setIsMobileMenuOpen(false); }}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </Link>

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-left text-sm font-medium text-red-400 transition-colors hover:text-red-300"
                  >
                    Logout
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
