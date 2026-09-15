import { SecurityMissionShell } from "@/components/tools/security-mission/SecurityMissionShell";
import { ToolSearchSchema } from "@/components/tools/ToolSearchHook";
import { getToolSearchHook } from "@/data/tool-search-hooks";
import { createPageMetadata } from "@/lib/seo";

const searchHook = getToolSearchHook("security-command-builder")!;

export const metadata = createPageMetadata({
  title: searchHook.seoTitle,
  description: searchHook.metaDescription,
  pathname: "/tools/security-command-builder/",
});

export default function SecurityCommandBuilderPage() {
  return <><ToolSearchSchema slug="security-command-builder" /><SecurityMissionShell /></>;
}
