import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo";
import { getToolSearchHook } from "@/data/tool-search-hooks";

const searchHook = getToolSearchHook("battery-estimator")!;

export const metadata = createPageMetadata({
  title: searchHook.seoTitle,
  description: searchHook.metaDescription,
  pathname: "/tools/battery-estimator/",
});

export default function BatteryEstimatorLayout({ children }: { children: ReactNode }) {
  return children;
}
