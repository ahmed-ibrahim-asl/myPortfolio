# Decision Log

Settled decisions. Reference these instead of reopening without new evidence.

---

## DEC-001: Approved visual direction

Decision: Option 01 "Editorial Instrument"
Source: `docs/design-options/option-01-editorial-instrument.md`
Date: Pre-existing (committed before rebuild)
Reason: Selected by owner. No alternative evaluation needed.
Status: FINAL

## DEC-002: Base path

Decision: `/myPortflio` (with typo matching actual GitHub repo slug)
Date: Pre-existing
Reason: Changing it requires renaming the GitHub repo and updating all asset references.
Status: FINAL (unless owner confirms repo rename)

## DEC-003: Static export (no server)

Decision: `output: "export"` - no API routes, server actions, or runtime server.
Date: Pre-existing (production requirement)
Reason: GitHub Pages hosting requires static output.
Status: FINAL

## DEC-004: Design token system source of truth

Decision: `app/design-tokens/` files are the authoritative token source.
Date: 2026-08-29
Reason: Files are complete, well-structured, match the spec exactly, and are already imported in layout.tsx.
Status: FINAL - do not duplicate token values in component CSS

## DEC-005: Font choices

Decision: Archivo (Latin), IBM Plex Sans Arabic (Arabic UI), Aref Ruqaa (Arabic display/identity), Space Mono (labels/code/data), all via Google Fonts.
Date: 2026-08-29 (from token file)
Reason: Matches spec exactly.
Status: FINAL - add self-hosted files only if performance requires it

## DEC-006: Legacy writing URLs

Decision: Preserve `/writing/*` routes. Add `/notes` as an alias. Do not use runtime redirects (breaks static export).
Date: 2026-08-29
Reason: Spec says "Preserve existing /writing URLs until link and SEO compatibility is proven." Static-compatible approach.
Status: PENDING implementation details in Phase 4

## DEC-007: No em dash in new copy

Decision: No em dash character anywhere in new UI copy, content, comments, or documentation.
Date: Spec requirement
Reason: Explicit non-negotiable rule.
Status: FINAL
