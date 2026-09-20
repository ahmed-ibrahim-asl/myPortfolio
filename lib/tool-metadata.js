import { getCryptographyToolImage } from "../data/cryptography-tool-images.js";
import { absoluteUrl } from "./site";
import { twitterImage } from "./seo";

export function buildToolMetadata(tool, searchHook) {
  const title = searchHook?.seoTitle ?? tool.title;
  const description = searchHook?.metaDescription ?? tool.summary;
  const image = getCryptographyToolImage(tool.slug);
  const imageUrl = image ? absoluteUrl(image.path) : null;

  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(`/tools/${tool.slug}/`),
    },
    openGraph: {
      type: "article",
      title,
      description,
      tags: tool.tags,
      ...(imageUrl ? {
        images: [{ url: imageUrl, width: 1600, height: 900, alt: image.alt }],
      } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl ?? twitterImage],
    },
  };
}
