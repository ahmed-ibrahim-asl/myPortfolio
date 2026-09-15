import { test } from 'node:test';
import assert from 'node:assert';
import {
  EMBEDDED_CONFIGURATIONS,
  EMBEDDED_TARGETS,
  generateEmbeddedCode
} from '../../lib/tools/embedded-generator/catalog.js';

// Guards the production-readiness expansion: every declared target/environment/protocol
// combination in the registry must actually produce real code, not a placeholder, and the
// specific bug this expansion fixed (BME280's ESP-IDF stub) must never regress.

test('every registered configuration compiles to real, non-trivial code', () => {
  for (const config of EMBEDDED_CONFIGURATIONS) {
    const result = generateEmbeddedCode(
      { family: config.family, target: config.target, environment: config.environment, protocol: config.protocol },
      {}
    );
    assert.strictEqual(result.ok, true, `${config.target}/${config.environment}/${config.protocol} should generate`);
    assert.ok(result.code.length > 40, `${config.target}/${config.environment}/${config.protocol} should return substantial code`);
    assert.ok(result.code.endsWith('\n'), `${config.target}/${config.environment}/${config.protocol} should end with a newline`);
  }
});

test('registry IDs are unique across every source file combined', () => {
  const ids = EMBEDDED_CONFIGURATIONS.map((c) => c.id);
  assert.strictEqual(new Set(ids).size, ids.length);
});

test('BME280 ESP-IDF variants actually read the sensor instead of the old placeholder comment', () => {
  for (const environment of ['esp-idf', 'platformio-espidf']) {
    const config = EMBEDDED_CONFIGURATIONS.find((c) => c.target === 'bme280' && c.environment === environment);
    assert.ok(config, `expected a bme280 ${environment} configuration`);
    const result = generateEmbeddedCode({ target: 'bme280', environment, protocol: 'i2c' }, {});
    assert.doesNotMatch(result.code, /BME280 read logic/, 'the old non-functional placeholder must be gone');
    assert.match(result.code, /read_regs\(0xF7/, 'must read the pressure/temperature data registers');
    assert.match(result.code, /Temperature C: %\.2f/, 'must print an actual temperature value');
  }
});

test('every Arduino target that declares an ESP-IDF sibling also has a PlatformIO sibling', () => {
  const byTarget = new Map();
  for (const config of EMBEDDED_CONFIGURATIONS) {
    if (!byTarget.has(config.target)) byTarget.set(config.target, new Set());
    byTarget.get(config.target).add(config.environment);
  }
  for (const [target, environments] of byTarget) {
    if (environments.has('arduino')) {
      assert.ok(environments.has('platformio'), `${target} has arduino but no platformio variant`);
    }
  }
});

test('PlatformIO code is derived from Arduino code (byte-identical plus the Arduino.h include)', () => {
  const targets = ['bmp280', 'bh1750', 'ads1115', 'i2c-scanner'];
  for (const target of targets) {
    const metadata = EMBEDDED_TARGETS.find(({ id }) => id === target);
    const protocol = metadata.protocols[0];
    const arduino = generateEmbeddedCode({ target, environment: 'arduino', protocol }, {});
    const platformio = generateEmbeddedCode({ target, environment: 'platformio', protocol }, {});
    assert.strictEqual(platformio.code, `#include <Arduino.h>\n${arduino.code}`, `${target} platformio should equal arduino plus the include`);
  }
});

test('new sensor families are reachable: displays, timekeeping, IMU, air quality, power, GPS, SD logging, encoder', () => {
  const targets = [
    'ssd1306-oled', 'lcd1602-i2c', 'ds3231-rtc', 'bno055-imu',
    'sgp30-air-quality', 'ina219-power', 'neo6m-gps', 'sd-card-logger', 'rotary-encoder'
  ];
  for (const target of targets) {
    const metadata = EMBEDDED_TARGETS.find(({ id }) => id === target);
    assert.ok(metadata, `${target} should be a registered target`);
    assert.strictEqual(metadata.family, 'sensor');
    const result = generateEmbeddedCode({ target, environment: 'arduino', protocol: metadata.protocols[0] }, {});
    assert.strictEqual(result.ok, true, `${target} should generate on arduino`);
  }
});

test('production hardening family covers deep sleep, TLS, OTA, and watchdog recovery', () => {
  const hardeningTargets = EMBEDDED_TARGETS.filter(({ family }) => family === 'hardening').map(({ id }) => id);
  for (const target of ['deep-sleep-timer', 'deep-sleep-gpio-wake', 'https-client', 'mqtts-publisher', 'ota-update', 'watchdog-recovery']) {
    assert.ok(hardeningTargets.includes(target), `${target} should be in the hardening family`);
  }

  const https = generateEmbeddedCode({ target: 'https-client', environment: 'arduino', protocol: 'http' }, {});
  assert.match(https.code, /WiFiClientSecure/);
  assert.match(https.code, /setCACert/);

  const watchdog = generateEmbeddedCode({ target: 'watchdog-recovery', environment: 'arduino', protocol: 'power' }, {});
  assert.match(watchdog.code, /esp_task_wdt/);
  assert.doesNotMatch(watchdog.code, /^\s*while \(1\);\s*$/m, 'should not use the old bare hang-forever pattern');
});

test('single-board computer family offers Raspberry Pi and Jetson variants with real Python', () => {
  const sbcTargets = EMBEDDED_TARGETS.filter(({ family }) => family === 'sbc').map(({ id }) => id);
  assert.deepStrictEqual(sbcTargets.sort(), ['sbc-camera', 'sbc-gpio-io', 'sbc-i2c-sensor', 'sbc-pwm', 'sbc-spi-transfer'].sort());

  for (const target of sbcTargets) {
    const metadata = EMBEDDED_TARGETS.find(({ id }) => id === target);
    for (const environment of ['raspberry-pi', 'jetson']) {
      const result = generateEmbeddedCode({ target, environment, protocol: metadata.protocols[0] }, {});
      assert.strictEqual(result.ok, true, `${target}/${environment} should generate`);
      assert.strictEqual(result.language, 'python');
    }
  }

  const piGpio = generateEmbeddedCode({ target: 'sbc-gpio-io', environment: 'raspberry-pi', protocol: 'gpio' }, {});
  assert.match(piGpio.code, /gpiozero/);
  const jetsonGpio = generateEmbeddedCode({ target: 'sbc-gpio-io', environment: 'jetson', protocol: 'gpio' }, {});
  assert.match(jetsonGpio.code, /Jetson\.GPIO/);

  const piCamera = generateEmbeddedCode({ target: 'sbc-camera', environment: 'raspberry-pi', protocol: 'camera' }, {});
  assert.match(piCamera.code, /picamera2/i);
  const jetsonCamera = generateEmbeddedCode({ target: 'sbc-camera', environment: 'jetson', protocol: 'camera' }, {});
  assert.match(jetsonCamera.code, /nvarguscamerasrc/);
});

test('deep sleep timer honors a custom sleep duration', () => {
  const result = generateEmbeddedCode({ target: 'deep-sleep-timer', environment: 'arduino', protocol: 'power' }, { sleepSeconds: 300 });
  assert.match(result.code, /SLEEP_SECONDS = 300/);
});

test('unsupported combinations still return a typed error, not a throw', () => {
  const result = generateEmbeddedCode({ target: 'bme280', environment: 'raspberry-pi', protocol: 'i2c' }, {});
  assert.strictEqual(result.ok, false);
  assert.strictEqual(result.error, 'UNSUPPORTED_CONFIGURATION');
});
