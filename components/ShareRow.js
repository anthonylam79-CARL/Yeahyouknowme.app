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
    ['Facebook', `https://www.facebook.com/sharer/sharer.php?u=${e(link)}`],
    ['Threads', `https://www.threads.net/intent/post?text=${e(full)}`],
    ['Reddit', `https://www.reddit.com/submit?url=${e(link)}&title=${e(text)}`],
    ['Telegram', `https://t.me/share/url?url=${e(link)}&text=${e(text)}`],
    ['Bluesky', `https://bsky.app/intent/compose?text=${e(full)}`],
    ['Text', `sms:?&body=${e(full)}`],
    ['Email', `mailto:?subject=${e(text)}&body=${e(full)}`],
  ];

  const go = (url) => () => {
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

  return (
    <div className="shares">
      {typeof navigator !== 'undefined' && navigator.share && (
        <button className="btn" onClick={nativeShare}>
          Share…
        </button>
      )}
      {targets.map(([name, url]) => (
        <button key={name} className="btn alt small" onClick={go(url)}>
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
