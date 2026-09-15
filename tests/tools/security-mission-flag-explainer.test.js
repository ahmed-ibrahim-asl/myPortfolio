import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

// Guards the click-to-explain floating window on Security Mission's command assembly trace:
// clicking a flag token with a glossary description opens a small, draggable, non-modal window
// (not a native title tooltip alone) instead of requiring the visitor to scroll away from the
// command they are building.

const read = (path) => readFileSync(path, "utf8");

test("CommandAssemblyTrace wires flag tokens to the shared FloatingExplainer", () => {
  const source = read("components/tools/security-mission/CommandAssemblyTrace.tsx");
  assert.match(source, /import \{ FloatingExplainer \} from "\.\.\/FloatingExplainer"/);
  assert.match(source, /explainToken/);
  assert.match(source, /<FloatingExplainer/);
  assert.match(source, /generatedCommand\.sourceUrls/, "the explainer should offer the doc citation when available");
});

test("FloatingExplainer is non-modal, draggable, and closes on Escape", () => {
  const source = read("components/tools/FloatingExplainer.tsx");
  assert.match(source, /role="region"/, "must not be role=dialog - it should never block the page behind it");
  assert.match(source, /useDraggable/);
  assert.match(source, /key === "Escape"/);
  assert.doesNotMatch(source, /role="dialog"|<div className="backdrop"|overlay/i);
});

const chromeCandidates = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
].filter(Boolean);

function stopProcessTree(child) {
  if (!child?.pid || child.exitCode !== null) return;
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore", windowsHide: true });
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
    if (child.exitCode !== null) throw new Error(`Next.js exited before startup (${child.exitCode}).`);
    if (await serverReady(url)) return;
    await delay(200);
  }
  throw new Error(`Timed out waiting for ${url}`);
}
async function startChrome(chromePath, userDataDir) {
  const chrome = spawn(
    chromePath,
    ["--headless=new", "--disable-gpu", "--no-first-run", "--remote-debugging-port=0", `--user-data-dir=${userDataDir}`, "about:blank"],
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
  const response = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`, { method: "PUT" });
  const target = await response.json();
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  let nextId = 1;
  const pending = new Map();
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
    }
  });
  const send = (method, params = {}) => {
    const id = nextId++;
    socket.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
  };
  return { socket, send };
}
async function evaluate(client, expression) {
  const result = await client.send("Runtime.evaluate", { returnByValue: true, awaitPromise: true, expression });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
}

test(
  "clicking a described flag opens a floating window with its description, and Escape closes it",
  { timeout: 60_000 },
  async () => {
    const chromePath = chromeCandidates.find(existsSync);
    if (!chromePath) return;

    const baseRoot = process.env.SITE_RESPONSIVE_BASE_URL ?? "http://127.0.0.1:3000";
    const useExisting = await serverReady(`${baseRoot}/`);
    const port = 34_000 + Math.floor(Math.random() * 3_000);
    const baseUrl = useExisting ? baseRoot : `http://127.0.0.1:${port}`;
    const app = useExisting
      ? null
      : spawn(process.env.ComSpec || "cmd.exe", ["/d", "/s", "/c", "npm.cmd", "run", "dev", "--", "--hostname", "127.0.0.1", "--port", String(port)], {
          cwd: process.cwd(),
          env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
          stdio: ["ignore", "pipe", "pipe"],
          windowsHide: true
        });

    const userDataDir = mkdtempSync(join(tmpdir(), "flag-explainer-"));
    let chrome;
    let client;

    try {
      if (app) await waitForServer(`${baseUrl}/`, app);
      const session = await startChrome(chromePath, userDataDir);
      chrome = session.chrome;
      client = await createClient(session.port, "about:blank");
      await client.send("Page.enable");
      await client.send("Emulation.setDeviceMetricsOverride", { width: 1366, height: 900, deviceScaleFactor: 1, mobile: false });
      await client.send("Page.navigate", { url: `${baseUrl}/tools/security-command-builder/` });
      await delay(1200);

      const clickWhenReady = async (selector) => {
        const deadline = Date.now() + 8000;
        while (Date.now() < deadline) {
          const clicked = await evaluate(client, `(() => {
            const el = document.querySelector(${JSON.stringify(selector)});
            if (el) { el.click(); return true; }
            return false;
          })()`);
          if (clicked) return;
          await delay(100);
        }
        throw new Error(`timed out waiting for ${selector}`);
      };

      await clickWhenReady('[data-security-mission][data-ready="true"]');
      await clickWhenReady("[data-step-continue]");
      // "Tool" is the default entry mode (fast mode: search for the tool directly).
      await clickWhenReady('[data-tool-id="nmap"]');
      await clickWhenReady('[data-action-id="nmap-host-discovery"]');
      await delay(500);

      const opened = await evaluate(client, `(() => {
        const token = document.querySelector('[data-token-type="flag"][data-has-description="true"]');
        if (!token) return { found: false };
        token.click();
        return { found: true, tokenText: token.textContent };
      })()`);
      assert.equal(opened.found, true, "expected at least one flag token with a glossary description");
      await delay(400);

      const state = await evaluate(client, `(() => {
        const win = document.querySelector(".floating-explainer");
        if (!win) return { open: false };
        return {
          open: true,
          title: win.querySelector(".floating-explainer-title")?.textContent,
          hasBody: Boolean(win.querySelector(".floating-explainer-body")?.textContent?.length)
        };
      })()`);
      assert.equal(state.open, true, "expected the floating explainer to open on click");
      assert.equal(state.title, opened.tokenText);
      assert.equal(state.hasBody, true);

      await client.send("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape" });
      await client.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape" });
      await delay(300);
      const closed = await evaluate(client, `!document.querySelector(".floating-explainer")`);
      assert.equal(closed, true, "expected Escape to close the floating explainer");
    } finally {
      if (client?.socket) client.socket.close();
      if (chrome) stopProcessTree(chrome);
      if (app) stopProcessTree(app);
    }
  }
);
