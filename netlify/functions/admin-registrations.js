const { verifyToken } = require('./_utils/auth');
const { getSupabaseAdmin } = require('./_utils/supabaseAdmin');

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }
  if (!verifyToken(event.headers.authorization)) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  const supabase = getSupabaseAdmin();
  const [{ data: registrations, error: regErr }, { data: sessions, error: sessErr }] = await Promise.all([
    supabase.from('registrations').select('*').order('created_at', { ascending: false }),
    supabase.from('sessions').select('*')
  ]);

  if (regErr || sessErr) {
    console.error(regErr || sessErr);
    return { statusCode: 500, body: JSON.stringify({ error: 'Could not load data' }) };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ registrations, sessions })
  };
};
