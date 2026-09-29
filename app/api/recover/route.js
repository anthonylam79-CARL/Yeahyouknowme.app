import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { generateOwnerToken, hashToken } from '@/lib/ids';
import { sendEmail } from '@/lib/resend';

// POST /api/recover — a maker who lost their results link asks for it back.
// We never store the original owner token (only its hash), so "recovery"
// actually rotates each matching quiz to a fresh token and emails the new
// link. Any old link the maker (or anyone else) still has stops working —
// that's the same trade-off a password-reset flow makes, and it means this
// endpoint can't be used to fish out a token for a quiz that isn't yours.
//
// Always returns the same generic message regardless of whether the email
// matched anything, so this can't be used to enumerate registered emails.
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const GENERIC_OK = {
    message: "If that email made any quizzes, we've sent the results links to it.",
  };

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
  }

  const db = supabaseAdmin();

  const { data: quizzes, error } = await db
    .from('quizzes')
    .select('id, maker_name, maker_email, created_at')
    .ilike('maker_email', email);

  if (error) {
    console.error('recover lookup failed', error);
    // Don't leak whether it failed vs. found nothing.
    return NextResponse.json(GENERIC_OK);
  }

  if (!quizzes || quizzes.length === 0) {
    return NextResponse.json(GENERIC_OK);
  }

  const origin = request.nextUrl.origin;
  const links = [];

  for (const quiz of quizzes) {
    const ownerToken = generateOwnerToken();
    const ownerTokenHash = hashToken(ownerToken);
    const { error: updateError } = await db
      .from('quizzes')
      .update({ owner_token_hash: ownerTokenHash })
      .eq('id', quiz.id);

    if (updateError) {
      console.error('token rotation failed for', quiz.id, updateError);
      continue;
    }

    links.push({
      url: `${origin}/results/${quiz.id}?token=${ownerToken}`,
      createdAt: quiz.created_at,
    });
  }

  if (links.length === 0) {
    return NextResponse.json(GENERIC_OK);
  }

  const listHtml = links
    .map(
      (l) =>
        `<li><a href="${l.url}">${l.url}</a> — made ${new Date(l.createdAt).toLocaleDateString()}</li>`
    )
    .join('');

  try {
    await sendEmail({
      to: email,
      subject: 'Your Yeah You Know Me results link(s)',
      html: `
        <p>Here ${links.length === 1 ? 'is your results link' : 'are your results links'}. Bookmark it — this is the only way back in.</p>
        <ul>${listHtml}</ul>
        <p style="color:#888;font-size:12px">Any older link(s) for these quizzes have stopped working, for security.</p>
      `,
    });
  } catch (err) {
    console.error('recover email send failed', err);
    // Still return generic OK — we don't want to reveal delivery failures
    // either, and the quiz creator can retry.
  }

  return NextResponse.json(GENERIC_OK);
}
