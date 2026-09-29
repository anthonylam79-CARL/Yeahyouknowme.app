'use client';

import { poolFor } from './questions';

const SEEN_KEY = 'yyk_seen';

function seenGet() {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) || '[]');
  } catch {
    return [];
  }
}

function seenAdd(ids) {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify([...new Set([...seenGet(), ...ids])]));
  } catch {
    /* best effort */
  }
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Picks `n` question ids for a new quiz, preferring ones this browser
// hasn't seen before (mirrors the prototype's repetition-avoidance).
export function pickQuestionIds(audience, category, n) {
  const base = poolFor(audience, category);
  const seen = seenGet();
  const fresh = shuffle(base.filter((id) => !seen.includes(id)));

  let out = fresh.slice(0, n);
  if (out.length < n) {
    out = out.concat(shuffle(base.filter((id) => !out.includes(id))).slice(0, n - out.length));
  }
  seenAdd(out);
  return out;
}

export function markSeen(ids) {
  seenAdd(ids);
}
