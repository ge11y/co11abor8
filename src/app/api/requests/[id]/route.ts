import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getRequestById, updateRequest } from '@/lib/db';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { adminStatus, notes } = body;

  const rows = await getRequestById(id);
  if (!rows || rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (rows[0].creator_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const updates: Record<string, unknown> = {};
  if (adminStatus !== undefined) updates.admin_status = adminStatus;
  if (notes !== undefined) updates.notes = notes;

  await updateRequest(id, updates);
  return NextResponse.json({ ok: true });
}
