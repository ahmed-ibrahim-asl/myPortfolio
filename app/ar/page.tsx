import Link from "next/link";
import { profile, projects } from "@/data/portfolio";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({ title: "أحمد إبراهيم عسل | مهندس أنظمة مدمجة وإنترنت الأشياء", description: "الموقع الشخصي لأحمد إبراهيم عسل: مشروعات أنظمة مدمجة وروبوتات وأدوات هندسية عملية.", pathname: "/ar/", locale: "ar", translated: true });

export default function ArabicHomePage() {
  return <div className="home-page asl-arabic-page">
    <section className="home-hero shell"><div className="home-hero-copy">
      <p className="eyebrow">مهندس أنظمة مدمجة وبحث وتطوير / مصر</p>
      <div className="home-title-stack"><h1>من الفكرة لنظام شغال تقدر تختبره.</h1></div>
      <p className="home-summary">أنا {profile.name}. بربط الإلكترونيات والبرمجيات والاتصالات علشان أبني نماذج واضحة، قابلة للقياس، وسهلة التطوير.</p>
      <div className="home-actions"><Link className="btn-primary" href="/ar/work/">شوف المشاريع</Link><Link className="btn-secondary" href="/ar/tools/">استكشف الأدوات</Link></div>
    </div></section>
    <section className="section shell"><div className="section-heading"><div><p className="eyebrow">مشروعات موثقة</p><h2>بناء فعلي، مش مجرد عرض.</h2></div></div><div className="planned-notes-grid">{projects.filter(p=>p.featured).slice(0,4).map(project=><article className="planned-note-card" key={project.slug}><p className="mono">{project.category} / {project.year}</p><h3 dir="auto">{project.title}</h3><p>{project.description}</p></article>)}</div></section>
  </div>;
}
