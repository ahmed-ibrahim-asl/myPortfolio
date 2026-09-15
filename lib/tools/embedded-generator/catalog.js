import {
  SENSOR_CONFIGURATIONS,
  SENSOR_PARAM_SCHEMAS,
  generateSensorCode
} from "../sensor-templates.js";
import { EXPANDED_EMBEDDED_CONFIGURATIONS } from "./templates.js";
import { ADDITIONAL_SENSOR_CONFIGURATIONS } from "./templates-additional-sensors.js";
import { HARDENING_CONFIGURATIONS } from "./templates-hardening.js";
import { SBC_CONFIGURATIONS } from "./templates-sbc.js";

export const EMBEDDED_FAMILIES = Object.freeze([
  Object.freeze({ id: "sensor", label: "Sensors", summary: "Read physical measurements from real devices." }),
  Object.freeze({ id: "communication", label: "Communication", summary: "Move data between boards, services, and apps." }),
  Object.freeze({ id: "interface", label: "Board interfaces", summary: "Bring up buses, cameras, USB, and peripheral links." }),
  Object.freeze({ id: "hardening", label: "Production hardening", summary: "Deep sleep, TLS, OTA updates, and watchdog recovery for fielded devices." }),
  Object.freeze({ id: "sbc", label: "Single-board computers", summary: "GPIO, I2C, SPI, and camera code for Raspberry Pi and Jetson boards." })
]);

const targetRecords = [
  ["bme280", "sensor", "BME280", "Temperature, humidity, and pressure", ["i2c"]],
  ["mpu6050", "sensor", "MPU6050", "Acceleration and angular velocity", ["i2c"]],
  ["hcsr04", "sensor", "HC-SR04", "Ultrasonic distance", ["gpio"]],
  ["irsensor", "sensor", "IR obstacle sensor", "Digital obstacle presence", ["gpio"]],
  ["dht11", "sensor", "DHT11", "Basic temperature and humidity", ["gpio"]],
  ["dht22", "sensor", "DHT22", "Improved temperature and humidity", ["gpio"]],
  ["mq2", "sensor", "MQ-2", "Smoke and combustible gas response", ["adc"]],
  ["pir", "sensor", "HC-SR501 PIR", "Motion detection", ["gpio"]],
  ["bmp280", "sensor", "BMP280", "Temperature and barometric pressure", ["i2c"]],
  ["ds18b20", "sensor", "DS18B20", "Digital temperature on a OneWire bus", ["onewire"]],
  ["bh1750", "sensor", "BH1750", "Ambient light in lux", ["i2c"]],
  ["vl53l0x", "sensor", "VL53L0X", "Time-of-flight distance", ["i2c"]],
  ["ads1115", "sensor", "ADS1115", "16-bit external analog conversion", ["i2c"]],
  ["hx711", "sensor", "HX711 + load cell", "Weight and force measurement", ["gpio"]],
  ["soil-moisture", "sensor", "Capacitive soil moisture", "Calibrated analog moisture level", ["adc"]],
  ["ssd1306-oled", "sensor", "SSD1306 OLED display", "128x64/128x32 I2C display output", ["i2c"]],
  ["lcd1602-i2c", "sensor", "1602 LCD (I2C backpack)", "16x2 character display output", ["i2c"]],
  ["ds3231-rtc", "sensor", "DS3231 RTC", "Battery-backed real-time clock", ["i2c"]],
  ["bno055-imu", "sensor", "BNO055 IMU", "Fused 9-DOF absolute orientation", ["i2c"]],
  ["sgp30-air-quality", "sensor", "SGP30", "eCO2 and TVOC air quality", ["i2c"]],
  ["ina219-power", "sensor", "INA219", "Current, bus voltage, and power", ["i2c"]],
  ["neo6m-gps", "sensor", "NEO-6M GPS", "Latitude/longitude from NMEA sentences", ["uart"]],
  ["sd-card-logger", "sensor", "SD card logger", "Local CSV logging with no network", ["spi"]],
  ["rotary-encoder", "sensor", "Rotary encoder", "Quadrature position input", ["gpio"]],
  ["espnow-sender", "communication", "ESP-NOW sender", "Low-latency ESP32 peer messages", ["wifi"]],
  ["espnow-receiver", "communication", "ESP-NOW receiver", "Receive ESP32 peer messages", ["wifi"]],
  ["uart-comm", "communication", "UART link", "Board-to-board serial communication", ["uart"]],
  ["http-client", "communication", "HTTP client", "Send or fetch web API data", ["http"]],
  ["http-server", "communication", "HTTP server", "Expose a local device endpoint", ["http"]],
  ["mqtt-publisher", "communication", "MQTT publisher", "Publish device telemetry", ["mqtt"]],
  ["mqtt-subscriber", "communication", "MQTT subscriber", "Receive device commands", ["mqtt"]],
  ["ble-server", "communication", "BLE GATT server", "Advertise readable or notifiable data", ["ble"]],
  ["ble-client", "communication", "BLE GATT client", "Scan and connect to peripherals", ["ble"]],
  ["esp32s3-usb-cdc", "interface", "ESP32-S3 USB CDC", "Native USB serial bring-up", ["usb"]],
  ["esp32s3-camera", "interface", "OV2640 camera", "ESP32-S3 camera capture", ["i2s"]],
  ["i2c-scanner", "interface", "I2C bus scanner", "Discover device addresses", ["i2c"]],
  ["spi-transfer", "interface", "SPI transfer", "Full-duplex peripheral exchange", ["spi"]],
  ["deep-sleep-timer", "hardening", "Deep sleep (timer wake)", "Wake on a fixed interval to save battery", ["power"]],
  ["deep-sleep-gpio-wake", "hardening", "Deep sleep (GPIO wake)", "Wake on an external signal", ["power"]],
  ["https-client", "hardening", "HTTPS client (TLS)", "Certificate-validated HTTP requests", ["http"]],
  ["mqtts-publisher", "hardening", "MQTTS publisher (TLS)", "Certificate-validated MQTT telemetry", ["mqtt"]],
  ["ota-update", "hardening", "OTA firmware update", "Reflash over Wi-Fi instead of USB", ["wifi"]],
  ["watchdog-recovery", "hardening", "Watchdog-guarded sensor loop", "Bounded retries and reset instead of a silent hang", ["power"]],
  ["sbc-gpio-io", "sbc", "Digital I/O", "LED output and button input", ["gpio"]],
  ["sbc-pwm", "sbc", "PWM output", "LED fade or servo control", ["pwm"]],
  ["sbc-i2c-sensor", "sbc", "I2C sensor read (BME280)", "Register-level I2C read over Linux i2c-dev", ["i2c"]],
  ["sbc-spi-transfer", "sbc", "SPI transfer", "Full-duplex exchange over Linux spidev", ["spi"]],
  ["sbc-camera", "sbc", "Camera capture", "Still-image capture from the CSI camera connector", ["camera"]]
];

