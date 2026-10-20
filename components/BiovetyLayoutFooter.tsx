"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { profile } from "@/data/portfolio";

export function BiovetyLayoutFooter() {
  const pathname = usePathname() || "/";
  const ar = pathname === "/ar" || pathname.startsWith("/ar/");
  const prefix = ar ? "/ar" : "";
  return <footer className="folio-footer" dir={ar ? "rtl" : "ltr"}>
    <div className="folio-width folio-contact">
      <div><h2>{ar ? "ابعتلي تفاصيل مشروعك." : "Tell me about your project."}</h2>
      <p>{ar ? "الفكرة، والمرحلة اللي وصلت لها، والجزء اللي محتاج مساعدة فيه." : "The idea, where you are now, and the part you need help with."}</p></div>
      <Link className="folio-button" href={`${prefix}/contact/`}>{ar ? "تواصل معي" : "Get in touch"}<ArrowUpRight aria-hidden="true" size={20} /></Link>
    </div>
    <div className="folio-width folio-footer-links">
      <a href={`mailto:${profile.email}`}>{profile.email}</a>
      <a href={profile.cv} target="_blank" rel="noopener noreferrer">{ar ? "السيرة الذاتية" : "View CV"}</a>
      <a href={profile.socials.find(s=>s.label==="GitHub")?.href}>GitHub</a>
      <Link href={`${prefix}/about/`}>{ar ? "عن أحمد" : "About Ahmed"}</Link>
      <span>© {new Date().getFullYear()} {ar ? "أحمد إبراهيم عسل" : profile.name}</span>
    </div>
  </footer>;
}
