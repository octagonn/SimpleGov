# SimpleGov Architecture

## High-Level Overview
- Expo-managed React Native client delivers the mobile experience with minimal native configuration.
- Supabase provides managed Postgres, Auth, Storage, Functions, and Realtime as the unified backend platform.
- Edge Functions handle ingestion, processing, personalization, and secure server-side orchestration.
- Supabase REST/GraphQL and RPC endpoints expose a clean contract between the mobile client, Edge Functions, and the database.

## Component Responsibilities

### Expo Mobile App
- Implements presentation layer, local caching, and request orchestration through Supabase JS client.
- Responsible for authentication flows, user preference management, and lightweight personalization logic.
- Encapsulates screens and features in modular packages (`apps/expo-app`, `packages/ui`, `packages/lib`).
- Consumes typed RPC responses and handles optimistic updates for low-latency interactions.

### Supabase Postgres & Services
- Stores canonical source documents, embeddings, user actions, and metadata required for personalization.
- Enforces Row Level Security (RLS) to ensure user-specific data segregation.
- Hosts pgvector and other extensions required for semantic search.
- Provides storage buckets for document imagery and cached assets accessible through signed URLs.

### Edge Functions
- Scheduled ingestion workers fetch and normalize data from upstream civic sources.
- Processing functions enrich documents with summaries, categorizations, embeddings, and health metrics.
- Authenticated RPC-style functions support personalized feed generation, approval voting, and administrative tooling.
- Serve as the boundary for integrating third-party AI providers while shielding credentials from the client.

## Data Flow And Integration Points

```text
[Civic APIs] -> (Ingestion Function) -> [Supabase documents]
                                   \-> (Processing Function: AI + embeddings)
                                      -> [documents.summary, documents.embedding]

[Expo App] --auth--> [Supabase Auth] --policies--> [Postgres]
[Expo App] --REST/RPC--> [Supabase PostgREST] --RLS--> [Postgres tables]
[Expo App] --Edge RPC--> [Edge Functions] --service role--> [Postgres and External APIs]
```

- Edge Functions run on cron or event triggers, writing to Postgres using service-role keys.
- Postgres triggers (or Supabase Functions) can enqueue additional work such as reprocessing skipped ingests.
- Expo app subscribes to Realtime channels for live counts (for example, approval votes) when enabled.

## API Boundary Design
- **Client -> Supabase Auth**: user-facing auth endpoints (email, OAuth providers) with PKCE flows handled in Expo.
- **Client -> PostgREST**: strictly typed queries and filters via Supabase client; only exposes data permitted by RLS policies.
- **Client -> Edge Functions**: limited set of callable functions for expensive or privileged operations (feed ranking, analytics, summary regeneration requests).
- **Edge Functions -> External APIs**: ingestion jobs call civic APIs using stored credentials and enforce rate limits; responses normalized before storage.
- **Edge Functions -> Postgres**: leverage Supabase service role for writes beyond RLS constraints (for example, ingestion pipeline) and log mutations for observability.

## Modularity And Scalability
- Adopt a monorepo layout with shared TypeScript packages for models, API clients, and validation schemas to guarantee parity between client and functions.
- Encapsulate ingestion connectors per source to support feature-flagged rollout and independent rate control.
- Favor event-driven patterns (database triggers, Supabase Events) to decouple document import, processing, and distribution.
- Maintain clear interface contracts (TypeScript types plus OpenAPI specs) so future services (web app, partner API) can reuse the same boundaries.

## Cost Control And Operational Guardrails
- Schedule ingestion frequency based on quota budgets; leverage incremental polling windows and checksum-based dedupe to avoid reprocessing.
- Cache recurring Edge Function responses (for example, personalization results) in Postgres materialized views or Supabase Cache API when available.
- Use pgvector IVFFlat indexes sized for MVP scale and expand to HNSW only when document counts justify the extra cost.
- Centralize logging and metrics via Supabase log drains (for example, Logflare) and set budget alarms for OpenAI or Gemini usage.
- Default to Supabase free-tier limits: minimize storage of raw source payloads, prune historical logs, and batch writes where possible.

## TODO
- Decide on eventing mechanism for chaining ingestion to processing (database trigger versus explicit job queue).
- Confirm Edge Function runtime budget for AI provider calls; evaluate need for external worker for long-running summarization.
- Produce OpenAPI specs for public RPC endpoints and generate TypeScript clients.
- Align on observability stack (Sentry versus native Supabase logs) for both client and Edge Functions.
