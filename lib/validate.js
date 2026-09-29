import { QUESTIONS, AUDIENCES } from './questions';

// Requested lengths are 10/15/20, but a few niche categories (e.g. "Flirty")
// have fewer questions in the bank than that, so pickQuestionIds() caps the
// actual set at the pool size. Accept any length in a sane range rather than
// requiring an exact match to [10, 15, 20], or those categories break.
const MIN_QUIZ_LENGTH = 5;
const MAX_QUIZ_LENGTH = 20;
const VALID_AUDIENCES = Object.keys(AUDIENCES);

// Everything here runs server-side and is the one place that decides whether
// submitted data is well-formed. The client-side pickers should never let a
// person build something invalid, but this is the real gate — never trust
// the request body.

export function validateNewQuiz(body) {
  const errors = [];
  const makerName = typeof body.makerName === 'string' ? body.makerName.trim().slice(0, 30) : '';
  if (!makerName) errors.push('makerName is required');

  const audience = body.audience;
  if (!VALID_AUDIENCES.includes(audience)) errors.push('audience must be one of ' + VALID_AUDIENCES.join(', '));

  const questionIds = Array.isArray(body.questionIds) ? body.questionIds : null;
  const answers = Array.isArray(body.answers) ? body.answers : null;

  if (
    !questionIds ||
    questionIds.length < MIN_QUIZ_LENGTH ||
    questionIds.length > MAX_QUIZ_LENGTH
  ) {
    errors.push(`questionIds must have length ${MIN_QUIZ_LENGTH}-${MAX_QUIZ_LENGTH}`);
  } else if (questionIds.some((id) => !Number.isInteger(id) || id < 0 || id >= QUESTIONS.length)) {
    errors.push('questionIds contains an invalid question index');
  } else if (new Set(questionIds).size !== questionIds.length) {
    errors.push('questionIds must not repeat');
  }

  if (!answers || questionIds === null || answers.length !== questionIds.length) {
    errors.push('answers must be the same length as questionIds');
  } else if (answers.some((a) => !Number.isInteger(a) || a < 0 || a > 3)) {
    errors.push('answers must be integers 0-3');
  }

  const email = typeof body.email === 'string' ? body.email.trim().slice(0, 200) : null;

  return { errors, value: { makerName, audience, questionIds, answers, email: email || null } };
}

export function validateAttempt(body, expectedLength) {
  const errors = [];
  const guesserName = typeof body.guesserName === 'string' ? body.guesserName.trim().slice(0, 30) : '';
  if (!guesserName) errors.push('guesserName is required');

  const guesses = Array.isArray(body.guesses) ? body.guesses : null;
  if (!guesses || guesses.length !== expectedLength) {
    errors.push(`guesses must have length ${expectedLength}`);
  } else if (guesses.some((g) => !Number.isInteger(g) || g < 0 || g > 3)) {
    errors.push('guesses must be integers 0-3');
  }

  const AGE_BRACKETS = ['13-17', '18-24', '25-34', '35-44', '45+'];
  const GENDERS = ['Woman', 'Man', 'Nonbinary', 'Prefer not to say'];
  const ageBracket = AGE_BRACKETS.includes(body.ageBracket) ? body.ageBracket : null;
  const gender = GENDERS.includes(body.gender) ? body.gender : null;

  return { errors, value: { guesserName, guesses, ageBracket, gender } };
}
