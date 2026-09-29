import { randomBytes, createHash } from 'crypto';

const ALPHABET = 'abcdefghijkmnpqrstuvwxyz23456789'; // no 0/o/1/l, avoids ambiguous quiz codes

export function generateQuizId(length = 8) {
  const bytes = randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}

export function generateOwnerToken() {
  return randomBytes(24).toString('hex');
}

export function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}
