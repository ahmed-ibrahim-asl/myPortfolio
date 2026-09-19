import test from "node:test";
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

// Sitewide browser audit at the eight viewports selected for this portfolio. It checks the
// rendered geometry rather than relying on media-query source inspection alone.

const chromeCandidates = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
].filter(Boolean);

const VIEWPORTS = [
  { width: 390, height: 844, label: "390 (phone)" },
  { width: 768, height: 1024, label: "768 (tablet)" },
  { width: 950, height: 900, label: "950 (split view)" },
  { width: 982, height: 986, label: "982 (near square)" },
  { width: 1366, height: 768, label: "1366 (laptop)" },
  { width: 1920, height: 1080, label: "1920 (desktop)" },
  { width: 2560, height: 1440, label: "2560 (large desktop)" },
  { width: 3440, height: 1440, label: "3440 (ultrawide)" }
];

const ROUTES = [
  "/",
  "/work/",
  "/about/",
  "/writing/",
  "/writing/welcome-to-field-notes/",
  "/notes/",
  "/notes/library/",
  "/notes/library/test-document/",
  "/prompts/",
  "/prompts/visual-direction-index/",
  "/contact/",
  "/tools/",
  "/tools/category/circuit-design/",
  "/tools/battery-estimator/",
  "/tools/pid-simulator/",
  "/tools/sensor-code-generator/",
  "/tools/ai-script-generator/",
  "/tools/security-command-builder/",
  "/tools/ohms-law-calculator/",
  "/tools/resistor-color-code-calculator/",
  "/tools/555-timer-astable-circuit-calculator/",
  "/tools/decimal-binary-octal-hex-converter/"
];

const screenshotDirectory = process.env.RESPONSIVE_SCREENSHOT_DIR;
const screenshotRoutes = new Map([
  ["/", "home"],
  ["/about/", "about"],
  ["/contact/", "contact"],
  ["/work/", "work"],
  ["/writing/", "writing"],
  ["/prompts/", "prompts"],
  ["/prompts/visual-direction-index/", "prompt-detail"],
  ["/notes/library/", "library"],
  ["/notes/library/test-document/", "library-detail"],
  ["/tools/", "tools"],
  ["/tools/security-command-builder/", "security"],
  ["/tools/ohms-law-calculator/", "calculator"],
  ["/tools/555-timer-astable-circuit-calculator/", "timer"],
  ["/tools/pid-simulator/", "pid"]
]);

function stopProcessTree(child) {
  if (!child?.pid || child.exitCode !== null) return;
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], {
      stdio: "ignore",
      windowsHide: true
    });
  } else {
    child.kill("SIGTERM");
  }
}

async function serverReady(url) {
  try {
    return (await fetch(url)).ok;
  } catch {
    return false;
  }
}

async function waitForServer(url, child) {
  const deadline = Date.now() + 45_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`Next.js exited before startup (${child.exitCode}).`);
    }
    if (await serverReady(url)) return;
    await delay(200);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function startChrome(chromePath, userDataDir) {
  const chrome = spawn(
    chromePath,
    [
      "--headless=new",
      "--disable-background-networking",
      "--disable-default-apps",
      "--disable-gpu",
      "--no-first-run",
      "--remote-debugging-port=0",
      `--user-data-dir=${userDataDir}`,
      "about:blank"
    ],
    { stdio: ["ignore", "ignore", "pipe"], windowsHide: true }
  );
  const debuggerUrl = await new Promise((resolve, reject) => {
    let output = "";
    const timeout = setTimeout(() => reject(new Error(`Chrome did not start.\n${output}`)), 15_000);
    chrome.stderr.on("data", (chunk) => {
      output += chunk.toString();
      const match = output.match(/DevTools listening on (ws:\/\/\S+)/);
      if (match) {
        clearTimeout(timeout);
        resolve(match[1]);
      }
    });
    chrome.once("exit", (code) => {
      clearTimeout(timeout);
      reject(new Error(`Chrome exited during startup (${code}).`));
    });
  });
  return { chrome, port: new URL(debuggerUrl).port };
}

