import type { User } from 'firebase/auth';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function userHasEmailPasswordProvider(user: User | null): boolean {
  if (!user) return false;
  return user.providerData.some((p) => p.providerId === 'password');
}

const PRODUCTION_ORIGIN = 'https://www.tradersmarket.io';

function getAppOrigin(): string {
  if (typeof window === 'undefined') return PRODUCTION_ORIGIN;
  const { origin } = window.location;
  // Use the real domain in production; fall back to localhost during development.
  return origin.includes('localhost') ? origin : PRODUCTION_ORIGIN;
}

/**
 * Sends Firebase password-reset email.
 * The continueUrl uses the production domain in all non-localhost environments.
 */
export async function sendPasswordResetToEmail(email: string): Promise<void> {
  const trimmed = email.trim();
  if (!trimmed) {
    throw new Error('auth/invalid-email');
  }

  const url = `${getAppOrigin()}/login?passwordChanged=true`;

  await sendPasswordResetEmail(auth, trimmed, { url, handleCodeInApp: false });
}

export type PasswordResetSendResult =
  | { ok: true; ambiguous: boolean }
  | { ok: false; message: string };

/**
 * Maps Firebase errors. When `ambiguousOnUserNotFound` is true, user-not-found is reported as success
 * so we do not reveal whether an email is registered (login / forgot-password flow).
 */
export async function trySendPasswordReset(
  email: string,
  options: { ambiguousOnUserNotFound: boolean },
): Promise<PasswordResetSendResult> {
  try {
    await sendPasswordResetToEmail(email);
    return { ok: true, ambiguous: false };
  } catch (err: unknown) {
    const code = err && typeof err === 'object' && 'code' in err ? String((err as { code: string }).code) : '';

    if (options.ambiguousOnUserNotFound && code === 'auth/user-not-found') {
      return { ok: true, ambiguous: true };
    }

    if (code === 'auth/invalid-email' || code === 'auth/missing-email') {
      return { ok: false, message: 'Enter a valid email address.' };
    }
    if (code === 'auth/user-not-found') {
      return { ok: false, message: 'No password account found for that email.' };
    }
    if (code === 'auth/too-many-requests') {
      return { ok: false, message: 'Too many attempts. Please try again later.' };
    }

    return { ok: false, message: 'Could not send reset email. Please try again.' };
  }
}
