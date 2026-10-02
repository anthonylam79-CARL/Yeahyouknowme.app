'use client';

import { useEffect, useState } from 'react';

// When a quiz is created, the owner token gets saved to this device's
// localStorage as `yyk_owner_<id>` (see app/page.js) — purely so a return
// visit on the SAME device/browser can skip the whole "type your email,
// check your inbox, click the link" round trip entirely. We still have to
// validate each one against the API rather than trusting localStorage
// blindly: the token may be stale (an email recovery since then rotates
// it server-side and invalidates the old one), or the quiz may have been
// deleted, so a plain 401/404 from a bad local token just gets dropped
// from the list rather than shown as an error.
const OWNER_KEY_PREFIX = 'yyk_owner_';

function readLocalQuizzes() {
  if (typeof localStorage === 'undefined') return [];
  const found = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(OWNER_KEY_PREFIX)) {
      found.push({ id: key.slice(OWNER_KEY_PREFIX.length), token: localStorage.getItem(key) });
    }
  }
  return found;
}

export default function RecoverPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | done
  const [localQuizzes, setLocalQuizzes] = useState(null); // null = still checking

  useEffect(() => {
    const candidates = readLocalQuizzes();
    if (candidates.length === 0) {
      setLocalQuizzes([]);
      return;
    }
    Promise.all(
      candidates.map(({ id, token }) =>
        fetch(`/api/results/${id}?token=${encodeURIComponent(token)}`)
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => (data ? { id, token, makerName: data.makerName, createdAt: data.createdAt } : null))
          .catch(() => null)
      )
    ).then((results) => setLocalQuizzes(results.filter(Boolean)));
  }, []);

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

      {localQuizzes && localQuizzes.length > 0 && (
        <>
          <p>Found on this device — no email needed:</p>
          {localQuizzes.map((q) => (
            <a
              key={q.id}
              className="btn alt"
              style={{ display: 'block', marginBottom: 10 }}
              href={`/results/${q.id}?token=${encodeURIComponent(q.token)}`}
            >
              {q.makerName}'s quiz — {new Date(q.createdAt).toLocaleDateString()}
            </a>
          ))}
          <div className="sep" />
          <p className="note" style={{ marginBottom: 16 }}>
            Not it, or made one on a different device? Get a link by email instead:
          </p>
        </>
      )}

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
