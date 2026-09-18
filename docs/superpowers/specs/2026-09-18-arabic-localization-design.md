# Arabic localization design

Date: 18 September 2026  
Status: Approved direction

## Goal

Add an Arabic version that reads as authored Arabic, supports right-to-left layouts, and preserves the technical precision of the English portfolio.

## Route model

English remains at the current URLs. Arabic uses explicit `/ar/` routes so static export works without middleware or request-time locale detection.

Examples:

- `/` and `/ar/`
- `/about/` and `/ar/about/`
- `/work/` and `/ar/work/`
- `/tools/` and `/ar/tools/`
- `/contact/` and `/ar/contact/`

The language switch keeps the current route when an Arabic equivalent exists. Otherwise it opens the closest Arabic index and explains that the specific content remains available in English.

## Translation approach

Write Arabic copy for intent and tone. Do not translate English sentence structure word for word. Use clear professional Arabic familiar to Egyptian engineers, with standard technical terminology and English abbreviations where engineers expect them.

Examples:

- `View projects` → `شوف المشاريع`
- `Explore tools` → `استكشف الأدوات`
- `Contact` → `تواصل`
- `Satellite Link Budget` → `ميزانية وصلة القمر الصناعي`
- keep units, symbols, MCU names, protocol names, and equations unchanged.

Avoid slang that weakens professional pages. Use a warmer Egyptian register for calls to action and standard Arabic for explanations, project descriptions, and engineering definitions.

## Content architecture

Store shared facts once and provide localized copy fields rather than cloning project and tool records. Dictionaries own shell labels, navigation, search, filters, empty states, actions, validation, and footer copy. Project, category, and tool records own localized titles and summaries.

Arabic rollout covers:

1. shell, navigation, home, about, contact, work hub, and tools hub;
2. project indexes and category pages;
3. calculator interface labels, help text, warnings, derivations, and result interpretations;
4. published Notes only when an Arabic article has been written and reviewed.

English technical content may remain reachable from an Arabic page during rollout, but the interface must label it `المحتوى التفصيلي متاح بالإنجليزية` rather than pretending it is localized.

## Layout and typography

- Set `lang="ar"` and `dir="rtl"` on Arabic route roots.
- Use IBM Plex Sans Arabic for interface and reading text, and Aref Ruqaa only for the existing signature mark.
- Mirror navigation flow, breadcrumbs, card metadata, arrows, and form alignment where direction carries meaning.
- Keep mathematical equations, code, units, email addresses, URLs, and part numbers left-to-right with `dir="ltr"` or `dir="auto"`.
- Test mixed Arabic/English lines so punctuation and units remain readable.
- Keep the current ASL palette, surfaces, spacing scale, and control hierarchy.

## SEO and discovery

- Add reciprocal `hreflang="en"`, `hreflang="ar"`, and `x-default` alternates.
- Give Arabic pages their own titles and descriptions.
- Set Arabic schema `inLanguage` accurately.
- Do not canonicalize Arabic pages to English; each substantial translation is canonical to itself.
- Exclude untranslated placeholder routes from the sitemap.

## Quality checks

Arabic copy receives a human-style review for literal phrasing, awkward gender, misplaced English words, and Egyptian readability. Automated tests cover missing keys, route parity, directionality, metadata alternates, and mixed-direction controls.

Responsive browser tests cover 320, 390, 768, 1024, and 1440 px in both themes and both languages. No Arabic text may clip, overlap, or force page-level horizontal scrolling.

