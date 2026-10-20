import { describe, expect, it } from 'vitest';
import { createHomePageJsonLd, personId, websiteId } from '@/lib/seo';
import { siteConfig } from '@/lib/site';

describe('homepage structured data', () => {
  it.each([['en', '/'], ['ar', '/ar/']] as const)('describes only the %s homepage and existing entities', (locale, path) => {
    const data = createHomePageJsonLd(locale);
    expect(data).toMatchObject({ '@context': 'https://schema.org', '@type': 'WebPage', '@id': `${siteConfig.url}${path}#webpage`, url: `${siteConfig.url}${path}`, inLanguage: locale, about: { '@id': personId }, isPartOf: { '@id': websiteId } });
    expect(data.name).toBeTruthy();
    expect(data.description).toBeTruthy();
    if (locale === 'ar') expect(data.name).toMatch(/[\u0600-\u06ff]/);
  });
  it('defaults to English', () => expect(createHomePageJsonLd()).toEqual(createHomePageJsonLd('en')));
});
