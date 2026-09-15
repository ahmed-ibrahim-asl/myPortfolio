# Work page hierarchy

Approved: Work hub → category → individual project. Reuse the established ASL category styles and mobile-screen containers.

- /work/ — five project categories plus a recognition entry; no project galleries.
- /work/{category}/ — only that category's compact project cards.
- /work/{category}/{project}/ — one project's overview, original photos, mobile interfaces and external links.
- /work/recognition/ — existing awards and certificates.

All 17 projects have generated static route parameters. Unknown category/project combinations use notFound. Each child includes a breadcrumb back to Work and its category. Home featured projects link directly to details. Former Work hash links are mapped to their new destinations on the client because fragments are not sent to the server.

Checks: category assignment, hub-to-project links, 17 project HTTP responses, preserved covers and galleries, all 20 mobile frames, TypeScript, and browser navigation/responsive inspection.
