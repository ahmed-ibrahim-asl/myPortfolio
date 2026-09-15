import { asPin, addrHex, record, espIdfOnly } from "./record-helpers.js";

export const EXPANDED_EMBEDDED_CONFIGURATIONS = Object.freeze([
  ...record({
    target: "bmp280", label: "BMP280 pressure sensor", protocol: "i2c", filename: "bmp280_example.ino",
    dependencies: [{ name: "Adafruit BMP280 Library", version: "^2.6.8" }],
    notes: ["The common I2C addresses are 0x76 and 0x77.", "Use 3.3V logic with ESP32 boards."],
    generate: (params = {}) => {
      const address = params.i2cAddress === "0x77" ? "0x77" : "0x76";
      return `#include <Wire.h>\n#include <Adafruit_BMP280.h>\n\nAdafruit_BMP280 bmp;\n\nvoid setup() {\n  Serial.begin(115200);\n  Wire.begin();\n  if (!bmp.begin(${address})) {\n    Serial.println("BMP280 not found; check wiring and address");\n    while (true) delay(10);\n  }\n}\n\nvoid loop() {\n  Serial.print("Temperature C: "); Serial.println(bmp.readTemperature());\n  Serial.print("Pressure hPa: "); Serial.println(bmp.readPressure() / 100.0F);\n  delay(1000);\n}\n`;
    },
    espidf: {
      dependencies: [{ name: "esp-idf", version: "v5.0+" }],
      notes: ["Uses the standard ESP-IDF i2c master driver.", "Implements the Bosch fixed-point compensation formulas directly - no external component required."],
      generate: (params = {}) => bmeFamilyEspIdf({ address: params.i2cAddress === "0x77" ? 0x77 : 0x76, withHumidity: false })
    }
  }),
  ...record({
    target: "ds18b20", label: "DS18B20 temperature sensor", protocol: "onewire", filename: "ds18b20_example.ino",
    dependencies: [{ name: "DallasTemperature", version: "^3.11.0" }, { name: "OneWire", version: "^2.3.8" }],
    notes: ["Add a 4.7kΩ pull-up from DATA to VCC.", "Several sensors can share one OneWire bus."],
    generate: (params = {}) => {
      const dataPin = asPin(params.dataPin, 4);
      return `#include <OneWire.h>\n#include <DallasTemperature.h>\n\nconstexpr int ONE_WIRE_PIN = ${dataPin};\nOneWire oneWire(ONE_WIRE_PIN);\nDallasTemperature sensors(&oneWire);\n\nvoid setup() {\n  Serial.begin(115200);\n  sensors.begin();\n}\n\nvoid loop() {\n  sensors.requestTemperatures();\n  Serial.print("Temperature C: ");\n  Serial.println(sensors.getTempCByIndex(0));\n  delay(1000);\n}\n`;
    },
    espidf: {
      notes: ["Bit-bangs the OneWire reset/read/write timing directly with esp_rom_delay_us - no RMT or external component required.", "Add a 4.7kΩ pull-up from DATA to VCC."],
      generate: (params = {}) => ds18b20EspIdf(asPin(params.dataPin, 4))
    }
  }),
  ...record({
    target: "bh1750", label: "BH1750 light sensor", protocol: "i2c", filename: "bh1750_example.ino",
    dependencies: [{ name: "BH1750", version: "^1.3.0" }],
    notes: ["Default address is normally 0x23.", "Keep the sensor window clear of shadows from the enclosure."],
    generate: () => `#include <Wire.h>\n#include <BH1750.h>\n\nBH1750 lightMeter;\n\nvoid setup() {\n  Serial.begin(115200);\n  Wire.begin();\n  if (!lightMeter.begin()) {\n    Serial.println("BH1750 not found");\n    while (true) delay(10);\n  }\n}\n\nvoid loop() {\n  Serial.print("Light lx: ");\n  Serial.println(lightMeter.readLightLevel());\n  delay(500);\n}\n`,
    espidf: {
      notes: ["Reads the 2-byte lux result directly over the ESP-IDF i2c master driver - no external component required.", "Default address is 0x23; tie ADDR high for 0x5C."],
      generate: () => bh1750EspIdf()
    }
  }),
  ...record({
    target: "vl53l0x", label: "VL53L0X time-of-flight sensor", protocol: "i2c", filename: "vl53l0x_example.ino",
    dependencies: [{ name: "Adafruit VL53L0X", version: "^1.2.4" }],
    notes: ["The default address is 0x29.", "Use the XSHUT pin when assigning unique addresses to multiple sensors."],
    generate: () => `#include <Wire.h>\n#include <Adafruit_VL53L0X.h>\n\nAdafruit_VL53L0X tof;\n\nvoid setup() {\n  Serial.begin(115200);\n  Wire.begin();\n  if (!tof.begin()) {\n    Serial.println("VL53L0X not found");\n    while (true) delay(10);\n  }\n}\n\nvoid loop() {\n  VL53L0X_RangingMeasurementData_t measure;\n  tof.rangingTest(&measure, false);\n  if (measure.RangeStatus != 4) Serial.println(measure.RangeMilliMeter);\n  else Serial.println("Out of range");\n  delay(200);\n}\n`,
    espidf: {
      dependencies: [{ name: "espressif/vl53l0x", version: "idf-component-manager" }],
      notes: [
        "VL53L0X's power-up/SPAD calibration sequence is proprietary ST init data - it is not safe to hand-reimplement from scratch, so this pulls the maintained component instead of bit-banging registers.",
        "Add it with: idf.py add-dependency \"espressif/vl53l0x^1.0.1\" (or add it under dependencies in idf_component.yml)."
      ],
      generate: () => `#include <stdio.h>\n#include "freertos/FreeRTOS.h"\n#include "freertos/task.h"\n#include "driver/i2c.h"\n#include "vl53l0x_api.h"\n\n#define I2C_MASTER_SCL_IO 22\n#define I2C_MASTER_SDA_IO 21\n#define I2C_MASTER_NUM    I2C_NUM_0\n#define I2C_MASTER_FREQ_HZ 100000\n\nstatic VL53L0X_Dev_t vl53l0x_dev;\n\nstatic void i2c_master_init(void)\n{\n    i2c_config_t conf = {\n        .mode = I2C_MODE_MASTER,\n        .sda_io_num = I2C_MASTER_SDA_IO,\n        .scl_io_num = I2C_MASTER_SCL_IO,\n        .sda_pullup_en = GPIO_PULLUP_ENABLE,\n        .scl_pullup_en = GPIO_PULLUP_ENABLE,\n        .master.clk_speed = I2C_MASTER_FREQ_HZ,\n    };\n    i2c_param_config(I2C_MASTER_NUM, &conf);\n    i2c_driver_install(I2C_MASTER_NUM, conf.mode, 0, 0, 0);\n}\n\nvoid app_main(void)\n{\n    i2c_master_init();\n\n    vl53l0x_dev.I2cDevAddr = 0x29;\n    vl53l0x_dev.i2c_port_num = I2C_MASTER_NUM;\n\n    VL53L0X_Error status = VL53L0X_DataInit(&vl53l0x_dev);\n    status |= VL53L0X_StaticInit(&vl53l0x_dev);\n    status |= VL53L0X_PerformRefSpadManagement(&vl53l0x_dev, NULL, NULL);\n    status |= VL53L0X_PerformRefCalibration(&vl53l0x_dev, NULL, NULL);\n    status |= VL53L0X_SetDeviceMode(&vl53l0x_dev, VL53L0X_DEVICEMODE_SINGLE_RANGING);\n\n    if (status != VL53L0X_ERROR_NONE) {\n        printf("VL53L0X init failed: %d\\n", status);\n        return;\n    }\n\n    while (1) {\n        VL53L0X_RangingMeasurementData_t data;\n        VL53L0X_PerformSingleRangingMeasurement(&vl53l0x_dev, &data);\n        if (data.RangeStatus == 0) {\n            printf("Distance mm: %d\\n", data.RangeMilliMeter);\n        } else {\n            printf("Out of range (status %d)\\n", data.RangeStatus);\n        }\n        vTaskDelay(200 / portTICK_PERIOD_MS);\n    }\n}\n`
    }
  }),
  ...record({
    target: "ads1115", label: "ADS1115 precision ADC", protocol: "i2c", filename: "ads1115_example.ino",
    dependencies: [{ name: "Adafruit ADS1X15", version: "^2.5.0" }],
    notes: ["The default address is 0x48.", "The input must remain inside the configured gain range."],
    generate: () => `#include <Wire.h>\n#include <Adafruit_ADS1X15.h>\n\nAdafruit_ADS1115 ads;\n\nvoid setup() {\n  Serial.begin(115200);\n  if (!ads.begin()) {\n    Serial.println("ADS1115 not found");\n    while (true) delay(10);\n  }\n  ads.setGain(GAIN_ONE);\n}\n\nvoid loop() {\n  int16_t raw = ads.readADC_SingleEnded(0);\n  Serial.print("A0 raw: "); Serial.println(raw);\n  delay(500);\n}\n`,
    espidf: {
      notes: ["Writes the config register and reads back the conversion register directly - no external component required.", "Default address is 0x48 (ADDR tied to GND)."],
      generate: () => ads1115EspIdf()
    }
  }),
  ...record({
    target: "hx711", label: "HX711 load-cell amplifier", protocol: "gpio", filename: "hx711_scale.ino",
    dependencies: [{ name: "HX711 Arduino Library", version: "^0.7.5" }],
    notes: ["Calibrate with a known mass before trusting measurements.", "Keep load-cell wiring away from motors and switching supplies."],
    generate: (params = {}) => {
      const dataPin = asPin(params.dataPin, 19);
      const clockPin = asPin(params.clockPin, 18);
      const calibration = Number.isFinite(params.calibrationFactor) ? params.calibrationFactor : -7050;
      return `#include <HX711.h>\n\nHX711 scale;\nconstexpr int DATA_PIN = ${dataPin};\nconstexpr int CLOCK_PIN = ${clockPin};\n\nvoid setup() {\n  Serial.begin(115200);\n  scale.begin(DATA_PIN, CLOCK_PIN);\n  scale.set_scale(${calibration});\n  scale.tare();\n}\n\nvoid loop() {\n  if (scale.is_ready()) Serial.println(scale.get_units(10));\n  else Serial.println("HX711 not ready");\n  delay(500);\n}\n`;
    },
    espidf: {
      notes: ["Bit-bangs the HX711's 2-wire clock/data protocol directly with gpio + esp_rom_delay_us.", "Calibrate CALIBRATION_FACTOR with a known mass before trusting readings."],
      generate: (params = {}) => hx711EspIdf(asPin(params.dataPin, 19), asPin(params.clockPin, 18), Number.isFinite(params.calibrationFactor) ? params.calibrationFactor : -7050)
    }
  }),
  ...record({
    target: "soil-moisture", label: "Capacitive soil-moisture sensor", protocol: "adc", filename: "soil_moisture.ino",
    notes: ["Calibrate dry and wet readings for the exact sensor and soil.", "Do not feed a voltage above the board ADC limit."],
    generate: (params = {}) => {
      const adcPin = asPin(params.adcPin, 34);
      const dry = asPin(params.dryReading, 3000);
      const wet = asPin(params.wetReading, 1300);
      return `constexpr int SENSOR_PIN = ${adcPin};\nconstexpr int DRY_READING = ${dry};\nconstexpr int WET_READING = ${wet};\n\nvoid setup() {\n  Serial.begin(115200);\n}\n\nvoid loop() {\n  int raw = analogRead(SENSOR_PIN);\n  int percent = constrain(map(raw, DRY_READING, WET_READING, 0, 100), 0, 100);\n  Serial.printf("Moisture: %d%% (raw %d)\\n", percent, raw);\n  delay(1000);\n}\n`;
    },
    espidf: {
      notes: ["Uses the ESP-IDF v5 adc_oneshot driver.", "Calibrate DRY_READING/WET_READING for the exact sensor and soil."],
      generate: (params = {}) => soilMoistureEspIdf(asPin(params.dryReading, 3000), asPin(params.wetReading, 1300))
    }
  }),
  ...record({
    target: "http-client", label: "ESP32 HTTP client", protocol: "http", filename: "http_client.ino",
    notes: ["Replace the Wi-Fi and URL placeholders before uploading.", "Use TLS and certificate validation for production endpoints - see the HTTPS client target for a hardened version."],
    generate: () => `#include <WiFi.h>\n#include <HTTPClient.h>\n\nconst char* WIFI_SSID = "YOUR_WIFI_SSID";\nconst char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";\nconst char* API_URL = "https://example.com/api/telemetry";\n\nvoid setup() {\n  Serial.begin(115200);\n  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);\n  while (WiFi.status() != WL_CONNECTED) delay(250);\n}\n\nvoid loop() {\n  if (WiFi.status() == WL_CONNECTED) {\n    HTTPClient http;\n    http.begin(API_URL);\n    int status = http.GET();\n    Serial.printf("HTTP status: %d\\n", status);\n    if (status > 0) Serial.println(http.getString());\n    http.end();\n  }\n  delay(10000);\n}\n`,
    espidf: {
      notes: ["Uses esp_http_client (ESP-IDF's native HTTP client component).", "Replace the Wi-Fi and URL placeholders before flashing."],
      generate: () => httpClientEspIdf()
    }
  }),
  ...record({
    target: "http-server", label: "ESP32 HTTP server", protocol: "http", filename: "http_server.ino",
    notes: ["Replace the Wi-Fi placeholders before uploading.", "This starter is a local-network example; add authentication before exposing controls."],
    generate: () => `#include <WiFi.h>\n#include <WebServer.h>\n\nconst char* WIFI_SSID = "YOUR_WIFI_SSID";\nconst char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";\nWebServer server(80);\n\nvoid setup() {\n  Serial.begin(115200);\n  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);\n  while (WiFi.status() != WL_CONNECTED) delay(250);\n  server.on("/", []() { server.send(200, "application/json", "{\\"status\\":\\"ok\\"}"); });\n  server.begin();\n}\n\nvoid loop() {\n  server.handleClient();\n}\n`,
    espidf: {
      notes: ["Uses esp_http_server (ESP-IDF's native HTTP server component).", "This starter is a local-network example; add authentication before exposing controls."],
      generate: () => httpServerEspIdf()
    }
  }),
  ...record({
    target: "mqtt-publisher", label: "MQTT publisher", protocol: "mqtt", filename: "mqtt_publisher.ino",
    dependencies: [{ name: "PubSubClient", version: "^2.8" }],
    notes: ["Replace broker and Wi-Fi placeholders.", "Use a unique client ID and authenticated TLS broker in production - see the MQTTS target for a TLS version."],
    generate: () => mqttCode("publish"),
    espidf: {
      dependencies: [{ name: "esp-idf", version: "v5.0+, includes esp-mqtt" }],
      notes: ["Uses esp-mqtt (bundled with ESP-IDF).", "Replace broker and Wi-Fi placeholders before flashing."],
      generate: () => mqttEspIdf("publish")
    }
  }),
  ...record({
    target: "mqtt-subscriber", label: "MQTT subscriber", protocol: "mqtt", filename: "mqtt_subscriber.ino",
    dependencies: [{ name: "PubSubClient", version: "^2.8" }],
    notes: ["Replace broker and Wi-Fi placeholders.", "Treat incoming payloads as untrusted input before controlling hardware."],
    generate: () => mqttCode("subscribe"),
    espidf: {
      dependencies: [{ name: "esp-idf", version: "v5.0+, includes esp-mqtt" }],
      notes: ["Uses esp-mqtt (bundled with ESP-IDF).", "Treat incoming payloads as untrusted input before controlling hardware."],
      generate: () => mqttEspIdf("subscribe")
    }
  }),
  ...record({
    target: "ble-server", label: "BLE GATT server", protocol: "ble", filename: "ble_server.ino",
    dependencies: [{ name: "NimBLE-Arduino", version: "^2.3.7" }],
    notes: ["Use your own service and characteristic UUIDs for a product.", "Advertising consumes power; tune the interval for battery devices."],
    generate: () => `#include <NimBLEDevice.h>\n\n#define SERVICE_UUID "12345678-1234-1234-1234-1234567890ab"\n#define CHARACTERISTIC_UUID "12345678-1234-1234-1234-1234567890ac"\n\nvoid setup() {\n  NimBLEDevice::init("ESP32 Sensor");\n  NimBLEServer* server = NimBLEDevice::createServer();\n  NimBLEService* service = server->createService(SERVICE_UUID);\n  NimBLECharacteristic* value = service->createCharacteristic(CHARACTERISTIC_UUID, NIMBLE_PROPERTY::READ | NIMBLE_PROPERTY::NOTIFY);\n  value->setValue("ready");\n  service->start();\n  NimBLEDevice::getAdvertising()->addServiceUUID(SERVICE_UUID);\n  NimBLEDevice::startAdvertising();\n}\n\nvoid loop() { delay(1000); }\n`,
    espidf: {
      dependencies: [{ name: "esp-idf", version: "v5.0+, Bluedroid enabled" }],
      notes: ["Uses ESP-IDF's native Bluedroid GATT server API - considerably more verbose than NimBLE-Arduino; keep the Arduino/PlatformIO variant unless the project already commits to raw ESP-IDF BLE.", "Use your own 128-bit UUIDs for a real product."],
      generate: () => bleServerEspIdf()
    }
  }),
  ...record({
    target: "ble-client", label: "BLE GATT client", protocol: "ble", filename: "ble_client.ino",
    dependencies: [{ name: "NimBLE-Arduino", version: "^2.3.7" }],
    notes: ["Replace the service UUID with the peripheral's UUID.", "Scanning continuously consumes significant power."],
    generate: () => `#include <NimBLEDevice.h>\n\n#define SERVICE_UUID "12345678-1234-1234-1234-1234567890ab"\n\nvoid setup() {\n  Serial.begin(115200);\n  NimBLEDevice::init("");\n  NimBLEScan* scan = NimBLEDevice::getScan();\n  scan->setActiveScan(true);\n  NimBLEScanResults results = scan->getResults(5 * 1000);\n  Serial.printf("Found %d BLE devices\\n", results.getCount());\n}\n\nvoid loop() { delay(5000); }\n`
  }),
  ...record({
    target: "i2c-scanner", label: "I2C bus scanner", protocol: "i2c", filename: "i2c_scanner.ino",
    notes: ["Default ESP32 pins are SDA 21 and SCL 22 on many boards.", "A discovered address identifies a device, not its exact model."],
    generate: () => `#include <Wire.h>\n\nvoid setup() {\n  Serial.begin(115200);\n  Wire.begin();\n}\n\nvoid loop() {\n  int found = 0;\n  for (uint8_t address = 1; address < 127; address++) {\n    Wire.beginTransmission(address);\n    if (Wire.endTransmission() == 0) {\n      Serial.printf("Found I2C device at 0x%02X\\n", address);\n      found++;\n    }\n  }\n  if (!found) Serial.println("No I2C devices found");\n  delay(5000);\n}\n`,
    espidf: {
      notes: ["Default ESP32 pins are SDA 21 and SCL 22 on many boards.", "A discovered address identifies a device, not its exact model."],
      generate: () => i2cScannerEspIdf()
    }
  }),
  ...record({
    target: "spi-transfer", label: "SPI full-duplex transfer", protocol: "spi", filename: "spi_transfer.ino",
    notes: ["Confirm SCK, MOSI, MISO, and CS pins for your board.", "Match SPI mode and clock limit to the peripheral datasheet."],
    generate: (params = {}) => {
      const csPin = asPin(params.csPin, 5);
      return `#include <SPI.h>\n\nconstexpr int CS_PIN = ${csPin};\n\nvoid setup() {\n  Serial.begin(115200);\n  pinMode(CS_PIN, OUTPUT);\n  digitalWrite(CS_PIN, HIGH);\n  SPI.begin();\n}\n\nvoid loop() {\n  SPI.beginTransaction(SPISettings(1000000, MSBFIRST, SPI_MODE0));\n  digitalWrite(CS_PIN, LOW);\n  uint8_t response = SPI.transfer(0x00);\n  digitalWrite(CS_PIN, HIGH);\n  SPI.endTransaction();\n  Serial.printf("SPI response: 0x%02X\\n", response);\n  delay(1000);\n}\n`;
    },
    espidf: {
      notes: ["Uses the ESP-IDF spi_master driver.", "Confirm SCK, MOSI, MISO, and CS pins for your board."],
      generate: (params = {}) => spiTransferEspIdf(asPin(params.csPin, 5))
    }
  }),

  // The remaining original sensors already have hand-written, tested Arduino/PlatformIO pairs in
  // sensor-templates.js - these add just the missing ESP-IDF sibling for each, closing the
  // framework-parity gap without touching that tested code.
  espIdfOnly({
    target: "mpu6050", label: "MPU6050 accelerometer/gyro", protocol: "i2c",
    dependencies: [{ name: "esp-idf", version: "v5.0+" }],
    notes: ["Wakes the sensor from sleep and reads the raw accelerometer registers directly - no external component required.", "I2C address is usually 0x68 (AD0 low); tie AD0 high for 0x69."],
    generate: (params = {}) => mpu6050EspIdf(params.i2cAddress === "0x69" ? 0x69 : 0x68)
  }),
  espIdfOnly({
    target: "hcsr04", label: "HC-SR04 ultrasonic distance", protocol: "gpio",
    notes: ["Times the echo pulse with esp_timer_get_time() instead of Arduino's pulseIn().", "5V logic on the echo pin requires a voltage divider on 3.3V boards."],
    generate: (params = {}) => hcsr04EspIdf(asPin(params.trigPin, 5), asPin(params.echoPin, 18))
  }),
  espIdfOnly({
    target: "dht11", label: "DHT11 temperature/humidity", protocol: "gpio",
    notes: ["Bit-bangs the DHT single-wire protocol directly with esp_rom_delay_us - no external component required.", "DHT11 needs roughly 1s between reads."],
    generate: (params = {}) => dhtEspIdf(asPin(params.dataPin, 4), false)
  }),
  espIdfOnly({
    target: "dht22", label: "DHT22 temperature/humidity", protocol: "gpio",
    notes: ["Bit-bangs the DHT single-wire protocol directly with esp_rom_delay_us - no external component required.", "DHT22 needs roughly 2s between reads but reports one decimal place of precision."],
    generate: (params = {}) => dhtEspIdf(asPin(params.dataPin, 4), true)
  }),
  espIdfOnly({
    target: "mq2", label: "MQ-2 smoke/gas sensor", protocol: "adc",
    notes: ["MQ sensors need a preheat/burn-in period (up to 24-48h) before readings are meaningful.", "The heater draws significant current - do not power it directly from a GPIO pin."],
    generate: () => mq2EspIdf()
  }),
  espIdfOnly({
    target: "pir", label: "HC-SR501 PIR motion sensor", protocol: "gpio",
    notes: ["Sensor needs roughly 60 seconds after power-on to stabilize.", "Sensitivity and hold time are set with the onboard potentiometers, not in code."],
    generate: (params = {}) => pirEspIdf(asPin(params.pirPin, 13))
  }),
  espIdfOnly({
    target: "irsensor", label: "IR obstacle sensor", protocol: "gpio",
    notes: ["Generic digital IR obstacle avoidance sensor.", "Returns LOW when obstacle is detected (active low)."],
    generate: () => `#include <stdio.h>\n#include "freertos/FreeRTOS.h"\n#include "freertos/task.h"\n#include "driver/gpio.h"\n\n#define IR_PIN 4\n\nvoid app_main(void)\n{\n    gpio_reset_pin(IR_PIN);\n    gpio_set_direction(IR_PIN, GPIO_MODE_INPUT);\n    gpio_set_pull_mode(IR_PIN, GPIO_PULLUP_ENABLE);\n\n    while (1) {\n        int state = gpio_get_level(IR_PIN);\n        if (state == 0) {\n            printf("Obstacle Detected!\\n");\n        } else {\n            printf("Path Clear\\n");\n        }\n        vTaskDelay(200 / portTICK_PERIOD_MS);\n    }\n}\n`
  })
]);

