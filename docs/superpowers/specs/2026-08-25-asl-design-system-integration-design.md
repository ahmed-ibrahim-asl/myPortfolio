# ASL Portfolio Design System Integration

## Status

Approved direction for the English-first ASL portfolio redesign. The Arabic wordmark `عسل` acts as the identity signature and watermark. The redesign covers the portfolio, writing, calculators, generators, and mission workbenches in `myPortfolio/`.

## Goal

Give Ahmed Ibrahim Asl one recognizable visual language across his public work. Visitors should understand his engineering range, inspect evidence, use his tools, and contact him without learning an unusual navigation model.

The redesign keeps the portfolio's verified content and working tool logic. It removes the obsolete outer Next.js application after the maintained app passes verification.

## Research conclusion

The ui-ux-pro-max database returned familiar portfolio patterns: Bento cards, masonry galleries, a four-section portfolio grid, horizontal-scroll storytelling, Swiss twelve-column layouts, editorial magazine grids, and cyberpunk HUD treatments. It also proposed blue accents, rounded cards, hover scaling, and Caveat with Quicksand.

This design does not use those recommendations. It takes its visual rules from the supplied ASL design system and introduces an original page structure called the **instrumented fault line**. The result is a custom composition, though no design process can prove that no similar page exists anywhere on the web.

## Visual thesis

Ahmed works by tracing a fault through a system. Each page uses one measured vertical line to express that method. Content docks to this line as evidence, notes, tools, and outcomes. The line supplies order without turning the portfolio into a game interface.

The design resembles a dark engineering bench:

- near-black surfaces separated by hairlines;
- soft-white text with gold covering less than five percent of a view;
- rectangular panels with two- or four-pixel corners;
- crop marks, ticks, and blueprint grids only where they encode bounds or measurement;
- an Arabic `عسل` watermark at large scale and low contrast in selected identity zones;
- real project photography and Ahmed's supplied portrait instead of generated workspace scenes.

## Signature layout: instrumented fault line

Desktop pages use an asymmetric seven-lane frame:

1. a narrow index lane;
2. two narrative lanes;
3. the fault-line lane;
4. two evidence lanes;
5. a narrow utility lane.

Sections change their weight around the fixed conceptual line. A project can place its problem and method on the narrative side, then place its image, result, or link on the evidence side. The next section can reverse the emphasis without forming a repetitive zigzag.

The homepage hero places the identity and primary actions across the narrative lanes. Ahmed's measured portrait frame occupies the evidence lanes. A large `عسل` watermark crosses the frame behind both sides at low opacity. The fault line starts at the availability label and continues into the project log.

The line does not become a second navigation control. Visitors use the familiar header, links, buttons, filters, tabs, and form labels. On screens below 900px, content follows one reading column and the line becomes a short left-edge section marker. On phones, the watermark crops behind the hero and never overlaps reading text.

## Information architecture

### Global shell

- Sticky header with the gold hex badge, `ASL` wordmark, primary navigation, and one contact action.
- Desktop navigation remains visible. Mobile navigation uses one labeled menu button, large targets, and a simple vertical drawer.
- The optional Arabic mark appears in the brand lockup only when space allows. The full site remains English.
- Footer uses the paired `عسل | ASL` lockup, direct contact details, navigation, and a short availability statement.
- Remove the current telemetry HUD, pixel decoration, game-like mission language from the global shell, and visual effects that compete with project evidence.

### Home

1. Identity hero with the portrait, current role, verified summary, availability, and contact/work actions.
2. Capability bench with Embedded, Electronics, Applied AI, and Security. Each capability points to real work or tools.
3. Selected work log with project image, problem, contribution, stack, and verified outcome.
4. Credibility register for teaching, research, and competition evidence.
5. Four-step method: Question, Learn, Build, Test. The sequence earns its numbering because order carries meaning.
6. Tool entry points grouped by job: Calculate, Generate, Simulate, and Plan.
7. Field notes and contact close.

