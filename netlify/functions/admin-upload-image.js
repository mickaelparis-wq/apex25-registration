const { verifyToken } = require('./_utils/auth');
const { getSupabaseAdmin } = require('./_utils/supabaseAdmin');

const MAX_BYTES = 5 * 1024 * 1024; // 5MB

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

  const { imageBase64, contentType } = payload;
  if (!imageBase64 || !contentType || !contentType.startsWith('image/')) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing or invalid image' }) };
  }

  const buffer = Buffer.from(imageBase64, 'base64');
  if (buffer.length > MAX_BYTES) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Image too large (max 5MB)' }) };
  }

  const ext = contentType.split('/')[1] || 'jpg';
  const path = `hero.${ext}`;

  const supabase = getSupabaseAdmin();
  const { error: uploadError } = await supabase.storage
    .from('conference-images')
    .upload(path, buffer, { contentType, upsert: true });

  if (uploadError) {
    console.error(uploadError);
    return { statusCode: 500, body: JSON.stringify({ error: 'Upload failed' }) };
  }

  const { data: publicUrlData } = supabase.storage.from('conference-images').getPublicUrl(path);
  const url = `${publicUrlData.publicUrl}?t=${Date.now()}`;

  const { error: settingsError } = await supabase
    .from('site_settings')
    .upsert({ key: 'hero_image_url', value: url });

  if (settingsError) {
    console.error(settingsError);
    return { statusCode: 500, body: JSON.stringify({ error: 'Could not save settings' }) };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  };
};
