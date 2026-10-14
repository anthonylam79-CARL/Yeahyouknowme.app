'use client';

import { useState } from 'react';

export default function UnsubscribeButton({ q, s }) {
  const [state, setState] = useState('idle'); // idle | busy | done | error
  async function stop() {
    setState('busy');
    try {
      const res = await fetch(`/api/unsubscribe?q=${encodeURIComponent(q)}&s=${encodeURIComponent(s)}`, {
        method: 'POST',
      });
      setState(res.ok ? 'done' : 'error');
    } catch {
      setState('error');
    }
  }
  if (state === 'done') return <p>Done. You won't get "someone took your quiz" emails for this quiz.</p>;
  return (
    <>
      <button className="btn" onClick={stop} disabled={state === 'busy'}>
        {state === 'busy' ? 'Stopping…' : 'Stop these emails'}
      </button>
      {state === 'error' && <p className="error">That link didn't work. Try again.</p>}
    </>
  );
}
