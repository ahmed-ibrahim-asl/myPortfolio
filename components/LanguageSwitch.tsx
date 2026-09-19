"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { toLocalePath } from "@/lib/i18n/routes";

export function LanguageSwitch() {
  const pathname = usePathname() || "/";
  const locale = pathname === "/ar" || pathname.startsWith("/ar/") ? "ar" : "en";
  const targetLocale = locale === "ar" ? "en" : "ar";
  return <Link className="language-switch" href={toLocalePath(pathname, targetLocale)} hrefLang={targetLocale}>{getDictionary(locale).language.label}</Link>;
}
