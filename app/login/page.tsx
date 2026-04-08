"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup 
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '@/lib/firebase';
import {
  buildNewUserDocument,
  mergePatchForMissingUserSchema,
} from '@/lib/firestoreUserDocument';
import { measureOperation, TraderMarketTraces } from '@/lib/performance';
import { trackAuthError, trackFirestoreError } from '@/lib/errorTracking';
import { useRenderPerformance } from '@/hooks/usePerformance';
import { trackLoginStarted, trackLoginCompleted, trackLoginFailed } from '@/lib/posthog';
import { trySendPasswordReset } from '@/lib/passwordReset';

export default function LoginPage() {
  // Track component render performance
  useRenderPerformance('LoginPage');
  
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetSending, setResetSending] = useState(false);
  const [resetFeedback, setResetFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const ensureUserDocument = async (userId: string, userEmail: string) => {
    try {
      // Measure Firestore operation performance
      await measureOperation(
        TraderMarketTraces.FIRESTORE_READ,
        async () => {
          const userDocRef = doc(db, 'users', userId);
          const userDoc = await getDoc(userDocRef);

          if (!userDoc.exists()) {
            await setDoc(
              userDocRef,
              buildNewUserDocument({
                email: userEmail,
                emailConsent: true,
                createdAt: serverTimestamp(),
              })
            );
          } else {
            const raw = userDoc.data() as Record<string, unknown>;
            const schemaPatch = mergePatchForMissingUserSchema(raw);
            if (!raw.email && userEmail) {
              schemaPatch.email = userEmail;
            }
            if (Object.keys(schemaPatch).length > 0) {
              await setDoc(userDocRef, schemaPatch, { merge: true });
            }
          }
        },
        { operation: 'ensureUserDocument', userId }
      );
    } catch (error) {
      console.error('Error ensuring user document:', error);
      trackFirestoreError(
        'ensureUserDocument',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    trackLoginStarted('email');

    try {
      // Measure login flow performance
      await measureOperation(
        TraderMarketTraces.LOGIN_FLOW,
        async () => {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          await ensureUserDocument(userCredential.user.uid, userCredential.user.email || email);
          trackLoginCompleted('email', userCredential.user.uid);
          
          // Redirect to /auth/redirect so hasActiveSubscription drives final destination (no /dashboard flash)
          router.replace('/auth/redirect');
        },
        { method: 'email' }
      );
    } catch (error: any) {
      console.error('Login error:', error);
      trackLoginFailed('email', error.message || 'Login failed');
      
      // Track authentication error
      trackAuthError(
        error.message || 'Login failed',
        error.code || 'AUTH_ERROR'
      );
      
      // Set user-friendly error messages
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('Invalid email or password');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (error.code === 'auth/invalid-credential') {
        setError('Invalid email or password');
      } else {
        setError('Failed to log in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetFeedback(null);
    setResetSending(true);
    try {
      const result = await trySendPasswordReset(email, { ambiguousOnUserNotFound: true });
      if (result.ok) {
        setResetFeedback({
          type: 'success',
          text:
            "If this email is registered for password sign-in, you'll get a message with a reset link in the next few minutes. Check your inbox and spam or junk folder.",
        });
      } else {
        setResetFeedback({ type: 'error', text: result.message });
      }
    } finally {
      setResetSending(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    trackLoginStarted('google');

    try {
      // Measure Google login flow performance
      await measureOperation(
        TraderMarketTraces.LOGIN_FLOW,
        async () => {
          const result = await signInWithPopup(auth, googleProvider);
          await ensureUserDocument(result.user.uid, result.user.email || '');
          trackLoginCompleted('google', result.user.uid);
          
          // Redirect to /auth/redirect so hasActiveSubscription drives final destination (no /dashboard flash)
          router.replace('/auth/redirect');
        },
        { method: 'google' }
      );
    } catch (error: any) {
      console.error('Google login error:', error);
      trackLoginFailed('google', error.message || 'Google login failed');
      
      // Track authentication error (except for user cancellation)
      if (error.code !== 'auth/popup-closed-by-user') {
        trackAuthError(
          error.message || 'Google login failed',
          error.code || 'AUTH_GOOGLE_ERROR'
        );
      }
      
      // Set user-friendly error messages
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Login cancelled');
      } else {
        setError('Failed to log in with Google. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="relative overflow-hidden rounded-2xl border border-blue-600/25 bg-gradient-to-br from-blue-950/30 via-[#0f1f4a]/25 to-blue-900/20 p-8 shadow-2xl backdrop-blur-sm">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-600/20 via-blue-700/20 to-blue-600/20 blur-xl" />
          
          <div className="relative">
            <h1 className="text-3xl font-bold text-white text-center mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-400 text-center mb-8">
              Log in to your account
            </p>

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleEmailLogin} className="space-y-6">
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
                  className="w-full px-4 py-3 rounded-lg border border-blue-600/30 bg-[#050816] text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword((v) => !v);
                      setResetFeedback(null);
                    }}
                    className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {showForgotPassword ? 'Back to sign in' : 'Forgot password?'}
                  </button>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={!showForgotPassword}
                  disabled={showForgotPassword}
                  className="w-full px-4 py-3 rounded-lg border border-blue-600/30 bg-[#050816] text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter your password"
                />
              </div>

              {showForgotPassword && (
                <div className="rounded-lg border border-blue-600/25 bg-blue-950/20 p-4 space-y-3">
                  <p className="text-sm text-gray-400">
                    Enter the email for your account. We will send a link to reset your password.
                  </p>
                  {resetFeedback && (
                    <div
                      className={`rounded-lg border p-3 text-sm ${
                        resetFeedback.type === 'success'
                          ? 'border-green-500/40 bg-green-500/10 text-green-400'
                          : 'border-red-500/40 bg-red-500/10 text-red-400'
                      }`}
                    >
                      {resetFeedback.text}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleSendPasswordReset}
                    disabled={resetSending || !email.trim()}
                    className="w-full py-2.5 px-4 rounded-lg border border-blue-600/40 bg-blue-600/15 text-blue-200 font-medium hover:bg-blue-600/25 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {resetSending ? 'Sending…' : 'Send reset link'}
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || showForgotPassword}
                className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-700 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]"
              >
                {loading ? 'Logging In...' : 'Log In'}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-blue-600/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gradient-to-r from-transparent via-[#0f1f4a] to-transparent text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg border border-blue-600/30 bg-[#050816] text-white font-semibold hover:bg-blue-950/50 hover:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Log in with Google
            </button>

            <p className="mt-6 text-center text-sm text-gray-400">
              Don't have an account?{' '}
              <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
