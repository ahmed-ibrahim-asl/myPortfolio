import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo";
import { getToolSearchHook } from "@/data/tool-search-hooks";

const searchHook = getToolSearchHook("sensor-code-generator")!;

export const metadata = createPageMetadata({
  title: searchHook.seoTitle,
  description: searchHook.metaDescription,
  pathname: "/tools/sensor-code-generator/",
});

export default function SensorCodeGeneratorLayout({ children }: { children: ReactNode }) {
  return children;
}
