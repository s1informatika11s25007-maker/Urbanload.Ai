import * as crypto from 'crypto';

export interface QuickPassPayload {
  bookingId: string;
  vehiclePlate: string;
  bayNumber: string;
  validStart: string; // ISO string
  validEnd: string;   // ISO string
  nonce: string;
  kid: string;        // Key ID
}

export interface GeneratedQuickPass {
  tokenPayload: QuickPassPayload;
  signature: string;
  qrDataString: string;
}

// In-memory keypair cache for Ed25519 signature scheme
let edKeyPair: { publicKey: string; privateKey: string } | null = null;
const KEY_ID = 'urbanload-ed25519-v1';

export function getEd25519KeyPair() {
  if (!edKeyPair) {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
    edKeyPair = { publicKey, privateKey };
  }
  return edKeyPair;
}

export function getPublicKeyPEM(): string {
  return getEd25519KeyPair().publicKey;
}

/**
 * Generates an Ed25519 signed QuickPass QR payload.
 */
export function createQuickPassQR(
  bookingId: string,
  vehiclePlate: string,
  bayNumber: string,
  validStart: Date,
  validEnd: Date
): GeneratedQuickPass {
  const { privateKey } = getEd25519KeyPair();
  const nonce = crypto.randomBytes(12).toString('hex');

  const tokenPayload: QuickPassPayload = {
    bookingId,
    vehiclePlate,
    bayNumber,
    validStart: validStart.toISOString(),
    validEnd: validEnd.toISOString(),
    nonce,
    kid: KEY_ID
  };

  const canonicalMessage = JSON.stringify(tokenPayload);
  const signature = crypto.sign(null, Buffer.from(canonicalMessage), privateKey).toString('base64');

  const qrObject = {
    p: tokenPayload,
    sig: signature
  };

  return {
    tokenPayload,
    signature,
    qrDataString: JSON.stringify(qrObject)
  };
}

/**
 * Verifies an Ed25519 signed QuickPass QR payload.
 */
export function verifyQuickPassQR(
  qrDataString: string,
  publicKeyPemOverride?: string
): { isValid: boolean; payload?: QuickPassPayload; reason?: string } {
  try {
    const parsed = JSON.parse(qrDataString);
    if (!parsed || !parsed.p || !parsed.sig) {
      return { isValid: false, reason: 'Format QR Code tidak valid (payload atau signature hilang).' };
    }

    const payload: QuickPassPayload = parsed.p;
    const signature = parsed.sig;

    // Check expiration
    const now = new Date();
    const validEnd = new Date(payload.validEnd);
    if (now > validEnd) {
      return { isValid: false, payload, reason: 'Tiket QuickPass sudah kadaluarsa (expired).' };
    }

    const canonicalMessage = JSON.stringify(payload);
    const pubKey = publicKeyPemOverride || getPublicKeyPEM();

    const isVerified = crypto.verify(
      null,
      Buffer.from(canonicalMessage),
      pubKey,
      Buffer.from(signature, 'base64')
    );

    if (!isVerified) {
      return { isValid: false, payload, reason: 'Tanda tangan digital Ed25519 tidak cocok (signature mismatch).' };
    }

    return { isValid: true, payload };
  } catch (err: any) {
    return { isValid: false, reason: `Gagal memverifikasi QR Code: ${err.message}` };
  }
}