function mqttCode(mode) {
  const action = mode === "publish"
    ? `client.publish("workbench/telemetry", "{\\"temperature\\":24.5}");`
    : `client.subscribe("workbench/commands");`;
  return `#include <WiFi.h>\n#include <PubSubClient.h>\n\nconst char* WIFI_SSID = "YOUR_WIFI_SSID";\nconst char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";\nconst char* MQTT_BROKER = "YOUR_MQTT_BROKER";\nWiFiClient network;\nPubSubClient client(network);\n\nvoid connectMqtt() {\n  while (!client.connected()) {\n    if (client.connect("esp32-workbench")) { ${action} }\n    else delay(1000);\n  }\n}\n\nvoid setup() {\n  Serial.begin(115200);\n  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);\n  while (WiFi.status() != WL_CONNECTED) delay(250);\n  client.setServer(MQTT_BROKER, 1883);\n}\n\nvoid loop() {\n  if (!client.connected()) connectMqtt();\n  client.loop();\n  ${mode === "publish" ? "static unsigned long last = 0; if (millis() - last > 5000) { client.publish(\"workbench/telemetry\", \"online\"); last = millis(); }" : "delay(10);"}\n}\n`;
}

// ---------------------------------------------------------------------------------------------
// ESP-IDF implementations. Written against the native driver/component APIs rather than porting
// Arduino libraries line-for-line, since that's what "ESP-IDF" as a framework choice actually
// means in practice. Register-level sensors (I2C/SPI/ADC/OneWire/bit-bang) are implemented in
// full; the two sensors whose ESP-IDF story genuinely requires a maintained external component
// (VL53L0X's ST calibration sequence) are noted as such above rather than faked.
// ---------------------------------------------------------------------------------------------

