import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const existing = await sql`SELECT creator_id FROM requests WHERE id = ${id}` as any[];
  if (existing.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (existing[0].creator_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { adminStatus, notes } = body;

  if (adminStatus !== undefined) {
    await sql`UPDATE requests SET admin_status = ${adminStatus}, reviewed_at = NOW() WHERE id = ${id}`;
  }
  if (notes !== undefined) {
    await sql`UPDATE requests SET notes = ${notes} WHERE id = ${id}`;
  }

  return NextResponse.json({ ok: true });
}
