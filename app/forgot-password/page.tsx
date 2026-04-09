"use client";

import { useState } from 'react';
import Link from 'next/link';
import { trySendPasswordReset } from '@/lib/passwordReset';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSending(true);

    try {
      const result = await trySendPasswordReset(email.trim(), { ambiguousOnUserNotFound: true });
      if (result.ok) {
        setSubmitted(true);
      } else {
        setError(result.message);
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="relative overflow-hidden rounded-2xl border border-blue-600/25 bg-gradient-to-br from-blue-950/30 via-[#0f1f4a]/25 to-blue-900/20 p-8 shadow-2xl backdrop-blur-sm">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-600/20 via-blue-700/20 to-blue-600/20 blur-xl" />

          <div className="relative">
            <h1 className="text-3xl font-bold text-white text-center mb-2">
              Reset Password
            </h1>
            <p className="text-gray-400 text-center mb-8">
              Enter your email and we&apos;ll send you a reset link.
            </p>

            {submitted ? (
              <div className="space-y-6">
                <div className="rounded-lg border border-blue-500/40 bg-blue-500/10 p-5 text-center">
                  <svg
                    className="mx-auto mb-3 h-10 w-10 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5a2.25 2.25 0 00-2.25 2.25m19.5 0-9.75 6.75L2.25 6.75"
                    />
                  </svg>
                  <p className="text-sm text-blue-200 leading-relaxed">
                    If an account with that email exists, a password reset link has been sent. Check your inbox and spam folder.
                  </p>
                </div>
                <Link
                  href="/login"
                  className="block w-full py-3 px-4 rounded-lg border border-blue-600/30 bg-[#050816] text-white font-semibold text-center hover:bg-blue-950/50 hover:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
                >
                  Back to Log In
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    className="w-full px-4 py-3 rounded-lg border border-blue-600/30 bg-[#050816] text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                    placeholder="Enter your email"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending || !email.trim()}
                  className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-700 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                >
                  {sending ? 'Sending…' : 'Send Reset Link'}
                </button>

                <p className="text-center text-sm text-gray-400">
                  Remember your password?{' '}
                  <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                    Log In
                  </Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
