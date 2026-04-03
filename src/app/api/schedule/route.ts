import { NextResponse } from 'next/server';
import { getTimeSlots, saveTimeSlot, generateId } from '@/lib/store';

export async function GET() {
  return NextResponse.json(getTimeSlots());
}

export async function POST(req: any) {
  try {
    const body = await req.json();
    const slot = {
      ...body,
      id: generateId(),
      available: body.available !== false,
    };
    saveTimeSlot(slot);
    return NextResponse.json(slot, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
