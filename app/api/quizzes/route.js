import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { generateQuizId, generateOwnerToken, hashToken } from '@/lib/ids';
import { validateNewQuiz } from '@/lib/validate';
import { sendEmail } from '@/lib/resend';
import { escapeHtml, cleanName } from '@/lib/text';

// Fire-and-forget confirmation email — both links the maker might need
// later, never their answers (they just picked those, it's not new
// information to them, and there's no reason to put a list of someone's
// self-ratings in an inbox). Best-effort: a failure here never fails quiz
// creation, same trade-off as the /api/recover email.
async function sendConfirmationEmail({ email, makerName, id, ownerToken, origin }) {
  const shareLink = `${origin}/q/${id}`;
  const resultsLink = `${origin}/results/${id}?token=${ownerToken}`;
  try {
    await sendEmail({
      to: email,
      subject: 'Your Yeah You Know Me quiz is ready',
      html: `
        <p>Hey ${escapeHtml(cleanName(makerName))} — your quiz is live. Keep this email, it has both links you'll need.</p>
        <p><strong>Share this one</strong> so people can take your quiz:<br>
          <a href="${shareLink}">${shareLink}</a></p>
        <p style="color:#777;font-size:12px">We'll also email you when people take your quiz (at most once per burst). Every email has a link to stop them.</p>
        <p><strong>Bookmark this one</strong> — it's your private results page (only you should have it):<br>
          <a href="${resultsLink}">${resultsLink}</a></p>
      `,
    });
  } catch (err) {
    console.error('quiz confirmation email failed', err);
  }
}

// POST /api/quizzes — a maker submits their own answers and gets back a
// shareable quiz id and a private owner token. The maker's answers are
// stored but never returned from any public-facing endpoint after this.
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { errors, value } = validateNewQuiz(body);
  if (errors.length) {
    return NextResponse.json({ error: errors.join('; ') }, { status: 400 });
  }

  const db = supabaseAdmin();
  const ownerToken = generateOwnerToken();
  const ownerTokenHash = hashToken(ownerToken);

  // Retry on the rare id collision rather than trusting one shot.
  for (let attempt = 0; attempt < 5; attempt++) {
    const id = generateQuizId();
    const { error } = await db.from('quizzes').insert({
      id,
      maker_name: value.makerName,
      audience: value.audience,
      question_ids: value.questionIds,
      answers: value.answers,
      owner_token_hash: ownerTokenHash,
      maker_email: value.email,
    });

    if (!error) {
      if (value.email) {
        // Awaited (unlike a true fire-and-forget) because this route runs
        // in a serverless function — anything not awaited before the
        // response is sent can get frozen/killed before it actually runs.
        // Failure never surfaces to the caller: the function itself
        // swallows its own errors (see above), same trade-off as the
        // /api/recover email.
        await sendConfirmationEmail({
          email: value.email,
          makerName: value.makerName,
          id,
          ownerToken,
          origin: request.nextUrl.origin,
        });
      }
      return NextResponse.json({ id, ownerToken }, { status: 201 });
    }
    // 23505 = unique_violation on the id primary key — try a new id.
    if (error.code !== '23505') {
      console.error('quiz insert failed', error);
      return NextResponse.json({ error: 'Could not create quiz' }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Could not allocate a quiz id, try again' }, { status: 500 });
}
