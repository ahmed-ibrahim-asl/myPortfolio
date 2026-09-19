import {notFound} from "next/navigation";
import SatelliteWorkspace from "@/components/tools/satellite/SatelliteWorkspace";
import {rfCalculators} from "@/data/rf-calculators";
import {arabicToolNames} from "@/lib/i18n/tool-copy";
import {createPageMetadata} from "@/lib/seo";
import {ToolSearchHook,ToolSearchSchema} from "@/components/tools/ToolSearchHook";
export const dynamicParams=false;
export function generateStaticParams(){return rfCalculators.map(({slug})=>({slug}));}
export async function generateMetadata({params}){const {slug}=await params;const tool=rfCalculators.find(item=>item.slug===slug);if(!tool)return {};return createPageMetadata({title:arabicToolNames[slug],description:`حاسبة هندسية تفاعلية: ${arabicToolNames[slug]}.`,pathname:`/ar/tools/rf/${slug}/`,locale:"ar",translated:true});}
export default async function ArabicRfTool({params}){const {slug}=await params;if(!rfCalculators.some(item=>item.slug===slug))notFound();return <><ToolSearchSchema slug={`rf-${slug}`} pathname={`/ar/tools/rf/${slug}/`}/><SatelliteWorkspace slug={slug} routeRoot="rf" locale="ar"/><div className="tool-search-hook-shell" dir="ltr"><ToolSearchHook slug={`rf-${slug}`}/></div></>;}
