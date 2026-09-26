# Promote the Apple-Style Design to the Main Homepage

## Goal

Replace the current English homepage at `/` with the complete Apple-style portfolio design that currently appears at `/apple-preview/`. Remove the preview route entirely so `/apple-preview/` is no longer generated or deployed.

## Homepage behavior

- The root route `/` renders the full design without removing or condensing its hero, selected-work, tools, or contact sections.
- The design continues to use the existing portfolio, work-category, and engineering-tool data.
- The wordmark links to `/`.
- Preview-only language is removed. In particular, the navigation does not show “Local preview,” and the footer does not describe the page as a concept preview.
- Existing project, tool, and email links remain functional.
- The design retains its responsive layouts, dark appearance, reduced-motion behavior, reduced-transparency behavior, keyboard focus styles, and minimum touch-target sizes.

## Route removal

- Delete the `app/apple-preview` route directory after relocating the page and stylesheet to homepage-owned files.
- Do not add a redirect, alias, compatibility page, or navigation entry for `/apple-preview/`.
- The production export must contain no `apple-preview` directory, sitemap entry, or application link.

## Architecture

The main page remains an App Router server component. The Apple-style markup becomes the implementation of `app/page.tsx`, and its CSS Module moves to a homepage-specific file under `app/`. The global marker class is renamed from preview terminology to homepage terminology while preserving the route-scoped shell-hiding behavior. No new package, client state, service, or data source is introduced.

The Arabic homepage and all non-homepage routes remain unchanged.

## Verification

Automated tests must prove that:

1. `/` renders the full homepage structure, headline, navigation, selected work, tools, and contact sections.
2. The homepage contains no preview-only labels.
3. The layout has no horizontal overflow at 390 and 320 pixels, and its primary actions remain at least 44 pixels high.
4. `/apple-preview/` returns the application’s not-found response when tested through the production server.
5. The static `out/` artifact contains the root homepage and contains no `apple-preview` directory.

Before publication, run the focused browser tests, TypeScript, content validation, the production build, and the repository test suite with its required local server. Publish the source branch first, then mirror the verified `out/` artifact to the live `main` branch without force-pushing.

## Rollback

The previous source and deployment commits remain in Git history. Rolling back requires reverting the source promotion commit and publishing the resulting static export; no data migration or external state cleanup is needed.
