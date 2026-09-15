"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { calculatorCategories } from "@/data/calculators";
import { filterToolItems } from "@/lib/tool-search";
import { CalculatorThumbnail } from "./CalculatorThumbnail";

type CalculatorTool = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  tags?: readonly string[];
  visualKey?: string;
};

type WorkbenchTool = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: string;
  highlight?: string;
  coverImage?: string;
  category?: string;
};

export type CatalogItem = {
  id: string;
  title: string;
  summary: string;
  href: string;
  category: string;
  kind: string;
  tags: string[];
  visualKey?: string;
  coverImage?: string;
  icon?: string;
};

export function UnifiedToolsIndex({
  calculators,
  workbenches,
  items: lockedItems,
  categoryTitle
}: {
  calculators?: readonly CalculatorTool[];
  workbenches?: readonly WorkbenchTool[];
  items?: readonly CatalogItem[];
  categoryTitle?: string;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All tools");
  const filters = ["All tools", "Workbenches", ...calculatorCategories];
  const locked = Boolean(lockedItems);

  const items = useMemo<CatalogItem[]>(() => lockedItems ? [...lockedItems] : [
    ...(workbenches ?? []).map((tool) => ({
      id: tool.id,
      title: tool.title,
      summary: tool.description,
      href: tool.href,
      category: tool.category ?? "Engineering workflow",
      kind: "Workbench" as const,
      tags: [tool.icon, tool.highlight ?? "Interactive"],
      coverImage: tool.coverImage,
      icon: tool.icon
    })),
    ...(calculators ?? []).map((tool) => ({
      id: tool.slug,
      title: tool.title,
      summary: tool.summary,
      href: `/tools/${tool.slug}/`,
      category: tool.category,
      kind: "Calculator" as const,
      tags: [...(tool.tags ?? [])],
      visualKey: tool.visualKey
    }))
  ], [calculators, lockedItems, workbenches]);

  const visibleItems = useMemo(() => {
    const filterMatches = items.filter((item) => {
      const matchesFilter = filter === "All tools"
        || (filter === "Workbenches" && item.kind === "Workbench")
        || item.category === filter;
      return locked || matchesFilter;
    });
    return filterToolItems(filterMatches, query) as CatalogItem[];
  }, [filter, items, locked, query]);

  return (
    <div className="unified-tools-catalog" data-unified-tools-catalog>
      <div className="writing-tools unified-tools-controls" suppressHydrationWarning>
        <label className="search-field">
          <span aria-hidden="true">⌕</span>
          <span className="sr-only">Search {categoryTitle ?? "all engineering tools"}</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={categoryTitle ? `Search ${categoryTitle}` : "Search all tools"}
          />
        </label>
        {!locked ? <div className="filter-row" aria-label="Filter engineering tools">
          {filters.map((item) => (
            <button
              className={filter === item ? "active" : ""}
              key={item}
              type="button"
              aria-pressed={filter === item}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div> : null}
      </div>

      <div className="unified-tools-result-row">
        <p className="calculator-results-count" aria-live="polite">
          {visibleItems.length} {visibleItems.length === 1 ? "tool" : "tools"}
        </p>
        <p>{categoryTitle ? `Showing only ${categoryTitle.toLowerCase()}.` : "Calculators and guided engineering workflows in one index."}</p>
      </div>

      <div className="calculator-catalog-grid unified-tools-grid">
        {visibleItems.map((tool, index) => (
          <Link
            className={`calculator-catalog-card unified-tool-card unified-tool-card-${tool.kind.toLowerCase()}`}
            href={tool.href}
            key={tool.id}
          >
            {tool.kind === "Workbench" && tool.coverImage ? (
              <div className="unified-tool-cover">
                <Image
                  src={tool.coverImage}
                  alt=""
                  fill
                  sizes="(max-width: 700px) 100vw, (max-width: 1300px) 50vw, 33vw"
                />
                <span>{tool.icon}</span>
              </div>
            ) : (
              <CalculatorThumbnail visualKey={tool.visualKey} title={tool.title} />
            )}
            <div className="calculator-catalog-copy">
              <div className="post-meta">
                <span>{String(index + 1).padStart(2, "0")} / {tool.kind} / {tool.category}</span>
              </div>
              <h2>{tool.title}</h2>
              <p>{tool.summary}</p>
            </div>
          </Link>
        ))}
      </div>

      {!visibleItems.length ? (
        <div className="empty-state">
          <p className="eyebrow">No matches</p>
          <h2>{locked ? "Try another term." : "Try a broader term or another filter."}</h2>
        </div>
      ) : null}
    </div>
  );
}