async function createClient(port, url) {
  const response = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`, {
    method: "PUT"
  });
  const target = await response.json();
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  let nextId = 1;
  const pending = new Map();
  const events = new Map();
  const consoleErrors = [];

  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const handlers = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) handlers.reject(new Error(message.error.message));
      else handlers.resolve(message.result);
      return;
    }
    if (message.method === "Runtime.exceptionThrown") {
      consoleErrors.push(message.params?.exceptionDetails?.text ?? "Uncaught runtime exception");
    }
    if (message.method === "Runtime.consoleAPICalled" && message.params?.type === "error") {
      consoleErrors.push(
        message.params.args
          ?.map((arg) => arg.value ?? arg.description ?? "console error")
          .join(" ") ?? "console error"
      );
    }
    const waiters = events.get(message.method);
    if (waiters) {
      events.delete(message.method);
      waiters.forEach((resolve) => resolve(message.params));
    }
  });

  const send = (method, params = {}) => {
    const id = nextId++;
    socket.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
    });
  };
  const waitForEvent = (method) =>
    new Promise((resolve) => {
      const waiters = events.get(method) ?? [];
      waiters.push(resolve);
      events.set(method, waiters);
    });

  return { socket, send, waitForEvent, consoleErrors };
}

test(
  "every route is responsive at 390/768/950/982/1366/1920/2560/3440",
  { timeout: 300_000 },
  async (t) => {
    const chromePath = chromeCandidates.find(existsSync);
    if (!chromePath) {
      t.skip("Chrome or Edge is required for the sitewide responsive sweep.");
      return;
    }

    const existingRoot = process.env.SITE_RESPONSIVE_BASE_URL ?? "http://127.0.0.1:3000";
    const useExisting = await serverReady(`${existingRoot}/`);
    const port = 32_000 + Math.floor(Math.random() * 3_000);
    const baseUrl = useExisting ? existingRoot : `http://127.0.0.1:${port}`;

    const command = process.platform === "win32" ? process.env.ComSpec || "cmd.exe" : "npm";
    const args =
      process.platform === "win32"
        ? [
            "/d",
            "/s",
            "/c",
            "npm.cmd",
            "run",
            "dev",
            "--",
            "--hostname",
            "127.0.0.1",
            "--port",
            String(port)
          ]
        : ["run", "dev", "--", "--hostname", "127.0.0.1", "--port", String(port)];
    const app = useExisting
      ? null
      : spawn(command, args, {
          cwd: process.cwd(),
          env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
          stdio: ["ignore", "pipe", "pipe"],
          windowsHide: true
        });

    const userDataDir = mkdtempSync(join(tmpdir(), "site-responsive-"));
    let chrome;
    let client;
    const failures = [];

    try {
      if (screenshotDirectory) mkdirSync(screenshotDirectory, { recursive: true });
      if (app) await waitForServer(`${baseUrl}/`, app);
      const session = await startChrome(chromePath, userDataDir);
      chrome = session.chrome;
      client = await createClient(session.port, "about:blank");
      await client.send("Page.enable");
      await client.send("Runtime.enable");

      for (const route of ROUTES) {
        for (const viewport of VIEWPORTS) {
          await client.send("Emulation.setDeviceMetricsOverride", {
            width: viewport.width,
            height: viewport.height,
            deviceScaleFactor: 1,
            mobile: viewport.width < 500
          });
          const loaded = client.waitForEvent("Page.loadEventFired");
          await client.send("Page.navigate", { url: `${baseUrl}${route}` });
          await loaded;

          const result = await client.send("Runtime.evaluate", {
            awaitPromise: true,
            returnByValue: true,
            expression: `(async () => {
              const auditRoute = ${JSON.stringify(route)};
              window.scrollTo(0, 0);
              if (auditRoute === "/writing/") {
                for (let attempt = 0; attempt < 100; attempt += 1) {
                  if (document.querySelector(".post-list .indexed-badge")
                    ?.getClientRects().length) break;
                  await new Promise((resolve) => setTimeout(resolve, 25));
                }
              }
              if (auditRoute.includes("calculator")) {
                for (let attempt = 0; attempt < 100; attempt += 1) {
                  const body = document.querySelector(".tool-body");
                  if (body?.getBoundingClientRect().width > document.documentElement.clientWidth * 0.8) break;
                  await new Promise((resolve) => setTimeout(resolve, 25));
                }
              }
              if (auditRoute === "/tools/") {
                for (let attempt = 0; attempt < 100; attempt += 1) {
                  if (document.querySelectorAll("a[href*='/tools/category/']").length === 7) break;
                  await new Promise((resolve) => setTimeout(resolve, 25));
                }
              }
              // Next.js dev server dynamically injects CSS. Wait for it to apply.
              for (let attempt = 0; attempt < 100; attempt += 1) {
                if (parseFloat(getComputedStyle(document.body).fontSize) >= 16 &&
                    getComputedStyle(document.documentElement).getPropertyValue("--asl-page").trim()) break;
                await new Promise((resolve) => setTimeout(resolve, 50));
              }
              const readySelector = auditRoute === "/about/"
                ? ".asl-about-trace .about-intro h1"
                : auditRoute === "/contact/"
                  ? ".asl-brief .contact-grid"
                  : auditRoute === "/tools/security-command-builder/"
                    ? ".asl-security-mission-shell [data-step-continue]"
                    : "main > *";
              for (let attempt = 0; attempt < 100; attempt += 1) {
                const readyElement = document.querySelector(readySelector);
                if (readyElement?.getBoundingClientRect().width > 0) break;
                await new Promise((resolve) => setTimeout(resolve, 25));
              }
              await new Promise((resolve) =>
                requestAnimationFrame(() => requestAnimationFrame(resolve))
              );
              const doc = document.documentElement;
              const overflowPx = doc.scrollWidth - doc.clientWidth;
              let worstSelector = null;
              let worstRight = doc.clientWidth;
              if (overflowPx > 1) {
                const all = document.querySelectorAll("body *");
                for (const el of all) {
                  const rect = el.getBoundingClientRect();
                  if (rect.right > worstRight + 1 && rect.width > 0) {
                    worstRight = rect.right;
                    worstSelector = el.tagName.toLowerCase()
                      + (el.className && typeof el.className === "string"
                        ? "." + el.className.trim().split(/\\s+/).slice(0, 2).join(".")
                        : "");
                  }
                }
              }
              const missionRail = document.querySelector(".mission-rail");
              const missionReadout = document.querySelector(".mobile-mission-readout");
              const visible = (el) => Boolean(el) && getComputedStyle(el).display !== "none";
              const hasMissionSections = document.querySelectorAll("[data-mission]").length > 0;
              const unexpectedMissionUi = !hasMissionSections
                && (visible(missionRail) || visible(missionReadout));
              const toolBody = document.querySelector(".tool-body");
              const toolBodyRect = toolBody?.getBoundingClientRect() ?? null;
              const toolBodyOutsideViewport = Boolean(toolBodyRect)
                && (toolBodyRect.left < -1 || toolBodyRect.right > doc.clientWidth + 1);
              const boundedContent = document.querySelectorAll(
                ".project-card, .post-card, .tool-section, .calculator-panel, .tool-header"
              );
              const contentOutsideViewport = [...boundedContent].some((el) => {
                const rect = el.getBoundingClientRect();
                return rect.width > 0 && (rect.left < -1 || rect.right > doc.clientWidth + 1);
              });
              const indexedBadge = document.querySelector(".indexed-badge, .post-index");
              const badgeRect = indexedBadge?.getBoundingClientRect() ?? null;
              const badgeSpans = indexedBadge?.querySelectorAll("span").length ?? 0;
              const contactInput = document.querySelector(".contact-form input:not([type='hidden'])");
              const contactInputStyle = contactInput ? getComputedStyle(contactInput) : null;
              const visibleContactText = document.querySelector(".contact-form button")?.textContent ?? "";
              const visibleContactLinks = [...document.querySelectorAll(".contact-socials a")];
              const contactLinkWraps = visibleContactLinks.some((link) => {
                const style = getComputedStyle(link);
                return style.whiteSpace !== "nowrap" || link.scrollWidth > link.clientWidth + 1;
              });
              const portraitCount = document.querySelectorAll(".profile-portrait img").length;
              const removedSceneCount = document.querySelectorAll(
                ".pixel-world, .engineering-image-frame--bench, .engineering-image-signal"
              ).length;
              const freeToolsHook = document.querySelector(".tool-ledger");
              const toolCategoryCards = [...document.querySelectorAll("a[href*='/tools/category/']")];
              const unifiedCatalog = document.querySelector("[data-unified-tools-catalog]");
              const unifiedSearch = unifiedCatalog?.querySelector("input[type='search']");
              const calculatorThumbnailElements = [...document.querySelectorAll(".calculator-thumbnail")];
              const calculatorThumbnails = calculatorThumbnailElements.length;
              const calculatorThumbnailVisualVariants = new Set(
                calculatorThumbnailElements.map((element) => element.getAttribute("aria-label") ?? "")
              ).size;
              const calculatorThumbnailGenericLabels = calculatorThumbnailElements.filter((element) =>
                /circuit diagram$/i.test(element.getAttribute("aria-label") ?? "")
              ).length;
              const calculatorThumbnailRect = calculatorThumbnailElements[0]?.getBoundingClientRect() ?? null;
              const calculatorThumbnailAspect = calculatorThumbnailRect?.height
                ? calculatorThumbnailRect.width / calculatorThumbnailRect.height
                : 0;
              const calculatorResultText = document.querySelector(".calculator-results-count")?.textContent ?? "";
              const categoryCatalog = document.querySelector(".asl-tool-category-catalog");
              const categoryDestinationCards = categoryCatalog
                ? [...categoryCatalog.querySelectorAll("a[href^='/tools/']")]
                : [];
              const categoryGroupCount = categoryCatalog?.querySelectorAll(":scope > div > section").length ?? 0;
              const categoryCardGrid = categoryDestinationCards[0]?.parentElement ?? null;
              const categoryCardGridStyle = categoryCardGrid ? getComputedStyle(categoryCardGrid) : null;
              const calculatorFinder = document.querySelector(".calculator-finder");
              const calculatorFinderSearch = calculatorFinder?.querySelector("input[type='search']");
              const destinationCards = [...document.querySelectorAll(
                ".calculator-catalog-card, .post-card, .tools-featured-section .project-card"
              )];
              const invalidDestinationCards = destinationCards.filter((card) =>
                card.tagName !== "A"
                || !card.getAttribute("href")
                || card.querySelector("a, button")
              ).length;
              const calculatorCatalogTagRows = document.querySelectorAll(
                ".calculator-catalog-card .tag-row"
              ).length;
              const embeddedFamilyTabs = document.querySelectorAll(".embedded-family-tab").length;
              const embeddedExamples = document.querySelectorAll(".embedded-example-card").length;
              const embeddedLabel = document.querySelector(".embedded-workbench label > span, .embedded-workbench .tool-input > label");
              const embeddedLabelFontSize = embeddedLabel ? parseFloat(getComputedStyle(embeddedLabel).fontSize) : 0;
              const gridToggleCount = document.querySelectorAll(".grid-toggle-button").length;
              const hero = document.querySelector(".home-hero");
              const heroRect = hero?.getBoundingClientRect() ?? null;
              const arabicTitleRect = document.querySelector(".home-title-ar")?.getBoundingClientRect() ?? null;
              const englishTitleRect = document.querySelector(".home-title-stack h1")?.getBoundingClientRect() ?? null;
              const portrait = document.querySelector(".portrait-instrument");
              const portraitRect = portrait?.getBoundingClientRect() ?? null;
              const portraitCardRect = portrait?.querySelector(".profile-portrait")?.getBoundingClientRect() ?? null;
              const portraitId = portrait?.querySelector(".portrait-id");
              const portraitIdRect = portraitId?.getBoundingClientRect() ?? null;
              const portraitIdLabels = portraitId ? [...portraitId.querySelectorAll("span")] : [];
              const portraitIdFirstRect = portraitIdLabels[0]?.getBoundingClientRect() ?? null;
              const portraitIdLastRect = portraitIdLabels.at(-1)?.getBoundingClientRect() ?? null;
              const portraitColumn = document.querySelector(".home-portrait");
              const portraitBackground = portraitColumn ? getComputedStyle(portraitColumn).backgroundColor : "";
              const pageBackground = getComputedStyle(document.body).backgroundColor;
              const desktopNavLink = document.querySelector(".site-nav a");
              const desktopNavFontSize = desktopNavLink
                ? parseFloat(getComputedStyle(desktopNavLink).fontSize)
                : 0;
              const aboutHeading = document.querySelector(".asl-about-trace .about-intro h1");
              const aboutHeadingRect = aboutHeading?.getBoundingClientRect() ?? null;
              const aboutHeadingFontSize = aboutHeading
                ? parseFloat(getComputedStyle(aboutHeading).fontSize)
                : 0;
              const aboutPortraitRect = document.querySelector(".profile-portrait--about")?.getBoundingClientRect() ?? null;
              const aboutIntro = document.querySelector(".asl-about-trace .about-intro");
              const aboutStoryLabel = document.querySelector(".asl-about-trace .about-story-grid .mono");
              const aboutIntroBeforeDisplay = aboutIntro
                ? getComputedStyle(aboutIntro, "::before").display
                : "none";
              const aboutStoryLabelColor = aboutStoryLabel
                ? getComputedStyle(aboutStoryLabel).color
                : "";
              const contactGridRect = document.querySelector(".asl-brief .contact-grid")?.getBoundingClientRect() ?? null;
              const contactForm = document.querySelector(".asl-brief .contact-form");
              const contactFormPadding = contactForm
                ? parseFloat(getComputedStyle(contactForm).paddingLeft)
                : 0;
              const contactCallout = document.querySelector(".home-contact-section");
              const contactCalloutBackground = contactCallout
                ? getComputedStyle(contactCallout).backgroundColor
                : "";
              const inactiveToolFilter = document.querySelector(".asl-tools-register .filter-row button:not(.active)");
              const activeToolFilter = document.querySelector(".asl-tools-register .filter-row button.active");
              const inactiveToolFilterColor = inactiveToolFilter
                ? getComputedStyle(inactiveToolFilter).color
                : "";
              const activeToolFilterColor = activeToolFilter
                ? getComputedStyle(activeToolFilter).color
                : "";
              const securityPrimary = document.querySelector("[data-step-continue]");
              const securityCurrentStep = document.querySelector(".asl-security-mission-shell [data-state='current'] strong");
              const securityInactiveStep = document.querySelector(".asl-security-mission-shell [data-state='upcoming'] strong");
              const securityPrimaryColor = securityPrimary ? getComputedStyle(securityPrimary).color : "";
              const securityCurrentStepColor = securityCurrentStep ? getComputedStyle(securityCurrentStep).color : "";
              const securityInactiveStepColor = securityInactiveStep ? getComputedStyle(securityInactiveStep).color : "";
              const diagramLabel = document.querySelector(".asl-calculator-shell .diagram-label");
              const diagramCaption = document.querySelector(".asl-calculator-shell .tool-diagram-caption");
              const hasDiagramCaption = Boolean(diagramCaption);
              const diagramLabelColor = diagramLabel ? getComputedStyle(diagramLabel).fill : "";
              const diagramCaptionColor = diagramCaption ? getComputedStyle(diagramCaption).color : "";
              const routeShell = document.querySelector(
                ".home-page > .shell, .asl-page > .shell, .tool-page > .shell, .asl-article > .shell"
              );
              const routeShellRect = routeShell?.getBoundingClientRect() ?? null;
              const routeContentShells = [...document.querySelectorAll(
                "#main-content .asl-page > .shell, #main-content .asl-page.shell, "
                + "#main-content .tool-page > .shell, #main-content .asl-article > .shell"
              )].filter((element) => element.getBoundingClientRect().width > 0);
              const routeShellPaddings = routeContentShells.map((element) => {
                const style = getComputedStyle(element);
                return {
                  left: parseFloat(style.paddingLeft) || 0,
                  right: parseFloat(style.paddingRight) || 0
                };
              });
              const routeShellPaddingMin = routeShellPaddings.length
                ? Math.min(...routeShellPaddings.flatMap(({ left, right }) => [left, right]))
                : 0;
              const routeShellPaddingMax = routeShellPaddings.length
                ? Math.max(...routeShellPaddings.flatMap(({ left, right }) => [left, right]))
                : 0;
              const routeShellPaddingAsymmetry = routeShellPaddings.length
                ? Math.max(...routeShellPaddings.map(({ left, right }) => Math.abs(left - right)))
                : 0;
              const promptGrid = document.querySelector(".asl-prompts-register .project-grid");
              const promptGridRect = promptGrid?.getBoundingClientRect() ?? null;
              const promptCard = document.querySelector(".asl-prompts-register .post-card");
              const promptCardStyle = promptCard ? getComputedStyle(promptCard) : null;
              // Promoted from h3 to h2 so the page doesn't skip a heading level (h1 straight to h3).
              const promptCardHeading = promptCard?.querySelector("h2");
              const promptCardSummary = promptCard?.querySelector("p");
              const routeIntro = document.querySelector(".asl-page > .page-intro");
              const routeIntroBefore = routeIntro ? getComputedStyle(routeIntro, "::before") : null;
              const routeIntroAfter = routeIntro ? getComputedStyle(routeIntro, "::after") : null;
              const routeIntroLede = routeIntro?.querySelector(".page-lede");
              const contactLabel = document.querySelector(".asl-brief .contact-form label > span");
              const articleBody = document.querySelector(".asl-article .article-body");
              const articleHeading = articleBody?.querySelector("h2");
              const articleBodyStyle = articleBody ? getComputedStyle(articleBody) : null;
              const articleHeadingStyle = articleHeading ? getComputedStyle(articleHeading) : null;
              const articleHeadingMarkerStyle = articleHeading
                ? getComputedStyle(articleHeading, "::before")
                : null;
              const workArchive = document.querySelector(".asl-work-log .archive-header");
              const workTag = document.querySelector(".asl-work-log-list .tag");
              const workOutcome = document.querySelector(".asl-work-log-list .outcome");
              const workMedia = document.querySelector(".asl-work-log-list .project-media");
              const workMediaImage = workMedia?.querySelector("img");
              const workProjectCopy = document.querySelector(".asl-work-log-list .project-copy");
              const workMediaRect = workMedia?.getBoundingClientRect() ?? null;
              const workProjectCopyRect = workProjectCopy?.getBoundingClientRect() ?? null;
              const workMediaStyle = workMedia ? getComputedStyle(workMedia) : null;
              const workMediaImageStyle = workMediaImage ? getComputedStyle(workMediaImage) : null;
              const workHubCards = [...document.querySelectorAll("#main-content .asl-page a")]
                .filter((card) => typeof card.className === "string" && card.className.includes("category"));
              const workHubNonGoldAccentCount = workHubCards.filter((card) => {
                const marker = card.querySelector("span");
                return marker && getComputedStyle(marker).color !== "rgb(217, 164, 65)";
              }).length;
              const workHubRoundedCardCount = workHubCards.filter((card) =>
                parseFloat(getComputedStyle(card).borderTopLeftRadius) > 0
              ).length;
              const homeProjectEntries = [...document.querySelectorAll(".project-ledger .project-entry")];
              const homeProjectMaxHeight = homeProjectEntries.length
                ? Math.max(...homeProjectEntries.map((entry) => entry.getBoundingClientRect().height))
                : 0;
              const unifiedToolsGrid = document.querySelector(".unified-tools-grid");
              const unifiedToolsGridStyle = unifiedToolsGrid ? getComputedStyle(unifiedToolsGrid) : null;
              const calculatorArticle = document.querySelector(".asl-calculator-shell .tool-body > .article-body");
              const calculatorPanelRect = calculatorArticle?.querySelector(":scope > [data-tool-workspace]")?.getBoundingClientRect() ?? null;
              const calculatorFirstControlRect = calculatorArticle
                ?.querySelector(
                  ":scope > [data-tool-workspace] .calculator-workspace-controls input, "
                  + ":scope > [data-tool-workspace] .calculator-workspace-controls select, "
                  + ":scope > [data-tool-workspace] .calculator-workspace-controls textarea, "
                  + ":scope > [data-tool-workspace] .calculator-grid input, "
                  + ":scope > [data-tool-workspace] .calculator-grid select, "
                  + ":scope > [data-tool-workspace] .calculator-grid textarea"
                )
                ?.getBoundingClientRect() ?? null;
              const calculatorExplanationRect = calculatorArticle?.querySelector(":scope > [data-tool-learning]")?.getBoundingClientRect() ?? null;
              const headerInner = document.querySelector(".site-header .header-inner");
              const footerGrid = document.querySelector(".site-footer .footer-grid");
              const headerStyle = headerInner ? getComputedStyle(headerInner) : null;
              const footerStyle = footerGrid ? getComputedStyle(footerGrid) : null;
              const watermarkTargets = [
                document.querySelector(".asl-tools-header"),
                document.querySelector(".asl-model-mission-shell > div > header"),
                document.querySelector(".asl-security-mission-shell > div > header")
              ].filter(Boolean);
              const visibleWatermarkCount = watermarkTargets.filter((el) => {
                const content = getComputedStyle(el, "::after").content;
                return content && content !== "none" && content !== "normal" && content.length > 2;
              }).length;
              const rootStyle = getComputedStyle(document.documentElement);
              const visibleControls = [...document.querySelectorAll("button, input, select, textarea")]
                .filter((el) => {
                  const style = getComputedStyle(el);
                  const type = el.getAttribute("type");
                  return style.display !== "none"
                    && style.visibility !== "hidden"
                    && type !== "hidden"
                    && type !== "checkbox"
                    && type !== "radio"
                    && el.getClientRects().length > 0;
                });
              const smallestControlHeight = visibleControls.length
                ? Math.min(...visibleControls.map((el) => el.getBoundingClientRect().height))
                : 44;
              const smallestControlWidth = visibleControls.length
                ? Math.min(...visibleControls.map((el) => el.getBoundingClientRect().width))
                : 44;
              const smallestControl = visibleControls.find(
                (el) => Math.abs(el.getBoundingClientRect().height - smallestControlHeight) < 0.1
              );
              const smallestControlSelector = smallestControl
                ? smallestControl.tagName.toLowerCase()
                  + (typeof smallestControl.className === "string" && smallestControl.className.trim()
                    ? "." + smallestControl.className.trim().split(/\s+/).join(".")
                    : "")
                : null;
              return {
                bodyFontSize: parseFloat(getComputedStyle(document.body).fontSize),
                primaryTextColor: getComputedStyle(document.body).color,
                aslPageToken: rootStyle.getPropertyValue("--asl-page").trim().toUpperCase(),
                aslGoldToken: rootStyle.getPropertyValue("--asl-gold").trim().toUpperCase(),
                systemHudCount: document.querySelectorAll(".system-hud, .pixel-world").length,
                smallestControlHeight,
                smallestControlWidth,
                smallestControlSelector,
                overflowPx,
                clientWidth: doc.clientWidth,
                worstSelector,
                worstRight,
                unexpectedMissionUi,
                toolBodyOutsideViewport,
                contentOutsideViewport,
                badgeWidth: badgeRect?.width ?? 0,
                badgeHeight: badgeRect?.height ?? 0,
                badgeSpans,
                contactPaddingLeft: contactInputStyle ? parseFloat(contactInputStyle.paddingLeft) : 0,
                contactFontSize: contactInputStyle ? parseFloat(contactInputStyle.fontSize) : 0,
                visibleContactText,
                contactLinkWraps,
                portraitCount,
                removedSceneCount,
                hasFreeToolsHook: Boolean(freeToolsHook),
                toolCategoryCardCount: toolCategoryCards.length,
                invalidToolCategoryCards: toolCategoryCards.filter((card) => card.querySelector("a, button")).length,
                documentTitle: document.title,
                hasUnifiedCatalog: Boolean(unifiedCatalog && unifiedSearch),
                calculatorThumbnails,
                calculatorThumbnailVisualVariants,
                calculatorThumbnailGenericLabels,
                calculatorThumbnailAspect,
                calculatorResultText,
                categoryDestinationCardCount: categoryDestinationCards.length,
                invalidCategoryDestinationCards: categoryDestinationCards.filter((card) =>
                  !card.getAttribute("href") || card.querySelector("a, button")
                ).length,
                categoryGroupCount,
                categoryCardGridGap: categoryCardGridStyle
                  ? parseFloat(categoryCardGridStyle.gap) || 0
                  : 0,
                hasScrollCue: Boolean(document.querySelector(".tools-scroll-cue")),
                hasCalculatorFinder: Boolean(calculatorFinder && calculatorFinderSearch),
                destinationCardCount: destinationCards.length,
                invalidDestinationCards,
                calculatorCatalogTagRows,
                embeddedFamilyTabs,
                embeddedExamples,
                embeddedLabelFontSize,
                gridToggleCount,
                heroBottom: heroRect?.bottom ?? 0,
                heroTop: heroRect?.top ?? 0,
                arabicTitleBottom: arabicTitleRect?.bottom ?? 0,
                englishTitleTop: englishTitleRect?.top ?? 0,
                portraitTop: portraitRect?.top ?? 0,
                portraitBottom: portraitRect?.bottom ?? 0,
                portraitCardBottomGap: portraitRect && portraitCardRect
                  ? portraitRect.bottom - portraitCardRect.bottom
                  : 0,
                portraitIdEdgeInset: portraitIdRect && portraitIdFirstRect && portraitIdLastRect
                  ? Math.min(
                      portraitIdFirstRect.left - portraitIdRect.left,
                      portraitIdRect.right - portraitIdLastRect.right
                    )
                  : 0,
                portraitBackground,
                pageBackground,
                desktopNavFontSize,
                aboutHeadingFontSize,
                aboutHeadingLeft: aboutHeadingRect?.left ?? 0,
                aboutHeadingRight: aboutHeadingRect?.right ?? 0,
                aboutPortraitWidth: aboutPortraitRect?.width ?? 0,
                aboutIntroBeforeDisplay,
                aboutStoryLabelColor,
                contactGridLeft: contactGridRect?.left ?? 0,
                contactGridRight: contactGridRect?.right ?? doc.clientWidth,
                contactFormPadding,
                contactCalloutBackground,
                inactiveToolFilterColor,
                activeToolFilterColor,
                securityPrimaryColor,
                securityCurrentStepColor,
                securityInactiveStepColor,
                diagramLabelColor,
                hasDiagramCaption,
                diagramCaptionColor,
                routeShellLeft: routeShellRect?.left ?? 0,
                routeShellRight: routeShellRect?.right ?? doc.clientWidth,
                routeContentShellCount: routeContentShells.length,
                routeShellPaddingMin,
                routeShellPaddingMax,
                routeShellPaddingAsymmetry,
                promptGridLeft: promptGridRect?.left ?? 0,
                promptGridRight: promptGridRect?.right ?? doc.clientWidth,
                promptCardBackground: promptCardStyle?.backgroundColor ?? "",
                promptCardShadow: promptCardStyle?.boxShadow ?? "",
                promptCardHeadingColor: promptCardHeading ? getComputedStyle(promptCardHeading).color : "",
                promptCardSummaryColor: promptCardSummary ? getComputedStyle(promptCardSummary).color : "",
                routeIntroBeforeDisplay: routeIntroBefore?.display ?? "none",
                routeIntroAfterDisplay: routeIntroAfter?.display ?? "none",
                routeIntroAfterRight: routeIntroAfter ? parseFloat(routeIntroAfter.right) || 0 : 0,
                routeIntroLedeColor: routeIntroLede ? getComputedStyle(routeIntroLede).color : "",
                contactLabelColor: contactLabel ? getComputedStyle(contactLabel).color : "",
                articleBodyBackground: articleBodyStyle?.backgroundColor ?? "",
                articleBodyShadow: articleBodyStyle?.boxShadow ?? "",
                articleBodyFontFamily: articleBodyStyle?.fontFamily ?? "",
                articleHeadingBorderColor: articleHeadingStyle?.borderTopColor ?? "",
                articleHeadingBorderWidth: articleHeadingStyle ? parseFloat(articleHeadingStyle.borderTopWidth) || 0 : 0,
                articleHeadingMarkerDisplay: articleHeadingMarkerStyle?.display ?? "none",
                articleHeadingMarkerContent: articleHeadingMarkerStyle?.content ?? "none",
                workArchiveBackground: workArchive ? getComputedStyle(workArchive).backgroundColor : "",
                workTagBackground: workTag ? getComputedStyle(workTag).backgroundColor : "",
                workTagColor: workTag ? getComputedStyle(workTag).color : "",
                workOutcomeColor: workOutcome ? getComputedStyle(workOutcome).color : "",
                workMediaPadding: workMediaStyle ? parseFloat(workMediaStyle.paddingLeft) || 0 : 0,
                workMediaObjectFit: workMediaImageStyle?.objectFit ?? "",
                workMediaRight: workMediaRect?.right ?? 0,
                workProjectCopyLeft: workProjectCopyRect?.left ?? 0,
                workHubCardCount: workHubCards.length,
                workHubNonGoldAccentCount,
                workHubRoundedCardCount,
                homeProjectMaxHeight,
                unifiedToolsGridGap: unifiedToolsGridStyle ? parseFloat(unifiedToolsGridStyle.gap) || 0 : 0,
                calculatorPanelTop: calculatorPanelRect?.top ?? 0,
                calculatorPanelWidth: calculatorPanelRect?.width ?? 0,
                calculatorFirstControlBottom: calculatorFirstControlRect?.bottom ?? 0,
                calculatorExplanationTop: calculatorExplanationRect?.top ?? 0,
                headerPaddingLeft: headerStyle ? parseFloat(headerStyle.paddingLeft) || 0 : 0,
                headerPaddingRight: headerStyle ? parseFloat(headerStyle.paddingRight) || 0 : 0,
                footerPaddingLeft: footerStyle ? parseFloat(footerStyle.paddingLeft) || 0 : 0,
                footerPaddingRight: footerStyle ? parseFloat(footerStyle.paddingRight) || 0 : 0,
                toolBodyWidth: toolBodyRect?.width ?? 0,
                visibleWatermarkCount
              };
            })()`
          });

          if (screenshotDirectory && screenshotRoutes.has(route)) {
            const screenshot = await client.send("Page.captureScreenshot", {
              format: "png",
              captureBeyondViewport: false
            });
            const routeName = screenshotRoutes.get(route);
            writeFileSync(
              join(screenshotDirectory, `${routeName}-${viewport.width}.png`),
              Buffer.from(screenshot.data, "base64")
            );
          }

          const {
            bodyFontSize,
            primaryTextColor,
            aslPageToken,
            aslGoldToken,
            systemHudCount,
            smallestControlHeight,
            smallestControlWidth,
            smallestControlSelector,
            overflowPx,
            clientWidth,
            worstSelector,
            worstRight,
            unexpectedMissionUi,
            toolBodyOutsideViewport,
            contentOutsideViewport,
            badgeWidth,
            badgeHeight,
            badgeSpans,
            contactPaddingLeft,
            contactFontSize,
            visibleContactText,
            contactLinkWraps,
            portraitCount,
            removedSceneCount,
            hasFreeToolsHook,
            toolCategoryCardCount,
            invalidToolCategoryCards,
            documentTitle,
            hasUnifiedCatalog,
            calculatorThumbnails,
            calculatorThumbnailVisualVariants,
            calculatorThumbnailGenericLabels,
            calculatorThumbnailAspect,
            calculatorResultText,
            categoryDestinationCardCount,
            invalidCategoryDestinationCards,
            categoryGroupCount,
            categoryCardGridGap,
            hasScrollCue,
            hasCalculatorFinder,
            destinationCardCount,
            invalidDestinationCards,
            calculatorCatalogTagRows,
            embeddedFamilyTabs,
            embeddedExamples,
            embeddedLabelFontSize,
            gridToggleCount,
            heroBottom,
            heroTop,
            arabicTitleBottom,
            englishTitleTop,
            portraitTop,
            portraitBottom,
            portraitCardBottomGap,
            portraitIdEdgeInset,
            portraitBackground,
            pageBackground,
            desktopNavFontSize,
            aboutHeadingFontSize,
            aboutHeadingLeft,
            aboutHeadingRight,
            aboutPortraitWidth,
            aboutIntroBeforeDisplay,
            aboutStoryLabelColor,
            contactGridLeft,
            contactGridRight,
            contactFormPadding,
            contactCalloutBackground,
            inactiveToolFilterColor,
            activeToolFilterColor,
            securityPrimaryColor,
            securityCurrentStepColor,
            securityInactiveStepColor,
            diagramLabelColor,
            hasDiagramCaption,
            diagramCaptionColor,
            routeShellLeft,
            routeShellRight,
            routeContentShellCount,
            routeShellPaddingMin,
            routeShellPaddingMax,
            routeShellPaddingAsymmetry,
            promptGridLeft,
            promptGridRight,
            promptCardBackground,
            promptCardShadow,
            promptCardHeadingColor,
            promptCardSummaryColor,
            routeIntroBeforeDisplay,
            routeIntroAfterDisplay,
            routeIntroAfterRight,
            routeIntroLedeColor,
            contactLabelColor,
            articleBodyBackground,
            articleBodyShadow,
            articleBodyFontFamily,
            articleHeadingBorderColor,
            articleHeadingBorderWidth,
            articleHeadingMarkerDisplay,
            articleHeadingMarkerContent,
            workArchiveBackground,
            workTagBackground,
            workTagColor,
            workOutcomeColor,
            workMediaPadding,
            workMediaObjectFit,
            workMediaRight,
            workProjectCopyLeft,
            workHubCardCount,
            workHubNonGoldAccentCount,
            workHubRoundedCardCount,
            homeProjectMaxHeight,
            unifiedToolsGridGap,
            calculatorPanelTop,
            calculatorPanelWidth,
            calculatorFirstControlBottom,
            calculatorExplanationTop,
            headerPaddingLeft,
            headerPaddingRight,
            footerPaddingLeft,
            footerPaddingRight,
            toolBodyWidth,
            visibleWatermarkCount
          } = result.result.value;
          if (bodyFontSize < 16) {
            failures.push(
              `${route} @ ${viewport.label}: base text remains below the 16px readability floor`
            );
          }
          if (aslPageToken !== "#0B0D11" || aslGoldToken !== "#D9A441") {
            failures.push(
              `${route} @ ${viewport.label}: ASL palette tokens are not active ` +
                `(page=${aslPageToken}, gold=${aslGoldToken})`
            );
          }
          if (systemHudCount !== 0) {
            failures.push(
              `${route} @ ${viewport.label}: obsolete HUD or pixel scene remains mounted`
            );
          }
          if (gridToggleCount !== 0) {
            failures.push(
              `${route} @ ${viewport.label}: the removed grid control is still visible`
            );
          }
          if (smallestControlHeight < 43.5) {
            failures.push(
              `${route} @ ${viewport.label}: an interactive control is below the 44px target floor ` +
                `(${smallestControlHeight.toFixed(1)}px, ${smallestControlSelector})`
            );
          }
          if (smallestControlWidth < 43.5) {
            failures.push(
              `${route} @ ${viewport.label}: an interactive control is below the 44px width floor ` +
                `(${smallestControlWidth.toFixed(1)}px)`
            );
          }
          if (overflowPx > 1) {
            failures.push(
              `${route} @ ${viewport.label}: overflows by ${overflowPx.toFixed(0)}px` +
                (worstSelector
                  ? ` (worst offender: ${worstSelector}, right edge ${worstRight.toFixed(0)}px)`
                  : "")
            );
          }
          if (unexpectedMissionUi) {
            failures.push(
              `${route} @ ${viewport.label}: mission UI appears without mission sections`
            );
          }
          if (toolBodyOutsideViewport) {
            failures.push(`${route} @ ${viewport.label}: calculator body leaves the viewport`);
          }
          if (contentOutsideViewport) {
            failures.push(`${route} @ ${viewport.label}: visible tool content leaves the viewport`);
          }
          if (route !== "/" && routeContentShellCount > 0) {
            const expectedGutter = Math.min(72, Math.max(20, clientWidth * 0.04));
            if (
              Math.abs(routeShellPaddingMin - expectedGutter) > 1.5 ||
              Math.abs(routeShellPaddingMax - expectedGutter) > 1.5 ||
              routeShellPaddingAsymmetry > 1
            ) {
              failures.push(
                `${route} @ ${viewport.label}: route shells do not share the adaptive gutter ` +
                  `(expected=${expectedGutter.toFixed(1)}, min=${routeShellPaddingMin.toFixed(1)}, ` +
                  `max=${routeShellPaddingMax.toFixed(1)}, asymmetry=${routeShellPaddingAsymmetry.toFixed(1)})`
              );
            }
          }
          {
            const expectedGutter = Math.min(72, Math.max(20, clientWidth * 0.04));
            if (
              Math.abs(headerPaddingLeft - expectedGutter) > 1.5 ||
              Math.abs(headerPaddingRight - expectedGutter) > 1.5 ||
              Math.abs(footerPaddingLeft - expectedGutter) > 1.5 ||
              Math.abs(footerPaddingRight - expectedGutter) > 1.5
            ) {
              failures.push(
                `${route} @ ${viewport.label}: header and footer do not follow the route gutter ` +
                  `(expected=${expectedGutter.toFixed(1)}, header=${headerPaddingLeft.toFixed(1)}/` +
                  `${headerPaddingRight.toFixed(1)}, footer=${footerPaddingLeft.toFixed(1)}/` +
                  `${footerPaddingRight.toFixed(1)})`
              );
            }
          }
          if (routeIntroLedeColor) {
            const expectedGutter = Math.min(72, Math.max(20, clientWidth * 0.04));
            if (
              routeIntroBeforeDisplay !== "none" ||
              routeIntroLedeColor !== "rgb(138, 147, 161)"
            ) {
              failures.push(
                `${route} @ ${viewport.label}: a page intro retains legacy blue decoration or copy ` +
                  `(${routeIntroBeforeDisplay}, ${routeIntroLedeColor})`
              );
            }
            if (clientWidth <= 639) {
              if (routeIntroAfterDisplay !== "none") {
                failures.push(
                  `${route} @ ${viewport.label}: the measured-work label crowds the mobile intro`
                );
              }
            } else if (Math.abs(routeIntroAfterRight - expectedGutter) > 1.5) {
              failures.push(
                `${route} @ ${viewport.label}: the measured-work label does not align to the content gutter ` +
                  `(${routeIntroAfterRight.toFixed(1)}px)`
              );
            }
          }
          if (route === "/prompts/" && viewport.width >= 1366) {
            const expectedGutter = Math.min(72, Math.max(20, clientWidth * 0.04));
            if (
              promptGridLeft < expectedGutter - 1.5 ||
              promptGridRight > clientWidth - expectedGutter + 1.5
            ) {
              failures.push(
                `${route} @ ${viewport.label}: prompt cards touch a viewport edge ` +
                  `(left=${promptGridLeft.toFixed(1)}, right=${promptGridRight.toFixed(1)})`
              );
            }
            if (
              promptCardBackground !== "rgb(18, 22, 28)" ||
              promptCardShadow !== "none" ||
              promptCardHeadingColor !== primaryTextColor ||
              promptCardSummaryColor !== "rgb(138, 147, 161)"
            ) {
              failures.push(
                `${route} @ ${viewport.label}: prompt cards retain legacy blue styling ` +
                  `(${promptCardBackground}, ${promptCardShadow}, ` +
                  `${promptCardHeadingColor}, ${promptCardSummaryColor})`
              );
            }
          }
          if (articleBodyBackground) {
            if (
              articleBodyBackground !== "rgb(18, 22, 28)" ||
              articleBodyShadow !== "none" ||
              !articleBodyFontFamily.includes("Archivo") ||
              (articleHeadingBorderColor && articleHeadingBorderColor !== "rgb(217, 164, 65)") ||
              (articleHeadingBorderColor && Math.abs(articleHeadingBorderWidth - 1) > 0.1) ||
              (articleHeadingMarkerDisplay !== "none" && articleHeadingMarkerContent !== "none")
            ) {
              failures.push(
                `${route} @ ${viewport.label}: article content retains the legacy blue panel treatment ` +
                  `(${articleBodyBackground}, ${articleBodyShadow}, ` +
                  `${articleBodyFontFamily}, ${articleHeadingBorderWidth}px ${articleHeadingBorderColor}, ` +
                  `marker=${articleHeadingMarkerDisplay}/${articleHeadingMarkerContent})`
              );
            }
          }
          if (route === "/work/") {
            if (
              workHubCardCount < 1 ||
              workHubNonGoldAccentCount !== 0 ||
              workHubRoundedCardCount !== 0
            ) {
              failures.push(
                `${route} @ ${viewport.label}: WorkHub cards do not use the single gold, square-corner system ` +
                  `(cards=${workHubCardCount}, nonGold=${workHubNonGoldAccentCount}, rounded=${workHubRoundedCardCount})`
              );
            }
          }
          if (visibleWatermarkCount !== 0) {
            failures.push(
              `${route} @ ${viewport.label}: a decorative Arabic watermark remains visible`
            );
          }
          if (viewport.width >= 1366 && desktopNavFontSize > 11.5) {
            failures.push(
              `${route} @ ${viewport.label}: desktop navigation type is oversized ` +
                `(${desktopNavFontSize.toFixed(1)}px)`
            );
          }
          if (route === "/writing/" && viewport.width === 1366) {
            if (badgeWidth < 52 || badgeHeight < 52 || badgeSpans !== 2) {
              failures.push(
                `${route} @ ${viewport.label}: indexed badge is not a centered 52px two-part badge ` +
                  `(width=${badgeWidth}, height=${badgeHeight}, spans=${badgeSpans})`
              );
            }
            if (destinationCardCount < 1 || invalidDestinationCards !== 0) {
              failures.push(
                `${route} @ ${viewport.label}: writing destinations are not full-surface semantic links`
              );
            }
          }
          if (route === "/contact/") {
            if (contactPaddingLeft < 14 || contactFontSize < 16) {
              failures.push(
                `${route} @ ${viewport.label}: form text lacks the required 14px inset and 16px font floor`
              );
            }
            if (/[↗→]/u.test(visibleContactText) || contactLinkWraps) {
              failures.push(
                `${route} @ ${viewport.label}: contact actions contain an arrow or wrap their labels`
              );
            }
            if (
              viewport.width >= 1366 &&
              (contactGridLeft < 23 || contactGridRight > clientWidth - 23)
            ) {
              failures.push(
                `${route} @ ${viewport.label}: contact content touches the viewport edge ` +
                  `(left=${contactGridLeft.toFixed(1)}, right=${contactGridRight.toFixed(1)})`
              );
            }
            if (viewport.width >= 1366 && contactFormPadding > 40) {
              failures.push(
                `${route} @ ${viewport.label}: contact form wastes space with ` +
                  `${contactFormPadding.toFixed(1)}px internal padding`
              );
            }
            if (contactLabelColor !== "rgb(217, 164, 65)") {
              failures.push(
                `${route} @ ${viewport.label}: form labels retain a legacy non-brand color ` +
                  `(${contactLabelColor})`
              );
            }
          }
          if (route === "/") {
            if (portraitCount !== 1 || removedSceneCount !== 0 || !hasFreeToolsHook) {
              failures.push(
                `${route} @ ${viewport.label}: home must show one static portrait, no engineering scene, and the workbench hook`
              );
            }
            if (viewport.width >= 1366) {
              if (portraitIdEdgeInset < 8) {
                failures.push(
                  `${route} @ ${viewport.label}: portrait identity labels touch or clip their strip ` +
                    `(${portraitIdEdgeInset.toFixed(1)}px inset)`
                );
              }
              if (homeProjectMaxHeight > 480) {
                failures.push(
                  `${route} @ ${viewport.label}: selected evidence imagery is still oversized ` +
                    `(${homeProjectMaxHeight.toFixed(1)}px)`
                );
              }
              if (heroBottom > viewport.height + 1 || portraitBottom > viewport.height + 1) {
                failures.push(
                  `${route} @ ${viewport.label}: the complete hero does not fit in the initial viewport`
                );
              }
              if (englishTitleTop - arabicTitleBottom < 16) {
                failures.push(
                  `${route} @ ${viewport.label}: Arabic and English hero titles overlap or lack spacing`
                );
              }
              if (portraitTop - heroTop > 104) {
                failures.push(`${route} @ ${viewport.label}: portrait starts too low in the hero`);
              }
              if (portraitBackground !== pageBackground) {
                failures.push(
                  `${route} @ ${viewport.label}: portrait column still has a contrasting vertical stripe`
                );
              }
              if (portraitCardBottomGap > 12.5) {
                failures.push(
                  `${route} @ ${viewport.label}: portrait card has excessive lower frame padding ` +
                    `(${portraitCardBottomGap.toFixed(1)}px)`
                );
              }
            }
          }
          if (route === "/about/") {
            if (portraitCount !== 1 || removedSceneCount !== 0) {
              failures.push(
                `${route} @ ${viewport.label}: about must show one static portrait with no engineering scene`
              );
            }
            if (
              viewport.width === 1366 &&
              documentTitle !== "Embedded Systems & IoT R&D Engineer"
            ) {
              failures.push(
                `${route} @ ${viewport.label}: browser title is still suffixed (${documentTitle})`
              );
            }
            if (viewport.width >= 1366) {
              if (
                aboutHeadingFontSize > 88 ||
                aboutHeadingLeft < 23 ||
                aboutHeadingRight > clientWidth - 23
              ) {
                failures.push(
                  `${route} @ ${viewport.label}: about hero type is oversized or clipped ` +
                    `(font=${aboutHeadingFontSize.toFixed(1)}, left=${aboutHeadingLeft.toFixed(1)}, ` +
                    `right=${aboutHeadingRight.toFixed(1)})`
                );
              }
              if (aboutPortraitWidth > 420) {
                failures.push(
                  `${route} @ ${viewport.label}: about portrait is oversized (${aboutPortraitWidth.toFixed(1)}px)`
                );
              }
              if (/rgb\(18, 22, 45\)/.test(contactCalloutBackground)) {
                failures.push(
                  `${route} @ ${viewport.label}: legacy blue contact CTA is still active`
                );
              }
              if (
                aboutIntroBeforeDisplay !== "none" ||
                aboutStoryLabelColor !== "rgb(217, 164, 65)"
              ) {
                failures.push(
                  `${route} @ ${viewport.label}: legacy decorative colors remain in About ` +
                    `(${aboutIntroBeforeDisplay}, ${aboutStoryLabelColor})`
                );
              }
            }
          }
          if (route === "/tools/" && viewport.width === 1366) {
            if (hasUnifiedCatalog || calculatorThumbnails !== 0 || toolCategoryCardCount !== 8) {
              failures.push(
                `${route} @ ${viewport.label}: the root must show eight consolidated categories before individual tools`
              );
            }
            if (invalidToolCategoryCards !== 0) {
              failures.push(
                `${route} @ ${viewport.label}: category destinations contain nested interactive elements`
              );
            }
            if (hasScrollCue) {
              failures.push(`${route} @ ${viewport.label}: the old scroll cue remains`);
            }
          }
          if (route === "/tools/category/circuit-design/" && viewport.width === 1366) {
            if (categoryGroupCount !== 5 || calculatorThumbnails !== 26) {
              failures.push(
                `${route} @ ${viewport.label}: the grouped circuit-design shelf is incomplete`
              );
            }
            if (categoryDestinationCardCount !== 26 || invalidCategoryDestinationCards !== 0) {
              failures.push(
                `${route} @ ${viewport.label}: grouped category destination links are wrong`
              );
            }
            if (
              calculatorThumbnailVisualVariants !== 26 ||
              calculatorThumbnailGenericLabels !== 0 ||
              Math.abs(calculatorThumbnailAspect - 16 / 9) > 0.03
            ) {
              failures.push(
                `${route} @ ${viewport.label}: category covers are not purpose-specific 16:9 visuals`
              );
            }
            if (categoryCardGridGap < 16) {
              failures.push(
                `${route} @ ${viewport.label}: tool cards are still joined without useful spacing ` +
                  `(${categoryCardGridGap.toFixed(1)}px)`
              );
            }
          }
          if (route === "/tools/security-command-builder/" && viewport.width === 1366) {
            if (
              securityPrimaryColor !== "rgb(20, 16, 10)" ||
              securityCurrentStepColor !== "rgb(20, 16, 10)" ||
              securityInactiveStepColor !== primaryTextColor
            ) {
              failures.push(
                `${route} @ ${viewport.label}: security controls retain muted button labels ` +
                  `(${securityPrimaryColor}, ${securityCurrentStepColor}, ${securityInactiveStepColor})`
              );
            }
          }
          if (route === "/tools/555-timer-astable-circuit-calculator/" && viewport.width === 1366) {
            if (
              diagramLabelColor !== primaryTextColor ||
              (hasDiagramCaption && diagramCaptionColor !== "rgb(138, 147, 161)")
            ) {
              failures.push(
                `${route} @ ${viewport.label}: calculator diagram labels are not legible ` +
                  `(${diagramLabelColor}, ${diagramCaptionColor})`
              );
            }
          }
          if (
            route.includes("calculator") &&
            viewport.width >= 1366 &&
            toolBodyWidth < viewport.width * 0.8
          ) {
            failures.push(
              `${route} @ ${viewport.label}: calculator content remains narrowly centered`
            );
          }
          if (
            route.includes("calculator") &&
            viewport.width >= 1366 &&
            calculatorPanelWidth < toolBodyWidth * 0.88
          ) {
            failures.push(
              `${route} @ ${viewport.label}: interactive calculator panel remains a centered island ` +
                `(panel=${calculatorPanelWidth.toFixed(1)}px, body=${toolBodyWidth.toFixed(1)}px)`
            );
          }
          if (
            route.includes("calculator") &&
            viewport.width === 1366 &&
            calculatorFirstControlBottom > viewport.height
          ) {
            failures.push(
              `${route} @ ${viewport.label}: the first calculator control is below the initial viewport ` +
                `(bottom=${calculatorFirstControlBottom.toFixed(1)}px)`
            );
          }
          if (
            route.includes("calculator") &&
            viewport.width >= 1366 &&
            calculatorPanelTop >= calculatorExplanationTop
          ) {
            failures.push(
              `${route} @ ${viewport.label}: explanation still appears before the working calculator ` +
                `(calculator=${calculatorPanelTop.toFixed(1)}, explanation=${calculatorExplanationTop.toFixed(1)})`
            );
          }
          if (route === "/tools/ohms-law-calculator/" && viewport.width === 1366) {
            if (!hasCalculatorFinder) {
              failures.push(`${route} @ ${viewport.label}: shared calculator finder is missing`);
            }
          }
          if (route === "/tools/sensor-code-generator/" && viewport.width === 1366) {
            if (embeddedFamilyTabs !== 5 || embeddedExamples < 5) {
              failures.push(
                `${route} @ ${viewport.label}: embedded families or example presets are missing`
              );
            }
            if (embeddedLabelFontSize < 14) {
              failures.push(
                `${route} @ ${viewport.label}: embedded workbench labels remain below the 14px font floor`
              );
            }
          }
        }
      }

      await client.send("Emulation.setDeviceMetricsOverride", {
        width: 1366,
        height: 768,
        deviceScaleFactor: 1,
        mobile: false
      });
      const homeLoaded = client.waitForEvent("Page.loadEventFired");
      await client.send("Page.navigate", { url: `${baseUrl}/` });
      await homeLoaded;
      let focus = { isNav: false, width: 0, style: "none", color: "" };
      for (let tabPress = 0; tabPress < 10 && !focus.isNav; tabPress += 1) {
        await client.send("Input.dispatchKeyEvent", {
          type: "keyDown",
          key: "Tab",
          code: "Tab",
          windowsVirtualKeyCode: 9,
          nativeVirtualKeyCode: 9
        });
        await client.send("Input.dispatchKeyEvent", {
          type: "keyUp",
          key: "Tab",
          code: "Tab",
          windowsVirtualKeyCode: 9,
          nativeVirtualKeyCode: 9
        });
        const focusResult = await client.send("Runtime.evaluate", {
          returnByValue: true,
          expression: `(() => {
            const active = document.activeElement;
            const style = active ? getComputedStyle(active) : null;
            return {
              isNav: Boolean(active?.matches(".site-nav a")),
              width: style ? parseFloat(style.outlineWidth) : 0,
              style: style?.outlineStyle ?? "none",
              color: style?.outlineColor ?? ""
            };
          })()`
        });
        focus = focusResult.result.value;
      }
      const navigationResult = await client.send("Runtime.evaluate", {
        awaitPromise: true,
        returnByValue: true,
        expression: `(async () => {
          const visible = (el) => Boolean(el) && getComputedStyle(el).display !== "none";
          const waitFor = async (predicate, label) => {
            const deadline = Date.now() + 5000;
            while (Date.now() < deadline) {
              if (predicate()) return;
              await new Promise((resolve) => setTimeout(resolve, 50));
            }
            throw new Error("Timed out waiting for " + label);
          };
          const homeHasMissionUi = visible(document.querySelector(".mission-rail"));
          const toolsLink = [...document.querySelectorAll("a")].find((link) =>
            new URL(link.href).pathname.endsWith("/tools/")
            || new URL(link.href).pathname.endsWith("/tools")
          );
          toolsLink?.click();
          await waitFor(
            () => location.pathname.endsWith("/tools/") || location.pathname.endsWith("/tools"),
            "client navigation to tools"
          );
          await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
          const toolsHasMissionUi = visible(document.querySelector(".mission-rail"))
            || visible(document.querySelector(".mobile-mission-readout"));
          document.querySelector("a.brand")?.click();
          await waitFor(
            () => location.pathname.endsWith("/"),
            "client navigation back home"
          );
          return {
            homeHasMissionUi,
            toolsHasMissionUi,
            returnHomeHasMissionUi: visible(document.querySelector(".mission-rail"))
          };
        })()`
      });
      const navigation = navigationResult.result.value;
      if (navigation.homeHasMissionUi) {
        failures.push("client navigation: floating mission UI covers the initial home route");
      }
      if (
        !focus.isNav ||
        focus.width < 3 ||
        focus.style === "none" ||
        !/rgb\(232, 188, 102\)|rgb\(217, 164, 65\)/.test(focus.color)
      ) {
        failures.push(
          `keyboard focus: first navigation link lacks the required 3px ASL gold outline ` +
            `(${focus.width}px ${focus.style} ${focus.color})`
        );
      }
      if (navigation.toolsHasMissionUi) {
        failures.push("client navigation: mission UI remains visible after home → tools");
      }
      if (navigation.returnHomeHasMissionUi) {
        failures.push("client navigation: floating mission UI returns after tools → home");
      }
      if (client.consoleErrors.length) {
        failures.push(`browser console errors:\n${client.consoleErrors.join("\n")}`);
      }
    } finally {
      if (client?.socket) client.socket.close();
      if (chrome) stopProcessTree(chrome);
      if (app) stopProcessTree(app);
    }

    assert.deepStrictEqual(failures, [], `horizontal overflow found:\n${failures.join("\n")}`);
  }
);
