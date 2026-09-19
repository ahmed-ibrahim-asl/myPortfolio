export interface SiteConfig {
  name: string;
  title: string;
  description: string;
  url: string;
}

export const siteConfig: SiteConfig = {
  name: "Ahmed Asl",
  title: "Ahmed Ibrahim Asl | Embedded Systems & IoT R&D Engineer",
  description:
    "Ahmed Ibrahim Asl (Ahmed Asl) is an Embedded Systems & IoT R&D Engineer who turns firmware, connected electronics, and robotics ideas into working prototypes.",
  url: "https://eng-asl.com"
};

export function absoluteUrl(pathname: string = ""): string {
  return `${siteConfig.url}${pathname}`;
}