function bmeFamilyEspIdf({ address, withHumidity }) {
  const humidityRead = withHumidity ? `
    uint8_t hum_raw[2];
    read_regs(0xFD, hum_raw, 2);
    int32_t adc_H = (hum_raw[0] << 8) | hum_raw[1];
    double var_h = (t_fine - 76800.0);
    var_h = (adc_H - (dig_H4 * 64.0 + dig_H5 / 16384.0 * var_h)) *
            (dig_H2 / 65536.0 * (1.0 + dig_H6 / 67108864.0 * var_h *
            (1.0 + dig_H3 / 67108864.0 * var_h)));
    var_h = var_h * (1.0 - dig_H1 * var_h / 524288.0);
    if (var_h > 100.0) var_h = 100.0;
    if (var_h < 0.0) var_h = 0.0;
    printf("Humidity %%: %.2f\\n", var_h);` : "";

  const humidityCalibRead = withHumidity ? `
    uint8_t h1; read_regs(0xA1, &h1, 1); dig_H1 = h1;
    uint8_t h2_6[7]; read_regs(0xE1, h2_6, 7);
    dig_H2 = (int16_t)((h2_6[1] << 8) | h2_6[0]);
    dig_H3 = h2_6[2];
    dig_H4 = (int16_t)((h2_6[3] << 4) | (h2_6[4] & 0x0F));
    dig_H5 = (int16_t)((h2_6[5] << 4) | (h2_6[4] >> 4));
    dig_H6 = (int8_t)h2_6[6];` : "";

  const humidityVars = withHumidity ? `\n    static double dig_H2, dig_H4, dig_H5;\n    static uint8_t dig_H1;\n    static uint8_t dig_H3;\n    static int8_t dig_H6;` : "";
  const ctrlHum = withHumidity ? `\n    uint8_t hum_cfg[2] = { 0xF2, 0x01 };\n    i2c_master_write_to_device(I2C_MASTER_NUM, ${addrHex(address)}, hum_cfg, 2, pdMS_TO_TICKS(100));` : "";

  return `#include <stdio.h>\n#include "freertos/FreeRTOS.h"\n#include "freertos/task.h"\n#include "driver/i2c.h"\n\n#define I2C_MASTER_SCL_IO 22\n#define I2C_MASTER_SDA_IO 21\n#define I2C_MASTER_NUM    I2C_NUM_0\n#define I2C_MASTER_FREQ_HZ 100000\n#define SENSOR_ADDR ${addrHex(address)}\n\nstatic void i2c_master_init(void)\n{\n    i2c_config_t conf = {\n        .mode = I2C_MODE_MASTER,\n        .sda_io_num = I2C_MASTER_SDA_IO,\n        .scl_io_num = I2C_MASTER_SCL_IO,\n        .sda_pullup_en = GPIO_PULLUP_ENABLE,\n        .scl_pullup_en = GPIO_PULLUP_ENABLE,\n        .master.clk_speed = I2C_MASTER_FREQ_HZ,\n    };\n    i2c_param_config(I2C_MASTER_NUM, &conf);\n    i2c_driver_install(I2C_MASTER_NUM, conf.mode, 0, 0, 0);\n}\n\nstatic esp_err_t read_regs(uint8_t reg, uint8_t *data, size_t len)\n{\n    return i2c_master_write_read_device(I2C_MASTER_NUM, SENSOR_ADDR, &reg, 1, data, len, pdMS_TO_TICKS(100));\n}\n\nvoid app_main(void)\n{\n    i2c_master_init();\n\n    uint8_t chip_id = 0;\n    if (read_regs(0xD0, &chip_id, 1) != ESP_OK) {\n        printf("Sensor not found at 0x%02X\\n", SENSOR_ADDR);\n        return;\n    }\n    printf("Chip ID: 0x%02X\\n", chip_id);\n\n    // Bosch compensation coefficients, T1-P9 (and H1-H6 when humidity is present).\n    uint8_t calib[24];\n    read_regs(0x88, calib, 24);\n    uint16_t dig_T1 = (calib[1] << 8) | calib[0];\n    int16_t  dig_T2 = (calib[3] << 8) | calib[2];\n    int16_t  dig_T3 = (calib[5] << 8) | calib[4];\n    uint16_t dig_P1 = (calib[7] << 8) | calib[6];\n    int16_t  dig_P2 = (calib[9] << 8) | calib[8];\n    int16_t  dig_P3 = (calib[11] << 8) | calib[10];\n    int16_t  dig_P4 = (calib[13] << 8) | calib[12];\n    int16_t  dig_P5 = (calib[15] << 8) | calib[14];\n    int16_t  dig_P6 = (calib[17] << 8) | calib[16];\n    int16_t  dig_P7 = (calib[19] << 8) | calib[18];\n    int16_t  dig_P8 = (calib[21] << 8) | calib[20];\n    int16_t  dig_P9 = (calib[23] << 8) | calib[22];${humidityVars}
${humidityCalibRead}

    // Normal mode, 16x oversampling on temperature and pressure.${ctrlHum}
    uint8_t ctrl_meas[2] = { 0xF4, 0xB7 };
    i2c_master_write_to_device(I2C_MASTER_NUM, SENSOR_ADDR, ctrl_meas, 2, pdMS_TO_TICKS(100));

    while (1) {
        uint8_t raw[6];
        read_regs(0xF7, raw, 6);
        int32_t adc_P = (raw[0] << 12) | (raw[1] << 4) | (raw[2] >> 4);
        int32_t adc_T = (raw[3] << 12) | (raw[4] << 4) | (raw[5] >> 4);

        double var1 = (adc_T / 16384.0 - dig_T1 / 1024.0) * dig_T2;
        double var2 = ((adc_T / 131072.0 - dig_T1 / 8192.0) * (adc_T / 131072.0 - dig_T1 / 8192.0)) * dig_T3;
        double t_fine = var1 + var2;
        double temperature = t_fine / 5120.0;

        double pvar1 = t_fine / 2.0 - 64000.0;
        double pvar2 = pvar1 * pvar1 * dig_P6 / 32768.0;
        pvar2 = pvar2 + pvar1 * dig_P5 * 2.0;
        pvar2 = pvar2 / 4.0 + dig_P4 * 65536.0;
        pvar1 = (dig_P3 * pvar1 * pvar1 / 524288.0 + dig_P2 * pvar1) / 524288.0;
        pvar1 = (1.0 + pvar1 / 32768.0) * dig_P1;
        double pressure = 0;
        if (pvar1 != 0.0) {
            pressure = 1048576.0 - adc_P;
            pressure = (pressure - pvar2 / 4096.0) * 6250.0 / pvar1;
            pvar1 = dig_P9 * pressure * pressure / 2147483648.0;
            pvar2 = pressure * dig_P8 / 32768.0;
            pressure = pressure + (pvar1 + pvar2 + dig_P7) / 16.0;
        }

        printf("Temperature C: %.2f\\n", temperature);
        printf("Pressure hPa: %.2f\\n", pressure / 100.0);${humidityRead}

        vTaskDelay(2000 / portTICK_PERIOD_MS);
    }
}
`;
}

