import { neon } from '@neondatabase/serverless';

// Supabase connection — uses same interface as Vercel Postgres
// Connection string format: postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres
const connectionUrl = process.env.DATABASE_URL!;

const sql = neon(connectionUrl, { ssl: 'require' });

/**
 * Initialize database schema.
 * Run once on first deploy or after clearing the database.
 */
export async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id          TEXT PRIMARY KEY,
      email       TEXT UNIQUE NOT NULL,
      slug        TEXT UNIQUE NOT NULL,
      name        TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      bio         TEXT DEFAULT '',
      socials_x   TEXT DEFAULT '',
      socials_instagram TEXT DEFAULT '',
      socials_linkedin  TEXT DEFAULT '',
      scheduling_url    TEXT DEFAULT '',
      scheduling_label  TEXT DEFAULT 'Book a time',
      created_at   TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS requests (
      id               TEXT PRIMARY KEY,
      creator_id       TEXT NOT NULL,
      requester_name   TEXT NOT NULL,
      requester_contact TEXT NOT NULL,
      project_idea     TEXT NOT NULL,
      status           TEXT DEFAULT 'in_progress',
      help_needed      TEXT NOT NULL,
      vision           TEXT DEFAULT '',
      submission_type  TEXT DEFAULT 'collaboration',
      time_slot        TEXT DEFAULT '',
      submitted_at     TIMESTAMPTZ DEFAULT NOW(),
      reviewed_at      TIMESTAMPTZ,
      admin_status     TEXT DEFAULT 'open',
      notes            TEXT DEFAULT ''
    )
  `;
}

export { sql };
