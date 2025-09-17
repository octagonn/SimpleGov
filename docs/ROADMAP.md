# Roadmap — `ROADMAP.md`

## Vision timeline (phases)

* **Phase 0 — Bootstrapping**: repo, Supabase project, Expo scaffold, first ingestion sources.
* **Phase 1 — MVP**: ingestion + summarization + simple feed + search + profiles + auth + onboarding.
* **Phase 2 — Optimization & Trust**: semantic search, higher ingestion coverage, reliability, and moderation pipeline.
* **Phase 3 — Growth**: news aggregation, multi-source balancing, personalization improvements, A/B testing.
* **Phase 4 — Social & Monetization**: official accounts, polls, paid summaries, anonymized insights marketplace.

## Key milestones (deliverables, no time estimates)

* Repo + CI + Expo skeleton with auth flows implemented.
* Working ingestion pipeline + Edge Function that writes `documents` and triggers processing.
* AI summarization operational and stored in DB; prompt versioning implemented.
* Search endpoint that combines keyword + category filters.
* Personalized feed endpoint (server-side ranked feed).
* Basic analytics and admin dashboard for content health (document status, failed ingests).
* Production-ready Expo build for TestFlight / Play Store.

## Operational & scaling considerations

* Early: run Edge functions as primary serverless worker; keep ingestion frequency low; prefer official APIs over scraping.
* Mid: cache popular document reads in Supabase Storage CDN or edge cache.
* Later: shard ingestion and move heavy batch processing to a small worker (cloud VM or serverless batch outside of Supabase if necessary).

## Security & policy checkpoints

* Data retention policy: define what `raw_text` we store and for how long.
* Anonymized analytics policy & opt-out mechanisms.
* Moderation: flagging pipeline for incorrect/misleading summaries (user reports + human review queue).

## Team / Roles (suggested)

* 1 Full‑stack lead (you) — features, architecture.
* 1 Mobile developer — UI polish and releases.
* 1 Backend/infra engineer — Edge functions, ingestion, ops.
* 1 Data/AI engineer (part-time) — prompts, embedding strategy, model fallbacks.

---

