import { createPageMetadata } from "@/lib/seo";
import { LushHomePageView } from "@/components/LushHomePageView";

export const metadata = createPageMetadata({ title: "أحمد إبراهيم عسل | مهندس أنظمة مدمجة وإنترنت الأشياء", description: "الموقع الشخصي لأحمد إبراهيم عسل: مشروعات أنظمة مدمجة وروبوتات وأدوات هندسية عملية.", pathname: "/ar/", locale: "ar", translated: true });

export default function ArabicHomePage() {
  return <LushHomePageView locale="ar" />;
}
