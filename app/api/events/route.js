import { NextResponse } from 'next/server';
const events = new Set(['visit','maker_started','quiz_created','quiz_completed','share_opened','share_completed','link_copied','card_shared','card_downloaded','maker_cta','checkout_started']);
const sources = new Set(['direct','instagram','tiktok','whatsapp','social','google','best-friend-quiz','couples-quiz','how-well-do-you-know-me-questions','result','X','WhatsApp','Facebook','Threads','Reddit','Telegram','Bluesky','Text','Email','native']);
export async function POST(request) {
  if (!request.headers.get('origin') || new URL(request.headers.get('origin')).host !== request.headers.get('host')) return new Response(null, {status:403});
  if (Number(request.headers.get('content-length')) > 512) return new Response(null, {status:413});
  try {
    const raw = await request.text();
    if (raw.length > 512) return new Response(null, {status:413});
    const { event, source } = JSON.parse(raw);
    if (!events.has(event)) return new Response(null, {status:400});
    console.info(JSON.stringify({type:'growth',event,source:sources.has(source)?source:'direct'}));
    return NextResponse.json({ok:true});
  } catch { return new Response(null, {status:400}); }
}
