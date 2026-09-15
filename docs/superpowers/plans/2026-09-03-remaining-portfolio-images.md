# Remaining Portfolio Images Implementation Plan

> Execution plan for completing the approved ASL editorial image system without changing the established design direction.

**Goal:** Finish every outstanding image task: visual-direction prompt examples, replacement covers for projects that still use placeholders, and covers for every current field note. Wire the assets into the site, preserve real project evidence, and verify layout and responsiveness.

**Architecture:** Store generated raster assets in versioned public folders and keep their exact prompts in documentation. Use a typed prompt-example manifest and a reusable gallery for the visual-direction guide. Extend writing metadata with an optional cover and render it in article/index contexts. Replace only placeholder project paths in the existing portfolio data.

**Tech stack:** Next.js App Router, React, TypeScript, Markdown frontmatter, CSS, Node test runner, Playwright-compatible responsive checks.

## Task 1: Define asset contracts and integration tests

- Add tests that require every visual-direction example, project replacement, and writing cover to resolve to a real local asset.
- Require unique accessible labels and prevent the old placeholder SVG paths from returning.
- Keep all generated-image paths stable and repository-relative.

## Task 2: Build the visual-direction example library

- Add a typed manifest covering all 18 shortcuts in the visual-direction guide.
- Render a responsive image gallery only on the visual-direction prompt page.
- Keep captions in HTML and generated images free of fragile embedded text.

## Task 3: Generate the visual-direction assets

- Generate one clear 16:9 example for each shortcut using a coherent engineering subject and the approved ASL palette.
- Inspect every output and copy accepted assets into `public/media/prompt-examples/`.
- Record the exact generation prompts in `docs/assets/`.

## Task 4: Replace portfolio placeholders

- Generate covers for the six projects that currently use placeholder SVG files.
- Preserve all existing photographs and real project evidence.
- Update only the matching image paths in `data/portfolio.ts`.

## Task 5: Add field-note covers

- Generate one cover for each of the three current writing entries.
- Parse the existing `cover` frontmatter into the `Post` type.
- Display covers in the writing index/series and at the top of published articles with responsive cropping.

## Task 6: Complete documentation and cleanup

- Mark the remaining image backlog complete and correct the shortcut wording to describe examples, not routes.
- Keep prompt recipes and asset names reproducible.
- Do not overwrite source evidence or delete user files.

## Task 7: Verify the full site

- Run focused asset/design tests, the complete test suite, TypeScript checks, and production build.
- Run responsive checks at 390, 768, 950, 982, 1366, 1920, 2560, and 3440 pixels.
- Check for horizontal overflow, broken assets, missing alt text, and unexpected console errors.
