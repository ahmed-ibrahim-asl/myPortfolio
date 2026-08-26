"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AslLogo } from "@/components/brand/AslLogo";

const links = [
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/writing", label: "Writing" },
  { href: "/tools", label: "Tools" }
];

export function SiteHeader() {
  const pathname = usePathname() || "";
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link
          className="brand"
          href="/"
          onClick={() => setOpen(false)}
          aria-label="Ahmed Asl portfolio home"
        >
          <img
            className="brand-mark"
            src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/brand/hex-badge-gold.svg`}
            alt=""
            aria-hidden="true"
          />
          <span className="brand-lockup">
            <AslLogo form="latin" />
            <span className="brand-name">Ahmed Ibrahim Asl</span>
          </span>
        </Link>

        <AslLogo form="arabic" className="header-arabic-signature" decorative />

        <button
          className="menu-toggle"
          type="button"
          aria-expanded={open}
          aria-controls="site-navigation"
          onClick={() => setOpen((value) => !value)}
        >
          <span>{open ? "Close menu" : "Open menu"}</span>
          <span aria-hidden="true">{open ? "×" : "+"}</span>
        </button>

        <nav
          id="site-navigation"
          className={`site-nav ${open ? "is-open" : ""}`}
          aria-label="Primary navigation"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname.startsWith(link.href) ? "active" : ""}
              aria-current={pathname.startsWith(link.href) ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className={`header-contact ${pathname.startsWith("/contact") ? "active" : ""}`}
            aria-current={pathname.startsWith("/contact") ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}
