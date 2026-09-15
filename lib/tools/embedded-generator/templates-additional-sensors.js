import { asPin, record, espIdfOnly } from "./record-helpers.js";

// A second wave of sensors/peripherals beyond the original catalog - displays, timekeeping,
// richer IMUs/air-quality/power sensing, GPS, SD logging, and a rotary encoder input. Same
// record()-derives-PlatformIO-for-free pattern as templates.js; ESP-IDF is included wherever the
// register/protocol work is something that can be implemented and verified directly rather than
// requiring a vendor driver's proprietary init sequence (see the VL53L0X note in templates.js for
// the one place that trade-off goes the other way).
export const ADDITIONAL_SENSOR_CONFIGURATIONS = Object.freeze([
  ...record({
    target: "ssd1306-oled", label: "SSD1306 OLED display", protocol: "i2c", filename: "ssd1306_example.ino",
    dependencies: [{ name: "Adafruit SSD1306", version: "^2.5.13" }, { name: "Adafruit GFX Library", version: "^1.11.9" }],
    notes: ["Common modules are 128x64 or 128x32 at I2C address 0x3C (sometimes 0x3D).", "Call display.display() after every draw - nothing appears on the panel until you do."],
    generate: () => `#include <Wire.h>\n#include <Adafruit_GFX.h>\n#include <Adafruit_SSD1306.h>\n\n#define SCREEN_WIDTH 128\n#define SCREEN_HEIGHT 64\n#define OLED_ADDR 0x3C\n\nAdafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);\n\nvoid setup() {\n  Serial.begin(115200);\n  if (!display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR)) {\n    Serial.println("SSD1306 not found");\n    while (true) delay(10);\n  }\n  display.clearDisplay();\n  display.setTextSize(1);\n  display.setTextColor(SSD1306_WHITE);\n}\n\nvoid loop() {\n  display.clearDisplay();\n  display.setCursor(0, 0);\n  display.println("Hello, sensor!");\n  display.print("Uptime: ");\n  display.print(millis() / 1000);\n  display.println("s");\n  display.display();\n  delay(1000);\n}\n`,
    espidf: {
      dependencies: [{ name: "esp-idf", version: "v5.0+" }],
      notes: [
        "Sends the real SSD1306 power-on command sequence and can address individual pixels directly.",
        "Text/font rendering is intentionally out of scope here - it needs a font-rasterizing library (e.g. esp-idf-component u8g2) rather than something safe to hand-roll; this starter proves the panel is alive by lighting a test pattern."
      ],
      generate: () => ssd1306EspIdf()
    }
  }),
  ...record({
    target: "lcd1602-i2c", label: "1602 LCD (I2C backpack)", protocol: "i2c", filename: "lcd1602_example.ino",
    dependencies: [{ name: "LiquidCrystal I2C", version: "^1.1.4" }],
    notes: ["Most PCF8574 backpacks default to address 0x27 (some ship as 0x3F).", "Run an I2C scan first if the display stays blank - a wrong address is the most common issue."],
    generate: () => `#include <Wire.h>\n#include <LiquidCrystal_I2C.h>\n\nLiquidCrystal_I2C lcd(0x27, 16, 2);\n\nvoid setup() {\n  Wire.begin();\n  lcd.init();\n  lcd.backlight();\n  lcd.setCursor(0, 0);\n  lcd.print("Hello, sensor!");\n}\n\nvoid loop() {\n  lcd.setCursor(0, 1);\n  lcd.print("Uptime: ");\n  lcd.print(millis() / 1000);\n  lcd.print("s ");\n  delay(1000);\n}\n`,
    espidf: {
      notes: ["Drives the PCF8574 I2C backpack in 4-bit HD44780 mode directly - no external component required.", "Default backpack address is 0x27 (some ship as 0x3F)."],
      generate: () => lcd1602EspIdf()
    }
  }),
  ...record({
    target: "ds3231-rtc", label: "DS3231 real-time clock", protocol: "i2c", filename: "ds3231_example.ino",
    dependencies: [{ name: "RTClib", version: "^2.1.4" }],
    notes: ["Keeps time through power loss on its coin-cell backup battery.", "Set the time once (e.g. adjust(DateTime(F(__DATE__), F(__TIME__)))) after first flashing, then remove that call."],
    generate: () => `#include <Wire.h>\n#include <RTClib.h>\n\nRTC_DS3231 rtc;\n\nvoid setup() {\n  Serial.begin(115200);\n  if (!rtc.begin()) {\n    Serial.println("DS3231 not found");\n    while (true) delay(10);\n  }\n  if (rtc.lostPower()) {\n    Serial.println("RTC lost power; set the time before trusting readings.");\n  }\n}\n\nvoid loop() {\n  DateTime now = rtc.now();\n  Serial.printf("%04d-%02d-%02d %02d:%02d:%02d\\n", now.year(), now.month(), now.day(), now.hour(), now.minute(), now.second());\n  delay(1000);\n}\n`,
    espidf: {
      notes: ["Reads/writes the DS3231's BCD time registers directly - no external component required.", "Set the time once with a write before relying on it; this starter only reads."],
      generate: () => ds3231EspIdf()
    }
  }),
  ...record({
    target: "bno055-imu", label: "BNO055 9-DOF absolute orientation sensor", protocol: "i2c", filename: "bno055_example.ino",
    dependencies: [{ name: "Adafruit BNO055", version: "^1.6.3" }],
    notes: ["Runs its own sensor-fusion firmware - it reports orientation directly rather than raw accel/gyro/mag.", "Needs a figure-8 motion during first power-up for magnetometer calibration to converge."],
    generate: () => `#include <Wire.h>\n#include <Adafruit_BNO055.h>\n\nAdafruit_BNO055 bno = Adafruit_BNO055(55, 0x28);\n\nvoid setup() {\n  Serial.begin(115200);\n  if (!bno.begin()) {\n    Serial.println("BNO055 not found");\n    while (true) delay(10);\n  }\n  bno.setExtCrystalUse(true);\n}\n\nvoid loop() {\n  sensors_event_t event;\n  bno.getEvent(&event);\n  Serial.print("Heading: "); Serial.print(event.orientation.x);\n  Serial.print(" Roll: "); Serial.print(event.orientation.y);\n  Serial.print(" Pitch: "); Serial.println(event.orientation.z);\n  delay(100);\n}\n`,
    espidf: {
      notes: ["Sets NDOF fusion mode and reads the Euler-angle registers directly - no external component required.", "Needs a figure-8 motion during first power-up for magnetometer calibration to converge."],
      generate: () => bno055EspIdf()
    }
  }),
  ...record({
    target: "sgp30-air-quality", label: "SGP30 VOC/eCO2 air-quality sensor", protocol: "i2c", filename: "sgp30_example.ino",
    dependencies: [{ name: "Adafruit SGP30", version: "^2.0.3" }],
    notes: ["eCO2/TVOC readings only stabilize after roughly 15s of warm-up and improve over the first 12h of run time.", "Call IAQinit() once per boot before reading."],
    generate: () => `#include <Wire.h>\n#include <Adafruit_SGP30.h>\n\nAdafruit_SGP30 sgp;\n\nvoid setup() {\n  Serial.begin(115200);\n  if (!sgp.begin()) {\n    Serial.println("SGP30 not found");\n    while (true) delay(10);\n  }\n}\n\nvoid loop() {\n  if (!sgp.IAQmeasure()) {\n    Serial.println("Measurement failed");\n    return;\n  }\n  Serial.print("eCO2: "); Serial.print(sgp.eCO2); Serial.print(" ppm  TVOC: "); Serial.print(sgp.TVOC); Serial.println(" ppb");\n  delay(1000);\n}\n`,
    espidf: {
      notes: ["Sends the Sensirion 16-bit command + CRC-8 protocol directly - no external component required.", "eCO2/TVOC only stabilize after roughly 15s of warm-up and improve over the first 12h of run time."],
      generate: () => sgp30EspIdf()
    }
  }),
  ...record({
    target: "ina219-power", label: "INA219 current/power sensor", protocol: "i2c", filename: "ina219_example.ino",
    dependencies: [{ name: "Adafruit INA219", version: "^1.2.3" }],
    notes: ["Measures bus voltage and shunt current on the high side - wire the load's supply through the module's screw terminals or VIN+/VIN- pads.", "Default calibration assumes a 0.1ohm shunt and supports up to ~3.2A."],
    generate: () => `#include <Wire.h>\n#include <Adafruit_INA219.h>\n\nAdafruit_INA219 ina219;\n\nvoid setup() {\n  Serial.begin(115200);\n  if (!ina219.begin()) {\n    Serial.println("INA219 not found");\n    while (true) delay(10);\n  }\n}\n\nvoid loop() {\n  float busVoltage = ina219.getBusVoltage_V();\n  float current_mA = ina219.getCurrent_mA();\n  float power_mW = ina219.getPower_mW();\n  Serial.printf("Bus: %.2fV  Current: %.1fmA  Power: %.1fmW\\n", busVoltage, current_mA, power_mW);\n  delay(500);\n}\n`,
    espidf: {
      notes: ["Programs the calibration register and reads bus/current/power registers directly - no external component required.", "Default calibration assumes a 0.1ohm shunt and supports up to ~3.2A."],
      generate: () => ina219EspIdf()
    }
  }),
  ...record({
    target: "neo6m-gps", label: "NEO-6M GPS module", protocol: "uart", filename: "neo6m_example.ino",
    dependencies: [{ name: "TinyGPSPlus", version: "^1.1.0" }],
    notes: ["Needs a clear sky view - it will not get a fix indoors.", "First fix after cold start can take 30s-a few minutes."],
    generate: (params = {}) => {
      const rxPin = asPin(params.rxPin, 16);
      const txPin = asPin(params.txPin, 17);
      return `#include <TinyGPSPlus.h>\n#include <HardwareSerial.h>\n\nHardwareSerial gpsSerial(1);\nTinyGPSPlus gps;\n\nvoid setup() {\n  Serial.begin(115200);\n  gpsSerial.begin(9600, SERIAL_8N1, ${rxPin}, ${txPin});\n}\n\nvoid loop() {\n  while (gpsSerial.available()) {\n    gps.encode(gpsSerial.read());\n  }\n  if (gps.location.isUpdated()) {\n    Serial.print("Lat: "); Serial.print(gps.location.lat(), 6);\n    Serial.print(" Lng: "); Serial.println(gps.location.lng(), 6);\n  }\n}\n`;
    },
    espidf: {
      notes: [
        "Parses $GPGGA sentences directly over ESP-IDF's UART driver for latitude/longitude/fix quality.",
        "This is a minimal single-sentence parser, not a full NMEA library - it covers the common case but skips checksum verification and the other sentence types (GPRMC, GPGSV, ...)."
      ],
      generate: (params = {}) => neo6mEspIdf(asPin(params.rxPin, 16), asPin(params.txPin, 17))
    }
  }),
  ...record({
    target: "sd-card-logger", label: "SD card data logger", protocol: "spi", filename: "sd_logger_example.ino",
    dependencies: [],
    notes: ["Uses the board-core SD library over hardware SPI.", "Format the card as FAT32 before first use."],
    generate: (params = {}) => {
      const csPin = asPin(params.csPin, 5);
      return `#include <SPI.h>\n#include <SD.h>\n\nconstexpr int CS_PIN = ${csPin};\n\nvoid setup() {\n  Serial.begin(115200);\n  if (!SD.begin(CS_PIN)) {\n    Serial.println("SD card mount failed");\n    while (true) delay(10);\n  }\n\n  File dataFile = SD.open("/log.csv", FILE_APPEND);\n  if (dataFile) {\n    dataFile.println("timestamp_ms,value");\n    dataFile.close();\n  }\n}\n\nvoid loop() {\n  File dataFile = SD.open("/log.csv", FILE_APPEND);\n  if (dataFile) {\n    dataFile.printf("%lu,%d\\n", millis(), analogRead(34));\n    dataFile.close();\n  } else {\n    Serial.println("Failed to open log.csv");\n  }\n  delay(1000);\n}\n`;
    },
    espidf: {
      notes: ["Uses ESP-IDF's sdspi host driver and the FATFS VFS layer (esp_vfs_fat_sdspi_mount) - the standard native way to log to an SD card.", "Format the card as FAT32 before first use."],
      generate: (params = {}) => sdLoggerEspIdf(asPin(params.csPin, 5))
    }
  }),
  ...record({
    target: "rotary-encoder", label: "Rotary encoder (quadrature)", protocol: "gpio", filename: "rotary_encoder_example.ino",
    dependencies: [],
    notes: ["Wire the encoder's common pin to GND and enable internal pull-ups on CLK/DT.", "The push-button (SW) pin, if present, is a separate active-low digital input."],
    generate: (params = {}) => {
      const clkPin = asPin(params.clkPin, 32);
      const dtPin = asPin(params.dtPin, 33);
      return `volatile int position = 0;\nconstexpr int CLK_PIN = ${clkPin};\nconstexpr int DT_PIN = ${dtPin};\nint lastClkState;\n\nvoid IRAM_ATTR onClkChange() {\n  int clkState = digitalRead(CLK_PIN);\n  if (clkState != lastClkState) {\n    if (digitalRead(DT_PIN) != clkState) position++;\n    else position--;\n  }\n  lastClkState = clkState;\n}\n\nvoid setup() {\n  Serial.begin(115200);\n  pinMode(CLK_PIN, INPUT_PULLUP);\n  pinMode(DT_PIN, INPUT_PULLUP);\n  lastClkState = digitalRead(CLK_PIN);\n  attachInterrupt(digitalPinToInterrupt(CLK_PIN), onClkChange, CHANGE);\n}\n\nvoid loop() {\n  static int lastReported = 0;\n  if (position != lastReported) {\n    Serial.print("Position: ");\n    Serial.println(position);\n    lastReported = position;\n  }\n  delay(10);\n}\n`;
    },
    espidf: {
      notes: ["Decodes the quadrature signal with a GPIO ISR, same approach as the Arduino version.", "Wire the encoder's common pin to GND; CLK/DT use internal pull-ups."],
      generate: (params = {}) => rotaryEncoderEspIdf(asPin(params.clkPin, 32), asPin(params.dtPin, 33))
    }
  }),
  espIdfOnly({
    target: "ble-client", label: "BLE GATT client (scanner)", protocol: "ble",
    dependencies: [{ name: "esp-idf", version: "v5.0+, Bluedroid enabled" }],
    notes: ["Scans for advertising BLE devices and logs their addresses - a connect-and-read client needs the full GATT client callback flow, which is why the Arduino/NimBLE variant remains the practical default for this target.", "Scanning continuously consumes significant power."],
    generate: () => bleScannerEspIdf()
  })
]);

