# Mobile Hero Simplification Design

## Goal

Make the homepage hero easier to scan on phones without weakening Ahmed's personal identity or changing the desktop composition.

## Approved direction

Use the focused-identity direction (option A) with the existing mobile identity card retained. The portrait must remain clearly visible in the same horizontal, bordered card treatment shown in the current mobile site: circular portrait on the left; name, professional role, and capability line on the right.

The full professional title remains **Embedded Systems & IoT R&D Engineer**. It is more precise than **System Engineer**, which can imply IT infrastructure rather than embedded firmware, electronics, prototyping, and connected devices.

## Mobile content hierarchy

The hero order at widths up to 560px is:

1. Existing compact identity card with portrait.
2. Existing two-line headline:
   - `Your hardware idea.`
   - `A prototype ready to test.`
3. One short supporting sentence: `I turn firmware and connected electronics into working prototypes.`
4. One full-width primary action: `See selected projects`.
5. A visually quieter text link: `Explore 53 free engineering tools →`.

Remove the standalone Arabic hero phrase from the mobile hero. The Arabic logotype remains in the navigation, so the bilingual identity is preserved without adding another competing element before the first scroll.

The existing tools-count section remains immediately after the hero. Its presence gives the secondary tools link context after the visitor reaches it.

## Desktop behavior

Desktop content, wording, two-button action row, and editorial portrait composition remain unchanged. The portrait-frame alignment fix already in progress remains part of the same release.

## Visual rules

- Preserve the current black, warm-gold, and hairline-border design language.
- Preserve the existing identity-card portrait size and horizontal arrangement at 320–560px.
- Keep the primary action at least 48px tall and full width.
- Render the tools action as a centered text link rather than a second boxed button.
- Tighten vertical spacing enough that the identity, headline, sentence, and primary action form one clear first-screen story.
- Do not introduce new animation, icons, colors, or decorative elements.

## Accessibility and responsive acceptance

- The identity portrait keeps meaningful alt text.
- Both actions remain keyboard accessible and retain visible focus styles.
- Text contrast remains at least WCAG AA in both light and dark themes.
- The hero does not overflow horizontally at 320, 360, 390, or 430px.
- The desktop hero remains unchanged at 1366px and wider.
- Automated browser coverage verifies copy, element order, portrait visibility, action hierarchy, minimum target size, and both themes.

## Repository note

The `source` branch contains editable application source, while `main` contains the generated GitHub Pages export. GitHub's “Compare & pull request” banner is expected when `source` receives commits that are not directly present in the generated deployment branch. The branches should not be merged through that banner.
