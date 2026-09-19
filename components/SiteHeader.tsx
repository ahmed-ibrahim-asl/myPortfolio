"use client";

import React, { useEffect, useRef, useState } from "react";
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
    { href: `${prefix}/tools`, label: dictionary.nav.tools }
  ];
  const moreLinks = [
    { href: `${prefix}/notes`, label: dictionary.nav.notes },
    { href: `${prefix}/about`, label: dictionary.nav.about }
  ];
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDetailsElement>(null);
  const isActive = (href: string) =>
    href === homeHref
      ? pathname === homeHref || pathname === homeHref.replace(/\/$/, "")
      : pathname === href || pathname.startsWith(`${href}/`);
  const moreActive = moreLinks.some((link) => isActive(link.href));

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setMoreOpen(false);
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, []);

  useEffect(() => {
    if (!moreOpen) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) setMoreOpen(false);
    };
    document.addEventListener("click", closeOnOutsideClick);
    return () => document.removeEventListener("click", closeOnOutsideClick);
  }, [moreOpen]);

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

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
            const active = isActive(link.href);
            return <Link key={link.href} href={link.href} className={active ? "active" : ""} aria-current={active ? "page" : undefined} onClick={() => setOpen(false)}>{link.label}</Link>;
          })}
          <details
            ref={moreRef}
            className="nav-more"
            open={moreOpen}
            onToggle={(event) => setMoreOpen((event.target as HTMLDetailsElement).open)}
          >
            <summary className={moreActive ? "active" : ""} aria-label={dictionary.nav.more}>
              {dictionary.nav.more}
            </summary>
            <div className="nav-more-menu" role="menu" aria-label={dictionary.nav.more}>
              {moreLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    role="menuitem"
                    className={active ? "active" : ""}
                    aria-current={active ? "page" : undefined}
                    onClick={() => {
                      setOpen(false);
                      setMoreOpen(false);
                    }}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </details>
          <ThemeToggle />
          <LanguageSwitch />
          <Link className="header-contact" href={`${prefix}/contact`} onClick={() => setOpen(false)}>{dictionary.nav.contact}</Link>
        </nav>
      </div>
      {open ? <button className="menu-overlay" aria-label="Close navigation" onClick={() => setOpen(false)} /> : null}
    </header>
  );
}
