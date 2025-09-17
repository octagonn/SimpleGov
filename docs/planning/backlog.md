# Planning Backlog

This backlog captures follow-up work identified in the architecture, data, UX, and operations documentation. Each item includes the owner responsible for execution, key stakeholders for alignment, and the current status.

## Architecture & Platform

#### SG-001: Select ingestion event orchestration path
- **Description**: Decide whether to chain ingestion-to-processing via Postgres triggers, Supabase Events, or an external job queue.
- **Owner**: Platform Engineering Lead
- **Stakeholders**: Data Engineering, Product Management
- **Status**: Needs design/data alignment
- **Source**: [Architecture](../architecture.md)

#### SG-002: Validate Edge Function runtime budgets
- **Description**: Confirm Deno Edge runtime limits for AI summarization calls and determine if a separate worker tier is required for long-running tasks.
- **Owner**: Platform Engineering Lead
- **Stakeholders**: Data Engineering, Finance
- **Status**: Planned
- **Source**: [Architecture](../architecture.md)

#### SG-003: Publish OpenAPI specs for RPC endpoints
- **Description**: Document Edge Function and PostgREST RPC contracts, then generate shared TypeScript clients.
- **Owner**: API Engineering
- **Stakeholders**: Mobile, QA
- **Status**: Planned
- **Source**: [Architecture](../architecture.md)

#### SG-004: Select observability stack for clients and functions
- **Description**: Compare Sentry, Supabase logs, and alternatives to finalize error tracking and monitoring tooling.
- **Owner**: Platform Engineering Lead
- **Stakeholders**: Mobile, Data, Support
- **Status**: Needs design/data alignment
- **Source**: [Architecture](../architecture.md)

## Data Model & Storage

#### SG-005: Finalize Supabase enum definitions
- **Description**: Define enum values for action types, document status, visibility, and user age buckets, ensuring parity with TypeScript types.
- **Owner**: Data Engineering
- **Stakeholders**: Mobile, Product
- **Status**: In discovery
- **Source**: [Database Schema](../database-schema.md)

#### SG-006: Decide on raw text storage strategy
- **Description**: Evaluate whether large `documents.raw_text` payloads should move into Supabase Storage buckets versus remaining in Postgres.
- **Owner**: Data Engineering
- **Stakeholders**: Platform, Finance
- **Status**: Planned
- **Source**: [Database Schema](../database-schema.md)

#### SG-007: Assess need for document-topic bridge table
- **Description**: Determine if a normalized `document_topics` table is required to support richer taxonomy queries.
- **Owner**: Data Engineering
- **Stakeholders**: Product, Taxonomy Working Group
- **Status**: Needs design/data alignment
- **Source**: [Database Schema](../database-schema.md)

#### SG-008: Implement compliance audit triggers
- **Description**: Add database triggers (pgcrypto/Vault) to capture immutable audit logs when compliance requirements mandate it.
- **Owner**: Security Engineering
- **Stakeholders**: Legal, Compliance
- **Status**: Blocked pending requirements
- **Source**: [Database Schema](../database-schema.md)

## Product Design & UX

#### SG-009: Produce high-fidelity hero and ticker mockups
- **Description**: Create Figma frames for hero carousel, activity ticker, and approval meter interactions.
- **Owner**: Product Design
- **Stakeholders**: Mobile, Content
- **Status**: In progress
- **Source**: [UI/UX Plan](../ui-ux-plan.md)

#### SG-010: Validate theme colors for accessibility
- **Description**: Run contrast checks on light/dark theme palettes and gather feedback from accessibility reviewers.
- **Owner**: Product Design
- **Stakeholders**: Accessibility Consultant, Brand
- **Status**: Planned
- **Source**: [UI/UX Plan](../ui-ux-plan.md)

#### SG-011: Define shared motion token naming
- **Description**: Establish naming conventions for motion tokens (duration, easing) shared between Expo components and animations.
- **Owner**: Product Design
- **Stakeholders**: Mobile, Motion Design
- **Status**: Planned
- **Source**: [UI/UX Plan](../ui-ux-plan.md)

#### SG-012: Draft microcopy guidelines
- **Description**: Document tone, vocabulary, and neutrality guidance for in-app microcopy.
- **Owner**: Content Strategy
- **Stakeholders**: Legal, Product
- **Status**: Planned
- **Source**: [UI/UX Plan](../ui-ux-plan.md)

## Edge Functions & Services

#### SG-013: Prototype streaming summarization workflow
- **Description**: Experiment with streaming responses in `process-document` to improve summarization latency.
- **Owner**: Platform Engineering
- **Stakeholders**: Data Engineering
- **Status**: Planned
- **Source**: [Edge Functions](../edge-functions.md)