function ssd1306EspIdf() {
  return `#include <string.h>\n#include "freertos/FreeRTOS.h"\n#include "freertos/task.h"\n#include "driver/i2c.h"\n\n#define I2C_MASTER_SCL_IO 22\n#define I2C_MASTER_SDA_IO 21\n#define I2C_MASTER_NUM    I2C_NUM_0\n#define I2C_MASTER_FREQ_HZ 400000\n#define OLED_ADDR 0x3C\n\nstatic void i2c_master_init(void)\n{\n    i2c_config_t conf = {\n        .mode = I2C_MODE_MASTER,\n        .sda_io_num = I2C_MASTER_SDA_IO,\n        .scl_io_num = I2C_MASTER_SCL_IO,\n        .sda_pullup_en = GPIO_PULLUP_ENABLE,\n        .scl_pullup_en = GPIO_PULLUP_ENABLE,\n        .master.clk_speed = I2C_MASTER_FREQ_HZ,\n    };\n    i2c_param_config(I2C_MASTER_NUM, &conf);\n    i2c_driver_install(I2C_MASTER_NUM, conf.mode, 0, 0, 0);\n}\n\nstatic void ssd1306_cmd(uint8_t cmd)\n{\n    uint8_t packet[2] = { 0x00, cmd }; // Co=0, D/C=0 (command)\n    i2c_master_write_to_device(I2C_MASTER_NUM, OLED_ADDR, packet, 2, pdMS_TO_TICKS(100));\n}\n\nstatic void ssd1306_init(void)\n{\n    const uint8_t init_sequence[] = {\n        0xAE,       // Display off\n        0xD5, 0x80, // Clock divide\n        0xA8, 0x3F, // Multiplex ratio (64 rows)\n        0xD3, 0x00, // Display offset\n        0x40,       // Start line 0\n        0x8D, 0x14, // Charge pump enable\n        0x20, 0x00, // Horizontal addressing mode\n        0xA1,       // Segment remap\n        0xC8,       // COM scan direction\n        0xDA, 0x12, // COM pins\n        0x81, 0xCF, // Contrast\n        0xD9, 0xF1, // Pre-charge\n        0xDB, 0x40, // VCOMH deselect\n        0xA4,       // Resume to RAM content\n        0xA6,       // Normal (not inverted) display\n        0xAF,       // Display on\n    };\n    for (size_t i = 0; i < sizeof(init_sequence); i++) ssd1306_cmd(init_sequence[i]);\n}\n\nstatic void ssd1306_fill_test_pattern(void)\n{\n    uint8_t page_buf[65];\n    page_buf[0] = 0x40; // Co=0, D/C=1 (data stream)\n    for (uint8_t page = 0; page < 8; page++) {\n        ssd1306_cmd(0xB0 + page); // Set page address\n        ssd1306_cmd(0x00);        // Lower column = 0\n        ssd1306_cmd(0x10);        // Higher column = 0\n        memset(&page_buf[1], (page % 2) ? 0xAA : 0x55, 64);\n        i2c_master_write_to_device(I2C_MASTER_NUM, OLED_ADDR, page_buf, sizeof(page_buf), pdMS_TO_TICKS(100));\n    }\n}\n\nvoid app_main(void)\n{\n    i2c_master_init();\n    ssd1306_init();\n    ssd1306_fill_test_pattern();\n    // A striped test pattern confirms the panel and wiring are alive; add u8g2 (idf-component-manager)\n    // for real text/graphics rendering.\n}\n`;
}

