# Ingestion Sources Plan

## Initial Source Strategy
- Prioritize high-signal federal datasets with stable APIs and permissive usage rights.
- Build one connector per source with shared interface (`fetchPage`, `normalizeItem`, `persistBatch`).
- Store connector metadata (last_cursor, success_count, error_count) in `ingestion_sources` table for observability.

## Source Briefs

### Federal Register API
- **Endpoint**: `https://www.federalregister.gov/api/v1/documents.json` filtered by publication date and agencies.
- **Content**: Rules, proposed rules, notices; includes title, abstract, full HTML, agency info.
- **Auth**: None required; respect `User-Agent` with contact info.
- **Rate Limits**: Soft limit ~1000 requests/day; use pagination (`page[number]`, `page[size]`).
- **Normalization**:
  - Map `document_number` to `source_id`.
  - Extract HTML to text via unified sanitizer; store raw HTML in metadata if needed.
  - Pull `topics` array into `documents.categories` with source label `federal_register`.

### Congress.gov / GovInfo (via GovTrack API)
- **Endpoint**: `https://www.govtrack.us/api/v2/bill?congress=118&order_by=-current_status_date`.
- **Content**: Bill summaries, sponsors, status updates.
- **Auth**: None required; fallback to Congress.gov bulk data if API limits encountered.
- **Rate Limits**: Informal; stagger polling every 15 minutes during session, hourly otherwise.
- **Normalization**:
  - Compose `source_id` from `bill_type` + `number` + `congress`.
  - Map sponsor to `officials` via crosswalk table; queue enrichment if unknown.
  - Capture latest `current_status` and store in `documents.metadata.status_history`.

### Congress.gov Committee Meetings (future MVP stretch)
- **Endpoint**: `https://api.govinfo.gov/collections/CHRG` with `fromDate/toDate` filters.
- **Content**: Hearing notices and transcripts.
- **Auth**: Requires API key (free registration).
- **Rate Limits**: 1000 requests/day per key; rotate across connectors as needed.
- **Normalization**: Convert PDF text via Supabase Storage worker; mark items requiring manual review.

## Expansion Roadmap

### Near-Term (Phase 2)
- **FEC Filings**: Monitor committee filings for financial updates; parse schedule A/B data with thresholds for significance.
- **Data.gov MCP Feeds**: Integrate municipal open data portals that support standardized JSON (Socrata, CKAN).
- **Press Release Scraping**: Use lightweight Puppeteer worker for agencies lacking APIs; respect robots.txt and throttle aggressively.

### Future (Phase 3+)
- **State Legislature APIs**: Prioritize top population states; abstract ingestion interface to support per-state quirks.
- **Local Ordinance Feeds**: Partner with Civics APIs or build connectors for counties with ICS feeds.
- **Partner Push API**: Provide authenticated webhook endpoint for agencies that want to push updates directly.

## Data Normalization Pipeline
- Use shared `normalizeDocument` helper to standardize fields (title, summary, body, topics, geographic scope).
- Convert HTML/Markdown to plain text while preserving bullet structure for summarization context.
- Annotate each document with `source`, `source_priority`, and `ingestion_version` for traceability.
- Deduplicate using `source_id` and checksum of `raw_text`; skip updates unless significant textual change detected (>5% diff).
- Maintain `ingestion_audit` log capturing connector run time, item counts, error payload references.

## Quality And Compliance
- Validate all incoming data against JSON schema per source to prevent malformed inserts.
- Flag documents with missing critical fields (title, publication date) for manual review queue.
- Track upstream coverage gaps and plan weekly report of ingestion health.

## Follow-Up Tracking
- [SG-017](planning/backlog.md#sg-017-design-ingestion_sources-table-schema) – Design the `ingestion_sources` table schema with identifiers, cursors, run status, and configuration JSON.
- [SG-018](planning/backlog.md#sg-018-prototype-checksum-based-dedupe) – Prototype checksum-based dedupe to avoid unnecessary summarization costs.
- [SG-019](planning/backlog.md#sg-019-establish-shared-html-sanitizer) – Establish a shared sanitizer for HTML-to-text conversion compatible with Edge Functions.
- [SG-020](planning/backlog.md#sg-020-draft-scraping-escalation-policy) – Draft an escalation policy for scraping sources that may change markup unexpectedly.
