# Traffic and sharing improvements

## Included
- Three static, internally linked search pages: /best-friend-quiz, /couples-quiz, /how-well-do-you-know-me-questions.
- Matching canonical URLs and a sitemap using the production www host; recovery is no longer promoted as a search landing page.
- A prominent create-your-own challenge after completing a quiz.
- Existing WhatsApp, native sharing, result-card sharing and downloads are instrumented. Shared quiz links exclude current query parameters.
- Anonymous funnel events: visit, maker_started, quiz_created, quiz_completed, share_opened, share_completed, link_copied, card_shared, card_downloaded, maker_cta, checkout_started.

## Measurement and limitations
Events are JSON lines in Vercel runtime logs with type=growth. They contain only an allowlisted event and source, with no quiz ID, email, names, answers or URL. These are counts of actions, not unique people or a joined person-level funnel. Share-opened means an intent was opened, not that a message was sent. Native share completion reports successful handoff, not downstream delivery. Attribution keeps an allowlisted campaign source in sessionStorage for the browser tab. Existing log retention applies; this is not a durable analytics dashboard. Paid purchase confirmation remains in Stripe and is not attributed by this change. Do not treat checkout starts as purchases.

Use ?utm_source=instagram, ?utm_source=tiktok, or ?utm_source=whatsapp in campaign links. Example: /couples-quiz?utm_source=instagram. Only allowlisted sources are recorded. Search landing CTAs identify their landing page when no UTM campaign source is supplied.

## Release
The source tree was equal to origin/main a915ce9 before these edits. Deploy all changed and new files as one release. No environment variables, paid services or database migrations are required. After release, check the three landing pages and sitemap, create/complete a disposable quiz, verify result-card sharing and the create-your-own CTA, and inspect growth events in runtime logs. Request indexing and submit the sitemap in Search Console when authenticated access is available; no indexing submission has been performed locally.