### Work

- Use a problem log instead of a masonry gallery.
- Each entry exposes the title, domain, date, image, concise problem statement, Ahmed's contribution, and result.
- Domain filters remain plain buttons or tabs. Project images stay visible and preserve their natural aspect ratios.
- A project without a case-study route remains a readable article and does not pretend to be a link.

### About

- Lead with Ahmed's verified biography and portrait.
- Use the fault line as a chronological trace for education and experience.
- Present publications as citation records with direct source links.
- Keep skills grouped by work context rather than displaying a proficiency meter.

### Writing

- Present posts as an indexed field-note register with type, date, reading time, summary, and tags.
- Keep search and filtering compact and keyboard accessible.
- Article pages use a readable measure, clear heading hierarchy, code overflow handling, and an article metadata rail on wide screens.

### Tools index

- Replace mixed card styles with a calibrated workbench register.
- Group tools by the task a visitor wants to complete: Calculate, Generate, Simulate, Plan, and Investigate.
- Preserve search and category filtering.
- Advanced tools receive stronger evidence panels; calculators use a denser list treatment. Neither group uses a Bento grid.

### Calculators and advanced workbenches

- Port the ASL tokens, buttons, inputs, badges, tabs, dialogs, toasts, code surfaces, and validation language across each tool.
- Keep each tool's workflow and calculation logic intact.
- Wide workbenches may use configuration and result panes. Tablet and phone layouts use explicit tabs or stacked regions and preserve state when switching.
- Use status colors for status only. Gold marks the primary action or active step.
- Errors name the invalid field or failed operation and tell the visitor how to correct it.

### Contact

- Use a compact engineering brief: name, email, work type, domain, timeline, problem, and links.
- Keep direct email and professional channels visible beside the form.
- Do not simulate a successful submission. A form either uses an existing real delivery path or opens a prepared email.

## Brand tokens

### Color

| Role | Value |
|---|---|
| Page floor | `#0B0D11` |
| Primary surface | `#12161C` |
| Raised surface | `#1C2129` |
| Primary text | `#E6E8EB` |
| Secondary text | `#A7AEB8` |
| Muted text | `#78828F` |
| Gold | `#D9A441` |
| Status OK | `#5FA37A` |
| Status alert | `#C4553D` |
| Status info | `#6E8BA8` |

Gold covers less than five percent of a viewport. Large gold backgrounds are limited to one short callout when the page benefits from it. Text and controls meet WCAG AA contrast.

### Type

- Archivo for Latin display, headings, body, and interface text.
- Space Mono for labels, measurements, dates, code metadata, and short data values.
- Sora for the Latin `ASL` mark only.
- Aref Ruqaa for the Arabic `عسل` mark and watermark only.
- IBM Plex Sans Arabic and Noto Kufi Arabic remain available for Arabic identity metadata, not English body copy.

Body text starts at 16px. Labels may use 12px when uppercase, tracked, high contrast, and non-interactive. Form controls and mobile navigation use at least 16px text.

### Shape and spacing

- Four-pixel base spacing with an eight-pixel layout rhythm.
- Two-pixel corners for controls and four-pixel corners for panels. Eight-pixel corners are reserved for dialogs.
- Hairlines separate static surfaces. Shadows appear on overlays and dialogs, not ordinary cards.
- Interactive targets measure at least 44 by 44 CSS pixels.

## Components and code boundaries

Port selected assets and tokens from the supplied archive into maintained project files. Do not ship the archive bundle or its window-global demo runtime.

Shared components:

- `AslLogo`: Arabic, Latin, glyph, and paired lockups.
- `AslPortrait`: measured portrait crop with optional status and caption.
- `FaultLine`: decorative section alignment rail with no interaction semantics.
- `SectionLabel`: index, label, and optional rule.
- `MeasuredPanel`: static, interactive, inset, and raised surface variants.
- `AslButton`, `AslIconButton`, `AslBadge`, and `AslTag`.
- `AslInput`, `AslSelect`, `AslCheckbox`, `AslRadio`, and `AslSwitch`.
- `AslTabs`, `AslDialog`, `AslToast`, and `AslTooltip`.
- `ProjectLogEntry` and `ToolRegisterEntry` for consistent evidence rows.

