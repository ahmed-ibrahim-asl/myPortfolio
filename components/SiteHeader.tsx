"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { getDictionary } from "@/lib/i18n/dictionaries";

export function SiteHeader() {
  const pathname = usePathname() || "/";
  const locale = pathname === "/ar" || pathname.startsWith("/ar/") ? "ar" : "en";
  const dictionary = getDictionary(locale);
  const prefix = locale === "ar" ? "/ar" : "";
  const homeHref = `${prefix}/`;
  const links = [
    { href: homeHref, label: dictionary.nav.home },
    { href: `${prefix}/work`, label: dictionary.nav.work },
    { href: `${prefix}/tools`, label: dictionary.nav.tools },
    { href: `${prefix}/notes`, label: dictionary.nav.notes },
    { href: `${prefix}/about`, label: dictionary.nav.about }
  ];
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="brand" href={homeHref} onClick={() => setOpen(false)} aria-label="Ahmed Ibrahim Asl home">
          <span className="brand-latin">ASL</span>
          <span className="brand-divider" aria-hidden="true" />
          <span className="brand-arabic" lang="ar" dir="rtl">بشمهندس عسل</span>
          <span className="brand-agent">AGENT / 101</span>
        </Link>
        <button className="menu-toggle" type="button" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} aria-controls="site-navigation" onClick={() => setOpen((value) => !value)}>
          <span className="menu-icon" aria-hidden="true"><span /><span /><span /></span>
        </button>
        <nav id="site-navigation" className={`site-nav ${open ? "is-open" : ""}`} aria-label="Primary navigation">
          {links.map((link) => {
            const active = link.href === homeHref
              ? pathname === homeHref || pathname === homeHref.replace(/\/$/, "")
              : pathname === link.href || pathname.startsWith(`${link.href}/`);
            return <Link key={link.href} href={link.href} className={active ? "active" : ""} aria-current={active ? "page" : undefined} onClick={() => setOpen(false)}>{link.label}</Link>;
          })}
          <ThemeToggle />
          <LanguageSwitch />
          <Link className="header-contact" href={`${prefix}/contact`} onClick={() => setOpen(false)}>{dictionary.nav.contact}</Link>
        </nav>
      </div>
      {open ? <button className="menu-overlay" aria-label="Close navigation" onClick={() => setOpen(false)} /> : null}
    </header>
  );
}
