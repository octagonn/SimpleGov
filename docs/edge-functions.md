# Edge Functions Plan

## Runtime Overview
- Supabase Edge Functions (Deno) provide server-side orchestration for ingestion, enrichment, personalization, and governance flows.
- All functions share a `packages/lib-edge` helper for Supabase client creation, secrets management, logging, schema validation, and retries.
- Service role key stored in Supabase config; API keys pulled from encrypted secrets at runtime.

## Functions

### ingest-sources
- **Purpose**: Poll upstream civic APIs and insert normalized documents into the `documents` table.
- **Trigger**: Scheduled via Supabase Cron (every 10 minutes per source with staggered offsets).
- **Input**: `source` identifier, optional `since` cursor (defaults to last successful import timestamp stored in metadata table).
- **Output**: Array of inserted document IDs and counts of deduplicated or skipped records.
- **Flow**:
  1. Fetch list of new items using REST pagination or date filters.
  2. Normalize payload into canonical schema (title, raw_text, metadata).
  3. Upsert into `documents` with status `imported`; queue for processing (see `process-document`).
- **Error Handling**: Exponential backoff on upstream failures; log to Supabase Logflare; emit alert when error rate exceeds threshold; persist failure cursors for replay.
- **Cost Controls**: Batch API calls per source; avoid refetching unchanged ranges by storing ETag/Last-Modified; restrict writes to changed records only.

### process-document
- **Purpose**: Enrich imported documents with summaries, embeddings, categories, and derived metadata.
- **Trigger**: Invoked by ingest worker after insert or by `documents` table trigger when status transitions to `imported`.
- **Input**: Document ID; optional flags for `rebuild_summary`, `rebuild_embedding`.
- **Output**: Updated document record with summary, categories, embedding, status `processed`, along with processing telemetry row.
- **Flow**:
  1. Retrieve raw_text and metadata from Postgres.
  2. Call AI summarization provider to generate headline, bullet summary, category suggestions, confidence scores.
  3. Generate embeddings via vector API and store in `documents.embedding`.
  4. Update document status and write processing stats to `document_processing_log`.
- **Error Handling**: Circuit breaker by provider; fallback to alternate model; mark document `status=error` with reason; schedule retry with exponential delay.
- **Cost Controls**: Cache prompt templates; enforce token limits; reuse embeddings when text unchanged; short-circuit documents exceeding size threshold until manually reviewed.

### categorize-document
- **Purpose**: Apply advanced tagging (issues, committees, geography) separate from summarization for modular rollout.
- **Trigger**: Scheduled batch job nightly; optionally manual invocation through admin panel.
- **Input**: Batch of document IDs or `since` timestamp.
- **Output**: Populated `documents.categories` JSONB with scoring metadata.
- **Flow**: Use fine-tuned taxonomy service; merge results with existing categories; version all taxonomy updates.
- **Error Handling**: Retry per document; maintain `category_backfill_queue` table for reprocessing.
- **Cost Controls**: Batch 10 documents per call; skip documents already tagged with high-confidence scores.

### search-proxy
- **Purpose**: Encapsulate complex search queries, mixing text search, semantic similarity, and personalization signals.
- **Trigger**: HTTPS callable function invoked by Expo client.
- **Input**: JSON payload `{ query, filters, pagination, personalizationToken }` validated against Zod schema.
- **Output**: Paginated result set with document summaries, highlights, and scoring metadata.
- **Flow**:
  1. Construct SQL using Supabase RPC or stored procedures with sanitized inputs.
  2. Combine keyword search (tsvector) results with embedding similarity (if available) and user interest weights.
  3. Return normalized response with caching headers for short-term reuse.
- **Error Handling**: Graceful degradation to keyword-only search when embeddings unavailable; log slow queries; surface partial results with warnings.
- **Cost Controls**: Enforce rate limits per user (middleware); cache popular queries in Postgres materialized view refreshed hourly.

### approval-write
- **Purpose**: Securely record approval votes and emit realtime events without exposing service role credentials to client.
- **Trigger**: HTTPS callable function requiring authenticated JWT.
- **Input**: `{ officialId, vote }` with vote in {-1, 1}.
- **Output**: Confirmation payload with updated aggregate counts.
- **Flow**: Validate payload, call stored procedure `upsert_approval_vote`, publish event on Realtime channel.
- **Error Handling**: Idempotent upsert prevents duplicates; respond with current vote when conflicts occur; throttle rapid toggling.
- **Cost Controls**: Lightweight function; rely on existing indexes; avoid extra reads by returning totals from stored procedure.

### analytics-snapshot
- **Purpose**: Generate opt-in aggregate metrics for internal dashboards and optional user analytics.
- **Trigger**: Scheduled hourly with metadata on last run.
- **Input**: None; uses configuration table for metrics definitions.
- **Output**: Writes summarized rows to `analytics_snapshots` (document counts, engagement deltas, conversion funnels).
- **Flow**: Execute parameterized SQL queries; sanitize outputs to satisfy privacy thresholds (minimum cohort size).
- **Error Handling**: If query fails, log context and skip commit; maintain `analytics_snapshot_log` for auditing.
- **Cost Controls**: Use incremental aggregation (window functions); prune snapshot table beyond 90 days; skip metrics with no subscribers.

## Shared Concerns
- **Observability**: Each function pushes structured logs (request_id, source, duration) and metrics to Logflare or alternative sink; add tracing IDs in Supabase headers.
- **Secrets Management**: Keep API keys (Federal Register, Congress.gov) in Supabase secret store; rotate via GitHub Actions pipeline.
- **Rate Limiting**: Implement token bucket per source; leverage Supabase KV store (or Postgres advisory locks) to coordinate concurrent runs.
- **Testing**: Write contract tests invoking functions locally via `supabase functions serve` and unit tests using Deno test runner with mocked clients.

## Follow-Up Tracking
- [SG-013](planning/backlog.md#sg-013-prototype-streaming-summarization-workflow) – Prototype `process-document` with streaming summarization to evaluate latency improvements.
- [SG-014](planning/backlog.md#sg-014-decide-taxonomy-processing-split) – Decide whether categorization should be merged into `process-document` or remain standalone for cost control.
- [SG-015](planning/backlog.md#sg-015-implement-ingestion-dead-letter-queue-with-alerts) – Implement a dead-letter queue table for repeated ingestion failures and alert via Slack webhook.
- [SG-016](planning/backlog.md#sg-016-benchmark-search-proxy-concurrency) – Benchmark search-proxy latency under concurrent load and adjust pooling configuration if needed.
