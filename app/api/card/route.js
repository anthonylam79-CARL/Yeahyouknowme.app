import { ImageResponse } from 'next/og';
import { verdictFor } from '@/lib/verdict';

// GET /api/card?m=<maker>&g=<guesser>&s=<score>&t=<total>
//
// The shareable result card a guesser posts after finishing: score, verdict,
// names. 4:5 so it works as a feed post or a Story background. Nothing here
// touches the database — everything on the card is already visible to the
// guesser who asked for it. The verdict is computed here from the score, not
// accepted from the URL, so a hand-edited link can change the names but can't
// award a title the score didn't earn.

export const dynamic = 'force-dynamic';

const WIDTH = 1080;
const HEIGHT = 1350;

// Names are free text from the URL: strip control characters and cap length.
function clean(value, max) {
  return (value || '').replace(/[\u0000-\u001f\u007f<>]/g, '').trim().slice(0, max);
}

export async function GET(request) {
  const sp = request.nextUrl.searchParams;
  const maker = clean(sp.get('m'), 30) || 'them';
  const guesser = clean(sp.get('g'), 30) || 'Someone';
  const score = Number(sp.get('s'));
  const total = Number(sp.get('t'));

  if (
    !Number.isFinite(score) ||
    !Number.isInteger(total) ||
    total < 1 ||
    total > 20 ||
    score < 0 ||
    score > total
  ) {
    return new Response('Bad request', { status: 400 });
  }

  const verdict = verdictFor(score, total, maker);
  const shown = Number.isInteger(score) ? String(score) : score.toFixed(1);
  const len = verdict.title.length;
  const stampSize = len <= 11 ? 140 : len <= 14 ? 112 : 92;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#2b1b3d',
          color: '#fff0f6',
          padding: '96px 84px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 50, fontWeight: 700, opacity: 0.8 }}>
          {`${guesser} vs ${maker}`}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', color: '#ffd23f' }}>
            <div style={{ display: 'flex', fontSize: 400, fontWeight: 800, lineHeight: 0.9 }}>
              {shown}
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: 140,
                fontWeight: 800,
                lineHeight: 1,
                marginLeft: 12,
                marginBottom: 14,
                color: 'rgba(255,240,246,0.6)',
              }}
            >
              {`/${total}`}
            </div>
          </div>

          <div style={{ display: 'flex', marginTop: 52 }}>
            <div
              style={{
                display: 'flex',
                background: '#f2336d',
                color: '#ffffff',
                fontSize: stampSize,
                fontWeight: 800,
                lineHeight: 1,
                padding: '22px 40px 28px',
                borderRadius: 28,
                transform: 'rotate(-4deg)',
              }}
            >
              {verdict.title}
            </div>
          </div>

          <div style={{ display: 'flex', marginTop: 48, fontSize: 46, fontWeight: 600, maxWidth: 900 }}>
            {verdict.line}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 44, fontWeight: 700, opacity: 0.85 }}>
            {`Think you know ${maker}?`}
          </div>
          <div style={{ display: 'flex', fontSize: 54, fontWeight: 800, color: '#ffd23f', marginTop: 8 }}>
            yeahyouknowme.app
          </div>
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
    }
  );
}
