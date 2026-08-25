import React from "react";

interface AslSectionProps {
  index: string;
  label: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function AslSection({
  index,
  label,
  children,
  className = "",
  id
}: AslSectionProps) {
  return (
    <section id={id} className={`asl-section ${className}`.trim()} data-asl-section={label}>
      <div className="asl-section-rail" aria-hidden="true">
        <span />
      </div>
      <div className="asl-section-label" aria-hidden="true">
        <span>{index}</span>
        <span>{label}</span>
      </div>
      <div className="asl-section-content">{children}</div>
    </section>
  );
}
