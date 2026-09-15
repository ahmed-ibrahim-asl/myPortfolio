# Portfolio Layout and Content Polish Design

## Goal

Bring the current portfolio back to the approved Editorial Instrument system while fixing the visible layout failures reported across Home, Work, Tools, About, and the shared navigation. The result must remain direct, restrained, and legible at 390, 768, 1366, 1920, 2560, and 3440 pixels.

## Approved Direction

### Navigation

The primary navigation begins with Home, followed by Work, Tools, Notes, and About. Prompts remains available as site content but is removed from the primary navigation so the main path stays focused.

### Home portrait

The portrait identity strip uses three protected columns for the English name, agent number, and Arabic name. The English and Arabic labels receive real inline padding and may not touch or clip against the portrait mat. The status line below the portrait stays aligned to the portrait frame.

### Home evidence images

The three selected project images remain prominent but use a shorter, controlled media frame. They should read as evidence cards instead of oversized full-screen panels. Images keep their original aspect and may crop only inside the deliberate evidence frame.

### Work project cards

Project images sit inside a dark matte frame with consistent internal padding. The full source image remains visible through `object-fit: contain`; it cannot overlap the project copy or project metadata. Desktop keeps an indexed ledger structure, while mobile stacks the media and text without horizontal overflow.

### Tools catalog and calculators

The unified tools catalog keeps its filterable grid but introduces visible space between cards and independent card borders. Tool titles and summaries retain the approved white, muted blue, and gold hierarchy.

Calculator pages present the working calculator panel before educational explanation. Supporting theory and examples remain directly underneath. This ordering is consistent on every calculator route.

### Sensor Code Generator cover

Replace the complex neon cover with a simple dark technical still life inspired by the supplied sensor collage. It uses a charcoal matte background, muted component blue, restrained gold measurement accents, and no text, logos, trademarks, or white backdrop.

### About course content

The courses register adds two distinct records:

- Analog Communication at Delta University, with practical MATLAB laboratory work.
- MATLAB Onramp as a recorded online course, linked to the existing YouTube playlist.

Course cards use structured records so each item can have its own institution, description, and optional action.

### Publication identity

Publication author lines display the site owner's full public name, `Ahmed Ibrahim Asl`, instead of the abbreviated forms `AIME Asl` or `AI Asl`.

## Verification

Automated contract tests cover navigation and content records. Browser tests cover media containment, card spacing, portrait clipping, calculator-first ordering, and horizontal overflow at all six required widths. The full test suite and production build must pass before handoff.

## Constraints

- No primary grid toggle.
- No watermark name in page backgrounds.
- No em dash character in new public copy or documentation.
- No commit, push, or deployment in this pass.
