import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import sitemap from "../../app/sitemap.js";
import { ToolSearchSchema } from "../../components/tools/ToolSearchHook";
import { cryptographyToolImages } from "../../data/cryptography-tool-images.js";
import { buildToolMetadata } from "../../lib/tool-metadata.js";
import { getTool } from "../../lib/tools.js";
import { getToolSearchHook } from "../../data/tool-search-hooks";

const base = "https://eng-asl.com";

describe("cryptography tool image discovery", () => {
  for (const [slug, image] of Object.entries(cryptographyToolImages)) {
    it(`${slug} exposes its cover in metadata, schema, and sitemap`, async () => {
      const canonical = `${base}/tools/${slug}/`;
      const imageUrl = `${base}${image.path}`;
      const tool = getTool(slug);
      expect(tool).not.toBeNull();
      const metadata = buildToolMetadata(tool!, getToolSearchHook(slug));

      expect(metadata.alternates?.canonical).toBe(canonical);
      expect(metadata.openGraph?.images).toEqual([
        { url: imageUrl, width: 1600, height: 900, alt: image.alt },
      ]);
      expect(metadata.twitter?.images).toEqual([imageUrl]);
      expect(sitemap().map((entry) => entry.url)).toContain(canonical);

      const markup = renderToStaticMarkup(
        React.createElement(ToolSearchSchema, { slug })
      );
      const scripts = [...markup.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)]
        .map((match) => JSON.parse(match[1]));
      const application = scripts.find((item) => item["@type"] === "WebApplication");
      expect(application?.image).toBe(imageUrl);
    });
  }
});
