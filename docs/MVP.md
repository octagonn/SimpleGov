# MVP Plan — `MVP.md`

## 1 — Elevator summary

SimpleGov is a U.S.-focused civic-information mobile app (Expo / React Native) that aggregates primary government documents (bills, rules, federal register items) and presents short, neutral AI summaries and clean metadata to help everyday people understand what government is doing. The MVP prioritizes ingestion, searchable documents, a personalized feed, and lightweight profiles for officials. Monetization and advanced social features are postponed to post‑MVP.

## 2 — Goals (MVP)

* Fast, reliable ingestion pipeline for a small set of authoritative sources.
* Clean document model + AI-generated summaries.
* Onboarding with preference capture for personalization.
* Personalized "For You" feed (trending + interest-based).
* Robust, usable search (category filters + keyword search).
* Basic official profiles with up/down approval vote tracking.
* Authentication (Email, Google, Apple) + account management.
* Minimal cost: keep within Supabase free tier while prototyping.

## 3 — Tech stack

* Frontend: Expo (React Native) developed in Cursor.
* Backend / DB: Supabase (Postgres + Auth + Storage + Edge Functions + Realtime).
* AI: OpenAI / Gemini (or pluggable provider) via Supabase Edge Functions for summarization and categorization.
* Embeddings / search: pgvector extension in Supabase (vectors stored in documents table) for semantic search.
* CI/CD: GitHub Actions (push -> run tests -> build -> app store / Expo publish)
* Observability: Sentry (errors), simple logging in Edge Functions + Supabase logs.

## 4 — High-level architecture

1. **Ingestion** (Edge Function / small scraper service): pulls from a handful of sources (Federal Register API, Congress API, official agency RSS feeds) and writes canonical documents to Supabase `documents` table (status: imported -> processed).
2. **Processing** (Edge Function): generates embeddings, categorization tags, and a concise human‑readable summary using AI. Writes embeddings back to `documents` and stores generated summary & metadata.
3. **Frontend**: Expo app queries Supabase REST/JS client for personalized feed, search, and document reads. When user requests a paywalled summary feature toggle, the app calls an authenticated Edge Function to reveal/charge.
4. **Realtime**: optional Supabase Realtime used for live trending updates and approval vote counts.

## 5 — Database (MVP) — core tables

* `users` (id, email, display\_name, first\_name, last\_name, avatar\_url, age\_bucket, state, signup\_channel, preferences jsonb, created\_at)
* `documents` (id, source, source\_id, title, published\_at, imported\_at, status, raw\_text, summary, categories jsonb, embedding vector, image\_id, url, visibility)
* `images` (id, storage\_path, mime, width, height, created\_at)
* `organizations` (id, slug, name, description, type)
* `officials` (id, name, title, org\_id, image\_id, metadata jsonb)
* `user_actions` (id, user\_id, document\_id, action\_type \[save, view, share], created\_at)
* `approval_votes` (id, official\_id, user\_id, vote \[1/-1], created\_at)

**Notes:** keep schema small and add `jsonb` fields for extensibility rather than adding many narrow columns. One document table simplifies queries and ranking.

## 6 — Ingestion plan (MVP)

* Start with 2–4 authoritative sources: Federal Register API, Congress.gov / GovInfo, and 1 agency RSS (e.g., DOJ releases). Use official APIs where possible to avoid scraping.
* Edge Function (Cron) pulls new items, deduplicates by `source_id`, stores `raw_text` and metadata in `documents` with `status = imported`.
* Trigger processing Edge Function per-new-import: call AI summarization and embeddings, populate `summary`, `categories`, `embedding` and set `status = processed`.
* Maintain simple rate limiting and error retries.

## 7 — AI summarization & categories

* Keep prompts small and deterministic; store prompt version in DB for reproducibility.
* Produce: 1-2 sentence headline, 3–5 bullet summary, and list of categories (policy, finance, environment, civil rights, etc.) with confidence scores.
* Generate embeddings (OpenAI / provider) and store in `documents.embedding` (pgvector).
* Implement fallback provider order and safety checks for hallucinations (e.g., keep `raw_text` and add a `summary_confidence` score).

## 8 — Search (MVP)

* Primary: text search on `title`, `raw_text` (Postgres full‑text search) + category filters (jsonb contains).
* Secondary (optional for better UX): semantic search using `pgvector` — query embeddings for nearest neighbors then filter by category/time.
* Provide combined ranking: (keyword match score \* weight) + (semantic similarity \* weight) + (freshness boost) + (personalization boost).

## 9 — Personalization / Feed

* On onboarding, gather `interests: []`, `location (state)`, `age_bucket`.
* Feed generator (Edge Function or server endpoint) ranks `documents` by: interest-match (categories), trending boost (by views/saves in last N days), freshness, and similarity to user's saved/liked docs via embeddings.
* Minimal privacy-first telemetry stored in `user_actions` for personalization; opt-in analytics only.

## 10 — Auth & Onboarding

* Use Supabase Auth for Email, Google, Apple (enable providers in Supabase project).
* After sign-up, show onboarding flow: name, age range, state, interests (multi-select), optional political lean (optional; keep as bucketed choice), notification preferences.
* Store onboarding data in `users.preferences` (jsonb).

## 11 — UI: Pages (MVP)

* Bottom tab: Home (For You feed + trending strip), Search (category cards + search bar), Hub (org carousel + filtered list), Officials (list + profile + approval vote), Account (profile, saved content, prefs).
* Document modal / detail view: title, published\_at, organization, short AI summary (collapsed), "Show full text" button, source link, save button, share.
* Keep UI components modular and atomic: `DocumentCard`, `SummaryBlock`, `ProfileCard`, `OrgCarousel`.

## 12 — Nonfunctional requirements

* Security: validate and sanitize all ingested content; Gate user actions behind Auth; store minimal PII.
* Privacy: anonymize analytics export; allow users to opt out of tracking.
* Scalability: use pagination, cursor-based queries; index `published_at`, `categories`, and GIN index on `jsonb` fields; use pgvector indexes for ANN.
* Observability: structured logs in Edge Functions; Sentry for runtime errors.

## 13 — Acceptance criteria (sample)

* Sign-up/login with Email + Google works end-to-end.
* Onboarding captures and stores preferences.
* At least 100 documents ingested and processed with summaries and embeddings.
* Search returns relevant results using both filters and text search.
* Personalized feed returns >10 items and respects user interests.
* Users can save and retrieve saved documents.

## 14 — Repo & developer hygiene

* Mono-repo / multi-package structure (recommended):

  * `/apps/expo-app` (Expo app)
  * `/packages/ui` (shared UI components)
  * `/packages/lib` (supabase client, api helpers, types)
  * `/infra` (supabase edge function code, scripts)
* Typescript everywhere (frontend + edge functions).
* Linting: ESLint + Prettier.
* Basic unit tests for Edge functions and critical helpers (Jest).

---