// Exported so sensor-templates.js's BME280 ESP-IDF entries (hand-written alongside its tested
// Arduino/PlatformIO code) can reuse the same real compensation implementation instead of the
// "// BME280 read logic" placeholder they shipped with.
export { bmeFamilyEspIdf };

function ds18b20EspIdf(dataPin) {
  return `#include <stdio.h>\n#include "freertos/FreeRTOS.h"\n#include "freertos/task.h"\n#include "driver/gpio.h"\n#include "rom/ets_sys.h"\n\n#define ONE_WIRE_PIN ${dataPin}\n\nstatic void ow_write_bit(int bit)\n{\n    gpio_set_direction(ONE_WIRE_PIN, GPIO_MODE_OUTPUT);\n    gpio_set_level(ONE_WIRE_PIN, 0);\n    ets_delay_us(bit ? 6 : 60);\n    gpio_set_level(ONE_WIRE_PIN, 1);\n    ets_delay_us(bit ? 64 : 10);\n}\n\nstatic int ow_read_bit(void)\n{\n    gpio_set_direction(ONE_WIRE_PIN, GPIO_MODE_OUTPUT);\n    gpio_set_level(ONE_WIRE_PIN, 0);\n    ets_delay_us(3);\n    gpio_set_direction(ONE_WIRE_PIN, GPIO_MODE_INPUT);\n    ets_delay_us(10);\n    int bit = gpio_get_level(ONE_WIRE_PIN);\n    ets_delay_us(53);\n    return bit;\n}\n\nstatic int ow_reset(void)\n{\n    gpio_set_direction(ONE_WIRE_PIN, GPIO_MODE_OUTPUT);\n    gpio_set_level(ONE_WIRE_PIN, 0);\n    ets_delay_us(480);\n    gpio_set_direction(ONE_WIRE_PIN, GPIO_MODE_INPUT);\n    ets_delay_us(70);\n    int presence = !gpio_get_level(ONE_WIRE_PIN);\n    ets_delay_us(410);\n    return presence;\n}\n\nstatic void ow_write_byte(uint8_t byte)\n{\n    for (int i = 0; i < 8; i++) { ow_write_bit(byte & 0x01); byte >>= 1; }\n}\n\nstatic uint8_t ow_read_byte(void)\n{\n    uint8_t byte = 0;\n    for (int i = 0; i < 8; i++) byte |= (ow_read_bit() << i);\n    return byte;\n}\n\nvoid app_main(void)\n{\n    gpio_reset_pin(ONE_WIRE_PIN);\n\n    while (1) {\n        if (!ow_reset()) {\n            printf("DS18B20 not responding - check the pull-up and wiring\\n");\n            vTaskDelay(1000 / portTICK_PERIOD_MS);\n            continue;\n        }\n        ow_write_byte(0xCC); // Skip ROM (single-device bus)\n        ow_write_byte(0x44); // Convert T\n        vTaskDelay(750 / portTICK_PERIOD_MS); // 12-bit conversion time\n\n        ow_reset();\n        ow_write_byte(0xCC);\n        ow_write_byte(0xBE); // Read scratchpad\n        uint8_t lsb = ow_read_byte();\n        uint8_t msb = ow_read_byte();\n        int16_t raw = (msb << 8) | lsb;\n        printf("Temperature C: %.2f\\n", raw / 16.0);\n\n        vTaskDelay(1000 / portTICK_PERIOD_MS);\n    }\n}\n`;
}

