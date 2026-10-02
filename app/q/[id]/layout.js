import { supabaseAdmin } from '@/lib/supabaseAdmin';

const AUDIENCE_LABEL = {
  Partner: 'Partner Edition',
  BFF: 'Best Friend Edition',
  Fam: 'Family Edition',
};

export async function generateMetadata({ params }) {
  const { id } = await params;
  const db = supabaseAdmin();
  const { data: quiz } = await db
    .from('quizzes')
    .select('maker_name, audience')
    .eq('id', id)
    .maybeSingle();

  // Deliberately NOT setting `openGraph.images`/`twitter.images` here.
  // Next.js auto-fills `openGraph.images` per-segment from the sibling
  // opengraph-image.js file (this folder has one), and separately mirrors
  // that resolved `openGraph.images` into `twitter.images` whenever this
  // object doesn't declare its own — that's confirmed by testing against
  // a local build. Setting them explicitly here actually broke it: this
  // layout-level object sits ABOVE the page segment the image file lives
  // in, so an explicit value here got silently clobbered by the file
  // convention for og:image but NOT for twitter:image (since the mirror
  // only runs when twitter.images is absent), leaving the X/Twitter card
  // stuck on the wrong image. Omitting both lets the same file-convention
  // image reach og:image and twitter:image consistently.
  if (!quiz) {
    return { title: 'Yeah You Know Me' };
  }

  const title = `Think you know ${quiz.maker_name}?`;
  const description = `Take ${quiz.maker_name}'s quiz and find out — ${
    AUDIENCE_LABEL[quiz.audience] || 'a quiz'
  } on Yeah You Know Me.`;

  return {
    title,
    description,
    openGraph: { title, description, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default function QuizLayout({ children }) {
  return children;
}
