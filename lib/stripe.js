import Stripe from 'stripe';

let client = null;

export function stripeClient() {
  if (client) return client;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('Missing STRIPE_SECRET_KEY. Set it in .env.local / Vercel env vars.');
  }

  client = new Stripe(key, { apiVersion: '2026-08-26.dahlia' });
  return client;
}

// Price for unlocking a single quiz's full insights (see PRD discussion —
// one-time payment per quiz, no accounts, tied to the quiz's owner token).
export const PREMIUM_PRICE_CENTS = 199;
