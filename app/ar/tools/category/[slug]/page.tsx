import Link from "next/link";
import { notFound } from "next/navigation";
import { GroupedToolsIndex } from "@/components/tools/GroupedToolsIndex";
import { getToolCategory, getToolCategoryItems, toolCategories } from "@/data/tool-categories";
import { arabicCategoryNames, arabicToolNames } from "@/lib/i18n/tool-copy";
import { createPageMetadata } from "@/lib/seo";
import { toLocalizedToolPath } from "@/lib/i18n/routes";

export const dynamicParams=false;
export function generateStaticParams(){return toolCategories.map(({slug})=>({slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const category=getToolCategory(slug);if(!category)return {};const title=arabicCategoryNames[slug]??category.title;return createPageMetadata({title:`${title} | أدوات هندسية`,description:`أدوات عملية ضمن فئة ${title}.`,pathname:`/ar/tools/category/${slug}/`,locale:"ar",translated:true});}
export default async function ArabicToolCategory({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const category=getToolCategory(slug);if(!category)notFound();const title=arabicCategoryNames[slug]??category.title;const items=getToolCategoryItems(slug).map(item=>({...item,title:arabicToolNames[item.id.replace(/^(satellite|rf)-/,"")]??item.title,href:toLocalizedToolPath(item.href,"ar")}));const groups=[...new Set(items.map(item=>item.group).filter(Boolean))] as string[];return <div className="asl-page asl-tools-register asl-arabic-page"><div className="section shell asl-tool-category-shell"><nav className="asl-tool-breadcrumb" aria-label="مسار الصفحة"><Link href="/ar/tools/">الأدوات</Link><span>/</span><span>{title}</span></nav><header className="asl-tool-category-header"><p className="eyebrow">{items.length} أدوات متخصصة</p><h1>{title}</h1><p>{category.intro}</p>{!["satellite","rf-engineering"].includes(slug)?<p className="mono">المحتوى التفصيلي متاح بالإنجليزية</p>:null}</header><GroupedToolsIndex items={items} categoryTitle={title} groupOrder={groups} locale="ar"/></div></div>}
