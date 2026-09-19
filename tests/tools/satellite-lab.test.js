import test from "node:test";
import assert from "node:assert/strict";
import {
  LAB_EXPERIMENTS,
  createLabState,
  evaluateLab,
  carrierNoise,
  signalNoise,
  waveformSamples,
  transmitData
} from "../../lib/tools/satellite/lab.js";
test("all thirteen working presets and direct path bypass transponder", () => {
  assert.equal(LAB_EXPERIMENTS.length, 13);
  for (let n = 1; n <= 13; n++) {
    const s = createLabState(n);
    assert.equal(evaluateLab(s).rfLinked, true, `experiment ${n}`);
  }
  const s = createLabState(1);
  s.power.satellite = false;
  assert.equal(evaluateLab(s).rfLinked, true);
});
test("active links require power, all RF cables, matching frequencies and dish alignment", () => {
  for (const key of ["tx", "satellite", "rx"]) {
    const s = createLabState(2);
    s.power[key] = false;
    assert.equal(evaluateLab(s).rfLinked, false);
  }
  for (const key of ["txDish", "satRxDish", "satTxDish", "rxDish"]) {
    const s = createLabState(2);
    s.cables[key] = false;
    assert.equal(evaluateLab(s).rfLinked, false);
  }
  const s = createLabState(2);
  s.satRx = 2450;
  assert.match(evaluateLab(s).faults.join(" "), /frequency/i);
  s.satRx = 2468;
  s.alignment = 90;
  assert.equal(evaluateLab(s).rfLinked, false);
});
test("independent video audio-I and tone channels respond to modes and patches", () => {
  const s = createLabState(6);
  assert.deepEqual(evaluateLab(s).channels, {
    video: true,
    audio: true,
    tone: true,
    voice: false,
    function: false,
    data: false,
    telemetry: false
  });
  s.rxA = "Data";
  assert.equal(evaluateLab(s).channels.video, false);
  assert.equal(evaluateLab(s).channels.tone, true);
  s.cables.audio = false;
  assert.equal(evaluateLab(s).channels.audio, false);
});
test("experiment 3 routes audio through Audio-II while experiment 6 keeps Audio-I plus tone", () => {
  const audiovisual = createLabState(3);
  assert.equal(audiovisual.txB, "Audio-II");
  assert.equal(audiovisual.rxB, "Audio-II");
  assert.equal(evaluateLab(audiovisual).channels.audio, true);
  assert.equal(evaluateLab(audiovisual).channels.tone, false);
  audiovisual.txB = "Tone";
  assert.equal(evaluateLab(audiovisual).channels.audio, false);

  const simultaneous = createLabState(6);
  assert.equal(simultaneous.txB, "Tone");
  assert.equal(simultaneous.rxB, "Speaker");
  assert.equal(evaluateLab(simultaneous).channels.audio, true);
  assert.equal(evaluateLab(simultaneous).channels.tone, true);
});
test("PC data needs both ports and valid data channel", () => {
  const s = createLabState(8);
  assert.equal(transmitData(s, "HELLO").status, "received");
  s.ports.pc2 = false;
  assert.equal(transmitData(s, "HELLO").status, "disconnected");
  s.ports.pc2 = true;
  s.rxA = "Video";
  assert.equal(transmitData(s, "HELLO").status, "failed");
});
test("telemetry depends on correct command and telemetry toggle", () => {
  const s = createLabState(10);
  assert.equal(evaluateLab(s).telemetry, 50);
  s.command = "temperature";
  assert.equal(evaluateLab(s).telemetry, null);
  s.command = "light";
  s.telemetryOn = false;
  assert.equal(evaluateLab(s).telemetry, null);
});
test("64.5dB power ratio is corrected and C+N subtraction is linear", () => {
  assert.equal(carrierNoise(-35.3, -99.8).db, 64.5);
  assert.ok(Math.abs(carrierNoise(-35.3, -99.8).linear - 2818382.931) < 0.01);
  assert.ok(Math.abs(carrierNoise(-35.3, -99.8, true).linear - 2818381.931) < 0.01);
  assert.throws(() => carrierNoise(-110, -99.8, true), /greater/);
});
test("course amplitude approximation distinct from engineering RMS power subtraction", () => {
  const c = signalNoise(2000, 50);
  assert.equal(c.amplitudeRatio, 39);
  assert.ok(Math.abs(c.db - 31.821292) < 0.00001);
  const e = signalNoise(2000, 50, "engineering");
  assert.ok(Math.abs(e.signal - Math.sqrt(2000 ** 2 - 50 ** 2)) < 0.0001);
  assert.ok(e.db > c.db);
  assert.throws(() => signalNoise(20, 50), /greater/);
});
test("delay shifts received trace and attenuation affects amplitude", () => {
  const s = createLabState(9);
  s.delayMs = 0;
  const a = waveformSamples(s, true);
  s.delayMs = 50;
  assert.notDeepEqual(waveformSamples(s, true), a);
  s.power.tx = false;
  assert.ok(waveformSamples(s, true).every((v) => v.y === 0));
});
test("voice control changes microphone trace and unplugging scope suppresses received trace", () => {
  const s = createLabState(4);
  s.voiceLevel = 100;
  const high = waveformSamples(s, true);
  s.voiceLevel = 0;
  assert.ok(waveformSamples(s, true).every((p) => p.y === 0));
  assert.ok(high.some((p) => p.y !== 0));
  s.voiceLevel = 100;
  s.cables.scope = false;
  assert.ok(waveformSamples(s, true).every((p) => p.y === 0));
});
test("attenuation measured in power dB occurs once, not twice", () => {
  const s = createLabState(12);
  s.attenuationDb = 10;
  assert.ok(Math.abs(evaluateLab(s).carrierDbm - -45.3) < 0.0001);
});
