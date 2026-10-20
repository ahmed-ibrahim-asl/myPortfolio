# RankSWAT Remediation Implementation Plan

> **For agentic workers:** Use the `executing-plans` skill to implement this plan task-by-task in the current chat. Steps use checkbox (`- [ ]`) syntax for tracking. This document authorizes no deployment by itself.

**Goal:** معالجة المشاكل المثبتة في الصفحة الرئيسية على eng-asl.com وتحسين الموبايل ووضوح إشارات البحث والأداء، مع دليل قبل/بعد لكل إصلاح.

**Architecture:** إصلاحات تدريجية داخل Next.js App Router الحالي، مع الإبقاء على static export والدومين والمسارات الحالية. نفصل تغييرات الصفحة عن إعدادات الاستضافة، ونختبر HTML الناتج والصفحة بعد تشغيل JavaScript. لا نعيد تصميم الموقع بالكامل.

**Tech Stack:** Next.js 16.3.1، React 19.2.7، TypeScript، CSS، Node test runner، Vitest، JSDOM، Chromium، GitHub Pages بحسب workflow المحلي.

**Status:** خطة تنفيذ جاهزة للمراجعة بتاريخ 2026-10-20؛ لم تنفذ المهام ولم تقاس النسخة الحية في هذه الجلسة. نتائج RankSWAT فرضيات إلى أن يعاد إنتاجها.

## أساس الخطة والاختيار المقترح

المصدر: `D:/work/portflioWebsite/plan-X/2026-10-20-RANKSWAT-AUDIT-INTAKE.md` والنص الأصلي بجواره. الأداة فحصت `/` فقط، وأبلغت عن 15 Fail و9 Warning؛ بعض القياسات غير متاحة.

الخيارات:

1. **الموصى به: تحقق ثم إصلاح تدريجي.** كل تغيير له سبب قابل لإعادة الاختبار؛ يحافظ على الموقع الحالي ويسمح بالتراجع عن كل مجموعة وحدها.
2. إصلاح تقني فقط: أسرع نطاقًا، لكنه يترك وضوح المحتوى والثقة دون معالجة.
3. إعادة تصميم الرئيسية: أوسع تكلفةً ومخاطرةً، ولا يثبت التقرير أنها مطلوبة؛ خارج هذه الخطة.

## Global Constraints

### مهارات التصميم وanti-slop المطلوبة

تحديث بناءً على توجيه أحمد بشأن مهارات تصميم Biovety: سجل شات `biovety` يؤكد استخدام `frontend-design`، دون دليل في السجل الذي تمت مراجعته أن كل المهارات التالية استُخدمت فيه.

- [frontend-design](D:/workspace/codex-home/skills/frontend-design/SKILL.md): مرجع الاتجاه البصري والتكوين والخطوط؛ هذه المهارة مؤكدة الاستخدام في شات Biovety.
- [design-taste-frontend](D:/workspace/codex-home/skills/design-taste-frontend/SKILL.md): مراجعة الأنماط البصرية المكررة ووضوح الأزرار وتوازن الأقسام؛ مرجع anti-slop الرئيسي عند تعديل الواجهة.
- [stop-slop](D:/workspace/codex-home/skills/stop-slop/SKILL.md): مراجعة النصوص المعدلة في المهمة 5، لإزالة الحشو والعبارات العامة مع الحفاظ على الحقائق وصوت أحمد.
- [impeccable](D:/workspace/codex-home/skills/impeccable/SKILL.md): مرجع إضافي عند الحاجة لفحص التباعد والتباين والتجاوب؛ يقرأ المنفذ playbook الخاص بالمهمة قبل استخدامه، ولا يشغّل إعادة تصميم شاملة تلقائيًا.

**قراءة الاتجاه:** بورتفليو مهندس لعملاء يريدون تقييم أعماله، بلغة بصرية هندسية واضحة تعتمد على صور المشاريع والأدلة الموجودة. نستفيد من طريقة العمل المستخدمة في Biovety مع الحفاظ على هوية أحمد.

