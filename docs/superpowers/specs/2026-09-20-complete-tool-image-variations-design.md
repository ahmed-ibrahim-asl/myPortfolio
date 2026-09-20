# Complete Tool Image Variations

## Goal

Give every one of the 70 public tools a distinct, novice-readable raster cover and make the resistor family visibly distinguishable at a glance. Each selected concept receives a compact square mobile composition and a more detailed landscape desktop composition.

## Scope

Create 36 new source images:

- 12 square mobile covers and 12 landscape desktop covers for the tools that currently lack raster artwork: Gradify, SMPS Designer, ROT Explorer, Air-Core Coil Designer, LC Resonance Designer, Band-Pass Filter Designer, Cascaded Op-Amp Gain Designer, Control Design Assistant, Logic Gate Designer, Bridge Rectifier Designer, Linear Regulator Stability Designer, and Buck Converter Designer.
- Six replacement square mobile covers and six replacement landscape desktop covers for the resistor family: four-band color code, five-band precision color code, series resistors, parallel resistors, voltage divider, and LED current-limiting resistor.

This delivers raster-art coverage for all 70 tools. It does not create a bitmap for every possible numeric input. Values, resistor bands, circuit states, and results remain accurate dynamic UI rendered from calculator state.

## Visual Direction

All assets use the existing ASL dark technical palette: near-black background, restrained gold accents, cyan signal paths, tactile components, and high contrast. Images must contain one dominant idea, avoid decorative clutter, avoid paragraphs, avoid watermarks, and remain understandable without engineering knowledge.

Mobile compositions are 1:1, centered, and limited to the essential object or relationship. Desktop compositions are 16:9 and may add a second explanatory object, signal path, or before/after state. Generated text is avoided except for short universal labels or numerals that can be reliably inspected.

The resistor images must be visibly different:

- Four-band: one beige resistor with four prominent bands.
- Five-band: one blue precision resistor with five prominent bands.
- Series: multiple resistors in one continuous path.
- Parallel: multiple resistor branches between common rails.
- Divider: two resistors with a clear midpoint output tap.
- LED limiter: battery, resistor, and glowing LED in one current path.

## Integration

Store versioned source files under `public/media/tools/` and `public/media/tools/mobile/`. Register the new desktop/mobile pairs in the public-image registry. Preserve the existing `PublicImage` art-direction contract: mobile assets below 640px and landscape assets above it. Run the responsive image pipeline to produce AVIF and WebP variants at role-appropriate widths.

Do not remove the existing SVG diagrams used inside interactive tools; those remain useful for accurate live state. The new raster images serve discovery cards and static introductions.

## Validation

- Automated coverage must prove every one of the 70 tools has a registered raster family and a mobile composition.
- Every source must decode, meet its intended aspect ratio, and stay within the source-size ceiling.
- Generated AVIF/WebP variants must remain within the tool-cover byte budget.
- Browser checks at 390px and 1440px must show the correct art-directed source with no horizontal overflow.
- The full test suite, TypeScript check, and production build must pass before deployment.

## Delivery

Commit source assets, reproducible prompts, responsive variants, registry changes, and tests. Publish source and static deployment branches only after verification. Existing unrelated working-tree edits remain untouched.
