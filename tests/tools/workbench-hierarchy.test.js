import test from "node:test";
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

// Guards Task 4 of the 2026-09-03 home/tools/calculator design spec: PID Simulator, Sensor Code
// Generator, and Battery Estimator each need exactly one semantic h1, a compact opening viewport,
// and (Battery Estimator specifically) a displayed input that never disagrees with the value the
// calculation actually used.

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
  "PID Simulator, Sensor Code Generator, and Battery Estimator use one h1 and a compact opening viewport",
  { timeout: 120_000 },
  async () => {
    const chromePath = chromeCandidates.find(existsSync);
    if (!chromePath) return;

    const baseRoot = process.env.SITE_RESPONSIVE_BASE_URL ?? "http://127.0.0.1:3000";
    const useExisting = await serverReady(`${baseRoot}/`);
    const port = 33_000 + Math.floor(Math.random() * 3_000);
    const baseUrl = useExisting ? baseRoot : `http://127.0.0.1:${port}`;
    const app = useExisting
      ? null
      : spawn(process.env.ComSpec || "cmd.exe", ["/d", "/s", "/c", "npm.cmd", "run", "dev", "--", "--hostname", "127.0.0.1", "--port", String(port)], {
          cwd: process.cwd(),
          env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
          stdio: ["ignore", "pipe", "pipe"],
          windowsHide: true
        });

    const userDataDir = mkdtempSync(join(tmpdir(), "workbench-hierarchy-"));
    let chrome;
    let client;
    const failures = [];

    try {
      if (app) await waitForServer(`${baseUrl}/`, app);
      const session = await startChrome(chromePath, userDataDir);
      chrome = session.chrome;
      client = await createClient(session.port, "about:blank");
      await client.send("Page.enable");
      await client.send("Emulation.setDeviceMetricsOverride", { width: 1366, height: 900, deviceScaleFactor: 1, mobile: false });

      const routes = [
        { path: "/tools/pid-simulator/", h1: "Interactive PID Simulator" },
        { path: "/tools/sensor-code-generator/", h1: "Embedded Code Workbench" },
        { path: "/tools/battery-estimator/", h1: "ESP32 Battery Life & Power Estimator" }
      ];

      for (const route of routes) {
        const loaded = client.waitForEvent ? null : null;
        await client.send("Page.navigate", { url: `${baseUrl}${route.path}` });
        await delay(1200);

        const info = await evaluate(
          client,
          `(() => ({
            h1Count: document.querySelectorAll("h1").length,
            h1Text: document.querySelector("h1") ? document.querySelector("h1").textContent : null,
            mainCount: document.querySelectorAll("main").length,
            firstControlTop: (() => {
              const el = document.querySelector(".tool-controls input, .tool-controls select, .tool-controls button, .embedded-workbench input, .embedded-workbench select, .embedded-workbench button");
              return el ? el.getBoundingClientRect().top : -1;
            })()
          }))()`
        );

        if (info.h1Count !== 1) failures.push(`${route.path}: expected exactly one h1, found ${info.h1Count}`);
        if (info.h1Text !== route.h1) failures.push(`${route.path}: h1 text is "${info.h1Text}", expected "${route.h1}"`);
        if (info.mainCount > 1) failures.push(`${route.path}: expected at most one main, found ${info.mainCount}`);
        if (info.firstControlTop < 0 || info.firstControlTop > 900) {
          failures.push(`${route.path}: first control is not usably positioned (top=${info.firstControlTop})`);
        }
      }

      // Battery Estimator: an out-of-range capacity must never leave the displayed value
      // disagreeing with the value the calculation used.
      await client.send("Page.navigate", { url: `${baseUrl}/tools/battery-estimator/` });
      await delay(1200);

      const batteryResult = await evaluate(
        client,
        `(() => {
          const input = document.getElementById("capacityMah");
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
          input.focus();
          setter.call(input, "999999");
          input.dispatchEvent(new Event("input", { bubbles: true }));
          input.blur();
          input.dispatchEvent(new FocusEvent("focusout", { bubbles: true }));
          return new Promise((resolve) => {
            setTimeout(() => {
              const displayed = Number(document.getElementById("capacityMah").value);
              const summary = document.body.textContent;
              const match = summary.match(/Usable capacity:\\s*([\\d,]+)\\s*mAh/);
              const usedCapacity = match ? Number(match[1].replace(/,/g, "")) : null;
              resolve({ displayed, usedCapacity, hasNotice: /50,000|50000/.test(summary) });
            }, 150);
          });
        })()`
      );

      if (batteryResult.displayed !== 50000) {
        failures.push(`battery capacity input should clamp its own display to 50000, got ${batteryResult.displayed}`);
      }
      if (batteryResult.usedCapacity !== 50000) {
        failures.push(
          `battery capacity displayed (${batteryResult.displayed}) must match the value used in the calculation (${batteryResult.usedCapacity})`
        );
      }
    } finally {
      if (client?.socket) client.socket.close();
      if (chrome) stopProcessTree(chrome);
      if (app) stopProcessTree(app);
    }

    assert.deepStrictEqual(failures, [], failures.join("\n"));
  }
);
