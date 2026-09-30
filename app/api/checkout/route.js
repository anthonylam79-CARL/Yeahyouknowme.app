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

  let session;
  try {
    const stripe = stripeClient();
    const origin = request.nextUrl.origin;
    session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Unlock full insights — ${quiz.maker_name}'s quiz`,
              description: 'See what people get right, what they get wrong, and your full open-book rating.',
            },
            unit_amount: PREMIUM_PRICE_CENTS,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/results/${quizId}?token=${encodeURIComponent(token)}&unlocked=1`,
      cancel_url: `${origin}/results/${quizId}?token=${encodeURIComponent(token)}`,
      metadata: { quizId },
      // This account has a Dashboard-level default to calculate tax on
      // Checkout Sessions, which requires a tax code on every line item
      // unless explicitly turned off here. We don't have an active tax
      // registration set up, so we opt this session out rather than
      // guess at a tax code — see stripe-best-practices: automatic_tax
      // should only be enabled once a registration exists.
      automatic_tax: { enabled: false },
    });
  } catch (err) {
    console.error('stripe checkout session creation failed', err);
    return NextResponse.json({ error: 'Could not start checkout' }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