export const EMBEDDED_TARGETS = Object.freeze(targetRecords.map(([id, family, label, summary, protocols]) =>
  Object.freeze({ id, family, label, summary, protocols: Object.freeze(protocols) })
));

export const EMBEDDED_EXAMPLES = Object.freeze([
  ["weather-station", "sensor", "bme280", "Weather station", "Read temperature, humidity, and pressure together", { i2cAddress: "0x76" }],
  ["tank-distance", "sensor", "vl53l0x", "Tank distance", "Measure short-range distance without an ultrasonic echo", {}],
  ["load-cell-scale", "sensor", "hx711", "Load-cell scale", "Start a calibrated weight measurement", { dataPin: 19, clockPin: 18, calibrationFactor: -7050 }],
  ["light-monitor", "sensor", "bh1750", "Light monitor", "Report ambient illuminance in lux", {}],
  ["plant-moisture", "sensor", "soil-moisture", "Plant moisture", "Calibrate dry and wet soil readings", { adcPin: 34, dryReading: 3000, wetReading: 1300 }],
  ["temperature-bus", "sensor", "ds18b20", "Temperature bus", "Read a waterproof OneWire temperature probe", { dataPin: 4 }],
  ["status-display", "sensor", "ssd1306-oled", "Status display", "Show live readings on a small OLED panel", {}],
  ["field-clock", "sensor", "ds3231-rtc", "Field clock", "Keep accurate time with no network connection", {}],
  ["orientation-tracker", "sensor", "bno055-imu", "Orientation tracker", "Read fused heading, roll, and pitch", {}],
  ["air-quality-monitor", "sensor", "sgp30-air-quality", "Air quality monitor", "Track eCO2 and TVOC indoors", {}],
  ["power-monitor", "sensor", "ina219-power", "Power monitor", "Measure current and power draw of a load", {}],
  ["gps-tracker", "sensor", "neo6m-gps", "GPS tracker", "Report live latitude and longitude", { rxPin: 16, txPin: 17 }],
  ["offline-logger", "sensor", "sd-card-logger", "Offline data logger", "Log readings to a CSV file with no network", { csPin: 5 }],
  ["board-telemetry", "communication", "mqtt-publisher", "Publish telemetry", "Send periodic device state through MQTT", {}],
  ["remote-command", "communication", "mqtt-subscriber", "Receive commands", "Subscribe to a command topic", {}],
  ["local-api", "communication", "http-server", "Local device API", "Expose a JSON health endpoint", {}],
  ["peer-link", "communication", "espnow-sender", "ESP-NOW peer link", "Send a compact message between ESP32 boards", {}],
  ["bus-diagnostics", "interface", "i2c-scanner", "I2C diagnostics", "Find addresses during hardware bring-up", {}],
  ["spi-bring-up", "interface", "spi-transfer", "SPI bring-up", "Verify chip-select and transfer wiring", { csPin: 5 }],
  ["battery-node", "hardening", "deep-sleep-timer", "Battery-powered node", "Wake on a timer, read, transmit, sleep", { sleepSeconds: 300 }],
  ["secure-telemetry", "hardening", "https-client", "Secure telemetry", "Send readings to a TLS-verified endpoint", {}],
  ["field-update", "hardening", "ota-update", "Field firmware update", "Reflash a deployed device over Wi-Fi", {}],
  ["pi-blink", "sbc", "sbc-gpio-io", "Pi/Jetson digital I/O", "Light an LED from a button on a Linux SBC", {}],
  ["pi-weather", "sbc", "sbc-i2c-sensor", "Pi/Jetson weather read", "Read a BME280 over Linux i2c-dev", { i2cAddress: "0x76" }],
  ["pi-camera", "sbc", "sbc-camera", "Pi/Jetson camera capture", "Grab a still frame from the CSI camera", {}]
].map(([id, family, target, title, summary, params]) => Object.freeze({ id, family, target, title, summary, params: Object.freeze(params) })));

