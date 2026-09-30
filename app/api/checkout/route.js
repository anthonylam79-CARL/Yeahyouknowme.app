import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { hashToken } from '@/lib/ids';
import { stripeClient, PREMIUM_PRICE_CENTS } from '@/lib/stripe';

// POST /api/checkout — the maker starts a one-time payment to unlock full
// insights for one quiz. Requires their owner token (same auth as the
// results page itself), since there are no user accounts to check against.
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const quizId = typeof body.quizId === 'string' ? body.quizId : '';
  const token = typeof body.token === 'string' ? body.token : '';
  if (!quizId || !token) {
    return NextResponse.json({ error: 'quizId and token are required' }, { status: 400 });
  }

  const db = supabaseAdmin();
  const { data: quiz, error } = await db
    .from('quizzes')
    .select('id, maker_name, owner_token_hash, is_premium')
    .eq('id', quizId)
    .maybeSingle();

  if (error) {
    console.error('checkout quiz lookup failed', error);
    return NextResponse.json({ error: 'Could not load quiz' }, { status: 500 });
  }
  if (!quiz) {
    return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
  }
  if (hashToken(token) !== quiz.owner_token_hash) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
  }
  if (quiz.is_premium) {
    return NextResponse.json({ error: 'This quiz is already unlocked' }, { status: 400 });
  }

  const productId = process.env.STRIPE_PRODUCT_ID;
  if (!productId) {
    console.error('checkout: missing STRIPE_PRODUCT_ID env var');
    return NextResponse.json({ error: 'Payments not configured yet' }, { status: 500 });
  }

  let session;
  try {
    const stripe = stripeClient();
    const origin = request.nextUrl.origin;
    session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          // Priced dynamically against a persisted Product (STRIPE_PRODUCT_ID)
          // rather than an ad-hoc product_data blob, because this account's
          // Managed Payments setup requires every line item to carry a tax
          // code — and that's set once, correctly, on the Product itself via
          // the Stripe dashboard, rather than guessed here in code.
          price_data: {
            currency: 'usd',
            product: productId,
            unit_amount: PREMIUM_PRICE_CENTS,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/results/${quizId}?token=${encodeURIComponent(token)}&unlocked=1`,
      cancel_url: `${origin}/results/${quizId}?token=${encodeURIComponent(token)}`,
      metadata: { quizId },
    });
  } catch (err) {
    console.error('stripe checkout session creation failed', err);
    return NextResponse.json({ error: 'Could not start checkout' }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
