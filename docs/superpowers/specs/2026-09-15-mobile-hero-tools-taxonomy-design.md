# Mobile Hero and Circuit Design Taxonomy

## Goal

Improve the mobile homepage's first screen and simplify the tools taxonomy without changing the desktop hero or breaking existing tool URLs.

## Mobile homepage

### Identity card

The mobile identity stays above the headline and remains a single horizontal row. The portrait grows from 72–84 px to 104–112 px. The text column uses the full professional name and separates the role from the capability line:

- Ahmed Ibrahim Asl
- Embedded Systems & IoT R&D Engineer
- PROTOTYPING · FIRMWARE · SYSTEM INTEGRATION

The card must remain within the viewport at 320, 360, 390, and 430 px. The image and copy should feel proportional, and the text may wrap naturally without overlapping the portrait.

### Headline and supporting copy

The mobile headline uses two deliberate phrase blocks:

1. Your hardware idea.
2. A prototype ready to test.

The first phrase uses the primary text color and the second uses the gold accent. A phrase may wrap internally only when required at the narrowest supported viewport; an orphaned article such as a single “A” must never appear on its own line.

The mobile supporting paragraph keeps its current wording but uses a smaller type size than the current 16 px treatment, with a readable line height and a width that follows the headline.

### Mobile navigation and actions

The mobile menu control becomes a 48 px icon button with a three-line menu icon when closed and a close icon when open. Its accessible name remains “Open navigation” or “Close navigation”; the visible `MENU +` text is removed.

Both hero calls to action remain full-width on narrow screens, share the same height, and keep their labels on one line from 320 px upward:

- SEE SELECTED PROJECTS
- EXPLORE FREE ENGINEERING TOOLS

Keyboard focus, reduced-motion behavior, light/dark contrast, and the existing navigation overlay behavior remain intact.

## Tools taxonomy

The top-level tools hub removes separate cards for Fundamentals, Resistors, Control Design, and Power Conversion & Supplies. Their tools appear under one top-level Circuit Design destination.

The Circuit Design page presents tools in this order:

1. Fundamentals
2. Resistors & Networks
3. Timing, Filters & Analog Design
4. Control Design
5. Power Conversion & Supplies

Existing tool records keep their specific category labels so search, card context, and filtering remain descriptive. The aggregator decides which categories belong to Circuit Design and assigns their display section. Legacy category paths (`fundamentals`, `resistors`, `control-design`, `power-conversion-supplies`, and `timing-filters`) resolve to the consolidated Circuit Design page and use the Circuit Design canonical metadata.

Tool-page breadcrumbs for these categories link back to `/tools/category/circuit-design/`.

## Implementation boundaries

- Update the homepage markup only where explicit line and identity hierarchy are needed.
- Update responsive styles in the existing homepage stylesheet rather than adding another theme layer.
- Render the menu icon with CSS or inline semantic spans; no image asset or icon package is required.
- Centralize Circuit Design membership and section ordering in the tool category data module.
- Keep Workbenches, Text & Encoding, Conversions, Number Systems, and Physics & Math as top-level categories.
- Do not change desktop homepage copy or layout.
- Do not translate copy or add locale routes.

## Error and compatibility behavior

- Unknown category slugs still return the existing not-found response.
- Old category URLs remain statically generated and render the consolidated catalog.
- Every tool appears once in the consolidated Circuit Design page.
- Empty groups are not rendered.

## Verification

Automated tests must first fail against the current implementation, then pass after the change. They cover:

- the exact mobile name, role, capability line, and headline;
- portrait size and same-row identity layout at 320, 360, 390, and 430 px;
- no horizontal overflow, headline orphan, CTA wrapping, or CTA height mismatch;
- icon-only menu semantics and open/close state;
- desktop hero and portrait remaining unchanged;
- removal of the four former top-level cards;
- consolidated Circuit Design membership, ordering, uniqueness, and legacy routes;
- TypeScript, content validation, and production static export.

A browser review in dark and light themes will confirm the visual proportions after automated checks pass.
