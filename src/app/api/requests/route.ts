import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getAllRequests, getRequestsForCreator, getRequestsByRequester, createRequest } from '@/lib/db';
import { generateId } from '@/lib/store';

function rowToRequest(row: any) {
  return {
    id: row.id, creatorId: row.creator_id, requesterName: row.requester_name,
    requesterContact: row.requester_contact, projectIdea: row.project_idea,
    status: row.status, helpNeeded: row.help_needed, vision: row.vision,
    submissionType: row.submission_type, timeSlot: row.time_slot,
    submittedAt: row.submitted_at, reviewedAt: row.reviewed_at,
    adminStatus: row.admin_status, notes: row.notes || '',
  };
}

export async function GET() {
  let user = null;
  try {
    user = await getCurrentUser();
  } catch (err) {
    console.error('getCurrentUser error:', err);
  }

  if (!user) {
    const rows = await getAllRequests();
    return NextResponse.json(Array.isArray(rows) ? rows.map(rowToRequest) : []);
  }

  try {
    const [inbound, outbound] = await Promise.all([
      getRequestsForCreator(user.id),
      getRequestsByRequester(user.email),
    ]);

    const map = new Map();
    [...(inbound || []), ...(outbound || [])].forEach(r => map.set(r.id, r));
    return NextResponse.json([...map.values()].map(rowToRequest));
  } catch (err) {
    console.error('Requests query error:', err);
    return NextResponse.json({ error: 'Failed to load requests', detail: String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { creatorId, requesterName, requesterContact, projectIdea, status,
      helpNeeded, vision, submissionType } = body;

    if (!creatorId || !requesterName || !requesterContact || !projectIdea || !helpNeeded) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const id = generateId();
    const result = await createRequest({
      id,
      creator_id: creatorId,
      requester_name: requesterName,
      requester_contact: requesterContact,
      project_idea: projectIdea,
      status: status || 'in_progress',
      help_needed: helpNeeded,
      vision: vision || '',
      submission_type: submissionType || 'collaboration',
      time_slot: '',
      admin_status: 'open',
      submitted_at: new Date().toISOString(),
    });

    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    console.error('Submit request error:', err);
    return NextResponse.json({ error: 'Failed to submit request.' }, { status: 500 });
  }
}
