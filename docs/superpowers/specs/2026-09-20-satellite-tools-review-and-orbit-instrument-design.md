# Satellite Tools Review and Orbit Instrument Design

## Goal

Review the uncommitted tool work created in the `feature/image-performance-seo` worktree, correct omissions or regressions, align the affected interfaces with the ASL design system, and make the satellite orbit calculator easier to understand and operate.

This work is intentionally limited to the current tool changes and their shared registrations. It does not redesign unrelated portfolio pages or refactor unrelated calculators.

## Confirmed requirements

- Remove both controls in the navigation strip shown above the satellite calculator:
  - the satellite-module dropdown;
  - the calculation-convention dropdown.
- Use kilometres for Earth's gravitational parameter everywhere users see or enter it. Display the standard engineering value as `398600.4418 km³/s²`; do not expose `m³/s²` for this parameter.
- Retain numerical compatibility by converting at a well-defined engine boundary if internal SI calculations still need metres.
- Make the orbital visualization substantially more detailed and interactive while keeping it responsive, accessible, and consistent with the existing design system.
- Review Claude's newly created tools and supporting registrations for missing behavior, broken routes, incorrect units, inaccessible controls, and design-system drift.
- Generate static imagery only when the audit identifies a missing static cover. The interactive orbital visualization must remain code-native SVG rather than a generated bitmap.

## Selected approach

Build a focused SVG orbital instrument and perform a bounded integration audit.

This approach is preferable to a cosmetic patch because the current plot does not expose enough orbital state to teach the relationship between position, speed, radius, and swept area. It is preferable to Canvas or WebGL because SVG preserves semantic labeling, keyboard accessibility, sharp rendering, theme integration, and low bundle cost.

## Interface design

### Page structure

The calculator page will flow directly from its heading into the two-column workbench. Removing the navigation strip eliminates an unnecessary horizontal band and keeps the route itself as the source of truth for the selected tool.

The calculation convention will be fixed to engineering constants. A compact read-only note in the calculation details will state the constants used instead of presenting a choice that most visitors do not need.

### Orbit controls

Existing orbit calculation modes remain available in the input panel because they change the problem being solved rather than navigate to a different page. Presets remain compact secondary buttons.

The orbit visualization will include:

- a time scrubber for one complete orbital period;
- play/pause and reset controls;
- a readable elapsed-time or orbital-fraction output;
- keyboard-operable controls with explicit accessible labels;
- no automatic motion when reduced motion is requested.

### Orbital instrument

The SVG will use one consistent physical scale for Earth, the orbital path, the foci, and radius lines. When Earth would be too small to read, the instrument may add a clearly labeled magnified Earth inset or minimum-size marker, but it must not imply that the enlarged marker shares the plot scale.

The visualization will show:

- the orbital ellipse and both foci;
- Earth at the occupied focus;
- the current satellite position;
- the current radius, altitude, and speed;
- perigee and apogee markers with their values;
- a tangent velocity vector whose magnitude is conveyed numerically rather than by an ambiguous decorative arrow;
- equal-duration swept-area sectors for comparison;
- concise annotations that update with the scrubber;
- a legend that distinguishes geometry, live state, and comparison state.

The interaction must remain usable at narrow widths. The SVG may scroll horizontally only as a last resort; labels should reflow or move to a metric rail before requiring horizontal scrolling.

## Visual system

No parallel palette or typography system will be introduced. The component will derive its appearance from the existing tokens:

- signal blue: the existing `--signal` token;
- surface: `--instrument` / `--bg-surface`;
- primary and secondary text: `--ink` and `--muted`;
- structural rules: `--rule`;
- warning or comparison accent: the existing restrained gold used by satellite plots.

The display face remains limited to the page heading. Interface text uses the existing UI face and numerical readouts use the existing monospace face. Borders, corner radii, and spacing follow `SatelliteWorkspace.module.css` rather than introducing detached card styling.

The signature element is the live equal-time orbital sweep: it is specific to Keplerian motion and teaches a real relationship instead of adding generic animation.

## Units and data flow

The public orbit input model will expose `muKm3S2`. Its default is `398600.4418`. UI labels, help text, shared-link serialization, saved calculations, printed givens, substitutions, and visible constant summaries will use `km³/s²`.

The engine will normalize that value once at its input boundary. Existing internal functions may continue to calculate with metres and seconds until a broader unit refactor is justified. Backward-compatible shared links containing legacy `mu` values in `m³/s²` will be decoded and normalized so saved links do not silently change their result.

The fixed calculation mode will use engineering constants. State restoration will tolerate old links containing the removed `mode` value but will not expose or perpetuate that selector in newly generated links.

## Claude-work audit

The audit will cover the uncommitted new cipher/hash/AES work and every file it modifies or registers. Checks include:

- route and registry completeness;
- canonical calculation vectors and round trips;
- input validation, empty/error states, reset behavior, and responsive behavior;
- accessible names, focus visibility, keyboard operation, and meaningful live regions;
- design-token usage and dark/light contrast;
- static cover presence, relevance, and theme pairing;
- metadata, search seeds, calculator visual contracts, sitemap inclusion, and Arabic-route effects;
- accidental coupling with unrelated dirty files.

Findings will be fixed only when they are within this tool-work scope. Unrelated existing changes will be preserved.

## Error handling

- Invalid or non-positive orbital parameters produce a specific inline error and suppress misleading results.
- Apogee below perigee, radii inside Earth, and invalid bound-orbit states retain explicit validation.
- Animation stops safely when inputs become invalid.
- Legacy shared-state normalization is deterministic; malformed values are rejected rather than guessed.

## Testing and verification

Tests will be written or updated before implementation changes where behavior is changing.

Required automated coverage:

- `muKm3S2` defaults, conversion, validation, serialization, and legacy-link restoration;
- absence of both removed dropdowns on satellite and RF calculator pages;
- fixed use of engineering constants;
- orbital position and equal-time sweep calculations at perigee, apogee, and intermediate fractions;
- play/pause/reset controls and reduced-motion behavior;
- accessible labels and keyboard-operable time control;
- responsive layout without overflow at representative mobile and desktop widths;
- all existing satellite, RF, newly added tool, design-contract, and SEO tests.

Final verification will include the complete Node tool suite, the configured SEO Vitest suite, a production build, and browser screenshots in both themes at mobile and desktop widths. Claims will report the exact commands and outcomes.

## Deliverables

- reviewed and corrected tool implementation in the existing worktree;
- redesigned SVG orbital instrument and controls;
- kilometre-based gravitational-parameter interface;
- removal of both top dropdowns;
- regression and browser tests;
- any necessary static covers discovered by the audit, saved under the existing media conventions;
- a concise report of findings, fixes, remaining risks, and verification evidence.
