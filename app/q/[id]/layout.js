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