قبل المهام 1 و4 و5، راجع tokens والثيمين وصور baseline وحدد قواعد المهارة المنطبقة على التعديل. لا تنقل palette أو شكل Biovety إلى البورتفليو، ولا تغيّر مكتبة الواجهة أو تزيد الحركة لمجرد تفضيل افتراضي داخل skill. الأداء وإمكانية القراءة ونطاق الإصلاح هي القيود الحاكمة.

بوابة المراجعة البصرية في المهمة 7: قارن الصور قبل/بعد؛ راجع تكرار أشكال الأقسام والـeyebrows، هرمية العناوين، نصوص CTA، ووجود كلام عام أو تعليقات تصميم ظاهرة للزائر. سجل المشكلة والسبب والتغيير إن لزم؛ اختلاف الشكل عن القوالب ليس مبررًا لإضافة زخارف أو كسر الاستخدام. أي استبدال شامل للاتجاه البصري يتطلب نطاقًا مستقلًا.

### قيود التنفيذ

- العمل يبدأ من الحالة المحلية الحالية بعد حفظ تغييرات المستخدم، وليس من افتراض أن HEAD يطابق ما يراه المستخدم.
- هناك تعديل قائم في `app/home-grid.css` يضيف `width: 100%` و`justify-self: stretch` للصورة؛ حافظ عليه. توجد تعديلات Gradify وmetrics وملفات أخرى غير مرتبطة؛ لا تدمجها أو تلغها ضمن هذه المهمة.
- احتفظ بالدومين `https://eng-asl.com` و`basePath: ""` و`output: "export"` و`trailingSlash: true`.
- لا تغيير slugs أو ترحيل استضافة أو DNS ضمن إصلاحات الواجهة. أي تغيير بنية تحتية ينتظر نتيجة المهمة 6 وقرارًا محددًا عند التنفيذ.
- اختبر production export، وليس dev server وحده. لا تستخدم `next start` لخدمة static export.
- لا تعالج overflow بوضع `overflow-x: hidden` على الصفحة كلها، ولا تصغّر الخط لإخفاء المشكلة.
- لا توحد الصياغة بين الموبايل والديسكتوب لمجرد اختلاف النص؛ حافظ على المعنى والخدمات والأدلة الأساسية في النسختين.
- لا تضف تقييمات أو نتائج أو شهادات أو أرقام خبرة غير موثقة. لا ضمان لترتيب أو فهرسة أو درجة RankSWAT معينة.
- لا تضف `hreflang` أو review schema إلا إذا انطبقت على محتوى حقيقي. `N/A` لا تعني Fail.
- اقرأ الوثائق المحلية ذات الصلة داخل `node_modules/next/dist/docs/` قبل تعديل APIs؛ الإصدار المحلي هو المرجع للتنفيذ.
- كل مجموعة إصلاح تنتهي بفحص محدد ومراجعة diff. سجل إخفاقات baseline مستقلة عن أي regression جديد؛ لا تتجاوز إخفاقًا مجهول السبب.

## خريطة التنفيذ

| المهمة | الناتج | تعتمد على |
|---|---|---|
| 0 | baseline وإعداد اختبارات قابلة للتكرار | لا شيء |
| 1 | موبايل دون تجاوز أو محتوى مقصوص | 0 |
| 2 | metadata وcanonical صحيحان في HTML وDOM | 0 |
| 3 | schema يصف الصفحة ويرتبط بالكيانات الحالية | 2 |
| 4 | تحسين أداء مثبت بقياس قبل/بعد | 1 و2 |
| 5 | محتوى رئيسية أوضح وروابط أدلة سليمة | 1 و2 |
| 6 | تقرير headers وإعداد استضافة قابل للتطبيق إن لزم | 0؛ مستقل عن تعديلات الصفحة |
| 7 | تحقق نهائي ونسخة قابلة للنشر والتراجع | 1–6 |

## Task 0: تثبيت baseline وتجهيز التحقق

**Files:**
- Read: `package.json`, `package-lock.json`, `.github/workflows/deploy-pages.yml`, `next.config.mjs`, `scripts/audit-ui.mjs`.
- Modify عند الحاجة: `package.json`, `package-lock.json` لضمان dependency اختبار المتصفح.
- Create: `docs/reports/2026-10-20-rankswat-baseline.md`.
- Evidence directory: `test-results/rankswat/before/`؛ لا ترفع ملفات تقارير ثقيلة ضمن الكود.

