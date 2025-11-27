import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT, signJWT } from '@/lib/auth';
import { fingerprintFromHeaders } from '@/lib/session';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const token = url.searchParams.get('token') || url.searchParams.get('sso') || '';
  const next = url.searchParams.get('next') || '/';
  if (!token) return NextResponse.redirect(new URL('/', url.origin));
  const payload = await verifyJWT(token);
  if (!payload) return NextResponse.redirect(new URL('/', url.origin));
  if (payload['purpose'] !== 'sso') return NextResponse.redirect(new URL('/', url.origin));
  const aud = typeof payload['aud'] === 'string' ? (payload['aud'] as string) : '';
  if (aud && aud !== url.hostname) return NextResponse.redirect(new URL('/', url.origin));
  const tfp = typeof payload['fp'] === 'string' ? (payload['fp'] as string) : '';
  const fp = fingerprintFromHeaders({
    'user-agent': req.headers.get('user-agent') || '',
    'accept-language': req.headers.get('accept-language') || '',
  });
  if (!tfp || tfp !== fp) return NextResponse.redirect(new URL('/mini', url.origin));
  const userId = typeof payload['sub'] === 'string' ? (payload['sub'] as string) : '';
  const username = typeof payload['username'] === 'string' ? (payload['username'] as string) : '';
  const name = typeof payload['name'] === 'string' ? (payload['name'] as string) : '';
  if (!userId) return NextResponse.redirect(new URL('/', url.origin));
  const sessionToken = await signJWT({ _id: userId, username, name, fp });
  const res = NextResponse.redirect(new URL(next || '/', url.origin));
  res.cookies.set('session_token', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'lax',
    maxAge: 30 * 24 * 3600,
  });
  return res;
}
