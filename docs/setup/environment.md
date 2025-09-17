# Environment & Secrets Setup

## Local `.env`

1. Copy `.env.example` to `.env` in the repo root.
2. Populate each variable using the guidance below (the Expo config automatically loads `.env` via `dotenv`).

| Variable | Purpose | Where to get it |
| --- | --- | --- |
| `EXPO_PUBLIC_SUPABASE_URL` | Public project URL used by the Expo client | Supabase dashboard -> Project Settings -> API -> Project URL (format `https://<project-ref>.supabase.co`). |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Client-safe key for authenticated calls from the app | Supabase dashboard -> Project Settings -> API -> Project API keys -> anon public. |
| `SUPABASE_URL` | Local fallback for scripts/Edge Functions | Same Project URL as above (kept for backwards compatibility). |
| `SUPABASE_SERVICE_ROLE_KEY` | Local fallback service key | Supabase dashboard -> Project Settings -> API -> Project API keys -> service_role. |
| `SIMPLEGOV_SUPABASE_URL` | Preferred server-side/project URL value (matches `SUPABASE_URL`) | Same Project URL as above. Required when storing secrets in Supabase because keys cannot start with `SUPABASE_`. |
| `SIMPLEGOV_SUPABASE_SERVICE_ROLE_KEY` | Preferred service-role key name for server-side use | Same service role key as above. |
| `OPENAI_API_KEY` | AI provider key for summarization (optional) | OpenAI dashboard: https://platform.openai.com/account/api-keys |
| `GEMINI_API_KEY` | Backup AI provider key (optional) | Google AI Studio: https://ai.google.dev |
| `EXPO_PUBLIC_FEATURE_SUMMARY_TOGGLE` | Example feature flag surfaced to the client | Set manually (e.g., `false`) or integrate with your feature management process. |

> `EXPO_PUBLIC_SUPABASE_URL`, `SUPABASE_URL`, and `SIMPLEGOV_SUPABASE_URL` all hold the same value. The additional `SIMPLEGOV_*` variables exist so Supabase project secrets can avoid the reserved `SUPABASE_` prefix while still allowing local scripts to reference the legacy names.

Keep `.env` files out of source control. Public keys (URL + anon) can live in the app bundle; the service-role key must remain server-only.

## Supabase secrets

Configure server-side secrets before deploying functions. Using the Supabase CLI:

```bash
supabase secrets set \
  SIMPLEGOV_SUPABASE_URL=https://ebsusosjzpasoovixtud.supabase.co \
  SIMPLEGOV_SUPABASE_SERVICE_ROLE_KEY="<service-role-key>" \
  OPENAI_API_KEY="<optional>" \
  GEMINI_API_KEY="<optional>"
```

Dashboard alternative:

1. Open Project Settings -> API and copy the Project URL plus service role key.
2. Go to Edge Functions -> Secrets, add each key/value pair using the `SIMPLEGOV_*` names (the UI blocks names that start with `SUPABASE_`), and save.

## Function-specific `.env`

`infra/edge-functions/ingest-federal-register/.env.example` mirrors the minimum variables needed for local testing with `supabase functions serve`. Copy it to `.env` inside that folder and reuse the `SIMPLEGOV_*` names.

## Verifying configuration

1. Install dependencies: `npm install`
2. Copy the env template: `cp .env.example .env`
3. Edit `.env` with the values gathered above (keep `SIMPLEGOV_*` and `SUPABASE_*` in sync)
4. Start the app: `npm run dev -- --web`

Metro should boot without missing-env warnings, and once the anon key is set the home screen status message switches from "Supabase configuration needed" to a healthy connection notice.
