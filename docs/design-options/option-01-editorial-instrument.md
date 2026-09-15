# Design Option 01 — Editorial Instrument

Status: saved baseline for comparison. This is not yet the final implementation specification.

## Identity

- Header lockup: `ASL | بشمهندس عسل | AGENT / 101`.
- Portrait: natural-colour mounted 4:5 plate with crop marks.
- Portrait caption: `Ahmed Ibrahim Asl | 101 | أحمد إبراهيم عسل`.
- `101` is treated as a quiet systems-agent identifier, not a decorative badge.

## Visual system

- Page: `#0B0D11`.
- Surface: `#12161C`.
- Raised surface: `#1C2129`.
- Primary text: `#E6E8EB`.
- Identity accent: `#D9A441`.
- Project imagery keeps its natural colours; gold is not applied as an image filter.
- Blueprint grid can be toggled with an accessible `GRID ON / GRID OFF` control.
- Hairlines and crop marks carry structure; no decorative gradients, glass effects, or rounded-everything styling.

## Typography

- Latin UI and structure: Archivo.
- Arabic interface text: IBM Plex Sans Arabic.
- Arabic identity and editorial display: Aref Ruqaa.
- Data, navigation labels, and controls: Space Mono.
- Navigation labels: 10px in the visual study, with responsive sizing to be finalized during implementation.
- Primary button labels: 11px in the visual study.
- Portrait caption: English 11px, Arabic 12px, identifier 11px.

## Homepage composition

1. Bilingual navigation and grid toggle.
2. Editorial hero with `فكّك المشكلة` and `Break the problem down.` separated by deliberate breathing room.
3. Primary actions: `View selected work` and `Open engineering tools`.
4. Mounted Agent 101 portrait rail.
5. Evidence register for builds, domains, tools, and availability.
6. Natural-colour selected-project gallery.
7. Embedded preview of guided engineering workbenches.
8. Bilingual footer: `Question. Learn. Build. Test.` / `اسأل. تعلّم. ابنِ. اختبر.`

## Responsive behavior

- Arabic display stays on one line when space permits and reflows deliberately on narrow screens.
- Hero becomes one column before the portrait or copy becomes cramped.
- Project layouts collapse to a readable single-column sequence.
- Navigation becomes a compact menu while preserving the grid toggle.
- Buttons remain at least 44px high and keyboard focus remains visible.

## Visual study source

The latest interactive study is stored at:

`.superpowers/brainstorm/4373-1787915688/content/site-direction-02-refined-v8.html`
