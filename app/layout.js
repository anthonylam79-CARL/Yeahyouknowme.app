import './globals.css';

export const metadata = {
  metadataBase: new URL(process.env.SITE_URL || 'https://yeahyouknowme.app'),
  title: 'Yeah You Know Me',
  description: 'How well do they really know you? Make a quiz, send the link, find out.',
  openGraph: {
    title: 'Yeah You Know Me',
    description: 'How well do they really know you? Make a quiz, send the link, find out.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Yeah You Know Me',
    description: 'How well do they really know you? Make a quiz, send the link, find out.',
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
