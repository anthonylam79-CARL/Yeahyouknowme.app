import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendEmail } from '@/lib/resend';
import { isEligibleQuiz, isFirstAfterQuiet, buildAttemptEmail, signUnsubscribe } from '@/lib/notify';

// Runs after the guesser's response has been sent (see `after()` in the
// attempts route). Never throws: a notification problem must not affect
// anyone's quiz. Fails closed — if the notify_on_attempt column doesn't exist
// yet (migration not run), the select errors and nothing is sent.
export async function notifyMakerOfAttempt({ quizId, attemptId, guesserName, score, total, origin }) {
  const db = supabaseAdmin();
  async function record(status, details = {}) {
    try { await db.from('attempts').update({ notification_status: status, ...details }).eq('id', attemptId).eq('quiz_id', quizId); } catch { console.error('Could not record notification status'); }
  }
  try {
    const { data: quiz, error } = await db
      .from('quizzes')
      .select('maker_name, maker_email, notify_on_attempt, created_at')
      .eq('id', quizId)
      .maybeSingle();
    if (error) {
      console.warn('notify skipped (run the notify migration?):', error.message);
      await record('failed', { notification_error: 'quiz_lookup_failed' });
      return;
    }
    if (!quiz || !quiz.maker_email || quiz.notify_on_attempt !== true) { await record('skipped'); return; }
    if (!isEligibleQuiz(quiz.created_at)) { await record('skipped'); return; }
    if (!signUnsubscribe(quizId)) {
      console.warn('notify skipped: no NOTIFY_SECRET / service key to sign stop links');
      return;
    }

    const { data: rows, error: rowsError } = await db
      .from('attempts')
      .select('id, created_at, guesser_name, score')
      .eq('quiz_id', quizId);
    if (rowsError || !rows) return;
    if (!isFirstAfterQuiet(rows, attemptId)) { await record('skipped'); return; }

    const mail = buildAttemptEmail({
      origin,
      quizId,
      makerName: quiz.maker_name,
      guesserName,
      score,
      total,
      attemptRows: rows,
    });
    const sent = await sendEmail({ to: quiz.maker_email, idempotencyKey: `attempt-${attemptId}`, ...mail });
    await record(sent.skipped ? 'failed' : 'accepted', { notification_provider_id: sent.id || null, notification_error: sent.skipped ? 'email_provider_not_configured' : null });
  } catch (err) {
    await record('failed', { notification_error: String(err.message || 'email_send_failed').slice(0,500) });
    console.error('attempt notification failed');
  }
}
