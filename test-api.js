const https = require('https');

const SUPABASE_URL = 'https://mlixlkkvfyfylxpgepdw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_8Qf4YuqjrDMPAegJ_BioqQ_C1H_vaSJ';

async function test() {
  // Test: list users
  let res = await fetch(`${SUPABASE_URL}/rest/v1/users?select=id,slug,name&limit=3`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
  });
  console.log('LIST users:', res.status, await res.json());

  // Test: insert a test user
  res = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
    method: 'POST',
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
    body: JSON.stringify({
      id: 'test-' + Date.now(),
      email: 'test-' + Date.now() + '@test.com',
      slug: 'test-' + Date.now(),
      name: 'Test User',
      password_hash: 'hashed',
      bio: '',
      socials_x: '',
      socials_instagram: '',
      socials_linkedin: '',
      scheduling_url: '',
      scheduling_label: 'Book a time',
      created_at: new Date().toISOString(),
    })
  });
  console.log('INSERT user:', res.status);
  const text = await res.text();
  console.log('INSERT body:', text.substring(0, 300));
}

test().catch(console.error);
