# Theme Toggle and Tools Categories Design

## Goal

Give every visitor an explicit light/dark appearance control while making the Tools entry page calm and approachable. The site opens in dark mode, remembers a manual choice locally, and presents tool categories before individual tools.

## Theme behavior

- Dark is the first-visit default regardless of operating-system preference.
- A compact theme control sits in the desktop navigation immediately before `Start a project`.
- The mobile menu contains a full-width `Appearance` row with the same state and action.
- The control uses an icon plus visible `Light` or `Dark` label, exposes its pressed state, and has a minimum 44px target.
- Selecting a theme updates `data-theme` on the root `<html>` element and stores `light` or `dark` in `localStorage`.
- A small inline script in the document head applies the stored choice before React hydrates, preventing a light-theme flash.
- If storage is unavailable or contains an invalid value, the site safely remains dark.
- Existing semantic color tokens remain the only styling interface. Components must not introduce independent light-theme colors.

## Tools information architecture

`/tools/` becomes a category hub modeled on the current Work hub. It shows seven destination cards and no complete tool list:

1. Workbenches
2. Fundamentals
3. Resistors
4. Timing & Filters
5. Conversions
6. Number Systems
7. Physics & Math

Each card shows the category name, a short practical description, tool count, up to three example tool names, and an `Explore category` action. Cards use the existing graphite, gold, square-corner system in both themes.

Each category has a static route at `/tools/category/[slug]/`. The page contains:

- a breadcrumb back to `/tools/`;
- one clear `h1` and category introduction;
- search scoped to that category;
- only tools belonging to that category;
- the existing full-surface tool cards and purpose-specific covers.

The Workbenches category contains the six advanced tools. Calculator categories use their existing `category` values. Direct tool routes do not change, preserving bookmarks and search indexing.

## Components and data flow

- `ThemeToggle` owns the interactive control and writes the root theme plus local preference.
- The root layout supplies the pre-hydration theme initializer.
- A shared tool-category data module provides stable slugs, titles, introductions, and grouping helpers.
- `ToolsCategoryHub` renders the seven category cards from the shared data.
- `UnifiedToolsIndex` accepts an optional locked category. In locked mode it retains search but removes the redundant cross-category filter row.
- The category route uses `generateStaticParams` so every category remains compatible with static export.

## Accessibility and responsive behavior

- The theme control communicates its current state and next action to assistive technology.
- Keyboard focus uses the existing ASL gold focus ring.
- Category cards are single semantic links without nested actions.
- Desktop uses two or three columns depending on available width; mobile uses one column.
- Long category and tool names wrap without clipping or horizontal overflow.
- Both themes must retain WCAG AA text contrast using the existing semantic tokens.

## Testing

- Component/browser tests verify first-visit dark mode, switching to light, persistence after reload, and switching back.
- Contract tests verify `/tools/` contains category destinations rather than all 42 tool cards.
- Route tests verify all seven static category pages and that every tool appears in exactly one category.
- Search tests verify category pages filter only their own tools.
- Responsive browser checks cover 390, 768, 1366, 1920, and 3440px in both themes.
- The production static build must complete successfully.

## Constraints

- Preserve all direct tool URLs and existing tool functionality.
- Preserve the ASL gold-only accent system and square geometry.
- Do not alter unrelated dirty-worktree changes.
- Do not commit or push.
