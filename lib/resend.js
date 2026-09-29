// Thin wrapper around Resend's HTTP API — no SDK dependency needed for one
// call. Requires RESEND_API_KEY (and optionally RESEND_FROM_EMAIL) in env.
// Without RESEND_API_KEY set, sendEmail no-ops and returns { skipped: true }
// so local/dev setups without an email provider don't hard-fail.

const DEFAULT_FROM = 'Yeah You Know Me <onboarding@resend.dev>';

export async function sendEmail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY not set — skipping email send to', to);
    return { skipped: true };
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL || DEFAULT_FROM,
      to,
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Resend API error ${res.status}: ${body}`);
  }

  return res.json();
}
