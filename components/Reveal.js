'use client';

import { useEffect, useState } from 'react';
import { formatScore } from '@/lib/format';
import { verdictFor } from '@/lib/verdict';

// The guesser's payoff, in two parts: <Stage> (the animated verdict) and
// <Receipt> (the tick/cross list). They only use what the attempts API
// already returns — per-question hit/miss and the score. The maker's
// actual answers are never sent to a guesser, so a miss shows *which*
// question you missed, never what the answer was.
//
// Sequence, once, on mount: one dot per scored question fills in, the score
// counts up, then the verdict stamps down. Under prefers-reduced-motion the
// final state is shown immediately.

function reducedMotion() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function useCountUp(target, delayMs, durationMs, animate) {
  const [value, setValue] = useState(animate ? 0 : target);
  useEffect(() => {
    if (!animate) {
      setValue(target);
      return undefined;
    }
    let raf;
    const start = performance.now() + delayMs;
    const tick = (now) => {
      if (now < start) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const p = Math.min(1, (now - start) / durationMs);
      setValue(target * (1 - Math.pow(1 - p, 3))); // ease-out
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, delayMs, durationMs, animate]);
  return value;
}

// Scored questions only — unscored "talking point" questions have no
// right answer, so they never get a tick or a cross.
function scoredItems(questions, hits) {
  return questions
    .map((q, i) => ({ q, i, hit: Boolean(hits?.[i]) }))
    .filter((x) => !x.q.topic);
}

function rankLine(rank, outOf) {
  if (outOf <= 1) return 'First one to try it';
  if (rank === 1) return `#1 of ${outOf} so far 👑`;
  return `#${rank} of ${outOf} so far`;
}

export function Stage({ makerName, questions, hits, score, total, rank, outOf }) {
  const [animate] = useState(() => !reducedMotion());
  const items = scoredItems(questions, hits);
  const verdict = verdictFor(score, total, makerName);

  const step = Math.min(110, 1200 / Math.max(items.length, 1)); // ms per dot
  const countDelay = items.length * step + 100;
  const countDuration = 900;
  const stampDelay = (countDelay + countDuration) / 1000;

  const counted = useCountUp(score, countDelay, countDuration, animate);
  const shown = Number.isInteger(score) ? String(Math.round(counted)) : counted.toFixed(1);

  return (
    <section className="stage" style={{ '--stamp-d': `${stampDelay}s` }}>
      <span className="stage-vs">You vs {makerName}</span>
      <div className="dots" aria-hidden="true">
        {items.map(({ i, hit }, k) => (
          <span
            key={i}
            className={'dot' + (hit ? ' hit' : '')}
            style={{ '--d': `${((k * step) / 1000).toFixed(3)}s` }}
          />
        ))}
      </div>
      <span className="stage-num" aria-hidden="true">
        {shown}
        <span>/{total}</span>
      </span>
      <div className="stamp" aria-hidden="true">
        {verdict.title}
      </div>
      <p className="stage-line stage-late">{verdict.line}</p>
      <p className="stage-rank stage-late">{rankLine(rank, outOf)}</p>
      <p className="sr-only">
        You scored {formatScore(score)} out of {total}. {verdict.title}.
      </p>
    </section>
  );
}

export function Receipt({ questions, hits }) {
  const items = scoredItems(questions, hits);
  if (items.length === 0) return null;
  return (
    <details className="receipt" open>
      <summary>What you got right and wrong</summary>
      {items.map(({ q, i, hit }) => (
        <div key={i} className={'receipt-row ' + (hit ? 'hit' : 'missed')}>
          <i aria-hidden="true">{hit ? '✓' : '✗'}</i>
          <span>
            <span className="sr-only">{hit ? 'Right: ' : 'Missed: '}</span>
            {q.prompt}
          </span>
        </div>
      ))}
    </details>
  );
}
