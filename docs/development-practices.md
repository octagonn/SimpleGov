# Development Practices

## Coding Standards
- TypeScript everywhere (Expo app, shared packages, Edge Functions) with `"strict": true` and incremental builds.
- Follow ESLint config extending `@react-native-community`, `@typescript-eslint/recommended`, and project-specific rules.
- Prettier enforces formatting; run via pre-commit hook (`lint-staged`) on staged files.
- Prefer functional components with hooks; isolate side effects inside dedicated services or React Query mutations.
- Maintain API contracts with Zod schemas shared between client and Edge Functions; export types from `packages/lib`.

## Repository Structure
- `apps/expo-app`: mobile client, feature modules under `src/features/*`, route config via Expo Router.
- `packages/ui`: atomic component library, theme tokens, storybook stories (Chromatic optional).
- `packages/lib`: Supabase client wrappers, API contracts, shared utilities, analytics helpers.
- `infra`: Supabase migrations (`supabase/migrations`), Edge Function source, scripts.
- Enforce absolute imports via TS path aliases and Babel module resolver.

## Tooling And Automation
- Husky pre-commit: `pnpm lint`, `pnpm test -- --watch=false`, targeted typecheck on changed packages.
- Commitlint ensures conventional commit messages for clean changelog generation.
- Dependabot weekly for npm updates; audit review required before auto-merge.
- Storybook/Expo preview deployed to Chromatic or Expo Snack for rapid UI feedback.

## CI/CD Pipeline (GitHub Actions)
- Workflow `ci.yml` runs on pull requests: install (pnpm), lint, typecheck, unit tests, build Expo EAS preview.
- Workflow `supabase-migrate.yml` runs migrations using Supabase CLI against staging; requires manual approval for production.
- Workflow `release.yml` handles version bump, changelog generation, and triggers Expo EAS submit to TestFlight/Play Store when main branch tagged.
- Cache node_modules and Expo/EAS caches to reduce runtime; use concurrency groups to cancel stale runs.

## Supabase Workflow
- Local development: run `supabase start` with Docker; apply migrations via `pnpm supabase db push`.
- Staging and production: apply migrations via GitHub Actions with manual review; ensure reversible migrations.
- Edge Functions deployed via `supabase functions deploy <name>` from CI with environment-specific secrets.
- Maintain seeding script populating sample data for end-to-end testing.

## Testing Approach
- **Unit Tests**: Jest (or Deno test) for shared utilities, custom hooks, and Edge Function logic; target >80% critical coverage.
- **Component Tests**: React Native Testing Library with snapshot and interaction coverage for DocumentCard, approval controls, etc.
- **Integration Tests**: Supabase RPC contract tests using `pgTap` or `postgres-test` harness for stored procedures.
- **End-to-End**: Detox (mobile) covering onboarding, feed, search, approval vote flows; run nightly and on release candidates.
- **Schema Validation**: Run drizzle-kit or `zod-to-ts` consistency check to ensure migrations align with TypeScript types.

## Developer Experience
- Provide VS Code / Cursor workspace settings (format on save, recommended extensions).
- Enable Reactotron or Flipper integration for debugging in development builds only.
- Document environment setup in `docs/CONTRIBUTING.md` (future addition) with onboarding script.
- Encourage feature flag usage via simple JSON config stored in Supabase table; toggle via admin UI.

## Observability And QA
- Integrate Sentry for Expo and Edge Functions with release tagging from CI.
- Log Edge Function invocations with correlation IDs; surface health metrics in dashboard (Grafana or Supabase logs).
- Define QA checklist per feature (accessibility, localization, performance) before merging major PRs.

## TODO
- Write CONTRIBUTING guide including environment bootstrap script and design review process.
- Set up automated Expo preview comments on pull requests.
- Establish rotation for code reviews and release managers.
- Add contract tests for search-proxy once API schema finalized.
