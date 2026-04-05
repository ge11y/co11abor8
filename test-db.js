const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
sql`SELECT 1 as test`.then(r => console.log('DB OK:', r)).catch(e => console.error('DB ERROR:', e.message));
