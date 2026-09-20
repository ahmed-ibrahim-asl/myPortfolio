"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { filterToolItems } from "@/lib/tool-search";
import styles from "./ToolsQuickSearch.module.css";

export type QuickSearchItem = {
  id: string;
  title: string;
  summary: string;
  href: string;
  category: string;
  kind: string;
  tags?: readonly string[];
  symbols?: readonly string[];
  aliases?: readonly string[];
  searchTerms: readonly string[];
};

export function ToolsQuickSearch({ items }: { items: readonly QuickSearchItem[] }) {
  const [query, setQuery] = useState("");
  const trimmedQuery = query.trim();
  const results = useMemo(
    () => trimmedQuery ? (filterToolItems(items, trimmedQuery) as QuickSearchItem[]).slice(0, 6) : [],
    [items, trimmedQuery]
  );

  return (
    <section className={styles.search} aria-labelledby="quick-tool-search-title">
      <div className={styles.heading}>
        <div>
          <p className="eyebrow">Skip the categories</p>
          <h2 id="quick-tool-search-title">Search by tool name or describe what you need.</h2>
        </div>
        <p>Try plain language such as “encrypt a message”, “resistor bands”, or “satellite orbit”.</p>
      </div>

      <label className={styles.field}>
        <span className={styles.icon} aria-hidden="true">⌕</span>
        <span className="sr-only">Search every engineering tool</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search tools or describe your task…"
          autoComplete="off"
        />
        {trimmedQuery ? (
          <button type="button" onClick={() => setQuery("")} aria-label="Clear tool search">Clear</button>
        ) : null}
      </label>

      {trimmedQuery ? (
        <div className={styles.results} aria-live="polite">
          {results.length ? results.map((item) => (
            <Link href={item.href} className={styles.result} key={item.id}>
              <span className={styles.meta}>{item.kind} / {item.category}</span>
              <strong>{item.title}</strong>
              <span className={styles.summary}>{item.summary}</span>
              <span className={styles.open}>Open tool <span aria-hidden="true">↗</span></span>
            </Link>
          )) : (
            <div className={styles.empty}>
              <strong>No exact match yet.</strong>
              <span>Try the outcome you want, such as “convert text”, “battery life”, or “signal delay”.</span>
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}
