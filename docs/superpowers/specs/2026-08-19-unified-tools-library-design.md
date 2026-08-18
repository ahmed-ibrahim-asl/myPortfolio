# Unified Tools Library Design

**Date:** 2026-08-19
**Status:** Approved by the user on 2026-08-19

## Objective

Replace the current split Tools page—36 electronics calculators followed by five advanced workbenches—with one category-first engineering tool library. Visitors should understand the available fields before seeing individual tools, find a known tool quickly through one global search, and browse a focused category without loading the entire catalog into the first screen.

The redesign must remain easy to expand. Adding a future tool should require one catalog record with taxonomy and search metadata, not another hand-built page section.

## User experience

### Tools hub

`/tools/` becomes a directory rather than a complete catalog. Its initial view contains:

1. A concise introduction explaining that the library contains calculators, generators, simulators, and guided workbenches.
2. One prominent search field that searches every tool and capability.
3. Six top-level category cards.
4. A small help line explaining that visitors can search directly or open a category.

No individual-tool grid appears until the visitor enters a search term. This prevents the first page from exposing all 41 destinations at once.

While the search field contains text, results appear directly below it as a compact mixed list. Results may contain calculators or advanced workbenches and use one consistent card treatment. Selecting a result opens the existing focused tool route.

### Category pages

Selecting a category opens a static route at `/tools/category/<category-slug>/`. Each category page contains:

- a breadcrumb back to Tools;
- a category title and one short explanation;
- subcategory filter controls when the category has more than one meaningful subgroup;
- a focused list of tools in that category;
- the same global tool search, so visitors do not need to return to `/tools/` to navigate elsewhere.

Subcategory filters update the current category page without creating another URL level. This keeps the hierarchy understandable while avoiding thin pages for every small subgroup.

### Existing tool pages

All existing tool URLs remain unchanged, including the 36 calculator routes and five workbench routes. Existing bookmarks, search results, canonical URLs, and GitHub Pages links continue to work.

Tool pages retain their local discovery controls where already present. Their “browse all” destination points to the unified Tools hub or the most relevant category page.

## Information architecture

```text
Tools (/tools/)
├── Electronics & Power (/tools/category/electronics-power/)
│   ├── Circuits
│   ├── Resistors
│   ├── Timing & Filters
│   └── Batteries & Power
├── Embedded & IoT (/tools/category/embedded-iot/)
│   ├── Sensors
│   ├── Communication
│   └── Firmware & Interfaces
├── AI & Computer Vision (/tools/category/ai-computer-vision/)
│   ├── Detection
│   ├── Segmentation
│   ├── Depth
│   └── Sensor ML
├── Control & Engineering (/tools/category/control-engineering/)
│   ├── PID & Simulation
│   ├── Physics
│   └── Engineering Math
├── Security & Networks (/tools/category/security-networks/)
│   ├── Network
│   ├── Web
│   ├── Wireless
│   └── Active Directory
└── Data & Conversion (/tools/category/data-conversion/)
    ├── Number Systems
    ├── Encoding
    └── Unit Conversion
```

### Classification rules

- Every destination has one primary category and one primary subcategory.
- A destination may declare additional search topics without appearing in several category grids.
- Calculators and workbenches are not separate navigation classes. A `type` field may label a result as Calculator, Generator, Simulator, or Workbench, but type does not create a second hierarchy.
- Broad workbenches represent their most important user goal. Their internal capabilities become searchable terms.
- The ESP32 Battery Life & Power Estimator belongs to Electronics & Power / Batteries & Power.
- The Sensor Code Generator belongs to Embedded & IoT / Sensors and is also searchable through communication, firmware, ESP32, MQTT, BLE, I2C, SPI, and camera terms.
- Model Mission belongs to AI & Computer Vision and is searchable through YOLO, YOLOE, U-Net, detection, segmentation, depth, classification, and sensor ML terms.
- The PID Simulator belongs to Control & Engineering / PID & Simulation.
- Security Mission belongs to Security & Networks / Network and is searchable through its web, wireless, traffic, exploitation, credential, Active Directory, and pivoting capabilities.
- Existing electronics calculators are distributed among Electronics & Power, Control & Engineering, and Data & Conversion according to their current subject rather than kept under a single “calculators” parent.

The existing calculator categories map deterministically into the new hierarchy:

| Existing calculator category | New primary category | New subcategory rule |
|---|---|---|
| Fundamentals | Electronics & Power | Circuits, except battery-related tools use Batteries & Power |
| Resistors | Electronics & Power | Resistors |
| Timing & Filters | Electronics & Power | Timing & Filters |
| Conversions | Data & Conversion | Unit Conversion |
| Number Systems | Data & Conversion | Number Systems or Encoding according to the tool’s current subject |
| Physics & Math | Control & Engineering | Physics or Engineering Math according to the tool’s current subject |

The catalog stores the resolved category and subcategory explicitly. Runtime code does not guess classification from display text.

## Search model

One immutable catalog becomes the source for category cards, category routes, result cards, result counts, metadata, and search.

Each record contains:

- stable ID and existing destination URL;
- title and concise description;
- result type;
- primary category and subcategory;
- search keywords and aliases;
- optional featured rank;
- optional visual metadata for its original schematic thumbnail or workbench icon.

Search is case-insensitive and matches normalized title, description, category, subcategory, keywords, and aliases. Exact title and alias matches rank first, followed by title-prefix matches, keyword matches, and description matches. Results are capped to a useful first set rather than rendering the complete catalog for broad one-letter queries.

Representative behavior:

| Query | Expected leading destination |
|---|---|
| `resistor` | Resistor calculators |
| `YOLO` | Model Mission / AI Script Generator |
| `MQTT` | Sensor Code Generator |
| `Nmap` | Security Mission |
| `PID` | Interactive PID Simulator |
| `binary` | Binary and number-system calculators |

