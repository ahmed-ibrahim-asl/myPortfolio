import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { createProfilePageJsonLd, createSiteJsonLd } from "../../lib/seo";
import { siteConfig } from "../../lib/site";
import { gradifySections } from "../../data/gradify-sections";
import { GradifyCalculatorSeo } from "../../components/tools/gradify/GradifyCalculatorSeo";
import { ToolSearchSchema } from "../../components/tools/ToolSearchHook";

describe("personal entity SEO", () => {
  it("connects the full name, short name, Arabic name, role, and homepage", () => {
    const graph = (createSiteJsonLd() as any)["@graph"];
    const person = graph.find((item: any) => item["@type"] === "Person");

    expect(siteConfig.title).toMatch(/^Ahmed Ibrahim Asl/);
    expect(person.name).toBe("Ahmed Ibrahim Asl");
    expect(person.alternateName).toEqual(expect.arrayContaining(["Ahmed Asl", "أحمد إبراهيم عسل"]));
    expect(person.jobTitle).toBe("Embedded Systems & IoT R&D Engineer");
    expect(person.mainEntityOfPage).toBe("https://eng-asl.com/about/");
  });

  it("keeps the profile page fresh and identifies the current role", () => {
    const profile = createProfilePageJsonLd() as any;
    expect(profile.dateModified).toBe("2026-09-17");
    expect(profile.mainEntity.jobTitle).toBe("Embedded Systems & IoT R&D Engineer");
    expect(profile.mainEntity.alternateName).toContain("Ahmed Asl");
  });
});

describe("Gradify calculator SEO", () => {
  it("uses a search-specific title, description, and H1", () => {
    const calculator = gradifySections.find(item => item.slug === "calculator")!;
    expect(calculator.seoTitle).toBe("GPA Calculator & CGPA Calculator | Gradify");
    expect(calculator.h1).toBe("Free GPA & CGPA Calculator");
    expect(calculator.metaDescription.length).toBeGreaterThan(100);
  });

  it("renders visible formula guidance and matching calculator schema", () => {
    const markup = renderToStaticMarkup(React.createElement(GradifyCalculatorSeo));
    expect(markup).toContain("GPA = total quality points ÷ total credit hours");
    expect(markup).toContain("How is cumulative GPA calculated?");
    expect(markup).toContain('"@type":"HowTo"');
    expect(markup).toContain('"@type":"FAQPage"');
  });

  it("allows the shared schema to use a nested canonical pathname", () => {
    const markup = renderToStaticMarkup(React.createElement(ToolSearchSchema, {
      slug: "gradify",
      pathname: "/tools/gradify/calculator/",
    }));
    expect(markup).toContain("https://eng-asl.com/tools/gradify/calculator/");
  });
});
