import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Yeah You Know Me — how well do they really know you?';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f2336d',
          backgroundImage:
            'radial-gradient(circle at 15% 20%, rgba(255,210,63,0.35) 0%, rgba(255,210,63,0) 42%), radial-gradient(circle at 85% 85%, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 45%)',
          padding: '80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 108,
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '-0.03em',
            lineHeight: 1.02,
            textAlign: 'center',
            display: 'flex',
          }}
        >
          Yeah You Know Me
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 40,
            fontWeight: 700,
            color: '#ffd23f',
            textAlign: 'center',
            display: 'flex',
          }}
        >
          How well do they really know you?
        </div>
      </div>
    ),
    { ...size }
  );
}
