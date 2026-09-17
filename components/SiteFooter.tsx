import React from "react";
import Link from "next/link";
import { profile } from "@/data/portfolio";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-identity">
          <p className="eyebrow">OPEN FOR SELECTED COLLABORATIONS / 101</p>
          <h2>Bring the system that needs an answer.</h2>
          <div className="footer-actions">
            <Link className="btn-primary" href="/contact">Send a project brief</Link>
            <a className="btn-secondary" href={`mailto:${profile.email}`}>Email Ahmed</a>
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
