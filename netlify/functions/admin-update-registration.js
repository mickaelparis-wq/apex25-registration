const { verifyToken } = require('./_utils/auth');
const { getSupabaseAdmin } = require('./_utils/supabaseAdmin');
const { sendEmail } = require('./_utils/resend');
const { approveEmail, rejectEmail } = require('./_utils/emailTemplates');

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

  const { id, action } = payload;
  if (!id || !['approve', 'reject'].includes(action)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request' }) };
  }

  const supabase = getSupabaseAdmin();
  const status = action === 'approve' ? 'approved' : 'rejected';

  const { data: reg, error: updateErr } = await supabase
    .from('registrations')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (updateErr || !reg) {
    console.error(updateErr);
    return { statusCode: 404, body: JSON.stringify({ error: 'Registration not found' }) };
  }

  const { data: sessions } = await supabase.from('sessions').select('*').in('id', reg.sessions);

  try {
    const template = action === 'approve' ? approveEmail : rejectEmail;
    await sendEmail({
      to: reg.email,
      subject: action === 'approve' ? `You're confirmed for APEX 2025 (${reg.id})` : `Update on your APEX 2025 registration (${reg.id})`,
      html: template({ name: reg.name, sessions: sessions || [], ref: reg.id })
    });
  } catch (e) {
    console.error('Email send failed', e);
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ registration: reg })
  };
};
