import { asPin, record } from "./record-helpers.js";

// Production-hardening starters: the things a one-off sensor sketch is missing before it can run
// unattended - battery-aware deep sleep, TLS instead of plaintext Wi-Fi transport, watchdog
// recovery instead of a silent hang, and an OTA update path so a fielded device can be patched
// without a USB cable.
export const HARDENING_CONFIGURATIONS = Object.freeze([
  ...record({
    target: "deep-sleep-timer", label: "Deep sleep (timer wake)", protocol: "power", filename: "deep_sleep_example.ino",
    dependencies: [],
    notes: [
      "Deep sleep resets the chip on wake - anything not in RTC memory or persisted externally is lost, including variable state.",
      "Typical battery-node pattern: wake, read sensor, transmit, sleep. This starter times the wake interval only; wire in the sensor read where marked."
    ],
    generate: (params = {}) => {
      const sleepSeconds = Number.isFinite(params.sleepSeconds) ? params.sleepSeconds : 60;
      return `#include <Arduino.h>\n\nconstexpr uint64_t SLEEP_SECONDS = ${sleepSeconds};\nRTC_DATA_ATTR int bootCount = 0; // Survives deep sleep - regular globals do not\n\nvoid setup() {\n  Serial.begin(115200);\n  bootCount++;\n  Serial.printf("Boot #%d, awake for a reading\\n", bootCount);\n\n  // TODO: read the sensor and transmit here before going back to sleep.\n\n  esp_sleep_enable_timer_wakeup(SLEEP_SECONDS * 1000000ULL);\n  Serial.printf("Sleeping for %llu seconds...\\n", SLEEP_SECONDS);\n  Serial.flush();\n  esp_deep_sleep_start();\n}\n\nvoid loop() {\n  // Never reached - the chip resets on wake and re-runs setup().\n}\n`;
    },
    espidf: {
      notes: [
        "Uses esp_sleep_enable_timer_wakeup + esp_deep_sleep_start directly.",
        "RTC_DATA_ATTR-equivalent persistence in raw ESP-IDF is the RTC_DATA_ATTR macro from esp_attr.h, used the same way as in Arduino."
      ],
      generate: (params = {}) => deepSleepEspIdf(Number.isFinite(params.sleepSeconds) ? params.sleepSeconds : 60)
    }
  }),
  ...record({
    target: "deep-sleep-gpio-wake", label: "Deep sleep (GPIO wake)", protocol: "power", filename: "deep_sleep_gpio_example.ino",
    dependencies: [],
    notes: [
      "ext0 wake requires an RTC-capable GPIO (e.g. GPIO33 on most ESP32 dev boards) and only supports a single pin.",
      "Combine with the timer-wake pattern (esp_sleep_enable_timer_wakeup) for a periodic check-in plus event wake."
    ],
    generate: (params = {}) => {
      const wakePin = asPin(params.wakePin, 33);
      return `#include <Arduino.h>\n\nconstexpr gpio_num_t WAKE_PIN = GPIO_NUM_${wakePin};\n\nvoid setup() {\n  Serial.begin(115200);\n\n  esp_sleep_wakeup_cause_t cause = esp_sleep_get_wakeup_cause();\n  if (cause == ESP_SLEEP_WAKEUP_EXT0) {\n    Serial.println("Woke from GPIO trigger");\n  } else {\n    Serial.println("Normal boot or reset");\n  }\n\n  pinMode(WAKE_PIN, INPUT_PULLDOWN);\n  esp_sleep_enable_ext0_wakeup(WAKE_PIN, 1); // Wake on rising edge\n\n  Serial.println("Going to sleep until the pin goes high...");\n  Serial.flush();\n  esp_deep_sleep_start();\n}\n\nvoid loop() {}\n`;
    }
  }),
  ...record({
    target: "https-client", label: "HTTPS client (TLS)", protocol: "http", filename: "https_client.ino",
    dependencies: [],
    notes: [
      "Replace ROOT_CA with the server's actual root CA certificate in PEM form - do not ship setInsecure() in production, it skips certificate validation entirely.",
      "Fetch the correct root CA with: openssl s_client -connect host:443 -showcerts"
    ],
    generate: () => `#include <WiFi.h>\n#include <WiFiClientSecure.h>\n#include <HTTPClient.h>\n\nconst char* WIFI_SSID = "YOUR_WIFI_SSID";\nconst char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";\nconst char* API_URL = "https://example.com/api/telemetry";\n\n// Replace with the real root CA for your endpoint (openssl s_client -connect host:443 -showcerts).\nconst char* ROOT_CA = \\\n"-----BEGIN CERTIFICATE-----\\n" \\\n"REPLACE_WITH_YOUR_ROOT_CA\\n" \\\n"-----END CERTIFICATE-----\\n";\n\nvoid setup() {\n  Serial.begin(115200);\n  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);\n  while (WiFi.status() != WL_CONNECTED) delay(250);\n}\n\nvoid loop() {\n  if (WiFi.status() == WL_CONNECTED) {\n    WiFiClientSecure client;\n    client.setCACert(ROOT_CA);\n    // Only while proving out wiring on a test endpoint: client.setInsecure();\n\n    HTTPClient https;\n    if (https.begin(client, API_URL)) {\n      int status = https.GET();\n      Serial.printf("HTTPS status: %d\\n", status);\n      if (status > 0) Serial.println(https.getString());\n      https.end();\n    } else {\n      Serial.println("Unable to connect to endpoint");\n    }\n  }\n  delay(10000);\n}\n`
  }),
  ...record({
    target: "mqtts-publisher", label: "MQTTS publisher (TLS)", protocol: "mqtt", filename: "mqtts_publisher.ino",
    dependencies: [{ name: "PubSubClient", version: "^2.8" }],
    notes: [
      "Replace ROOT_CA with the broker's actual root CA certificate - do not ship setInsecure() in production.",
      "TLS brokers default to port 8883, not 1883."
    ],
    generate: () => `#include <WiFi.h>\n#include <WiFiClientSecure.h>\n#include <PubSubClient.h>\n\nconst char* WIFI_SSID = "YOUR_WIFI_SSID";\nconst char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";\nconst char* MQTT_BROKER = "YOUR_MQTT_BROKER";\nconstexpr uint16_t MQTT_PORT = 8883;\n\n// Replace with the real root CA for your broker.\nconst char* ROOT_CA = \\\n"-----BEGIN CERTIFICATE-----\\n" \\\n"REPLACE_WITH_YOUR_ROOT_CA\\n" \\\n"-----END CERTIFICATE-----\\n";\n\nWiFiClientSecure network;\nPubSubClient client(network);\n\nvoid connectMqtt() {\n  while (!client.connected()) {\n    if (client.connect("esp32-workbench-tls")) {\n      client.publish("workbench/telemetry", "{\\"temperature\\":24.5}");\n    } else {\n      delay(1000);\n    }\n  }\n}\n\nvoid setup() {\n  Serial.begin(115200);\n  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);\n  while (WiFi.status() != WL_CONNECTED) delay(250);\n  network.setCACert(ROOT_CA);\n  client.setServer(MQTT_BROKER, MQTT_PORT);\n}\n\nvoid loop() {\n  if (!client.connected()) connectMqtt();\n  client.loop();\n  static unsigned long last = 0;\n  if (millis() - last > 5000) {\n    client.publish("workbench/telemetry", "online");\n    last = millis();\n  }\n}\n`
  }),
  ...record({
    target: "ota-update", label: "OTA firmware update", protocol: "wifi", filename: "ota_update.ino",
    dependencies: [{ name: "ArduinoOTA", version: "built-in" }],
    notes: [
      "Set an OTA password before shipping - an open OTA port lets anyone on the network reflash the device.",
      "Upload via Arduino IDE/PlatformIO's 'Upload' once the device shows up as a network port, or trigger it from a CI pipeline with espota.py."
    ],
    generate: () => `#include <WiFi.h>\n#include <ArduinoOTA.h>\n\nconst char* WIFI_SSID = "YOUR_WIFI_SSID";\nconst char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";\n\nvoid setup() {\n  Serial.begin(115200);\n  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);\n  while (WiFi.status() != WL_CONNECTED) delay(250);\n\n  ArduinoOTA.setHostname("esp32-workbench");\n  ArduinoOTA.setPassword("CHANGE_ME_BEFORE_SHIPPING");\n\n  ArduinoOTA.onStart([]() { Serial.println("OTA update starting"); });\n  ArduinoOTA.onEnd([]() { Serial.println("OTA update complete"); });\n  ArduinoOTA.onError([](ota_error_t error) { Serial.printf("OTA error [%u]\\n", error); });\n\n  ArduinoOTA.begin();\n  Serial.println("OTA ready");\n}\n\nvoid loop() {\n  ArduinoOTA.handle();\n  // Normal sensor/telemetry work goes here - keep it non-blocking so OTA stays responsive.\n}\n`
  }),
  ...record({
    target: "watchdog-recovery", label: "Watchdog-guarded sensor loop", protocol: "power", filename: "watchdog_example.ino",
    dependencies: [],
    notes: [
      "This is the pattern the other sensor templates' `while (1);` hang-on-error should be replaced with in a fielded device: bounded retries, then a controlled reset instead of a silent hang.",
      "esp_task_wdt reboots the board if loop() doesn't call reset() within the timeout - remove the reset() call temporarily to test that it actually reboots."
    ],
    generate: (params = {}) => {
      const timeoutSeconds = Number.isFinite(params.timeoutSeconds) ? params.timeoutSeconds : 8;
      return `#include <Arduino.h>\n#include <esp_task_wdt.h>\n\nconstexpr int WDT_TIMEOUT_SECONDS = ${timeoutSeconds};\nconstexpr int MAX_INIT_RETRIES = 5;\n\nbool initSensorWithRetries() {\n  for (int attempt = 1; attempt <= MAX_INIT_RETRIES; attempt++) {\n    // TODO: replace with the real sensor .begin() check, e.g. if (bme.begin(0x76)) return true;\n    bool ok = true;\n    if (ok) return true;\n\n    Serial.printf("Sensor init failed (attempt %d/%d), retrying...\\n", attempt, MAX_INIT_RETRIES);\n    delay(500 * attempt); // Back off a little longer each retry\n  }\n  return false;\n}\n\nvoid setup() {\n  Serial.begin(115200);\n\n  esp_task_wdt_config_t wdt_config = {\n    .timeout_ms = WDT_TIMEOUT_SECONDS * 1000,\n    .idle_core_mask = 0,\n    .trigger_panic = true\n  };\n  esp_task_wdt_init(&wdt_config);\n  esp_task_wdt_add(NULL);\n\n  if (!initSensorWithRetries()) {\n    Serial.println("Sensor never came up after retries - rebooting via watchdog instead of hanging forever.");\n    while (true) { delay(10); } // Intentionally do NOT reset the watchdog: it will reboot the board.\n  }\n}\n\nvoid loop() {\n  // TODO: real sensor read goes here.\n  esp_task_wdt_reset(); // Prove to the watchdog this loop iteration is alive.\n  delay(1000);\n}\n`;
    }
  })
]);

function deepSleepEspIdf(sleepSeconds) {
  return `#include <stdio.h>\n#include "esp_sleep.h"\n#include "esp_attr.h"\n\n#define SLEEP_SECONDS ${sleepSeconds}\nRTC_DATA_ATTR static int boot_count = 0;\n\nvoid app_main(void)\n{\n    boot_count++;\n    printf("Boot #%d, awake for a reading\\n", boot_count);\n\n    // TODO: read the sensor and transmit here before going back to sleep.\n\n    esp_sleep_enable_timer_wakeup((uint64_t)SLEEP_SECONDS * 1000000ULL);\n    printf("Sleeping for %d seconds...\\n", SLEEP_SECONDS);\n    esp_deep_sleep_start();\n}\n`;
}
