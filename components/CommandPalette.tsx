"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { absoluteUrl } from "@/lib/site";

interface SearchResult {
  type: "note" | "prompt" | "tool";
  title: string;
  summary: string;
  url: string;
  tags: string[];
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [index, setIndex] = useState<SearchResult[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "/" && !open && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  useEffect(() => {
    if (open && !index) {
      // Use absoluteUrl to handle GitHub Pages base path
      fetch(absoluteUrl("/api/search"))
        .then(res => res.json())
        .then(data => setIndex(data))
        .catch(console.error);
    }
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
    }
  }, [open, index]);

  useEffect(() => {
    if (!query.trim() || !index) {
      setResults([]);
      return;
    }
    const q = query.toLowerCase();
    const matches = index.filter(item => 
      item.title.toLowerCase().includes(q) || 
      item.summary.toLowerCase().includes(q) ||
      item.tags.some(t => t.toLowerCase().includes(q))
    ).slice(0, 10);
    setResults(matches);
  }, [query, index]);

  if (!open) return null;

  return (
    <div className="command-palette-overlay" onClick={() => setOpen(false)}>
      <div className="command-palette-dialog" onClick={(e) => e.stopPropagation()}>
        <input 
          ref={inputRef}
          type="search" 
          className="command-input"
          placeholder="Search tools, notes, and prompts..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="command-results">
          {results.map(res => (
            <Link 
              key={res.url} 
              href={res.url} 
              className="command-result-item"
              onClick={() => setOpen(false)}
            >
              <span className="command-result-type mono">{res.type}</span>
              <div className="command-result-content">
                <strong>{res.title}</strong>
                <p>{res.summary}</p>
              </div>
            </Link>
          ))}
          {query && results.length === 0 && (
            <div className="command-empty">No results found for "{query}"</div>
          )}
        </div>
      </div>
    </div>
  );
}
