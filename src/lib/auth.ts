import { cookies } from 'next/headers';

const SECRET_KEY = process.env.SECRET_KEY || '';
const ALG = 'HS256';

function toBase64(input: Uint8Array | string): string {
  if (typeof Buffer !== 'undefined') {
    return typeof input === 'string' ? Buffer.from(input).toString('base64') : Buffer.from(input).toString('base64');
  }
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input;
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function base64urlEncode(input: Uint8Array | string): string {
  return toBase64(input).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64urlDecodeToBytes(str: string): Uint8Array {
  let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4;
  if (pad) b64 += '='.repeat(4 - pad);
  if (typeof Buffer !== 'undefined') return new Uint8Array(Buffer.from(b64, 'base64'));
  const binary = atob(b64);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  return arr;
}

function bytesToUtf8(bytes: Uint8Array): string {
  if (typeof Buffer !== 'undefined') return Buffer.from(bytes).toString('utf8');
  return new TextDecoder().decode(bytes);
}

async function hmacSha256(data: string, secret: string): Promise<Uint8Array> {
  const hasSubtle =
    typeof globalThis.crypto !== 'undefined' && !!(globalThis.crypto as { subtle?: SubtleCrypto }).subtle;
  if (!hasSubtle) {
    throw new Error('Web Crypto API is not available in this runtime');
  }
  const enc = new TextEncoder();
  const key = await (globalThis.crypto as Crypto).subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: { name: 'SHA-256' } },
    false,
    ['sign'],
  );
  const sig = await globalThis.crypto.subtle.sign('HMAC', key, enc.encode(data));
  return new Uint8Array(sig);
}

export async function signJWT<T extends Record<string, unknown>>(payload: T): Promise<string> {
  const header = { alg: ALG, typ: 'JWT' };
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 30 * 24 * 3600;
  const body = { ...payload, iat, exp };
  const encodedHeader = base64urlEncode(JSON.stringify(header));
  const encodedPayload = base64urlEncode(JSON.stringify(body));
  const data = `${encodedHeader}.${encodedPayload}`;
  const sig = await hmacSha256(data, SECRET_KEY);
  const signature = base64urlEncode(sig);
  return `${data}.${signature}`;
}

export async function signEphemeralJWT<T extends Record<string, unknown>>(
  payload: T,
  ttlSeconds: number,
): Promise<string> {
  const header = { alg: ALG, typ: 'JWT' };
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + Math.max(1, Math.floor(ttlSeconds));
  const body = { ...payload, iat, exp };
  const encodedHeader = base64urlEncode(JSON.stringify(header));
  const encodedPayload = base64urlEncode(JSON.stringify(body));
  const data = `${encodedHeader}.${encodedPayload}`;
  const sig = await hmacSha256(data, SECRET_KEY);
  const signature = base64urlEncode(sig);
  return `${data}.${signature}`;
}

export async function verifyJWT(token: string): Promise<Record<string, unknown> | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [h, p, s] = parts;
    const headerJson = JSON.parse(bytesToUtf8(base64urlDecodeToBytes(h))) as Record<string, unknown>;
    if (headerJson['alg'] !== ALG) return null;
    const data = `${h}.${p}`;
    const expectedBytes = await hmacSha256(data, SECRET_KEY);
    const expected = base64urlEncode(expectedBytes);
    if (s !== expected) return null;
    const payload = JSON.parse(bytesToUtf8(base64urlDecodeToBytes(p))) as Record<string, unknown>;
    const exp = typeof payload['exp'] === 'number' ? (payload['exp'] as number) : undefined;
    if (typeof exp === 'number' && Math.floor(Date.now() / 1000) > exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getUserFromCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  if (!token) return null;
  return await verifyJWT(token);
}
