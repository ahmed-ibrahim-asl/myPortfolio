import type { Locale } from "./types";

const localizedRoots = ["/", "/about/", "/contact/", "/work/", "/tools/", "/notes/"];
// Only routes with a real page under app/ar; anything else would link to a 404.
const localizedNested = [/^\/tools\/category\/[^/]+\/$/, /^\/tools\/(satellite|rf)\/[^/]+\/$/];

function normalize(pathname: string) {
  const clean = `/${pathname}`.replace(/\/{2,}/g, "/");
  return clean.endsWith("/") ? clean : `${clean}/`;
}

export function toLocalePath(pathname: string, locale: Locale) {
  const normalized = normalize(pathname);
  const englishPath = normalized.startsWith("/ar/") ? normalize(normalized.slice(3)) : normalized;
  if (locale === "en") return englishPath;
  const translated = localizedRoots.includes(englishPath) || localizedNested.some((pattern) => pattern.test(englishPath));
  if (translated) return englishPath === "/" ? "/ar/" : `/ar${englishPath}`;
  if (englishPath.startsWith("/notes/")) return "/ar/notes/";
  if (englishPath.startsWith("/work/")) return "/ar/work/";
  if (englishPath.startsWith("/tools/")) return "/ar/tools/";
  return "/ar/";
}

export function toLocalizedToolPath(pathname: string, locale: Locale) {
  const normalized = normalize(pathname);
  if (locale === "en") return normalized.startsWith("/ar/") ? normalize(normalized.slice(3)) : normalized;
  if (/^\/tools\/(satellite|rf)\/[^/]+\/$/.test(normalized)) return `/ar${normalized}`;
  return normalized;
}
