# Database Schema

## Overview
- Supabase Postgres hosts the normalized SimpleGov data model with JSONB extensibility for emergent needs.
- Core tables focus on documents, personalization signals, officials, and supporting media.
- Row Level Security (RLS) is active for every user-facing table; Edge Functions use the service role for privileged writes.

## ERD Snapshot

```text
users ---< user_actions >--- documents ---< approval_votes >--- officials
  |                              |
  |                              >--- organizations
  |                              >--- images
  >--- profiles (auth.users)
```

## Tables

### users
- **Columns**: id (UUID, PK, references auth.users), email (citext), display_name, first_name, last_name, avatar_url, age_bucket (enum), state (text), signup_channel (text), preferences (jsonb), created_at (timestamptz default now()).
- **Indexes**: unique on email; btree on state; GIN on preferences for key lookups.
- **RLS**: authenticated users can select/update only their row; service role bypasses for onboarding enrichment.
- **Reasoning**: stores civic preference profile while deferring authentication details to Supabase Auth.

### documents
- **Columns**: id (UUID PK), source (text), source_id (text unique per source), title, summary (text), raw_text (text), categories (jsonb), status (enum: imported|processed|archived), published_at (timestamptz), imported_at (timestamptz default now()), visibility (enum: public|internal), url (text), image_id (UUID FK), embedding (vector), metadata (jsonb), created_at, updated_at.
- **Indexes**: unique (source, source_id); btree on published_at; GIN on categories; IVFFlat on embedding (after population); partial index on status='processed'.
- **RLS**: public read for visibility='public'; authenticated read for visibility in ('public','internal'); only service role can insert/update.
- **Reasoning**: canonical document store with extensible metadata for search and personalization.

### images
- **Columns**: id (UUID PK), storage_path (text), mime (text), width (int), height (int), blurhash (text), created_at.
- **Indexes**: none required beyond PK; optionally btree on created_at.
- **RLS**: authenticated users can select; inserts/updates restricted to service role via Edge Functions.
- **Reasoning**: decouples media metadata from documents/officials to support reuse and caching.

### organizations
- **Columns**: id (UUID PK), slug (text unique), name (text), type (enum: agency|committee|branch|other), description (text), metadata (jsonb), created_at.
- **Indexes**: unique on slug; btree on type.
- **RLS**: public read; service role writes.
- **Reasoning**: shared entity for agencies, chambers, and committees used by documents and officials.

### officials
- **Columns**: id (UUID PK), name (text), title (text), org_id (UUID FK organizations.id), image_id (UUID FK images.id), metadata (jsonb), created_at, updated_at.
- **Indexes**: btree on org_id; GIN on metadata for structured filters.
- **RLS**: public read; service role writes; potential future policy for verified staff edits.
- **Reasoning**: canonical reference for elected / appointed officials powering profiles and approvals.

### user_actions
- **Columns**: id (UUID PK), user_id (UUID FK users.id), document_id (UUID FK documents.id), action_type (enum: view|save|share), action_meta (jsonb), created_at (timestamptz default now()).
- **Indexes**: unique on (user_id, document_id, action_type) to prevent duplicates; btree on created_at for feed analytics.
- **RLS**: users can insert their own rows and select only records with user_id = auth.uid(); deletes limited to user and service role.
- **Reasoning**: captures lightweight telemetry for personalization and analytics with privacy controls.

### approval_votes
- **Columns**: id (UUID PK), official_id (UUID FK officials.id), user_id (UUID FK users.id), vote (smallint, -1 or 1), created_at (timestamptz default now()).
- **Indexes**: unique on (official_id, user_id); btree on official_id for query performance.
- **RLS**: users can upsert their own vote; aggregate views exposed through secure RPC to avoid leaking user identities.
- **Reasoning**: tracks user sentiment toward officials with enforced single vote per user.

## Supporting Views And Functions
- **materialized view** `documents_feed_rank`: precomputes ranking weights (trending score, freshness) for personalization Edge Function.
- **view** `public_document_counts`: exposes aggregate document statistics without leaking raw_text.
- **function** `upsert_approval_vote`: handles vote writes, ensuring totals remain consistent and hooks into Realtime broadcasts.

## Row Level Security Policies (Summary)
- Enable RLS for every table; default deny.
- Define `policy select_own_user` on users for `auth.uid() = id`.
- Define `policy read_public_documents` on documents for `visibility = 'public'`.
- Define `policy insert_user_action` on user_actions for `auth.uid() = user_id`.
- Use Supabase service role within Edge Functions to bypass RLS for ingestion, processing, and analytics maintenance.

## Index Checklist
- Run `CREATE INDEX CONCURRENTLY` migrations to avoid downtime.
- Refresh materialized views during off-peak cron windows.
- Monitor pgvector index sizes; rebuild when embeddings distribution shifts.

## Follow-Up Tracking
- [SG-005](planning/backlog.md#sg-005-finalize-supabase-enum-definitions) – Finalize enum definitions and align them with TypeScript types.
- [SG-006](planning/backlog.md#sg-006-decide-on-raw-text-storage-strategy) – Decide if `documents.raw_text` should move to Supabase Storage when payloads grow.
- [SG-007](planning/backlog.md#sg-007-assess-need-for-document-topic-bridge-table) – Evaluate whether a `document_topics` bridge table is required for relational taxonomy modeling.
- [SG-008](planning/backlog.md#sg-008-implement-compliance-audit-triggers) – Add audit triggers when compliance logging becomes mandatory.
