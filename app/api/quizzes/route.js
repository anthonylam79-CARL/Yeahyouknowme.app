import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { generateQuizId, generateOwnerToken, hashToken } from '@/lib/ids';
import { validateNewQuiz } from '@/lib/validate';

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
