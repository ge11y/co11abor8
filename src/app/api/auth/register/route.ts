import { NextResponse } from 'next/server';
import { initDb, sql } from '@/lib/db';
import { hashPassword, signToken, setSessionCookie } from '@/lib/auth';
import { generateId } from '@/lib/store';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name, slug } = body;

    if (!email || !password || !name || !slug) {
      return NextResponse.json({ error: 'All fields required.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    // URL-safe slug
    const safeSlug = slug.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    await initDb();

    // Check email taken
    const existing = await sql`SELECT id FROM users WHERE email = ${email.toLowerCase()}` as any[];
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Email already registered.' }, { status: 409 });
    }

    // Check slug taken
    const slugCheck = await sql`SELECT id FROM users WHERE slug = ${safeSlug}` as any[];
    if (slugCheck.length > 0) {
      return NextResponse.json({ error: 'That link is already taken. Try another.' }, { status: 409 });
    }

    const id = generateId();
    const passwordHash = await hashPassword(password);
    const userBio = body.bio || '';

    await sql`
      INSERT INTO users (id, email, slug, name, password_hash, bio)
      VALUES (${id}, ${email.toLowerCase()}, ${safeSlug}, ${name}, ${passwordHash}, ${userBio})
    `;

    const token = signToken(id);
    await setSessionCookie(token);

    return NextResponse.json({
      user: { id, email: email.toLowerCase(), slug: safeSlug, name, bio: userBio }
    }, { status: 201 });

  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
