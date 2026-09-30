import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { validateAttempt } from '@/lib/validate';
import { QUESTIONS } from '@/lib/questions';

// A "hit" (used for the maker's per-question percent-correct insight) is an
// exact match on multiple choice, or landing within 1 point on a scale
// question — full exactness on a 1-5 self-rating is a much higher bar than
// on a 4-option trivia question, so the threshold is looser there.
const HIT_THRESHOLD = 0.75;

// Per-question credit toward the total score. Multiple choice is still
// strictly right/wrong. A scale question instead gives partial credit for
// how close the guess was, so the final score reflects real closeness
// rather than only exact hits.
function creditFor(question, guess, answer) {
  if (!question || question.type !== 'scale') {
    return guess === answer ? 1 : 0;
  }
  const span = question.max - question.min; // 4, for a 0-4 (1-5 displayed) scale
  return 1 - Math.abs(guess - answer) / span;
}

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

  const { errors, value } = validateAttempt(body, quiz.question_ids);
  if (errors.length) {
    return NextResponse.json({ error: errors.join('; ') }, { status: 400 });
  }

  const credits = value.guesses.map((g, i) =>
    creditFor(QUESTIONS[quiz.question_ids[i]], g, quiz.answers[i])
  );
  const hits = credits.map((c) => c >= HIT_THRESHOLD);
  // Round to 2 decimals so floating-point division (e.g. 1/4 repeated a few
  // times) never stores something like 7.499999999999999.
  const score = Math.round(credits.reduce((sum, c) => sum + c, 0) * 100) / 100;

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
