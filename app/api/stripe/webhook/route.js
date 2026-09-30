import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { stripeClient } from '@/lib/stripe';

// POST /api/stripe/webhook — Stripe calls this on checkout session events.
// We verify the signature (never trust an unsigned request to unlock a quiz
// for free), then flip is_premium for the quiz named in the session's
// metadata — but only once the session has actually been paid.
//
// We handle both checkout.session.completed AND
// checkout.session.async_payment_succeeded, and only fulfill when
// payment_status isn't 'unpaid'. Some payment methods (bank debits, etc.)
// report the session "completed" before the payment itself has cleared —
// fulfilling on "completed" alone would unlock quizzes for payments that
// later fail, and never unlock the ones that succeed asynchronously.
// checkout.session.async_payment_failed is a no-op here since we never
// grant access until payment_status confirms success.
//
// Configure this URL in the Stripe dashboard under Developers → Webhooks:
//   https://yeahyouknowme.app/api/stripe/webhook
// listening for "checkout.session.completed" and
// "checkout.session.async_payment_succeeded", and put the signing secret it
// gives you in STRIPE_WEBHOOK_SECRET.
export async function POST(request) {
  const sig = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    console.error('stripe webhook: missing signature header or STRIPE_WEBHOOK_SECRET');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  const rawBody = await request.text();

  let event;
  try {
    const stripe = stripeClient();
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('stripe webhook signature verification failed', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (
    event.type === 'checkout.session.completed' ||
    event.type === 'checkout.session.async_payment_succeeded'
  ) {
    const session = event.data.object;
    const quizId = session.metadata?.quizId;

    if (session.payment_status === 'unpaid') {
      // Awaiting an async payment method (e.g. a bank debit) to clear.
      // checkout.session.async_payment_succeeded will fire when it does.
    } else if (quizId) {
      const db = supabaseAdmin();
      const { error } = await db.from('quizzes').update({ is_premium: true }).eq('id', quizId);
      if (error) {
        console.error('stripe webhook: failed to mark quiz premium', quizId, error);
        // Still 200 — Stripe will retry on non-2xx, but retrying won't fix a
        // DB error. Log loudly instead so it can be fixed manually.
      }
    } else {
      console.error(`stripe webhook: ${event.type} with no quizId in metadata`);
    }
  }

  return NextResponse.json({ received: true });
}
