const crypto = require('crypto');

const TOKEN_TTL_MS = 1000 * 60 * 60 * 8; // 8 hours

function sign(payload) {
  return crypto
    .createHmac('sha256', process.env.ADMIN_SESSION_SECRET)
    .update(payload)
    .digest('hex');
}

function issueToken() {
  const expires = Date.now() + TOKEN_TTL_MS;
  const payload = String(expires);
  const sig = sign(payload);
  return Buffer.from(`${payload}.${sig}`).toString('base64');
}

function verifyToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  const token = authHeader.slice('Bearer '.length);
  let decoded;
  try {
    decoded = Buffer.from(token, 'base64').toString('utf8');
  } catch {
    return false;
  }
  const [payload, sig] = decoded.split('.');
  if (!payload || !sig) return false;

  const expectedSig = sign(payload);
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length) return false;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return false;

  const expires = parseInt(payload, 10);
  if (!expires || Date.now() > expires) return false;

  return true;
}

module.exports = { issueToken, verifyToken };
