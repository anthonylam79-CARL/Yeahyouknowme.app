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
    .select('id, maker_name, audience, question_ids, answers, owner_token_hash, is_premium, created_at')
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
    .select('id, guesser_name, score, hits, guesses, age_bracket, gender, created_at')
    .eq('quiz_id', id)
    .order('score', { ascending: false })
    .order('created_at', { ascending: true });

  if (attemptsError) {
    console.error('attempts fetch failed', attemptsError);
    return NextResponse.json({ error: 'Could not load attempts' }, { status: 500 });
  }

  const length = quiz.question_ids.length;

  // Full insights (rating, what people get right/wrong) are a $1.99/quiz
  // unlock via Stripe — see /api/checkout. Everyone with the owner token can
  // still see the plain ranking above; this is the only gated part.
  let insights = null;
  let insightsLocked = false;
  if (attempts.length > 0 && !quiz.is_premium) {
    insightsLocked = true;
  }
  if (attempts.length > 0 && quiz.is_premium) {
    // Talking-point (personality/scenario) questions are never scored —
    // keep them out of the right/wrong insights entirely, and surface
    // them separately below.
    const scoreableIdx = quiz.question_ids
      .map((_, i) => i)
      .filter((i) => !QUESTIONS[quiz.question_ids[i]]?.topic);
    const topicIdx = quiz.question_ids
      .map((_, i) => i)
      .filter((i) => QUESTIONS[quiz.question_ids[i]]?.topic);

    const rate = {};
    scoreableIdx.forEach((i) => {
      rate[i] = attempts.filter((a) => a.hits[i]).length / attempts.length;
    });
    let hi = scoreableIdx[0];
    let lo = scoreableIdx[0];
    scoreableIdx.forEach((i) => {
      if (rate[i] > rate[hi]) hi = i;
      if (rate[i] < rate[lo]) lo = i;
    });

    const totalHits = attempts.reduce((sum, a) => sum + a.score, 0);
    const ratingScore =
      scoreableIdx.length > 0
        ? Math.round((totalHits / (attempts.length * scoreableIdx.length)) * 100)
        : 0;

    const describe = (i) => {
      const q = QUESTIONS[quiz.question_ids[i]];
      const pct = Math.round(rate[i] * 100);
      if (q.type === 'scale') {
        const avgGuess =
          attempts.reduce((sum, a) => sum + a.guesses[i], 0) / attempts.length;
        return {
          type: 'scale',
          prompt: q.prompt,
          makerAnswer: `${quiz.answers[i] + 1}/5`,
          percentCorrect: pct,
          avgGuess: Math.round((avgGuess + 1) * 10) / 10,
          minLabel: q.minLabel,
          maxLabel: q.maxLabel,
        };
      }
      return {
        type: 'mc',
        prompt: q.prompt,
        makerAnswer: q.options[quiz.answers[i]],
        percentCorrect: pct,
      };
    };

    // No right/wrong for these — just the maker's own answer next to
    // what guessers actually said, as a conversation starter.
    const describeTopic = (i) => {
      const q = QUESTIONS[quiz.question_ids[i]];
      if (q.type === 'scale') {
        const avgGuess =
          attempts.reduce((sum, a) => sum + a.guesses[i], 0) / attempts.length;
        return {
          type: 'scale',
          prompt: q.prompt,
          makerAnswer: `${quiz.answers[i] + 1}/5`,
          avgGuess: Math.round((avgGuess + 1) * 10) / 10,
          minLabel: q.minLabel,
          maxLabel: q.maxLabel,
        };
      }
      const counts = {};
      attempts.forEach((a) => {
        counts[a.guesses[i]] = (counts[a.guesses[i]] || 0) + 1;
      });
      const topGuessIdx = Number(
        Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
      );
      return {
        type: 'mc',
        prompt: q.prompt,
        makerAnswer: q.options[quiz.answers[i]],
        topGuess: q.options[topGuessIdx],
      };
    };

    insights = {
      ratingScore,
      ratingLabel: labelFor(ratingScore),
      mostGuessed: hi !== undefined ? describe(hi) : null,
      leastGuessed: hi !== undefined && hi !== lo ? describe(lo) : null,
      talkingPoints: topicIdx.map(describeTopic),
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
    isPremium: quiz.is_premium,
    insights,
    insightsLocked,
  });
}
