# Security And Privacy Plan

## Guiding Principles
- Ship features with security-by-default (RLS, least privilege, auditability) and privacy-by-design (limited data retention, user control).
- Restrict access through tiered credentials: client auth, edge service role, admin service role, and local development keys.
- Maintain transparent documentation of data usage, opt-ins, and anonymization methods.

## Authentication And Session Flow
- Supabase Auth handles email magic links, Google, and Apple sign-in; enforce verified email before granting access.
- Expo app stores session tokens using secure storage (Keychain/Android Keystore) and refreshes via Supabase client.
- Implement re-authentication prompts for sensitive actions (data export, analytics opt-in toggle).
- Support optional two-factor auth (Supabase OTP) in later phases; design UI placeholders now.

## Authorization And RLS
- Enable RLS on all tables; default deny until explicit policy exists.
- Policies:
  - `users`: select/update restricted to `auth.uid() = id`.
  - `documents`: public read for `visibility = 'public'`; internal read for authenticated users; writes restricted to service role.
  - `user_actions`: inserts/selects only when `auth.uid() = user_id`; delete policy for the same predicate.
  - `approval_votes`: enforce single vote via unique constraint; policy ensures `auth.uid() = user_id`.
- Edge Functions run with service role key stored in Supabase secrets; never exposed to client bundle.

## Data Protection
- Encrypt sensitive fields at rest using Postgres column encryption where applicable (e.g., hashed email as needed).
- Store minimal PII: name, email, state, high-level preferences; avoid precise location or political affiliation unless aggregated.
- Use Supabase Storage signed URLs for images; set short expiry and cache busting strategy.
- Backup strategy: enable daily point-in-time recovery; store snapshots in encrypted Supabase storage bucket.

## Privacy Program
- Provide in-app privacy center summarizing data usage, retention, and opt-out controls.
- Offer one-click data export (JSON bundle) and deletion request routed through automated Edge Function.
- Default analytics to off; show explicit opt-in with description of metrics captured.
- Aggregate telemetry to cohorts of >=50 users before reporting to protect anonymity.

## Analytics And Telemetry
- Capture minimal events: document viewed, saved, share initiated, approval vote.
- Strip IP addresses and replace with coarse geographic bucket (state) derived at onboarding.
- Send crash/error data via Sentry with PII scrubbing enabled; mask raw_text payloads and user identifiers.
- Maintain audit log of admin actions (summary overrides, manual categorizations) in dedicated table with timestamps and actor ID.

## Secrets Management
- Store third-party API keys (OpenAI, GovInfo) in Supabase secret store; rotate quarterly via GitHub Actions pull request workflow.
- Local development uses `.env.local` with scoped keys; provide sample template without secrets.
- Monitor secret usage via Supabase metrics; alert on unusual spikes.

## Compliance Preparation
- Draft data retention policy (e.g., purge raw ingestion payloads older than 180 days unless flagged for archive).
- Track regulatory landscape (CCPA, GDPR) though primary audience is US; provide data deletion workflow compliant with both.
- Document subprocessors and ensure contracts include data protection addenda.

## Incident Response
- Define severity tiers and on-call rotation (initially founder-led).
- Automate anomaly detection (failed ingestion spikes, unauthorized access attempts) with alerts to Slack/Email.
- Run quarterly tabletop exercises to test incident playbooks (breach, API abuse, AI hallucination report).

## TODO
- Implement encrypted audit trail for admin overrides leveraging pgcrypto.
- Evaluate Supabase Vault for managing particularly sensitive columns if future features require PII expansion.
- Write formal privacy policy and terms of service drafts to accompany MVP beta.
- Integrate automated security scanning (npm audit, Snyk) into CI pipeline with alert thresholds.
