const crypto = require('crypto');
const { getSupabaseAdmin } = require('./_utils/supabaseAdmin');
const { sendEmail } = require('./_utils/resend');
const { acknowledgementEmail } = require('./_utils/emailTemplates');

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  };
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON' });
  }

  const { firstName, lastName, email, company, jobTitle, dietary, notes, sessionIds } = payload;

  if (!firstName || !lastName || !email || !company || !jobTitle) {
    return jsonResponse(400, { error: 'Missing required fields' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonResponse(400, { error: 'Invalid email address' });
  }
  if (!Array.isArray(sessionIds) || sessionIds.length === 0) {
    return jsonResponse(400, { error: 'No sessions selected' });
  }

  const supabase = getSupabaseAdmin();
  const ref = 'APEX-' + crypto.randomBytes(4).toString('hex').toUpperCase().slice(0, 6);

  const { error: rpcError } = await supabase.rpc('submit_registration', {
    p_id: ref,
    p_name: `${firstName} ${lastName}`,
    p_email: email,
    p_company: company,
    p_job_title: jobTitle,
    p_dietary: dietary || null,
    p_notes: notes || null,
    p_session_ids: sessionIds
  });

  if (rpcError) {
    if (rpcError.message?.includes('SESSION_FULL')) {
      return jsonResponse(409, { error: 'One of the selected sessions is now full. Please review your basket.' });
    }
    console.error(rpcError);
    return jsonResponse(500, { error: 'Could not save registration' });
  }

  const { data: sessions } = await supabase
    .from('sessions')
    .select('*')
    .in('id', sessionIds);

  try {
    await sendEmail({
      to: email,
      subject: `APEX 2025 — we've received your interest (${ref})`,
      html: acknowledgementEmail({ name: `${firstName} ${lastName}`, sessions: sessions || [], ref })
    });
  } catch (e) {
    console.error('Email send failed', e);
  }

  return jsonResponse(200, { ref });
};
