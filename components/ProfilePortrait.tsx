import React from "react";
import { profile } from "@/data/portfolio";
import { PublicImage } from "@/components/PublicImage";

interface ProfilePortraitProps {
  context: "home" | "about";
}

export function ProfilePortrait({ context }: ProfilePortraitProps) {
  return (
    <figure className={`profile-portrait profile-portrait--${context}`}>
      <div className="profile-portrait-frame">
        <PublicImage src={profile.portrait} alt={`Portrait of ${profile.name}`} sizes={context === "home" ? "(max-width: 700px) 112px, 180px" : "(max-width: 700px) 180px, 260px"} loading="eager" fetchPriority="high" />
        <span className="profile-portrait-crop profile-portrait-crop--top" aria-hidden="true" />
        <span className="profile-portrait-crop profile-portrait-crop--bottom" aria-hidden="true" />
      </div>
      <figcaption>
        <span>{profile.name}</span>
        <span>{profile.role}</span>
      </figcaption>
    </figure>
  );
}
