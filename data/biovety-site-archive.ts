import archiveRecords from "./biovety-site-archive.json";

export type ArchiveSite = "Eurokem" | "BioVety";

export interface BiovetyArchivePage {
  id: string;
  site: ArchiveSite;
  title: string;
  url: string;
  thumbnail: string;
  tiles: string[];
  capturedAt: string;
}

export const biovetySiteArchive = archiveRecords as BiovetyArchivePage[];

export function archivePagesFor(site: ArchiveSite) {
  return biovetySiteArchive.filter((page) => page.site === site);
}