function lcd1602EspIdf() {
  return `#include "freertos/FreeRTOS.h"\n#include "freertos/task.h"\n#include "driver/i2c.h"\n#include "rom/ets_sys.h"\n\n#define I2C_MASTER_SCL_IO 22\n#define I2C_MASTER_SDA_IO 21\n#define I2C_MASTER_NUM    I2C_NUM_0\n#define I2C_MASTER_FREQ_HZ 100000\n#define LCD_ADDR 0x27\n#define LCD_BACKLIGHT 0x08\n#define ENABLE_BIT    0x04\n\nstatic void i2c_master_init(void)\n{\n    i2c_config_t conf = {\n        .mode = I2C_MODE_MASTER,\n        .sda_io_num = I2C_MASTER_SDA_IO,\n        .scl_io_num = I2C_MASTER_SCL_IO,\n        .sda_pullup_en = GPIO_PULLUP_ENABLE,\n        .scl_pullup_en = GPIO_PULLUP_ENABLE,\n        .master.clk_speed = I2C_MASTER_FREQ_HZ,\n    };\n    i2c_param_config(I2C_MASTER_NUM, &conf);\n    i2c_driver_install(I2C_MASTER_NUM, conf.mode, 0, 0, 0);\n}\n\nstatic void lcd_write_nibble(uint8_t nibble)\n{\n    uint8_t data = (nibble & 0xF0) | LCD_BACKLIGHT;\n    uint8_t withEnable = data | ENABLE_BIT;\n    i2c_master_write_to_device(I2C_MASTER_NUM, LCD_ADDR, &withEnable, 1, pdMS_TO_TICKS(100));\n    ets_delay_us(1);\n    i2c_master_write_to_device(I2C_MASTER_NUM, LCD_ADDR, &data, 1, pdMS_TO_TICKS(100));\n    ets_delay_us(50);\n}\n\nstatic void lcd_send(uint8_t value, bool isData)\n{\n    uint8_t rs = isData ? 0x01 : 0x00;\n    lcd_write_nibble((value & 0xF0) | rs);\n    lcd_write_nibble(((value << 4) & 0xF0) | rs);\n}\n\nstatic void lcd_command(uint8_t cmd) { lcd_send(cmd, false); }\nstatic void lcd_print(const char *text) { for (const char *c = text; *c; c++) lcd_send((uint8_t)*c, true); }\n\nstatic void lcd_init(void)\n{\n    vTaskDelay(50 / portTICK_PERIOD_MS);\n    lcd_write_nibble(0x30); vTaskDelay(5 / portTICK_PERIOD_MS);\n    lcd_write_nibble(0x30); vTaskDelay(1 / portTICK_PERIOD_MS);\n    lcd_write_nibble(0x30);\n    lcd_write_nibble(0x20); // Switch to 4-bit mode\n\n    lcd_command(0x28); // Function set: 4-bit, 2 line, 5x8 dots\n    lcd_command(0x0C); // Display on, cursor off\n    lcd_command(0x06); // Entry mode: increment cursor\n    lcd_command(0x01); // Clear display\n    vTaskDelay(2 / portTICK_PERIOD_MS);\n}\n\nvoid app_main(void)\n{\n    i2c_master_init();\n    lcd_init();\n    lcd_command(0x80); // Cursor to line 1\n    lcd_print("Hello, sensor!");\n\n    int seconds = 0;\n    while (1) {\n        char line[17];\n        snprintf(line, sizeof(line), "Uptime: %ds  ", seconds++);\n        lcd_command(0xC0); // Cursor to line 2\n        lcd_print(line);\n        vTaskDelay(1000 / portTICK_PERIOD_MS);\n    }\n}\n`;
}

