import { satelliteRfCalculators } from "./satellite-course.js";

export const rfCalculatorSlugs = Object.freeze([
  "frequency-bands",
  "antenna",
  "rf-path",
  "noise-gt",
  "multiple-access"
]);

const rfGroups = Object.freeze({
  "frequency-bands": "Carrier & antenna",
  antenna: "Carrier & antenna",
  "rf-path": "Path & receiver",
  "noise-gt": "Path & receiver",
  "multiple-access": "Channel capacity"
});

export const rfCalculators = Object.freeze(
  rfCalculatorSlugs.map((slug) => {
    const calculator = satelliteRfCalculators.find((item) => item.slug === slug);
    return Object.freeze({ ...calculator, group: rfGroups[slug] });
  })
);

export const legacyRfToolRedirects = Object.freeze(
  Object.fromEntries(rfCalculatorSlugs.map((slug) => [slug, `/tools/rf/${slug}/`]))
);
