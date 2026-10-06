import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyUnsubscribe } from '@/lib/notify';

// POST /api/unsubscribe?q=<quizId>&s=<sig> — also the target of the
// List-Unsubscribe one-click header (mail providers POST here themselves).
export async function POST(request) {
  const sp = request.nextUrl.searchParams;
  const q = sp.get('q') || '';
  const s = sp.get('s') || '';
  if (!q || q.length > 64 || !verifyUnsubscribe(q, s)) {
    return NextResponse.json({ error: 'Invalid link' }, { status: 400 });
  }
  const { error } = await supabaseAdmin().from('quizzes').update({ notify_on_attempt: false }).eq('id', q);
  if (error) {
    console.error('unsubscribe failed', error);
    return NextResponse.json({ error: 'Could not update' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
