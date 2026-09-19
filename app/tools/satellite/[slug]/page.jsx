import {notFound} from 'next/navigation';
import SatelliteWorkspace from '@/components/tools/satellite/SatelliteWorkspace';
import {satelliteCalculators} from '@/data/satellite-course';
import {legacyRfToolRedirects,rfCalculators} from '@/data/rf-calculators';
import {LegacyToolRedirect} from '@/components/tools/LegacyToolRedirect';
import {createPageMetadata} from '@/lib/seo';
import {ToolSearchHook,ToolSearchSchema} from '@/components/tools/ToolSearchHook';
export const dynamicParams=false;
export function generateStaticParams(){return [...satelliteCalculators,...rfCalculators].map(({slug})=>({slug}));}
export async function generateMetadata({params}){const {slug}=await params;const legacyDestination=legacyRfToolRedirects[slug];if(legacyDestination)return {alternates:{canonical:legacyDestination},robots:{index:false,follow:true}};const tool=satelliteCalculators.find(t=>t.slug===slug);if(!tool)return {};return createPageMetadata({title:tool.title,description:tool.summary,pathname:`/tools/satellite/${slug}/`});}
export default async function SatelliteToolPage({params}){const {slug}=await params;const legacyDestination=legacyRfToolRedirects[slug];if(legacyDestination)return <LegacyToolRedirect destination={legacyDestination}/>;if(!satelliteCalculators.some(t=>t.slug===slug))notFound();return <><ToolSearchSchema slug={`satellite-${slug}`} pathname={`/tools/satellite/${slug}/`}/><SatelliteWorkspace key={slug} slug={slug} routeRoot="satellite"/><ToolSearchHook slug={`satellite-${slug}`}/></>;}
