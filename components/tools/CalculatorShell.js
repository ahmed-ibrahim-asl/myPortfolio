import Link from "next/link";
import { CalculatorFinder } from "./CalculatorFinder";
import { ToolDirectAnswer, ToolSearchHook, ToolSearchSchema } from "./ToolSearchHook";

export function CalculatorShell({ tool, children }) {
  return (
    <article className="tool-page asl-calculator-shell">
      <header className="article-header tool-header shell">
        <Link className="article-back" href="/tools">
          All engineering tools
        </Link>
        <p className="eyebrow">{tool.category}</p>
        <h1>{tool.title}</h1>
        <p className="article-summary">{tool.summary}</p>
        <div className="tag-row article-tags">
          {tool.tags.map((tag) => (
            <span className="tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      </header>

      <div className="shell">
        <ToolDirectAnswer slug={tool.slug} />
        <ToolSearchSchema slug={tool.slug} />
      </div>

      <div className="tool-body shell">{children}</div>

      <div className="shell">
        <ToolSearchHook slug={tool.slug} />
      </div>

      <div className="shell tool-support-region">
        <CalculatorFinder activeSlug={tool.slug} />
      </div>

      <footer className="tool-credit shell">
        <p className="eyebrow">With thanks</p>
        <p>
          This calculator&rsquo;s design and formulas were inspired by{" "}
          <a href={tool.sourceUrl} target="_blank" rel="noreferrer">
            {tool.sourceLabel}
          </a>
          &rsquo;s{" "}
          <a href={tool.sourceUrl} target="_blank" rel="noreferrer">
            {tool.title}
          </a>{" "}
          - thank you for making electronics approachable for makers everywhere.
        </p>
      </footer>
    </article>
  );
}
