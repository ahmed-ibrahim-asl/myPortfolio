# Apple-inspired homepage preview

## Purpose

Create a local-only homepage experiment at `/apple-preview` that shows how Ahmed Asl's portfolio could feel when interpreted through Apple's design principles. The existing `/` homepage and its current uncommitted work remain untouched.

The page's single job is to communicate, within the first screen, that Ahmed turns hardware ideas into testable connected systems and to lead visitors toward selected work.

## Direction

The approved direction is an Apple-style engineering portfolio: calm, spacious, content-led, and precise. It borrows hierarchy, accessibility, adaptive layout, and restrained translucent control surfaces from Apple's Human Interface Guidelines without copying an Apple product page or hiding Ahmed's established gold-and-black identity.

The signature element is a large portrait/product-stage composition with a fine gold engineering orbit. It connects Apple's product-photography restraint to Ahmed's robotics and embedded-systems practice.

## Information architecture

The preview contains five focused sections:

1. A translucent local navigation bar with Ahmed's name and anchors for Work, Tools, Notes, and Contact.
2. A hero with role, concise value proposition, two actions, availability, and the portrait stage.
3. Three selected projects presented as large visual stories with outcome-focused copy.
4. A compact tools strip showing useful engineering utilities already available on the site.
5. A closing contact statement and footer.

Existing portfolio data and images are reused. The preview introduces no new content system, API, or dependency.

## Visual system

### Color

Light appearance uses a warm near-white surface, near-black content, neutral gray secondary text, and Ahmed's gold as the sole accent. Dark appearance reverses the surfaces to graphite while retaining accessible text contrast. Glass is limited to navigation and small floating status controls; content cards remain opaque.

The implementation must verify normal text at 4.5:1 or better and large text at 3:1 or better. Focus indicators use the accent plus a visible outline, never color alone.

### Typography

The page uses the system UI stack for controls and body text. Display type is large, compact, and weighted rather than decorative. Body copy remains at least 17px on phones and 16px on larger screens, with fluid scaling that does not clip when zoomed.

### Layout

Desktop uses a wide split hero followed by full-width editorial project panels. Content is capped to a readable measure inside edge-to-edge background sections.

```text
+----------------------------------------------------------+
| Ahmed Asl                        Work Tools Notes Contact |
+----------------------------------------------------------+
| Role + availability |                                  |
| Large value         |       portrait / product stage   |
| proposition         |       with engineering orbit     |
| [View work] [Talk]  |                                  |
+----------------------------------------------------------+
| Selected work                                           |
| [large story]                 [large story]              |
| [large story]                                            |
+----------------------------------------------------------+
| Tools strip                                              |
+----------------------------------------------------------+
| Contact statement                                       |
+----------------------------------------------------------+
```

Phone layout becomes one touch-first column. The portrait stage follows the core proposition so meaning is available before imagery. Primary controls are at least 44px high and stay within the safe viewport width.

```text
+------------------------+
| Ahmed Asl         Menu |
+------------------------+
| Role + availability    |
| Large value statement  |
| Supporting copy        |
| [View selected work]   |
| [Start a project]      |
|                        |
| Portrait stage         |
+------------------------+
| Selected work          |
| [story]                |
| [story]                |
| [story]                |
+------------------------+
| Tools                  |
+------------------------+
| Contact                |
+------------------------+
```

## Interaction and motion

Navigation anchors scroll to page sections. Cards provide pointer hover and keyboard focus feedback. The only orchestrated motion is a gentle hero reveal and a slow engineering-orbit drift around the portrait. `prefers-reduced-motion` removes transforms and animation, and `prefers-reduced-transparency` replaces glass with an opaque surface.

The local preview links to the site's existing routes; it does not submit forms or mutate data. Missing images fall back to a neutral technical surface without breaking layout.

## Responsive and accessibility requirements

- Support compact phones from 320px wide through large desktop monitors.
- Maintain a logical heading order and landmark structure.
- Use descriptive link text and accessible names for icon-only controls.
- Keep all touch controls at least 44 by 44 CSS pixels on compact layouts.
- Provide visible keyboard focus and usable tab order.
- Preserve content and actions at 200% browser zoom.
- Avoid horizontal scrolling at tested phone widths.
- Support light and dark color schemes, reduced motion, and reduced transparency.

## Implementation boundaries

- Add a standalone App Router route at `app/apple-preview/page.tsx` with a route-scoped stylesheet.
- Reuse existing data, images, and framework capabilities.
- Do not alter `app/page.tsx`, `app/home-grid.css`, global navigation behavior, or production metadata.
- Do not add packages, analytics, backend services, or deployment configuration.

## Verification

Run focused tests plus the production build. Then render and inspect the preview at representative widths: approximately 390px for phones, 1440px for laptops/desktops, and one intermediate tablet width. Verify keyboard focus, reduced-motion behavior, absence of horizontal overflow, and both light and dark appearances.

