'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ShareRow from '@/components/ShareRow';
import { pickTakerCaption } from '@/lib/captions';

const AGE_BRACKETS = ['13-17', '18-24', '25-34', '35-44', '45+'];
const GENDERS = ['Woman', 'Man', 'Nonbinary', 'Prefer not to say'];

export default function PlayPage() {
  const { id } = useParams();
  const [phase, setPhase] = useState('loading'); // loading | notfound | intro | quiz | checking | result
  const [quiz, setQuiz] = useState(null);
  const [me, setMe] = useState('');
  const [i, setI] = useState(0);
  const [guesses, setGuesses] = useState([]);
  const [picked, setPicked] = useState(null); // index just clicked, for feedback
  const [attemptResult, setAttemptResult] = useState(null);
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

  async function pick(optionIndex) {
    // Selecting again before hitting Next just changes the pick.
    setPicked(optionIndex);
    const next = [...guesses];
    next[i] = optionIndex;
    setGuesses(next);
  }

  function next() {
    if (i + 1 < quiz.questions.length) {
      setI(i + 1);
      setPicked(null);
    } else {
      submit(guesses);
    }
  }

  async function submit(finalGuesses) {
    setPhase('checking');
    const res = await fetch(`/api/quizzes/${id}/attempts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guesserName: me, guesses: finalGuesses, ageBracket: null, gender: null }),
    });
    const data = await res.json();
    setTimeout(() => {
      setAttemptResult(data);
      setPhase('result');
    }, 1000);
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

  if (phase === 'loading') return <p>Loading…</p>;
  if (phase === 'notfound') {
    return (
      <>
        <h1>Can't find that quiz</h1>
        <p>The link might be wrong, or the quiz was deleted.</p>
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
        />
        <button
          className="btn"
          onClick={() => me.trim() && setPhase('quiz')}
        >
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
        {q.options.map((opt, k) => (
          <button
            key={k}
            className={'opt' + (picked === k ? ' ok' : '')}
            onClick={() => pick(k)}
          >
            {opt}
          </button>
        ))}
        {picked !== null && (
          <button className="btn" onClick={next}>
            {i + 1 < quiz.questions.length ? 'Next' : 'See my score'}
          </button>
        )}
      </>
    );
  }

  if (phase === 'checking') {
    return <h1>Checking your answers…</h1>;
  }

  // result
  const link = typeof window !== 'undefined' ? window.location.href : '';
  const post = pickTakerCaption({
    makerName: quiz.makerName,
    score: attemptResult.score,
    total: attemptResult.total,
    rank: attemptResult.rank,
  });

  return (
    <>
      <div className="score">
        <span>You vs {quiz.makerName}</span>
        <b>
          {attemptResult.score}/{attemptResult.total}
        </b>
        <span>Rank #{attemptResult.rank} of {attemptResult.outOf}</span>
      </div>

      <ShareRow text={post} link={link} />

      <div className="sep" />

      <h2>See where you rank</h2>
      <p>Optional — compare your score to other guessers.</p>
      <small>Age</small>
      <div className="chips">
        {AGE_BRACKETS.map((a) => (
          <button
            key={a}
            className={'chip' + (a === ageBracket ? ' on' : '')}
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
