import { createHmac, timingSafeEqual } from 'node:crypto';
import { escapeHtml, cleanName } from '@/lib/text';
import { formatScore } from '@/lib/format';

// "Someone took your quiz" emails.
//
// Rules, in one place:
//  - Only quizzes created on/after NOTIFY_FROM are eligible, so nobody who
//    signed up before this feature existed (and only agreed to a link-recovery
//    email) starts getting mail.
//  - At most one email per burst: we send for an attempt only if no other
//    attempt landed in the 30 minutes before it. A quiz that goes viral sends
//    one email per quiet-gap, not one per guesser.
//  - Every email carries a one-click stop link (also List-Unsubscribe).

export const NOTIFY_FROM = new Date(process.env.NOTIFY_FROM || '2026-10-06T00:00:00Z');
export const QUIET_WINDOW_MS = 30 * 60 * 1000;

export function isEligibleQuiz(quizCreatedAt) {
  const t = new Date(quizCreatedAt).getTime();
  return Number.isFinite(t) && t >= NOTIFY_FROM.getTime();
}

// attempts: [{ id, created_at }, ...] including the new one.
export function isFirstAfterQuiet(attempts, attemptId, windowMs = QUIET_WINDOW_MS) {
  const me = attempts.find((a) => a.id === attemptId);
  if (!me) return false;
  const mine = new Date(me.created_at).getTime();
  return !attempts.some((a) => {
    if (a.id === attemptId) return false;
    const t = new Date(a.created_at).getTime();
    return t <= mine && mine - t < windowMs;
  });
}

function secret() {
  return process.env.NOTIFY_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
}

export function signUnsubscribe(quizId) {
  const key = secret();
  if (!key) return null;
  return createHmac('sha256', key).update(`unsub:${quizId}`).digest('hex').slice(0, 32);
}

export function verifyUnsubscribe(quizId, sig) {
  const expected = signUnsubscribe(quizId);
  if (!expected || typeof sig !== 'string' || sig.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
}

// attemptRows: [{ guesser_name, score }] for all attempts on the quiz.
export function buildAttemptEmail({ origin, quizId, makerName, guesserName, score, total, attemptRows }) {
  const maker = cleanName(makerName);
  const guesser = cleanName(guesserName) || 'Someone';
  const sig = signUnsubscribe(quizId);
  const stopUrl = `${origin}/unsubscribe?q=${encodeURIComponent(quizId)}&s=${sig}`;
  const postUrl = `${origin}/api/unsubscribe?q=${encodeURIComponent(quizId)}&s=${sig}`;

  const count = attemptRows.length;
  const top = [...attemptRows].sort((a, b) => b.score - a.score)[0];
  const scoreText = `${formatScore(score)}/${total}`;

  const others =
    count > 1
      ? `<p>${count} people have taken it so far. Top score: ${escapeHtml(cleanName(top.guesser_name))} with ${formatScore(top.score)}/${total}.</p>`
      : `<p>First one in!</p>`;

  const html = `
    <p><strong>${escapeHtml(guesser)}</strong> just took your quiz and got <strong>${escapeHtml(scoreText)}</strong>.</p>
    ${others}
    <p>To see everyone's scores, open the private results link from your "quiz is ready" email.
      Can't find it? <a href="${escapeHtml(origin)}/recover">Get a fresh one</a> (it replaces the old link).</p>
    <p style="color:#777;font-size:12px">You're getting this because you added your email when you made your quiz.
      We send at most one of these per burst of activity.
      <a href="${escapeHtml(stopUrl)}">Stop these emails</a>.</p>
  `;

  return {
    subject: `${guesser} took your quiz: ${scoreText}`,
    html,
    headers: {
      'List-Unsubscribe': `<${postUrl}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  };
}
