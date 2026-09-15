import { ModelMissionShell } from "@/components/tools/model-mission/ModelMissionShell";
import { createPageMetadata } from "@/lib/seo";
import { getToolSearchHook } from "@/data/tool-search-hooks";

const searchHook = getToolSearchHook("ai-script-generator")!;

export const metadata = createPageMetadata({
  title: searchHook.seoTitle,
  description: searchHook.metaDescription,
  pathname: "/tools/ai-script-generator/",
});

export default function AIScriptGeneratorPage() {
  return <ModelMissionShell />;
}
