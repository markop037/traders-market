"use client";

import { useEffect, useState, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { trackPaymentCompleted, trackPaymentStatusCheckFailed } from '@/lib/posthog';

function PaymentDoneContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'checking' | 'success' | 'waiting' | 'error'>('checking');
  const checkCountRef = useRef(0);
  const sessionId = searchParams?.get('session_id');
  const MAX_CHECKS = 5; // Check up to 5 times (about 10 seconds total)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (!user || !sessionId) {
      return;
    }

    // Reset check count
    checkCountRef.current = 0;

    // Check payment status - check immediately and then periodically
    const checkPaymentStatus = async () => {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          
          if (data.hasPaid === true) {
            setStatus('success');
            trackPaymentCompleted(
              data.paymentAmount || 259,
              data.paymentCurrency || 'USD',
              sessionId!,
            );
            setTimeout(() => {
              router.push('/dashboard/bots');
            }, 1500);
            return;
          }
        }

        // If payment not found yet and we haven't exceeded max checks
        checkCountRef.current += 1;
        
        if (checkCountRef.current < MAX_CHECKS) {
          setStatus('waiting');
          setTimeout(() => {
            checkPaymentStatus();
          }, 2000);
        } else {
          setStatus('error');
          trackPaymentStatusCheckFailed(sessionId!, MAX_CHECKS);
        }
      } catch (error) {
        checkCountRef.current += 1;
        if (checkCountRef.current < MAX_CHECKS) {
          setStatus('waiting');
          setTimeout(() => {
            checkPaymentStatus();
          }, 2000);
        } else {
          setStatus('error');
          trackPaymentStatusCheckFailed(sessionId!, MAX_CHECKS);
        }
      }
    };

    // Start checking immediately
    checkPaymentStatus();
  }, [user, loading, router, sessionId]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#050816] via-[#0f172a] to-[#050816]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#050816] via-[#0f172a] to-[#050816] px-4">
      <div className="max-w-md w-full">
        <div className="relative overflow-hidden rounded-2xl border border-blue-600/40 bg-gradient-to-br from-blue-950/40 via-[#0f1f4a]/35 to-blue-900/40 p-8 shadow-2xl backdrop-blur-sm">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-700 via-blue-700/35 to-blue-600 opacity-25 blur-lg"></div>
          
          <div className="relative text-center">
            {status === 'checking' && (
              <>
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h1 className="text-2xl font-bold text-white mb-2">Processing Payment</h1>
                <p className="text-gray-400">Please wait while we verify your payment...</p>
              </>
            )}

            {status === 'waiting' && (
              <>
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h1 className="text-2xl font-bold text-white mb-2">Verifying Payment</h1>
                <p className="text-gray-400 mb-4">Your payment is being processed. This may take a few moments...</p>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-4 py-2 rounded-lg bg-blue-600/20 border border-blue-600/30 text-blue-400 hover:bg-blue-600/30 transition-colors text-sm"
                >
                  Go to Dashboard
                </button>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Payment Not Confirmed</h1>
                <p className="text-gray-400 mb-4">
                  We couldn't confirm your payment status. This may be due to a delay in processing. 
                  Please check your dashboard or contact support if the issue persists.
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-semibold"
                  >
                    Go to Dashboard
                  </button>
                  <button
                    onClick={() => {
                      checkCountRef.current = 0;
                      setStatus('checking');
                      // Trigger re-check
                      const userDocRef = doc(db, 'users', user!.uid);
                      getDoc(userDocRef).then((userDoc) => {
                        if (userDoc.exists() && userDoc.data().hasPaid === true) {
                          setStatus('success');
                          setTimeout(() => router.push('/dashboard/bots'), 1500);
                        } else {
                          setStatus('error');
                        }
                      });
                    }}
                    className="px-6 py-3 rounded-lg bg-gray-600/20 border border-gray-600/30 text-gray-300 hover:bg-gray-600/30 transition-colors font-semibold"
                  >
                    Check Again
                  </button>
                </div>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Payment Successful!</h1>
                <p className="text-gray-400 mb-4">Your payment has been confirmed. Redirecting to your bots dashboard...</p>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function PaymentDonePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#050816] via-[#0f172a] to-[#050816]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading...</p>
          </div>
        </main>
      }
    >
      <PaymentDoneContent />
    </Suspense>
  );
}
