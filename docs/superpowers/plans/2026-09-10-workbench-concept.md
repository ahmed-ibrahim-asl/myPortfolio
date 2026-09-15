# Workbench visual concept

Goal: make the previously proposed MotionSite-inspired direction tangible without replacing the homepage.

Design: a standalone noindex preview at /concepts/workbench-vision/index.html. Hardware-led AgriBot hero with selectable hardware/software/interface views; a simplified threshold-control demo with an adjustable input and visibly connected input, decision, and output; two large tool cards. Existing cover labeled AI-styled; demo labeled illustrative rather than actual AgriBot telemetry.

Palette: charcoal #0c1115, surface #151d23, ivory #f2f3ed, secondary #acb8c0, gold #e5b34d, signal #7adac5. Light theme uses #f4f5f1, #ffffff, #17232b, #4d606b, #865900, #086957. Archivo/system sans for headings, system sans for body, monospace for instrument labels. Hardware dominates the hero; ornament kept away from controls. Reduced motion disables animated signal paths and entry motion.

Implementation: isolated public HTML/CSS/JS, no dependencies, relative links compatible with a base path. No current source modifications, commits, deployment, third-party template code, or purchased assets.

- [x] Write browser regression: preview loads, input switches output at threshold, view changes update explanation, theme and motion controls work, mobile has no overflow and images load.
- [x] Run regression against missing preview (expected failure: 404 rather than 200).
- [x] Build public/concepts/workbench-vision/index.html, style.css, main.js.
- [x] Run browser regression at 1440 and 390 widths and both themes; inspect screenshots. Preview handed off via local browser link.

Verification: browser test passes with no page errors; threshold tested at 20, 60 and 80; reduced-motion preference respected on load. Screenshots saved under test-results/workbench-concept. Static prototype only, not a production homepage replacement or a full-site audit.