function ds3231EspIdf() {
  return `#include <stdio.h>\n#include "freertos/FreeRTOS.h"\n#include "freertos/task.h"\n#include "driver/i2c.h"\n\n#define I2C_MASTER_SCL_IO 22\n#define I2C_MASTER_SDA_IO 21\n#define I2C_MASTER_NUM    I2C_NUM_0\n#define I2C_MASTER_FREQ_HZ 100000\n#define DS3231_ADDR 0x68\n\nstatic void i2c_master_init(void)\n{\n    i2c_config_t conf = {\n        .mode = I2C_MODE_MASTER,\n        .sda_io_num = I2C_MASTER_SDA_IO,\n        .scl_io_num = I2C_MASTER_SCL_IO,\n        .sda_pullup_en = GPIO_PULLUP_ENABLE,\n        .scl_pullup_en = GPIO_PULLUP_ENABLE,\n        .master.clk_speed = I2C_MASTER_FREQ_HZ,\n    };\n    i2c_param_config(I2C_MASTER_NUM, &conf);\n    i2c_driver_install(I2C_MASTER_NUM, conf.mode, 0, 0, 0);\n}\n\nstatic uint8_t bcd_to_dec(uint8_t bcd) { return ((bcd / 16) * 10) + (bcd % 16); }\n\nvoid app_main(void)\n{\n    i2c_master_init();\n\n    while (1) {\n        uint8_t reg = 0x00; // Seconds register, start of the time block\n        uint8_t raw[7];\n        if (i2c_master_write_read_device(I2C_MASTER_NUM, DS3231_ADDR, &reg, 1, raw, 7, pdMS_TO_TICKS(100)) != ESP_OK) {\n            printf("DS3231 not found at 0x%02X\\n", DS3231_ADDR);\n            vTaskDelay(1000 / portTICK_PERIOD_MS);\n            continue;\n        }\n\n        uint8_t seconds = bcd_to_dec(raw[0] & 0x7F);\n        uint8_t minutes = bcd_to_dec(raw[1]);\n        uint8_t hours   = bcd_to_dec(raw[2] & 0x3F);\n        uint8_t day     = bcd_to_dec(raw[4]);\n        uint8_t month   = bcd_to_dec(raw[5] & 0x1F);\n        uint8_t year    = bcd_to_dec(raw[6]);\n\n        printf("20%02d-%02d-%02d %02d:%02d:%02d\\n", year, month, day, hours, minutes, seconds);\n        vTaskDelay(1000 / portTICK_PERIOD_MS);\n    }\n}\n`;
}

