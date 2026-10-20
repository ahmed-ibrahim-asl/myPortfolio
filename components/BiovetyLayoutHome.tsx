import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { PublicImage } from "@/components/PublicImage";
import { JsonLd } from "@/components/JsonLd";
import { createHomePageJsonLd } from "@/lib/seo";
import { profile, workingMethod } from "@/data/portfolio";
import { engineeringTools } from "@/data/tools";
import { formatDate, getAllPosts } from "@/lib/content";
import type { Locale } from "@/lib/i18n/types";

export function BiovetyLayoutHome({ locale }: { locale: Locale }) {
  const ar = locale === "ar";
  const prefix = ar ? "/ar" : "";
  const t = (en: string, arabic: string) => ar ? arabic : en;
  const work = "/work/embedded-iot/";
  const routes = [
    { label: t("Embedded & IoT", "الأنظمة المدمجة"), detail: "ESP32 · Firmware · Sensors", href: work },
    { label: t("Robotics", "الروبوتات"), detail: t("Control & autonomous systems", "التحكم والأنظمة ذاتية الحركة"), href: "/work/robotics/" },
    { label: t("Apps & interfaces", "التطبيقات والواجهات"), detail: t("The software around the hardware", "البرمجيات اللي بتكمل الهاردوير"), href: "/work/apps-ui/" },
    { label: t("Engineering tools", "الأدوات الهندسية"), detail: t("Calculators & guided workflows", "حاسبات وخطوات عمل عملية"), href: `${prefix}/tools/` }
  ];
  return (
    <div className="lush-home folio-home" dir={ar ? "rtl" : "ltr"}>
      <JsonLd data={createHomePageJsonLd(locale)} />
      <section className="folio-hero" aria-labelledby="folio-heading">
        <div className="folio-hero-copy">
          <h1 id="folio-heading">{t("I build firmware, hardware and connected interfaces.", "ببني الفيرموير والهاردوير وواجهات الأنظمة المتصلة.")}</h1>
          <p>{t("Embedded systems, IoT and robotics. Here are the prototypes, code and tools I work on.", "أنظمة مدمجة، وإنترنت الأشياء، وروبوتات. هنا النماذج الأولية والكود والأدوات اللي بشتغل عليها.")}</p>
          <div className="folio-actions">
            <Link href={`${prefix}/work/`} className="folio-button">{t("View projects", "شوف المشاريع")}<ArrowRight size={19} aria-hidden="true" /></Link>
            <Link href={`${prefix}/contact/`} className="folio-text-link">{t("Discuss a project", "نتكلم عن مشروعك")}</Link>
          </div>
          <Link className="folio-maker" href={`${prefix}/about/`}>
            <PublicImage src={profile.portrait} alt="" sizes="56px" loading="eager" />
            <span><strong>{t(profile.name, "أحمد إبراهيم عسل")}</strong><small>{t(profile.role, "مهندس أنظمة مدمجة وإنترنت الأشياء")}</small></span>
          </Link>
        </div>
        <div className="folio-project-window" aria-label={t("Selected project evidence", "نماذج من المشاريع")}>
          <Link className="folio-window-main" href={`${work}wireless-rov-control/`}>
            <PublicImage src="/media/portfolio/showcase/wireless-rov/prototype.webp" alt={t("Original Wireless ROV prototype", "النموذج الأصلي للروبوت الغواص")} sizes="(max-width: 760px) 60vw, 34vw" loading="eager" fetchPriority="high" />
            <span><strong>Wireless ROV</strong><small>{t("Original prototype", "النموذج الأصلي")}</small><ArrowUpRight size={20} aria-hidden="true" /></span>
          </Link>
          <Link className="folio-window-aqua" href={`${work}aqua-sync/`}>
            <PublicImage src="/media/portfolio/showcase/aqua-sync/photos-1.webp" alt={t("Aqua Sync boards connected to the CrowPanel display", "لوحات Aqua Sync متصلة بشاشة CrowPanel")} sizes="(max-width: 760px) 40vw, 24vw" loading="eager" />
            <span><strong>Aqua Sync</strong><small>{t("Hardware & interface", "الهاردوير والواجهة")}</small><ArrowUpRight size={20} aria-hidden="true" /></span>
          </Link>
          <Link className="folio-window-lock" href={`${work}multi-mcu-security-lock/`}>
            <PublicImage src="/media/portfolio/multi-mcu-security-lock-architecture.svg" alt={t("Multi-MCU Security Lock architecture", "مخطط القفل متعدد المتحكمات")} original loading="eager" />
            <span><strong>{t("Multi-MCU lock", "قفل متعدد المتحكمات")}</strong><small>{t("System architecture", "مخطط النظام")}</small><ArrowUpRight size={20} aria-hidden="true" /></span>
          </Link>
        </div>
      </section>

      <nav className="folio-discipline-band" aria-label={t("Explore work by discipline", "تصفح الشغل حسب التخصص")}>
        <div className="folio-width">{routes.map(route => <Link key={route.href} href={route.href}>
          <span><strong>{route.label}</strong><small dir="auto">{route.detail}</small></span><ArrowUpRight aria-hidden="true" size={20} />
        </Link>)}</div>
      </nav>

      <section className="folio-case folio-width" aria-labelledby="folio-case-heading">
        <figure>
          <Link href={`${work}aqua-sync/`}><PublicImage src="/media/portfolio/showcase/aqua-sync/photos-1.webp" alt={t("Original Aqua Sync hardware with a 7-inch CrowPanel HMI", "هاردوير Aqua Sync الأصلي وشاشة CrowPanel مقاس ٧ بوصات")} sizes="(max-width: 760px) 90vw, 45vw" /></Link>
          <figcaption>{t("Aqua Sync 2.0.0 · Original hardware and screen", "Aqua Sync 2.0.0 · الهاردوير والشاشة الأصليين")}</figcaption>
        </figure>
        <div className="folio-case-copy">
          <h2 id="folio-case-heading">{t("A closer look at Aqua Sync.", "نظرة أقرب على Aqua Sync.")}</h2>
          <p>{t("I upgraded an ESP32 system by connecting its sensor data, boards and touchscreen interface.", "طوّرت نظام ESP32 وربطت بيانات الحساسات واللوحات بواجهة الشاشة اللمس.")}</p>
          <dl>
            <div><dt>{t("Firmware & integration", "الفيرموير وربط المكونات")}</dt><dd>{t("Ten one-wire temperature sensors, a DHT sensor, communication between two boards, and OTA updates.", "عشرة حساسات حرارة one-wire، وحساس DHT، واتصال بين لوحتين، وتحديثات OTA.")}</dd></div>
            <div><dt>{t("The interface", "واجهة الاستخدام")}</dt><dd>{t("A 7-inch CrowPanel HMI. I designed the screens in Figma and built the interface in SquareLine Studio.", "شاشة CrowPanel مقاس ٧ بوصات. صممت الشاشات في Figma ونفذت الواجهة في SquareLine Studio.")}</dd></div>
          </dl>
          <Link className="folio-text-link" href={`${work}aqua-sync/`}>{t("See the build and demonstration", "شوف المشروع وفيديو التجربة")}<ArrowRight size={19} aria-hidden="true" /></Link>
          <details className="folio-method">
            <summary>{t("How I approach an engineering problem", "بشتغل على المشكلة الهندسية إزاي")}</summary>
            <ol>{workingMethod.map(item=><li key={item.step} dir="auto"><strong>{item.label}</strong><p>{item.description}</p></li>)}</ol>
          </details>
        </div>
      </section>

      <section className="folio-desk" aria-labelledby="folio-desk-heading">
        <div className="folio-width folio-desk-grid">
          <div className="folio-tools">
            <h2 id="folio-desk-heading">{t("Tools you can use.", "أدوات تقدر تستخدمها.")}</h2>
            <p>{t("Open a calculator or work through a task in your browser.", "افتح حاسبة أو اشتغل على مهمة من المتصفح.")}</p>
            <div className="folio-tool-list">{engineeringTools.slice(0,3).map(tool=><Link href={tool.href} key={tool.id}>
              <span dir="auto"><h3>{tool.title}</h3><p>{tool.description}</p></span><ArrowUpRight size={22} aria-hidden="true" />
            </Link>)}</div>
            <Link className="folio-text-link" href={`${prefix}/tools/`}>{t("Browse all tools", "تصفح كل الأدوات")}<ArrowRight size={19} aria-hidden="true" /></Link>
          </div>
          <aside className="folio-notebook" aria-labelledby="folio-notes-heading">
            <h2 id="folio-notes-heading">{t("From my notes.", "من ملاحظاتي.")}</h2>
            {getAllPosts().slice(0,3).map(note=><article key={note.slug}>
              <time dateTime={note.publishedAt}>{formatDate(note.publishedAt)}</time>
              <h3 dir="auto"><Link href={`/notes/${note.slug}/`}>{note.title}</Link></h3>
              <p>{note.readingTime} {t("min read", "دقايق قراءة")}</p>
            </article>)}
            <Link className="folio-text-link" href={`${prefix}/notes/`}>{t("Read all notes", "اقرأ كل الملاحظات")}<ArrowRight size={19} aria-hidden="true" /></Link>
            <div className="folio-resources"><Link href="/prompts/">{t("Prompt collection", "مجموعة البرومبتات")}<ArrowUpRight size={17} aria-hidden="true" /></Link><Link href="/notes/library/">{t("Resource library", "مكتبة المصادر")}<ArrowUpRight size={17} aria-hidden="true" /></Link></div>
          </aside>
        </div>
      </section>
    </div>
  );
}
