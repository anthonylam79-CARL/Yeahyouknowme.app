import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// 100 was the original bar, but that's 100 people in the exact same
// age-bracket + gender + quiz-length combination (5 brackets x 4 genders x
// 3 lengths = up to 6,000 attempts site-wide before this ever turns on for
// anyone). 20 is still enough that a percentile isn't a coin flip between a
// handful of people, but low enough to actually show up early on.
const MIN_SAMPLE = 20;

// POST /api/percentile — "where do I rank" for a guesser, aggregated across
// every quiz of the same length and bracket, never fabricated. Per the
// honesty rule in backend-spec.md: below MIN_SAMPLE real attempts in that
// exact bracket, this returns { available: false } and the UI must show
// "not enough data yet" rather than any number.
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { quizLength, ageBracket, gender, score } = body;
  const AGE_BRACKETS = ['13-17', '18-24', '25-34', '35-44', '45+'];
  const GENDERS = ['Woman', 'Man', 'Nonbinary', 'Prefer not to say'];

  if (
    !AGE_BRACKETS.includes(ageBracket) ||
    !GENDERS.includes(gender) ||
    !Number.isInteger(quizLength) ||
    quizLength < 5 ||
    quizLength > 20 ||
    typeof score !== 'number' ||
    !Number.isFinite(score) ||
    score < 0 ||
    score > quizLength
  ) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
  }

  const db = supabaseAdmin();

  // Pull scores for every attempt in this exact bracket + quiz length,
  // across all quizzes — a single quiz rarely has enough same-bracket
  // attempts on its own. At larger scale this should move to a SQL
  // aggregate (see bracket_stats view in schema.sql) instead of pulling rows.
  const { data, error } = await db
    .from('attempts')
    .select('score, guesses')
    .eq('age_bracket', ageBracket)
    .eq('gender', gender);

  if (error) {
    console.error('percentile query failed', error);
    return NextResponse.json({ error: 'Could not compute percentile' }, { status: 500 });
  }

  const sameLength = data.filter((a) => a.guesses.length === quizLength);

  if (sameLength.length < MIN_SAMPLE) {
    return NextResponse.json({
      available: false,
      basedOn: sameLength.length,
      minSample: MIN_SAMPLE,
    });
  }

  const beaten = sameLength.filter((a) => a.score < score).length;
  const percentile = Math.round((beaten / sameLength.length) * 100);

  return NextResponse.json({
    available: true,
    percentile, // "beats X% of this bracket"
    basedOn: sameLength.length,
  });
}