Existing data modules remain the source of truth. Components receive project, publication, article, and tool data through props. The redesign does not duplicate portfolio facts in JSX.

Global tokens live in focused CSS files imported by the application layout. Route-specific CSS may compose tokens but may not redefine brand colors or fonts. Tool-specific status colors remain semantic aliases to the global status ramp.

## Interaction and motion

- Hover and pressed states change border, surface, or text color without moving layout bounds.
- Focus rings use a three-pixel gold treatment with page-colored separation.
- Micro-interactions last 150 to 240ms.
- One page-entry sequence may reveal the fault line, title, and evidence panel. It must finish within 500ms and cannot block navigation.
- Decorative continuous animation is removed.
- `prefers-reduced-motion: reduce` disables entry and scrolling motion while preserving state changes.

## Responsive behavior

### 1200px and above

Use the full seven-lane frame. Tool workbenches can show configuration and output together.

### 900px to 1199px

Collapse the utility lane and reduce image width. Maintain the narrative/evidence split where content fits.

### 640px to 899px

Use one reading column with optional two-column card groups. Replace wide tool panes with tabs. Tables gain a scroll wrapper or transform into labeled rows.

### Below 640px

Use a one-column flow, 20px gutters, full-width primary actions, 44px targets, and no horizontal page overflow. Keep code regions horizontally scrollable inside their own bounds. Test at 375px and 320px.

## Accessibility and usability

- Keep the skip link and semantic landmarks.
- Preserve sequential heading levels.
- Match keyboard focus order to visual order.
- Provide visible focus, selected, expanded, error, loading, and disabled states.
- Give meaningful images useful alt text and mark decorative watermark text as hidden from assistive technology.
- Do not rely on color alone for status.
- Keep sticky elements from covering anchors or focused controls.
- Use breadcrumbs on routes deeper than two levels, including article and tool detail pages.

## Obsolete application removal

After the maintained `myPortfolio/` app passes all acceptance checks, remove the outer legacy Next.js source and build artifacts. Preserve:

- `myPortfolio/` and its Git repository;
- the supplied `عسل  ASL Design System.zip` archive;
- workspace-owned `.codex`, `.agents`, `.ease`, and worktree directories unless the user requests their removal.

Resolve and inspect each deletion target before removal. Do not remove the workspace root or the maintained application directory.

## Testing and verification

Use test-driven development for behavior changes. Visual-only CSS changes receive contract tests where existing tests already inspect selectors and responsive rules.

Required checks:

1. Run content validation and TypeScript checks.
2. Run the complete automated test suite.
3. Build the static export in local and GitHub Pages base-path modes.
4. Inspect Home, Work, About, Writing, Tools, one representative calculator, and each advanced workbench at 1440px, 1024px, 768px, 375px, and 320px.
5. Check keyboard navigation, visible focus, reduced motion, long content, empty states, errors, and code overflow.
6. Confirm no console errors and no broken internal links.
7. Confirm the deployed base path remains `/myPortflio/`.

## Acceptance criteria

- Visitors see one ASL identity across all maintained routes.
- The instrumented fault line defines the page composition without acting as navigation.
- The layout does not reproduce the database's Bento, masonry, horizontal-scroll, editorial, Swiss-grid, or HUD patterns.
- The Arabic `عسل` mark appears as a restrained watermark and identity asset on an English site.
- Project, publication, biography, and tool content remains factual.
- Calculators, generators, and mission tools keep their current behavior and state.
- Keyboard, focus, contrast, reduced-motion, target-size, and responsive requirements pass.
- The static export succeeds under `/myPortflio/`.
- The obsolete outer application is removed only after the maintained app passes verification.
