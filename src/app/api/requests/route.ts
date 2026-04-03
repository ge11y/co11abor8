import { NextResponse } from 'next/server';
import { getRequests, saveRequest, generateId } from '@/lib/store';

export async function GET() {
  return NextResponse.json(getRequests());
}

export async function POST(req: any) {
  try {
    const body = await req.json();
    const newReq = {
      ...body,
      id: generateId(),
      submittedAt: new Date().toISOString(),
      adminStatus: 'open',
    };
    saveRequest(newReq);
    return NextResponse.json(newReq, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
