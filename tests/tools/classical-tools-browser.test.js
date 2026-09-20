import test from "node:test";
import assert from "node:assert/strict";
import puppeteer from "puppeteer-core";

const base = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";
const executablePath = process.env.CHROME_PATH || "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const slugs = [
  "vigenere-cipher", "affine-cipher", "transposition-cipher", "playfair-cipher",
  "hill-cipher", "hash-generator", "aes-hex-calculator"
];

test("classical tool routes are responsive and mode controls have named groups", async () => {
  const browser = await puppeteer.launch({ executablePath, headless: true });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const slug of slugs) {
      const response = await page.goto(`${base}/tools/${slug}/`, { waitUntil: "networkidle0" });
      assert.equal(response.status(), 200, slug);
      for (const width of [320, 390, 1440]) {
        await page.setViewport({ width, height: 900 });
        assert.equal(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
          true,
          `${slug} ${width}px overflow`
        );
      }
      const unnamedGroups = await page.$$eval("article button[aria-pressed]", (buttons) =>
        buttons.filter((button) => {
          const group = button.closest('[role="group"]');
          return !group || !group.getAttribute("aria-label");
        }).length
      );
      assert.equal(unnamedGroups, 0, `${slug} unnamed mode group`);
    }
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
  }
});

test("classical tool interfaces render their canonical examples", async () => {
  const browser = await puppeteer.launch({ executablePath, headless: true });
  try {
    const page = await browser.newPage();
    const expected = {
      "vigenere-cipher": "LXFOPVEFRNHR",
      "transposition-cipher": "WECRLTEERDSOEEFEAOCAIVDEN",
      "playfair-cipher": "BMODZBXDNABEKUDMUIXMMOUVIF",
      "hill-cipher": "LNSHDLEWMTRW",
      "aes-hex-calculator": "69c4e0d86a7b0430d8cdb78070b4c55a"
    };
    for (const [slug, output] of Object.entries(expected)) {
      await page.goto(`${base}/tools/${slug}/`, { waitUntil: "networkidle0" });
      assert.equal(await page.$eval("textarea[readonly]", (element) => element.value), output, slug);
    }
    await page.goto(`${base}/tools/affine-cipher/`, { waitUntil: "networkidle0" });
    await page.$$eval("button", (buttons) => buttons.find((button) => button.textContent.trim() === "Affine").click());
    await page.waitForFunction(() => document.querySelector("textarea[readonly]")?.value === "IHHWVCSWFRCP");

    await page.goto(`${base}/tools/hash-generator/`, { waitUntil: "networkidle0" });
    await page.$eval("textarea", (element) => {
      const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value").set;
      setter.call(element, "abc");
      element.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await page.waitForFunction(() => document.body.textContent.includes("900150983cd24fb0d6963f7d28e17f72"));
    assert.match(await page.$eval("main", (element) => element.textContent), /ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad/);
  } finally {
    await browser.close();
  }
});
