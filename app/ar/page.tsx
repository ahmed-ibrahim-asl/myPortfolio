import { createPageMetadata } from "@/lib/seo";
import { BiovetyLayoutHome } from "@/components/BiovetyLayoutHome";

export const metadata = createPageMetadata({ title: "أحمد إبراهيم عسل | مهندس أنظمة مدمجة وإنترنت الأشياء", description: "الموقع الشخصي لأحمد إبراهيم عسل: مشروعات أنظمة مدمجة وروبوتات وأدوات هندسية عملية.", pathname: "/ar/", locale: "ar", translated: true });

export default function ArabicHomePage() {
  return <BiovetyLayoutHome locale="ar" />;
}
