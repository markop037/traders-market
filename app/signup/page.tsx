"use client";

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  createUserWithEmailAndPassword, 
  signInWithPopup 
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '@/lib/firebase';
import { trackSignupStarted, trackSignupCompleted, trackSignupFailed } from '@/lib/posthog';

function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const signupSource =
    searchParams.get('from') === 'indicators' ? 'indicators' : undefined;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const createUserDocument = async (userId: string, userEmail: string) => {
    try {
      await setDoc(doc(db, 'users', userId), {
        email: userEmail,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error creating user document:', error);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    trackSignupStarted('email', signupSource);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await createUserDocument(userCredential.user.uid, userCredential.user.email || email);
      trackSignupCompleted('email', userCredential.user.uid, signupSource);
      router.replace('/auth/redirect');
    } catch (error: any) {
      console.error('Sign up error:', error);
      trackSignupFailed('email', error.message || 'Sign up failed', signupSource);
      if (error.code === 'auth/email-already-in-use') {
        setError('This email is already registered');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak');
      } else {
        setError('Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setLoading(true);
    trackSignupStarted('google', signupSource);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      await createUserDocument(result.user.uid, result.user.email || '');
      trackSignupCompleted('google', result.user.uid, signupSource);
      router.replace('/auth/redirect');
    } catch (error: any) {
      console.error('Google sign up error:', error);
      trackSignupFailed('google', error.message || 'Google sign up failed', signupSource);
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Sign up cancelled');
      } else {
        setError('Failed to sign up with Google. Please try again.');
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
              Create Account
            </h1>
            <p className="text-gray-400 text-center mb-8">
              Sign up to get started
            </p>

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleEmailSignUp} className="space-y-6">
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
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-blue-600/30 bg-[#050816] text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                  placeholder="Create a password"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-blue-600/30 bg-[#050816] text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                  placeholder="Confirm your password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-700 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]"
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
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
              onClick={handleGoogleSignUp}
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
              Sign up with Google
            </button>

            <p className="mt-6 text-center text-sm text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-[#050816] via-[#0f172a] to-[#050816]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400 text-sm">Loading...</p>
          </div>
        </main>
      }
    >
      <SignUpContent />
    </Suspense>
  );
}