**Consumes:** التقرير الأصلي والحالة المحلية. **Produces:** جدول الحالة مع route، commit، وجود تغييرات محلية، المتصفح، viewport، theme، تاريخ القياس، والدليل.

- [ ] سجل `git status --short` و`git rev-parse HEAD`، واحفظ diff للملفات التي ستعدلها قبل لمسها. لا تستخدم reset أو stash شاملًا. إذا استخدمت worktree، انقل فقط تغييرات المهمة المطلوبة صراحةً وتأكد أن baseline لم يفقد تعديل الصورة الموجود.
- [ ] تحقق من بيئة الاختبار:

```powershell
node --version
npm ls puppeteer-core
npm ls jsdom vitest
```

الاختبارات الحالية تستورد `puppeteer-core` لكن package.json لا يسجله؛ إذا كان الاعتماد غير معلن أضفه وقت التنفيذ باستخدام `npm install --save-dev --save-exact puppeteer-core`، وسجل النسخة في lockfile واختبرها. لا تعتبر وجوده في node_modules وحده إعدادًا قابلًا للتكرار.

- [ ] اختر executable فعليًا لـChrome أو Edge، وسجل المسار في `CHROME_PATH`. اختبارات الرئيسية الحالية تثبت مسار Chrome؛ عدلها لتقرأ `process.env.CHROME_PATH` مع fallback الحالي. لا تصنف اختبارًا skipped كأنه ناجح.
- [ ] ابنِ نسخة baseline بالأوامر الحالية:

```powershell
npm run validate:content
npm run build
```

`build` يستدعي fetch-metrics ويستطيع تغيير `data/metrics.json`؛ احفظ محتواه قبل التشغيل ولا تدرج التغيير المتولد ضمن إصلاح SEO. لا تستبدل تعديلات المستخدم الموجودة في الملف.

- [ ] شغّل static server القائم في terminal منفصل:

```powershell
node scripts/audit-ui.mjs --serve
```

الخادم يقرأ `out` على port 3012؛ اختبر `http://127.0.0.1:3012/` مباشرة. رسالة التشغيل القديمة تشير إلى `/myPortflio/` لكن ذلك ليس مسار الإنتاج الحالي. إذا كان المنفذ مستخدمًا لا توقف عملية غير معروفة.

- [ ] سجل screenshots للرئيسية بعروض 320، 360، 390، 430، 768، 1366 في الثيمين. اختبر القائمة مفتوحة ومغلقة، keyboard focus، تكبير النص 200% وreduced motion. سجل العناصر المسببة للتجاوز إن وجدت.
- [ ] احفظ raw HTML وقيم head وJSON-LD بعد render للرئيسية الحية وللنسخة المحلية. افصل اختلاف نسخة النشر عن اختلاف HTML/DOM.
- [ ] اجمع 3 تشغيلات Lighthouse للموبايل لكل نسخة تقارنها، بنفس إصدار المتصفح وظروف throttling؛ احفظ JSON ووسيط النتائج. اجمع تشغيل desktop مرجعي. سجل LCP element وCLS والموارد الحرجة وأحجام الخطوط والصور. بيانات INP الميدانية غير المتاحة تسجل unavailable، ولا تستبدلها بـTBT باعتباره INP.
- [ ] شغّل baseline الاختبارات المستهدفة في المهمة 7 وسجل أي أخطاء قبل التعديلات.

**Acceptance:** لا يوجد بند ينتقل إلى إصلاح بوصفه عطلًا مؤكدًا بلا دليل. النتائج الصحيحة تصنف verified-pass، وغير المعاد إنتاجها unconfirmed، وغير المنطبقة not-applicable مع السبب.

## Task 1: إصلاح الموبايل عند إعادة إنتاج الخلل

**Files:** `app/home-grid.css`, `app/page.tsx`؛ `components/SiteHeader.tsx` فقط إذا ثبت خلل في القائمة؛ قواعد shared داخل `app/globals.css` فقط إذا كانت السبب.

