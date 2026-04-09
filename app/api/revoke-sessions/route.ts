import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body?.email === 'string' ? body.email.trim() : '';

    if (!email) {
      return NextResponse.json({ error: 'email is required' }, { status: 400 });
    }

    const userRecord = await adminAuth.getUserByEmail(email);
    await adminAuth.revokeRefreshTokens(userRecord.uid);

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const code =
      err && typeof err === 'object' && 'code' in err
        ? String((err as { code: string }).code)
        : '';

    // If the user doesn't exist just return success — nothing to revoke.
    if (code === 'auth/user-not-found') {
      return NextResponse.json({ ok: true });
    }

    console.error('[revoke-sessions] error:', err);
    return NextResponse.json({ error: 'Failed to revoke sessions.' }, { status: 500 });
  }
}
