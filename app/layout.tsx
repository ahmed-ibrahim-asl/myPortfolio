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
import { JsonLd } from "@/components/JsonLd";
import { MotionSystem } from "@/components/MotionSystem";
import { SiteFooter } from "@/components/SiteFooter";
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
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-loaded-plex-arabic"
});

const arefRuqaa = Aref_Ruqaa({
  subsets: ["arabic"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-loaded-aref-ruqaa"
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-loaded-space-mono"
});

const sora = Sora({
  subsets: ["latin"],
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
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
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
      <body>
        <JsonLd data={createSiteJsonLd()} />
        <MotionSystem />
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main-content">{children}</main>
        <CommandPalette />
        <SiteFooter />
      </body>
    </html>
  );
}