function bh1750EspIdf() {
  return `#include <stdio.h>\n#include "freertos/FreeRTOS.h"\n#include "freertos/task.h"\n#include "driver/i2c.h"\n\n#define I2C_MASTER_SCL_IO 22\n#define I2C_MASTER_SDA_IO 21\n#define I2C_MASTER_NUM    I2C_NUM_0\n#define I2C_MASTER_FREQ_HZ 100000\n#define BH1750_ADDR 0x23\n#define BH1750_CONT_HIGH_RES_MODE 0x10\n\nstatic void i2c_master_init(void)\n{\n    i2c_config_t conf = {\n        .mode = I2C_MODE_MASTER,\n        .sda_io_num = I2C_MASTER_SDA_IO,\n        .scl_io_num = I2C_MASTER_SCL_IO,\n        .sda_pullup_en = GPIO_PULLUP_ENABLE,\n        .scl_pullup_en = GPIO_PULLUP_ENABLE,\n        .master.clk_speed = I2C_MASTER_FREQ_HZ,\n    };\n    i2c_param_config(I2C_MASTER_NUM, &conf);\n    i2c_driver_install(I2C_MASTER_NUM, conf.mode, 0, 0, 0);\n}\n\nvoid app_main(void)\n{\n    i2c_master_init();\n\n    uint8_t mode = BH1750_CONT_HIGH_RES_MODE;\n    if (i2c_master_write_to_device(I2C_MASTER_NUM, BH1750_ADDR, &mode, 1, pdMS_TO_TICKS(100)) != ESP_OK) {\n        printf("BH1750 not found at 0x%02X\\n", BH1750_ADDR);\n        return;\n    }\n\n    while (1) {\n        vTaskDelay(180 / portTICK_PERIOD_MS); // High-res measurement time\n        uint8_t raw[2];\n        if (i2c_master_read_from_device(I2C_MASTER_NUM, BH1750_ADDR, raw, 2, pdMS_TO_TICKS(100)) == ESP_OK) {\n            float lux = ((raw[0] << 8) | raw[1]) / 1.2f;\n            printf("Light lx: %.1f\\n", lux);\n        }\n        vTaskDelay(320 / portTICK_PERIOD_MS);\n    }\n}\n`;
}

function ads1115EspIdf() {
  return `#include <stdio.h>\n#include "freertos/FreeRTOS.h"\n#include "freertos/task.h"\n#include "driver/i2c.h"\n\n#define I2C_MASTER_SCL_IO 22\n#define I2C_MASTER_SDA_IO 21\n#define I2C_MASTER_NUM    I2C_NUM_0\n#define I2C_MASTER_FREQ_HZ 100000\n#define ADS1115_ADDR 0x48\n#define ADS1115_REG_CONVERSION 0x00\n#define ADS1115_REG_CONFIG     0x01\n\nstatic void i2c_master_init(void)\n{\n    i2c_config_t conf = {\n        .mode = I2C_MODE_MASTER,\n        .sda_io_num = I2C_MASTER_SDA_IO,\n        .scl_io_num = I2C_MASTER_SCL_IO,\n        .sda_pullup_en = GPIO_PULLUP_ENABLE,\n        .scl_pullup_en = GPIO_PULLUP_ENABLE,\n        .master.clk_speed = I2C_MASTER_FREQ_HZ,\n    };\n    i2c_param_config(I2C_MASTER_NUM, &conf);\n    i2c_driver_install(I2C_MASTER_NUM, conf.mode, 0, 0, 0);\n}\n\nvoid app_main(void)\n{\n    i2c_master_init();\n\n    while (1) {\n        // Single-shot, AIN0 vs GND, +-4.096V gain (GAIN_ONE), 128 SPS, start conversion.\n        uint8_t config[3] = { ADS1115_REG_CONFIG, 0xC3, 0x83 };\n        if (i2c_master_write_to_device(I2C_MASTER_NUM, ADS1115_ADDR, config, 3, pdMS_TO_TICKS(100)) != ESP_OK) {\n            printf("ADS1115 not found at 0x%02X\\n", ADS1115_ADDR);\n            vTaskDelay(1000 / portTICK_PERIOD_MS);\n            continue;\n        }\n        vTaskDelay(10 / portTICK_PERIOD_MS); // Conversion time at 128 SPS\n\n        uint8_t reg = ADS1115_REG_CONVERSION;\n        uint8_t raw[2];\n        i2c_master_write_read_device(I2C_MASTER_NUM, ADS1115_ADDR, &reg, 1, raw, 2, pdMS_TO_TICKS(100));\n        int16_t value = (raw[0] << 8) | raw[1];\n        printf("A0 raw: %d\\n", value);\n\n        vTaskDelay(500 / portTICK_PERIOD_MS);\n    }\n}\n`;
}

function hx711EspIdf(dataPin, clockPin, calibration) {
  return `#include <stdio.h>\n#include "freertos/FreeRTOS.h"\n#include "freertos/task.h"\n#include "driver/gpio.h"\n#include "rom/ets_sys.h"\n\n#define DATA_PIN ${dataPin}\n#define CLOCK_PIN ${clockPin}\nstatic const float CALIBRATION_FACTOR = ${calibration};\n\nstatic int32_t hx711_read_raw(void)\n{\n    while (gpio_get_level(DATA_PIN) == 1) { ets_delay_us(10); } // Wait for ready (DATA goes low)\n\n    int32_t value = 0;\n    for (int i = 0; i < 24; i++) {\n        gpio_set_level(CLOCK_PIN, 1);\n        ets_delay_us(1);\n        value = (value << 1) | gpio_get_level(DATA_PIN);\n        gpio_set_level(CLOCK_PIN, 0);\n        ets_delay_us(1);\n    }\n    // 25th pulse selects channel A, gain 128 for the next conversion.\n    gpio_set_level(CLOCK_PIN, 1);\n    ets_delay_us(1);\n    gpio_set_level(CLOCK_PIN, 0);\n\n    if (value & 0x800000) value |= 0xFF000000; // sign-extend 24-bit to 32-bit\n    return value;\n}\n\nvoid app_main(void)\n{\n    gpio_reset_pin(DATA_PIN);\n    gpio_reset_pin(CLOCK_PIN);\n    gpio_set_direction(DATA_PIN, GPIO_MODE_INPUT);\n    gpio_set_direction(CLOCK_PIN, GPIO_MODE_OUTPUT);\n    gpio_set_level(CLOCK_PIN, 0);\n\n    int32_t tare = hx711_read_raw();\n\n    while (1) {\n        int32_t raw = hx711_read_raw() - tare;\n        printf("Units: %.2f\\n", raw / CALIBRATION_FACTOR);\n        vTaskDelay(500 / portTICK_PERIOD_MS);\n    }\n}\n`;
}

