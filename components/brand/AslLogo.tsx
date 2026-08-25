import React from "react";

export type AslLogoForm = "arabic" | "latin" | "glyph" | "paired";
export type AslLogoTone = "gold" | "white";

interface AslLogoProps {
  form?: AslLogoForm;
  tone?: AslLogoTone;
  className?: string;
  decorative?: boolean;
}

const labels: Record<AslLogoForm, string> = {
  arabic: "عسل",
  latin: "ASL",
  glyph: "ع",
  paired: "عسل | ASL"
};

export function AslLogo({
  form = "latin",
  tone = "gold",
  className = "",
  decorative = false
}: AslLogoProps) {
  return (
    <span
      className={`asl-logo asl-logo--${form} asl-logo--${tone} ${className}`.trim()}
      aria-hidden={decorative ? "true" : undefined}
    >
      {labels[form]}
    </span>
  );
}
