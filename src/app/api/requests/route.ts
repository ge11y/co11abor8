import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { sql, initDb } from '@/lib/db';
import { generateId } from '@/lib/store';

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    // Public: return all requests (for browsing)
    const result = await sql`
      SELECT id, creator_id, requester_name, requester_contact, project_idea,
             status, help_needed, vision, submission_type, time_slot,
             submitted_at, admin_status
      FROM requests ORDER BY submitted_at DESC
    `;
    return NextResponse.json(result.rows.map(row => ({
      id: row.id, creatorId: row.creator_id, requesterName: row.requester_name,
      requesterContact: row.requester_contact, projectIdea: row.project_idea,
      status: row.status, helpNeeded: row.help_needed, vision: row.vision,
      submissionType: row.submission_type, timeSlot: row.time_slot,
      submittedAt: row.submitted_at, adminStatus: row.admin_status,
    })));
  }

  // Authed: return requests TO this user + requests THEY submitted
  const result = await sql`
    SELECT id, creator_id, requester_name, requester_contact, project_idea,
           status, help_needed, vision, submission_type, time_slot,
           submitted_at, reviewed_at, admin_status, notes
    FROM requests
    WHERE creator_id = ${user.id}
       OR requester_contact = ${user.email}
    ORDER BY submitted_at DESC
  `;

  return NextResponse.json(result.rows.map(row => ({
    id: row.id, creatorId: row.creator_id, requesterName: row.requester_name,
    requesterContact: row.requester_contact, projectIdea: row.project_idea,
    status: row.status, helpNeeded: row.help_needed, vision: row.vision,
    submissionType: row.submission_type, timeSlot: row.time_slot,
    submittedAt: row.submitted_at, reviewedAt: row.reviewed_at,
    adminStatus: row.admin_status, notes: row.notes || '',
  })));
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { creatorId, requesterName, requesterContact, projectIdea, status,
      helpNeeded, vision, submissionType } = body;

    if (!creatorId || !requesterName || !requesterContact || !projectIdea || !helpNeeded) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    await initDb();
    const id = generateId();

    await sql`
      INSERT INTO requests (id, creator_id, requester_name, requester_contact, project_idea,
                           status, help_needed, vision, submission_type, admin_status)
      VALUES (${id}, ${creatorId}, ${requesterName}, ${requesterContact}, ${projectIdea},
              ${status || 'in_progress'}, ${helpNeeded}, ${vision || ''},
              ${submissionType || 'collaboration'}, 'open')
    `;

    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    console.error('Submit request error:', err);
    return NextResponse.json({ error: 'Failed to submit request.' }, { status: 500 });
  }
}