export const EMBEDDED_PARAM_SCHEMAS = Object.freeze({
  ...SENSOR_PARAM_SCHEMAS,
  bmp280: SENSOR_PARAM_SCHEMAS.bme280,
  ds18b20: [{ key: "dataPin", label: "Data pin (GPIO)", type: "number", default: 4 }],
  hx711: [
    { key: "dataPin", label: "Data pin (GPIO)", type: "number", default: 19 },
    { key: "clockPin", label: "Clock pin (GPIO)", type: "number", default: 18 },
    { key: "calibrationFactor", label: "Calibration factor", type: "number", default: -7050 }
  ],
  "soil-moisture": [
    { key: "adcPin", label: "ADC pin", type: "number", default: 34 },
    { key: "dryReading", label: "Dry calibration reading", type: "number", default: 3000 },
    { key: "wetReading", label: "Wet calibration reading", type: "number", default: 1300 }
  ],
  "spi-transfer": [{ key: "csPin", label: "Chip-select pin", type: "number", default: 5 }],
  "neo6m-gps": [
    { key: "rxPin", label: "RX pin (GPIO, board receives here)", type: "number", default: 16 },
    { key: "txPin", label: "TX pin (GPIO)", type: "number", default: 17 }
  ],
  "sd-card-logger": [{ key: "csPin", label: "Chip-select pin", type: "number", default: 5 }],
  "rotary-encoder": [
    { key: "clkPin", label: "CLK pin (GPIO)", type: "number", default: 32 },
    { key: "dtPin", label: "DT pin (GPIO)", type: "number", default: 33 }
  ],
  "deep-sleep-timer": [{ key: "sleepSeconds", label: "Sleep duration (seconds)", type: "number", default: 60 }],
  "deep-sleep-gpio-wake": [{ key: "wakePin", label: "Wake pin (RTC-capable GPIO)", type: "number", default: 33 }],
  "watchdog-recovery": [{ key: "timeoutSeconds", label: "Watchdog timeout (seconds)", type: "number", default: 8 }],
  "sbc-gpio-io": [
    { key: "ledPin", label: "LED pin", type: "number", default: 17 },
    { key: "buttonPin", label: "Button pin", type: "number", default: 27 }
  ],
  "sbc-pwm": [{ key: "pwmPin", label: "PWM pin", type: "number", default: 18 }],
  "sbc-i2c-sensor": [
    { key: "i2cBus", label: "I2C bus number", type: "number", default: 1 },
    {
      key: "i2cAddress",
      label: "I2C address",
      type: "select",
      options: [
        { value: "0x76", label: "0x76 (SDO tied to GND, most breakout boards ship this way)" },
        { value: "0x77", label: "0x77 (SDO tied to VDDIO)" }
      ],
      default: "0x76"
    }
  ],
  "sbc-spi-transfer": [
    { key: "spiBus", label: "SPI bus number", type: "number", default: 0 },
    { key: "spiDevice", label: "SPI device (chip-select) number", type: "number", default: 0 }
  ]
});

