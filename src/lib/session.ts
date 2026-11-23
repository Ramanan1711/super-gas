const SESSION_SECRET = process.env.SESSION_SECRET || 'super-gas-secret-key-9821-secure-salt';
const MAX_SESSION_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface VerifiedSession {
  userId: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'DELIVERY_PARTNER';
  timestamp: number;
}

/**
 * Computes HMAC-SHA256 using the Web Crypto API, fully compatible with both Node.js and Edge Runtime.
 */
async function computeHmacSha256(payload: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Constant-time string equality check to prevent timing attacks.
 */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let c = 0;
  for (let i = 0; i < a.length; i++) {
    c |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return c === 0;
}

/**
 * Creates a cryptographically signed session token:
 * sg_sess_<userId>.<role>.<timestamp>.<hmacSignature>
 */
export async function createSignedSessionToken(userId: string, role: string): Promise<string> {
  const timestamp = Date.now();
  const payload = `${userId}.${role}.${timestamp}`;
  const hmac = await computeHmacSha256(payload, SESSION_SECRET);
  return `sg_sess_${payload}.${hmac}`;
}

/**
 * Verifies a signed session token. Returns null if invalid, tampered, or expired.
 */
export async function verifySessionToken(token: string | null | undefined): Promise<VerifiedSession | null> {
  if (!token || typeof token !== 'string') return null;
  if (!token.startsWith('sg_sess_')) return null;

  const raw = token.slice('sg_sess_'.length);
  const parts = raw.split('.');

  // Signed format: userId.role.timestamp.signature
  if (parts.length === 4) {
    const [userId, role, timestampStr, signature] = parts;
    const payload = `${userId}.${role}.${timestampStr}`;
    const expectedHmac = await computeHmacSha256(payload, SESSION_SECRET);

    if (!constantTimeEqual(signature, expectedHmac)) {
      return null;
    }

    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp) || Date.now() - timestamp > MAX_SESSION_AGE_MS) {
      return null;
    }

    if (role !== 'SUPER_ADMIN' && role !== 'ADMIN' && role !== 'DELIVERY_PARTNER') {
      return null;
    }

    return {
      userId,
      role: role as VerifiedSession['role'],
      timestamp,
    };
  }

  // Fallback for legacy format: sg_sess_<userId>_<timestamp> (only within valid lifespan)
  const legacyParts = raw.split('_');
  if (legacyParts.length >= 2) {
    const userId = legacyParts[0];
    const timestamp = parseInt(legacyParts[1], 10);
    if (userId && !isNaN(timestamp) && Date.now() - timestamp <= MAX_SESSION_AGE_MS) {
      return {
        userId,
        role: 'DELIVERY_PARTNER',
        timestamp,
      };
    }
  }

  return null;
}