function bno055EspIdf() {
  return `#include <stdio.h>\n#include "freertos/FreeRTOS.h"\n#include "freertos/task.h"\n#include "driver/i2c.h"\n\n#define I2C_MASTER_SCL_IO 22\n#define I2C_MASTER_SDA_IO 21\n#define I2C_MASTER_NUM    I2C_NUM_0\n#define I2C_MASTER_FREQ_HZ 100000\n#define BNO055_ADDR 0x28\n#define BNO055_OPR_MODE_REG 0x3D\n#define BNO055_NDOF_MODE     0x0C\n#define BNO055_EULER_H_LSB   0x1A\n\nstatic void i2c_master_init(void)\n{\n    i2c_config_t conf = {\n        .mode = I2C_MODE_MASTER,\n        .sda_io_num = I2C_MASTER_SDA_IO,\n        .scl_io_num = I2C_MASTER_SCL_IO,\n        .sda_pullup_en = GPIO_PULLUP_ENABLE,\n        .scl_pullup_en = GPIO_PULLUP_ENABLE,\n        .master.clk_speed = I2C_MASTER_FREQ_HZ,\n    };\n    i2c_param_config(I2C_MASTER_NUM, &conf);\n    i2c_driver_install(I2C_MASTER_NUM, conf.mode, 0, 0, 0);\n}\n\nvoid app_main(void)\n{\n    i2c_master_init();\n\n    uint8_t set_mode[2] = { BNO055_OPR_MODE_REG, BNO055_NDOF_MODE };\n    if (i2c_master_write_to_device(I2C_MASTER_NUM, BNO055_ADDR, set_mode, 2, pdMS_TO_TICKS(100)) != ESP_OK) {\n        printf("BNO055 not found at 0x%02X\\n", BNO055_ADDR);\n        return;\n    }\n    vTaskDelay(20 / portTICK_PERIOD_MS); // Mode-switch settling time\n\n    while (1) {\n        uint8_t reg = BNO055_EULER_H_LSB;\n        uint8_t raw[6];\n        i2c_master_write_read_device(I2C_MASTER_NUM, BNO055_ADDR, &reg, 1, raw, 6, pdMS_TO_TICKS(100));\n\n        int16_t heading = (raw[1] << 8) | raw[0];\n        int16_t roll    = (raw[3] << 8) | raw[2];\n        int16_t pitch   = (raw[5] << 8) | raw[4];\n\n        // Euler registers report 1 LSB = 1/16 degree.\n        printf("Heading: %.2f  Roll: %.2f  Pitch: %.2f\\n", heading / 16.0, roll / 16.0, pitch / 16.0);\n        vTaskDelay(100 / portTICK_PERIOD_MS);\n    }\n}\n`;
}

