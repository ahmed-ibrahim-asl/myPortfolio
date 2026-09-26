import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

import { getDictionary } from "../../lib/i18n/dictionaries.ts";
import { toLocalePath, toLocalizedToolPath } from "../../lib/i18n/routes.ts";

test("Arabic dictionary covers the shared shell with authored labels", () => {
  const ar = getDictionary("ar");
  assert.deepEqual(ar.nav, { home: "الرئيسية", work: "المشاريع", tools: "الأدوات", notes: "الملاحظات", about: "عني", contact: "تواصل", more: "المزيد" });
  assert.equal(ar.actions.viewProjects, "شوف المشاريع");
  assert.equal(ar.actions.exploreTools, "استكشف الأدوات");
});

test("language switching preserves known routes and falls back to an Arabic index", () => {
  assert.equal(toLocalePath("/tools/category/satellite/", "ar"), "/ar/tools/category/satellite/");
  assert.equal(toLocalePath("/ar/about/", "en"), "/about/");
  assert.equal(toLocalePath("/notes/untranslated-note/", "ar"), "/ar/notes/");
});

test("Arabic category cards localize only calculators with real Arabic routes", () => {
  assert.equal(toLocalizedToolPath("/tools/satellite/orbit/", "ar"), "/ar/tools/satellite/orbit/");
  assert.equal(toLocalizedToolPath("/tools/rf/antenna/", "ar"), "/ar/tools/rf/antenna/");
  assert.equal(toLocalizedToolPath("/tools/gradify/", "ar"), "/tools/gradify/");
  assert.equal(toLocalizedToolPath("/tools/ohms-law-calculator/", "ar"), "/tools/ohms-law-calculator/");
});

test("Arabic core routes exist and establish RTL language context", () => {
  for (const path of ["app/ar/layout.tsx", "app/ar/page.tsx", "app/ar/about/page.tsx", "app/ar/contact/page.tsx", "app/ar/work/page.tsx", "app/ar/tools/page.tsx"]) {
    assert.equal(existsSync(path), true, path);
  }
  const layout = readFileSync("app/ar/layout.tsx", "utf8");
  assert.match(layout, /lang="ar"/);
  assert.match(layout, /dir="rtl"/);
  const rootLayout = readFileSync("app/layout.tsx", "utf8");
  assert.match(rootLayout, /location\.pathname\.startsWith\(['"]\/ar\//);
  assert.match(rootLayout, /documentElement\.dir/);
});

test("Arabic route metadata declares reciprocal language alternatives", () => {
  const seo = readFileSync("lib/seo.ts", "utf8");
  assert.match(seo, /languages:/);
  assert.match(seo, /"x-default"/);
  assert.match(seo, /ar_EG/);
});

test("Arabic Satellite and RF routes reuse numeric engines with localized chrome", () => {
  for (const path of ["app/ar/tools/category/[slug]/page.tsx", "app/ar/tools/satellite/[slug]/page.jsx", "app/ar/tools/rf/[slug]/page.jsx"]) assert.equal(existsSync(path), true, path);
  const workspace = readFileSync("components/tools/satellite/SatelliteWorkspace.jsx", "utf8");
  assert.match(workspace, /locale = "en"/);
  assert.match(workspace, /احسب واعرض النتائج/);
  assert.match(workspace, /المحتوى التفصيلي متاح بالإنجليزية/);
});

test("sitemap publishes substantive Arabic routes but no translated note placeholders", () => {
  const sitemap = readFileSync("app/sitemap.js", "utf8");
  assert.match(sitemap, /arabicRoutes/);
  assert.match(sitemap, /\/ar\/tools\/rf\//);
  assert.doesNotMatch(sitemap, /\/ar\/notes\/\$\{post\.slug\}/);
});

test("the header brand keeps Arabic visitors inside the Arabic site", () => {
  const header = readFileSync("components/SiteHeader.tsx", "utf8");
  assert.match(header, /className="brand" href=\{homeHref\}/);
});

test("the English homepage is independent while Arabic keeps the localized shared view", () => {
  const enHome = readFileSync("app/page.tsx", "utf8");
  const arHome = readFileSync("app/ar/page.tsx", "utf8");
  assert.match(enHome, /apple-home-root/);
  assert.match(enHome, /From rough idea to working system\./);
  assert.doesNotMatch(enHome, /HomePageView/);
  assert.match(arHome, /HomePageView locale="ar"/);
  const shared = readFileSync("components/HomePageView.tsx", "utf8");
  // The Arabic homepage continues to receive the complete localized shared view.
  for (const marker of [
    "ProfilePortrait",
    "home-hero",
    "home-hook",
    "home-workbench",
    "home-brain",
    "home-method",
    "project-ledger",
    "tool-ledger"
  ]) {
    assert.match(shared, new RegExp(marker), marker);
  }
});

test("Arabic satellite and RF tool routes include the same search-hook guide as English", () => {
  for (const path of ["app/ar/tools/satellite/[slug]/page.jsx", "app/ar/tools/rf/[slug]/page.jsx"]) {
    const source = readFileSync(path, "utf8");
    assert.match(source, /ToolSearchHook/, path);
    assert.match(source, /ToolSearchSchema/, path);
  }
});
