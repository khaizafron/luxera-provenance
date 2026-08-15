import { createHash, createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { dbStore, User, Organization } from '../db/store';

export interface AuthSession {
  user: User;
  organization: Organization;
}

export const SESSION_COOKIE_NAME = 'luxera_session';
export const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

function getSessionSecret(): string {
  const secret = process.env.LUXERA_SESSION_SECRET || process.env.AUTH_SECRET || process.env.JWT_SECRET || 'luxera-local-dev-secret-change-me';
  return secret;
}

function encodeBase64Url(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function decodeBase64Url(value: string): string {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function parseSessionCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${SESSION_COOKIE_NAME}=`));
  if (!match) return null;
  return decodeURIComponent(match.slice(SESSION_COOKIE_NAME.length + 1));
}

function buildSessionRecord(user: User) {
  return {
    userId: user.id,
    email: user.email,
    orgId: user.organization_id,
    exp: Date.now() + SESSION_TTL_MS,
    iat: Date.now(),
  };
}

export function createSessionCookie(user: User): string {
  const sessionPayload = buildSessionRecord(user);
  const payload = JSON.stringify(sessionPayload);
  const payloadValue = encodeBase64Url(payload);
  const signature = createHmac('sha256', getSessionSecret()).update(payloadValue).digest('base64url');
  const sessionValue = `${payloadValue}.${signature}`;
  const secureFlag = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${SESSION_COOKIE_NAME}=${encodeURIComponent(sessionValue)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}${secureFlag}`;
}

export function clearSessionCookie(): string {
  const secureFlag = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secureFlag}`;
}

function verifySignedSession(rawValue: string): { userId: string; email: string; orgId: string; exp: number } | null {
  if (!rawValue) return null;
  const parts = rawValue.split('.');
  if (parts.length !== 2) return null;

  const [payloadValue, signature] = parts;
  const expectedSignature = createHmac('sha256', getSessionSecret()).update(payloadValue).digest('base64url');
  const provided = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);
  if (provided.length !== expected.length) return null;
  if (!timingSafeEqual(provided, expected)) return null;

  try {
    const payload = JSON.parse(decodeBase64Url(payloadValue));
    if (!payload || typeof payload.userId !== 'string' || typeof payload.email !== 'string' || typeof payload.orgId !== 'string') {
      return null;
    }
    if (payload.exp && Number(payload.exp) < Date.now()) {
      return null;
    }
    return {
      userId: payload.userId,
      email: payload.email,
      orgId: payload.orgId,
      exp: Number(payload.exp || 0),
    };
  } catch {
    return null;
  }
}

export async function getAuthSession(request?: NextRequest | Request): Promise<AuthSession | null> {
  try {
    let cookieHeader: string | null = null;

    if (request && typeof request.headers?.get === 'function') {
      cookieHeader = request.headers.get('cookie');
    }

    if (!cookieHeader) {
      try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
        cookieHeader = sessionCookie ? `${SESSION_COOKIE_NAME}=${sessionCookie.value}` : null;
      } catch {
        cookieHeader = null;
      }
    }

    const rawCookieValue = parseSessionCookie(cookieHeader);
    if (!rawCookieValue) return null;

    const sessionData = verifySignedSession(rawCookieValue);
    if (!sessionData) return null;

    const user = dbStore.users.get(sessionData.userId);
    if (!user) return null;

    const organization = dbStore.organizations.get(user.organization_id);
    if (!organization) return null;

    if (sessionData.orgId !== organization.id || sessionData.email !== user.email) {
      return null;
    }

    return { user, organization };
  } catch {
    return null;
  }
}

export async function loginUser(email: string, passwordPlain: string): Promise<User | null> {
  const normalizedEmail = email.trim().toLowerCase();
  const user = Array.from(dbStore.users.values()).find((u) => u.email.toLowerCase() === normalizedEmail);
  if (!user) return null;

  const hash = createHash('sha256').update(passwordPlain.trim()).digest('hex');
  if (user.password_hash !== hash) return null;

  return user;
}