const familyByTarget = new Map(EMBEDDED_TARGETS.map(({ id, family }) => [id, family]));
const wiringByProtocol = Object.freeze({
  i2c: ["Connect SDA and SCL to the board I2C pins.", "Connect a common ground and use the module's supported supply voltage."],
  gpio: ["Connect signal pins exactly as configured and share ground."],
  adc: ["Connect the analog output to an ADC-capable pin and share ground."],
  onewire: ["Connect DATA to the configured GPIO with the required pull-up resistor."],
  wifi: ["No signal wires are required; both devices need compatible 2.4 GHz radio settings."],
  http: ["No peripheral wiring is required beyond board power and network connectivity."],
  mqtt: ["No peripheral wiring is required beyond board power and network connectivity."],
  ble: ["No peripheral wiring is required beyond board power and BLE radio availability."],
  uart: ["Cross TX to RX, RX to TX, and connect grounds."],
  usb: ["Use the board's native USB connector and a data-capable cable."],
  i2s: ["Camera data and clock pins must match the board module pinout."],
  spi: ["Connect SCK, MOSI, MISO, CS, power, and a common ground."],
  power: ["No peripheral wiring is required for the sleep/wake behavior itself; wire whatever sensor you read before sleeping separately."],
  pwm: ["Connect the signal wire to the configured pin, power and ground per the load's rating - use a driver transistor or motor driver for anything beyond a small LED."],
  camera: ["Seat the CSI ribbon cable with the contacts facing the board's HDMI/USB side (Pi) or as marked on the connector (Jetson) - a reversed or half-seated cable is the most common no-image cause."]
});

const legacyConfigurations = SENSOR_CONFIGURATIONS.map((config) => Object.freeze({
  ...config,
  target: config.sensor,
  label: config.sensorLabel,
  family: familyByTarget.get(config.sensor)
}));

const generatedConfigurationSources = [
  ...EXPANDED_EMBEDDED_CONFIGURATIONS,
  ...ADDITIONAL_SENSOR_CONFIGURATIONS,
  ...HARDENING_CONFIGURATIONS,
  ...SBC_CONFIGURATIONS
];

export const EMBEDDED_CONFIGURATIONS = Object.freeze([
  ...legacyConfigurations,
  ...generatedConfigurationSources.map((config) => Object.freeze({
    ...config,
    family: familyByTarget.get(config.target)
  }))
]);

export function getEmbeddedFamilyStarter(family) {
  const example = EMBEDDED_EXAMPLES.find((item) => item.family === family);
  if (!example) return null;

  const config = EMBEDDED_CONFIGURATIONS.find((item) => item.target === example.target);
  if (!config) return null;

  return {
    example,
    params: { ...example.params },
    selection: {
      family,
      target: example.target,
      environment: config.environment,
      protocol: config.protocol
    }
  };
}

export function generateEmbeddedCode(selection, params = {}) {
  const target = selection.target ?? selection.sensor;
  const metadata = EMBEDDED_TARGETS.find(({ id }) => id === target);
  if (!metadata || (selection.family && selection.family !== metadata.family)) {
    return { ok: false, error: "UNSUPPORTED_CONFIGURATION", code: "", filename: null, dependencies: [], notes: [], wiring: [] };
  }

  const expanded = generatedConfigurationSources.find((config) =>
    config.target === target
    && config.environment === selection.environment
    && config.protocol === selection.protocol
  );

  const result = expanded
    ? {
        ok: true,
        code: expanded.generate(params),
        filename: expanded.filename,
        language: expanded.language,
        dependencies: expanded.dependencies,
        notes: expanded.notes
      }
    : generateSensorCode({ sensor: target, environment: selection.environment, protocol: selection.protocol }, params);

  return {
    ...result,
    wiring: result.ok ? [...(wiringByProtocol[selection.protocol] ?? ["Check the selected board and module documentation before wiring."])] : []
  };
}
