import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getUserBySlug, getAllUsers, updateUser } from '@/lib/db';

function rowToProfile(row: any) {
  return {
    id: row.id, slug: row.slug, name: row.name, bio: row.bio || '',
    socials: { x: row.socials_x, instagram: row.socials_instagram, linkedin: row.socials_linkedin },
    schedulingUrl: row.scheduling_url || '', schedulingLabel: row.scheduling_label || 'Book a time',
  };
}

// GET /api/profile — list all profiles or single by slug
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');

  if (!slug) {
    const rows = await getAllUsers();
    return NextResponse.json(Array.isArray(rows) ? rows.map(rowToProfile) : []);
  }

  const rows = await getUserBySlug(slug);
  if (!rows || rows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(rowToProfile(rows[0]));
}

// PATCH /api/profile — update own profile (auth required)
export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { name, slug, bio, socials, schedulingUrl, schedulingLabel } = body;

    await updateUser(user.id, {
      ...(name !== undefined && { name }),
      ...(slug !== undefined && { slug }),
      ...(bio !== undefined && { bio }),
      ...(socials !== undefined && {
        socials_x: socials.x ?? '',
        socials_instagram: socials.instagram ?? '',
        socials_linkedin: socials.linkedin ?? '',
      }),
      ...(schedulingUrl !== undefined && { scheduling_url: schedulingUrl }),
      ...(schedulingLabel !== undefined && { scheduling_label: schedulingLabel }),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Profile update error:', err);
    return NextResponse.json({ error: 'Failed to update profile.' }, { status: 500 });
  }
}
