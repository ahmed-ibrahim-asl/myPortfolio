import React from "react";
import Link from "next/link";
import { SocialIcon } from "@/components/SocialIcon";
import { AslLogo } from "@/components/brand/AslLogo";
import { profile } from "@/data/portfolio";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-identity">
          <AslLogo form="paired" />
          <h2>Bring the system that still needs an answer.</h2>
          <p>
            Hardware, firmware, connected products, robotics, applied AI, and
            technical education.
          </p>
        </div>
        <div className="footer-contact">
          <a className="text-link large" href={`mailto:${profile.email}`}>
            Email Ahmed
          </a>
          <div className="footer-links">
            {profile.socials.map((item) => (
              <a
                className="social-link"
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                aria-label={`${item.label} profile (opens in a new tab)`}
              >
                <SocialIcon label={item.label} />
                <span>{item.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>&copy; {new Date().getFullYear()} Ahmed Ibrahim Asl</span>
        <nav aria-label="Footer navigation">
          <Link href="/work">Work</Link>
          <Link href="/about">About</Link>
          <Link href="/writing">Writing</Link>
          <Link href="/tools">Tools</Link>
        </nav>
      </div>
    </footer>
  );
}