**Tests:** وسّع `tests/tools/home-mobile-clear-service.test.js`؛ حافظ على `tests/tools/home-portrait-frame.test.js`؛ استخدم `tests/tools/site-responsive.test.js` لاختبار تأثير القواعد المشتركة.

**Consumes:** selectors وأبعاد التجاوز من المهمة 0. **Produces:** layout صالح على مصفوفة الموبايل مع screenshots مقارنة.

- [ ] أضف الحالة التي تفشل فعلًا إلى اختبار المتصفح وشغّلها قبل الإصلاح. افحص overflow والقص داخل العناوين والأزرار، لا document width وحده:

```js
const geometry = await page.evaluate(() => ({
  pageOverflow: document.documentElement.scrollWidth - innerWidth,
  clipped: [...document.querySelectorAll('.home-title-stack h1, .home-mobile-title-line, .home-actions a')]
    .filter(el => el.getClientRects().length && el.scrollWidth > el.clientWidth + 1)
    .map(el => el.className)
}));
assert.ok(geometry.pageOverflow <= 1, JSON.stringify(geometry));
assert.deepEqual(geometry.clipped, []);
```

- [ ] راجع تحديدًا `.home-mobile-title-line` و`.home-actions a` لأنهما يستخدمان `white-space: nowrap`، وflex sizing لبطاقة الهوية. هذه مرشحات وليست أسبابًا مثبتة.
- [ ] إذا ثبت قص النص بسبب nowrap، غيّر القاعدة المحددة إلى التفاف طبيعي، مثل المثال التالي داخل breakpoint الحالي، ثم افحص شكله:

```css
.home-mobile-title-line {
  width: auto;
  max-width: 100%;
  white-space: normal;
}
.home-actions a {
  white-space: normal;
  min-height: 52px;
  height: auto;
}
```

لا تضف المثال إن لم يكن السبب. إذا كان السبب grid/flex، أصلح child sizing في العنصر المثبت فقط. سجل الـselector والقيمة قبل/بعد في تقرير التنفيذ.

- [ ] اختبر فتح القائمة، إغلاقها بزر Escape والـoverlay، التنقل بالكيبورد، وعدم بقاء body scroll مقفولًا بعد الإغلاق. عدّل SiteHeader فقط عند فشل هذه الحالات.
- [ ] أعد الاختبار والصور بنفس مصفوفة baseline، وتحقق من إطار صورة الديسكتوب الذي توجد له تعديلات سابقة.

**Acceptance:** page overflow بحد أقصى 1px لتفاوت التقريب، لا قص للمحتوى أو focus، أزرار مقروءة، لا تراجع للديسكتوب. إذا لم يظهر العطل، أغلقه كغير معاد الإنتاج مع الدليل دون CSS احتياطي.

## Task 2: إثبات وتصحيح metadata وcanonical

**Files:** `app/layout.tsx`, `lib/site.ts`, `lib/seo.ts`؛ `app/page.tsx` فقط عند الحاجة لتعريف metadata خاص بالرئيسية.

**Create:** `tests/seo/home-metadata-browser.test.js` باستخدام نمط Puppeteer وNode test الموجود، و`SITE_TEST_URL` للـorigin و`CHROME_PATH` للمتصفح.

**Consumes:** raw HTML وDOM لكل نسخة. **Produces:** تقرير values-before/after وregression test للصفحة الرئيسية.

- [ ] اختبر وجود title وdescription وcanonical مرة واحدة في head، وصحة canonical للرئيسية، قبل تشغيل JS وبعده. يمكن مشاركة extractor داخل الاختبار:

```js
function readHead(doc) {
  return {
    title: [...doc.head.querySelectorAll('title')].map(n => n.textContent.trim()),
    description: [...doc.head.querySelectorAll('meta[name="description"]')].map(n => n.content),
    canonical: [...doc.head.querySelectorAll('link[rel="canonical"]')].map(n => n.href)
  };
}
const rawHead = readHead(new JSDOM(html).window.document);
assert.equal(rawHead.title.length, 1);
assert.ok(rawHead.title[0].length > 0);
assert.equal(rawHead.description.length, 1);
assert.ok(rawHead.description[0].length > 0);
assert.deepEqual(rawHead.canonical, ['https://eng-asl.com/']);
```

