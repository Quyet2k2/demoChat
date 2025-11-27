import { NextRequest, NextResponse } from 'next/server';
import { signEphemeralJWT, verifyJWT } from '@/lib/auth';
import { fingerprintFromHeaders } from '@/lib/session';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const redirect = url.searchParams.get('redirect') || '';
  const aud = url.searchParams.get('aud') || url.hostname;
  const tokenFromCookie = req.cookies.get('session_token')?.value || '';
  if (!tokenFromCookie) return NextResponse.json({ success: false }, { status: 401 });
  const payload = await verifyJWT(tokenFromCookie);
  if (!payload || typeof payload['_id'] !== 'string') return NextResponse.json({ success: false }, { status: 401 });
  const jti = `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
  const fp = fingerprintFromHeaders({
    'user-agent': req.headers.get('user-agent') || '',
    'accept-language': req.headers.get('accept-language') || '',
  });
  const ssoToken = await signEphemeralJWT(
    {
      purpose: 'sso',
      sub: String(payload['_id']),
      username: String(payload['username'] || ''),
      name: String(payload['name'] || ''),
      aud,
      jti,
      fp,
    },
    60,
  );

  const composedUrl = redirect
    ? `${redirect}${redirect.includes('?') ? '&' : '?'}sso=${encodeURIComponent(ssoToken)}`
    : null;

  return NextResponse.json({ success: true, token: ssoToken, url: composedUrl });
}
