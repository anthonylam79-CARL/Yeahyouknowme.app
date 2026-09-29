'use client';

import { useMemo, useState } from 'react';
import { AUDIENCES, QUESTIONS } from '@/lib/questions';
import { pickQuestionIds } from '@/lib/pick';
import ShareRow from '@/components/ShareRow';

const LENGTHS = { Quick: 10, Standard: 15, Deep: 20 };

export default function HomePage() {
  const [step, setStep] = useState('setup'); // setup | answer | done | saving | error
  const [audience, setAudience] = useState('Partner');
  const [category, setCategory] = useState('Mix it up');
  const [length, setLength] = useState('Standard');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [questionIds, setQuestionIds] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [i, setI] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const categories = AUDIENCES[audience];

  function start() {
    if (!name.trim()) return;
    const ids = pickQuestionIds(audience, category, LENGTHS[length]);
    setQuestionIds(ids);
    setAnswers([]);
    setI(0);
    setStep('answer');
  }

  function swap() {
    const ids = pickQuestionIds(audience, category, LENGTHS[length]);
    // keep already-answered ones, replace the current and remaining
    const next = questionIds.slice(0, i).concat(ids.filter((id) => !questionIds.slice(0, i).includes(id)));
    setQuestionIds(next.slice(0, LENGTHS[length]));
  }

  async function pick(optionIndex) {
    const next = [...answers];
    next[i] = optionIndex;
    setAnswers(next);
    if (i + 1 < questionIds.length) {
      setI(i + 1);
    } else {
      await submit(next);
    }
  }

  async function submit(finalAnswers) {
    setStep('saving');
    setError('');
    try {
      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          makerName: name.trim(),
          audience,
          questionIds,
          answers: finalAnswers,
          email: email.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setResult(data);
      try {
        localStorage.setItem(`yyk_owner_${data.id}`, data.ownerToken);
      } catch {}
      setStep('done');
    } catch (err) {
      setError(err.message);
      setStep('error');
    }
  }

  if (step === 'setup') {
    return (
      <>
        <h1>How well do they really know you?</h1>
        <p>Answer about yourself. Send the link. They guess. Everyone sees the score.</p>

        <small>Who is it for?</small>
        <div className="chips">
          {Object.keys(AUDIENCES).map((a) => (
            <button
              key={a}
              className={'chip' + (a === audience ? ' on' : '')}
              onClick={() => {
                setAudience(a);
                setCategory('Mix it up');
              }}
            >
              {a}
            </button>
          ))}
        </div>

        <small>Pick a vibe</small>
        <div className="chips">
          {categories.map((c) => (
            <button
              key={c}
              className={'chip' + (c === category ? ' on' : '')}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <small>How deep?</small>
        <div className="chips">
          {Object.keys(LENGTHS).map((l) => (
            <button
              key={l}
              className={'chip' + (l === length ? ' on' : '')}
              onClick={() => setLength(l)}
            >
              {l}
            </button>
          ))}
        </div>

        <input
          placeholder="Your first name"
          maxLength={30}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email (optional, so you can recover your results link later)"
          maxLength={200}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="btn" onClick={start}>
          Make my quiz
        </button>
      </>
    );
  }

  if (step === 'answer') {
    const q = QUESTIONS[questionIds[i]];
    return (
      <>
        <div className="bar">
          <i style={{ width: `${(i / questionIds.length) * 100}%` }} />
        </div>
        <small>Answer about yourself</small>
        <h2>{q.prompt}</h2>
        {q.options.map((opt, k) => (
          <button key={k} className="opt" onClick={() => pick(k)}>
            {opt}
          </button>
        ))}
        <button className="btn alt" onClick={swap}>
          Swap this question
        </button>
      </>
    );
  }

  if (step === 'saving') {
    return <h1>Saving your quiz…</h1>;
  }

  if (step === 'error') {
    return (
      <>
        <h1>Something went wrong</h1>
        <p className="error">{error}</p>
        <button className="btn" onClick={() => setStep('setup')}>
          Try again
        </button>
      </>
    );
  }

  // done
  const link = `${typeof window !== 'undefined' ? window.location.origin : ''}/q/${result.id}`;
  const resultsLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/results/${result.id}?token=${result.ownerToken}`;
  const post = "Think you know me? Let's see who actually does 👇";

  return (
    <>
      <h1>Your quiz is ready</h1>
      <p>Let people prove it — post the link and tag the ones who think they know you.</p>
      <input readOnly value={link} onFocus={(e) => e.target.select()} />
      <ShareRow text={post} link={link} />
      <div className="sep" />
      <p>
        Your private results page (bookmark this — it's the only way back in):
      </p>
      <input readOnly value={resultsLink} onFocus={(e) => e.target.select()} />
      <a className="btn alt" href={resultsLink}>
        See my results
      </a>
      {!email.trim() && (
        <p className="note">
          You didn't give an email, so if you lose this link there's no way to get it back —
          bookmark it now.
        </p>
      )}
    </>
  );
}