استورد JSDOM وassert، واحصل على `html` بـfetch من URL الاختبار مع فحص status=200. داخل `page.evaluate` اقرأ الحقول الثلاثة نفسها بعد `document.fonts.ready` وظهور الرئيسية، ثم قارنها بـrawHead. اختبر أيضًا الانتقال من `/about/` إلى الرئيسية والعودة إليها بزر Back.

- [ ] إذا كانت القيم الحالية صحيحة وثابتة لا تعِد تعريفها لمجرد فشل RankSWAT. إن كان الإنتاج وحده قديمًا، سجل ذلك كبند مزامنة نشر، وليس عيب كود مثبتًا.
- [ ] عند ثبوت ازدواج أو override خاطئ، اجعل تعريف metadata للرئيسية في مكان واحد ضمن نمط Next الحالي؛ أزل المصدر المتعارض فقط. لا تحوّل metadata إلى تعديل client-side.
- [ ] شغّل اختبارات discovery الحالية وتحقق من sitemap المنشور دون إعادة فتح إصلاحات سبتمبر المنتهية.

**Acceptance:** canonical صحيح واحد لا يتغير بعد hydration/navigation، وعنوان ووصف يعبران عن الصفحة دون تكرار. صلاحية الإشارات لا تعني أن Google فهرس الصفحة؛ URL Inspection فحص مستقل إن توفر الحساب.

## Task 3: مراجعة schema وربط الصفحة بالكيانات الموجودة

**Files:** `lib/seo.ts`, `app/page.tsx`؛ `components/JsonLd.tsx` للمراجعة فقط ما لم يظهر خلل.

**Create:** `tests/seo/home-schema.test.ts` ضمن config الحالي، وتوسيع اختبار HTML/DOM لقراءة JSON-LD.

**Consumes:** canonical النهائي و`personId`, `websiteId`. **Produces:** graph متسق بدون كيانات مكررة أو ادعاءات جديدة.

- [ ] استخرج كل JSON-LD في HTML والـDOM واختبر JSON.parse. الكود الحالي يعرّف Person وWebSite في layout؛ لا تنشئ نسخًا أخرى منهما.
- [ ] إذا أكدت مراجعة الصفحة أن إضافة WebPage مفيدة لربط الرئيسية، أضف `createHomePageJsonLd(): JsonLdData` في `lib/seo.ts`:

```ts
export function createHomePageJsonLd(): JsonLdData {
  const url = absoluteUrl('/');
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: siteConfig.title,
    description: siteConfig.description,
    isPartOf: { '@id': websiteId },
    about: { '@id': personId }
  };
}
```

اعرضها مرة واحدة داخل الرئيسية باستخدام JsonLd الحالي. لا تضف WebPage الرئيسية في layout العام كي لا تحملها كل المسارات.

- [ ] اختبر النوع والـURL والروابط بين الكيانات، وأن الصفحة تحتوي WebPage واحدة للرئيسية، مع بقاء Person وWebSite الحاليين.
- [ ] تحقق عبر Schema Validator، واستخدم Rich Results Test للأنواع المدعومة. عدم أهلية WebPage لميزة rich result ليس فشلًا بنيويًا.

**Acceptance:** schema يطابق المحتوى الظاهر وروابطه صحيحة؛ لا تقييمات مصطنعة ولا تحويل كل الصفحات إلى ProfilePage لزيادة الدرجة.

## Task 4: تحسين الأداء بناءً على trace

**Files المرشحة:** `app/layout.tsx`, `app/home-grid.css`, `components/ProfilePortrait.tsx`, `app/page.tsx`, `app/design-tokens/fonts.css`, `public/media/optimized/`. لا تعدلها كلها تلقائيًا.

**Consumes:** trace وLCP element وقائمة الموارد من المهمة 0. **Produces:** جدول لكل مورد تغير وتأثيره ومقارنة performance قبل/بعد.

