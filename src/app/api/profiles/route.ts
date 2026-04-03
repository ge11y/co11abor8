import { NextResponse } from 'next/server';
import { getProfiles, saveProfile, generateId } from '@/lib/store';
import { Profile } from '@/lib/types';

export async function GET() {
  const profiles = getProfiles();
  return NextResponse.json(profiles);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const profile: Profile = {
      id: generateId(),
      slug: body.slug || '',
      name: body.name || '',
      tagline: body.tagline || '',
      socials: {
        x: body.socials?.x || '',
        instagram: body.socials?.instagram || '',
        linkedin: body.socials?.linkedin || '',
      },
      strengths: body.strengths || '',
      thoughtPatterns: body.thoughtPatterns || '',
      passions: body.passions || '',
      public: body.public !== false,
      createdAt: new Date().toISOString(),
    };

    if (!profile.slug || !profile.name) {
      return NextResponse.json({ error: 'slug and name required' }, { status: 400 });
    }

    // Check slug uniqueness
    const existing = getProfiles().find(p => p.slug === profile.slug);
    if (existing) {
      return NextResponse.json({ error: 'Slug already taken' }, { status: 409 });
    }

    saveProfile(profile);
    return NextResponse.json(profile, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
