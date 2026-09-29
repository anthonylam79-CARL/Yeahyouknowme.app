import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { validateAttempt } from '@/lib/validate';

// POST /api/quizzes/:id/attempts — a guesser submits their guesses. Scoring
// happens here, server-side, against the maker's real stored answers. The
// client never sees the answer key, before or after scoring — only the
// per-question hit/miss and the final tally.
export async function POST(request, { params }) {
  const { id } = await params;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const db = supabaseAdmin();

  const { data: quiz, error: quizError } = await db
    .from('quizzes')
    .select('id, question_ids, answers')
    .eq('id', id)
    .maybeSingle();

  if (quizError) {
    console.error('quiz lookup failed', quizError);
    return NextResponse.json({ error: 'Could not load quiz' }, { status: 500 });
  }
  if (!quiz) {
    return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
  }

  const { errors, value } = validateAttempt(body, quiz.question_ids.length);
  if (errors.length) {
    return NextResponse.json({ error: errors.join('; ') }, { status: 400 });
  }

  const hits = value.guesses.map((g, i) => g === quiz.answers[i]);
  const score = hits.filter(Boolean).length;

  const { data: inserted, error: insertError } = await db
    .from('attempts')
    .insert({
      quiz_id: id,
      guesser_name: value.guesserName,
      guesses: value.guesses,
      score,
      hits,
      age_bracket: value.ageBracket,
      gender: value.gender,
    })
    .select('id, created_at')
    .single();

  if (insertError) {
    console.error('attempt insert failed', insertError);
    return NextResponse.json({ error: 'Could not save attempt' }, { status: 500 });
  }

  // Rank among all attempts on this quiz so far (ties broken by earlier finish).
  const { data: siblings, error: rankError } = await db
    .from('attempts')
    .select('score, created_at')
    .eq('quiz_id', id);

  let rank = 1;
  let total = 1;
  if (!rankError && siblings) {
    total = siblings.length;
    rank =
      1 +
      siblings.filter(
        (s) => s.score > score || (s.score === score && s.created_at < inserted.created_at)
      ).length;
  }

  return NextResponse.json(
    {
      score,
      total: quiz.question_ids.length,
      hits,
      rank,
      outOf: total,
    },
    { status: 201 }
  );
}
