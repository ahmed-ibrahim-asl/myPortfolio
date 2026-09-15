import React from "react";

interface SectionHeadingProps {
  title: string;
  action?: React.ReactNode;
  level?: "h1" | "h2";
}

export function SectionHeading({ title, action, level = "h2" }: SectionHeadingProps) {
  const Heading = level;
  return (
    <div className="section-heading">
      <div>
        <Heading>{title}</Heading>
      </div>
      {action}
    </div>
  );
}
