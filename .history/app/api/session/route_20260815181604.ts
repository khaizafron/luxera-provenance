import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth/session';

export async function GET() {
  const session = await getAuthSession();

  if (!session) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: session.user.id,
      email: session.user.email,
      full_name: session.user.full_name,
      role: session.user.role,
      organization_id: session.user.organization_id,
    },
    organization: {
      id: session.organization.id,
      name: session.organization.name,
    },
  });
}
