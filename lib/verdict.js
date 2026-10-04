// Turns a guesser's score into the verdict they see on screen and put on
// their share card. A bare "11/15" isn't something anyone posts; "Ride or
// die" is. Tiers are by percentage of the *scoreable* questions, so a quiz
// with unscored talking-point questions in it doesn't drag anyone's grade.
//
// Used by the guesser's result screen, the maker's leaderboard and the
// share-card image route, so all three always agree.

const TIERS = [
  { min: 90, title: 'Scary good', line: (m) => `Do you and ${m} share a brain?` },
  { min: 75, title: 'Ride or die', line: (m) => `You pay attention to ${m}. It shows.` },
  { min: 55, title: 'Pretty close', line: (m) => `You know ${m}'s highlights.` },
  { min: 35, title: 'Needs a refresher', line: (m) => `Ask ${m} a few more questions.` },
  { min: 0, title: 'Total stranger', line: (m) => `Time for a real catch-up with ${m}.` },
];

export function verdictFor(score, total, makerName = 'them') {
  const pct = total > 0 ? (score / total) * 100 : 0;
  const index = TIERS.findIndex((t) => pct >= t.min);
  const tier = TIERS[index === -1 ? TIERS.length - 1 : index];
  return {
    title: tier.title,
    line: tier.line(makerName),
    // 0 = best tier, 4 = worst; handy for picking a color.
    tier: TIERS.indexOf(tier),
    pct: Math.round(pct),
  };
}
