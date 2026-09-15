# Article and Tool Cover System Design

## Objective

Bring the field-note article route into the current ASL design system and complete a coherent visual-cover system for the full engineering tool catalog without reintroducing the previous blue, cyberpunk, watermark, or over-detailed visual language.

The result must work for both technical and non-technical visitors. Each cover should communicate the tool's purpose at a glance, while the title and description remain responsible for the exact explanation.

## Confirmed root cause

The article markup currently uses `article-page asl-article`, while the complete ASL article overrides target `.asl-page.article-page`. The missing `asl-page` class means those selectors never match. Global `.shell` rules from the current theme also make article shells full width, but the article route is not included in the selector that restores the shared page gutters.

Consequences visible in the live page:

- Article header, content, and footer touch the viewport edges.
- Legacy blue article surfaces and borders remain active.
- The old hard shadow remains active.
- The legacy `//` heading marker remains visible.
- The article body falls back to the old reading font instead of the ASL type system.

## Article layout design

### Structure

- Keep the current editorial structure: article header, metadata, author rail, readable article body, table of contents, pagination.
- Apply the shared adaptive page gutter to the header, article layout, and footer rather than padding the entire article twice.
- Keep the article body at a comfortable reading measure, approximately 700 to 760 pixels.
- Use the three-column layout on wide screens, reduce to content plus table of contents on medium screens, and stack all supporting rails on small screens.
- Prevent code blocks, tables, images, and long links from creating horizontal overflow.

### Visual system

- Page background: existing ASL near-black page token.
- Article surfaces: existing ASL surface and sunken tokens.
- Primary text: existing ASL white token.
- Secondary text: existing ASL muted gray token.
- Dividers and borders: existing ASL line token.
- Accent: ASL gold only where hierarchy or interaction needs it.
- Remove legacy blue borders, purple panels, pixel shadows, uppercase heading treatment, and the `//` pseudo marker.
- Use the existing Archivo-led ASL type system with the utility mono face only for metadata and technical labels.

## Tool cover architecture

The catalog contains 41 tools: 5 interactive workbenches and 36 calculators.

### Workbench covers

Create one restrained 16:9 AI-generated cover for each workbench:

1. AI Script Generator
2. Security Mission
3. Interactive PID Simulator
4. Sensor Code Generator
5. ESP32 Battery Life and Power Estimator

Each image must show a simple physical or diagrammatic metaphor for the workflow. Covers must not contain generated words, labels, fake interface text, watermarks, neon cyberpunk scenery, or decorative complexity that competes with the card copy.

### Calculator covers

Create deterministic vector covers for all 36 calculators from their actual formulas, circuit topology, components, or conversion relationships. This keeps technical diagrams accurate, lightweight, searchable by source data, and visually consistent. AI raster generation will not be used for formula and circuit diagrams where it may hallucinate component connections or notation.

The existing `visualKey` and calculator thumbnail pipeline remains the source of truth. Missing or generic thumbnails will receive a purpose-specific vector composition.

### Shared cover grammar

- Aspect ratio: 16:9.
- No text baked into the image.
- Dark graphite or near-black base, never a white field.
- ASL gold is the identity marker, not a full-image filter.
- Cool blue may identify signals, traces, plots, or data only.
- Warm white is used for components and important geometry.
- One clear focal object or relationship per image.
- No gradients unless they represent light, depth, or signal intensity.
- No rounded cards, fake dashboards, glowing brains, floating code walls, or generic AI imagery.
- Covers must remain legible at small catalog-card size.

## Image-generation backlog preserved from earlier requests

The following visual directions remain available for project evidence, educational notes, prompt guides, and future content assets. They are not to be mixed randomly into tool covers:

- `/defectview`
- `/layer`
- `/machineview`
- `/machineview360`
- `/sequence`
- `/beforeafter`
- `/explodeview`
- `/topview`
- `/3dbillboard`
- `/handwritten`
- `/metaad`
- `/magazinecover`
- `/floating3d`
- `/goldenhour`
- `/wideshot`
- `/adcreativecode`
- `/footwaretechpac`

For every generated site asset, preserve the final prompt or generation brief in a versioned prompt pack. This allows recreation in the GPT web interface and keeps image work separate from source code.

Future image batches remain in scope:

- Tool covers for the complete catalog.
- Project and work evidence covers where the current source image is weak or missing.
- Educational note covers for C, C++, Python, Bash, Dart, Flutter, Linux, networking, electronics, and CTF walkthroughs.
- Prompt-guide examples that demonstrate visual shortcuts.
- Simple diagrams or walkthrough assets used inside tool pages.

## Components and data flow

- `data/tools.js` owns workbench cover paths.
- `data/calculators.js` owns calculator identity, category, tags, and `visualKey`.
- `UnifiedToolsIndex` renders both kinds in one searchable and filterable catalog.
- Workbench cards consume optimized raster assets from `public/media/tools/`.
- Calculator cards consume deterministic vector thumbnails through `CalculatorThumbnail`.
- A prompt manifest in `docs/assets/` records each raster asset's purpose, constraints, prompt, output path, and approval state.

## Accessibility and performance

- Decorative card covers use empty alternative text because the adjacent title and description provide the accessible name and purpose.
- Tool detail images that explain content require meaningful alternative text or a nearby text explanation.
- Raster covers must be exported at a sensible web resolution and compressed.
- No layout shifts: every cover reserves its 16:9 space before loading.
- Focus states, text contrast, and minimum touch targets remain part of the existing design contract.

## Testing and verification

### Automated checks

- Add a regression assertion that the article route uses the ASL page contract.
- Assert adaptive left and right gutters for the article header, layout, and footer at 390, 768, 1366, 1920, 2560, and 3440 pixels.
- Assert no horizontal overflow at the same widths.
- Assert that article body colors, shadow, font, and heading pseudo marker match the ASL design contract.
- Assert that all 41 catalog entries render a cover through either a workbench raster or calculator vector path.
- Assert that all workbench raster paths resolve to real assets.

### Manual visual checks

- Article header, body, rails, code blocks, tables, and footer at mobile, tablet, desktop, and ultrawide widths.
- Tool catalog card balance, cover crop, text contrast, search, and filtering.
- Individual tool pages for responsive containment and design-system consistency.
- Reduced-motion and keyboard navigation checks.

### Completion gate

Run the focused regression tests first, then the full test suite, production build, and browser screenshots at all required widths. Do not mark the work complete if any route overflows, any cover is missing, or any legacy blue article treatment remains.

## Scope boundaries

- This phase fixes the article route and establishes the full tool-cover system.
- It preserves all previous image-generation requests in a prompt manifest and backlog.
- It does not rewrite the article content or alter tool calculations.
- It does not commit or push repository changes unless the user explicitly requests it.