- [ ] افحص استخدام الخطوط الخمسة المحملة في layout وأوزانها وطلبات preload الفعلية. افحص CSS غير المستخدم في الرئيسية قبل نقل أي import.
- [ ] اختر أكبر سبب مقاس أولًا: خط غير مستخدم، CSS خاص بصفحة أخرى، صورة أكبر من حجم عرضها، أو script مكلف. لا تحذف font أو stylesheet ببحث أسماء فقط؛ اختبر الصفحات التي تعتمد عليه.
- [ ] عند ثبوت حمل خطوط غير مستخدمة، انقل تعريفها للـlayout أو المكون الذي يحتاجها أو اضبط preload بحسب الاستخدام. حافظ على fallback والعربية والثيمين، وأعد قياس CLS.
- [ ] عند ثبوت أثر الصور، اضبط width/height أو aspect ratio لتثبيت المساحة، واستخدم أصولًا محسنة وأحجام srcset ملائمة للـstatic export. `images.unoptimized` الحالي لا يوفر تحويل صور تلقائيًا.
- [ ] أعطِ أولوية تحميل للصورة التي ثبت أنها LCP فقط. ضع lazy loading للصور الواقعة أسفل الجزء المرئي بعد التحقق، وافحص هل نسختا الصورة المخفيتان بـCSS تُنزّلان معًا.
- [ ] أعد 3 تشغيلات بنفس الإعدادات. سجّل وسيط LCP وCLS وTBT وحجم النقل؛ لا تسوِّق TBT كـINP. ارفض التغيير إذا لم يحقق تحسنًا قابلًا للتمييز عن تذبذب baseline أو سبب تراجعًا بصريًا.

**Acceptance:** تحسن السبب المستهدف مقاس، وعدم تراجع بقية المؤشرات خارج تذبذب القياس. إذا لم يتوفر field data، يكون القبول مختبريًا فقط وتسجل متابعة ميدانية لاحقة عند توفر بيانات كافية.

## Task 5: وضوح المحتوى والثقة والروابط

**Files:** `app/page.tsx`, `lib/site.ts`؛ `data/portfolio.ts` فقط لتصحيح معلومة موثقة، وليس لتجميل نتائج المشاريع.

**Consumes:** النص الحالي ومعلومات المشاريع الموجودة. **Produces:** مقارنة نص قبل/بعد مع سبب كل تعديل، وروابط أدلة سليمة.

- [ ] حافظ على H1 واحد؛ راجع المعنى الذي يراه مستخدم الموبايل والديسكتوب دون فرض نفس الكلمات أو إضافة H1 ثانٍ.
- [ ] استبدل تعليق التصميم الظاهر حاليًا تحت المشاريع، `Natural project colour carries the evidence. Gold marks the identity and the path through it.`، بصياغة تخدم الزائر. المقترح: `Explore the problem, my contribution, and the implementation details behind each project.` ثم تحقق أن صفحات المشاريع المرتبطة توفر هذه المعلومات بالفعل، وإلا ضيّق الصياغة لما توفره.
- [ ] اقترح عنوان قسم المشاريع `Selected engineering projects` بدل `Systems in the field.` إذا كان الوصف الحالي يوحي بتشغيل ميداني لا تثبته الأدلة. لا تضف ادعاء نشر تجاري أو نتيجة رقمية.
- [ ] راجع مقدمة الصفحة لتوضيح firmware وelectronics وintegration بما يتفق مع دور أحمد الموجود. حافظ على تعريف البراند والعبارة العربية، وعدل الوصف في siteConfig فقط إن كان بحاجة لاتساق مع النص النهائي.
- [ ] تحقق من روابط المشاريع الثلاثة والأدوات والمقالات المعروضة وAbout وContact؛ أضف رابطًا إلى دليل حقيقي حيث يفيد الزائر، دون حشو external links أو إنشاء محتوى طويل لرفع Text-to-HTML Ratio.
- [ ] راجع headings وقراءة النص في الثيمين والموبايل. لا تنشئ اختبارات snapshots للنثر فقط؛ اختبارات البنية والروابط الحالية والمراجعة البصرية كافية.

