import { loginUser, createSessionCookie, getAuthSession, clearSessionCookie } from '../lib/auth/session';

async function expect(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

async function main() {
  const user = await loginUser('officer@wahed.com', 'password');
  await expect(user, 'Valid login should resolve to a user');

  const cookie = await createSessionCookie(user!);
  await expect(cookie && cookie.includes('luxera_session='), 'Session cookie should be created for valid login');

  const request = new Request('http://localhost/api/cases', {
    headers: { cookie },
  });

  const session = await getAuthSession(request);
  await expect(session, 'Session should be recognized from valid cookie');
  await expect(session?.user.email === 'officer@wahed.com', 'Session should preserve user identity');

  const expiredRequest = new Request('http://localhost/api/cases', {
    headers: { cookie: 'luxera_session=invalid.signature' },
  });

  const expiredSession = await getAuthSession(expiredRequest);
  await expect(!expiredSession, 'Invalid session should be rejected');

  const cleared = clearSessionCookie();
  await expect(cleared.includes('luxera_session='), 'Logout cookie should invalidate session');

  console.log('Auth regression tests passed');
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
