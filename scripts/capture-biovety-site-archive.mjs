import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import puppeteer from "puppeteer-core";
import sharp from "sharp";

const rootDir = process.cwd();
const publicArchiveRoot = path.join(
  rootDir,
  "public",
  "media",
  "portfolio",
  "showcase",
  "biovety",
  "site-archive"
);
const manifestPath = path.join(rootDir, "data", "biovety-site-archive.json");
const publicBase = "/media/portfolio/showcase/biovety/site-archive";
const capturedAt = new Date().toISOString().slice(0, 10);
const viewport = { width: 1440, height: 1000, deviceScaleFactor: 1 };
const tileHeight = 1800;
const maxBytes = 500 * 1024;

const sources = [
  { site: "Eurokem", siteSlug: "eurokem", slug: "home", title: "Eurokem home", fallbackTitle: "Eurokem home", url: "https://eurokemsite.wixsite.com/website-1" },
  { site: "Eurokem", siteSlug: "eurokem", slug: "about-company", title: "About us", fallbackTitle: "About Eurokem", url: "https://eurokemsite.wixsite.com/website-1/about-3-1" },
  { site: "Eurokem", siteSlug: "eurokem", slug: "feed-additives", title: "Our products", fallbackTitle: "Our products", url: "https://eurokemsite.wixsite.com/website-1/about-3" },
  { site: "Eurokem", siteSlug: "eurokem", slug: "cosmetics", title: "Cosmetics", fallbackTitle: "Cosmetics", url: "https://eurokemsite.wixsite.com/website-1/cosmetics" },
  { site: "Eurokem", siteSlug: "eurokem", slug: "cleaner-disinfectant", title: "Cleaner and disinfectant", fallbackTitle: "Cleaner and disinfectant", url: "https://eurokemsite.wixsite.com/website-1/cleaner-disinfectan" },
  { site: "Eurokem", siteSlug: "eurokem", slug: "veterinary-products", title: "Feed additives", fallbackTitle: "Feed additives", url: "https://eurokemsite.wixsite.com/website-1/copy-of-feed-addtivess" },
  { site: "Eurokem", siteSlug: "eurokem", slug: "product-catalogue", title: "Antimicrobials", fallbackTitle: "Antimicrobials", url: "https://eurokemsite.wixsite.com/website-1/copy-of-feed-addtivess-2" },
  { site: "Eurokem", siteSlug: "eurokem", slug: "happy-products", title: "Happy clients", fallbackTitle: "Happy clients", url: "https://eurokemsite.wixsite.com/website-1/happy" },
  { site: "Eurokem", siteSlug: "eurokem", slug: "contact", title: "Contact us", fallbackTitle: "Contact us", url: "https://eurokemsite.wixsite.com/website-1/contact" },
  { site: "BioVety", siteSlug: "biovety", slug: "home", title: "BioVety International", fallbackTitle: "BioVety International", url: "https://biovety.com/" },
  { site: "BioVety", siteSlug: "biovety", slug: "products", title: "Products for animal health operations", fallbackTitle: "BioVety products", url: "https://biovety.com/products.html" },
  { site: "BioVety", siteSlug: "biovety", slug: "contact", title: "Talk to our team", fallbackTitle: "Contact BioVety", url: "https://biovety.com/contact.html" }
];

function cleanTitle(title, fallbackTitle) {
  const value = title.replace(/\s+/g, " ").trim();
  return value && !/^home$/i.test(value) ? value : fallbackTitle;
}

async function wait(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function preparePage(page) {
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
  });

  await page.evaluate(() => {
    const labels = ["accept", "accept all", "allow all", "got it", "i agree"];
    const button = [...document.querySelectorAll("button")].find((candidate) => {
      const text = candidate.textContent?.trim().toLowerCase() ?? "";
      return labels.includes(text);
    });
    if (button instanceof HTMLElement) button.click();
  });

  for (let step = 0; step < 80; step += 1) {
    const state = await page.evaluate(() => {
      const height = Math.max(
        document.documentElement.scrollHeight,
        document.body?.scrollHeight ?? 0
      );
      const next = Math.min(window.scrollY + 720, height);
      window.scrollTo(0, next);
      return { height, bottom: next + window.innerHeight >= height - 4 };
    });
    await wait(140);
    if (state.bottom) break;
  }

  await wait(1800);
  await page.evaluate(() => window.scrollTo(0, 0));
  await wait(350);
}

async function encodeUnderBudget(image, targetPath) {
  const qualities = [76, 68, 60, 52, 44];
  let output;
  for (const quality of qualities) {
    output = await image.clone().webp({ quality, effort: 6, smartSubsample: true }).toBuffer();
    if (output.length <= maxBytes) break;
  }

  if (output.length > maxBytes) {
    output = await image
      .clone()
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 50, effort: 6, smartSubsample: true })
      .toBuffer();
  }

  if (output.length > maxBytes) {
    throw new Error(`${targetPath} remains above 500 KB after optimization`);
  }

  await writeFile(targetPath, output);
}

async function captureSource(page, source, pageNumber) {
  console.log(`[${pageNumber}/${sources.length}] Loading ${source.url}`);
  await page.goto(source.url, { waitUntil: "domcontentloaded", timeout: 90000 });
  await wait(source.site === "Eurokem" ? 5000 : 2500);
  await preparePage(page);

  const title = source.title ?? cleanTitle(await page.title(), source.fallbackTitle);
  const screenshot = await page.screenshot({ type: "png", fullPage: true });
  const image = sharp(screenshot, { limitInputPixels: false });
  const metadata = await image.metadata();
  const width = metadata.width ?? viewport.width;
  const height = metadata.height ?? viewport.height;
  const outputDirectory = path.join(publicArchiveRoot, source.siteSlug, source.slug);
  await mkdir(outputDirectory, { recursive: true });

  const thumbnailName = "thumbnail.webp";
  const thumbnailPath = path.join(outputDirectory, thumbnailName);
  await encodeUnderBudget(
    image.clone().resize(640, 400, { fit: "cover", position: "top" }),
    thumbnailPath
  );

  const tiles = [];
  for (let top = 0, index = 1; top < height; top += tileHeight, index += 1) {
    const heightForTile = Math.min(tileHeight, height - top);
    const tileName = `page-${String(index).padStart(2, "0")}.webp`;
    await encodeUnderBudget(
      image.clone().extract({ left: 0, top, width, height: heightForTile }),
      path.join(outputDirectory, tileName)
    );
    tiles.push(`${publicBase}/${source.siteSlug}/${source.slug}/${tileName}`);
  }

  console.log(`    Captured ${title}: ${width}x${height}, ${tiles.length} tile(s)`);
  return {
    id: `${source.siteSlug}-${source.slug}`,
    site: source.site,
    title,
    url: source.url,
    thumbnail: `${publicBase}/${source.siteSlug}/${source.slug}/${thumbnailName}`,
    tiles,
    capturedAt
  };
}

await mkdir(publicArchiveRoot, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe",
  headless: true,
  args: [
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--ignore-certificate-errors"
  ]
});

try {
  const page = await browser.newPage();
  await page.setViewport(viewport);
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36"
  );
  page.setDefaultNavigationTimeout(90000);

  const manifest = [];
  for (const [index, source] of sources.entries()) {
    manifest.push(await captureSource(page, source, index + 1));
  }

  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(`Saved ${manifest.length} records to ${manifestPath}`);
} finally {
  await browser.close();
}
