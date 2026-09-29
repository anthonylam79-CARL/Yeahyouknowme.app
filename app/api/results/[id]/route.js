import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { hashToken } from '@/lib/ids';
import { QUESTIONS } from '@/lib/questions';

const RATING_LABELS = [
  { min: 85, label: 'An open book' },
  { min: 65, label: 'Easy to read' },
  { min: 40, label: 'A bit of a mystery' },
  { min: 0, label: 'Total enigma' },
];

function labelFor(score) {
  return RATING_LABELS.find((r) => score >= r.min).label;
}

// GET /api/results/:id?token=... — the maker's private dashboard. Only
// returns data when the token matches the quiz's owner_token_hash; there is
// no other way to see the ranking or the right/wrong breakdown.
export async function GET(request, { params }) {
  const { id } = await params;
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 401 });
  }

  const db = supabaseAdmin();

  const { data: quiz, error: quizError } = await db
    .from('quizzes')
    .select('id, maker_name, audience, question_ids, answers, owner_token_hash, created_at')
    .eq('id', id)
    .maybeSingle();

  if (quizError) {
    console.error('quiz lookup failed', quizError);
    return NextResponse.json({ error: 'Could not load quiz' }, { status: 500 });
  }
  if (!quiz) {
    return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
  }
  if (hashToken(token) !== quiz.owner_token_hash) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
  }

  const { data: attempts, error: attemptsError } = await db
    .from('attempts')
    .select('id, guesser_name, score, hits, age_bracket, gender, created_at')
    .eq('quiz_id', id)
    .order('score', { ascending: false })
    .order('created_at', { ascending: true });

  if (attemptsError) {
    console.error('attempts fetch failed', attemptsError);
    return NextResponse.json({ error: 'Could not load attempts' }, { status: 500 });
  }

  const length = quiz.question_ids.length;

  let insights = null;
  if (attempts.length > 0) {
    const rate = quiz.question_ids.map(
      (_, i) => attempts.filter((a) => a.hits[i]).length / attempts.length
    );
    let hi = 0;
    let lo = 0;
    rate.forEach((v, i) => {
      if (v > rate[hi]) hi = i;
      if (v < rate[lo]) lo = i;
    });

    const totalHits = attempts.reduce((sum, a) => sum + a.score, 0);
    const ratingScore = Math.round((totalHits / (attempts.length * length)) * 100);

    const describe = (i) => {
      const q = QUESTIONS[quiz.question_ids[i]];
      const pct = Math.round(rate[i] * 100);
      return {
        prompt: q.prompt,
        makerAnswer: q.options[quiz.answers[i]],
        percentCorrect: pct,
      };
    };

    insights = {
      ratingScore,
      ratingLabel: labelFor(ratingScore),
      mostGuessed: describe(hi),
      leastGuessed: hi === lo ? null : describe(lo),
      basedOn: attempts.length,
    };
  }

  return NextResponse.json({
    id: quiz.id,
    makerName: quiz.maker_name,
    audience: quiz.audience,
    length,
    createdAt: quiz.created_at,
    attempts: attempts.map((a) => ({
      name: a.guesser_name,
      score: a.score,
      createdAt: a.created_at,
    })),
    insights,
  });
}