function soilMoistureEspIdf(dry, wet) {
  return `#include <stdio.h>\n#include "freertos/FreeRTOS.h"\n#include "freertos/task.h"\n#include "esp_adc/adc_oneshot.h"\n\n#define DRY_READING ${dry}\n#define WET_READING ${wet}\n\nstatic int clamp_percent(int value)\n{\n    if (value < 0) return 0;\n    if (value > 100) return 100;\n    return value;\n}\n\nvoid app_main(void)\n{\n    adc_oneshot_unit_handle_t adc_handle;\n    adc_oneshot_unit_init_cfg_t unit_cfg = { .unit_id = ADC_UNIT_1 };\n    adc_oneshot_new_unit(&unit_cfg, &adc_handle);\n\n    adc_oneshot_chan_cfg_t chan_cfg = { .atten = ADC_ATTEN_DB_12, .bitwidth = ADC_BITWIDTH_DEFAULT };\n    adc_oneshot_config_channel(adc_handle, ADC_CHANNEL_6, &chan_cfg); // GPIO34 on most ESP32 dev boards\n\n    while (1) {\n        int raw = 0;\n        adc_oneshot_read(adc_handle, ADC_CHANNEL_6, &raw);\n        int percent = clamp_percent((int)((raw - DRY_READING) * 100.0f / (WET_READING - DRY_READING)));\n        printf("Moisture: %d%% (raw %d)\\n", percent, raw);\n        vTaskDelay(1000 / portTICK_PERIOD_MS);\n    }\n}\n`;
}

function httpClientEspIdf() {
  return `#include <string.h>\n#include "esp_event.h"\n#include "esp_http_client.h"\n#include "esp_log.h"\n#include "esp_wifi.h"\n#include "freertos/FreeRTOS.h"\n#include "freertos/task.h"\n#include "nvs_flash.h"\n\n#define WIFI_SSID "YOUR_WIFI_SSID"\n#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"\n#define API_URL "https://example.com/api/telemetry"\nstatic const char *TAG = "http_client";\n\nstatic esp_err_t http_event_handler(esp_http_client_event_t *evt)\n{\n    if (evt->event_id == HTTP_EVENT_ON_DATA) {\n        ESP_LOGI(TAG, "Received %d bytes", evt->data_len);\n    }\n    return ESP_OK;\n}\n\nstatic void wifi_init(void)\n{\n    ESP_ERROR_CHECK(nvs_flash_init());\n    ESP_ERROR_CHECK(esp_netif_init());\n    ESP_ERROR_CHECK(esp_event_loop_create_default());\n    esp_netif_create_default_wifi_sta();\n\n    wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();\n    ESP_ERROR_CHECK(esp_wifi_init(&cfg));\n\n    wifi_config_t wifi_config = { .sta = { .ssid = WIFI_SSID, .password = WIFI_PASSWORD } };\n    ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA));\n    ESP_ERROR_CHECK(esp_wifi_set_config(WIFI_IF_STA, &wifi_config));\n    ESP_ERROR_CHECK(esp_wifi_start());\n    ESP_ERROR_CHECK(esp_wifi_connect());\n}\n\nstatic void http_task(void *pv)\n{\n    while (1) {\n        esp_http_client_config_t config = { .url = API_URL, .event_handler = http_event_handler };\n        esp_http_client_handle_t client = esp_http_client_init(&config);\n        esp_err_t err = esp_http_client_perform(client);\n        if (err == ESP_OK) {\n            ESP_LOGI(TAG, "HTTP status: %d", esp_http_client_get_status_code(client));\n        } else {\n            ESP_LOGE(TAG, "HTTP request failed: %s", esp_err_to_name(err));\n        }\n        esp_http_client_cleanup(client);\n        vTaskDelay(10000 / portTICK_PERIOD_MS);\n    }\n}\n\nvoid app_main(void)\n{\n    wifi_init();\n    xTaskCreate(http_task, "http_task", 8192, NULL, 5, NULL);\n}\n`;
}

function httpServerEspIdf() {
  return `#include "esp_http_server.h"\n#include "esp_wifi.h"\n#include "esp_event.h"\n#include "esp_log.h"\n#include "nvs_flash.h"\n\n#define WIFI_SSID "YOUR_WIFI_SSID"\n#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"\nstatic const char *TAG = "http_server";\n\nstatic esp_err_t status_get_handler(httpd_req_t *req)\n{\n    const char resp[] = "{\\"status\\":\\"ok\\"}";\n    httpd_resp_set_type(req, "application/json");\n    return httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);\n}\n\nstatic const httpd_uri_t status_uri = {\n    .uri = "/", .method = HTTP_GET, .handler = status_get_handler\n};\n\nstatic void wifi_init(void)\n{\n    ESP_ERROR_CHECK(nvs_flash_init());\n    ESP_ERROR_CHECK(esp_netif_init());\n    ESP_ERROR_CHECK(esp_event_loop_create_default());\n    esp_netif_create_default_wifi_sta();\n\n    wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();\n    ESP_ERROR_CHECK(esp_wifi_init(&cfg));\n\n    wifi_config_t wifi_config = { .sta = { .ssid = WIFI_SSID, .password = WIFI_PASSWORD } };\n    ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA));\n    ESP_ERROR_CHECK(esp_wifi_set_config(WIFI_IF_STA, &wifi_config));\n    ESP_ERROR_CHECK(esp_wifi_start());\n    ESP_ERROR_CHECK(esp_wifi_connect());\n}\n\nvoid app_main(void)\n{\n    wifi_init();\n\n    httpd_handle_t server = NULL;\n    httpd_config_t config = HTTPD_DEFAULT_CONFIG();\n    if (httpd_start(&server, &config) == ESP_OK) {\n        httpd_register_uri_handler(server, &status_uri);\n        ESP_LOGI(TAG, "Server started");\n    }\n}\n`;
}

function mqttEspIdf(mode) {
  const action = mode === "publish"
    ? `esp_mqtt_client_publish(client, "workbench/telemetry", "{\\"temperature\\":24.5}", 0, 1, 0);`
    : `esp_mqtt_client_subscribe(client, "workbench/commands", 1);`;
  return `#include "esp_event.h"\n#include "esp_log.h"\n#include "esp_wifi.h"\n#include "mqtt_client.h"\n#include "nvs_flash.h"\n\n#define WIFI_SSID "YOUR_WIFI_SSID"\n#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"\n#define MQTT_BROKER_URI "mqtt://YOUR_MQTT_BROKER:1883"\nstatic const char *TAG = "mqtt_${mode}";\n\nstatic void mqtt_event_handler(void *handler_args, esp_event_base_t base, int32_t event_id, void *event_data)\n{\n    esp_mqtt_event_handle_t event = (esp_mqtt_event_handle_t)event_data;\n    esp_mqtt_client_handle_t client = event->client;\n\n    switch ((esp_mqtt_event_id_t)event_id) {\n    case MQTT_EVENT_CONNECTED:\n        ESP_LOGI(TAG, "MQTT connected");\n        ${action}\n        break;\n    case MQTT_EVENT_DATA:\n        ESP_LOGI(TAG, "Received on %.*s: %.*s", event->topic_len, event->topic, event->data_len, event->data);\n        break;\n    default:\n        break;\n    }\n}\n\nstatic void wifi_init(void)\n{\n    ESP_ERROR_CHECK(nvs_flash_init());\n    ESP_ERROR_CHECK(esp_netif_init());\n    ESP_ERROR_CHECK(esp_event_loop_create_default());\n    esp_netif_create_default_wifi_sta();\n\n    wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();\n    ESP_ERROR_CHECK(esp_wifi_init(&cfg));\n\n    wifi_config_t wifi_config = { .sta = { .ssid = WIFI_SSID, .password = WIFI_PASSWORD } };\n    ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA));\n    ESP_ERROR_CHECK(esp_wifi_set_config(WIFI_IF_STA, &wifi_config));\n    ESP_ERROR_CHECK(esp_wifi_start());\n    ESP_ERROR_CHECK(esp_wifi_connect());\n}\n\nvoid app_main(void)\n{\n    wifi_init();\n\n    esp_mqtt_client_config_t mqtt_cfg = { .broker.address.uri = MQTT_BROKER_URI };\n    esp_mqtt_client_handle_t client = esp_mqtt_client_init(&mqtt_cfg);\n    esp_mqtt_client_register_event(client, ESP_EVENT_ANY_ID, mqtt_event_handler, NULL);\n    esp_mqtt_client_start(client);\n}\n`;
}

