import { NextResponse } from 'next/server';

// Deprecated - use /api/profile instead
export async function GET() {
  return NextResponse.json([]);
}
export async function POST() {
  return NextResponse.json({ error: 'Deprecated' }, { status: 410 });
}
