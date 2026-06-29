const { verifyToken } = require('./_utils/auth');
const { getSupabaseAdmin } = require('./_utils/supabaseAdmin');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }
  if (!verifyToken(event.headers.authorization)) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { id, title, speaker, slotIndex, capacity, description } = payload;
  if (!id) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing session id' }) };
  }

  const supabase = getSupabaseAdmin();
  const { data: session, error } = await supabase
    .from('sessions')
    .update({
      title,
      speaker,
      slot_index: slotIndex,
      capacity,
      description
    })
    .eq('id', id)
    .select()
    .single();

  if (error || !session) {
    console.error(error);
    return { statusCode: 404, body: JSON.stringify({ error: 'Session not found' }) };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session })
  };
};
