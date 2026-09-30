'use client';

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

// Shown when the maker's quiz is ready, inviting people to take it.
export function pickMakerCaption(makerName) {
  const options = [
    `I just answered a bunch of questions about myself. Think you actually know ${makerName === 'me' ? 'me' : makerName}? Prove it 👇`,
    `Nobody's gotten a perfect score on my quiz yet. Bet you can't either 👇`,
    `This is either going to be flattering or humbling for whoever takes it. Find out which 👇`,
    `I dare you to score above 70% on this. Most people don't 👇`,
    `Fair warning: this quiz is savage. Take it if you think you know me 👇`,
    `Rank yourself against everyone who's tried. Think you'll be #1? 👇`,
    `Made a quiz about myself and I'm lowkey nervous who's gonna ace it. Try your luck 👇`,
    `Tag the person who thinks they know you best. Let's see if they actually do 👇`,
  ];
  return pick(options);
}

// Shown to a guesser after they finish, inviting others to beat their score.
export function pickTakerCaption({ makerName, score, total, rank }) {
  const pct = Math.round((score / total) * 100);
  const options = [
    `I scored ${score}/${total} on ${makerName}'s quiz. Think you can beat me? 👇`,
    `Turns out I know ${makerName} pretty well — ${score}/${total}. Your turn 👇`,
    `${score}/${total}. Not bad, right? Bet you can't beat it 👇`,
    `Officially ranked #${rank} on ${makerName}'s quiz. Dethrone me 👇`,
    `${pct}% — apparently that's how well I know ${makerName}. Go prove you know them better 👇`,
    `I just found out how well I actually know ${makerName}. Now it's your turn to find out 👇`,
  ];
  return pick(options);
}
