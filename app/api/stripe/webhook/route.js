import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { stripeClient } from '@/lib/stripe';

// POST /api/stripe/webhook — Stripe calls this when a checkout session
// completes. We verify the signature (never trust an unsigned request to
// unlock a quiz for free), then flip is_premium for the quiz named in the
// session's metadata.
//
// Configure this URL in the Stripe dashboard under Developers → Webhooks:
//   https://yeahyouknowme.app/api/stripe/webhook
// listening for the "checkout.session.completed" event, and put the signing
// secret it gives you in STRIPE_WEBHOOK_SECRET.
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

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const quizId = session.metadata?.quizId;

    if (quizId) {
      const db = supabaseAdmin();
      const { error } = await db.from('quizzes').update({ is_premium: true }).eq('id', quizId);
      if (error) {
        console.error('stripe webhook: failed to mark quiz premium', quizId, error);
        // Still 200 — Stripe will retry on non-2xx, but retrying won't fix a
        // DB error. Log loudly instead so it can be fixed manually.
      }
    } else {
      console.error('stripe webhook: checkout.session.completed with no quizId in metadata');
    }
  }

  return NextResponse.json({ received: true });
}
