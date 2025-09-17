# Post‑MVP Features — `POST_MVP.md`

## 1 — Advanced search & ranking

* Federated news ingestion from multiple publishers with a bias-balancing algorithm.
* Personalized ranking models (small, privacy-preserving models) that learn user preferences client-side or in a privacy-first server store.
* Advanced boolean filters, timeline sliders, and saved searches.

## 2 — News balancing (both sides)

* Aggregate N sources for the same event and produce side-by-side AI summaries that highlight differences and factual claims.
* Provide source provenance and a quick confidence metric.

## 3 — Official & Candidate accounts

* Verified official accounts (manual verification process) that can post short updates, hold polls, and respond to public comments.
* Opt-in verification flow linking to official websites or .gov emails.

## 4 — Monetization & privacy‑safe analytics

* Premium subscription: full paragraph summaries, PDF export, weekly briefings, API access to anonymized trends.
* Anonymized insights marketplace (bulk aggregate data sold to campaigns / researchers) with strict privacy thresholds and differential‑privacy options.

## 5 — Social features

* Commenting (moderated), upvotes, shareable annotations.
* Public polls, town‑hall features, and local issue mapping.

## 6 — Local & civic features

* Map view for local ordinances and nearby government events.
* Integrated calendar for public hearings and bill deadlines (user calendar sync/export).

## 7 — Administration & moderation

* Admin panel: ingestion status, document queue, summary re-generation, manual categorization.
* Human-in-the-loop moderation queue for disputed summaries and flagged documents.

## 8 — Reliability & scale

* Move heavy workloads to dedicated workers and queue system (e.g., RabbitMQ, Cloud Tasks) if needed.
* Geo‑distributed caches and CDN for heavy read traffic.

## 9 — Developer & partner APIs

* Public API for read-only access to summaries and metadata.
* Partner ingestion connectors for state/county APIs and for organizations who want to push documents directly.

---

## Final notes & next actions (what I recommend you ask me to do next)

* I created a repo skeleton (boilerplate) and Expo app scaffold with Supabase auth integration.
* I can design the DB schema SQL (DDL) you can run in Supabase.
* I can write the first Edge Function that ingests items from the Federal Register and performs summarization.

If you want, I can immediately generate the SQL for the MVP schema and a folder layout + example Edge Function next.
