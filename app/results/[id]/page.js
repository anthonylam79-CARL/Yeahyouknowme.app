'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

export default function ResultsPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [phase, setPhase] = useState('loading'); // loading | denied | ready
  const [data, setData] = useState(null);

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

  if (phase === 'loading') return <p>Loading…</p>;

  if (phase === 'denied') {
    return (
      <>
        <h1>Can't show this</h1>
        <p>
          This link is either missing its access token or it's wrong. Use the exact results link
          you got when you made the quiz.
        </p>
      </>
    );
  }

  const { makerName, attempts, insights } = data;

  return (
    <>
      <h1>Who knows {makerName} best</h1>

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
          </p>
          {insights.leastGuessed && (
            <p>
              <strong>What people get wrong:</strong> "{insights.leastGuessed.prompt}" — only{' '}
              {insights.leastGuessed.percentCorrect}% got "{insights.leastGuessed.makerAnswer}" right.
            </p>
          )}
        </>
      ) : (
        <p>Nobody's taken your quiz yet. Share the link to get your first result.</p>
      )}

      <div className="sep" />

      {attempts.length > 0 && (
        <>
          <h2>Ranking</h2>
          {attempts.map((a, k) => (
            <p key={k} className="miss">
              {k + 1}. {a.name} · {a.score}/{data.length}
              {k === 0 ? ' 👑 knows you best' : ''}
            </p>
          ))}
        </>
      )}
    </>
  );
}
