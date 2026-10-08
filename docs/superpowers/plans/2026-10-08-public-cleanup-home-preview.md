# ASL public cleanup and homepage implementation plan

> **For agentic workers:** Use executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Publish the approved tools and navigation changes and show a local TasteSkill homepage.

**Architecture:** Latest origin/source in an isolated worktree; share existing catalog data and preserve specialist tools. Export production before applying local homepage changes. Deploy generated files through origin/main.

**Tech Stack:** Next.js 16, React 19, TypeScript, native CSS, existing lucide-react, Puppeteer.

## Global Constraints

- Keep ASL identity, routes, bilingual support, latest Gradify fixes, and SEO.
- Remove cover overlays and serve images without an additional lossy encoding pass.
- Homepage redesign stays local until user approval.

### Task 1: Public tools and navigation

- [ ] Add ToolsBrowser.tsx and scoped CSS using getGlobalToolSearchItems and getToolCategoryItems for exact category membership. Search uses existing filterToolItems aliases.
- [ ] Replace category landing UI with the immediate browser. Reuse specialist thumbnails and routes.
- [ ] Remove Home nav item and workbench cover labels; keep More disclosure keyboard access and language switch. Make theme icon compact with accessible name.
- [ ] Verify search/category behavior and desktop/mobile dark/light rendering; build export and validate content.
- [ ] Commit only task files and publish source, then copy the verified export to a clean deployment worktree and push generated output without force.

### Task 2: Local homepage

- [ ] Add a scoped TasteHome component and CSS module. Use original portrait/project/cover assets, preserving current profile/project/notes data and metadata.
- [ ] Replace app/page.tsx locally after public export. Hero uses concise value proposition and work/tools CTAs; project layout has one lead project and two supporting projects; tools, approach, notes, contact use distinct layouts.
- [ ] Check both themes, mobile sizing, actual links, image loading, and reduced motion. Run Lighthouse and capture screenshots.
- [ ] Show local homepage URL and screenshot; report public deployment separately.
