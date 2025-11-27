import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT, signJWT, signEphemeralJWT } from '@/lib/auth';
import { fingerprintFromHeaders } from '@/lib/session';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const refresh = req.cookies.get('refresh_token')?.value || '';
  if (!refresh) return NextResponse.json({ success: false }, { status: 401 });
  const payload = await verifyJWT(refresh);
  if (!payload || payload['purpose'] !== 'refresh') return NextResponse.json({ success: false }, { status: 401 });
  const fp = fingerprintFromHeaders({
    'user-agent': req.headers.get('user-agent') || '',
    'accept-language': req.headers.get('accept-language') || '',
  });
  const tfp = typeof payload['fp'] === 'string' ? (payload['fp'] as string) : '';
  if (!tfp || tfp !== fp) return NextResponse.json({ success: false }, { status: 401 });
  const userId = typeof payload['sub'] === 'string' ? (payload['sub'] as string) : '';
  const username = typeof payload['username'] === 'string' ? (payload['username'] as string) : '';
  const name = typeof payload['name'] === 'string' ? (payload['name'] as string) : '';
  if (!userId) return NextResponse.json({ success: false }, { status: 401 });

  const accessToken = await signJWT({ _id: userId, username, name, fp });
  const res = NextResponse.json({ success: true });
  res.cookies.set('session_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'lax',
    maxAge: 30 * 24 * 3600,
  });

  const rotateRefresh = await signEphemeralJWT(
    { purpose: 'refresh', sub: userId, username, name, fp },
    90 * 24 * 3600,
  );
  res.cookies.set('refresh_token', rotateRefresh, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'lax',
    maxAge: 90 * 24 * 3600,
  });

  return res;
}