function bleServerEspIdf() {
  return `#include <string.h>\n#include "esp_bt.h"\n#include "esp_bt_main.h"\n#include "esp_gap_ble_api.h"\n#include "esp_gatts_api.h"\n#include "esp_log.h"\n\n#define GATTS_SERVICE_UUID   0x00FF\n#define GATTS_CHAR_UUID      0xFF01\n#define GATTS_NUM_HANDLE     4\nstatic const char *TAG = "ble_server";\nstatic uint8_t char_value[] = "ready";\n\nstatic void gatts_event_handler(esp_gatts_cb_event_t event, esp_gatt_if_t gatts_if, esp_ble_gatts_cb_param_t *param)\n{\n    switch (event) {\n    case ESP_GATTS_REG_EVT: {\n        esp_ble_gap_set_device_name("ESP32 Sensor");\n        esp_gatt_srvc_id_t service_id = {\n            .id.uuid.len = ESP_UUID_LEN_16,\n            .id.uuid.uuid.uuid16 = GATTS_SERVICE_UUID,\n            .id.inst_id = 0,\n            .is_primary = true,\n        };\n        esp_ble_gatts_create_service(gatts_if, &service_id, GATTS_NUM_HANDLE);\n        break;\n    }\n    case ESP_GATTS_CREATE_EVT:\n        esp_ble_gatts_start_service(param->create.service_handle);\n        {\n            esp_bt_uuid_t char_uuid = { .len = ESP_UUID_LEN_16, .uuid.uuid16 = GATTS_CHAR_UUID };\n            esp_ble_gatts_add_char(param->create.service_handle, &char_uuid,\n                ESP_GATT_PERM_READ,\n                ESP_GATT_CHAR_PROP_BIT_READ | ESP_GATT_CHAR_PROP_BIT_NOTIFY,\n                NULL, NULL);\n        }\n        break;\n    case ESP_GATTS_READ_EVT: {\n        esp_gatt_rsp_t rsp = { 0 };\n        rsp.attr_value.handle = param->read.handle;\n        rsp.attr_value.len = sizeof(char_value);\n        memcpy(rsp.attr_value.value, char_value, sizeof(char_value));\n        esp_ble_gatts_send_response(gatts_if, param->read.conn_id, param->read.trans_id, ESP_GATT_OK, &rsp);\n        break;\n    }\n    default:\n        break;\n    }\n}\n\nvoid app_main(void)\n{\n    esp_bt_controller_config_t bt_cfg = BT_CONTROLLER_INIT_CONFIG_DEFAULT();\n    esp_bt_controller_init(&bt_cfg);\n    esp_bt_controller_enable(ESP_BT_MODE_BLE);\n    esp_bluedroid_init();\n    esp_bluedroid_enable();\n\n    esp_ble_gatts_register_callback(gatts_event_handler);\n    esp_ble_gatts_app_register(0);\n\n    esp_ble_adv_data_t adv_data = {\n        .set_scan_rsp = false,\n        .include_name = true,\n        .flag = (ESP_BLE_ADV_FLAG_GEN_DISC | ESP_BLE_ADV_FLAG_BREDR_NOT_SPT),\n    };\n    esp_ble_gap_config_adv_data(&adv_data);\n\n    ESP_LOGI(TAG, "BLE GATT server started");\n}\n`;
}

function i2cScannerEspIdf() {
  return `#include <stdio.h>\n#include "freertos/FreeRTOS.h"\n#include "freertos/task.h"\n#include "driver/i2c.h"\n\n#define I2C_MASTER_SCL_IO 22\n#define I2C_MASTER_SDA_IO 21\n#define I2C_MASTER_NUM    I2C_NUM_0\n#define I2C_MASTER_FREQ_HZ 100000\n\nstatic void i2c_master_init(void)\n{\n    i2c_config_t conf = {\n        .mode = I2C_MODE_MASTER,\n        .sda_io_num = I2C_MASTER_SDA_IO,\n        .scl_io_num = I2C_MASTER_SCL_IO,\n        .sda_pullup_en = GPIO_PULLUP_ENABLE,\n        .scl_pullup_en = GPIO_PULLUP_ENABLE,\n        .master.clk_speed = I2C_MASTER_FREQ_HZ,\n    };\n    i2c_param_config(I2C_MASTER_NUM, &conf);\n    i2c_driver_install(I2C_MASTER_NUM, conf.mode, 0, 0, 0);\n}\n\nvoid app_main(void)\n{\n    i2c_master_init();\n\n    while (1) {\n        int found = 0;\n        for (uint8_t address = 1; address < 127; address++) {\n            i2c_cmd_handle_t cmd = i2c_cmd_link_create();\n            i2c_master_start(cmd);\n            i2c_master_write_byte(cmd, (address << 1) | I2C_MASTER_WRITE, true);\n            i2c_master_stop(cmd);\n            esp_err_t result = i2c_master_cmd_begin(I2C_MASTER_NUM, cmd, pdMS_TO_TICKS(50));\n            i2c_cmd_link_delete(cmd);\n            if (result == ESP_OK) {\n                printf("Found I2C device at 0x%02X\\n", address);\n                found++;\n            }\n        }\n        if (!found) printf("No I2C devices found\\n");\n        vTaskDelay(5000 / portTICK_PERIOD_MS);\n    }\n}\n`;
}

function spiTransferEspIdf(csPin) {
  return `#include <stdio.h>\n#include "freertos/FreeRTOS.h"\n#include "freertos/task.h"\n#include "driver/spi_master.h"\n\n#define PIN_NUM_MISO 19\n#define PIN_NUM_MOSI 23\n#define PIN_NUM_CLK  18\n#define PIN_NUM_CS   ${csPin}\n\nvoid app_main(void)\n{\n    spi_bus_config_t bus_cfg = {\n        .miso_io_num = PIN_NUM_MISO,\n        .mosi_io_num = PIN_NUM_MOSI,\n        .sclk_io_num = PIN_NUM_CLK,\n        .quadwp_io_num = -1,\n        .quadhd_io_num = -1,\n    };\n    spi_bus_initialize(SPI2_HOST, &bus_cfg, SPI_DMA_CH_AUTO);\n\n    spi_device_interface_config_t dev_cfg = {\n        .clock_speed_hz = 1 * 1000 * 1000,\n        .mode = 0,\n        .spics_io_num = PIN_NUM_CS,\n        .queue_size = 1,\n    };\n    spi_device_handle_t device;\n    spi_bus_add_device(SPI2_HOST, &dev_cfg, &device);\n\n    while (1) {\n        uint8_t tx = 0x00;\n        uint8_t rx = 0x00;\n        spi_transaction_t transaction = {\n            .length = 8,\n            .tx_buffer = &tx,\n            .rx_buffer = &rx,\n        };\n        spi_device_transmit(device, &transaction);\n        printf("SPI response: 0x%02X\\n", rx);\n        vTaskDelay(1000 / portTICK_PERIOD_MS);\n    }\n}\n`;
}

