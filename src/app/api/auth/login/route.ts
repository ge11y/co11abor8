import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { verifyPassword, signToken, setSessionCookie } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required.' }, { status: 400 });
    }

    const rows = await sql`
      SELECT id, email, slug, name, bio, socials_x, socials_instagram, socials_linkedin,
             scheduling_url, scheduling_label, password_hash
      FROM users WHERE email = ${email.toLowerCase()}
    ` as any[];

    if (rows.length === 0) {
      return NextResponse.json({ error: 'No account found with that email.' }, { status: 401 });
    }

    const user = rows[0];
    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
    }

    const token = signToken(user.id);
    await setSessionCookie(token);

    return NextResponse.json({
      user: {
        id: user.id, email: user.email, slug: user.slug, name: user.name,
        bio: user.bio || '',
        socials: { x: user.socials_x, instagram: user.socials_instagram, linkedin: user.socials_linkedin },
        schedulingUrl: user.scheduling_url || '',
        schedulingLabel: user.scheduling_label || 'Book a time',
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
