import test from "node:test";
import assert from "node:assert/strict";
import {
  browserStorage,
  encodeProblem,
  decodeProblem,
  saveHistory,
  readHistory,
  transferValues
} from "../../lib/tools/satellite/state.js";

test("browser storage access survives environments that deny the property itself", () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "window");
  try {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        get localStorage() {
          throw new Error("SecurityError");
        }
      }
    });
    assert.equal(browserStorage(), null);
  } finally {
    if (previous) Object.defineProperty(globalThis, "window", previous);
    else delete globalThis.window;
  }
});

test("shared problems restore units and convention without accepting unknown or nonfinite fields", () => {
  const query = encodeProblem("orbit", { altitudeM: 800000, orbitMode: "circular" }, "course");
  assert.deepEqual(decodeProblem(query, ["altitudeM", "orbitMode"]), {
    slug: "orbit",
    values: { altitudeM: 800000, orbitMode: "circular" },
    mode: "course"
  });
  assert.equal(decodeProblem("?v=8&p=garbage", ["altitudeM"]), null);
  assert.equal(decodeProblem("?v=1&p=%7B", ["altitudeM"]), null);
  const evil = encodeProblem("orbit", { altitudeM: null, unknown: 2 }, "course");
  assert.deepEqual(decodeProblem(evil, ["altitudeM"]).values, {});
});

test("history is bounded, newest first, recoverable after corrupt or unavailable storage", () => {
  const map = new Map();
  const storage = { getItem: (k) => map.get(k), setItem: (k, v) => map.set(k, v) };
  for (let i = 0; i < 15; i++)
    saveHistory(storage, {
      slug: "orbit",
      values: { altitudeM: i },
      mode: "course",
      title: "Orbit"
    });
  assert.equal(readHistory(storage).length, 10);
  assert.equal(readHistory(storage)[0].values.altitudeM, 14);
  map.set("asl-satellite-history", "{");
  assert.deepEqual(readHistory(storage), []);
  assert.doesNotThrow(() =>
    saveHistory(
      {
        getItem() {
          throw Error("denied");
        },
        setItem() {
          throw Error("denied");
        }
      },
      { slug: "orbit", values: { altitudeM: 2 } }
    )
  );
});

test('history save reports a rejected write instead of a false success',()=>{
 const entry={slug:'orbit',values:{altitudeM:800000},mode:'course'};
 assert.equal(saveHistory(null,entry),false);
 assert.equal(saveHistory({getItem:()=>null,setItem(){throw Error('quota');}},entry),false);
 const map=new Map();
 assert.equal(saveHistory({getItem:k=>map.get(k),setItem:(k,v)=>map.set(k,v)},entry),true);
});
test("connected tools transfer only compatible physical results", () => {
  assert.deepEqual(
    transferValues("antenna", "rf-path", { gainDb: 44.87, effectiveApertureM2: 2.2 }),
    { receiveGainDb: 44.87, effectiveApertureM2: 2.2, rfMode: "pfd-receive" }
  );
  assert.deepEqual(transferValues("look-angles", "rf-path", { slantRangeM: 40000000 }), {
    distanceM: 40000000
  });
  assert.deepEqual(transferValues("antenna", "rf-path", { gainDb: 44.87 }), {
    receiveGainDb: 44.87
  });
  assert.deepEqual(transferValues("noise-gt", "link-budget", { gtDbK: 19.23 }), {
    downlinkGtDbK: 19.23
  });
  assert.deepEqual(transferValues("antenna", "link-budget", { gainDb: 44.87 }), {
    receiveGainDb: 44.87,
    linkMode: "basic"
  });
  assert.deepEqual(transferValues("orbit", "noise-gt", { periodS: 6043 }), {});
});
test("shared nested FT legs and editable cascade stages survive roundtrip", () => {
  const values = {
    uplink: { frequencyHz: 14e9, distanceM: 38e6 },
    downlink: { frequencyHz: 12e9, distanceM: 38e6 },
    stages: [{ gainDb: 20, noiseFigureDb: 1 }]
  };
  assert.deepEqual(
    decodeProblem(encodeProblem("link-budget", values), Object.keys(values)).values,
    values
  );
});
