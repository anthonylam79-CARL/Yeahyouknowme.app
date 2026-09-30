export default function sitemap() {
  return [
    {
      url: 'https://yeahyouknowme.app',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://yeahyouknowme.app/recover',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];
}
