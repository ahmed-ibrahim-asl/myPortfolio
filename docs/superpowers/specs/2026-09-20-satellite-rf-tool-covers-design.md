# Satellite and RF Tool Covers Design

## Goal

Create one dedicated 16:9 raster cover for each of the five Satellite calculators and five RF Engineering calculators. The covers must make each tool recognizable at card size while matching the established ASL engineering-workbench visual system.

## Scope

The ten covers are:

| Route | Cover subject |
| --- | --- |
| `/tools/satellite/orbit/` | Earth, an elliptical orbit, and a spacecraft at a meaningful orbital position |
| `/tools/satellite/look-angles/` | A ground dish pointing toward a GEO satellite with visible azimuth/elevation geometry |
| `/tools/satellite/power-lifetime/` | Spacecraft solar arrays, battery storage, and a restrained lifetime/degradation trace |
| `/tools/satellite/doppler-delay/` | A moving satellite, directional RF wavefronts, and a timing/delay trace |
| `/tools/satellite/link-budget/` | Ground-to-space-to-ground RF chain with distinct uplink and downlink paths |
| `/tools/rf/frequency-bands/` | A disciplined spectrum display with separated carrier bands and waveform cues |
| `/tools/rf/antenna/` | A parabolic dish, feed focus, and a narrow directional radiation beam |
| `/tools/rf/rf-path/` | Transmitter, free-space propagation path, and receiver with distance and attenuation cues |
| `/tools/rf/noise-gt/` | Receiver front end with signal and noise energy separated visually |
| `/tools/rf/multiple-access/` | Frequency, time, and code channels arranged as distinct multiplexed resources |

## Visual System

Every asset uses the same visual grammar as the current workbench covers:

- dark charcoal or near-black technical environment;
- warm gold as the primary signal, energy, or focal color;
- restrained teal for secondary measurements and supporting paths;
- precise engineered forms with believable materials;
- high contrast and a readable central silhouette at small card sizes;
- controlled depth, subtle grid or instrument-panel structure, and crisp studio lighting;
- consistent landscape framing with safe margins for responsive crops.

The imagery must not use generic science-fiction scenes. Every depicted object or relationship must support the calculator's actual engineering purpose.

## Image Constraints

- Generate each cover as a separate raster asset.
- Use a 16:9 landscape composition suitable for tool cards.
- Do not include titles, words, formulas, numbers, logos, badges, or watermarks inside the image.
- Avoid illegible pseudo-text, decorative HUD clutter, gradients that conflict with the site's flat presentation, people, flags, brand marks, and cinematic space battles.
- Do not imply that the browser calculators operate real satellite equipment.
- Keep the important subject away from the outer crop edges.

## Asset and Data Integration

Final source assets will use stable versioned filenames under `public/media/tools/`, following the existing workbench convention. Each Satellite and RF catalog item will receive its own `coverImage` reference instead of falling back to a generic calculator thumbnail.

The existing public-image pipeline will generate responsive AVIF and WebP variants. The source images must remain within the repository's size limits and must be represented in the generated image manifest.

The English and Arabic category pages will reuse the same visual assets. Images are decorative catalog art, so no embedded translated text or locale-specific duplicate is needed.

## Quality and Verification

Each output will be inspected for:

- correct engineering subject;
- consistent ASL palette and lighting;
- clean 16:9 composition;
- absence of text, logos, and watermarks;
- useful distinction from the other nine covers;
- readability at the actual card size.

Repository verification will confirm:

- all ten tools have a dedicated cover path;
- every referenced image exists and decodes;
- the image pipeline reports no missing or oversized sources;
- responsive variants are generated;
- English and Arabic Satellite/RF category cards render the covers;
- existing tool catalog and design-contract tests still pass;
- the production build succeeds.

## Non-goals

- Replacing existing workbench or calculator covers.
- Redesigning tool cards or category layouts.
- Adding text overlays to cover artwork.
- Changing calculator behavior, formulas, routes, or localization.
