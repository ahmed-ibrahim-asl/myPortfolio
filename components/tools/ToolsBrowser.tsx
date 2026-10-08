"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PublicImage } from "@/components/PublicImage";
import { Search, ArrowUpRight } from "lucide-react";
import { getToolCategoryItems, toolCategories } from "@/data/tool-categories";
import { filterToolItems } from "@/lib/tool-search";
import { CalculatorThumbnail } from "./CalculatorThumbnail";
import styles from "./ToolsBrowser.module.css";

type Tool = {
  id: string; title: string; summary: string; href: string;
  category: string; kind: string; tags: string[];
  coverImage?: string; visualKey?: string;
};

export function ToolsBrowser({ items }: { items: readonly Tool[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  useEffect(() => { setQuery(new URLSearchParams(window.location.search).get("q") ?? ""); }, []);
  const categories = useMemo(() => toolCategories.map((item) => ({
    ...item, ids: new Set(getToolCategoryItems(item.slug).map((tool: Tool) => tool.id))
  })), []);
  const visible = useMemo(() => {
    const ids = categories.find((item) => item.slug === category)?.ids;
    return filterToolItems(items.filter((item) => !ids || ids.has(item.id)), query) as Tool[];
  }, [category, categories, items, query]);
  function search(value: string) {
    setQuery(value);
    const url = new URL(window.location.href);
    value ? url.searchParams.set("q", value) : url.searchParams.delete("q");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }
  return (
    <div className={styles.browser} data-tools-browser>
      <div className={styles.controls}>
        <label className={styles.search}>
          <Search size={18} aria-hidden="true" />
          <span className="sr-only">Search by tool name or describe what you need</span>
          <input type="search" value={query} onChange={(event) => search(event.target.value)} placeholder="Search a tool or describe what you need…" />
        </label>
        <label className={styles.select}>
          <span className="sr-only">Tool category</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="all">All categories</option>
            {categories.map((item) => <option key={item.slug} value={item.slug}>{item.title}</option>)}
          </select>
        </label>
      </div>
      <div className={styles.layout}>
        <aside className={styles.rail} aria-label="Tool categories">
          <button type="button" aria-pressed={category === "all"} onClick={() => setCategory("all")}><span>All tools</span><small>{items.length}</small></button>
          {categories.map((item) => <button type="button" key={item.slug} aria-pressed={category === item.slug} onClick={() => setCategory(item.slug)}><span>{item.title}</span><small>{item.ids.size}</small></button>)}
        </aside>
        <div>
          <p className={styles.count} aria-live="polite">{visible.length} {visible.length === 1 ? "tool" : "tools"}{category !== "all" ? ` in ${categories.find((item) => item.slug === category)?.title}` : " ready to use"}</p>
          <div className={styles.grid}>
            {visible.map((tool) => <Link className={styles.card} href={tool.href} key={tool.id}>
              <div className={styles.cover}>
                {tool.coverImage ? <PublicImage src={tool.coverImage} alt="" original /> : <CalculatorThumbnail visualKey={tool.visualKey} title={tool.title} />}
              </div>
              <div className={styles.copy}><small>{tool.kind}</small><h2>{tool.title}</h2><p>{tool.summary}</p><ArrowUpRight size={17} aria-hidden="true" /></div>
            </Link>)}
          </div>
          {!visible.length ? <div className={styles.empty}><h2>No tools found</h2><p>Try another term or category.</p><button type="button" onClick={() => { search(""); setCategory("all"); }}>Reset search</button></div> : null}
        </div>
      </div>
    </div>
  );
}
