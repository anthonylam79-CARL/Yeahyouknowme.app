import Stripe from 'stripe';

let client = null;

export function stripeClient() {
  if (client) return client;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('Missing STRIPE_SECRET_KEY. Set it in .env.local / Vercel env vars.');
  }

  // TEMP diagnostic (see Vercel → Logs after a checkout attempt) — only
  // logs which mode the key is, never the key itself. Checkout sessions
  // were unexpectedly coming back as cs_test_... despite the env var
  // reportedly being sk_live_..., so logging exactly what this process
  // actually sees at request time settles it rather than guessing.
  console.log('[stripe] key mode:', key.startsWith('sk_live_') ? 'LIVE' : key.startsWith('sk_test_') ? 'TEST' : 'UNKNOWN_PREFIX');

  client = new Stripe(key, { apiVersion: '2026-08-26.dahlia' });
  return client;
}

// Price for unlocking a single quiz's full insights (see PRD discussion —
// one-time payment per quiz, no accounts, tied to the quiz's owner token).
export const PREMIUM_PRICE_CENTS = 199;
