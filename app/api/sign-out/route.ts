import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth/session';

export async function POST() {
  const response = NextResponse.json({ authenticated: false });
  response.headers.set('Set-Cookie', clearSessionCookie());
  return response;
}
