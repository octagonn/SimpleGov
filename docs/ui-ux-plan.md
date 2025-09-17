# UI and UX Plan

## Design Principles
- Embrace an immersive, ESPN-style content hierarchy: bold hero cards, live badges, and modular stat bars that surface change over time.
- Maintain a motion-light experience prioritizing clarity, fast scrolling, and off-canvas overlays for detail views.
- Favor reusable atomic components (Card, Stack, Tag, MetricPill) defined in `packages/ui` with theme tokens.
- Optimize for one-handed mobile use: thumb zones, drag handles, and contextual floating actions.

## Tab Breakdown

### Home (For You)
- Hero carousel highlighting featured documents with summary headlines and quick actions (save, share, open source).
- Personalized feed cards combining AI summary bullets, category tags, and trend sparkline.
- Live activity rail (similar to ESPN bottom ticker) showing latest approvals, trending topics, and deadlines.
- Pull-to-refresh triggers feed recomputation via Edge Function endpoint.

### Search
- Primary search bar pinned to top with voice input option for accessibility.
- Category chips and filter sheet (timeframe, status, agency) anchored below search bar.
- Result cards reuse DocumentCard with emphasis on query highlights and badges for data freshness.
- Empty states offer curated keyword starters and explain search coverage.

### Hub
- Modular sections for organizations, topics, and saved collections.
- Horizontal scrollers with ESPN-inspired tile layouts showing logos, counts, and action buttons.
- Quick filters toggled between "Agencies", "Committees", and "Issues" to adjust dataset.
- Detail sheet reveals aggregated statistics, top documents, and subscribe CTA.

### Officials
- Grid/list hybrid layout featuring official portrait, approval meter, and seat details.
- Tap opens rich profile: biography snippet, recent votes, document mentions, and approval trend mini chart.
- Approval slider or button pair positioned below summary with tactile feedback.
- Provide context cards for organization relationships and policy focus areas.

### Account
- Profile header showing user preferences and progress through onboarding checklist.
- Sections for saved documents, notifications, analytics opt-in, and data export.
- Support settings such as theme, font size, and privacy toggles (tracking opt-out).
- Include support center entry point and roadmap teaser for transparency.

## Layout And Motion Guidelines
- Use an 8pt spacing grid with responsive breakpoints tailored for common device widths.
- Apply parallax-lite hero cards and subtle fade-in animations under 150ms for context switching.
- Keep worklets for gestures (react-native-reanimated) isolated in shared hooks to maintain testability.

## Theming Rules
- Maintain design tokens in `packages/ui/theme` for colors, typography, spacing, and elevation.
- Light theme: high-contrast background (#F7F9FC), card layers (#FFFFFF), accent colors (#1D3FFF primary, #FF6B35 alert).
- Dark theme: slate background (#0D1117), card layers (#161B22), consistent accent colors with adjusted luminosity.
- Support dynamic tinting for category tags; derive accessible color pairs with WCAG AA contrast.
- Mirror theme selection to system preference by default; allow manual override with persistence in `users.preferences`.

## Accessibility
- Target WCAG 2.1 AA: minimum 4.5:1 contrast for text, 3:1 for graphical elements.
- Provide scalable typography with base font size 17pt and user-adjustable increments.
- Ensure all actionable elements have 44x44pt touch targets and descriptive accessibility labels.
- Support screen reader navigation with logical ordering and skip-to-content shortcuts.
- Validate summaries for plain-language tone and avoid unexplained acronyms.

## Component Library Checklist
- DocumentCard (headline, summary bullets, metadata tags, CTA row).
- MetricPill (value, delta, context label) for approval trends and statistics.
- TopicTile (icon, label, secondary stat) optimized for horizontal scrollers.
- ProfileHeader (avatar, name, role, action buttons) reused across Officials and Account.
- Theme-aware IconButton and FloatingAction modules for consistent controls.

## TODO
- Produce high-fidelity Figma frames illustrating hero carousel, ticker rail, and approval meter interactions.
- Validate color choices with contrast tooling and gather feedback from accessibility reviewers.
- Define motion token naming (duration, easing) shared between Expo screens and Lottie animations.
- Explore microcopy guidelines to keep tone informative yet neutral.
