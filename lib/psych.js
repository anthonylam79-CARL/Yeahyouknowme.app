// Shared definitions for the psychology-backed part of the quiz.
//
// Trait dimensions follow the Big Five model (openness, conscientiousness,
// extraversion, agreeableness, neuroticism), whose item wording is public
// domain (IPIP). We deliberately use plain-language names, not clinical ones,
// and every claim built on top of these is phrased as a "tendency" — a quiz
// of 4-6 questions can't be a personality test, only a conversation starter.
//
// Style dimensions (closeness, conflict) are scenario-based: each multiple
// choice option maps to a style, so we can compare the style a maker picks
// for themselves with the style people guess for them.

export const TRAITS = {
  openness: {
    label: 'Curiosity',
    high: 'curious and adventurous',
    low: 'drawn to the familiar',
    blurb: 'How open to new ideas and experiences you come across',
  },
  conscientiousness: {
    label: 'Organization',
    high: 'organized and reliable',
    low: 'spontaneous and flexible',
    blurb: 'How structured and dependable you come across',
  },
  extraversion: {
    label: 'Social energy',
    high: 'outgoing and energetic',
    low: 'reserved and low-key',
    blurb: 'How much you light up around other people',
  },
  agreeableness: {
    label: 'Warmth',
    high: 'warm and accommodating',
    low: 'direct and tough-minded',
    blurb: 'How cooperative and easygoing you come across',
  },
  neuroticism: {
    label: 'Emotional intensity',
    high: 'emotionally intense',
    low: 'steady and unflappable',
    blurb: 'How strongly feelings and worries show up',
  },
};

export const TRAIT_ORDER = [
  'openness',
  'conscientiousness',
  'extraversion',
  'agreeableness',
  'neuroticism',
];

export const STYLE_DIMS = {
  attachment: {
    label: 'Closeness style',
    styles: {
      secure: { label: 'Steady', blurb: 'comfortable with closeness and with space' },
      anxious: { label: 'Reassurance-seeking', blurb: 'wants regular signs that things are okay' },
      avoidant: { label: 'Space-first', blurb: 'needs room to process before opening up' },
      mixed: { label: 'Hot and cold', blurb: 'closeness feels great and unsettling in turns' },
    },
  },
  conflict: {
    label: 'Conflict style',
    styles: {
      avoid: { label: 'Steps back', blurb: 'lets things cool off, sometimes avoids them entirely' },
      accommodate: { label: 'Smooths it over', blurb: 'gives way to keep the peace' },
      compete: { label: 'Stands their ground', blurb: 'says what they think and holds the line' },
      compromise: { label: 'Meets in the middle', blurb: 'trades a little for a quick resolution' },
      collaborate: { label: 'Works it out together', blurb: 'digs into what each side really needs' },
    },
  },
};

// What to feature for each audience's report card, and how to title it.
export const AUDIENCE_CARDS = {
  Partner: {
    title: 'In a relationship',
    intro: 'How you show up with someone close, and how they read it.',
    styles: ['attachment', 'conflict'],
    traits: ['neuroticism', 'agreeableness'],
  },
  BFF: {
    title: 'As a friend',
    intro: 'How you come across to the people who pick you for the group chat.',
    styles: ['conflict', 'attachment'],
    traits: ['extraversion', 'agreeableness'],
  },
  Fam: {
    title: 'In the family',
    intro: 'How the people who have known you longest see you.',
    styles: ['conflict', 'attachment'],
    traits: ['conscientiousness', 'agreeableness'],
  },
};

// Gaps and "who knows you best" claims about other people's views need
// enough people that one person's opinion isn't mistaken for a finding.
export const MIN_GUESSERS_FOR_GAPS = 3;
export const MIN_GUESSERS_FOR_KNOWS_BEST = 2;
// A psychology report needs at least this many tagged questions in the quiz.
export const MIN_PSYCH_ITEMS = 3;

export const PSYCH_DISCLAIMER =
  'Based on a handful of questions, so read these as tendencies and conversation starters, not a personality test or a diagnosis.';
