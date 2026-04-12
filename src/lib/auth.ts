import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { getUserByEmail, createUser, updateUser, getUserById } from './db';
import { generateId } from './store';
import { User } from './types';

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

function dbRowToUser(row: any): User {
  return {
    id: row.id,
    email: row.email,
    slug: row.slug,
    name: row.name,
    passwordHash: row.password_hash,
    bio: row.bio || '',
    socials: {
      x: row.socials_x || '',
      instagram: row.socials_instagram || '',
      linkedin: row.socials_linkedin || '',
    },
    schedulingUrl: row.scheduling_url || '',
    schedulingLabel: row.scheduling_label || 'Book a time',
    createdAt: row.created_at,
  };
}

export async function getCurrentUser(req?: Request): Promise<User | null> {
  try {
    // Try Authorization header first (for client-side API calls)
    if (req) {
      const authHeader = req.headers.get('Authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.slice(7);
        const payload = verifyToken(token);
        if (payload) {
          const row = await getUserById(payload.userId);
          if (row?.[0]) return dbRowToUser(row[0]);
        }
      }
    }
    // Fall back to cookie (for server-side calls)
    const cookieStore = await cookies();
    const token=cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    const payload = verifyToken(token);
    if (!payload) return null;
    const row = await getUserById(payload.userId);
    if (!row?.[0]) return null;
    return dbRowToUser(row[0]);
  } catch (err) {
    console.error('getCurrentUser error:', err);
    return null;
  }
}
