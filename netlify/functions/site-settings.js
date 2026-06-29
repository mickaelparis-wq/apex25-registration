const { getSupabaseAdmin } = require('./_utils/supabaseAdmin');

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'hero_image_url')
    .maybeSingle();

  if (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Could not load site settings' }) };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ heroImageUrl: data ? data.value : null })
  };
};
