const { getSupabaseAdmin } = require('./_utils/supabaseAdmin');

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const supabase = getSupabaseAdmin();
  const { data: sessions, error } = await supabase
    .from('sessions')
    .select('*')
    .order('slot_index', { ascending: true });

  if (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Could not load sessions' }) };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessions })
  };
};
