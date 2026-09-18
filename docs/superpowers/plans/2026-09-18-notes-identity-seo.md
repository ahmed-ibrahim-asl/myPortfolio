# Notes and Identity SEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish one trustworthy Ahmed Ibrahim Asl entity and add a useful, non-indexed editorial roadmap to Notes without publishing empty articles.

**Architecture:** `lib/seo.ts` exports one alias constant and one canonical Person reference reused by page schemas. Planned topics live in structured data separate from published Markdown; the Notes index renders them as non-link cards. Discovery code continues to read published content only.

**Tech Stack:** Next.js Metadata API, JSON-LD, TypeScript, Node test runner, Markdown content pipeline.

## Global Constraints

- Use the eight reviewed English and Arabic name variants exactly once in canonical entity data.
- Keep Ahmed Ibrahim Asl as the visible preferred name.
- Do not publish thin article routes or add draft entries to sitemap, RSS, global search, topic counts, or static params.
- Use FindQuestions only through normal interactive use; do not scrape or batch-call it.
- Do not claim credentials, deployments, or outcomes that the portfolio cannot verify.

---

### Task 1: Canonical identity graph and metadata

**Files:**
- Modify: `lib/seo.ts`
- Modify: `lib/site.ts`
- Modify: `app/about/page.tsx`
- Modify: `app/layout.tsx`
- Test: `tests/seo/identity-entity.test.ts`

**Interfaces:**
- Produces: `personAliases`, `personId`, `createSiteJsonLd`, `createProfilePageJsonLd`, and locale-aware page metadata.

- [ ] **Step 1: Write failing tests** requiring one Person `@id`, all aliases, canonical preferred headings, author references, and factual transliteration copy on About.
- [ ] **Step 2: Run with** `npx vitest run tests/seo/identity-entity.test.ts` and verify failure.
- [ ] **Step 3: Export the alias constant and reuse it** in Person/ProfilePage metadata; add restrained metadata keywords and visible transliteration context.
- [ ] **Step 4: Run focused SEO tests** and validate no duplicate Person entity.
- [ ] **Step 5: Commit** with `git commit -m "feat: strengthen canonical author identity"`.

### Task 2: Planned Notes data and index UI

**Files:**
- Create: `data/planned-notes.ts`
- Create: `components/PlannedNotes.tsx`
- Modify: `app/notes/page.tsx`
- Modify: `app/globals.css`
- Test: `tests/seo/planned-notes.test.ts`

**Interfaces:**
- Produces: `plannedNotes` records with `title`, `summary`, `topic`, `audience`, `sourceQuery`, `intent`, `evidence`, and `status: "Planned"`.

- [ ] **Step 1: Write failing tests** for the six approved topic clusters, question-style titles, useful summaries, no href, and no collision with published slugs.
- [ ] **Step 2: Run and verify failure** with `npx vitest run tests/seo/planned-notes.test.ts`.
- [ ] **Step 3: Add reviewed topic records** informed by the approved research queries and existing portfolio evidence.
- [ ] **Step 4: Render non-link cards** below published Notes with topic/audience/status semantics.
- [ ] **Step 5: Run SEO and responsive tests, then commit** with `git commit -m "feat: add planned engineering notes roadmap"`.

### Task 3: Discovery integrity and agent-readable identity

**Files:**
- Modify: `app/sitemap.js`
- Modify: `app/robots.js`
- Modify: `public/llms.txt`
- Modify: `tests/seo/discovery.test.ts`

**Interfaces:**
- Produces sitemap/robots/llms output aligned with published content and canonical author URLs.

- [ ] **Step 1: Extend failing discovery tests** to reject planned/draft URLs, allow citation crawlers, and require About and Notes author references in `llms.txt`.
- [ ] **Step 2: Run and verify failure**.
- [ ] **Step 3: Update discovery files** with factual copy and no unsupported claims.
- [ ] **Step 4: Run all SEO tests and `npm run build`**.
- [ ] **Step 5: Commit** with `git commit -m "fix: align discovery files with published identity content"`.

