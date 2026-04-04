import { neon, NeonQueryFunction } from '@neondatabase/serverless';

let _sql: NeonQueryFunction<false, false> | null = null;

function getSql(): NeonQueryFunction<false, false> {
  if (!_sql) {
    const connectionUrl = process.env.DATABASE_URL;
    if (!connectionUrl) {
      // Return a dummy that throws on use — only happens in broken dev/build envs
      return ((..._args: any[]) => {
        throw new Error('DATABASE_URL environment variable is not set');
      }) as any;
    }
    _sql = neon(connectionUrl);
  }
  return _sql;
}

// sql is a lazy proxy — no database connection is made until the first query runs
export const sql = new Proxy(
  (() => {}) as unknown as NeonQueryFunction<false, false>,
  {
    apply(_target, _this, args) {
      return (getSql() as Function).apply(null, args);
    },
    get(_target, prop) {
      return (getSql() as any)[prop];
    },
  }
);

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
