import React from "react";
import Link from "next/link";
import Image from "next/image";

interface ToolNavCardProps {
  tool: {
    id: string;
    title: string;
    description: string;
    href: string;
    icon: string;
    highlight?: string;
    coverImage?: string;
  };
  index: number;
}

export function ToolNavCard({ tool, index }: ToolNavCardProps) {
  return (
    <Link className="project-card card-link tool-nav-card" href={tool.href}>
      {tool.coverImage ? (
        <div className="tool-card-cover">
          <Image
            src={tool.coverImage}
            alt={`${tool.title} tool cover`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="tool-card-cover-img"
          />
          <div className="tool-card-cover-overlay" aria-hidden="true" />
          <div className="tool-card-cover-hud mono">
            <span>TOOL_{String(index + 1).padStart(2, "0")}</span>
            <span>{tool.icon}</span>
          </div>
        </div>
      ) : (
        <div className="project-card-top mono">
          <span>TOOL_{String(index + 1).padStart(2, "0")}</span>
          <span>{tool.icon}</span>
        </div>
      )}
      <div className="project-card-copy">
        <h3>{tool.title}</h3>
        {tool.highlight ? (
          <span className="tag tool-card-highlight">{tool.highlight}</span>
        ) : null}
        <p>{tool.description}</p>
      </div>
    </Link>
  );
}
