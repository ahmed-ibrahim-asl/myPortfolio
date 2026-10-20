import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { PublicImage } from "@/components/PublicImage";
import { JsonLd } from "@/components/JsonLd";
import { createHomePageJsonLd } from "@/lib/seo";
import { profile, projects, workingMethod } from "@/data/portfolio";
import { workCategories } from "@/data/work-categories";
import { engineeringTools } from "@/data/tools";
import { formatDate, getAllPosts } from "@/lib/content";
import type { Locale } from "@/lib/i18n/types";

export function LushHomePageView({ locale }: { locale: Locale }) {
  const ar = locale === "ar";
  const prefix = ar ? "/ar" : "";
  const text = (en: string, arabic: string) => ar ? arabic : en;
  const projectUrl = (slug: string) => {
    const project = projects.find(item => item.slug === slug)!;
    const group = workCategories.find(item => item.categories.includes(project.category))!;
    return `/work/${group.id}/${slug}/`;
  };
  const notes = getAllPosts().slice(0, 3);
  const tools = engineeringTools.slice(0, 3);

  return (
    <div className="lush-home" dir={ar ? "rtl" : "ltr"}>
      <JsonLd data={createHomePageJsonLd(locale)} />
      <section className="lush-opening lush-width" aria-labelledby="lush-title">
        <div className="lush-introduction">
          <h1 id="lush-title">
            {text("Hardware,", "هاردوير،")}<br />
            {text("firmware.", "وفيرموير.")}
            <span>{text("Working together.", "نظام واحد شغّال.")}</span>
          </h1>
          <p className="lush-lead">{text(
            "I build connected systems, from the electronics and firmware to the interface you use.",
            "ببني أنظمة متصلة، من الإلكترونيات والفيرموير لواجهة الاستخدام."
          )}</p>
          <Link className="lush-button" href={`${prefix}/work/`}>
            {text("Explore projects", "شوف المشاريع")}<ArrowRight aria-hidden="true" size={20} />
          </Link>
          <Link className="lush-maker" href={`${prefix}/about/`}>
            <PublicImage src={profile.portrait} alt="" sizes="72px" loading="eager" />
            <span><strong>{text(profile.name, "أحمد إبراهيم عسل")}</strong><small>{text(profile.role, "مهندس أنظمة مدمجة وإنترنت الأشياء")}</small></span>
          </Link>
        </div>
        <figure className="lush-feature">
          <Link className="lush-feature-image" href={projectUrl("wireless-rov-control")} aria-label={text("Explore the Wireless ROV Control System", "شوف نظام التحكم في الروبوت الغواص")}>
            <PublicImage src="/media/portfolio/showcase/wireless-rov/prototype.webp"
              alt={text("Original Wireless ROV prototype with its frame and thrusters", "النموذج الأصلي للروبوت الغواص بإطاره ومحركاته")}
              sizes="(max-width: 760px) 100vw, 60vw" loading="eager" fetchPriority="high" />
            <span className="lush-image-label">{text("Original prototype", "النموذج الأصلي")}</span>
          </Link>
          <figcaption>
            <Link href={projectUrl("wireless-rov-control")}>
              <span><strong>{text("Wireless ROV", "روبوت غواص لاسلكي")}</strong><small>{text("Bidirectional telemetry & control", "بيانات وتحكم في الاتجاهين")}</small></span>
              <ArrowUpRight aria-hidden="true" size={30} />
            </Link>
            <p dir="ltr">ESP32 · NRF24L01+</p>
          </figcaption>
        </figure>
      </section>

      <section className="lush-work lush-width" aria-labelledby="lush-work-title">
        <div className="lush-section-heading">
          <h2 id="lush-work-title">{text("Inside the build.", "جوه المشروع.")}</h2>
          <p>{text("The hardware, the decisions, and the details that connect them.", "الهاردوير، والقرارات، والتفاصيل اللي بتربطهم ببعض.")}</p>
        </div>
        <div className="lush-projects">
          <article className="lush-project">
            <Link className="lush-project-image" href={projectUrl("aqua-sync")}>
              <PublicImage src="/media/portfolio/showcase/aqua-sync/photos-1.webp" alt={text("Original Aqua Sync boards and CrowPanel HMI", "لوحات Aqua Sync الأصلية وشاشة CrowPanel")} sizes="(max-width: 760px) 100vw, 55vw" />
            </Link>
            <div className="lush-project-description">
              <div><h3><Link href={projectUrl("aqua-sync")}>Aqua Sync<ArrowUpRight aria-hidden="true" size={22} /></Link></h3>
              <p>{text("Sensor monitoring, a 7-inch HMI, and OTA firmware updates across connected ESP32 boards.", "متابعة الحساسات، وشاشة ٧ بوصات، وتحديث الفيرموير عن بُعد بين لوحات ESP32 متصلة.")}</p></div>
              <span>{text("Original hardware", "الهاردوير الأصلي")}</span>
            </div>
          </article>
          <article className="lush-project">
            <Link className="lush-project-image lush-project-diagram" href={projectUrl("multi-mcu-security-lock")}>
              <PublicImage src="/media/portfolio/multi-mcu-security-lock-architecture.svg" alt={text("Multi-MCU Security Lock system architecture diagram", "مخطط نظام القفل متعدد المتحكمات")} original />
            </Link>
            <div className="lush-project-description">
              <div><h3><Link href={projectUrl("multi-mcu-security-lock")}>{text("Multi-MCU Security Lock", "قفل متعدد المتحكمات")}<ArrowUpRight aria-hidden="true" size={22} /></Link></h3>
              <p>{text("Explore how the controllers, communication links, and access logic fit together.", "شوف إزاي المتحكمات وروابط الاتصال ومنطق الدخول بيشتغلوا مع بعض.")}</p></div>
              <span>{text("System architecture", "مخطط النظام")}</span>
            </div>
          </article>
        </div>
        <Link className="lush-inline-link" href={`${prefix}/work/`}>{text("Browse the complete project collection", "شوف كل المشاريع")}<ArrowRight aria-hidden="true" size={20} /></Link>
      </section>

      <section className="lush-tool-surface" aria-labelledby="lush-tools-title">
        <div className="lush-width lush-tools">
          <div className="lush-tools-intro">
            <h2 id="lush-tools-title">{text("Try the tools.", "جرّب الأدوات.")}</h2>
            <p>{text("Calculate, generate, and work through a problem in your browser.", "احسب، وولّد الكود، واشتغل على المشكلة من المتصفح.")}</p>
            <Link className="lush-inline-link" href={`${prefix}/tools/`}>{text("Open the workbench", "افتح ورشة الأدوات")}<ArrowRight aria-hidden="true" size={20} /></Link>
          </div>
          <div className="lush-tool-list">
            {tools.map(tool => <Link href={tool.href} key={tool.id} className="lush-tool">
              <span dir="auto"><strong>{tool.title}</strong><span>{tool.description}</span></span><ArrowUpRight aria-hidden="true" size={24} />
            </Link>)}
          </div>
        </div>
      </section>

      <section className="lush-notes lush-width" aria-labelledby="lush-notes-title">
        <div className="lush-section-heading">
          <h2 id="lush-notes-title">{text("Notes from the work.", "ملاحظات من الشغل.")}</h2>
          <Link className="lush-inline-link" href={`${prefix}/notes/`}>{text("Read all notes", "اقرأ كل الملاحظات")}<ArrowRight aria-hidden="true" size={20} /></Link>
        </div>
        <div className="lush-note-list">
          {notes.map(note => <Link key={note.slug} href={`/notes/${note.slug}/`}>
            <time dateTime={note.publishedAt}>{formatDate(note.publishedAt)}</time>
            <span dir="auto"><h3>{note.title}</h3><small>{note.category} · {note.readingTime} {text("min read", "دقايق قراءة")}</small></span>
            <ArrowUpRight aria-hidden="true" size={24} />
          </Link>)}
        </div>
        <div className="lush-resources">
          <p>{text("Looking for something you can reuse?", "محتاج حاجة تستخدمها في شغلك؟")}</p>
          <Link href="/prompts/">{text("Browse prompts", "تصفّح البرومبتات")}<ArrowUpRight aria-hidden="true" size={18} /></Link>
          <Link href="/notes/library/">{text("Open the resource library", "افتح مكتبة المصادر")}<ArrowUpRight aria-hidden="true" size={18} /></Link>
        </div>
      </section>

      <section className="lush-process lush-width" aria-labelledby="lush-process-title">
        <h2 id="lush-process-title">{text("How I approach a system.", "ببدأ مع النظام إزاي.")}</h2>
        <ol>
          {workingMethod.map(item => <li key={item.step} dir="auto">
            <h3>{item.label}</h3><p>{item.description}</p>
          </li>)}
        </ol>
      </section>
    </div>
  );
}