function sgp30EspIdf() {
  return `#include <stdio.h>\n#include "freertos/FreeRTOS.h"\n#include "freertos/task.h"\n#include "driver/i2c.h"\n\n#define I2C_MASTER_SCL_IO 22\n#define I2C_MASTER_SDA_IO 21\n#define I2C_MASTER_NUM    I2C_NUM_0\n#define I2C_MASTER_FREQ_HZ 100000\n#define SGP30_ADDR 0x58\n\nstatic void i2c_master_init(void)\n{\n    i2c_config_t conf = {\n        .mode = I2C_MODE_MASTER,\n        .sda_io_num = I2C_MASTER_SDA_IO,\n        .scl_io_num = I2C_MASTER_SCL_IO,\n        .sda_pullup_en = GPIO_PULLUP_ENABLE,\n        .scl_pullup_en = GPIO_PULLUP_ENABLE,\n        .master.clk_speed = I2C_MASTER_FREQ_HZ,\n    };\n    i2c_param_config(I2C_MASTER_NUM, &conf);\n    i2c_driver_install(I2C_MASTER_NUM, conf.mode, 0, 0, 0);\n}\n\n// Sensirion CRC-8: polynomial 0x31, init 0xFF.\nstatic uint8_t sensirion_crc8(const uint8_t *data, size_t len)\n{\n    uint8_t crc = 0xFF;\n    for (size_t i = 0; i < len; i++) {\n        crc ^= data[i];\n        for (int bit = 0; bit < 8; bit++) {\n            crc = (crc & 0x80) ? (crc << 1) ^ 0x31 : (crc << 1);\n        }\n    }\n    return crc;\n}\n\nstatic void sgp30_send_command(uint16_t command)\n{\n    uint8_t packet[2] = { command >> 8, command & 0xFF };\n    i2c_master_write_to_device(I2C_MASTER_NUM, SGP30_ADDR, packet, 2, pdMS_TO_TICKS(100));\n}\n\nvoid app_main(void)\n{\n    i2c_master_init();\n\n    sgp30_send_command(0x2003); // sgp30_iaq_init\n    vTaskDelay(10 / portTICK_PERIOD_MS);\n\n    while (1) {\n        sgp30_send_command(0x2008); // sgp30_measure_iaq\n        vTaskDelay(12 / portTICK_PERIOD_MS); // Measurement duration\n\n        uint8_t raw[6];\n        if (i2c_master_read_from_device(I2C_MASTER_NUM, SGP30_ADDR, raw, 6, pdMS_TO_TICKS(100)) == ESP_OK) {\n            if (sensirion_crc8(raw, 2) == raw[2] && sensirion_crc8(raw + 3, 2) == raw[5]) {\n                uint16_t eco2 = (raw[0] << 8) | raw[1];\n                uint16_t tvoc = (raw[3] << 8) | raw[4];\n                printf("eCO2: %d ppm  TVOC: %d ppb\\n", eco2, tvoc);\n            } else {\n                printf("SGP30 CRC check failed\\n");\n            }\n        }\n        vTaskDelay(1000 / portTICK_PERIOD_MS);\n    }\n}\n`;
}