The search input supports keyboard navigation. Arrow keys move through suggestions, Enter follows the active result, and Escape closes the result panel without clearing the query. Results remain normal links so browser status, context menus, and accessibility semantics work correctly.

## Visual and interaction design

The redesign retains the established dark engineering-console identity, square geometry, cyan focus color, green system status color, and readable type scale.

### Hub signature

The memorable element is a compact “tool routing panel”: the search field sits above a six-cell category matrix, with each card showing a field name, a plain-language purpose, its subcategories, and the current tool count. Structural labels describe real taxonomy instead of decorative sequence numbers.

### Category cards

- The entire card is one link.
- Cards use a consistent height without cropping descriptions.
- Each card includes the category name, one sentence, subcategory labels, and tool count.
- Hover and focus use border, color, and a restrained offset; there is no arrow-only action.
- Counts come from the catalog rather than hard-coded copy.

### Search results

- Results use compact rows on desktop and full-width cards on mobile.
- Each result exposes title, type, category path, and one short description.
- Long descriptions are clamped rather than allowed to dominate the list.
- Search results never mix a separate calculator style with a workbench style.

### Category results

- Subcategory controls are readable pressed-state filters.
- Desktop filters wrap naturally.
- Mobile filters use a horizontally scrollable row with visible edge affordance and no page-level horizontal overflow.
- Tool results use one or two columns depending on available width.

## Component boundaries

### Tool catalog

A shared catalog adapter combines existing calculator metadata and advanced workbench metadata into one normalized record type. The original calculator registry and workbench implementations remain independent; the adapter provides discovery metadata only.

### `ToolLibrarySearch`

Owns query state, ranking, result limit, keyboard navigation, live result count, and empty-state guidance. It accepts the normalized catalog and an optional current-category hint.

### `ToolCategoryGrid`

Derives category counts and renders the six category links. It does not contain hard-coded counts or tool lists.

### `ToolCategoryPage`

Resolves the category slug, derives relevant subcategories, applies the client-side subcategory filter, and renders consistent result cards. Static parameters generate all six routes for GitHub Pages.

### `UnifiedToolCard`

Renders calculators and workbenches through one semantic link interface while allowing their existing visual metadata to differ.

These components share catalog helpers rather than importing one another’s state.

## Data flow

At build time, the unified catalog generates category counts, static category routes, metadata, and the complete searchable payload. At runtime, search and subcategory selection are client-local and require no API, backend, account, or persistence.

```text
Calculator metadata ─┐
                     ├─> normalized tool catalog
Workbench metadata ──┘          │
                                ├─> /tools search
                                ├─> category cards and counts
                                ├─> static category pages
                                └─> unified result cards
```

## URL and SEO behavior

- Preserve `/tools/` and every existing `/tools/<tool-slug>/` route.
- Add six static `/tools/category/<category-slug>/` routes.
- Each category page receives a natural title, description, canonical URL, breadcrumb schema, and links to every tool it contains.
- The Tools hub links to all six categories, preventing orphan category pages.
- Individual tools link back to Tools or a relevant category where the local interface already exposes discovery navigation.
- Category pages are included in the XML sitemap.
- Search state is not encoded as indexable query-string pages.

## Empty and error states

- An empty search field shows category navigation, not all tools.
- A query with no matches explains that no tool matched and offers two or three relevant category links plus a clear-search action.
- An invalid category slug uses the existing not-found page.
- A catalog record with an unknown category or missing destination fails validation during tests and build preparation.
- The search panel closes cleanly after navigation and never leaves an invisible keyboard focus trap.

## Accessibility and responsive behavior

- Search and filter controls use at least 44×44px interactive targets and 16px form text.
- Result counts use a polite live region.
- All category cards and result cards are single semantic links with visible keyboard focus.
- Search suggestions expose combobox/listbox semantics and active-result state.
- Subcategory filters expose pressed state.
- Category structure remains understandable without color.
- No horizontal page overflow at 320, 390, 768, 1024, or 1440px.
- Reduced-motion users receive immediate states without sliding transitions.

## Testing and acceptance criteria

### Catalog and routing

- All 36 calculators and five advanced workbenches appear exactly once as primary catalog destinations.
- Every catalog destination resolves to its existing working route.
- All six category slugs generate static pages.
- Category and subcategory counts are derived correctly.
- No existing tool URL changes.

### Search

- Representative queries rank the expected tools first.
- Search matches aliases and workbench capabilities such as YOLO, MQTT, Nmap, and BLE.
- Empty and no-result states behave as specified.
- Keyboard navigation and live result counts are covered.

### Interface

- `/tools/` shows no complete individual-tool grid when the search field is empty.
- Every category card and result card is clickable across its full surface.
- Category filters show only relevant tools.
- Browser-level responsive tests cover the Tools hub and one dense category at all target widths with no horizontal overflow.
- The production static export includes all category pages and preserves `.nojekyll` and the `/myPortflio` base path.

### Regression

- The full existing test suite remains green.
- Representative calculator, Model Mission, Sensor Generator, PID, Battery, and Security routes still build and load.
- The deployed source branch and GitHub Pages artifact are verified after publication.

## Non-goals

- Do not rename or rewrite the 41 existing tool destinations.
- Do not create separate routes for every subcategory.
- Do not add a backend search service, accounts, saved tools, analytics, or personalization.
- Do not display every tool on the initial `/tools/` view.
- Do not duplicate one tool across several primary category grids.
- Do not redesign the internal workflows of Model Mission, Security Mission, Sensor Generator, PID Simulator, Battery Estimator, or individual calculators as part of this release.
