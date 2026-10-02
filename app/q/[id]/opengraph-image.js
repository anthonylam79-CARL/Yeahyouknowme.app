import { ImageResponse } from 'next/og';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Think you know them? Take the quiz.';

// Force this route to actually run per-request rather than being treated
// as a static/cacheable file-convention route. `generateImageMetadata`
// used to live here just to set a per-quiz alt string, but it also made
// Next emit this as an SSG route under a synthetic
// `/q/[id]/opengraph-image/[__metadata_id__]` path, which is exactly the
// kind of ambiguity that leads to a crawler (Twitterbot et al.) getting a
// stale/empty/mismatched image. Not worth it for alt text alone.
export const dynamic = 'force-dynamic';

const AUDIENCE_LABEL = {
  Partner: 'Partner Edition',
  BFF: 'Best Friend Edition',
  Fam: 'Family Edition',
};

export default async function Image({ params }) {
  const { id } = await params;
  const db = supabaseAdmin();
  const { data: quiz } = await db
    .from('quizzes')
    .select('maker_name, audience')
    .eq('id', id)
    .maybeSingle();

  const makerName = quiz?.maker_name || 'Someone';
  const audienceLabel = AUDIENCE_LABEL[quiz?.audience] || '';

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
        {audienceLabel && (
          <div
            style={{
              display: 'flex',
              fontSize: 30,
              fontWeight: 700,
              color: '#fff',
              background: 'rgba(255,255,255,0.18)',
              padding: '10px 26px',
              borderRadius: 999,
              marginBottom: 36,
              letterSpacing: '0.02em',
            }}
          >
            {audienceLabel}
          </div>
        )}
        <div
          style={{
            fontSize: 96,
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
            textAlign: 'center',
            display: 'flex',
            maxWidth: 1000,
          }}
        >
          Think you know {makerName}?
        </div>
        <div
          style={{
            marginTop: 30,
            fontSize: 38,
            fontWeight: 700,
            color: '#ffd23f',
            textAlign: 'center',
            display: 'flex',
          }}
        >
          Take the quiz & find out 👇
        </div>
      </div>
    ),
    { ...size }
  );
}
