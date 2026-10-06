import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendEmail } from '@/lib/resend';
import { isEligibleQuiz, isFirstAfterQuiet, buildAttemptEmail, signUnsubscribe } from '@/lib/notify';

// Runs after the guesser's response has been sent (see `after()` in the
// attempts route). Never throws: a notification problem must not affect
// anyone's quiz. Fails closed — if the notify_on_attempt column doesn't exist
// yet (migration not run), the select errors and nothing is sent.
export async function notifyMakerOfAttempt({ quizId, attemptId, guesserName, score, total, origin }) {
  try {
    const db = supabaseAdmin();
    const { data: quiz, error } = await db
      .from('quizzes')
      .select('maker_name, maker_email, notify_on_attempt, created_at')
      .eq('id', quizId)
      .maybeSingle();
    if (error) {
      console.warn('notify skipped (run the notify migration?):', error.message);
      return;
    }
    if (!quiz || !quiz.maker_email || quiz.notify_on_attempt !== true) return;
    if (!isEligibleQuiz(quiz.created_at)) return;
    if (!signUnsubscribe(quizId)) {
      console.warn('notify skipped: no NOTIFY_SECRET / service key to sign stop links');
      return;
    }

    const { data: rows, error: rowsError } = await db
      .from('attempts')
      .select('id, created_at, guesser_name, score')
      .eq('quiz_id', quizId);
    if (rowsError || !rows) return;
    if (!isFirstAfterQuiet(rows, attemptId)) return;

    const mail = buildAttemptEmail({
      origin,
      quizId,
      makerName: quiz.maker_name,
      guesserName,
      score,
      total,
      attemptRows: rows,
    });
    await sendEmail({ to: quiz.maker_email, ...mail });
  } catch (err) {
    console.error('attempt notification failed', err);
  }
}
