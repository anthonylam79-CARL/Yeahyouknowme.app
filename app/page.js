'use client';

import { useMemo, useState } from 'react';
import { AUDIENCES, QUESTIONS } from '@/lib/questions';
import { pickQuestionIds, swapQuestionId } from '@/lib/pick';
import ShareRow from '@/components/ShareRow';
import ScaleInput from '@/components/ScaleInput';
import Hero from '@/components/Hero';
import { pickMakerCaption } from '@/lib/captions';

const LENGTHS = { Quick: 10, Standard: 15, Deep: 20 };
const AUDIENCE_EMOJI = { Partner: '💕', BFF: '👯', Fam: '🏠' };

export default function HomePage() {
  const [step, setStep] = useState('setup'); // setup | answer | done | saving | error
  const [audience, setAudience] = useState('Partner');
  // No category picker in the UI anymore — every quiz mixes across all of
  // an audience's categories. `poolFor`/`CATEGORIES` still exist in
  // lib/questions.js (they're how "Mix it up" is built, and how
  // Long distance/Flirty stay excluded from it), just nothing here lets
  // the person choose a narrower one.
  const category = 'Mix it up';
  const [length, setLength] = useState('Standard');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [questionIds, setQuestionIds] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [i, setI] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  function copyLink() {
    const url = `${window.location.origin}/q/${result.id}`;
    navigator.clipboard.writeText(url).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      },
      () => {} // the link is in the box above, selectable by hand
    );
  }

  function start() {
    if (!name.trim()) return;
    const ids = pickQuestionIds(audience, category, LENGTHS[length]);
    setQuestionIds(ids);
    setAnswers([]);
    setI(0);
    setStep('answer');
  }

  function swap() {
    // Replace only the question on screen with a similar one, so the quiz's
    // mix (including its personality questions) stays intact.
    setQuestionIds(swapQuestionId(audience, category, questionIds, i));
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
        <p>
          Answer about yourself. Send the link. They guess. Everyone sees the score, and you see how
          you rate yourself against how people actually see you.
        </p>

        <Hero />

        <a className="returning" href="/recover">
          Made a quiz before? <span>Find your results</span>
        </a>

        <small>Who is it for?</small>
        <div className="chips">
          {Object.keys(AUDIENCES).map((a) => (
            <button
              key={a}
              className={'chip' + (a === audience ? ' on' : '')}
              aria-pressed={a === audience}
              onClick={() => setAudience(a)}
            >
              {AUDIENCE_EMOJI[a]} {a}
            </button>
          ))}
        </div>

        <small>How deep?</small>
        <div className="chips">
          {Object.keys(LENGTHS).map((l) => (
            <button
              key={l}
              className={'chip' + (l === length ? ' on' : '')}
              aria-pressed={l === length}
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
          placeholder="Email (optional, to recover your link)"
          maxLength={200}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="btn" onClick={start}>
          Make my quiz
        </button>

        <div className="sep" />
        <h2>More than a score</h2>
        <p>
          A few questions in every quiz come from personality psychology. When people take it, you
          get a report on how you come across, not just who got the most right.
        </p>
        <div className="feature">
          <strong>Your blind spots</strong>
          <p>Where the people who know you see you differently from how you see yourself.</p>
        </div>
        <div className="feature">
          <strong>Your tendencies</strong>
          <p>
            Curiosity, organization, social energy, warmth and emotional intensity, you versus
            them.
          </p>
        </div>
        <div className="feature">
          <strong>Closeness and conflict</strong>
          <p>How you handle space and disagreements, and how it reads from the outside.</p>
        </div>
        <div className="feature">
          <strong>Who knows you best</strong>
          <p>Broken down by area, so you can see who gets which side of you.</p>
        </div>
        <div className="paywall">
          <p className="note" style={{ marginTop: 0 }}>
            Example result
          </p>
          <p style={{ marginBottom: 8 }}>
            <strong>Blind spot.</strong> You said you bring a lot of energy into a room (5/5). The
            people who took your quiz guessed 3/5.
          </p>
          <p style={{ marginBottom: 0 }}>
            <strong>Steady on conflict.</strong> You said you work things out together, and so did
            everyone else.
          </p>
        </div>
        <p className="note">
          The score and ranking are free. The full report unlocks for $1.99 per quiz. It's a
          conversation starter built from a handful of questions, not a personality test.
        </p>
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
        {q.type === 'scale' ? (
          <ScaleInput minLabel={q.minLabel} maxLabel={q.maxLabel} selected={null} onSelect={pick} />
        ) : (
          q.options.map((opt, k) => (
            <button key={k} className="opt" onClick={() => pick(k)}>
              {opt}
            </button>
          ))
        )}
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
  const post = pickMakerCaption(name.trim() || 'me');

  return (
    <>
      <h1>Your quiz is ready</h1>
      <p>Let people prove it — post the link and tag the ones who think they know you.</p>
      <input readOnly value={link} onFocus={(e) => e.target.select()} aria-label="Your quiz link" />
      <button className="btn" onClick={copyLink}>
        {copied ? 'Copied' : 'Copy link'}
      </button>
      <ShareRow text={post} link={link} />
      <div className="sep" />
      <p>
        Your private results page
        {email.trim()
          ? " (bookmark it, or use the email you gave to recover it later):"
          : " (bookmark this — it's the only way back in):"}
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
