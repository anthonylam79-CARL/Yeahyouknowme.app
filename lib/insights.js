import { QUESTIONS, isPsych, psychGroup } from './questions';
import {
  TRAITS,
  TRAIT_ORDER,
  STYLE_DIMS,
  AUDIENCE_CARDS,
  MIN_GUESSERS_FOR_GAPS,
  MIN_GUESSERS_FOR_KNOWS_BEST,
  MIN_PSYCH_ITEMS,
  PSYCH_DISCLAIMER,
} from './psych';

// Builds the psychology report for the maker's results page: how they rate
// themselves, how the people taking the quiz see them, and where the two
// differ. Pure function of the stored quiz + attempts — nothing new is
// persisted, and nothing about the guessers beyond their first names is used.
//
// Scale answers are 0-4. Throughout: "self" = the maker's own answer,
// "others" = what guessers guessed the maker would answer.

const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
const round1 = (x) => Math.round(x * 10) / 10;

// A gap under this many points (0-100) on a trait counts as "in sync".
const TRAIT_SYNC_POINTS = 12;
// Item-level: a scale gap under this many steps (0-4) counts as agreement.
const ITEM_AGREE_STEPS = 0.75;

// Trait scores are 0-100 for the HIGH end of the trait; reversed scales
// (where the max label is the low end, like "stubborn") are flipped first.
function traitPoints(q, raw) {
  return ((q.rev ? 4 - raw : raw) / 4) * 100;
}

function itemKind(self, others) {
  const gap = others - self;
  if (Math.abs(gap) < ITEM_AGREE_STEPS) return 'agree';
  const selfExtreme = Math.abs(self - 2);
  const othersExtreme = Math.abs(others - 2);
  // People see it more strongly than the maker does: a blind spot.
  if (othersExtreme - selfExtreme >= ITEM_AGREE_STEPS) return 'blind';
  // The maker rates it strongly but people don't pick up on it: hidden side.
  if (selfExtreme - othersExtreme >= ITEM_AGREE_STEPS) return 'hidden';
  // Opposite sides of the scale with similar strength: a flipped read.
  return 'flip';
}

function leanLabel(q, value) {
  if (value >= 2.5) return q.maxLabel;
  if (value <= 1.5) return q.minLabel;
  return null;
}

function traitSentence(key, selfPts, othersPts, gapsReady) {
  const t = TRAITS[key];
  const word = (pts) => (pts >= 60 ? t.high : pts <= 40 ? t.low : null);
  const selfWord = word(selfPts);
  if (!gapsReady || othersPts === null) {
    return selfWord ? `You see yourself as ${selfWord}.` : `You see yourself somewhere in the middle on this.`;
  }
  const gap = othersPts - selfPts;
  if (Math.abs(gap) < TRAIT_SYNC_POINTS) {
    return selfWord
      ? `People see you the way you see yourself: ${selfWord}.`
      : `People see you the way you see yourself: somewhere in the middle.`;
  }
  // Only claim the opposite pole when people actually land on that side of
  // the scale; if they're nearer the middle, say "less of" the maker's pole.
  if (gap > 0) {
    return othersPts >= 60
      ? `People see you as more ${t.high} than you rate yourself.`
      : `People see you as less ${t.low} than you rate yourself.`;
  }
  return othersPts <= 40
    ? `People see you as more ${t.low} than you rate yourself.`
    : `People see you as less ${t.high} than you rate yourself.`;
}

