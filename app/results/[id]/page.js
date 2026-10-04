'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import ShareRow from '@/components/ShareRow';
import { formatScore } from '@/lib/format';
import { verdictFor } from '@/lib/verdict';
import { pickMakerCaption } from '@/lib/captions';

export default function ResultsPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [phase, setPhase] = useState('loading'); // loading | denied | ready
  const [data, setData] = useState(null);
  const [unlocking, setUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState('');
  const justUnlocked = searchParams.get('unlocked') === '1';

  useEffect(() => {
    if (!token) {
      setPhase('denied');
      return;
    }
    fetch(`/api/results/${id}?token=${encodeURIComponent(token)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        setData(d);
        setPhase('ready');
      })
      .catch(() => setPhase('denied'));
  }, [id, token]);

  async function unlock() {
    setUnlocking(true);
    setUnlockError('');
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId: id, token }),
      });
      const body = await res.json();
      if (!res.ok || !body.url) throw new Error(body.error || 'Could not start checkout');
      window.location.href = body.url;
    } catch (err) {
      setUnlockError(err.message || 'Something went wrong. Try again.');
      setUnlocking(false);
    }
  }

  if (phase === 'loading') return <p>Loading…</p>;

  if (phase === 'denied') {
    return (
      <>
        <h1>Can't show this</h1>
        <p>
          This link is either missing its access token or it's wrong. Use the exact results link
          you got when you made the quiz.
        </p>
        <a className="btn alt" href="/recover">
          Lost your link?
        </a>
      </>
    );
  }

  const { makerName, attempts, insights, insightsLocked } = data;
  const link = `${typeof window !== 'undefined' ? window.location.origin : ''}/q/${id}`;

  return (
    <>
      <h1>Who knows {makerName} best</h1>

      {justUnlocked && <p className="note">🎉 Unlocked! Your full insights are below.</p>}

      {attempts.length > 0 && (
        <>
          <ol className="board">
            {attempts.map((a, k) => (
              <li key={k} className={k === 0 ? 'top' : ''}>
                <span className="board-rank">{k + 1}</span>
                <span className="board-name">
                  {a.name}
                  <small>{verdictFor(a.score, data.total, makerName).title}</small>
                </span>
                <span className="board-score">
                  {formatScore(a.score)}/{data.total}
                </span>
              </li>
            ))}
          </ol>
          <div className="sep" />
        </>
      )}

      {insights ? (
        <>
          <div className="score">
            <span>Open-book rating</span>
            <b>{insights.ratingScore}</b>
            <span>{insights.ratingLabel}</span>
          </div>
          <p className="note">Based on {insights.basedOn} {insights.basedOn === 1 ? 'person' : 'people'}.</p>

          <p>
            <strong>What people get right:</strong> "{insights.mostGuessed.prompt}" —{' '}
            {insights.mostGuessed.percentCorrect}% guessed "{insights.mostGuessed.makerAnswer}" correctly.
            {insights.mostGuessed.type === 'scale' && (
              <> People guessed {insights.mostGuessed.avgGuess}/5 on average (leaning {insights.mostGuessed.avgGuess >= 3 ? insights.mostGuessed.maxLabel.toLowerCase() : insights.mostGuessed.minLabel.toLowerCase()}).</>
            )}
          </p>
          {insights.leastGuessed && (
            <p>
              <strong>What people get wrong:</strong> "{insights.leastGuessed.prompt}" — only{' '}
              {insights.leastGuessed.percentCorrect}% got "{insights.leastGuessed.makerAnswer}" right.
              {insights.leastGuessed.type === 'scale' && (
                <> People guessed {insights.leastGuessed.avgGuess}/5 on average (leaning {insights.leastGuessed.avgGuess >= 3 ? insights.leastGuessed.maxLabel.toLowerCase() : insights.leastGuessed.minLabel.toLowerCase()}).</>
              )}
            </p>
          )}

          {insights.talkingPoints && insights.talkingPoints.length > 0 && (
            <>
              <div className="sep" />
              <h2>Talk about this</h2>
              <p className="note">Not right-or-wrong — just how you see yourself vs. how you come across.</p>
              {insights.talkingPoints.map((tp, k) => (
                <p key={k}>
                  <strong>"{tp.prompt}"</strong> — you said "{tp.makerAnswer}".
                  {tp.type === 'scale' ? (
                    <> People guessed {tp.avgGuess}/5 on average (leaning {tp.avgGuess >= 3 ? tp.maxLabel.toLowerCase() : tp.minLabel.toLowerCase()}).</>
                  ) : (
                    <> Most people guessed "{tp.topGuess}".</>
                  )}
                </p>
              ))}
            </>
          )}
        </>
      ) : insightsLocked ? (
        <div className="paywall">
          <p>
            <strong>Your full insights are ready</strong> — open-book rating, what people get right, and
            what trips them up.
          </p>
          <button className="btn" onClick={unlock} disabled={unlocking}>
            {unlocking ? 'Redirecting…' : 'Unlock for $1.99'}
          </button>
          {unlockError && <p className="note">{unlockError}</p>}
        </div>
      ) : (
        <p>Nobody's taken your quiz yet. Share the link to get your first result.</p>
      )}

      <div className="sep" />

      <h2>Send it to more people</h2>
      <p className="note">Your quiz link — share it any time, this page doesn't change it:</p>
      <input readOnly value={link} onFocus={(e) => e.target.select()} aria-label="Your quiz link" />
      <ShareRow text={pickMakerCaption(makerName)} link={link} />

    </>
  );
}
