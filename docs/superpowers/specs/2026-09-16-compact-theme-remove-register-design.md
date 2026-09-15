# Compact Theme Control and Homepage Register Removal

## Goal

Make the navigation theme control concise and remove the homepage statistics strip that interrupts the mobile hero.

## Approved interface

- Replace the mobile `Appearance` label plus action with a single compact action.
- The action shows the theme the visitor can switch to: `Light` with a sun icon while dark mode is active, and `Dark` with a moon icon while light mode is active.
- Preserve the existing accessible label, pressed state, persisted preference, keyboard target, and theme behavior.
- Remove the complete homepage register containing Projects logged, Practice areas, Working tools, and Brief status on every viewport. Do not leave an empty spacer or border.
- Keep the hero identity, headline, calls to action, Arabic signature, and the following tools hook unchanged.

## Implementation boundaries

- Update `ThemeToggle` markup and its responsive styles only as needed for the compact control.
- Remove the register markup and any now-unused homepage data imports or variables.
- Remove dead register CSS so the deleted section cannot leave layout artifacts.
- Add regression coverage that verifies the concise menu control and absence of the register on mobile and desktop.

## Verification

- Run the focused theme and mobile-home tests.
- Check 320, 360, 390, and 430 pixel mobile widths in dark and light themes.
- Confirm the navigation does not overflow and the toggle remains at least 44 by 44 pixels.
- Confirm the homepage register is absent at both mobile and desktop widths.
- Run TypeScript and a production build before publishing.
