import UnsubscribeButton from '@/components/UnsubscribeButton';

export const metadata = { title: 'Stop quiz emails', robots: { index: false } };

// A button (not auto-unsubscribe on load) so mail scanners that prefetch
// links can't silently opt anyone out.
export default async function UnsubscribePage({ searchParams }) {
  const sp = await searchParams;
  const q = typeof sp.q === 'string' ? sp.q : '';
  const s = typeof sp.s === 'string' ? sp.s : '';
  return (
    <>
      <h1>Stop quiz emails?</h1>
      <p>We'll stop emailing you when people take your quiz.</p>
      <UnsubscribeButton q={q} s={s} />
    </>
  );
}
