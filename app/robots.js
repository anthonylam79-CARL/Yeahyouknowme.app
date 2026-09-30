export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/results/'], // private/token-gated, nothing to index
    },
    sitemap: 'https://yeahyouknowme.app/sitemap.xml',
  };
}
