# AI quiz recaps

Built: a paid-owner recap with explanation, conversation starters and suggested
round-two questions. Suggestions do not modify the quiz or score. No names,
emails, demographics or owner tokens are sent to the model; only aggregate
answer counts. The request button explains this before sending data.

Current status: code built and tested locally; Supabase storage and reservation
function installed. Not deployed or enabled. No live model request or charge.

Activation: publish source, set AI_REPORTS_ENABLED=true and
NEXT_PUBLIC_AI_REPORTS_ENABLED=true, use openai/gpt-5-mini through Vercel AI
Gateway OIDC, and verify one synthetic paid quiz end-to-end. Confirm the team's
Gateway balance first. No credit purchase or automatic top-up is configured.

Limits: one generation per quiz per 30 minutes; 1,000 generation reservations
per UTC calendar month site-wide; saved output reused for identical aggregate
answers; retries disabled; 2,000 output-token limit including reasoning; evidence
limited to 22,000 characters. Failures also consume a reservation to contain
retry abuse. Full non-AI results remain available on failures. UI interactions
read the saved response and do not issue additional model calls.

Costs: current published GPT-5 mini rates are US$0.25/million input tokens and
US$2/million output tokens. A 2,500-input/1,000-output response is US$0.002625.
Actual costs depend on tokens, reasoning and provider pricing. The reservation
limit is a call limit, not a guaranteed dollar billing cap; configure a Gateway
budget separately before public activation. Other apps' AI usage is separate.

Validation: npm run build; node --test tests/ai-report.test.mjs (7 tests);
transactional Supabase reservation and privilege checks, rolled back.
