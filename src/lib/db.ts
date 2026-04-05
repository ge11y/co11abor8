/**
 * Supabase REST API client — no direct Postgres connection needed.
 * Uses anon key + project URL over HTTPS. Works in any serverless environment.
 */

const SUPABASE_URL = 'https://mlixlkkvfyfylxpgepdw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_8Qf4YuqjrDMPAegJ_BioqQ_C1H_vaSJ';

function headers(extra: Record<string, string> = {}) {
  return {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

async function supabaseFetch(table: string, params?: string) {
  const url = `${SUPABASE_URL}/rest/v1/${table}${params ? '?' + params : ''}`;
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase ${res.status}: ${text}`);
  }
  return res.json();
}

async function supabaseInsert(table: string, row: Record<string, unknown>) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: headers({ 'Prefer': 'return=representation' }),
    body: JSON.stringify(row),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase INSERT ${res.status}: ${text}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : [];
}

async function supabaseUpdate(table: string, filter: string, updates: Record<string, unknown>) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, {
    method: 'PATCH',
    headers: headers({ 'Prefer': 'return=representation' }),
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase PATCH ${res.status}: ${text}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : [];
}

// ─── Init: create tables (run once via dashboard or postgrest config) ──────────
export async function initDb() {
  // Tables must be created manually in Supabase dashboard or via their CLI.
  // This function is a no-op here — we assume tables exist.
  // To create via SQL, use Supabase Dashboard → SQL Editor, or:
  //   npx supabase db execute -p <your-password> < schema.sql
  return;
}

// ─── Users ────────────────────────────────────────────────────────────────────
export async function getUserByEmail(email: string) {
  return supabaseFetch('users', `email=eq.${encodeURIComponent(email.toLowerCase())}&limit=1`);
}

export async function getUserBySlug(slug: string) {
  return supabaseFetch('users', `slug=eq.${encodeURIComponent(slug)}&limit=1`);
}

export async function getAllUsers() {
  return supabaseFetch('users', 'select=id,slug,name,bio,socials_x,socials_instagram,socials_linkedin,scheduling_url,scheduling_label,created_at&order=created_at.desc');
}

export async function getUserById(id: string) {
  return supabaseFetch('users', `id=eq.${encodeURIComponent(id)}&limit=1`);
}

export async function createUser(user: Record<string, unknown>) {
  return supabaseInsert('users', user);
}

export async function updateUser(id: string, updates: Record<string, unknown>) {
  return supabaseUpdate('users', `id=eq.${encodeURIComponent(id)}`, updates);
}

// ─── Requests ────────────────────────────────────────────────────────────────
export async function getAllRequests() {
  return supabaseFetch('requests', 'order=submitted_at.desc');
}

export async function getRequestsForCreator(creatorId: string) {
  return supabaseFetch('requests', `creator_id=eq.${encodeURIComponent(creatorId)}&order=submitted_at.desc`);
}

export async function getRequestsByRequester(contact: string) {
  return supabaseFetch('requests', `requester_contact=eq.${encodeURIComponent(contact)}&order=submitted_at.desc`);
}

export async function getRequestById(id: string) {
  return supabaseFetch('requests', `id=eq.${encodeURIComponent(id)}&limit=1`);
}

export async function createRequest(req: Record<string, unknown>) {
  return supabaseInsert('requests', req);
}

export async function updateRequest(id: string, updates: Record<string, unknown>) {
  return supabaseUpdate('requests', `id=eq.${encodeURIComponent(id)}`, updates);
}

export async function deleteRequest(id: string) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/requests?id=eq.${encodeURIComponent(id)}`,
    { method: 'DELETE', headers: headers() }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase DELETE ${res.status}: ${text}`);
  }
  return true;
}
