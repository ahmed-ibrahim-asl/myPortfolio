import React from "react";
import { profile } from "@/data/portfolio";

interface ProfilePortraitProps {
  context: "home" | "about";
}

export function ProfilePortrait({ context }: ProfilePortraitProps) {
  return (
    <figure className={`profile-portrait profile-portrait--${context}`}>
      <div className="profile-portrait-frame">
        <img src={profile.portrait} alt={`Portrait of ${profile.name}`} />
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
