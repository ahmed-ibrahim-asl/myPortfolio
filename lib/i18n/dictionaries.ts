import type { Locale } from "./types";

const dictionaries = {
  en: {
    nav: { home: "Home", work: "Work", tools: "Tools", notes: "Notes", about: "About", contact: "Contact" },
    actions: { viewProjects: "View projects", exploreTools: "Explore tools", sendBrief: "Send brief", email: "Email Ahmed" },
    language: { label: "العربية", unavailable: "This detailed page is currently available in English." }
  },
  ar: {
    nav: { home: "الرئيسية", work: "المشاريع", tools: "الأدوات", notes: "الملاحظات", about: "عني", contact: "تواصل" },
    actions: { viewProjects: "شوف المشاريع", exploreTools: "استكشف الأدوات", sendBrief: "ابعت تفاصيل المشروع", email: "راسل أحمد" },
    language: { label: "English", unavailable: "المحتوى التفصيلي متاح بالإنجليزية" }
  }
} as const;

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}
