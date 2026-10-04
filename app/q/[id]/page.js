'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import ShareRow from '@/components/ShareRow';
import ScaleInput from '@/components/ScaleInput';
import { Stage, Receipt } from '@/components/Reveal';
import { pickTakerCaption } from '@/lib/captions';

const AGE_BRACKETS = ['13-17', '18-24', '25-34', '35-44', '45+'];
const GENDERS = ['Woman', 'Man', 'Nonbinary', 'Prefer not to say'];

// How long a tapped answer stays "pressed in" before the next question.
const LOCK_IN_MS = 320;

function reducedMotion() {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function PlayPage() {
  const { id } = useParams();
  const [phase, setPhase] = useState('loading'); // loading | notfound | intro | quiz | checking | error | result
  const [quiz, setQuiz] = useState(null);
  const [me, setMe] = useState('');
  const [i, setI] = useState(0);
  const [guesses, setGuesses] = useState([]);
  const [picked, setPicked] = useState(null); // the tile shown as locked in
  const [locked, setLocked] = useState(false); // true for the beat between tap and next question
  const [attemptResult, setAttemptResult] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [cardBusy, setCardBusy] = useState(false);
  const [cardError, setCardError] = useState('');
  const [ageBracket, setAgeBracket] = useState('');
  const [gender, setGender] = useState('');
  const [percentile, setPercentile] = useState(null);

  useEffect(() => {
    fetch(`/api/quizzes/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        setQuiz(data);
        setPhase('intro');
      })
      .catch(() => setPhase('notfound'));
  }, [id]);

  // Picked once per result so the caption doesn't reshuffle on every re-render.
  const post = useMemo(
    () =>
      quiz && attemptResult
        ? pickTakerCaption({
            makerName: quiz.makerName,
            score: attemptResult.score,
            total: attemptResult.total,
            rank: attemptResult.rank,
          })
        : '',
    [quiz, attemptResult]
  );

  // One tap per question: lock the tile in, then move on.
  function pick(optionIndex) {
    if (locked) return;
    const next = [...guesses];
    next[i] = optionIndex;
    setGuesses(next);
    setPicked(optionIndex);
    setLocked(true);
    setTimeout(() => advance(next), reducedMotion() ? 0 : LOCK_IN_MS);
  }

  function advance(next) {
    setLocked(false);
    if (i + 1 < quiz.questions.length) {
      setI(i + 1);
      setPicked(next[i + 1] ?? null);
    } else {
      submit(next);
    }
  }

  function back() {
    if (locked || i === 0) return;
    setI(i - 1);
    setPicked(guesses[i - 1] ?? null);
  }

  async function submit(finalGuesses) {
    setPhase('checking');
    setSubmitError('');
    try {
      const res = await fetch(`/api/quizzes/${id}/attempts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guesserName: me, guesses: finalGuesses, ageBracket: null, gender: null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setAttemptResult(data);
      setPhase('result');
    } catch (err) {
      setSubmitError(err.message || 'Something went wrong');
      setPhase('error');
    }
  }

  async function checkPercentile() {
    if (!ageBracket || !gender) return;
    const res = await fetch('/api/percentile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quizLength: quiz.questions.length,
        ageBracket,
        gender,
        score: attemptResult.score,
      }),
    });
    setPercentile(await res.json());
  }

  // The result card is a PNG built by /api/card. On phones that can share
  // files it opens the share sheet (Stories, Messages, etc.); elsewhere it
  // downloads.
  async function shareCard() {
    setCardBusy(true);
    setCardError('');
    try {
      const qs = new URLSearchParams({
        m: quiz.makerName,
        g: me,
        s: String(attemptResult.score),
        t: String(attemptResult.total),
      });
      const res = await fetch(`/api/card?${qs}`);
      if (!res.ok) throw new Error('card failed');
      const blob = await res.blob();
      const file = new File([blob], 'yeah-you-know-me.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text: `${post} ${window.location.href}` });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'yeah-you-know-me.png';
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch (err) {
      if (err && err.name === 'AbortError') {
        /* closed the share sheet — not an error */
      } else {
        setCardError("Couldn't make your card. Try again in a moment.");
      }
    } finally {
      setCardBusy(false);
    }
  }

  if (phase === 'loading') return <p>Loading…</p>;
  if (phase === 'notfound') {
    return (
      <>
        <h1>Can't find that quiz</h1>
        <p>The link might be wrong, or the quiz was deleted.</p>
        <a className="btn" href="/">
          Make your own quiz
        </a>
      </>
    );
  }

  if (phase === 'intro') {
    return (
      <>
        <h1>{quiz.makerName} wants to see how well you know them</h1>
        <p>Guess their answers, then find out who knows them best.</p>
        <input
          placeholder="Your name"
          maxLength={30}
          value={me}
          onChange={(e) => setMe(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && me.trim() && setPhase('quiz')}
        />
        <button className="btn" onClick={() => me.trim() && setPhase('quiz')}>
          Start
        </button>
      </>
    );
  }

  if (phase === 'quiz') {
    const q = quiz.questions[i];
    return (
      <>
        <div className="bar">
          <i style={{ width: `${(i / quiz.questions.length) * 100}%` }} />
        </div>
        <small>Guess what {quiz.makerName} picked</small>
        <h2>{q.prompt}</h2>
        {q.type === 'scale' ? (
          <ScaleInput
            minLabel={q.minLabel}
            maxLabel={q.maxLabel}
            selected={picked}
            onSelect={pick}
            disabled={locked}
          />
        ) : (
          q.options.map((opt, k) => (
            <button
              key={k}
              className={'opt' + (picked === k ? ' picked' : '')}
              onClick={() => pick(k)}
              disabled={locked}
              aria-pressed={picked === k}
            >
              {opt}
            </button>
          ))
        )}
        {i > 0 && (
          <button className="link-btn" onClick={back} disabled={locked}>
            Back
          </button>
        )}
      </>
    );
  }

  if (phase === 'checking') {
    return <h1>Checking your answers…</h1>;
  }

  if (phase === 'error') {
    return (
      <>
        <h1>Couldn't save your guesses</h1>
        <p className="error">{submitError}</p>
        <button className="btn" onClick={() => submit(guesses)}>
          Try again
        </button>
      </>
    );
  }

  // result
  const link = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <>
      <Stage
        makerName={quiz.makerName}
        questions={quiz.questions}
        hits={attemptResult.hits}
        score={attemptResult.score}
        total={attemptResult.total}
        rank={attemptResult.rank}
        outOf={attemptResult.outOf}
      />

      <button className="btn" onClick={shareCard} disabled={cardBusy}>
        {cardBusy ? 'Making your card…' : 'Share my result card'}
      </button>
      {cardError && <p className="error">{cardError}</p>}
      <ShareRow text={post} link={link} />

      <div className="sep" />

      <Receipt questions={quiz.questions} hits={attemptResult.hits} />

      <div className="sep" />

      <h2>See where you rank</h2>
      <p>Optional — compare your score to other guessers.</p>
      <small>Age</small>
      <div className="chips">
        {AGE_BRACKETS.map((a) => (
          <button
            key={a}
            className={'chip' + (a === ageBracket ? ' on' : '')}
            aria-pressed={a === ageBracket}
            onClick={() => {
              setAgeBracket(a);
            }}
          >
            {a}
          </button>
        ))}
      </div>
      <small>Gender</small>
      <div className="chips">
        {GENDERS.map((g) => (
          <button
            key={g}
            className={'chip' + (g === gender ? ' on' : '')}
            aria-pressed={g === gender}
            onClick={() => {
              setGender(g);
            }}
          >
            {g}
          </button>
        ))}
      </div>
      {ageBracket && gender && !percentile && (
        <button className="btn alt" onClick={checkPercentile}>
          Show my rank
        </button>
      )}
      {percentile && percentile.available && (
        <p>
          You beat <b>{percentile.percentile}%</b> of {gender.toLowerCase()}s {ageBracket} who've
          taken a quiz this length. (Based on {percentile.basedOn} people.)
        </p>
      )}
      {percentile && !percentile.available && (
        <p className="note">
          Not enough people in that group yet ({percentile.basedOn} so far, need {percentile.minSample}) — check back later.
        </p>
      )}

      <div className="sep" />
      <a className="btn" href="/">
        Make my own quiz
      </a>
    </>
  );
}
