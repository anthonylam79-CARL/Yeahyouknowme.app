'use client';
import { useState } from 'react';

export default function AIReport({ id, token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('summary');
  async function load() {
    setLoading(true); setError('');
    try {
      const res = await fetch(`/api/results/${id}/ai`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Could not load recap');
      setData(result);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }
  return <section className="paywall" aria-label="AI quiz recap">
    <h2 style={{ marginTop: 0 }}>Turn your results into a conversation</h2>
    <p>A personal recap, questions to ask them, and ideas for your next quiz.</p>
    {!data && <><p className="note">When you request a recap, anonymous answer counts are sent to our AI provider. Names, emails and access links are excluded.</p><button className="btn" disabled={loading} onClick={load}>{loading ? 'Reading your results…' : 'Explore my AI recap'}</button></>}
    <div aria-live="polite">{error && <p className="note">{error}</p>}</div>
    {data && <>
      <p className="note">AI-generated · Based on {data.basedOn} {data.basedOn === 1 ? 'response' : 'responses'}. {data.basedOn < 3 ? 'An early snapshot, not a group pattern.' : 'Quiz answers are conversation starters, not a personality assessment.'} {data.pendingRefresh && 'New answers will appear after the next refresh.'}</p>
      <div className="choices" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {[['summary', 'My recap'], ['explanation', 'Explain this'], ['conversationStarters', 'What should I ask them?'], ['nextQuestions', 'Ideas for round two']].map(([key, label]) => <button key={key} className="btn alt" aria-pressed={tab === key} onClick={() => setTab(key)}>{label}</button>)}
      </div>
      <div aria-live="polite">{Array.isArray(data.report[tab]) ? <ul>{data.report[tab].map((text, i) => <li key={i}>{text}</li>)}</ul> : <p>{data.report[tab]}</p>}</div>
    </>}
  </section>;
}
