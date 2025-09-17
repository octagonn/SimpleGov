# ingest-federal-register edge function

Supabase Edge Function that fetches recent documents from the Federal Register API and upserts them into the `documents` table. It is intended to act as the first step in the ingestion pipeline (processing/summarization runs in a separate function).

## Configuration

Set the following environment variables in your Supabase project secrets (names cannot begin with `SUPABASE_` in the dashboard, so we use custom prefixes):

- `SIMPLEGOV_SUPABASE_URL` – project URL (`https://<project-ref>.supabase.co`)
- `SIMPLEGOV_SUPABASE_SERVICE_ROLE_KEY` – service-role key with insert/update rights on `documents`

Optional query parameters when invoking the function:

- `since` (ISO timestamp) – defaults to 24 hours ago
- `source` – repeatable parameter to limit to specific agencies (defaults to `TREASURY/IRS` and `JUSTICE/DOJ`).

## Local testing

```bash
supabase functions serve ingest-federal-register --env-file .env
```

The `.env` file in this folder can reuse the same variable names as above (see `.env.example`).

## Deployment

```bash
supabase functions deploy ingest-federal-register
```
