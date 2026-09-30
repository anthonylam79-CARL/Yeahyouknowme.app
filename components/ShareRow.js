'use client';

function copy(text, onDone) {
  navigator.clipboard.writeText(text).then(
    () => onDone('Copied'),
    () => onDone('Copy it from the box')
  );
}

export default function ShareRow({ text, link }) {
  const full = `${text}\n${link}`;
  const e = encodeURIComponent;

  const targets = [
    ['X', `https://x.com/intent/post?text=${e(full)}`],
    ['WhatsApp', `https://wa.me/?text=${e(full)}`],
    // Facebook removed the ability for any site to pre-fill a post's text
    // years ago (the old `quote` param is ignored now) — sharer.php only
    // ever takes a URL, so this opens Facebook's own preview of the link
    // (pulled from our Open Graph tags). We copy the caption to the
    // clipboard first so there's at least something to paste in as the
    // person's own comment.
    ['Facebook', `https://www.facebook.com/sharer/sharer.php?u=${e(link)}`, full],
    ['Threads', `https://www.threads.net/intent/post?text=${e(full)}`],
    ['Reddit', `https://www.reddit.com/submit?url=${e(link)}&title=${e(text)}`],
    ['Telegram', `https://t.me/share/url?url=${e(link)}&text=${e(text)}`],
    ['Bluesky', `https://bsky.app/intent/compose?text=${e(full)}`],
    ['Text', `sms:?&body=${e(full)}`],
    ['Email', `mailto:?subject=${e(text)}&body=${e(full)}`],
  ];

  const go = (url, copyText) => () => {
    if (copyText) {
      navigator.clipboard.writeText(copyText).catch(() => {});
    }
    if (/^(sms|mailto)/.test(url)) {
      window.location.href = url;
    } else {
      window.open(url, '_blank', 'noopener');
    }
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ text, url: link });
    } catch {
      /* cancelled, ignore */
    }
  };

  // TikTok has no web share-intent that accepts prefilled text (unlike
  // X, WhatsApp, etc.) — there's no URL that opens TikTok with a caption
  // already in it. The practical workaround: copy the caption to the
  // clipboard and jump into the app so the person can paste it themselves
  // when they post. This is a best-effort app open — if TikTok isn't
  // installed, or the OS blocks the custom scheme, nothing bad happens,
  // the caption is still on the clipboard either way.
  const shareToTikTok = (onDone) => {
    navigator.clipboard.writeText(full).then(
      () => onDone('Copied — paste as your caption'),
      () => onDone('Copy it, then paste in TikTok')
    );
    setTimeout(() => {
      window.location.href = 'tiktok://';
    }, 250);
  };

  return (
    <div className="shares">
      {typeof navigator !== 'undefined' && navigator.share && (
        <button className="btn" onClick={nativeShare}>
          Share…
        </button>
      )}
      <button
        className="btn alt small"
        onClick={(ev) => shareToTikTok((label) => (ev.target.textContent = label))}
      >
        TikTok
      </button>
      {targets.map(([name, url, copyText]) => (
        <button key={name} className="btn alt small" onClick={go(url, copyText)}>
          {name}
        </button>
      ))}
      <CopyButton text={full} />
    </div>
  );
}

function CopyButton({ text }) {
  return (
    <button
      className="btn alt small"
      onClick={(e) => copy(text, (label) => (e.target.textContent = label))}
    >
      Copy
    </button>
  );
}
