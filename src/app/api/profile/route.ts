import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { sql } from '@/lib/db';

// GET: fetch public profile by slug (no auth required)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');

  if (!slug) {
    // Return all public profiles
    const result = await sql`
      SELECT id, slug, name, bio, socials_x, socials_instagram, socials_linkedin,
             scheduling_url, scheduling_label
      FROM users WHERE slug IS NOT NULL
      ORDER BY created_at DESC
    `;
    return NextResponse.json(result.rows.map(row => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      bio: row.bio || '',
      socials: { x: row.socials_x, instagram: row.socials_instagram, linkedin: row.socials_linkedin },
      schedulingUrl: row.scheduling_url || '',
      schedulingLabel: row.scheduling_label || 'Book a time',
    })));
  }

  const result = await sql`
    SELECT id, slug, name, bio, socials_x, socials_instagram, socials_linkedin,
           scheduling_url, scheduling_label
    FROM users WHERE slug = ${slug}
  `;

  if (result.rows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const row = result.rows[0];
  return NextResponse.json({
    id: row.id,
    slug: row.slug,
    name: row.name,
    bio: row.bio || '',
    socials: { x: row.socials_x, instagram: row.socials_instagram, linkedin: row.socials_linkedin },
    schedulingUrl: row.scheduling_url || '',
    schedulingLabel: row.scheduling_label || 'Book a time',
  });
}

// PATCH: update own profile (auth required)
export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { name, slug, bio, socials, schedulingUrl, schedulingLabel } = body;

    // If slug is changing, check uniqueness
    if (slug && slug !== (user as any).slug) {
      const existing = await sql`SELECT id FROM users WHERE slug = ${slug} AND id != ${user.id}`;
      if (existing.rows.length > 0) {
        return NextResponse.json({ error: 'That link is taken.' }, { status: 409 });
      }
    }

    await sql`
      UPDATE users SET
        name = ${name ?? (user as any).name ?? ''},
        slug = ${slug ?? (user as any).slug ?? ''},
        bio = ${bio ?? (user as any).bio ?? ''},
        socials_x = ${socials?.x ?? (user as any).socials?.x ?? ''},
        socials_instagram = ${socials?.instagram ?? (user as any).socials?.instagram ?? ''},
        socials_linkedin = ${socials?.linkedin ?? (user as any).socials?.linkedin ?? ''},
        scheduling_url = ${schedulingUrl ?? (user as any).schedulingUrl ?? ''},
        scheduling_label = ${schedulingLabel ?? (user as any).schedulingLabel ?? 'Book a time'}
      WHERE id = ${user.id}
    `;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Profile update error:', err);
    return NextResponse.json({ error: 'Failed to update profile.' }, { status: 500 });
  }
}
