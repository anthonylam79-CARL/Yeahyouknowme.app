'use client';

import { formatScore } from './format';

// Rotating share captions — each has a hook (why should a stranger care)
// and a call to action (what to do next), instead of one static line that
// gets stale the more it's reposted. Picked randomly per render, so
// different shares (and repeat shares) don't look copy-pasted.
//
// Keep growing these lists over time rather than replacing them wholesale —
// that's the "ongoing" part: new lines in rotation, old ones still fine.

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// Shown when the maker's quiz is ready, inviting people to take it. Framed
// as a question for the reader to answer, not a brag — the hook is their
// own curiosity ("do I actually know this person?"), not the maker's ego.
export function pickMakerCaption(makerName) {
  const who = makerName === 'me' ? 'me' : makerName;
  const options = [
    `How well do you actually know ${who}? Only one way to find out 👇`,
    `I made a quiz about myself — curious how well you'd actually do 👇`,
    `Some of my answers might surprise you. Think you can guess them? 👇`,
    `Tag the person who thinks they know you best and see if they're right 👇`,
    `Everyone says they know ${who} well. Let's actually check that 👇`,
    `Made this in a few minutes and it's weirdly revealing. Try it on ${who} 👇`,
    `Curious who actually knows ${who} best out of everyone ${who === 'me' ? 'I' : 'they'} know 👇`,
    `I answered a bunch of questions about myself — see how close you get 👇`,
  ];
  return pick(options);
}

// Shown to a guesser after they finish, inviting the next person to try —
// the hook is what THEY'LL learn about themselves or about the maker, not
// the taker's score.
export function pickTakerCaption({ makerName, score, total, rank }) {
  const pct = Math.round((score / total) * 100);
  const displayScore = formatScore(score);
  const options = [
    `Just took ${makerName}'s quiz — turns out I know them better than I thought. Curious how you'd do? 👇`,
    `Took ${makerName}'s quiz and scored ${displayScore}/${total}. Your turn 👇`,
    `Ranked #${rank} on ${makerName}'s quiz. See where you land 👇`,
    `This quiz about ${makerName} is oddly revealing — take it and see 👇`,
    `I just found out how well I actually know ${makerName}. Now it's your turn 👇`,
    `${pct}% — that's apparently how well I know ${makerName}. Curious how well you know them? 👇`,
  ];
  return pick(options);
}