export function buildPsychInsights({ questionIds, answers, attempts, audience }) {
  const psychIdx = questionIds
    .map((_, i) => i)
    .filter((i) => isPsych(QUESTIONS[questionIds[i]]));
  if (psychIdx.length < MIN_PSYCH_ITEMS) return null;

  const n = attempts.length;
  const gapsReady = n >= MIN_GUESSERS_FOR_GAPS;

  // ---- Traits (scale items) ------------------------------------------------
  const traits = {};
  const items = [];
  psychIdx.forEach((i) => {
    const q = QUESTIONS[questionIds[i]];
    if (q.type !== 'scale' || !q.dim) return;
    const self = answers[i];
    const others = mean(attempts.map((a) => a.guesses[i]));
    const t = (traits[q.dim] = traits[q.dim] || { selfPts: [], othersPts: [], count: 0 });
    t.selfPts.push(traitPoints(q, self));
    t.othersPts.push(traitPoints(q, others));
    t.count += 1;
    items.push({
      prompt: q.prompt,
      facet: q.facet,
      trait: q.dim,
      self: self + 1, // shown as x/5
      others: round1(others + 1),
      gap: others - self,
      kind: itemKind(self, others),
      selfLean: leanLabel(q, self),
      othersLean: leanLabel(q, others),
      minLabel: q.minLabel,
      maxLabel: q.maxLabel,
    });
  });

  const profile = TRAIT_ORDER.filter((k) => traits[k]).map((k) => {
    const t = traits[k];
    const selfPts = Math.round(mean(t.selfPts));
    const othersPts = n > 0 ? Math.round(mean(t.othersPts)) : null;
    return {
      key: k,
      label: TRAITS[k].label,
      blurb: TRAITS[k].blurb,
      high: TRAITS[k].high,
      low: TRAITS[k].low,
      questions: t.count,
      self: selfPts,
      others: gapsReady ? othersPts : null,
      gap: gapsReady ? othersPts - selfPts : null,
      sentence: traitSentence(k, selfPts, othersPts, gapsReady),
    };
  });

  // ---- Styles (scenario items) ---------------------------------------------
  const styleAgg = {};
  psychIdx.forEach((i) => {
    const q = QUESTIONS[questionIds[i]];
    if (!q.styleDim) return;
    const agg = (styleAgg[q.styleDim] = styleAgg[q.styleDim] || { self: {}, others: {}, count: 0 });
    const selfStyle = q.styles[answers[i]];
    agg.self[selfStyle] = (agg.self[selfStyle] || 0) + 1;
    attempts.forEach((a) => {
      const s = q.styles[a.guesses[i]];
      agg.others[s] = (agg.others[s] || 0) + 1;
    });
    agg.count += 1;
  });

  const topOf = (counts) => {
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return entries.length ? entries[0][0] : null;
  };

  const styles = Object.entries(styleAgg).map(([key, agg]) => {
    const def = STYLE_DIMS[key];
    const selfTotal = agg.count;
    const othersTotal = agg.count * n;
    const selfTop = topOf(agg.self);
    const othersTop = n > 0 ? topOf(agg.others) : null;
    const spread = Object.keys(def.styles).map((s) => ({
      key: s,
      label: def.styles[s].label,
      self: Math.round(((agg.self[s] || 0) / selfTotal) * 100),
      others: gapsReady ? Math.round(((agg.others[s] || 0) / othersTotal) * 100) : null,
    }));
    return {
      key,
      label: def.label,
      questions: agg.count,
      selfTop: { key: selfTop, ...def.styles[selfTop] },
      othersTop: gapsReady && othersTop ? { key: othersTop, ...def.styles[othersTop] } : null,
      match: gapsReady ? selfTop === othersTop : null,
      spread,
    };
  });

  // ---- Johari-style gap lists ------------------------------------------------
  const byGap = (a, b) => Math.abs(b.gap) - Math.abs(a.gap);
  let blindSpots = [];
  let hiddenSides = [];
  let commonGround = [];
  if (gapsReady) {
    blindSpots = items
      .filter((x) => x.kind === 'blind' || x.kind === 'flip')
      .sort(byGap)
      .slice(0, 3);
    hiddenSides = items
      .filter((x) => x.kind === 'hidden')
      .sort(byGap)
      .slice(0, 3);
    commonGround = items
      .filter((x) => x.kind === 'agree')
      .sort((a, b) => Math.abs(a.gap) - Math.abs(b.gap))
      .slice(0, 3);
  }

  // ---- Who knows you best, by area ----------------------------------------------
  let knowsBest = [];
  if (n >= MIN_GUESSERS_FOR_KNOWS_BEST) {
    const areas = {};
    psychIdx.forEach((i) => {
      const q = QUESTIONS[questionIds[i]];
      const g = psychGroup(q);
      (areas[g] = areas[g] || []).push(i);
    });
    knowsBest = Object.entries(areas)
      .map(([g, idxs]) => {
        const scored = attempts.map((a, order) => {
          const acc = mean(
            idxs.map((i) => {
              const q = QUESTIONS[questionIds[i]];
              if (q.type === 'scale') return 1 - Math.abs(a.guesses[i] - answers[i]) / (q.max - q.min);
              return q.styles[a.guesses[i]] === q.styles[answers[i]] ? 1 : 0;
            })
          );
          return { name: a.guesser_name, acc, order };
        });
        // Highest accuracy wins; earlier attempt breaks ties.
        scored.sort((x, y) => y.acc - x.acc || x.order - y.order);
        const best = scored[0];
        const label = TRAITS[g]?.label || STYLE_DIMS[g]?.label;
        return { key: g, label, name: best.name, accuracy: Math.round(best.acc * 100) };
      })
      .sort((x, y) => y.accuracy - x.accuracy);
  }

  // ---- Audience card ------------------------------------------------------------
  const card = AUDIENCE_CARDS[audience] || AUDIENCE_CARDS.Partner;
  const highlights = [];
  for (const sk of card.styles) {
    const s = styles.find((x) => x.key === sk);
    if (!s) continue;
    let text = `You lean "${s.selfTop.label}" (${s.selfTop.blurb}).`;
    if (s.othersTop) {
      text += s.match
        ? ` People read you the same way.`
        : ` People more often read you as "${s.othersTop.label}".`;
    }
    highlights.push({ label: s.label, text });
  }
  for (const tk of card.traits) {
    const p = profile.find((x) => x.key === tk);
    if (!p) continue;
    highlights.push({ label: p.label, text: p.sentence });
  }

  return {
    basedOn: n,
    gapsReady,
    gapsNeeded: MIN_GUESSERS_FOR_GAPS,
    profile,
    styles,
    blindSpots,
    hiddenSides,
    commonGround,
    knowsBest,
    card: { title: card.title, intro: card.intro, highlights },
    disclaimer: PSYCH_DISCLAIMER,
  };
}
