import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getRequestById, updateRequest } from '@/lib/db';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { adminStatus, notes, sharedNotes } = body;

  const rows = await getRequestById(id);
  if (!rows || rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const isCreator = rows[0].creator_id === user.id;
  const isRequester = rows[0].requester_contact === user.email;

  // Both creator and requester can update sharedNotes
  // Only creator can update adminStatus and private notes
  if (isRequester && !isCreator) {
    // Requester can only update sharedNotes
    if (sharedNotes !== undefined) {
      await updateRequest(id, { shared_notes: sharedNotes });
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (!isCreator) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const updates: Record<string, unknown> = {};
  if (adminStatus !== undefined) updates.admin_status = adminStatus;
  if (notes !== undefined) updates.notes = notes;
  if (sharedNotes !== undefined) updates.shared_notes = sharedNotes;

  await updateRequest(id, updates);
  return NextResponse.json({ ok: true });
}
