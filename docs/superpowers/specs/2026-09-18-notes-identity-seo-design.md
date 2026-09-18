# Notes roadmap and identity SEO design

Date: 18 September 2026  
Status: Approved direction

## Goal

Help visitors and search systems connect the portfolio to Ahmed Ibrahim Asl, and give the Notes section a research-backed publishing roadmap without releasing thin placeholder articles.

## Identity model

Use one canonical person entity with reviewed name variants:

- Ahmed Ibrahim Asl
- Ahmed Asl
- Ahmed Ibrahim Assal
- Ahmed Assal
- Ahmed Ibrahim Assl
- Ahmed Assl
- أحمد إبراهيم عسل
- أحمد عسل

Add these variants to the Person and ProfilePage structured data. Use the canonical spelling in titles and visible headings. The About page may include a short factual sentence explaining the common English transliterations. Do not repeat aliases across page copy as keyword stuffing.

The person entity keeps the current verified profile image, role, email, and sameAs links. Article, project, and tool structured data reference the same Person `@id`.

## AI and search visibility

- Strengthen the About page as the canonical entity page.
- Keep author links on notes and technical pages.
- Add `ProfilePage`, `Person`, `WebSite`, `BreadcrumbList`, `CollectionPage`, and relevant article/tool schema where truthful.
- Keep `llms.txt`, sitemap, canonical URLs, and visible updated dates aligned.
- Confirm that robots rules allow search-and-citation crawlers.
- Use English and Arabic alternate links after Arabic routes exist.
- Do not claim projects, deployments, or credentials that the portfolio cannot verify.

Metadata keywords may include the reviewed name variants, but identity signals must also exist in visible content, structured data, internal links, and third-party profiles. A keywords field alone will not solve the AI-answer problem shown in the supplied screenshot.

## Notes topic research

Use Find Questions through normal interactive use. Its terms prohibit automated access beyond normal usage, so do not scrape or batch-call the service. Run focused searches for:

- embedded systems prototyping;
- ESP32 and IoT product development;
- RF and satellite link design;
- robotics and ROV control;
- image processing and applied machine learning;
- engineering student calculators and planning tools.

Review each suggestion before saving it. Record the source query, audience question, search intent, portfolio evidence, target topic, and status.

## Placeholder policy

Do not publish empty article URLs. Thin placeholders weaken the Notes section and give search engines nothing useful to cite.

Create a `Planned field notes` section on the Notes index. Each planned card includes:

- a real question-style working title;
- one or two sentences describing the intended answer;
- topic and intended audience;
- `Planned` status;
- no link until the article contains substantive content.

Keep the full editorial backlog in structured data or Markdown drafts with `draft: true`. Drafts stay out of the sitemap, RSS, topic counts, global search, and static params. Topic hub pages may be public only when they contain a useful introduction and at least one published note.

## Measurement

Track branded queries and AI referrals where available. Use these checks monthly:

- `Ahmed Ibrahim Asl website`
- `Ahmed Asl embedded systems`
- Arabic name variants plus role terms
- priority engineering questions from the editorial backlog

Record whether the site, About page, LinkedIn, Scholar profile, or another source appears. Improve factual consistency before adding more aliases.

## Verification

- Structured data uses one Person identifier and all reviewed aliases.
- Canonical headings keep the preferred name.
- Planned notes have no empty public article route.
- Drafts remain excluded from discovery systems.
- Notes shows a useful planned-topic section.
- Schema validates and contains only claims supported by the site.
- Sitemap, robots, canonical, author, and llms checks pass.

