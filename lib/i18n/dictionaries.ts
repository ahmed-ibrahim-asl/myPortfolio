import type { Locale } from "./types";

const dictionaries = {
  en: {
    nav: { home: "Home", work: "Work", tools: "Tools", notes: "Notes", about: "About", contact: "Contact", more: "More" },
    actions: { viewProjects: "View projects", exploreTools: "Explore tools", sendBrief: "Send brief", email: "Email Ahmed" },
    language: { label: "العربية", unavailable: "This detailed page is currently available in English." },
    home: {
      role: "",
      roleSuffix: "EGYPT",
      capabilities: "PROTOTYPING · FIRMWARE · SYSTEM INTEGRATION",
      heroDesktopMain: "Break the problem ",
      heroDesktopAccent: "down.",
      heroMobileLine1: "Your hardware idea.",
      heroMobileLine2: "A prototype ready to test.",
      hookPrefix: "tools",
      hookSuffix: "live on this site right now - calculators, generators, and guided workflows you can actually run, not a roadmap.",
      openToolsIndex: "Open the tools index",
      evidenceEyebrow: "SELECTED EVIDENCE",
      evidenceHeading: "Systems in the field.",
      evidenceSub: "Natural project colour carries the evidence. Gold marks the identity and the path through it.",
      readProjectLog: "Read the complete project log",
      workbenchEyebrow: "WORKBENCH / LIVE",
      workbenchHeading: "Tools built from the work.",
      workbenchSub: "Practical helpers for calculations, code generation, and engineering decisions. Each tool explains what it assumes.",
      openWorkbench: "Open the complete workbench",
      open: "OPEN",
      brainEyebrow: "FIELD NOTES",
      brainHeading: "A working digital brain.",
      brainSub: "Walkthroughs, programming notes, electronics, Linux, networking, and reusable prompt guides.",
      minRead: "MIN READ",
      promptEyebrow: "PROMPT INDEX / QUICK ACCESS",
      promptSub: "Search and reuse visual and technical prompt patterns without starting from an empty page.",
      browsePrompts: "Browse prompt guides",
      methodEyebrow: "OPERATING METHOD"
    }
  },
  ar: {
    nav: { home: "الرئيسية", work: "المشاريع", tools: "الأدوات", notes: "الملاحظات", about: "عني", contact: "تواصل", more: "المزيد" },
    actions: { viewProjects: "شوف المشاريع", exploreTools: "استكشف الأدوات", sendBrief: "ابعت تفاصيل المشروع", email: "راسل أحمد" },
    language: { label: "English", unavailable: "المحتوى التفصيلي متاح بالإنجليزية" },
    home: {
      role: "مهندس أنظمة مدمجة وبحث وتطوير",
      roleSuffix: "مصر",
      capabilities: "بناء نماذج · فيرموير · تكامل الأنظمة",
      heroDesktopMain: "فكّك المشكلة ",
      heroDesktopAccent: "وابني الحل.",
      heroMobileLine1: "فكرة الهاردوير بتاعتك.",
      heroMobileLine2: "بروتوتايب جاهز للتجربة.",
      hookPrefix: "أداة",
      hookSuffix: "شغالة على الموقع دلوقتي - حاسبات، مولّدات، وسير عمل موجّه تقدر تجربه فعليًا، مش مجرد خطة مستقبلية.",
      openToolsIndex: "افتح فهرس الأدوات",
      evidenceEyebrow: "أدلة مختارة",
      evidenceHeading: "أنظمة شغالة في الواقع.",
      evidenceSub: "لون كل مشروع طبيعي وبيحكي قصته. اللون الذهبي بيحدد الهوية والمسار جواه.",
      readProjectLog: "شوف سجل المشاريع كامل",
      workbenchEyebrow: "ورشة العمل / شغالة دلوقتي",
      workbenchHeading: "أدوات اتبنت من شغل حقيقي.",
      workbenchSub: "أدوات عملية للحسابات وتوليد الكود وقرارات هندسية. كل أداة بتشرح إيه الافتراضات بتاعتها.",
      openWorkbench: "افتح ورشة العمل كاملة",
      open: "افتح",
      brainEyebrow: "ملاحظات ميدانية",
      brainHeading: "دماغ رقمي شغال.",
      brainSub: "شروحات، ملاحظات برمجة، إلكترونيات، لينكس، شبكات، وأدلة برومبت جاهزة لإعادة الاستخدام.",
      minRead: "دقيقة قراءة",
      promptEyebrow: "فهرس البرومبت / وصول سريع",
      promptSub: "دوّر على أنماط برومبت بصرية وتقنية وأعد استخدامها من غير ما تبدأ من صفحة فاضية.",
      browsePrompts: "تصفّح أدلة البرومبت",
      methodEyebrow: "طريقة العمل"
    }
  }
} as const;

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}
