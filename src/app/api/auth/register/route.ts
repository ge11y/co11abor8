import { NextResponse } from 'next/server';
import { initDb, getUserByEmail, getUserBySlug, createUser } from '@/lib/db';
import { hashPassword, signToken, setSessionCookie } from '@/lib/auth';
import { generateId } from '@/lib/store';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name, slug, bio, socials, schedulingUrl, schedulingLabel } = body;

    if (!email || !password || !name || !slug) {
      return NextResponse.json({ error: 'All fields required.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    const safeSlug = slug.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    await initDb();

    const [existingEmail] = await getUserByEmail(email);
    if (existingEmail) {
      return NextResponse.json({ error: 'Email already registered.' }, { status: 409 });
    }

    const [existingSlug] = await getUserBySlug(safeSlug);
    if (existingSlug) {
      return NextResponse.json({ error: 'That link is already taken. Try another.' }, { status: 409 });
    }

    const id = generateId();
    const passwordHash = await hashPassword(password);

    await createUser({
      id,
      email: email.toLowerCase(),
      slug: safeSlug,
      name,
      password_hash: passwordHash,
      bio: bio || '',
      socials_x: socials?.x || '',
      socials_instagram: socials?.instagram || '',
      socials_linkedin: socials?.linkedin || '',
      scheduling_url: schedulingUrl || '',
      scheduling_label: schedulingLabel || 'Book a time',
      created_at: new Date().toISOString(),
    });

    const token=signToken(id);
    await setSessionCookie(token);

    return NextResponse.json({
      user: { id, email: email.toLowerCase(), slug: safeSlug, name, bio: bio || '' },
      token,
    }, { status: 201 });

  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
