const paths = ['', '/best-friend-quiz', '/couples-quiz', '/how-well-do-you-know-me-questions', '/compatibility'];
export default function sitemap() {
  return paths.map(path => ({url: `https://www.yeahyouknowme.app${path}`, changeFrequency:'monthly', priority: path ? 0.7 : 1}));
}
