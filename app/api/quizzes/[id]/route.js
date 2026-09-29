import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { QUESTIONS } from '@/lib/questions';

// GET /api/quizzes/:id — what a guesser needs to play. Deliberately never
// selects `answers` or `owner_token_hash`, even though we're using the
// service-role client (which could read everything) — the column list here
// is the actual safety boundary, so keep it explicit rather than `select('*')`.
export async function GET(_request, { params }) {
  const { id } = await params;
  const db = supabaseAdmin();

  const { data, error } = await db
    .from('quizzes')
    .select('id, maker_name, audience, question_ids, created_at')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('quiz fetch failed', error);
    return NextResponse.json({ error: 'Could not load quiz' }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
  }

  const questions = data.question_ids.map((qid) => QUESTIONS[qid]);

  return NextResponse.json({
    id: data.id,
    makerName: data.maker_name,
    audience: data.audience,
    questions, // [{ prompt, options: [4 strings] }], no correct answer included
    length: questions.length,
  });
}
