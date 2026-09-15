# Circuit Design and ROT Explorer — first release

Approved direction: Circuit Design is a category of independent tools, not a combined workbench. Reuse the NE555 and filter routes. Text & Encoding is separate.

## Scope

1. Replace Timing & Filters in the main category hub with Circuit Design; preserve the old category URL as a compatibility page. Move standalone reactance/RMS/RC-time calculations to Fundamentals. Group circuit tools on one category page without adding another navigation layer.
2. ROT Explorer: shifts 1–25, encode/decode, case/punctuation preservation, alphabet mapping, all-shift comparison, copy/swap, and SVG explanation download. Local processing only. Not encryption.
3. Independent new pages for an air-core coil estimator, LC resonance designer, and buffered RC band-pass designer. Existing low/high-pass and NE555 routes remain available. Interactive schematics show real component values and expose component explanations.
4. Unit tests before implementation for transformation, inverse shifts, coil geometry, resonance, and filter transfer magnitudes. Browser tests for routes, interactive changes, and light/dark/mobile layouts.

## Technical bounds

- Single-layer air-core coil: Wheeler estimate, radius/length in inches internally, result in microhenries. Warn for short coils and impossible winding pitch. No inferred Q, saturation, SRF or current rating.
- LC: ideal parallel tank resonance, optional series-loss Q estimate at resonance. No oscillator startup or amplitude claim.
- Band-pass: high-pass RC followed by an ideal unity buffer and low-pass RC. Label stage corners separately from overall half-power edges. Show analytic magnitude response; not SPICE or a PCB-ready RF design.
- Subsequent releases: Hartley/Colpitts/crystal oscillators, modulators and specific TX/RX designs after individual circuit validation; no placeholder tool cards in this release.
- Preserve current fonts, semantic theme tokens, 44px controls, and responsive layouts. Signature visual: live schematic/alphabet mapping, not decorative cards.

## Execution

- [x] Unit tests and pure math/text functions.
- [x] Shared scoped tool layout, ROT view and SVG export.
- [x] Circuit pages and selectable schematics.
- [x] Category grouping, old URLs, catalog and sitemap integration.
- [x] Build, browser checks and site UI audit. Keep local until publishing is requested.
