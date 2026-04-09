"use client";

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { verifyPasswordResetCode, confirmPasswordReset, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

type Stage =
  | { name: 'loading' }
  | { name: 'form'; email: string }
  | { name: 'success' }
  | { name: 'error'; message: string };

function ActionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const oobCode = searchParams.get('oobCode') ?? '';
  const mode = searchParams.get('mode') ?? '';

  const [stage, setStage] = useState<Stage>({ name: 'loading' });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (mode !== 'resetPassword' || !oobCode) {
      setStage({ name: 'error', message: 'Invalid or unsupported action link.' });
      return;
    }

    verifyPasswordResetCode(auth, oobCode)
      .then((email) => setStage({ name: 'form', email }))
      .catch(() =>
        setStage({
          name: 'error',
          message:
            'This password reset link is invalid or has expired. Please request a new one.',
        })
      );
  }, [mode, oobCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      setStage((prev) =>
        prev.name === 'form'
          ? { ...prev, formError: 'Password must be at least 6 characters.' }
          : prev
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setStage((prev) =>
        prev.name === 'form'
          ? { ...prev, formError: 'Passwords do not match.' }
          : prev
      );
      return;
    }

    if (stage.name !== 'form') return;
    const { email } = stage;

    setSubmitting(true);
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);

      // Revoke all refresh tokens server-side — terminates all active sessions on every device.
      await fetch('/api/revoke-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      // Sign out the current device immediately so the local Firebase session is cleared.
      await signOut(auth);

      setStage({ name: 'success' });
      setTimeout(() => router.replace('/login?passwordChanged=true'), 2000);
    } catch (err: unknown) {
      const code =
        err && typeof err === 'object' && 'code' in err
          ? String((err as { code: string }).code)
          : '';

      let message = 'Something went wrong. Please request a new reset link.';
      if (code === 'auth/expired-action-code') {
        message = 'This reset link has expired. Please request a new one.';
      } else if (code === 'auth/invalid-action-code') {
        message = 'This reset link is invalid. Please request a new one.';
      } else if (code === 'auth/weak-password') {
        message = 'Password is too weak. Please choose a stronger password.';
      }

      setStage({ name: 'error', message });
    } finally {
      setSubmitting(false);
    }
  };

  if (stage.name === 'loading') {
    return (
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        <p className="text-sm text-gray-400">Verifying your reset link…</p>
      </div>
    );
  }

  if (stage.name === 'error') {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-5 text-center">
          <svg
            className="mx-auto mb-3 h-10 w-10 text-red-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
          <p className="text-sm text-red-300 leading-relaxed">{stage.message}</p>
        </div>
        <Link
          href="/forgot-password"
          className="block w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-700 to-blue-600 text-white font-semibold text-center hover:from-blue-600 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]"
        >
          Request New Reset Link
        </Link>
      </div>
    );
  }

  if (stage.name === 'success') {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-green-500/40 bg-green-500/10 p-5 text-center">
          <svg
            className="mx-auto mb-3 h-10 w-10 text-green-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm text-green-300 leading-relaxed">
            Your password has been updated. Redirecting you to the login page…
          </p>
        </div>
      </div>
    );
  }

  const formError =
    stage.name === 'form' && 'formError' in stage
      ? (stage as typeof stage & { formError?: string }).formError
      : undefined;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-sm text-gray-400 text-center">
        Setting a new password for <span className="text-blue-300 font-medium">{stage.email}</span>
      </p>

      {formError && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
          <p className="text-red-400 text-sm">{formError}</p>
        </div>
      )}

      <div>
        <label htmlFor="new-password" className="block text-sm font-medium text-gray-300 mb-2">
          New Password
        </label>
        <input
          id="new-password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          autoFocus
          minLength={6}
          className="w-full px-4 py-3 rounded-lg border border-blue-600/30 bg-[#050816] text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
          placeholder="At least 6 characters"
        />
      </div>

      <div>
        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-300 mb-2">
          Confirm New Password
        </label>
        <input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-lg border border-blue-600/30 bg-[#050816] text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
          placeholder="Repeat your new password"
        />
      </div>

      <button
        type="submit"
        disabled={submitting || !newPassword || !confirmPassword}
        className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-700 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]"
      >
        {submitting ? 'Updating Password…' : 'Set New Password'}
      </button>

      <p className="text-center text-sm text-gray-400">
        <Link href="/forgot-password" className="text-blue-400 hover:text-blue-300 transition-colors">
          Request a new link
        </Link>
      </p>
    </form>
  );
}

export default function AuthActionPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="relative overflow-hidden rounded-2xl border border-blue-600/25 bg-gradient-to-br from-blue-950/30 via-[#0f1f4a]/25 to-blue-900/20 p-8 shadow-2xl backdrop-blur-sm">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-600/20 via-blue-700/20 to-blue-600/20 blur-xl" />

          <div className="relative">
            <h1 className="text-3xl font-bold text-white text-center mb-2">
              Set New Password
            </h1>
            <p className="text-gray-400 text-center mb-8">
              Choose a new password for your account.
            </p>

            <Suspense
              fallback={
                <div className="flex justify-center py-4">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                </div>
              }
            >
              <ActionContent />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}
