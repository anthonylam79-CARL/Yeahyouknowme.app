import { NextResponse } from 'next/server';
import { generateText, Output } from 'ai';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { hashToken } from '@/lib/ids';
import { reportEvidence, evidenceFingerprint, reportSchema, REPORT_SYSTEM } from '@/lib/aiReport';

export const maxDuration = 60;
const reply = (body, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
export async function POST(request, { params }) {
  let body;
  try { body = await request.json(); } catch { return reply({ error: 'Invalid request' }, 400); }
  if (typeof body.token !== 'string' || body.token.length > 128) return reply({ error: 'Missing access token' }, 401);
  const { id } = await params;
  const db = supabaseAdmin();
  const { data: quiz, error } = await db.from('quizzes').select('id,audience,question_ids,answers,owner_token_hash,is_premium').eq('id', id).maybeSingle();
  if (error) return reply({ error: 'Could not load quiz' }, 503);
  if (!quiz || hashToken(body.token) !== quiz.owner_token_hash) return reply({ error: 'Invalid results link' }, 403);
  if (!quiz.is_premium) return reply({ error: 'Unlock your full report first' }, 402);
  if (process.env.AI_REPORTS_ENABLED !== 'true') return reply({ error: 'AI recaps are not available yet. Your full quiz results are still available below.' }, 503);
  const { data: attempts, error: attemptsError } = await db.from('attempts').select('guesses').eq('quiz_id', id);
  if (attemptsError) return reply({ error: 'Could not load answers' }, 503);
  if (!attempts.length) return reply({ error: 'Send your quiz to someone first' }, 409);
  const evidence = reportEvidence(quiz, attempts);
  const fingerprint = evidenceFingerprint(evidence);
  const { data: saved, error: cacheError } = await db.from('ai_quiz_reports').select('fingerprint,report,based_on').eq('quiz_id', id).maybeSingle();
  if (cacheError) return reply({ error: 'AI recap storage is unavailable. Your quiz results are unaffected.' }, 503);
  const cached = saved?.report && reportSchema.safeParse(saved.report).success;
  if (cached && saved.fingerprint === fingerprint) return reply({ report: saved.report, basedOn: saved.based_on });
  // Reserve before sending any paid request. Concurrent requests cannot reserve the same quiz.
  const { data: claimed, error: claimError } = await db.rpc('reserve_ai_quiz_report', { p_quiz_id: id, p_fingerprint: fingerprint });
  if (claimError || !claimed) {
    if (cached) return reply({ report: saved.report, basedOn: saved.based_on, pendingRefresh: true });
    return reply({ error: 'Your AI recap is being prepared or the usage limit has been reached. Try again later.' }, 429);
  }
  try {
    const prompt = JSON.stringify(evidence);
    if (prompt.length > 22000) throw new Error('Evidence too large');
    const result = await generateText({
      model: process.env.AI_GATEWAY_MODEL || 'openai/gpt-5-mini',
      system: REPORT_SYSTEM, prompt, maxOutputTokens: 2000, reasoning: 'minimal', maxRetries: 0,
      abortSignal: AbortSignal.timeout(45000),
      output: Output.object({ schema: reportSchema }),
    });
    const report = reportSchema.parse(result.output);
    const { error: saveError } = await db.from('ai_quiz_reports').update({ report, based_on: attempts.length }).eq('quiz_id', id).eq('fingerprint', fingerprint);
    if (saveError) throw new Error('Save failed');
    return reply({ report, basedOn: attempts.length });
  } catch {
    // Never log quiz evidence, tokens, or raw provider responses.
    if (cached) return reply({ report: saved.report, basedOn: saved.based_on, pendingRefresh: true });
    return reply({ error: 'The AI recap is temporarily unavailable. Your full quiz results are still available below.' }, 503);
  }
}
