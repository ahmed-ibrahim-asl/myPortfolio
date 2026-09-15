# Gradify reference research — 8 September 2026

## Evidence and use
- Machine-readable catalog: `.codex/gradify-universities.json`, 15 scoped profiles covering nine universities. Every imported profile is `reference`. The user's previously tested Delta Engineering GradifyReport workflow must stay separate.
- GPACal was inspected read-only through its live university/faculty menus, calculator select options, grading tables, and regulation selectors. No student records were uploaded, saved, or transmitted.
- A visible university/faculty option does not mean a working calculator. October 6 Engineering and Nahda Medicine both displayed a modal stating calculator and grading-table sections were unavailable because the site lacks that faculty's table. These missing tables were not fabricated.
- Primary public bundle: [GPACal JavaScript](https://gpacal.net/js/base.1772485438.js), referenced by [homepage](https://gpacal.net/). Custom logic is obfuscated. Data in the catalog came from rendered tables/options or official sources, not guessed decoder values.
- The reference matrices do not verify institutional policies for repetitions, withdrawals, pass/fail courses, grade rounding/truncation, graduation classifications, program-specific exam pass conditions, or applicability to a student's current cohort.

## Observed features
- University → faculty → action selection.
- Semester GPA and cumulative GPA modes; cumulative mode accepts prior CGPA and completed credits.
- Per-course credit hours, letter grade, and prior-grade/repeated-course field. Existing grade selector represented letters with numeric option values.
- Add course, add term, calculate, save, restore, reset, help controls.
- A percentage/coursework-to-grade modal; printable grading tables.
- GPA improvement tool, CGPA-to-classification menu, academic symbols, add-faculty request, contact, about, help. These were observed as UI capabilities; their full computations/storage behavior were not validated in this research.
- Delta Engineering exposes new (starting 2016–2017) and older regulations. Delta Pharmacy exposes PharmD beginning 2019–2020 and old regulations.

## University and faculty menu inventory
These are the site's menu entries, not assertions that every calculator is available:
- October 6: Engineering, Pharmacy, Physical Therapy, Applied Medical Sciences, Information Technology, Media and Communication Arts, Languages and Translation, Tourism and Hotels, Medicine, Dentistry, Administration and Economics, Education.
- Misr International: Engineering, Pharmacy, Computing, Dentistry, Administration, Media, Alsun.
- Delta: Engineering, Pharmacy, Physical Therapy, Dentistry, Administration, Medicine.
- American University: all School of Continuing Education programs only.
- Cairo: Mass Communication only.
- Horus: Engineering, Pharmacy, Physical Therapy, Dentistry, Administration.
- MUST: Medicine, Oral/Dental Medicine and Surgery, Pharmacy and Pharmaceutical Manufacturing, Physical Therapy, Engineering and Technology, Administration/Economics/Information Systems, Media and Communication Technology, Languages and Translation, Information Technology, Biotechnology, Applied Medical Sciences, Archaeology and Tourist Guidance, Special Education.
- Nahda: Medicine only.
- Egyptian Russian: Pharmacy, Oral/Dental Medicine, Engineering.
- Other university option is also present.

## Concrete discrepancies and provenance
- MIU Engineering GPACal percentage table overlaps: C+ 65–<72, B−70–<75. Catalog intentionally includes letters/points only until official clarification.
- Cairo Mass Communication GPACal uses B+3.4, C+2.4, D+1.4; standard 3.3/2.3/1.3 would be incorrect for that shown table. Percentage minima: A90,A−87,B+84,B80,B−77,C+74,C70,C−67,D+64,D60,F0.
- ERU Engineering GPACal uses pass threshold 50 and D+52.5. Official ERU engineering guide editions contain different pass/repeat rules; exact cohort applicability needs confirmation. [Older guide](https://eru.edu.eg/eru-files/PDF/Students%20Guide%20Engineering.pdf), [another guide](https://eru.edu.eg/wp-content/uploads/New%20Student%27s%20Guide.pdf).
- AUC Continuing Education GPACal thresholds (A94,A−90,B+87,B84,B−80,C+77,C74,C−70,D+66,D60) are stored separately from the official points-only undergraduate reference.
- MUST Biotechnology official guide uses A−3.6. [Student guide, page 27](https://must.edu.eg/wp-content/uploads/2024/01/Student-Guide.pdf).
- Nahda Engineering official reference is additional to GPACal's unavailable Medicine option. Nahda Business uses a different percentage ladder. [Business guide](https://www.nub.edu.eg/wp-content/uploads/2023/07/last-Student-guide-in-Eglish-2023-2022updated.pdf).
- Delta Pharmacy PharmD, Physical Therapy, Dentistry, Administration, and Medicine tables were each directly opened; each showed the same numeric ladder as Delta's newer Engineering reference, but their cohort/pass/repeat/transcript handling was not independently tested.
- The five official-source references (Delta Engineering, AUC undergraduate letter points, October 6 Dentistry 2024–2025, MUST Biotechnology, Nahda Communications/Computer Engineering) are still marked reference. Official-source presence is not end-to-end calculator verification.

## Calculation design implications
- Weight by credits: sum(course points × GPA credits) / sum(GPA credits). Do not average course GPAs without weighting.
- Forecast requires target points minus existing points, divided by future GPA credits; flag required GPA above the profile maximum as unreachable for the stated credits.
- Percentage mapping is only available where a complete unambiguous ladder is evidenced. AUC undergraduate and MIU Engineering remain letters only.
- User-supplied official letter grades should remain usable even where percentage conversion is uncertain.
- Retake and ungraded-course handling require explicit rules, not a universal assumption.

