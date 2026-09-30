// Scores can now be fractional (scale questions give partial credit — see
// app/api/quizzes/[id]/attempts/route.js). Whole-number scores still print
// as plain integers ("10/10"); anything with a fractional part prints with
// one decimal ("7.3/10") instead of the raw float's full precision.
export function formatScore(n) {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}
