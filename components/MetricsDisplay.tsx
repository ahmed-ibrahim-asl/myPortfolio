import React from "react";
import fs from "node:fs";
import path from "node:path";

interface Metrics {
  githubStars: number;
  youtubeSubscribers: number;
  youtubeViews: number;
  lastUpdated?: string;
}

export function MetricsDisplay() {
  let metrics: Metrics = { githubStars: 0, youtubeSubscribers: 0, youtubeViews: 0 };
  try {
    const metricsPath = path.join(process.cwd(), "data", "metrics.json");
    if (fs.existsSync(metricsPath)) metrics = { ...metrics, ...JSON.parse(fs.readFileSync(metricsPath, "utf8")) };
  } catch {
    return null;
  }

  const visible = [
    metrics.youtubeViews > 0 ? { label: "YOUTUBE VIEWS", value: metrics.youtubeViews.toLocaleString("en") } : null,
    metrics.youtubeSubscribers > 0 ? { label: "YOUTUBE SUBSCRIBERS", value: metrics.youtubeSubscribers.toLocaleString("en") } : null,
    metrics.githubStars > 0 ? { label: "GITHUB STARS", value: metrics.githubStars.toLocaleString("en") } : null
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  if (!visible.length) return null;

  return (
    <section className="metrics-strip shell" aria-label="Automatically updated public metrics">
      <p className="eyebrow">PUBLIC SIGNAL / AUTOMATIC</p>
      {visible.map((item) => <div key={item.label}><strong>{item.value}</strong><span>{item.label}</span></div>)}
    </section>
  );
}
