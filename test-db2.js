// Try direct connection with pooler port
const { neon } = require('@neondatabase/serverless');

const urls = [
  'postgresql://postgres:2e2e2e2e@db.mlixlkkvfyfylxpgepdw.supabase.co:6543/postgres',
  'postgresql://postgres:2e2e2e2e@aws-0-us-east-1.pooler.supabase.com:6543/postgres',
];

(async () => {
  for (const url of urls) {
    try {
      const sql = neon(url);
      const result = await sql`SELECT 1 as test`;
      console.log('OK:', url);
      break;
    } catch (e) {
      console.log('FAIL:', url, e.message);
    }
  }
})();
