import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      slug: (user as any).slug,
      name: user.name,
      bio: (user as any).bio || '',
      schedulingUrl: (user as any).schedulingUrl || '',
      schedulingLabel: (user as any).schedulingLabel || 'Book a time',
      socials: user.socials,
    }
  });
}