function mpu6050EspIdf(address) {
  return `#include <stdio.h>\n#include "freertos/FreeRTOS.h"\n#include "freertos/task.h"\n#include "driver/i2c.h"\n\n#define I2C_MASTER_SCL_IO 22\n#define I2C_MASTER_SDA_IO 21\n#define I2C_MASTER_NUM    I2C_NUM_0\n#define I2C_MASTER_FREQ_HZ 100000\n#define MPU6050_ADDR ${addrHex(address)}\n\nstatic void i2c_master_init(void)\n{\n    i2c_config_t conf = {\n        .mode = I2C_MODE_MASTER,\n        .sda_io_num = I2C_MASTER_SDA_IO,\n        .scl_io_num = I2C_MASTER_SCL_IO,\n        .sda_pullup_en = GPIO_PULLUP_ENABLE,\n        .scl_pullup_en = GPIO_PULLUP_ENABLE,\n        .master.clk_speed = I2C_MASTER_FREQ_HZ,\n    };\n    i2c_param_config(I2C_MASTER_NUM, &conf);\n    i2c_driver_install(I2C_MASTER_NUM, conf.mode, 0, 0, 0);\n}\n\nvoid app_main(void)\n{\n    i2c_master_init();\n\n    // Wake the sensor: PWR_MGMT_1 (0x6B) = 0 clears the sleep bit.\n    uint8_t wake[2] = { 0x6B, 0x00 };\n    if (i2c_master_write_to_device(I2C_MASTER_NUM, MPU6050_ADDR, wake, 2, pdMS_TO_TICKS(100)) != ESP_OK) {\n        printf("MPU6050 not found at 0x%02X\n", MPU6050_ADDR);\n        return;\n    }\n\n    // +-8g range: ACCEL_CONFIG (0x1C), AFS_SEL=2 -> sensitivity 4096 LSB/g.\n    uint8_t accel_cfg[2] = { 0x1C, 0x10 };\n    i2c_master_write_to_device(I2C_MASTER_NUM, MPU6050_ADDR, accel_cfg, 2, pdMS_TO_TICKS(100));\n\n    while (1) {\n        uint8_t reg = 0x3B; // ACCEL_XOUT_H\n        uint8_t raw[6];\n        i2c_master_write_read_device(I2C_MASTER_NUM, MPU6050_ADDR, &reg, 1, raw, 6, pdMS_TO_TICKS(100));\n\n        int16_t ax = (raw[0] << 8) | raw[1];\n        int16_t ay = (raw[2] << 8) | raw[3];\n        int16_t az = (raw[4] << 8) | raw[5];\n\n        printf("Accel X: %.2f, Y: %.2f, Z: %.2f (g)\n", ax / 4096.0, ay / 4096.0, az / 4096.0);\n\n        vTaskDelay(500 / portTICK_PERIOD_MS);\n    }\n}\n`;
}

function hcsr04EspIdf(trigPin, echoPin) {
  return `#include <stdio.h>\n#include "freertos/FreeRTOS.h"\n#include "freertos/task.h"\n#include "driver/gpio.h"\n#include "esp_timer.h"\n\n#define TRIG_PIN ${trigPin}\n#define ECHO_PIN ${echoPin}\n\nvoid app_main(void)\n{\n    gpio_reset_pin(TRIG_PIN);\n    gpio_reset_pin(ECHO_PIN);\n    gpio_set_direction(TRIG_PIN, GPIO_MODE_OUTPUT);\n    gpio_set_direction(ECHO_PIN, GPIO_MODE_INPUT);\n    gpio_set_level(TRIG_PIN, 0);\n\n    while (1) {\n        gpio_set_level(TRIG_PIN, 1);\n        esp_rom_delay_us(10);\n        gpio_set_level(TRIG_PIN, 0);\n\n        int64_t timeout = esp_timer_get_time() + 30000; // 30ms timeout (~5m round trip)\n        while (gpio_get_level(ECHO_PIN) == 0 && esp_timer_get_time() < timeout) {}\n        int64_t start = esp_timer_get_time();\n        while (gpio_get_level(ECHO_PIN) == 1 && esp_timer_get_time() < timeout) {}\n        int64_t duration_us = esp_timer_get_time() - start;\n\n        int distance_cm = (int)(duration_us * 0.034 / 2);\n        printf("Distance: %d cm\n", distance_cm);\n\n        vTaskDelay(100 / portTICK_PERIOD_MS);\n    }\n}\n`;
}

function dhtEspIdf(dataPin, isDht22) {
  const divisor = isDht22 ? 10.0 : 1.0;
  return `#include <stdio.h>\n#include "freertos/FreeRTOS.h"\n#include "freertos/task.h"\n#include "driver/gpio.h"\n#include "rom/ets_sys.h"\n\n#define DHT_PIN ${dataPin}\n\n// Bit-banged DHT11/DHT22 read: a 0 bit's high pulse is ~26-28us, a 1 bit's is ~70us.\nstatic int dht_read(uint8_t data[5])\n{\n    gpio_set_direction(DHT_PIN, GPIO_MODE_OUTPUT);\n    gpio_set_level(DHT_PIN, 0);\n    ets_delay_us(18000); // Start signal: pull low for 18ms\n    gpio_set_level(DHT_PIN, 1);\n    ets_delay_us(30);\n    gpio_set_direction(DHT_PIN, GPIO_MODE_INPUT);\n\n    int64_t timeout;\n    timeout = 0; while (gpio_get_level(DHT_PIN) == 1) { if (++timeout > 10000) return -1; }\n    timeout = 0; while (gpio_get_level(DHT_PIN) == 0) { if (++timeout > 10000) return -1; } // Sensor response low\n    timeout = 0; while (gpio_get_level(DHT_PIN) == 1) { if (++timeout > 10000) return -1; } // Sensor response high\n\n    for (int i = 0; i < 5; i++) {\n        data[i] = 0;\n        for (int bit = 0; bit < 8; bit++) {\n            timeout = 0; while (gpio_get_level(DHT_PIN) == 0) { if (++timeout > 10000) return -1; }\n            uint32_t start = 0;\n            while (gpio_get_level(DHT_PIN) == 1) { ets_delay_us(1); start++; if (start > 200) break; }\n            data[i] <<= 1;\n            if (start > 40) data[i] |= 1; // Long high pulse => bit 1\n        }\n    }\n\n    uint8_t checksum = data[0] + data[1] + data[2] + data[3];\n    return (checksum == data[4]) ? 0 : -1;\n}\n\nvoid app_main(void)\n{\n    gpio_reset_pin(DHT_PIN);\n\n    while (1) {\n        uint8_t data[5];\n        if (dht_read(data) == 0) {\n            float humidity = ((data[0] << 8) | data[1]) / ${divisor};\n            float temperature = (((data[2] & 0x7F) << 8) | data[3]) / ${divisor};\n            if (data[2] & 0x80) temperature = -temperature;\n            printf("Humidity: %.1f%%  Temperature: %.1f C\n", humidity, temperature);\n        } else {\n            printf("Failed to read from DHT sensor (checksum or timing error)\n");\n        }\n        vTaskDelay(${isDht22 ? 2000 : 1000} / portTICK_PERIOD_MS);\n    }\n}\n`;
}

function mq2EspIdf() {
  return `#include <stdio.h>\n#include "freertos/FreeRTOS.h"\n#include "freertos/task.h"\n#include "esp_adc/adc_oneshot.h"\n\nvoid app_main(void)\n{\n    printf("Warming up MQ-2 sensor...\n");\n    vTaskDelay(5000 / portTICK_PERIOD_MS);\n\n    adc_oneshot_unit_handle_t adc_handle;\n    adc_oneshot_unit_init_cfg_t unit_cfg = { .unit_id = ADC_UNIT_1 };\n    adc_oneshot_new_unit(&unit_cfg, &adc_handle);\n\n    adc_oneshot_chan_cfg_t chan_cfg = { .atten = ADC_ATTEN_DB_12, .bitwidth = ADC_BITWIDTH_DEFAULT };\n    adc_oneshot_config_channel(adc_handle, ADC_CHANNEL_6, &chan_cfg); // GPIO34 on most ESP32 dev boards\n\n    while (1) {\n        int raw = 0;\n        adc_oneshot_read(adc_handle, ADC_CHANNEL_6, &raw);\n        printf("MQ-2 raw ADC value: %d\n", raw);\n        if (raw > 2000) { // Threshold depends on environment and ADC resolution - calibrate for your sensor\n            printf("WARNING: High gas/smoke detected!\n");\n        }\n        vTaskDelay(1000 / portTICK_PERIOD_MS);\n    }\n}\n`;
}

function pirEspIdf(pirPin) {
  return `#include <stdio.h>\n#include "freertos/FreeRTOS.h"\n#include "freertos/task.h"\n#include "driver/gpio.h"\n\n#define PIR_PIN ${pirPin}\n\nvoid app_main(void)\n{\n    gpio_reset_pin(PIR_PIN);\n    gpio_set_direction(PIR_PIN, GPIO_MODE_INPUT);\n    printf("PIR sensor initializing (wait 60s to stabilize)...\n");\n\n    int motion_state = 0;\n    while (1) {\n        int level = gpio_get_level(PIR_PIN);\n        if (level && !motion_state) {\n            printf("Motion detected!\n");\n            motion_state = 1;\n        } else if (!level && motion_state) {\n            printf("Motion ended.\n");\n            motion_state = 0;\n        }\n        vTaskDelay(100 / portTICK_PERIOD_MS);\n    }\n}\n`;
}
