import { LegacyToolRedirect } from "@/components/tools/LegacyToolRedirect";

export const metadata = {
  alternates: { canonical: "/tools/category/satellite/" },
  robots: { index: false, follow: true }
};

export default function LegacySatelliteCategoryPage() {
  return <LegacyToolRedirect destination="/tools/category/satellite/" />;
}
