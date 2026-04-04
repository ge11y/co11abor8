import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { sql } from './db';
import { User, Socials } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'co11abor8-secret-key-change-in-production';
const COOKIE_NAME = 'co11ab_session';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    const payload = verifyToken(token);
    if (!payload) return null;

    const result = await sql`
      SELECT id, email, slug, name, bio, socials_x, socials_instagram, socials_linkedin,
             scheduling_url, scheduling_label, created_at
      FROM users WHERE id = ${payload.userId}
    `;

    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      id: row.id,
      email: row.email,
      slug: row.slug,
      name: row.name,
      bio: row.bio || '',
      socials: {
        x: row.socials_x || '',
        instagram: row.socials_instagram || '',
        linkedin: row.socials_linkedin || '',
      },
      schedulingUrl: row.scheduling_url || '',
      schedulingLabel: row.scheduling_label || 'Book a time',
      createdAt: row.created_at,
      passwordHash: '',
    };
  } catch {
    return null;
  }
}