**Acceptance:** الزائر يفهم الخدمة ويستطيع فتح الدليل والتواصل؛ كل claim مدعوم، وكل رابط داخلي ظاهر في الرئيسية يصل إلى صفحة صحيحة. تحسين Reference Quality أو Topical Depth هنا يخدم غرض البورتفليو، وليس قالب مقال بحثي.

## Task 6: security headers وحدود الاستضافة

**Read:** `.github/workflows/deploy-pages.yml`, `next.config.mjs`, `public/CNAME`، وheaders الحية.

**Create:** `docs/reports/2026-10-20-hosting-headers.md`. لا تضف إعدادات host غير معروف.

**Consumes:** GET response الفعلي وسلسلة redirect من HTTP وHTTPS، وتأكيد مزود الاستضافة/CDN. **Produces:** نتيجة لكل header، والطبقة التي يمكن ضبطه فيها، وتغيير مقترح قابل للتراجع عند الحاجة.

- [ ] التقط headers بطلب GET، مع تاريخ الفحص والـURL النهائي؛ استخدم HEAD للمقارنة فقط. افحص HSTS وCSP وX-Content-Type-Options وReferrer-Policy وسياسة framing بحسب احتياجات الموقع.
- [ ] افصل Security Headers وSecurity Headers Detail إن اختلف الدليل؛ وإلا سجلهما كتوصيتين لنفس السبب.
- [ ] Next static export لا يطبق `headers()` من next.config على خادم الإنتاج. لا تضفها كإصلاح شكلي؛ أكدت الوثائق المحلية هذا القيد.
- [ ] إن كان هناك CDN حالي يدعم التعديل: جهّز القيم والموارد المسموح بها وطريقة الرجوع ضمن إعداداته الفعلية. إذا لم توجد طبقة متحكم بها، سجل البند كاعتماد استضافة، وقارن إضافة CDN مقابل تغيير الاستضافة بمزايا وتكلفة محددة قبل أي تغيير DNS.
- [ ] عند اقتراح CSP، راجع theme initializer وNext inline scripts وJSON-LD والموارد الخارجية؛ ابدأ Report-Only إن كانت الطبقة تدعمه ثم اختبر الأدوات وPDF والروابط قبل enforcement. لا تجعل سياسة عامة تكسر الموقع.
- [ ] راجع تغطية HTTPS للنطاقات قبل أي `includeSubDomains` أو preload في HSTS؛ لا تضفهما تلقائيًا. جهّز اختبار GET بعد التفعيل.

**Acceptance:** كل نقص مثبت له إصلاح في طبقة تستطيع إرساله أو حالة dependency موثقة. لا يوصف هذا المسار بأنه مكتمل على الإنتاج قبل ظهور header الفعلي. يمكن تجهيز إصدار الواجهة مستقلًا مع إظهار حالة هذا المسار بوضوح.

## Task 7: التحقق النهائي والتسليم والنشر

**Files:** `docs/reports/2026-10-20-rankswat-results.md`؛ `.github/workflows/deploy-pages.yml` فقط لإضافة الفحوص المستهدفة بعد إثبات تشغيلها محليًا وعلى runner.

**Consumes:** نتائج المراحل السابقة وproduction export النهائي. **Produces:** نتيجة لكل بند audit، screenshots قبل/بعد، أوامر التحقق ونتائجها، ونطاق نشر محدد.

- [ ] شغّل اختبارات SEO الحالية والمضافة:

```powershell
npx vitest run --config vitest.seo.config.ts
npm run validate:content
npm run build
```

- [ ] أعد تشغيل static server على `out` الجديد، ثم في terminal آخر:

```powershell
$env:TEST_BASE_URL = 'http://127.0.0.1:3012'
$env:SITE_TEST_URL = 'http://127.0.0.1:3012'
$env:SITE_RESPONSIVE_BASE_URL = 'http://127.0.0.1:3012'
node --test --test-concurrency=1 tests/tools/home-mobile-clear-service.test.js tests/tools/home-portrait-frame.test.js
node --test tests/seo/home-metadata-browser.test.js
node scripts/verify-discovery.mjs
node --test tests/tools/site-responsive.test.js
npm test
```

