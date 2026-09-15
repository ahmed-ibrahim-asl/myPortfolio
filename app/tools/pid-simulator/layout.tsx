import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo";
import { getToolSearchHook } from "@/data/tool-search-hooks";

const searchHook = getToolSearchHook("pid-simulator")!;

export const metadata = createPageMetadata({
  title: searchHook.seoTitle,
  description: searchHook.metaDescription,
  pathname: "/tools/pid-simulator/",
});

export default function PidSimulatorLayout({ children }: { children: ReactNode }) {
  return children;
}
