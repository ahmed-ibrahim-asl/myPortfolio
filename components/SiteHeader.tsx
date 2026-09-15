"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";

const links = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/tools", label: "Tools" },
  { href: "/notes", label: "Notes" },
  { href: "/about", label: "About" }
];

export function SiteHeader() {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);

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
        <Link className="brand" href="/" onClick={() => setOpen(false)} aria-label="Ahmed Ibrahim Asl home">
          <span className="brand-latin">ASL</span>
          <span className="brand-divider" aria-hidden="true" />
          <span className="brand-arabic" lang="ar" dir="rtl">بشمهندس عسل</span>
          <span className="brand-agent">AGENT / 101</span>
        </Link>
        <button className="menu-toggle" type="button" aria-expanded={open} aria-controls="site-navigation" onClick={() => setOpen((value) => !value)}>
          <span>{open ? "Close" : "Menu"}</span><span aria-hidden="true">{open ? "x" : "+"}</span>
        </button>
        <nav id="site-navigation" className={`site-nav ${open ? "is-open" : ""}`} aria-label="Primary navigation">
          {links.map((link) => {
            const active = link.href === "/"
              ? pathname === "/"
              : pathname === link.href || pathname.startsWith(`${link.href}/`);
            return <Link key={link.href} href={link.href} className={active ? "active" : ""} aria-current={active ? "page" : undefined} onClick={() => setOpen(false)}>{link.label}</Link>;
          })}
          <ThemeToggle />
          <Link className="header-contact" href="/contact" onClick={() => setOpen(false)}>Start a project</Link>
        </nav>
      </div>
      {open ? <button className="menu-overlay" aria-label="Close navigation" onClick={() => setOpen(false)} /> : null}
    </header>
  );
}
