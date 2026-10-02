import './globals.css';

export const metadata = {
  metadataBase: new URL(process.env.SITE_URL || 'https://yeahyouknowme.app'),
  title: 'Yeah You Know Me',
  description: 'How well do they really know you? Make a quiz, send the link, find out.',
  openGraph: {
    title: 'Yeah You Know Me',
    description: 'How well do they really know you? Make a quiz, send the link, find out.',
    type: 'website',
    // Safe to set explicitly here (unlike the per-quiz layout — see
    // app/q/[id]/layout.js) since this is the only metadata level for
    // the homepage and there's nothing beneath it to clobber it.
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Yeah You Know Me',
    description: 'How well do they really know you? Make a quiz, send the link, find out.',
    images: ['/opengraph-image'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,700;12..96,800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="wrap">{children}</div>
      </body>
    </html>
  );
}