function ina219EspIdf() {
  return `#include <stdio.h>\n#include "freertos/FreeRTOS.h"\n#include "freertos/task.h"\n#include "driver/i2c.h"\n\n#define I2C_MASTER_SCL_IO 22\n#define I2C_MASTER_SDA_IO 21\n#define I2C_MASTER_NUM    I2C_NUM_0\n#define I2C_MASTER_FREQ_HZ 100000\n#define INA219_ADDR 0x40\n#define REG_CONFIG      0x00\n#define REG_SHUNT       0x01\n#define REG_BUS         0x02\n#define REG_POWER       0x03\n#define REG_CURRENT     0x04\n#define REG_CALIBRATION 0x05\n\nstatic void i2c_master_init(void)\n{\n    i2c_config_t conf = {\n        .mode = I2C_MODE_MASTER,\n        .sda_io_num = I2C_MASTER_SDA_IO,\n        .scl_io_num = I2C_MASTER_SCL_IO,\n        .sda_pullup_en = GPIO_PULLUP_ENABLE,\n        .scl_pullup_en = GPIO_PULLUP_ENABLE,\n        .master.clk_speed = I2C_MASTER_FREQ_HZ,\n    };\n    i2c_param_config(I2C_MASTER_NUM, &conf);\n    i2c_driver_install(I2C_MASTER_NUM, conf.mode, 0, 0, 0);\n}\n\nstatic void write_reg16(uint8_t reg, uint16_t value)\n{\n    uint8_t packet[3] = { reg, value >> 8, value & 0xFF };\n    i2c_master_write_to_device(I2C_MASTER_NUM, INA219_ADDR, packet, 3, pdMS_TO_TICKS(100));\n}\n\nstatic int16_t read_reg16(uint8_t reg)\n{\n    uint8_t raw[2];\n    i2c_master_write_read_device(I2C_MASTER_NUM, INA219_ADDR, &reg, 1, raw, 2, pdMS_TO_TICKS(100));\n    return (raw[0] << 8) | raw[1];\n}\n\nvoid app_main(void)\n{\n    i2c_master_init();\n\n    // Default Adafruit calibration: 0.1ohm shunt, 32V/2A range -> current LSB = 100uA, cal = 4096.\n    write_reg16(REG_CALIBRATION, 4096);\n    write_reg16(REG_CONFIG, 0x399F); // 32V range, 320mV shunt range, 12-bit, continuous\n\n    while (1) {\n        uint16_t busRaw = read_reg16(REG_BUS);\n        float busVoltage = (busRaw >> 3) * 0.004f; // LSB = 4mV, right-aligned after status bits\n        float current_mA = read_reg16(REG_CURRENT) * 0.1f; // 100uA LSB -> mA\n        float power_mW = read_reg16(REG_POWER) * 2.0f;     // Power LSB = 20x current LSB\n\n        printf("Bus: %.2fV  Current: %.1fmA  Power: %.1fmW\\n", busVoltage, current_mA, power_mW);\n        vTaskDelay(500 / portTICK_PERIOD_MS);\n    }\n}\n`;
}

function neo6mEspIdf(rxPin, txPin) {
  return `#include <stdio.h>\n#include <string.h>\n#include <stdlib.h>\n#include "freertos/FreeRTOS.h"\n#include "freertos/task.h"\n#include "driver/uart.h"\n\n#define GPS_UART_NUM UART_NUM_1\n#define GPS_RX_PIN   ${rxPin}\n#define GPS_TX_PIN   ${txPin}\n#define GPS_BAUD     9600\n\nstatic double nmea_to_decimal(const char *field, char hemisphere)\n{\n    double raw = atof(field);\n    int degrees = (int)(raw / 100);\n    double minutes = raw - (degrees * 100);\n    double decimal = degrees + minutes / 60.0;\n    if (hemisphere == 'S' || hemisphere == 'W') decimal = -decimal;\n    return decimal;\n}\n\n// Minimal $GPGGA parser: $GPGGA,time,lat,N/S,lon,E/W,fix,sats,hdop,alt,...\nstatic void parse_gpgga(char *sentence)\n{\n    char *fields[15] = { 0 };\n    int count = 0;\n    char *token = strtok(sentence, ",");\n    while (token && count < 15) { fields[count++] = token; token = strtok(NULL, ","); }\n    if (count < 6 || fields[2][0] == '\\0') return; // No fix yet\n\n    double lat = nmea_to_decimal(fields[2], fields[3][0]);\n    double lng = nmea_to_decimal(fields[4], fields[5][0]);\n    printf("Lat: %.6f  Lng: %.6f\\n", lat, lng);\n}\n\nvoid app_main(void)\n{\n    uart_config_t uart_config = {\n        .baud_rate = GPS_BAUD,\n        .data_bits = UART_DATA_8_BITS,\n        .parity = UART_PARITY_DISABLE,\n        .stop_bits = UART_STOP_BITS_1,\n        .flow_ctrl = UART_HW_FLOWCTRL_DISABLE,\n    };\n    uart_driver_install(GPS_UART_NUM, 1024, 0, 0, NULL, 0);\n    uart_param_config(GPS_UART_NUM, &uart_config);\n    uart_set_pin(GPS_UART_NUM, GPS_TX_PIN, GPS_RX_PIN, UART_PIN_NO_CHANGE, UART_PIN_NO_CHANGE);\n\n    char line[128];\n    int pos = 0;\n    uint8_t byte;\n    while (1) {\n        int len = uart_read_bytes(GPS_UART_NUM, &byte, 1, pdMS_TO_TICKS(1000));\n        if (len <= 0) continue;\n        if (byte == '\\n') {\n            line[pos] = '\\0';\n            if (strncmp(line, "$GPGGA", 6) == 0) parse_gpgga(line);\n            pos = 0;\n        } else if (byte != '\\r' && pos < (int)sizeof(line) - 1) {\n            line[pos++] = (char)byte;\n        }\n    }\n}\n`;
}