`CHROME_PATH` يجب ضبطه بمسار المتصفح المكتشف في المهمة 0. إذا فشل verify-discovery بسبب مسار preview تاريخي، افصل ذلك كفشل baseline مثبت؛ لا تحذف assertion لإخفائه. `npm test` لا يشمل `tests/seo`؛ لذلك أوامر SEO المستقلة مطلوبة.

- [ ] فحص smoke إلزامي للرئيسية و`/about/` و`/work/embedded-iot/toolguard/` و`/tools/battery-estimator/` و`/notes/welcome-to-field-notes/`، مع التأكد من أن المقال منشور في baseline. إذا كان غير منشور، اختر أول مقال منشور من sitemap وسجل مساره.
- [ ] عند إضافة CI، اجعل checks على export بعد build، واضبط متصفح runner والخادم قبل browser tests؛ لا تنسخ أوامر Windows ومساراته إلى Ubuntu. شغّل SEO unit suite في job الاختبار، وexport/browser checks في build قبل upload. أبقِ أي عطل قديم في CI ظاهرًا ومشروحًا.
- [ ] راجع diff بحيث لا يضم تعديلات Gradify أو metrics أو ملفات المستخدم غير المرتبطة. كل commit يضم مجموعة إصلاح ونتيجة تحقق فقط؛ لا staging شامل.
- [ ] وثق البنود بصيغة `fixed-and-verified / verified-pass / unconfirmed / not-applicable / hosting-dependency` مع الدليل. لا تعلن انتهاء كل الـaudit إذا بقي اعتماد استضافة أو فحص مطلوب غير منفذ.
- [ ] جهز نسخة review وتقرير النشر. الـworkflow الحالي ينشر عند push إلى main؛ لا تدفع main كخطوة توثيق عادية. عند طلب التنفيذ، أنجز الإصلاحات والفحوص أولًا ثم احصل على تفويض النشر إن لم يكن موجودًا وقتها.
- [ ] بعد النشر المصرح به: افحص HTML وDOM وheaders والروابط على `https://eng-asl.com/` وأعد Lighthouse وRankSWAT بنفس الإعدادات. عند regression، أعد نشر آخر artifact سليم أو اعكس commits هذه المهمة فقط؛ لا تعكس تعديلات الآخرين.

## التغطية ومتى نعتبر المهمة منتهية

| مجموعة التقرير | تغطيتها |
|---|---|
| Horizontal Scroll وMobile Friendliness | 0، 1، 7 |
| Rendered Canonical/Title/Description Parity | 0، 2، 7 |
| Render-Blocking Resources والقياسات غير المتاحة | 0، 4، 7 |
| Structured Data وSchema Page Type Fit | 3 |
| Security Headers وDetail وHSTS | 6 |
| Readability وScannability وContent Structure وH1 وSemantic Headings | 1، 5 |
| Reference Quality وTrust Hooks وOriginality | 5 |
| Topical Depth وSearch Intent | 5 |
| Internal/External Links | 5، 7 |
| Text-to-HTML Ratio | مراجعة المحتوى والحجم في 4 و5؛ لا حشو نص |
| Indexability وRendered Content وmobile parity وN/A | 0، 2، 7؛ فحص قابلية التطبيق أولًا |

تكتمل تغييرات الكود عند نجاح الاختبارات المناسبة ووضوح نتائج baseline مقابل after، وتكتمل معالجة الموقع المنشور بعد التحقق الحي. نبلغ عن أي بند غير محسوم باسمه وسببه. ترتيب البحث والزيارات ومؤشرات field data تحتاج بيانات لاحقة ولا تدخل كوعود ضمن التسليم.

## مصادر القيود التقنية

- [Next static export](https://nextjs.org/docs/app/guides/static-exports): ناتج HTML وموارد ثابتة؛ إعدادات server headers غير مدعومة في export. الوثائق المحلية للإصدار المثبت مقدمة عند اختلاف الإصدارات.
- [Google JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics): مقارنة HTML بالعرض، واتساق canonical؛ تغيير title أو description بالـJavaScript ليس فشلًا تلقائيًا.
- [Schema.org WebPage](https://schema.org/WebPage): وصف الصفحة وربطها بكيانات الموقع والشخص عندما يطابق ذلك المحتوى.
