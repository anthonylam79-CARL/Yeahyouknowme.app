// No identities, answers, quiz IDs, or private URLs are sent.
export function trackGrowth(event, source) {
  try {
    const allowed = ['instagram','tiktok','whatsapp','social','google','best-friend-quiz','couples-quiz','how-well-do-you-know-me-questions','result'];
    const query = new URLSearchParams(window.location.search);
    const incoming = query.get('utm_source') || query.get('from');
    if (allowed.includes(incoming)) sessionStorage.setItem('yyk_source', incoming);
    const attribution = sessionStorage.getItem('yyk_source') || 'direct';
    fetch('/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({event, source: source || attribution}), keepalive: true }).catch(() => {});
  } catch {}
}
