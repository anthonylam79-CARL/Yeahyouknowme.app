'use client';

import { useState } from 'react';

export default function RecoverPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | done

  async function submit(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('sending');
    try {
      await fetch('/api/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
    } catch {
      /* still show the generic done state — never reveal failures here */
    }
    setStatus('done');
  }

  if (status === 'done') {
    return (
      <>
        <h1>Check your inbox</h1>
        <p>
          If that email made any quizzes, we just sent fresh results links to it. Any older
          links for those quizzes stopped working, so use the new ones.
        </p>
        <a className="btn" href="/">
          Back home
        </a>
      </>
    );
  }

  return (
    <>
      <h1>Lost your results link?</h1>
      <p>
        Enter the email you used when you made the quiz, and we'll send you a fresh link to see
        your results.
      </p>
      <form onSubmit={submit}>
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="btn" type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : 'Send my link'}
        </button>
      </form>
      <p className="note">
        Didn't give an email when you made your quiz? There's no way to recover it, sorry —
        you'll need to make a new one and save the link this time.
      </p>
    </>
  );
}
