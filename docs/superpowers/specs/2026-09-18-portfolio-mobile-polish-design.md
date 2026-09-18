# Portfolio mobile and project presentation design

Date: 18 September 2026  
Status: Approved direction

## Goal

Remove weak AI-styled presentation from the Multi-MCU project, correct the reported ROV mobile surface problem, and make mobile actions readable without changing the ASL visual identity.

## Multi-MCU Security Lock

Replace the raster cover that imitates photographed components with a simple, authored architecture diagram. Use SVG and the site design system.

The diagram contains:

- HMI MCU;
- control MCU;
- authenticated UART boundary;
- keypad and display on the HMI side;
- EEPROM, alarm, motor driver, and lock actuator on the control side;
- trust-boundary label and directional command/status arrows.

Use abstract blocks and connectors. Do not draw component packages, photorealistic boards, fake wiring, glows, or a rendered device scene. Keep the original Proteus screenshots in the project gallery as evidence.

## Wireless ROV mobile audit

The local 390 px project page currently renders a dark surface, so implementation must reproduce the user's white state before changing CSS. Compare:

- the current development page;
- the static export;
- the deployed asset if deployment is in scope later;
- dark and light theme persistence;
- the project hub, category page, detail page, and expanded gallery;
- original and generated responsive image variants.

Instrument the computed background and media-container styles at the failing viewport. Fix the source selector, stale asset, theme state, or generated image variant identified by the evidence. Add a browser regression that rejects a white project surface in dark mode.

## Action copy

Use short, explicit labels:

- Header action: `Contact`
- Home primary action: `View projects`
- Home secondary action: `Explore tools`
- Footer primary action: `Send brief`
- Footer secondary action: `Email Ahmed`

The labels keep their meaning on mobile without shrinking below the typography floor.

## Mobile button rule

Apply the control hierarchy from the tools specification across the shared site components. Do not use one global `font-weight: bold` rule. Shared actions receive 14 px or larger text, 650–700 weight, and 44–48 px height. Compact filters and tags remain visually secondary.

## Verification

- The Multi-MCU cover is an authored SVG architecture diagram and contains no raster component imagery.
- Original Proteus evidence remains accessible and accurately labelled.
- The ROV pages stay on the correct themed surface at 320, 390, and 430 px.
- Header, home, and footer CTAs use the approved short labels.
- No interactive control uses unreadably small text.
- Focus, contrast, reduced motion, and touch-target tests pass.

