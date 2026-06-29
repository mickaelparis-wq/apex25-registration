const TIMESLOTS = [
  '09:00 – 10:00',
  '10:15 – 11:15',
  '11:30 – 12:30',
  '13:30 – 14:30',
  '14:45 – 15:45',
  '16:00 – 17:00'
];

function sessionListHtml(sessions) {
  return `<ul style="padding-left:18px;margin:16px 0;">${sessions
    .map(
      (s) =>
        `<li style="margin-bottom:8px;"><strong>${escapeHtml(s.title)}</strong><br><span style="color:#666;font-size:13px;">${TIMESLOTS[s.slot_index]}</span></li>`
    )
    .join('')}</ul>`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function wrapper(title, bodyHtml) {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
    <h1 style="font-size:22px;margin-bottom:4px;">${escapeHtml(title)}</h1>
    <div style="font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#888;margin-bottom:24px;">APEX 2025 &middot; 26&ndash;27 March 2025 &middot; London, UK</div>
    ${bodyHtml}
    <p style="margin-top:32px;font-size:12px;color:#999;">APEX 2025 &mdash; AI &amp; Frontier Technologies Conference</p>
  </div>`;
}

function acknowledgementEmail({ name, sessions, ref }) {
  return wrapper(
    "We've received your interest",
    `<p>Hi ${escapeHtml(name)},</p>
     <p>Thanks for registering your interest in APEX 2025. Your reference is <strong>${escapeHtml(ref)}</strong>.</p>
     <p>Our team will review your application and confirm your place within a few working days. Sessions you applied for:</p>
     ${sessionListHtml(sessions)}
     <p>If anything changes in the meantime, just reply to this email.</p>`
  );
}

function approveEmail({ name, sessions, ref }) {
  return wrapper(
    "You're confirmed for APEX 2025",
    `<p>Hi ${escapeHtml(name)},</p>
     <p>Good news — your registration (<strong>${escapeHtml(ref)}</strong>) has been approved. We look forward to seeing you at APEX 2025, 26&ndash;27 March 2025 in London.</p>
     <p>Your confirmed sessions:</p>
     ${sessionListHtml(sessions)}
     <p>This event is invite-only — please keep your confirmation handy for check-in.</p>`
  );
}

function rejectEmail({ name, sessions, ref }) {
  return wrapper(
    'Update on your APEX 2025 registration',
    `<p>Hi ${escapeHtml(name)},</p>
     <p>Thank you for your interest in APEX 2025 (ref <strong>${escapeHtml(ref)}</strong>). Unfortunately the sessions you applied for are now oversubscribed and we're unable to offer you a place this time:</p>
     ${sessionListHtml(sessions)}
     <p>We'd still love to have you on the waitlist — email <a href="mailto:waitlist@apex25.com">waitlist@apex25.com</a> and we'll be in touch if a place opens up.</p>`
  );
}

module.exports = { acknowledgementEmail, approveEmail, rejectEmail };
