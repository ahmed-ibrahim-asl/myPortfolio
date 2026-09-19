"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { profile } from "@/data/portfolio";
import { getDictionary } from "@/lib/i18n/dictionaries";

export function SiteFooter() {
  const pathname = usePathname() || "/";
  const locale = pathname === "/ar" || pathname.startsWith("/ar/") ? "ar" : "en";
  const dictionary = getDictionary(locale);
  const prefix = locale === "ar" ? "/ar" : "";
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-identity">
          <p className="eyebrow">{locale === "ar" ? "متاح لمشروعات مختارة / 101" : "OPEN FOR SELECTED COLLABORATIONS / 101"}</p>
          <h2>{locale === "ar" ? "عندك نظام محتاج حل؟ خلينا نفهمه ونبنيه صح." : "Bring the system that needs an answer."}</h2>
          <div className="footer-actions">
            <Link className="btn-primary" href={`${prefix}/contact`}>{dictionary.actions.sendBrief}</Link>
            <a className="btn-secondary" href={`mailto:${profile.email}`}>{dictionary.actions.email}</a>
          </div>
        </div>
        <div className="footer-arabic" lang="ar" dir="rtl"><p>اسأل. تعلّم.</p><p>ابنِ. اختبر.</p></div>
      </div>
      <div className="shell footer-bottom">
        <span>© {new Date().getFullYear()} AHMED IBRAHIM ASL</span>
        <span className="footer-signature" lang="ar" dir="rtl">بشمهندس عسل</span>
        <span>EGYPT / {profile.role} / AGENT 101</span>
      </div>
    </footer>
  );
}
