# Tools Mobile Category Centering Design

## Problem

On viewports below 640px, the shared ASL theme reduces `.shell` to `calc(100% - 40px)` while retaining `margin-inline: 0`. The tools page also applies its own symmetric page gutter to direct shell children. Together, these rules leave the category grid anchored toward the left, with visibly more empty space on the right.

## Scope

- Center the category cards on the `/tools/` mobile layout.
- Preserve the current card width, internal text alignment, spacing, and desktop layout.
- Avoid changing the shared shell behavior on unrelated routes.

## Chosen Design

Add a tools-page-specific mobile override for direct shell sections. At widths below 640px, those sections use the full available width and keep the existing symmetric `padding-inline: var(--page-gutter)` gutters. The category grid then fills the centered content box naturally; no transforms or hard-coded positional offsets are used.

## Verification

- Add a regression assertion covering the mobile tools shell override.
- Run the relevant tools design-contract tests.
- Build the static site.
- Inspect `/tools/` at a phone viewport and confirm equal left/right card gutters.
- Check a desktop viewport to confirm the two-column layout is unchanged.
