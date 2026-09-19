"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalculatorThumbnail } from "./CalculatorThumbnail";
import { PublicImage } from "@/components/PublicImage";
import { groupToolItems } from "@/lib/tool-search";
import styles from "./GroupedToolsIndex.module.css";

type GroupedTool = {
  id: string;
  title: string;
  summary: string;
  href: string;
  category: string;
  kind: string;
  group?: string;
  tags?: string[];
  symbols?: string[];
  aliases?: string[];
  visualKey?: string;
  coverImage?: string;
};

export function GroupedToolsIndex({
  items,
  categoryTitle,
  groupOrder,
  locale = "en"
}: {
  items: readonly GroupedTool[];
  categoryTitle: string;
  groupOrder: readonly string[];
  locale?: "en" | "ar";
}) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    setQuery(new URLSearchParams(window.location.search).get("q") ?? "");
  }, []);

  const groups = useMemo(
    () => groupToolItems(items, query, [...groupOrder]) as { name: string; items: GroupedTool[] }[],
    [groupOrder, items, query]
  );
  const count = groups.reduce((sum, group) => sum + group.items.length, 0);

  function updateQuery(value: string) {
    setQuery(value);
    const url = new URL(window.location.href);
    value.trim() ? url.searchParams.set("q", value) : url.searchParams.delete("q");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }

  return (
    <div className={styles.catalog} data-grouped-tools-index>
      <div className={styles.searchRow}>
        <label className="search-field">
          <span aria-hidden="true">⌕</span>
          <span className="sr-only">{locale === "ar" ? `ابحث في ${categoryTitle}` : `Search ${categoryTitle}`}</span>
          <input
            type="search"
            value={query}
            onChange={(event) => updateQuery(event.target.value)}
            placeholder={locale === "ar" ? `ابحث في ${categoryTitle}` : `Search ${categoryTitle}`}
          />
        </label>
        {query ? <button type="button" onClick={() => updateQuery("")}>{locale === "ar" ? "مسح" : "Clear"}</button> : null}
      </div>
      <div className={styles.resultRow} aria-live="polite">
        <strong>{count} {locale === "ar" ? "أداة" : count === 1 ? "tool" : "tools"}</strong>
        <span>{locale === "ar" ? "ابحث بالاسم أو المفهوم أو الرمز أو الاختصار." : "Search titles, concepts, symbols, and abbreviations."}</span>
      </div>

      {groups.map((group) => (
        <section className={styles.group} key={group.name} aria-labelledby={`group-${group.name.replace(/\W+/g, "-").toLowerCase()}`}>
          <h2 id={`group-${group.name.replace(/\W+/g, "-").toLowerCase()}`}>{group.name}</h2>
          <div className={styles.cards}>
            {group.items.map((item) => (
              <Link className={styles.card} key={item.id} href={item.href}>
                {item.visualKey ? (
                  <CalculatorThumbnail visualKey={item.visualKey} title={item.title} />
                ) : item.coverImage ? (
                  <div className={styles.cover}><PublicImage src={item.coverImage} alt="" sizes="(max-width: 720px) 100vw, 18rem" /></div>
                ) : null}
                <div>
                  <p className={styles.meta}>{item.kind} / {item.category}</p>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                  <span className={styles.open}>{locale === "ar" ? "افتح الأداة ←" : "Open tool →"}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}

      {!count ? (
        <div className="empty-state">
          <p className="eyebrow">{locale === "ar" ? "لا توجد نتائج" : "No matches"}</p>
          <h2>{locale === "ar" ? "جرّب مصطلحًا هندسيًا أوسع." : "Try a broader engineering term."}</h2>
          <p>{locale === "ar" ? "يمكنك تعديل البحث من الحقل الموجود بالأعلى." : "The search stays available above so you can edit the query."}</p>
        </div>
      ) : null}
    </div>
  );
}
