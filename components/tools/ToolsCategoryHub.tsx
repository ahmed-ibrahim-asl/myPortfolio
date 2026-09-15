import Link from "next/link";
import { getToolCategorySummaries } from "@/data/tool-categories";
import styles from "./ToolsCategoryHub.module.css";

export function ToolsCategoryHub() {
  return (
    <div className={styles.hub}>
      {getToolCategorySummaries().map((category) => (
        <Link
          className={`${styles.card} ${category.slug === "workbenches" ? styles.featured : ""}`}
          href={`/tools/category/${category.slug}/`}
          key={category.slug}
        >
          <span className={styles.topline}>
            <span>{category.label}</span>
            <span>{category.count} {category.count === 1 ? "tool" : "tools"}</span>
          </span>
          <h2>{category.title}</h2>
          <p>{category.intro}</p>
          <span className={styles.examples}>{category.examples.join(" / ")}</span>
          <span className={styles.action}>
            Explore category <span aria-hidden="true">↗</span>
          </span>
        </Link>
      ))}
    </div>
  );
}