function sdLoggerEspIdf(csPin) {
  return `#include <stdio.h>\n#include "esp_vfs_fat.h"\n#include "driver/sdspi_host.h"\n#include "sdmmc_cmd.h"\n#include "freertos/FreeRTOS.h"\n#include "freertos/task.h"\n\n#define PIN_NUM_MISO 19\n#define PIN_NUM_MOSI 23\n#define PIN_NUM_CLK  18\n#define PIN_NUM_CS   ${csPin}\n\nvoid app_main(void)\n{\n    esp_vfs_fat_sdmmc_mount_config_t mount_config = {\n        .format_if_mount_failed = false,\n        .max_files = 5,\n    };\n\n    sdmmc_host_t host = SDSPI_HOST_DEFAULT();\n    spi_bus_config_t bus_cfg = {\n        .mosi_io_num = PIN_NUM_MOSI,\n        .miso_io_num = PIN_NUM_MISO,\n        .sclk_io_num = PIN_NUM_CLK,\n        .quadwp_io_num = -1,\n        .quadhd_io_num = -1,\n    };\n    spi_bus_initialize(host.slot, &bus_cfg, SPI_DMA_CH_AUTO);\n\n    sdspi_device_config_t slot_config = SDSPI_DEVICE_CONFIG_DEFAULT();\n    slot_config.gpio_cs = PIN_NUM_CS;\n    slot_config.host_id = host.slot;\n\n    sdmmc_card_t *card;\n    esp_err_t ret = esp_vfs_fat_sdspi_mount("/sdcard", &host, &slot_config, &mount_config, &card);\n    if (ret != ESP_OK) {\n        printf("SD card mount failed (0x%x) - check wiring and that it's formatted FAT32\\n", ret);\n        return;\n    }\n\n    FILE *header = fopen("/sdcard/log.csv", "a");\n    if (header) { fprintf(header, "timestamp_ms,value\\n"); fclose(header); }\n\n    int tick = 0;\n    while (1) {\n        FILE *f = fopen("/sdcard/log.csv", "a");\n        if (f) {\n            fprintf(f, "%d,%d\\n", tick * 1000, tick % 100);\n            fclose(f);\n        } else {\n            printf("Failed to open log.csv\\n");\n        }\n        tick++;\n        vTaskDelay(1000 / portTICK_PERIOD_MS);\n    }\n}\n`;
}

function rotaryEncoderEspIdf(clkPin, dtPin) {
  return `#include <stdio.h>\n#include "freertos/FreeRTOS.h"\n#include "freertos/task.h"\n#include "driver/gpio.h"\n#include "esp_attr.h"\n\n#define CLK_PIN ${clkPin}\n#define DT_PIN  ${dtPin}\n\nstatic volatile int position = 0;\nstatic volatile int last_clk_state = 0;\n\nstatic void IRAM_ATTR clk_isr_handler(void *arg)\n{\n    int clk_state = gpio_get_level(CLK_PIN);\n    if (clk_state != last_clk_state) {\n        if (gpio_get_level(DT_PIN) != clk_state) position++;\n        else position--;\n    }\n    last_clk_state = clk_state;\n}\n\nvoid app_main(void)\n{\n    gpio_config_t io_conf = {\n        .pin_bit_mask = (1ULL << CLK_PIN) | (1ULL << DT_PIN),\n        .mode = GPIO_MODE_INPUT,\n        .pull_up_en = GPIO_PULLUP_ENABLE,\n        .intr_type = GPIO_INTR_ANYEDGE,\n    };\n    gpio_config(&io_conf);\n\n    last_clk_state = gpio_get_level(CLK_PIN);\n\n    gpio_install_isr_service(0);\n    gpio_isr_handler_add(CLK_PIN, clk_isr_handler, NULL);\n\n    int last_reported = 0;\n    while (1) {\n        if (position != last_reported) {\n            printf("Position: %d\\n", position);\n            last_reported = position;\n        }\n        vTaskDelay(10 / portTICK_PERIOD_MS);\n    }\n}\n`;
}

function bleScannerEspIdf() {
  return `#include "esp_bt.h"\n#include "esp_bt_main.h"\n#include "esp_gap_ble_api.h"\n#include "esp_log.h"\n\nstatic const char *TAG = "ble_scanner";\n\nstatic void gap_event_handler(esp_gap_ble_cb_event_t event, esp_ble_gap_cb_param_t *param)\n{\n    if (event == ESP_GAP_BLE_SCAN_RESULT_EVT && param->scan_rst.search_evt == ESP_GAP_SEARCH_INQ_RES_EVT) {\n        ESP_LOGI(TAG, "Found device, RSSI %d", param->scan_rst.rssi);\n    }\n}\n\nvoid app_main(void)\n{\n    esp_bt_controller_config_t bt_cfg = BT_CONTROLLER_INIT_CONFIG_DEFAULT();\n    esp_bt_controller_init(&bt_cfg);\n    esp_bt_controller_enable(ESP_BT_MODE_BLE);\n    esp_bluedroid_init();\n    esp_bluedroid_enable();\n\n    esp_ble_gap_register_callback(gap_event_handler);\n\n    static esp_ble_scan_params_t scan_params = {\n        .scan_type = BLE_SCAN_TYPE_ACTIVE,\n        .own_addr_type = BLE_ADDR_TYPE_PUBLIC,\n        .scan_filter_policy = BLE_SCAN_FILTER_ALLOW_ALL,\n        .scan_interval = 0x50,\n        .scan_window = 0x30,\n    };\n    esp_ble_gap_set_scan_params(&scan_params);\n    esp_ble_gap_start_scanning(30); // Scan for 30 seconds\n\n    ESP_LOGI(TAG, "BLE scan started");\n}\n`;
}
