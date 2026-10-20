import type { Metadata } from "next";
import React from "react";
import {
  Archivo,
  Aref_Ruqaa,
  IBM_Plex_Sans_Arabic,
  Sora,
  Space_Mono
} from "next/font/google";
import "./globals.css";
import "./design-tokens/fonts.css";
import "./design-tokens/typography.css";
import "./design-tokens/colors.css";
import "./design-tokens/spacing.css";
import "./design-tokens/surfaces.css";
import "./design-tokens/motion.css";
import "./series-theme.css";
import "./game-theme.css";
import "./asl-theme.css";
import "./asl-tools.css";
import "./home-grid.css";
import "./light-theme.css";
import "./public-cleanup.css";
import "./biovety-layout.css";
import { JsonLd } from "@/components/JsonLd";
import { MotionSystem } from "@/components/MotionSystem";
import { BiovetyLayoutFooter } from "@/components/BiovetyLayoutFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { CommandPalette } from "@/components/CommandPalette";
import { themeInitializerScript } from "@/lib/theme";
import { profile } from "@/data/portfolio";
import { createSiteJsonLd, socialImage, twitterImage } from "@/lib/seo";
import { absoluteUrl, siteConfig } from "@/lib/site";

const archivo = Archivo({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-loaded-archivo"
});

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  preload: false,
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-loaded-plex-arabic"
});

const arefRuqaa = Aref_Ruqaa({
  subsets: ["arabic"],
  preload: false,
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-loaded-aref-ruqaa"
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  preload: false,
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-loaded-space-mono"
});

const sora = Sora({
  subsets: ["latin"],
  preload: false,
  display: "swap",
  variable: "--font-loaded-sora"
});

const fontVariables = [
  archivo.variable,
  plexArabic.variable,
  arefRuqaa.variable,
  spaceMono.variable,
  sora.variable
].join(" ");

const localeInitializerScript = `(() => {
  const arabic = location.pathname.startsWith('/ar/');
  document.documentElement.lang = arabic ? 'ar' : 'en';
  if (arabic) document.documentElement.dir = 'rtl';
  else document.documentElement.removeAttribute('dir');
})();`;

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: siteConfig.title,
  description: siteConfig.description,
  alternates: {
    canonical: absoluteUrl("/")
  },
  authors: [
    {
      name: profile.name,
      url: absoluteUrl("/about/")
    }
  ],
  creator: profile.name,
  category: "technology",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: siteConfig.title,
    description: siteConfig.description,
    url: absoluteUrl("/"),
    siteName: siteConfig.name,
    images: [
      {
        url: socialImage,
        width: 1200,
        height: 630,
        alt: `${profile.name}, ${profile.role}`
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [twitterImage]
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: localeInitializerScript }} />
        <script dangerouslySetInnerHTML={{ __html: themeInitializerScript }} />
      </head>
      <body className="lush-version">
        <div hidden dangerouslySetInnerHTML={{ __html: "<!-- THESIS: Biovety's page rhythm translated into original engineering evidence. OWN-WORLD: White, navy, actual prototypes and factual descriptions. STORY: Explore projects, inspect one build, use a tool, contact the engineer. FIRST VIEWPORT: Compact introduction beside three original project images. FORM: User-selected Biovety layout reference. FINISH: See DESIGN.md and the visual verification report. -->" }} />
        <JsonLd data={createSiteJsonLd()} />
        <MotionSystem />
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main-content">{children}</main>
        <CommandPalette />
        <BiovetyLayoutFooter />
      </body>
    </html>
  );
}
