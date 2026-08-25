# ASL Engineering Portfolio Design System

This file records the design direction selected after comparing the supplied ASL identity with the ui-ux-pro-max database. Page-specific files in `pages/` may change layout details but may not override the brand identity or accessibility floor.

## Structural signature

Use the instrumented fault line described in `docs/superpowers/specs/2026-08-25-asl-design-system-integration-design.md`. Desktop pages use an asymmetric seven-lane frame around one measured vertical line. Mobile pages use one reading column and a short left-edge section marker.

Avoid the database patterns returned during research: Bento grids, masonry galleries, horizontal-scroll journeys, editorial magazine grids, Swiss twelve-column compositions, cyberpunk HUDs, rounded soft cards, blue accents, hover scaling, Caveat, and Quicksand.

## Core tokens

- Page: `#0B0D11`
- Surface: `#12161C`
- Raised: `#1C2129`
- Text: `#E6E8EB`
- Secondary: `#A7AEB8`
- Muted: `#78828F`
- Gold: `#D9A441`
- OK: `#5FA37A`
- Alert: `#C4553D`
- Info: `#6E8BA8`

Gold covers less than five percent of a viewport. Use hairlines before shadows and keep panel corners between two and four pixels.

## Typography

- Archivo: Latin display, headings, body, and interface text.
- Space Mono: labels, measurements, dates, and code metadata.
- Sora: Latin ASL mark only.
- Aref Ruqaa: Arabic عسل mark and watermark only.

Use 16px minimum body and control text. Interactive targets measure at least 44 by 44 CSS pixels.

## Interaction

- Keep primary navigation conventional and labeled.
- Show visible gold focus rings.
- Use border, surface, and color transitions lasting 150 to 240ms.
- Do not move or scale layout bounds on hover.
- Respect reduced motion and avoid decorative continuous animation.
- Give loading, error, empty, selected, expanded, and disabled states direct labels.

## Responsive floor

Verify at 1440px, 1024px, 768px, 375px, and 320px. Prevent page-level horizontal overflow. Contain code and wide data inside scrollable regions. Workbenches may show two panes above 1200px and use tabs or stacking on smaller screens.

## Source of truth

Use the full approved specification for route structure, components, accessibility, testing, and obsolete-app removal:

`docs/superpowers/specs/2026-08-25-asl-design-system-integration-design.md`
