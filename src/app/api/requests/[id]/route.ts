import { NextResponse } from 'next/server';
import { updateRequest } from '@/lib/store';

export async function PATCH(req: any, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = updateRequest(id, body);
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