#### SG-014: Decide taxonomy processing split
- **Description**: Align on whether advanced categorization runs inside `process-document` or as a dedicated job for cost control and taxonomy scope.
- **Owner**: Data Engineering
- **Stakeholders**: Product Design, Taxonomy Working Group
- **Status**: Needs design/data alignment
- **Source**: [Edge Functions](../edge-functions.md)

#### SG-015: Implement ingestion dead-letter queue with alerts
- **Description**: Create a dead-letter table for repeated ingestion failures and wire Slack/email notifications.
- **Owner**: Platform Engineering
- **Stakeholders**: Data Operations, Support
- **Status**: Planned
- **Source**: [Edge Functions](../edge-functions.md)

#### SG-016: Benchmark search-proxy concurrency
- **Description**: Load test the `search-proxy` function under concurrent traffic and tune pooling configuration.
- **Owner**: Platform Engineering
- **Stakeholders**: Mobile, QA
- **Status**: Planned
- **Source**: [Edge Functions](../edge-functions.md)

## Ingestion Pipeline

#### SG-017: Design ingestion_sources table schema
- **Description**: Model metadata table with identifiers, cursors, run stats, and configuration JSON for each connector.
- **Owner**: Data Engineering
- **Stakeholders**: Platform, Analytics
- **Status**: In progress
- **Source**: [Ingestion Sources](../ingestion-sources.md)

#### SG-018: Prototype checksum-based dedupe
- **Description**: Build checksum comparison to avoid reprocessing unchanged source payloads.
- **Owner**: Data Engineering
- **Stakeholders**: Platform
- **Status**: Planned
- **Source**: [Ingestion Sources](../ingestion-sources.md)

#### SG-019: Establish shared HTML sanitizer
- **Description**: Implement reusable HTML-to-text sanitizer compatible with Edge Functions.
- **Owner**: Platform Engineering
- **Stakeholders**: Data Engineering
- **Status**: Planned
- **Source**: [Ingestion Sources](../ingestion-sources.md)

#### SG-020: Draft scraping escalation policy
- **Description**: Document procedure for handling markup changes or blocking from scraping-based connectors.
- **Owner**: Data Operations
- **Stakeholders**: Legal, Support
- **Status**: Planned
- **Source**: [Ingestion Sources](../ingestion-sources.md)

## Security & Compliance

#### SG-021: Implement encrypted admin audit trail
- **Description**: Use pgcrypto or Supabase Vault to encrypt audit entries for admin overrides.
- **Owner**: Security Engineering
- **Stakeholders**: Compliance, Platform
- **Status**: Planned
- **Source**: [Security & Privacy](../security-privacy.md)

#### SG-022: Evaluate Supabase Vault adoption
- **Description**: Assess whether Supabase Vault should protect sensitive future PII expansions.
- **Owner**: Security Engineering
- **Stakeholders**: Legal, Product
- **Status**: In discovery
- **Source**: [Security & Privacy](../security-privacy.md)

#### SG-023: Draft privacy policy and terms of service
- **Description**: Produce legal drafts covering privacy practices and user terms for the MVP beta.
- **Owner**: Legal Counsel
- **Stakeholders**: Product, Marketing
- **Status**: Planned
- **Source**: [Security & Privacy](../security-privacy.md)

#### SG-024: Integrate automated security scanning into CI
- **Description**: Add npm audit/Snyk scanning to the CI pipeline with alerting thresholds.
- **Owner**: Security Engineering
- **Stakeholders**: DevOps
- **Status**: Planned
- **Source**: [Security & Privacy](../security-privacy.md)

## Developer Workflow

#### SG-025: Write CONTRIBUTING guide and onboarding script
- **Description**: Document local setup, coding standards, and review process in a CONTRIBUTING guide with automation script.
- **Owner**: Developer Experience
- **Stakeholders**: Product Design, Engineering Leads
- **Status**: In progress
- **Source**: [Development Practices](../development-practices.md)

#### SG-026: Automate Expo preview comments on PRs
- **Description**: Configure CI to post Expo preview builds to pull requests.
- **Owner**: Developer Experience
- **Stakeholders**: Mobile, QA
- **Status**: Planned
- **Source**: [Development Practices](../development-practices.md)

#### SG-027: Establish review and release rotations
- **Description**: Define rotation schedule for code reviewers and release managers.
- **Owner**: Engineering Management
- **Stakeholders**: All Engineering Teams
- **Status**: Planned
- **Source**: [Development Practices](../development-practices.md)

#### SG-028: Add search-proxy contract tests
- **Description**: Implement contract tests once the search API schema is finalized.
- **Owner**: QA Engineering
- **Stakeholders**: Platform, Mobile
- **Status**: Blocked pending schema
- **Source**: [Development Practices](../development-practices.md)
