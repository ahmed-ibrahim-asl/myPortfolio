export const dynamic = "force-static";

import { getAllPosts } from "@/lib/content";
import { siteConfig } from "@/lib/site";
import { getAllTools } from "@/lib/tools";
import { gradifySections } from "@/data/gradify-sections";
import { toolCategories } from "@/data/tool-categories";
import { projects } from "@/data/portfolio";
import { groupWork } from "@/data/work-categories";
import {satelliteCalculators} from '@/data/satellite-course';
import {rfCalculators} from '@/data/rf-calculators';

const routes = [
  { pathname: "", changeFrequency: "weekly", priority: 1 },
  { pathname: "/work", changeFrequency: "monthly", priority: 0.9 },
  { pathname: "/about", changeFrequency: "monthly", priority: 0.9 },
  { pathname: "/notes", changeFrequency: "weekly", priority: 0.9 },
  { pathname: "/tools", changeFrequency: "monthly", priority: 0.85 },
  { pathname: "/tools/battery-estimator", changeFrequency: "yearly", priority: 0.7 },
  { pathname: "/tools/pid-simulator", changeFrequency: "yearly", priority: 0.7 },
  { pathname: "/tools/sensor-code-generator", changeFrequency: "yearly", priority: 0.7 },
  { pathname: "/tools/ai-script-generator", changeFrequency: "monthly", priority: 0.8 },
  { pathname: "/tools/security-command-builder", changeFrequency: "monthly", priority: 0.7 },
  { pathname: "/contact", changeFrequency: "yearly", priority: 0.6 }
];

export default function sitemap() {
  const pages = routes.map((route) => ({
    url: `${siteConfig.url}${route.pathname}/`,
    changeFrequency: route.changeFrequency,
    priority: route.priority
  }));

  const posts = getAllPosts().map((post) => ({
    url: `${siteConfig.url}/notes/${post.slug}/`,
    lastModified: new Date(post.updatedAt || post.publishedAt),
    changeFrequency: "monthly",
    priority: 0.7
  }));

  const calculators = getAllTools().map((tool) => ({
    url: `${siteConfig.url}/tools/${tool.slug}/`,
    changeFrequency: "yearly",
    priority: 0.65
  }));

  const gradify = ["", ...gradifySections.map(section => `/${section.slug}`)].map(path => ({ url: `${siteConfig.url}/tools/gradify${path}/`, changeFrequency: "monthly", priority: 0.7 }));
  const categories = toolCategories.map(category => ({url: `${siteConfig.url}/tools/category/${category.slug}/`, changeFrequency: "monthly", priority: 0.7}));
  const work = groupWork(projects).flatMap(group => [
    { url: `${siteConfig.url}/work/${group.id}/`, changeFrequency: "monthly", priority: 0.8 },
    ...group.projects.map(project => ({
      url: `${siteConfig.url}/work/${group.id}/${project.slug}/`,
      changeFrequency: "monthly",
      priority: 0.75
    }))
  ]);
  // Keep only canonical, published routes. Omit lastModified when no reliable date exists.
  const satellite=[...satelliteCalculators.map(tool=>({url:`${siteConfig.url}/tools/satellite/${tool.slug}/`,changeFrequency:'monthly',priority:0.7}))];
  const rf=[...rfCalculators.map(tool=>({url:`${siteConfig.url}/tools/rf/${tool.slug}/`,changeFrequency:'monthly',priority:0.7}))];
  const arabicRoutes=[
    "/ar/", "/ar/about/", "/ar/contact/", "/ar/work/", "/ar/tools/", "/ar/notes/",
    ...toolCategories.map(category=>`/ar/tools/category/${category.slug}/`),
    ...satelliteCalculators.map(tool=>`/ar/tools/satellite/${tool.slug}/`),
    ...rfCalculators.map(tool=>`/ar/tools/rf/${tool.slug}/`)
  ].map(pathname=>({url:`${siteConfig.url}${pathname}`,changeFrequency:'monthly',priority:0.65}));
  return [...new Map([...pages, ...calculators, ...posts, ...gradify, ...categories, ...work,...satellite,...rf,...arabicRoutes].map(entry => [entry.url, entry])).values()];
}
