import {notFound} from "next/navigation";
import SatelliteWorkspace from "@/components/tools/satellite/SatelliteWorkspace";
import {satelliteCalculators} from "@/data/satellite-course";
import {arabicToolNames} from "@/lib/i18n/tool-copy";
import {createPageMetadata} from "@/lib/seo";
import {ToolSearchHook,ToolSearchSchema} from "@/components/tools/ToolSearchHook";
export const dynamicParams=false;
export function generateStaticParams(){return satelliteCalculators.map(({slug})=>({slug}));}
export async function generateMetadata({params}){const {slug}=await params;const tool=satelliteCalculators.find(item=>item.slug===slug);if(!tool)return {};return createPageMetadata({title:arabicToolNames[slug],description:`حاسبة هندسية تفاعلية: ${arabicToolNames[slug]}.`,pathname:`/ar/tools/satellite/${slug}/`,locale:"ar",translated:true});}
export default async function ArabicSatelliteTool({params}){const {slug}=await params;if(!satelliteCalculators.some(item=>item.slug===slug))notFound();return <><ToolSearchSchema slug={`satellite-${slug}`} pathname={`/ar/tools/satellite/${slug}/`}/><SatelliteWorkspace slug={slug} routeRoot="satellite" locale="ar"/><div className="tool-search-hook-shell" dir="ltr"><ToolSearchHook slug={`satellite-${slug}`}/></div></>;}
