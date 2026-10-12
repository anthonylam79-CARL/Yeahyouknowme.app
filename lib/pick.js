'use client';

import { poolFor, psychPoolFor, QUESTIONS, isPsych, psychGroup } from './questions';

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

// Fresh (unseen) ids first, each half shuffled, so repeat quizzes from the
// same browser keep surfacing new questions.
function freshFirst(ids, seen) {
  return shuffle(ids.filter((id) => !seen.includes(id))).concat(
    shuffle(ids.filter((id) => seen.includes(id)))
  );
}

// How many psychology-backed questions a quiz of length n carries. Enough to
// give the maker's insights report real material, few enough that the rest of
// the quiz stays the fun, factual one people came for.
export function psychQuotaFor(n) {
  if (n >= 20) return 6;
  if (n >= 15) return 5;
  return 4;
}

const STYLE_GROUPS = ['attachment', 'conflict'];

// Chooses `k` psychology questions spread across `k` different areas (traits
// and styles), always including at least one scenario/style question so the
// closeness or conflict card has something to say.
function pickPsych(audience, k, seen) {
  const pool = psychPoolFor(audience);
  const groups = {};
  for (const id of pool) {
    const g = psychGroup(QUESTIONS[id]);
    (groups[g] = groups[g] || []).push(id);
  }
  let order = shuffle(Object.keys(groups)).slice(0, k);
  if (!order.some((g) => STYLE_GROUPS.includes(g)) && order.length > 0) {
    const style = shuffle(STYLE_GROUPS.filter((g) => groups[g]))[0];
    if (style) order[order.length - 1] = style;
  }
  const picked = order.map((g) => freshFirst(groups[g], seen)[0]);
  if (picked.length < k) {
    const rest = freshFirst(
      pool.filter((id) => !picked.includes(id)),
      seen
    );
    picked.push(...rest.slice(0, k - picked.length));
  }
  return picked;
}

// Picks `n` question ids for a new quiz, preferring ones this browser
// hasn't seen before (mirrors the prototype's repetition-avoidance). For the
// default "Mix it up" quiz, a fixed share are psychology-backed questions.
export function pickQuestionIds(audience, category, n) {
  const base = poolFor(audience, category);
  const seen = seenGet();

  let psych = [];
  if (category === 'Mix it up') {
    psych = pickPsych(audience, Math.min(psychQuotaFor(n), n), seen);
  }

  // Everything else comes from the regular pool, minus any psych-tagged
  // question (those are controlled by the quota above, so the mix stays put).
  const rest = freshFirst(
    base.filter((id) => !psych.includes(id) && !isPsych(QUESTIONS[id])),
    seen
  );
  let out = psych.concat(rest.slice(0, n - psych.length));
  if (out.length < n) {
    // Small pools (e.g. a niche category): top up with whatever is left.
    out = out.concat(shuffle(base.filter((id) => !out.includes(id))).slice(0, n - out.length));
  }
  out = shuffle(out);
  seenAdd(out);
  return out;
}

// Replaces just the question at `index` with a different one of the same
// kind (psychology-backed stays psychology-backed, ideally in the same area,
// so the quiz never loses its mix). Returns a new ids array.
export function swapQuestionId(audience, category, ids, index) {
  const seen = seenGet();
  const current = QUESTIONS[ids[index]];
  const taken = new Set(ids);
  let candidates;

  if (isPsych(current)) {
    const pool = psychPoolFor(audience).filter((id) => !taken.has(id));
    const g = psychGroup(current);
    const sameGroup = pool.filter((id) => psychGroup(QUESTIONS[id]) === g);
    // Prefer the same area; otherwise an area the quiz doesn't cover yet.
    const present = new Set(ids.map((id) => psychGroup(QUESTIONS[id]) || null));
    const newArea = pool.filter((id) => !present.has(psychGroup(QUESTIONS[id])));
    candidates = sameGroup.length ? sameGroup : newArea.length ? newArea : pool;
  } else {
    candidates = poolFor(audience, category).filter(
      (id) => !taken.has(id) && !isPsych(QUESTIONS[id])
    );
  }

  if (candidates.length === 0) return ids;
  const next = freshFirst(candidates, seen)[0];
  seenAdd([next]);
  const out = ids.slice();
  out[index] = next;
  return out;
}

export function markSeen(ids) {
  seenAdd(ids);
}
