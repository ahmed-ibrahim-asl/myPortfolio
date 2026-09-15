(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,15004,e=>{"use strict";var i=e.i(43476),t=e.i(71645);function n({examples:e,activeExampleId:t,onSelect:r}){return(0,i.jsxs)("section",{className:"embedded-examples","aria-labelledby":"embedded-examples-title",children:[(0,i.jsxs)("div",{className:"embedded-section-heading",children:[(0,i.jsx)("span",{className:"mono",children:"EXAMPLES"}),(0,i.jsx)("h2",{id:"embedded-examples-title",children:"Start from a familiar build"})]}),(0,i.jsx)("div",{className:"embedded-example-grid",children:e.map(e=>(0,i.jsxs)("button",{className:`embedded-example-card${t===e.id?" is-active":""}`,type:"button","aria-pressed":t===e.id,onClick:()=>r(e),children:[(0,i.jsx)("strong",{children:e.title}),(0,i.jsx)("span",{children:e.summary})]},e.id))})]})}function r({code:e,label:n="TERMINAL_OUTPUT"}){let[a,o]=(0,t.useState)(!1);return(0,i.jsxs)("div",{className:"terminal-code-block",children:[(0,i.jsxs)("div",{className:"terminal-code-header",children:[(0,i.jsxs)("div",{className:"terminal-code-label",children:[(0,i.jsx)("span",{children:">"}),(0,i.jsx)("span",{children:n})]}),(0,i.jsx)("button",{onClick:()=>{navigator.clipboard.writeText(e),o(!0),setTimeout(()=>o(!1),2e3)},className:"terminal-code-copy",children:a?"COPIED":"COPY"})]}),(0,i.jsx)("pre",{className:"terminal-code-pre",children:(0,i.jsx)("code",{children:e})})]})}var a=e.i(8380);let o=(e,i)=>Number.isInteger(e)?e:i;function s(e){return`0x${e.toString(16).toUpperCase()}`}function l({target:e,label:i,protocol:t,filename:n,dependencies:r=[],notes:a,generate:o,espidf:s}){let d=Object.freeze({id:`${e}-arduino-${t}`,target:e,label:i,environment:"arduino",environmentLabel:"Arduino IDE",protocol:t,protocolLabel:t.toUpperCase(),language:"cpp",filename:n,dependencies:Object.freeze(r),notes:Object.freeze(a),generate:o}),_=Object.freeze({...d,id:`${e}-platformio-${t}`,environment:"platformio",environmentLabel:"PlatformIO / Arduino",filename:n.endsWith(".ino")?"main.cpp":n,generate:(e={})=>{var i;return(i=o(e)).includes("#include <Arduino.h>")?i:`#include <Arduino.h>
${i}`}}),c=[d,_];return s&&c.push(Object.freeze({id:`${e}-esp-idf-${t}`,target:e,label:i,environment:"esp-idf",environmentLabel:"ESP-IDF",protocol:t,protocolLabel:t.toUpperCase(),language:"c",filename:"main.c",dependencies:Object.freeze(s.dependencies??[]),notes:Object.freeze(s.notes??a),generate:s.generate})),c}function d({target:e,label:i,protocol:t,dependencies:n=[],notes:r,generate:a}){return Object.freeze({id:`${e}-esp-idf-${t}`,target:e,label:i,environment:"esp-idf",environmentLabel:"ESP-IDF",protocol:t,protocolLabel:t.toUpperCase(),language:"c",filename:"main.c",dependencies:Object.freeze(n),notes:Object.freeze(r),generate:a})}let _=Object.freeze([...l({target:"bmp280",label:"BMP280 pressure sensor",protocol:"i2c",filename:"bmp280_example.ino",dependencies:[{name:"Adafruit BMP280 Library",version:"^2.6.8"}],notes:["The common I2C addresses are 0x76 and 0x77.","Use 3.3V logic with ESP32 boards."],generate:(e={})=>{let i="0x77"===e.i2cAddress?"0x77":"0x76";return`#include <Wire.h>
#include <Adafruit_BMP280.h>

Adafruit_BMP280 bmp;

void setup() {
  Serial.begin(115200);
  Wire.begin();
  if (!bmp.begin(${i})) {
    Serial.println("BMP280 not found; check wiring and address");
    while (true) delay(10);
  }
}

void loop() {
  Serial.print("Temperature C: "); Serial.println(bmp.readTemperature());
  Serial.print("Pressure hPa: "); Serial.println(bmp.readPressure() / 100.0F);
  delay(1000);
}
`},espidf:{dependencies:[{name:"esp-idf",version:"v5.0+"}],notes:["Uses the standard ESP-IDF i2c master driver.","Implements the Bosch fixed-point compensation formulas directly - no external component required."],generate:(e={})=>p({address:"0x77"===e.i2cAddress?119:118,withHumidity:!1})}}),...l({target:"ds18b20",label:"DS18B20 temperature sensor",protocol:"onewire",filename:"ds18b20_example.ino",dependencies:[{name:"DallasTemperature",version:"^3.11.0"},{name:"OneWire",version:"^2.3.8"}],notes:["Add a 4.7kΩ pull-up from DATA to VCC.","Several sensors can share one OneWire bus."],generate:(e={})=>{let i=o(e.dataPin,4);return`#include <OneWire.h>
#include <DallasTemperature.h>

constexpr int ONE_WIRE_PIN = ${i};
OneWire oneWire(ONE_WIRE_PIN);
DallasTemperature sensors(&oneWire);

void setup() {
  Serial.begin(115200);
  sensors.begin();
}

void loop() {
  sensors.requestTemperatures();
  Serial.print("Temperature C: ");
  Serial.println(sensors.getTempCByIndex(0));
  delay(1000);
}
`},espidf:{notes:["Bit-bangs the OneWire reset/read/write timing directly with esp_rom_delay_us - no RMT or external component required.","Add a 4.7kΩ pull-up from DATA to VCC."],generate:(e={})=>{var i;return i=o(e.dataPin,4),`#include <stdio.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/gpio.h"
#include "rom/ets_sys.h"

#define ONE_WIRE_PIN ${i}

static void ow_write_bit(int bit)
{
    gpio_set_direction(ONE_WIRE_PIN, GPIO_MODE_OUTPUT);
    gpio_set_level(ONE_WIRE_PIN, 0);
    ets_delay_us(bit ? 6 : 60);
    gpio_set_level(ONE_WIRE_PIN, 1);
    ets_delay_us(bit ? 64 : 10);
}

static int ow_read_bit(void)
{
    gpio_set_direction(ONE_WIRE_PIN, GPIO_MODE_OUTPUT);
    gpio_set_level(ONE_WIRE_PIN, 0);
    ets_delay_us(3);
    gpio_set_direction(ONE_WIRE_PIN, GPIO_MODE_INPUT);
    ets_delay_us(10);
    int bit = gpio_get_level(ONE_WIRE_PIN);
    ets_delay_us(53);
    return bit;
}

static int ow_reset(void)
{
    gpio_set_direction(ONE_WIRE_PIN, GPIO_MODE_OUTPUT);
    gpio_set_level(ONE_WIRE_PIN, 0);
    ets_delay_us(480);
    gpio_set_direction(ONE_WIRE_PIN, GPIO_MODE_INPUT);
    ets_delay_us(70);
    int presence = !gpio_get_level(ONE_WIRE_PIN);
    ets_delay_us(410);
    return presence;
}

static void ow_write_byte(uint8_t byte)
{
    for (int i = 0; i < 8; i++) { ow_write_bit(byte & 0x01); byte >>= 1; }
}

static uint8_t ow_read_byte(void)
{
    uint8_t byte = 0;
    for (int i = 0; i < 8; i++) byte |= (ow_read_bit() << i);
    return byte;
}

void app_main(void)
{
    gpio_reset_pin(ONE_WIRE_PIN);

    while (1) {
        if (!ow_reset()) {
            printf("DS18B20 not responding - check the pull-up and wiring\\n");
            vTaskDelay(1000 / portTICK_PERIOD_MS);
            continue;
        }
        ow_write_byte(0xCC); // Skip ROM (single-device bus)
        ow_write_byte(0x44); // Convert T
        vTaskDelay(750 / portTICK_PERIOD_MS); // 12-bit conversion time

        ow_reset();
        ow_write_byte(0xCC);
        ow_write_byte(0xBE); // Read scratchpad
        uint8_t lsb = ow_read_byte();
        uint8_t msb = ow_read_byte();
        int16_t raw = (msb << 8) | lsb;
        printf("Temperature C: %.2f\\n", raw / 16.0);

        vTaskDelay(1000 / portTICK_PERIOD_MS);
    }
}
`}}}),...l({target:"bh1750",label:"BH1750 light sensor",protocol:"i2c",filename:"bh1750_example.ino",dependencies:[{name:"BH1750",version:"^1.3.0"}],notes:["Default address is normally 0x23.","Keep the sensor window clear of shadows from the enclosure."],generate:()=>`#include <Wire.h>
#include <BH1750.h>

BH1750 lightMeter;

void setup() {
  Serial.begin(115200);
  Wire.begin();
  if (!lightMeter.begin()) {
    Serial.println("BH1750 not found");
    while (true) delay(10);
  }
}

void loop() {
  Serial.print("Light lx: ");
  Serial.println(lightMeter.readLightLevel());
  delay(500);
}
`,espidf:{notes:["Reads the 2-byte lux result directly over the ESP-IDF i2c master driver - no external component required.","Default address is 0x23; tie ADDR high for 0x5C."],generate:()=>`#include <stdio.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/i2c.h"

#define I2C_MASTER_SCL_IO 22
#define I2C_MASTER_SDA_IO 21
#define I2C_MASTER_NUM    I2C_NUM_0
#define I2C_MASTER_FREQ_HZ 100000
#define BH1750_ADDR 0x23
#define BH1750_CONT_HIGH_RES_MODE 0x10

static void i2c_master_init(void)
{
    i2c_config_t conf = {
        .mode = I2C_MODE_MASTER,
        .sda_io_num = I2C_MASTER_SDA_IO,
        .scl_io_num = I2C_MASTER_SCL_IO,
        .sda_pullup_en = GPIO_PULLUP_ENABLE,
        .scl_pullup_en = GPIO_PULLUP_ENABLE,
        .master.clk_speed = I2C_MASTER_FREQ_HZ,
    };
    i2c_param_config(I2C_MASTER_NUM, &conf);
    i2c_driver_install(I2C_MASTER_NUM, conf.mode, 0, 0, 0);
}

void app_main(void)
{
    i2c_master_init();

    uint8_t mode = BH1750_CONT_HIGH_RES_MODE;
    if (i2c_master_write_to_device(I2C_MASTER_NUM, BH1750_ADDR, &mode, 1, pdMS_TO_TICKS(100)) != ESP_OK) {
        printf("BH1750 not found at 0x%02X\\n", BH1750_ADDR);
        return;
    }

    while (1) {
        vTaskDelay(180 / portTICK_PERIOD_MS); // High-res measurement time
        uint8_t raw[2];
        if (i2c_master_read_from_device(I2C_MASTER_NUM, BH1750_ADDR, raw, 2, pdMS_TO_TICKS(100)) == ESP_OK) {
            float lux = ((raw[0] << 8) | raw[1]) / 1.2f;
            printf("Light lx: %.1f\\n", lux);
        }
        vTaskDelay(320 / portTICK_PERIOD_MS);
    }
}
`}}),...l({target:"vl53l0x",label:"VL53L0X time-of-flight sensor",protocol:"i2c",filename:"vl53l0x_example.ino",dependencies:[{name:"Adafruit VL53L0X",version:"^1.2.4"}],notes:["The default address is 0x29.","Use the XSHUT pin when assigning unique addresses to multiple sensors."],generate:()=>`#include <Wire.h>
#include <Adafruit_VL53L0X.h>

Adafruit_VL53L0X tof;

void setup() {
  Serial.begin(115200);
  Wire.begin();
  if (!tof.begin()) {
    Serial.println("VL53L0X not found");
    while (true) delay(10);
  }
}

void loop() {
  VL53L0X_RangingMeasurementData_t measure;
  tof.rangingTest(&measure, false);
  if (measure.RangeStatus != 4) Serial.println(measure.RangeMilliMeter);
  else Serial.println("Out of range");
  delay(200);
}
`,espidf:{dependencies:[{name:"espressif/vl53l0x",version:"idf-component-manager"}],notes:["VL53L0X's power-up/SPAD calibration sequence is proprietary ST init data - it is not safe to hand-reimplement from scratch, so this pulls the maintained component instead of bit-banging registers.",'Add it with: idf.py add-dependency "espressif/vl53l0x^1.0.1" (or add it under dependencies in idf_component.yml).'],generate:()=>`#include <stdio.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/i2c.h"
#include "vl53l0x_api.h"

#define I2C_MASTER_SCL_IO 22
#define I2C_MASTER_SDA_IO 21
#define I2C_MASTER_NUM    I2C_NUM_0
#define I2C_MASTER_FREQ_HZ 100000

static VL53L0X_Dev_t vl53l0x_dev;

static void i2c_master_init(void)
{
    i2c_config_t conf = {
        .mode = I2C_MODE_MASTER,
        .sda_io_num = I2C_MASTER_SDA_IO,
        .scl_io_num = I2C_MASTER_SCL_IO,
        .sda_pullup_en = GPIO_PULLUP_ENABLE,
        .scl_pullup_en = GPIO_PULLUP_ENABLE,
        .master.clk_speed = I2C_MASTER_FREQ_HZ,
    };
    i2c_param_config(I2C_MASTER_NUM, &conf);
    i2c_driver_install(I2C_MASTER_NUM, conf.mode, 0, 0, 0);
}

void app_main(void)
{
    i2c_master_init();

    vl53l0x_dev.I2cDevAddr = 0x29;
    vl53l0x_dev.i2c_port_num = I2C_MASTER_NUM;

    VL53L0X_Error status = VL53L0X_DataInit(&vl53l0x_dev);
    status |= VL53L0X_StaticInit(&vl53l0x_dev);
    status |= VL53L0X_PerformRefSpadManagement(&vl53l0x_dev, NULL, NULL);
    status |= VL53L0X_PerformRefCalibration(&vl53l0x_dev, NULL, NULL);
    status |= VL53L0X_SetDeviceMode(&vl53l0x_dev, VL53L0X_DEVICEMODE_SINGLE_RANGING);

    if (status != VL53L0X_ERROR_NONE) {
        printf("VL53L0X init failed: %d\\n", status);
        return;
    }

    while (1) {
        VL53L0X_RangingMeasurementData_t data;
        VL53L0X_PerformSingleRangingMeasurement(&vl53l0x_dev, &data);
        if (data.RangeStatus == 0) {
            printf("Distance mm: %d\\n", data.RangeMilliMeter);
        } else {
            printf("Out of range (status %d)\\n", data.RangeStatus);
        }
        vTaskDelay(200 / portTICK_PERIOD_MS);
    }
}
`}}),...l({target:"ads1115",label:"ADS1115 precision ADC",protocol:"i2c",filename:"ads1115_example.ino",dependencies:[{name:"Adafruit ADS1X15",version:"^2.5.0"}],notes:["The default address is 0x48.","The input must remain inside the configured gain range."],generate:()=>`#include <Wire.h>
#include <Adafruit_ADS1X15.h>

Adafruit_ADS1115 ads;

void setup() {
  Serial.begin(115200);
  if (!ads.begin()) {
    Serial.println("ADS1115 not found");
    while (true) delay(10);
  }
  ads.setGain(GAIN_ONE);
}

void loop() {
  int16_t raw = ads.readADC_SingleEnded(0);
  Serial.print("A0 raw: "); Serial.println(raw);
  delay(500);
}
`,espidf:{notes:["Writes the config register and reads back the conversion register directly - no external component required.","Default address is 0x48 (ADDR tied to GND)."],generate:()=>`#include <stdio.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/i2c.h"

#define I2C_MASTER_SCL_IO 22
#define I2C_MASTER_SDA_IO 21
#define I2C_MASTER_NUM    I2C_NUM_0
#define I2C_MASTER_FREQ_HZ 100000
#define ADS1115_ADDR 0x48
#define ADS1115_REG_CONVERSION 0x00
#define ADS1115_REG_CONFIG     0x01

static void i2c_master_init(void)
{
    i2c_config_t conf = {
        .mode = I2C_MODE_MASTER,
        .sda_io_num = I2C_MASTER_SDA_IO,
        .scl_io_num = I2C_MASTER_SCL_IO,
        .sda_pullup_en = GPIO_PULLUP_ENABLE,
        .scl_pullup_en = GPIO_PULLUP_ENABLE,
        .master.clk_speed = I2C_MASTER_FREQ_HZ,
    };
    i2c_param_config(I2C_MASTER_NUM, &conf);
    i2c_driver_install(I2C_MASTER_NUM, conf.mode, 0, 0, 0);
}

void app_main(void)
{
    i2c_master_init();

    while (1) {
        // Single-shot, AIN0 vs GND, +-4.096V gain (GAIN_ONE), 128 SPS, start conversion.
        uint8_t config[3] = { ADS1115_REG_CONFIG, 0xC3, 0x83 };
        if (i2c_master_write_to_device(I2C_MASTER_NUM, ADS1115_ADDR, config, 3, pdMS_TO_TICKS(100)) != ESP_OK) {
            printf("ADS1115 not found at 0x%02X\\n", ADS1115_ADDR);
            vTaskDelay(1000 / portTICK_PERIOD_MS);
            continue;
        }
        vTaskDelay(10 / portTICK_PERIOD_MS); // Conversion time at 128 SPS

        uint8_t reg = ADS1115_REG_CONVERSION;
        uint8_t raw[2];
        i2c_master_write_read_device(I2C_MASTER_NUM, ADS1115_ADDR, &reg, 1, raw, 2, pdMS_TO_TICKS(100));
        int16_t value = (raw[0] << 8) | raw[1];
        printf("A0 raw: %d\\n", value);

        vTaskDelay(500 / portTICK_PERIOD_MS);
    }
}
`}}),...l({target:"hx711",label:"HX711 load-cell amplifier",protocol:"gpio",filename:"hx711_scale.ino",dependencies:[{name:"HX711 Arduino Library",version:"^0.7.5"}],notes:["Calibrate with a known mass before trusting measurements.","Keep load-cell wiring away from motors and switching supplies."],generate:(e={})=>{let i=o(e.dataPin,19),t=o(e.clockPin,18),n=Number.isFinite(e.calibrationFactor)?e.calibrationFactor:-7050;return`#include <HX711.h>

HX711 scale;
constexpr int DATA_PIN = ${i};
constexpr int CLOCK_PIN = ${t};

void setup() {
  Serial.begin(115200);
  scale.begin(DATA_PIN, CLOCK_PIN);
  scale.set_scale(${n});
  scale.tare();
}

void loop() {
  if (scale.is_ready()) Serial.println(scale.get_units(10));
  else Serial.println("HX711 not ready");
  delay(500);
}
`},espidf:{notes:["Bit-bangs the HX711's 2-wire clock/data protocol directly with gpio + esp_rom_delay_us.","Calibrate CALIBRATION_FACTOR with a known mass before trusting readings."],generate:(e={})=>{var i,t,n;return i=o(e.dataPin,19),t=o(e.clockPin,18),n=Number.isFinite(e.calibrationFactor)?e.calibrationFactor:-7050,`#include <stdio.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/gpio.h"
#include "rom/ets_sys.h"

#define DATA_PIN ${i}
#define CLOCK_PIN ${t}
static const float CALIBRATION_FACTOR = ${n};

static int32_t hx711_read_raw(void)
{
    while (gpio_get_level(DATA_PIN) == 1) { ets_delay_us(10); } // Wait for ready (DATA goes low)

    int32_t value = 0;
    for (int i = 0; i < 24; i++) {
        gpio_set_level(CLOCK_PIN, 1);
        ets_delay_us(1);
        value = (value << 1) | gpio_get_level(DATA_PIN);
        gpio_set_level(CLOCK_PIN, 0);
        ets_delay_us(1);
    }
    // 25th pulse selects channel A, gain 128 for the next conversion.
    gpio_set_level(CLOCK_PIN, 1);
    ets_delay_us(1);
    gpio_set_level(CLOCK_PIN, 0);

    if (value & 0x800000) value |= 0xFF000000; // sign-extend 24-bit to 32-bit
    return value;
}

void app_main(void)
{
    gpio_reset_pin(DATA_PIN);
    gpio_reset_pin(CLOCK_PIN);
    gpio_set_direction(DATA_PIN, GPIO_MODE_INPUT);
    gpio_set_direction(CLOCK_PIN, GPIO_MODE_OUTPUT);
    gpio_set_level(CLOCK_PIN, 0);

    int32_t tare = hx711_read_raw();

    while (1) {
        int32_t raw = hx711_read_raw() - tare;
        printf("Units: %.2f\\n", raw / CALIBRATION_FACTOR);
        vTaskDelay(500 / portTICK_PERIOD_MS);
    }
}
`}}}),...l({target:"soil-moisture",label:"Capacitive soil-moisture sensor",protocol:"adc",filename:"soil_moisture.ino",notes:["Calibrate dry and wet readings for the exact sensor and soil.","Do not feed a voltage above the board ADC limit."],generate:(e={})=>{let i=o(e.adcPin,34),t=o(e.dryReading,3e3),n=o(e.wetReading,1300);return`constexpr int SENSOR_PIN = ${i};
constexpr int DRY_READING = ${t};
constexpr int WET_READING = ${n};

void setup() {
  Serial.begin(115200);
}

void loop() {
  int raw = analogRead(SENSOR_PIN);
  int percent = constrain(map(raw, DRY_READING, WET_READING, 0, 100), 0, 100);
  Serial.printf("Moisture: %d%% (raw %d)\\n", percent, raw);
  delay(1000);
}
`},espidf:{notes:["Uses the ESP-IDF v5 adc_oneshot driver.","Calibrate DRY_READING/WET_READING for the exact sensor and soil."],generate:(e={})=>{var i,t;return i=o(e.dryReading,3e3),t=o(e.wetReading,1300),`#include <stdio.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_adc/adc_oneshot.h"

#define DRY_READING ${i}
#define WET_READING ${t}

static int clamp_percent(int value)
{
    if (value < 0) return 0;
    if (value > 100) return 100;
    return value;
}

void app_main(void)
{
    adc_oneshot_unit_handle_t adc_handle;
    adc_oneshot_unit_init_cfg_t unit_cfg = { .unit_id = ADC_UNIT_1 };
    adc_oneshot_new_unit(&unit_cfg, &adc_handle);

    adc_oneshot_chan_cfg_t chan_cfg = { .atten = ADC_ATTEN_DB_12, .bitwidth = ADC_BITWIDTH_DEFAULT };
    adc_oneshot_config_channel(adc_handle, ADC_CHANNEL_6, &chan_cfg); // GPIO34 on most ESP32 dev boards

    while (1) {
        int raw = 0;
        adc_oneshot_read(adc_handle, ADC_CHANNEL_6, &raw);
        int percent = clamp_percent((int)((raw - DRY_READING) * 100.0f / (WET_READING - DRY_READING)));
        printf("Moisture: %d%% (raw %d)\\n", percent, raw);
        vTaskDelay(1000 / portTICK_PERIOD_MS);
    }
}
`}}}),...l({target:"http-client",label:"ESP32 HTTP client",protocol:"http",filename:"http_client.ino",notes:["Replace the Wi-Fi and URL placeholders before uploading.","Use TLS and certificate validation for production endpoints - see the HTTPS client target for a hardened version."],generate:()=>`#include <WiFi.h>
#include <HTTPClient.h>

const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* API_URL = "https://example.com/api/telemetry";

void setup() {
  Serial.begin(115200);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) delay(250);
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(API_URL);
    int status = http.GET();
    Serial.printf("HTTP status: %d\\n", status);
    if (status > 0) Serial.println(http.getString());
    http.end();
  }
  delay(10000);
}
`,espidf:{notes:["Uses esp_http_client (ESP-IDF's native HTTP client component).","Replace the Wi-Fi and URL placeholders before flashing."],generate:()=>`#include <string.h>
#include "esp_event.h"
#include "esp_http_client.h"
#include "esp_log.h"
#include "esp_wifi.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "nvs_flash.h"

#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"
#define API_URL "https://example.com/api/telemetry"
static const char *TAG = "http_client";

static esp_err_t http_event_handler(esp_http_client_event_t *evt)
{
    if (evt->event_id == HTTP_EVENT_ON_DATA) {
        ESP_LOGI(TAG, "Received %d bytes", evt->data_len);
    }
    return ESP_OK;
}

static void wifi_init(void)
{
    ESP_ERROR_CHECK(nvs_flash_init());
    ESP_ERROR_CHECK(esp_netif_init());
    ESP_ERROR_CHECK(esp_event_loop_create_default());
    esp_netif_create_default_wifi_sta();

    wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
    ESP_ERROR_CHECK(esp_wifi_init(&cfg));

    wifi_config_t wifi_config = { .sta = { .ssid = WIFI_SSID, .password = WIFI_PASSWORD } };
    ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA));
    ESP_ERROR_CHECK(esp_wifi_set_config(WIFI_IF_STA, &wifi_config));
    ESP_ERROR_CHECK(esp_wifi_start());
    ESP_ERROR_CHECK(esp_wifi_connect());
}

static void http_task(void *pv)
{
    while (1) {
        esp_http_client_config_t config = { .url = API_URL, .event_handler = http_event_handler };
        esp_http_client_handle_t client = esp_http_client_init(&config);
        esp_err_t err = esp_http_client_perform(client);
        if (err == ESP_OK) {
            ESP_LOGI(TAG, "HTTP status: %d", esp_http_client_get_status_code(client));
        } else {
            ESP_LOGE(TAG, "HTTP request failed: %s", esp_err_to_name(err));
        }
        esp_http_client_cleanup(client);
        vTaskDelay(10000 / portTICK_PERIOD_MS);
    }
}

void app_main(void)
{
    wifi_init();
    xTaskCreate(http_task, "http_task", 8192, NULL, 5, NULL);
}
`}}),...l({target:"http-server",label:"ESP32 HTTP server",protocol:"http",filename:"http_server.ino",notes:["Replace the Wi-Fi placeholders before uploading.","This starter is a local-network example; add authentication before exposing controls."],generate:()=>`#include <WiFi.h>
#include <WebServer.h>

const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
WebServer server(80);

void setup() {
  Serial.begin(115200);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) delay(250);
  server.on("/", []() { server.send(200, "application/json", "{\\"status\\":\\"ok\\"}"); });
  server.begin();
}

void loop() {
  server.handleClient();
}
`,espidf:{notes:["Uses esp_http_server (ESP-IDF's native HTTP server component).","This starter is a local-network example; add authentication before exposing controls."],generate:()=>`#include "esp_http_server.h"
#include "esp_wifi.h"
#include "esp_event.h"
#include "esp_log.h"
#include "nvs_flash.h"

#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"
static const char *TAG = "http_server";

static esp_err_t status_get_handler(httpd_req_t *req)
{
    const char resp[] = "{\\"status\\":\\"ok\\"}";
    httpd_resp_set_type(req, "application/json");
    return httpd_resp_send(req, resp, HTTPD_RESP_USE_STRLEN);
}

static const httpd_uri_t status_uri = {
    .uri = "/", .method = HTTP_GET, .handler = status_get_handler
};

static void wifi_init(void)
{
    ESP_ERROR_CHECK(nvs_flash_init());
    ESP_ERROR_CHECK(esp_netif_init());
    ESP_ERROR_CHECK(esp_event_loop_create_default());
    esp_netif_create_default_wifi_sta();

    wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
    ESP_ERROR_CHECK(esp_wifi_init(&cfg));

    wifi_config_t wifi_config = { .sta = { .ssid = WIFI_SSID, .password = WIFI_PASSWORD } };
    ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA));
    ESP_ERROR_CHECK(esp_wifi_set_config(WIFI_IF_STA, &wifi_config));
    ESP_ERROR_CHECK(esp_wifi_start());
    ESP_ERROR_CHECK(esp_wifi_connect());
}

void app_main(void)
{
    wifi_init();

    httpd_handle_t server = NULL;
    httpd_config_t config = HTTPD_DEFAULT_CONFIG();
    if (httpd_start(&server, &config) == ESP_OK) {
        httpd_register_uri_handler(server, &status_uri);
        ESP_LOGI(TAG, "Server started");
    }
}
`}}),...l({target:"mqtt-publisher",label:"MQTT publisher",protocol:"mqtt",filename:"mqtt_publisher.ino",dependencies:[{name:"PubSubClient",version:"^2.8"}],notes:["Replace broker and Wi-Fi placeholders.","Use a unique client ID and authenticated TLS broker in production - see the MQTTS target for a TLS version."],generate:()=>c("publish"),espidf:{dependencies:[{name:"esp-idf",version:"v5.0+, includes esp-mqtt"}],notes:["Uses esp-mqtt (bundled with ESP-IDF).","Replace broker and Wi-Fi placeholders before flashing."],generate:()=>u("publish")}}),...l({target:"mqtt-subscriber",label:"MQTT subscriber",protocol:"mqtt",filename:"mqtt_subscriber.ino",dependencies:[{name:"PubSubClient",version:"^2.8"}],notes:["Replace broker and Wi-Fi placeholders.","Treat incoming payloads as untrusted input before controlling hardware."],generate:()=>c("subscribe"),espidf:{dependencies:[{name:"esp-idf",version:"v5.0+, includes esp-mqtt"}],notes:["Uses esp-mqtt (bundled with ESP-IDF).","Treat incoming payloads as untrusted input before controlling hardware."],generate:()=>u("subscribe")}}),...l({target:"ble-server",label:"BLE GATT server",protocol:"ble",filename:"ble_server.ino",dependencies:[{name:"NimBLE-Arduino",version:"^2.3.7"}],notes:["Use your own service and characteristic UUIDs for a product.","Advertising consumes power; tune the interval for battery devices."],generate:()=>`#include <NimBLEDevice.h>

#define SERVICE_UUID "12345678-1234-1234-1234-1234567890ab"
#define CHARACTERISTIC_UUID "12345678-1234-1234-1234-1234567890ac"

void setup() {
  NimBLEDevice::init("ESP32 Sensor");
  NimBLEServer* server = NimBLEDevice::createServer();
  NimBLEService* service = server->createService(SERVICE_UUID);
  NimBLECharacteristic* value = service->createCharacteristic(CHARACTERISTIC_UUID, NIMBLE_PROPERTY::READ | NIMBLE_PROPERTY::NOTIFY);
  value->setValue("ready");
  service->start();
  NimBLEDevice::getAdvertising()->addServiceUUID(SERVICE_UUID);
  NimBLEDevice::startAdvertising();
}

void loop() { delay(1000); }
`,espidf:{dependencies:[{name:"esp-idf",version:"v5.0+, Bluedroid enabled"}],notes:["Uses ESP-IDF's native Bluedroid GATT server API - considerably more verbose than NimBLE-Arduino; keep the Arduino/PlatformIO variant unless the project already commits to raw ESP-IDF BLE.","Use your own 128-bit UUIDs for a real product."],generate:()=>`#include <string.h>
#include "esp_bt.h"
#include "esp_bt_main.h"
#include "esp_gap_ble_api.h"
#include "esp_gatts_api.h"
#include "esp_log.h"

#define GATTS_SERVICE_UUID   0x00FF
#define GATTS_CHAR_UUID      0xFF01
#define GATTS_NUM_HANDLE     4
static const char *TAG = "ble_server";
static uint8_t char_value[] = "ready";

static void gatts_event_handler(esp_gatts_cb_event_t event, esp_gatt_if_t gatts_if, esp_ble_gatts_cb_param_t *param)
{
    switch (event) {
    case ESP_GATTS_REG_EVT: {
        esp_ble_gap_set_device_name("ESP32 Sensor");
        esp_gatt_srvc_id_t service_id = {
            .id.uuid.len = ESP_UUID_LEN_16,
            .id.uuid.uuid.uuid16 = GATTS_SERVICE_UUID,
            .id.inst_id = 0,
            .is_primary = true,
        };
        esp_ble_gatts_create_service(gatts_if, &service_id, GATTS_NUM_HANDLE);
        break;
    }
    case ESP_GATTS_CREATE_EVT:
        esp_ble_gatts_start_service(param->create.service_handle);
        {
            esp_bt_uuid_t char_uuid = { .len = ESP_UUID_LEN_16, .uuid.uuid16 = GATTS_CHAR_UUID };
            esp_ble_gatts_add_char(param->create.service_handle, &char_uuid,
                ESP_GATT_PERM_READ,
                ESP_GATT_CHAR_PROP_BIT_READ | ESP_GATT_CHAR_PROP_BIT_NOTIFY,
                NULL, NULL);
        }
        break;
    case ESP_GATTS_READ_EVT: {
        esp_gatt_rsp_t rsp = { 0 };
        rsp.attr_value.handle = param->read.handle;
        rsp.attr_value.len = sizeof(char_value);
        memcpy(rsp.attr_value.value, char_value, sizeof(char_value));
        esp_ble_gatts_send_response(gatts_if, param->read.conn_id, param->read.trans_id, ESP_GATT_OK, &rsp);
        break;
    }
    default:
        break;
    }
}

void app_main(void)
{
    esp_bt_controller_config_t bt_cfg = BT_CONTROLLER_INIT_CONFIG_DEFAULT();
    esp_bt_controller_init(&bt_cfg);
    esp_bt_controller_enable(ESP_BT_MODE_BLE);
    esp_bluedroid_init();
    esp_bluedroid_enable();

    esp_ble_gatts_register_callback(gatts_event_handler);
    esp_ble_gatts_app_register(0);

    esp_ble_adv_data_t adv_data = {
        .set_scan_rsp = false,
        .include_name = true,
        .flag = (ESP_BLE_ADV_FLAG_GEN_DISC | ESP_BLE_ADV_FLAG_BREDR_NOT_SPT),
    };
    esp_ble_gap_config_adv_data(&adv_data);

    ESP_LOGI(TAG, "BLE GATT server started");
}
`}}),...l({target:"ble-client",label:"BLE GATT client",protocol:"ble",filename:"ble_client.ino",dependencies:[{name:"NimBLE-Arduino",version:"^2.3.7"}],notes:["Replace the service UUID with the peripheral's UUID.","Scanning continuously consumes significant power."],generate:()=>`#include <NimBLEDevice.h>

#define SERVICE_UUID "12345678-1234-1234-1234-1234567890ab"

void setup() {
  Serial.begin(115200);
  NimBLEDevice::init("");
  NimBLEScan* scan = NimBLEDevice::getScan();
  scan->setActiveScan(true);
  NimBLEScanResults results = scan->getResults(5 * 1000);
  Serial.printf("Found %d BLE devices\\n", results.getCount());
}

void loop() { delay(5000); }
`}),...l({target:"i2c-scanner",label:"I2C bus scanner",protocol:"i2c",filename:"i2c_scanner.ino",notes:["Default ESP32 pins are SDA 21 and SCL 22 on many boards.","A discovered address identifies a device, not its exact model."],generate:()=>`#include <Wire.h>

void setup() {
  Serial.begin(115200);
  Wire.begin();
}

void loop() {
  int found = 0;
  for (uint8_t address = 1; address < 127; address++) {
    Wire.beginTransmission(address);
    if (Wire.endTransmission() == 0) {
      Serial.printf("Found I2C device at 0x%02X\\n", address);
      found++;
    }
  }
  if (!found) Serial.println("No I2C devices found");
  delay(5000);
}
`,espidf:{notes:["Default ESP32 pins are SDA 21 and SCL 22 on many boards.","A discovered address identifies a device, not its exact model."],generate:()=>`#include <stdio.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/i2c.h"

#define I2C_MASTER_SCL_IO 22
#define I2C_MASTER_SDA_IO 21
#define I2C_MASTER_NUM    I2C_NUM_0
#define I2C_MASTER_FREQ_HZ 100000

static void i2c_master_init(void)
{
    i2c_config_t conf = {
        .mode = I2C_MODE_MASTER,
        .sda_io_num = I2C_MASTER_SDA_IO,
        .scl_io_num = I2C_MASTER_SCL_IO,
        .sda_pullup_en = GPIO_PULLUP_ENABLE,
        .scl_pullup_en = GPIO_PULLUP_ENABLE,
        .master.clk_speed = I2C_MASTER_FREQ_HZ,
    };
    i2c_param_config(I2C_MASTER_NUM, &conf);
    i2c_driver_install(I2C_MASTER_NUM, conf.mode, 0, 0, 0);
}

void app_main(void)
{
    i2c_master_init();

    while (1) {
        int found = 0;
        for (uint8_t address = 1; address < 127; address++) {
            i2c_cmd_handle_t cmd = i2c_cmd_link_create();
            i2c_master_start(cmd);
            i2c_master_write_byte(cmd, (address << 1) | I2C_MASTER_WRITE, true);
            i2c_master_stop(cmd);
            esp_err_t result = i2c_master_cmd_begin(I2C_MASTER_NUM, cmd, pdMS_TO_TICKS(50));
            i2c_cmd_link_delete(cmd);
            if (result == ESP_OK) {
                printf("Found I2C device at 0x%02X\\n", address);
                found++;
            }
        }
        if (!found) printf("No I2C devices found\\n");
        vTaskDelay(5000 / portTICK_PERIOD_MS);
    }
}
`}}),...l({target:"spi-transfer",label:"SPI full-duplex transfer",protocol:"spi",filename:"spi_transfer.ino",notes:["Confirm SCK, MOSI, MISO, and CS pins for your board.","Match SPI mode and clock limit to the peripheral datasheet."],generate:(e={})=>{let i=o(e.csPin,5);return`#include <SPI.h>

constexpr int CS_PIN = ${i};

void setup() {
  Serial.begin(115200);
  pinMode(CS_PIN, OUTPUT);
  digitalWrite(CS_PIN, HIGH);
  SPI.begin();
}

void loop() {
  SPI.beginTransaction(SPISettings(1000000, MSBFIRST, SPI_MODE0));
  digitalWrite(CS_PIN, LOW);
  uint8_t response = SPI.transfer(0x00);
  digitalWrite(CS_PIN, HIGH);
  SPI.endTransaction();
  Serial.printf("SPI response: 0x%02X\\n", response);
  delay(1000);
}
`},espidf:{notes:["Uses the ESP-IDF spi_master driver.","Confirm SCK, MOSI, MISO, and CS pins for your board."],generate:(e={})=>{var i;return i=o(e.csPin,5),`#include <stdio.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/spi_master.h"

#define PIN_NUM_MISO 19
#define PIN_NUM_MOSI 23
#define PIN_NUM_CLK  18
#define PIN_NUM_CS   ${i}

void app_main(void)
{
    spi_bus_config_t bus_cfg = {
        .miso_io_num = PIN_NUM_MISO,
        .mosi_io_num = PIN_NUM_MOSI,
        .sclk_io_num = PIN_NUM_CLK,
        .quadwp_io_num = -1,
        .quadhd_io_num = -1,
    };
    spi_bus_initialize(SPI2_HOST, &bus_cfg, SPI_DMA_CH_AUTO);

    spi_device_interface_config_t dev_cfg = {
        .clock_speed_hz = 1 * 1000 * 1000,
        .mode = 0,
        .spics_io_num = PIN_NUM_CS,
        .queue_size = 1,
    };
    spi_device_handle_t device;
    spi_bus_add_device(SPI2_HOST, &dev_cfg, &device);

    while (1) {
        uint8_t tx = 0x00;
        uint8_t rx = 0x00;
        spi_transaction_t transaction = {
            .length = 8,
            .tx_buffer = &tx,
            .rx_buffer = &rx,
        };
        spi_device_transmit(device, &transaction);
        printf("SPI response: 0x%02X\\n", rx);
        vTaskDelay(1000 / portTICK_PERIOD_MS);
    }
}
`}}}),d({target:"mpu6050",label:"MPU6050 accelerometer/gyro",protocol:"i2c",dependencies:[{name:"esp-idf",version:"v5.0+"}],notes:["Wakes the sensor from sleep and reads the raw accelerometer registers directly - no external component required.","I2C address is usually 0x68 (AD0 low); tie AD0 high for 0x69."],generate:(e={})=>{var i;return i="0x69"===e.i2cAddress?105:104,`#include <stdio.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/i2c.h"

#define I2C_MASTER_SCL_IO 22
#define I2C_MASTER_SDA_IO 21
#define I2C_MASTER_NUM    I2C_NUM_0
#define I2C_MASTER_FREQ_HZ 100000
#define MPU6050_ADDR ${s(i)}

static void i2c_master_init(void)
{
    i2c_config_t conf = {
        .mode = I2C_MODE_MASTER,
        .sda_io_num = I2C_MASTER_SDA_IO,
        .scl_io_num = I2C_MASTER_SCL_IO,
        .sda_pullup_en = GPIO_PULLUP_ENABLE,
        .scl_pullup_en = GPIO_PULLUP_ENABLE,
        .master.clk_speed = I2C_MASTER_FREQ_HZ,
    };
    i2c_param_config(I2C_MASTER_NUM, &conf);
    i2c_driver_install(I2C_MASTER_NUM, conf.mode, 0, 0, 0);
}

void app_main(void)
{
    i2c_master_init();

    // Wake the sensor: PWR_MGMT_1 (0x6B) = 0 clears the sleep bit.
    uint8_t wake[2] = { 0x6B, 0x00 };
    if (i2c_master_write_to_device(I2C_MASTER_NUM, MPU6050_ADDR, wake, 2, pdMS_TO_TICKS(100)) != ESP_OK) {
        printf("MPU6050 not found at 0x%02X
", MPU6050_ADDR);
        return;
    }

    // +-8g range: ACCEL_CONFIG (0x1C), AFS_SEL=2 -> sensitivity 4096 LSB/g.
    uint8_t accel_cfg[2] = { 0x1C, 0x10 };
    i2c_master_write_to_device(I2C_MASTER_NUM, MPU6050_ADDR, accel_cfg, 2, pdMS_TO_TICKS(100));

    while (1) {
        uint8_t reg = 0x3B; // ACCEL_XOUT_H
        uint8_t raw[6];
        i2c_master_write_read_device(I2C_MASTER_NUM, MPU6050_ADDR, &reg, 1, raw, 6, pdMS_TO_TICKS(100));

        int16_t ax = (raw[0] << 8) | raw[1];
        int16_t ay = (raw[2] << 8) | raw[3];
        int16_t az = (raw[4] << 8) | raw[5];

        printf("Accel X: %.2f, Y: %.2f, Z: %.2f (g)
", ax / 4096.0, ay / 4096.0, az / 4096.0);

        vTaskDelay(500 / portTICK_PERIOD_MS);
    }
}
`}}),d({target:"hcsr04",label:"HC-SR04 ultrasonic distance",protocol:"gpio",notes:["Times the echo pulse with esp_timer_get_time() instead of Arduino's pulseIn().","5V logic on the echo pin requires a voltage divider on 3.3V boards."],generate:(e={})=>{var i,t;return i=o(e.trigPin,5),t=o(e.echoPin,18),`#include <stdio.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/gpio.h"
#include "esp_timer.h"

#define TRIG_PIN ${i}
#define ECHO_PIN ${t}

void app_main(void)
{
    gpio_reset_pin(TRIG_PIN);
    gpio_reset_pin(ECHO_PIN);
    gpio_set_direction(TRIG_PIN, GPIO_MODE_OUTPUT);
    gpio_set_direction(ECHO_PIN, GPIO_MODE_INPUT);
    gpio_set_level(TRIG_PIN, 0);

    while (1) {
        gpio_set_level(TRIG_PIN, 1);
        esp_rom_delay_us(10);
        gpio_set_level(TRIG_PIN, 0);

        int64_t timeout = esp_timer_get_time() + 30000; // 30ms timeout (~5m round trip)
        while (gpio_get_level(ECHO_PIN) == 0 && esp_timer_get_time() < timeout) {}
        int64_t start = esp_timer_get_time();
        while (gpio_get_level(ECHO_PIN) == 1 && esp_timer_get_time() < timeout) {}
        int64_t duration_us = esp_timer_get_time() - start;

        int distance_cm = (int)(duration_us * 0.034 / 2);
        printf("Distance: %d cm
", distance_cm);

        vTaskDelay(100 / portTICK_PERIOD_MS);
    }
}
`}}),d({target:"dht11",label:"DHT11 temperature/humidity",protocol:"gpio",notes:["Bit-bangs the DHT single-wire protocol directly with esp_rom_delay_us - no external component required.","DHT11 needs roughly 1s between reads."],generate:(e={})=>m(o(e.dataPin,4),!1)}),d({target:"dht22",label:"DHT22 temperature/humidity",protocol:"gpio",notes:["Bit-bangs the DHT single-wire protocol directly with esp_rom_delay_us - no external component required.","DHT22 needs roughly 2s between reads but reports one decimal place of precision."],generate:(e={})=>m(o(e.dataPin,4),!0)}),d({target:"mq2",label:"MQ-2 smoke/gas sensor",protocol:"adc",notes:["MQ sensors need a preheat/burn-in period (up to 24-48h) before readings are meaningful.","The heater draws significant current - do not power it directly from a GPIO pin."],generate:()=>`#include <stdio.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_adc/adc_oneshot.h"

void app_main(void)
{
    printf("Warming up MQ-2 sensor...
");
    vTaskDelay(5000 / portTICK_PERIOD_MS);

    adc_oneshot_unit_handle_t adc_handle;
    adc_oneshot_unit_init_cfg_t unit_cfg = { .unit_id = ADC_UNIT_1 };
    adc_oneshot_new_unit(&unit_cfg, &adc_handle);

    adc_oneshot_chan_cfg_t chan_cfg = { .atten = ADC_ATTEN_DB_12, .bitwidth = ADC_BITWIDTH_DEFAULT };
    adc_oneshot_config_channel(adc_handle, ADC_CHANNEL_6, &chan_cfg); // GPIO34 on most ESP32 dev boards

    while (1) {
        int raw = 0;
        adc_oneshot_read(adc_handle, ADC_CHANNEL_6, &raw);
        printf("MQ-2 raw ADC value: %d
", raw);
        if (raw > 2000) { // Threshold depends on environment and ADC resolution - calibrate for your sensor
            printf("WARNING: High gas/smoke detected!
");
        }
        vTaskDelay(1000 / portTICK_PERIOD_MS);
    }
}
`}),d({target:"pir",label:"HC-SR501 PIR motion sensor",protocol:"gpio",notes:["Sensor needs roughly 60 seconds after power-on to stabilize.","Sensitivity and hold time are set with the onboard potentiometers, not in code."],generate:(e={})=>{var i;return i=o(e.pirPin,13),`#include <stdio.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/gpio.h"

#define PIR_PIN ${i}

void app_main(void)
{
    gpio_reset_pin(PIR_PIN);
    gpio_set_direction(PIR_PIN, GPIO_MODE_INPUT);
    printf("PIR sensor initializing (wait 60s to stabilize)...
");

    int motion_state = 0;
    while (1) {
        int level = gpio_get_level(PIR_PIN);
        if (level && !motion_state) {
            printf("Motion detected!
");
            motion_state = 1;
        } else if (!level && motion_state) {
            printf("Motion ended.
");
            motion_state = 0;
        }
        vTaskDelay(100 / portTICK_PERIOD_MS);
    }
}
`}}),d({target:"irsensor",label:"IR obstacle sensor",protocol:"gpio",notes:["Generic digital IR obstacle avoidance sensor.","Returns LOW when obstacle is detected (active low)."],generate:()=>`#include <stdio.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/gpio.h"

#define IR_PIN 4

void app_main(void)
{
    gpio_reset_pin(IR_PIN);
    gpio_set_direction(IR_PIN, GPIO_MODE_INPUT);
    gpio_set_pull_mode(IR_PIN, GPIO_PULLUP_ENABLE);

    while (1) {
        int state = gpio_get_level(IR_PIN);
        if (state == 0) {
            printf("Obstacle Detected!\\n");
        } else {
            printf("Path Clear\\n");
        }
        vTaskDelay(200 / portTICK_PERIOD_MS);
    }
}
`})]);function c(e){return`#include <WiFi.h>
#include <PubSubClient.h>

const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* MQTT_BROKER = "YOUR_MQTT_BROKER";
WiFiClient network;
PubSubClient client(network);

void connectMqtt() {
  while (!client.connected()) {
    if (client.connect("esp32-workbench")) { ${"publish"===e?'client.publish("workbench/telemetry", "{\\"temperature\\":24.5}");':'client.subscribe("workbench/commands");'} }
    else delay(1000);
  }
}

void setup() {
  Serial.begin(115200);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) delay(250);
  client.setServer(MQTT_BROKER, 1883);
}

void loop() {
  if (!client.connected()) connectMqtt();
  client.loop();
  ${"publish"===e?'static unsigned long last = 0; if (millis() - last > 5000) { client.publish("workbench/telemetry", "online"); last = millis(); }':"delay(10);"}
}
`}function p({address:e,withHumidity:i}){let t=i?`
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
    printf("Humidity %%: %.2f\\n", var_h);`:"",n=i?`
    uint8_t h1; read_regs(0xA1, &h1, 1); dig_H1 = h1;
    uint8_t h2_6[7]; read_regs(0xE1, h2_6, 7);
    dig_H2 = (int16_t)((h2_6[1] << 8) | h2_6[0]);
    dig_H3 = h2_6[2];
    dig_H4 = (int16_t)((h2_6[3] << 4) | (h2_6[4] & 0x0F));
    dig_H5 = (int16_t)((h2_6[5] << 4) | (h2_6[4] >> 4));
    dig_H6 = (int8_t)h2_6[6];`:"",r=i?`
    static double dig_H2, dig_H4, dig_H5;
    static uint8_t dig_H1;
    static uint8_t dig_H3;
    static int8_t dig_H6;`:"",a=i?`
    uint8_t hum_cfg[2] = { 0xF2, 0x01 };
    i2c_master_write_to_device(I2C_MASTER_NUM, ${s(e)}, hum_cfg, 2, pdMS_TO_TICKS(100));`:"";return`#include <stdio.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/i2c.h"

#define I2C_MASTER_SCL_IO 22
#define I2C_MASTER_SDA_IO 21
#define I2C_MASTER_NUM    I2C_NUM_0
#define I2C_MASTER_FREQ_HZ 100000
#define SENSOR_ADDR ${s(e)}

static void i2c_master_init(void)
{
    i2c_config_t conf = {
        .mode = I2C_MODE_MASTER,
        .sda_io_num = I2C_MASTER_SDA_IO,
        .scl_io_num = I2C_MASTER_SCL_IO,
        .sda_pullup_en = GPIO_PULLUP_ENABLE,
        .scl_pullup_en = GPIO_PULLUP_ENABLE,
        .master.clk_speed = I2C_MASTER_FREQ_HZ,
    };
    i2c_param_config(I2C_MASTER_NUM, &conf);
    i2c_driver_install(I2C_MASTER_NUM, conf.mode, 0, 0, 0);
}

static esp_err_t read_regs(uint8_t reg, uint8_t *data, size_t len)
{
    return i2c_master_write_read_device(I2C_MASTER_NUM, SENSOR_ADDR, &reg, 1, data, len, pdMS_TO_TICKS(100));
}

void app_main(void)
{
    i2c_master_init();

    uint8_t chip_id = 0;
    if (read_regs(0xD0, &chip_id, 1) != ESP_OK) {
        printf("Sensor not found at 0x%02X\\n", SENSOR_ADDR);
        return;
    }
    printf("Chip ID: 0x%02X\\n", chip_id);

    // Bosch compensation coefficients, T1-P9 (and H1-H6 when humidity is present).
    uint8_t calib[24];
    read_regs(0x88, calib, 24);
    uint16_t dig_T1 = (calib[1] << 8) | calib[0];
    int16_t  dig_T2 = (calib[3] << 8) | calib[2];
    int16_t  dig_T3 = (calib[5] << 8) | calib[4];
    uint16_t dig_P1 = (calib[7] << 8) | calib[6];
    int16_t  dig_P2 = (calib[9] << 8) | calib[8];
    int16_t  dig_P3 = (calib[11] << 8) | calib[10];
    int16_t  dig_P4 = (calib[13] << 8) | calib[12];
    int16_t  dig_P5 = (calib[15] << 8) | calib[14];
    int16_t  dig_P6 = (calib[17] << 8) | calib[16];
    int16_t  dig_P7 = (calib[19] << 8) | calib[18];
    int16_t  dig_P8 = (calib[21] << 8) | calib[20];
    int16_t  dig_P9 = (calib[23] << 8) | calib[22];${r}
${n}

    // Normal mode, 16x oversampling on temperature and pressure.${a}
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
        printf("Pressure hPa: %.2f\\n", pressure / 100.0);${t}

        vTaskDelay(2000 / portTICK_PERIOD_MS);
    }
}
`}function u(e){return`#include "esp_event.h"
#include "esp_log.h"
#include "esp_wifi.h"
#include "mqtt_client.h"
#include "nvs_flash.h"

#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"
#define MQTT_BROKER_URI "mqtt://YOUR_MQTT_BROKER:1883"
static const char *TAG = "mqtt_${e}";

static void mqtt_event_handler(void *handler_args, esp_event_base_t base, int32_t event_id, void *event_data)
{
    esp_mqtt_event_handle_t event = (esp_mqtt_event_handle_t)event_data;
    esp_mqtt_client_handle_t client = event->client;

    switch ((esp_mqtt_event_id_t)event_id) {
    case MQTT_EVENT_CONNECTED:
        ESP_LOGI(TAG, "MQTT connected");
        ${"publish"===e?'esp_mqtt_client_publish(client, "workbench/telemetry", "{\\"temperature\\":24.5}", 0, 1, 0);':'esp_mqtt_client_subscribe(client, "workbench/commands", 1);'}
        break;
    case MQTT_EVENT_DATA:
        ESP_LOGI(TAG, "Received on %.*s: %.*s", event->topic_len, event->topic, event->data_len, event->data);
        break;
    default:
        break;
    }
}

static void wifi_init(void)
{
    ESP_ERROR_CHECK(nvs_flash_init());
    ESP_ERROR_CHECK(esp_netif_init());
    ESP_ERROR_CHECK(esp_event_loop_create_default());
    esp_netif_create_default_wifi_sta();

    wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
    ESP_ERROR_CHECK(esp_wifi_init(&cfg));

    wifi_config_t wifi_config = { .sta = { .ssid = WIFI_SSID, .password = WIFI_PASSWORD } };
    ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA));
    ESP_ERROR_CHECK(esp_wifi_set_config(WIFI_IF_STA, &wifi_config));
    ESP_ERROR_CHECK(esp_wifi_start());
    ESP_ERROR_CHECK(esp_wifi_connect());
}

void app_main(void)
{
    wifi_init();

    esp_mqtt_client_config_t mqtt_cfg = { .broker.address.uri = MQTT_BROKER_URI };
    esp_mqtt_client_handle_t client = esp_mqtt_client_init(&mqtt_cfg);
    esp_mqtt_client_register_event(client, ESP_EVENT_ANY_ID, mqtt_event_handler, NULL);
    esp_mqtt_client_start(client);
}
`}function m(e,i){let t=i?10:1;return`#include <stdio.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/gpio.h"
#include "rom/ets_sys.h"

#define DHT_PIN ${e}

// Bit-banged DHT11/DHT22 read: a 0 bit's high pulse is ~26-28us, a 1 bit's is ~70us.
static int dht_read(uint8_t data[5])
{
    gpio_set_direction(DHT_PIN, GPIO_MODE_OUTPUT);
    gpio_set_level(DHT_PIN, 0);
    ets_delay_us(18000); // Start signal: pull low for 18ms
    gpio_set_level(DHT_PIN, 1);
    ets_delay_us(30);
    gpio_set_direction(DHT_PIN, GPIO_MODE_INPUT);

    int64_t timeout;
    timeout = 0; while (gpio_get_level(DHT_PIN) == 1) { if (++timeout > 10000) return -1; }
    timeout = 0; while (gpio_get_level(DHT_PIN) == 0) { if (++timeout > 10000) return -1; } // Sensor response low
    timeout = 0; while (gpio_get_level(DHT_PIN) == 1) { if (++timeout > 10000) return -1; } // Sensor response high

    for (int i = 0; i < 5; i++) {
        data[i] = 0;
        for (int bit = 0; bit < 8; bit++) {
            timeout = 0; while (gpio_get_level(DHT_PIN) == 0) { if (++timeout > 10000) return -1; }
            uint32_t start = 0;
            while (gpio_get_level(DHT_PIN) == 1) { ets_delay_us(1); start++; if (start > 200) break; }
            data[i] <<= 1;
            if (start > 40) data[i] |= 1; // Long high pulse => bit 1
        }
    }

    uint8_t checksum = data[0] + data[1] + data[2] + data[3];
    return (checksum == data[4]) ? 0 : -1;
}

void app_main(void)
{
    gpio_reset_pin(DHT_PIN);

    while (1) {
        uint8_t data[5];
        if (dht_read(data) == 0) {
            float humidity = ((data[0] << 8) | data[1]) / ${t};
            float temperature = (((data[2] & 0x7F) << 8) | data[3]) / ${t};
            if (data[2] & 0x80) temperature = -temperature;
            printf("Humidity: %.1f%%  Temperature: %.1f C
", humidity, temperature);
        } else {
            printf("Failed to read from DHT sensor (checksum or timing error)
");
        }
        vTaskDelay(${i?2e3:1e3} / portTICK_PERIOD_MS);
    }
}
`}let f=[{id:"bme280-arduino-i2c",sensor:"bme280",sensorLabel:"BME280",environment:"arduino",environmentLabel:"Arduino IDE",protocol:"i2c",protocolLabel:"I²C",language:"cpp",filename:"bme280_example.ino",dependencies:[{name:"Adafruit BME280 Library",version:"tested-version"},{name:"Adafruit Unified Sensor",version:"tested-version"}],notes:["Default address is 0x76.","Try 0x77 when the address pin is configured high."],generate:(e={})=>{let i="0x77"===e.i2cAddress?"0x77":"0x76";return`#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>

Adafruit_BME280 bme;

void setup() {
  Serial.begin(115200);
  Wire.begin();
  if (!bme.begin(${i})) {
    Serial.println(F("Sensor not found, check wiring or try ${"0x76"===i?"0x77":"0x76"}"));
    while (1);
  }
}

void loop() {
  float t = bme.readTemperature();
  float h = bme.readHumidity();
  float p = bme.readPressure() / 100.0F;

  Serial.print(F("Temp: ")); Serial.print(t); Serial.println(F(" *C"));
  Serial.print(F("Hum: ")); Serial.print(h); Serial.println(F(" %"));
  Serial.print(F("Pres: ")); Serial.print(p); Serial.println(F(" hPa"));

  delay(2000);
}
`}},{id:"bme280-platformio-i2c",sensor:"bme280",sensorLabel:"BME280",environment:"platformio",environmentLabel:"PlatformIO / Arduino",protocol:"i2c",protocolLabel:"I²C",language:"cpp",filename:"main.cpp",dependencies:[{name:"adafruit/Adafruit BME280 Library",version:"^2.2.2"},{name:"adafruit/Adafruit Unified Sensor",version:"^1.1.9"}],notes:["Ensure platformio.ini contains lib_deps = adafruit/Adafruit BME280 Library"],generate:(e={})=>{let i="0x77"===e.i2cAddress?"0x77":"0x76";return`#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>

Adafruit_BME280 bme;

void setup() {
  Serial.begin(115200);
  Wire.begin();
  if (!bme.begin(${i})) {
    Serial.println(F("Sensor not found, check wiring or try ${"0x76"===i?"0x77":"0x76"}"));
    while (1);
  }
}

void loop() {
  float t = bme.readTemperature();
  float h = bme.readHumidity();
  float p = bme.readPressure() / 100.0F;

  Serial.print(F("Temp: ")); Serial.print(t); Serial.println(F(" *C"));
  Serial.print(F("Hum: ")); Serial.print(h); Serial.println(F(" %"));
  Serial.print(F("Pres: ")); Serial.print(p); Serial.println(F(" hPa"));

  delay(2000);
}
`}},{id:"bme280-espidf-i2c",sensor:"bme280",sensorLabel:"BME280",environment:"esp-idf",environmentLabel:"ESP-IDF",protocol:"i2c",protocolLabel:"I²C",language:"c",filename:"main.c",dependencies:[{name:"esp-idf",version:"v5.0+"}],notes:["Uses the standard ESP-IDF i2c master driver.","Implements the Bosch fixed-point compensation formulas directly - no external component required."],generate:(e={})=>p({address:"0x77"===e.i2cAddress?119:118,withHumidity:!0})},{id:"mpu6050-arduino-i2c",sensor:"mpu6050",sensorLabel:"MPU6050",environment:"arduino",environmentLabel:"Arduino IDE",protocol:"i2c",protocolLabel:"I²C",language:"cpp",filename:"mpu6050_example.ino",dependencies:[{name:"Adafruit MPU6050",version:"tested-version"},{name:"Adafruit Unified Sensor",version:"tested-version"}],notes:["Uses the Adafruit_MPU6050 library. I2C address is usually 0x68 (AD0 low); tie AD0 high for 0x69 to run two on one bus."],generate:(e={})=>{let i="0x69"===e.i2cAddress?"0x69":"0x68";return`#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>

Adafruit_MPU6050 mpu;

void setup() {
  Serial.begin(115200);
  Wire.begin();
  if (!mpu.begin(${i})) {
    Serial.println("Failed to find MPU6050 chip");
    while (1) { delay(10); }
  }
  mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
  mpu.setGyroRange(MPU6050_RANGE_500_DEG);
}

void loop() {
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);

  Serial.print("Accel X: "); Serial.print(a.acceleration.x);
  Serial.print(", Y: "); Serial.print(a.acceleration.y);
  Serial.print(", Z: "); Serial.println(a.acceleration.z);

  delay(500);
}
`}},{id:"mpu6050-platformio-i2c",sensor:"mpu6050",sensorLabel:"MPU6050",environment:"platformio",environmentLabel:"PlatformIO / Arduino",protocol:"i2c",protocolLabel:"I²C",language:"cpp",filename:"main.cpp",dependencies:[{name:"adafruit/Adafruit MPU6050",version:"^2.2.4"}],notes:["Uses the Adafruit_MPU6050 library. I2C address is usually 0x68 (AD0 low); tie AD0 high for 0x69 to run two on one bus."],generate:(e={})=>{let i="0x69"===e.i2cAddress?"0x69":"0x68";return`#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>

Adafruit_MPU6050 mpu;

void setup() {
  Serial.begin(115200);
  Wire.begin();
  if (!mpu.begin(${i})) {
    Serial.println("Failed to find MPU6050 chip");
    while (1) { delay(10); }
  }
  mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
  mpu.setGyroRange(MPU6050_RANGE_500_DEG);
}

void loop() {
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);

  Serial.print("Accel X: "); Serial.print(a.acceleration.x);
  Serial.print(", Y: "); Serial.print(a.acceleration.y);
  Serial.print(", Z: "); Serial.println(a.acceleration.z);

  delay(500);
}
`}},{id:"hcsr04-arduino-gpio",sensor:"hcsr04",sensorLabel:"HC-SR04",environment:"arduino",environmentLabel:"Arduino IDE",protocol:"gpio",protocolLabel:"GPIO timing",language:"cpp",filename:"hcsr04_example.ino",dependencies:[],notes:["Uses standard GPIO.","5V logic on echo pin requires a voltage divider if connected to 3.3V ESP32!"],generate:(e={})=>{let i=Number.isInteger(e.trigPin)?e.trigPin:5,t=Number.isInteger(e.echoPin)?e.echoPin:18;return`const int trigPin = ${i};
const int echoPin = ${t};

long duration;
int distance;

void setup() {
  Serial.begin(115200);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
}

void loop() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  duration = pulseIn(echoPin, HIGH);
  distance = duration * 0.034 / 2;

  Serial.print("Distance: ");
  Serial.print(distance);
  Serial.println(" cm");

  delay(100);
}
`}},{id:"hcsr04-platformio-gpio",sensor:"hcsr04",sensorLabel:"HC-SR04",environment:"platformio",environmentLabel:"PlatformIO / Arduino",protocol:"gpio",protocolLabel:"GPIO timing",language:"cpp",filename:"main.cpp",dependencies:[],notes:["Uses standard GPIO with PlatformIO Arduino framework.","5V logic on echo pin requires a voltage divider if connected to 3.3V ESP32!"],generate:(e={})=>{let i=Number.isInteger(e.trigPin)?e.trigPin:5,t=Number.isInteger(e.echoPin)?e.echoPin:18;return`#include <Arduino.h>

const int trigPin = ${i};
const int echoPin = ${t};

long duration;
int distance;

void setup() {
  Serial.begin(115200);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
}

void loop() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  duration = pulseIn(echoPin, HIGH);
  distance = duration * 0.034 / 2;

  Serial.print("Distance: ");
  Serial.print(distance);
  Serial.println(" cm");

  delay(100);
}
`}},{id:"irsensor-arduino-gpio",sensor:"irsensor",sensorLabel:"IR Obstacle",environment:"arduino",environmentLabel:"Arduino IDE",protocol:"gpio",protocolLabel:"GPIO Digital",language:"cpp",filename:"ir_sensor_example.ino",dependencies:[],notes:["Generic digital IR obstacle avoidance sensor.","Returns LOW when obstacle is detected (active low)."],generate:()=>`const int irPin = 4;

void setup() {
  Serial.begin(115200);
  pinMode(irPin, INPUT);
}

void loop() {
  int state = digitalRead(irPin);
  if (state == LOW) {
    Serial.println("Obstacle Detected!");
  } else {
    Serial.println("Path Clear");
  }
  delay(200);
}
`},{id:"irsensor-platformio-gpio",sensor:"irsensor",sensorLabel:"IR Obstacle",environment:"platformio",environmentLabel:"PlatformIO / Arduino",protocol:"gpio",protocolLabel:"GPIO Digital",language:"cpp",filename:"main.cpp",dependencies:[],notes:["Generic digital IR obstacle avoidance sensor.","Returns LOW when obstacle is detected (active low)."],generate:()=>`#include <Arduino.h>

const int irPin = 4;

void setup() {
  Serial.begin(115200);
  pinMode(irPin, INPUT);
}

void loop() {
  int state = digitalRead(irPin);
  if (state == LOW) {
    Serial.println("Obstacle Detected!");
  } else {
    Serial.println("Path Clear");
  }
  delay(200);
}
`},{id:"irsensor-platformio-espidf-gpio",sensor:"irsensor",sensorLabel:"IR Obstacle",environment:"platformio-espidf",environmentLabel:"PlatformIO / ESP-IDF",protocol:"gpio",protocolLabel:"GPIO Digital",language:"c",filename:"main.c",dependencies:[],notes:["Uses ESP-IDF framework via PlatformIO (framework = espidf).","Generic digital IR obstacle avoidance sensor."],generate:()=>`#include <stdio.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/gpio.h"

#define IR_PIN 4

void app_main(void)
{
    gpio_reset_pin(IR_PIN);
    gpio_set_direction(IR_PIN, GPIO_MODE_INPUT);
    gpio_set_pull_mode(IR_PIN, GPIO_PULLUP_ENABLE);

    while (1) {
        int state = gpio_get_level(IR_PIN);
        if (state == 0) {
            printf("Obstacle Detected!\\n");
        } else {
            printf("Path Clear\\n");
        }
        vTaskDelay(200 / portTICK_PERIOD_MS);
    }
}
`},{id:"bme280-platformio-espidf-i2c",sensor:"bme280",sensorLabel:"BME280",environment:"platformio-espidf",environmentLabel:"PlatformIO / ESP-IDF",protocol:"i2c",protocolLabel:"I²C",language:"c",filename:"main.c",dependencies:[{name:"esp-idf",version:"v5.0+"}],notes:["Uses ESP-IDF framework via PlatformIO (framework = espidf) - identical C code to the plain ESP-IDF target, just built through PlatformIO project structure.","Implements the Bosch fixed-point compensation formulas directly - no external component required."],generate:(e={})=>p({address:"0x77"===e.i2cAddress?119:118,withHumidity:!0})},{id:"dht11-arduino-gpio",sensor:"dht11",sensorLabel:"DHT11",environment:"arduino",environmentLabel:"Arduino IDE",protocol:"gpio",protocolLabel:"One-Wire",language:"cpp",filename:"dht11_example.ino",dependencies:[{name:"DHT sensor library by Adafruit",version:"tested-version"},{name:"Adafruit Unified Sensor",version:"tested-version"}],notes:["Requires a 10K pull-up resistor between VCC and Data pin.","DHT11's minimum sampling interval is ~1s (vs DHT22's ~2s). It is the less accurate sensor (±2°C) but tolerates faster polling."],generate:(e={})=>{let i=Number.isInteger(e.dataPin)?e.dataPin:4;return`#include "DHT.h"

#define DHTPIN ${i}
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
}

void loop() {
  delay(1000);

  float h = dht.readHumidity();
  float t = dht.readTemperature();

  if (isnan(h) || isnan(t)) {
    Serial.println(F("Failed to read from DHT sensor!"));
    return;
  }

  Serial.print(F("Humidity: "));
  Serial.print(h);
  Serial.print(F("%  Temperature: "));
  Serial.print(t);
  Serial.println(F(" *C"));
}
`}},{id:"dht22-arduino-gpio",sensor:"dht22",sensorLabel:"DHT22",environment:"arduino",environmentLabel:"Arduino IDE",protocol:"gpio",protocolLabel:"One-Wire",language:"cpp",filename:"dht22_example.ino",dependencies:[{name:"DHT sensor library by Adafruit",version:"tested-version"},{name:"Adafruit Unified Sensor",version:"tested-version"}],notes:["Requires a 10K pull-up resistor between VCC and Data pin.","DHT22 needs ~2s between reads (vs DHT11's ~1s), the trade for its better accuracy (±0.5°C)."],generate:(e={})=>{let i=Number.isInteger(e.dataPin)?e.dataPin:4;return`#include "DHT.h"

#define DHTPIN ${i}
#define DHTTYPE DHT22

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
}

void loop() {
  delay(2000);

  float h = dht.readHumidity();
  float t = dht.readTemperature();

  if (isnan(h) || isnan(t)) {
    Serial.println(F("Failed to read from DHT sensor!"));
    return;
  }

  Serial.print(F("Humidity: "));
  Serial.print(h);
  Serial.print(F("%  Temperature: "));
  Serial.print(t);
  Serial.println(F(" *C"));
}
`}},{id:"mq2-arduino-adc",sensor:"mq2",sensorLabel:"MQ-2 Smoke/Gas",environment:"arduino",environmentLabel:"Arduino IDE",protocol:"adc",protocolLabel:"Analog (ADC)",language:"cpp",filename:"mq2_example.ino",dependencies:[],notes:["MQ sensors require a preheat time (burn-in) of up to 24-48 hours for accurate calibration.","The sensor heater draws significant current. Do not power directly from ESP32/Arduino GPIO pins."],generate:()=>`const int mq2Pin = 34; // Use appropriate ADC pin

void setup() {
  Serial.begin(115200);
  // Optional: Allow pre-heating
  Serial.println("Warming up MQ-2 sensor...");
  delay(5000);
}

void loop() {
  int sensorValue = analogRead(mq2Pin);
  Serial.print("MQ-2 Raw ADC Value: ");
  Serial.println(sensorValue);

  if (sensorValue > 2000) { // Threshold depends on environment and MCU ADC resolution
    Serial.println("WARNING: High Gas/Smoke detected!");
  }

  delay(1000);
}
`},{id:"mq2-platformio-adc",sensor:"mq2",sensorLabel:"MQ-2 Smoke/Gas",environment:"platformio",environmentLabel:"PlatformIO / Arduino",protocol:"adc",protocolLabel:"Analog (ADC)",language:"cpp",filename:"main.cpp",dependencies:[],notes:["MQ sensors require a preheat time (burn-in) of up to 24-48 hours for accurate calibration.","The sensor heater draws significant current. Do not power directly from ESP32/Arduino GPIO pins."],generate:()=>`#include <Arduino.h>

const int mq2Pin = 34; // Use appropriate ADC pin

void setup() {
  Serial.begin(115200);
  // Optional: Allow pre-heating
  Serial.println("Warming up MQ-2 sensor...");
  delay(5000);
}

void loop() {
  int sensorValue = analogRead(mq2Pin);
  Serial.print("MQ-2 Raw ADC Value: ");
  Serial.println(sensorValue);

  if (sensorValue > 2000) { // Threshold depends on environment and MCU ADC resolution
    Serial.println("WARNING: High Gas/Smoke detected!");
  }

  delay(1000);
}
`},{id:"pir-arduino-gpio",sensor:"pir",sensorLabel:"HC-SR501 (PIR)",environment:"arduino",environmentLabel:"Arduino IDE",protocol:"gpio",protocolLabel:"GPIO Digital",language:"cpp",filename:"pir_example.ino",dependencies:[],notes:["Sensor requires ~60 seconds after power-on to stabilize.","Adjust the sensitivity and time delay using the onboard potentiometers."],generate:(e={})=>{let i=Number.isInteger(e.pirPin)?e.pirPin:13;return`const int pirPin = ${i};
int motionState = LOW;

void setup() {
  Serial.begin(115200);
  pinMode(pirPin, INPUT);
  Serial.println("PIR Sensor Initializing (wait 60s)...");
}

void loop() {
  int val = digitalRead(pirPin);

  if (val == HIGH) {
    if (motionState == LOW) {
      Serial.println("Motion detected!");
      motionState = HIGH;
    }
  } else {
    if (motionState == HIGH) {
      Serial.println("Motion ended.");
      motionState = LOW;
    }
  }
  delay(100);
}
`}},{id:"pir-platformio-gpio",sensor:"pir",sensorLabel:"HC-SR501 (PIR)",environment:"platformio",environmentLabel:"PlatformIO / Arduino",protocol:"gpio",protocolLabel:"GPIO Digital",language:"cpp",filename:"main.cpp",dependencies:[],notes:["Sensor requires ~60 seconds after power-on to stabilize.","Adjust the sensitivity and time delay using the onboard potentiometers."],generate:(e={})=>{let i=Number.isInteger(e.pirPin)?e.pirPin:13;return`#include <Arduino.h>

const int pirPin = ${i};
int motionState = LOW;

void setup() {
  Serial.begin(115200);
  pinMode(pirPin, INPUT);
  Serial.println("PIR Sensor Initializing (wait 60s)...");
}

void loop() {
  int val = digitalRead(pirPin);

  if (val == HIGH) {
    if (motionState == LOW) {
      Serial.println("Motion detected!");
      motionState = HIGH;
    }
  } else {
    if (motionState == HIGH) {
      Serial.println("Motion ended.");
      motionState = LOW;
    }
  }
  delay(100);
}
`}},{id:"dht11-platformio-gpio",sensor:"dht11",sensorLabel:"DHT11",environment:"platformio",environmentLabel:"PlatformIO / Arduino",protocol:"gpio",protocolLabel:"One-Wire",language:"cpp",filename:"main.cpp",dependencies:[{name:"adafruit/DHT sensor library",version:"^1.4.6"},{name:"adafruit/Adafruit Unified Sensor",version:"^1.1.14"}],notes:["Requires a 10K pull-up resistor between VCC and Data pin.","DHT11's minimum sampling interval is ~1s (vs DHT22's ~2s). It is the less accurate sensor (±2°C) but tolerates faster polling."],generate:(e={})=>{let i=Number.isInteger(e.dataPin)?e.dataPin:4;return`#include <Arduino.h>
#include "DHT.h"

#define DHTPIN ${i}
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
}

void loop() {
  delay(1000);

  float h = dht.readHumidity();
  float t = dht.readTemperature();

  if (isnan(h) || isnan(t)) {
    Serial.println(F("Failed to read from DHT sensor!"));
    return;
  }

  Serial.print(F("Humidity: "));
  Serial.print(h);
  Serial.print(F("%  Temperature: "));
  Serial.print(t);
  Serial.println(F(" *C"));
}
`}},{id:"dht22-platformio-gpio",sensor:"dht22",sensorLabel:"DHT22",environment:"platformio",environmentLabel:"PlatformIO / Arduino",protocol:"gpio",protocolLabel:"One-Wire",language:"cpp",filename:"main.cpp",dependencies:[{name:"adafruit/DHT sensor library",version:"^1.4.6"},{name:"adafruit/Adafruit Unified Sensor",version:"^1.1.14"}],notes:["Requires a 10K pull-up resistor between VCC and Data pin.","DHT22 needs ~2s between reads (vs DHT11's ~1s), the trade for its better accuracy (±0.5°C)."],generate:(e={})=>{let i=Number.isInteger(e.dataPin)?e.dataPin:4;return`#include <Arduino.h>
#include "DHT.h"

#define DHTPIN ${i}
#define DHTTYPE DHT22

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
}

void loop() {
  delay(2000);

  float h = dht.readHumidity();
  float t = dht.readTemperature();

  if (isnan(h) || isnan(t)) {
    Serial.println(F("Failed to read from DHT sensor!"));
    return;
  }

  Serial.print(F("Humidity: "));
  Serial.print(h);
  Serial.print(F("%  Temperature: "));
  Serial.print(t);
  Serial.println(F(" *C"));
}
`}},{id:"espnow-sender-arduino-wifi",sensor:"espnow-sender",sensorLabel:"ESP-NOW Sender",environment:"arduino",environmentLabel:"Arduino IDE",protocol:"wifi",protocolLabel:"ESP-NOW",language:"cpp",filename:"espnow_sender.ino",dependencies:[],notes:["Ensure you replace the broadcastAddress with the MAC address of your receiver.","Requires #include <esp_now.h> and #include <WiFi.h> on ESP32."],generate:()=>`#include <esp_now.h>
#include <WiFi.h>

// REPLACE WITH YOUR RECEIVER MAC Address
uint8_t broadcastAddress[] = {0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF};

typedef struct struct_message {
  char a[32];
  int b;
  float c;
  bool d;
} struct_message;

struct_message myData;
esp_now_peer_info_t peerInfo;

void OnDataSent(const uint8_t *mac_addr, esp_now_send_status_t status) {
  Serial.print("\\r\\nLast Packet Send Status:\\t");
  Serial.println(status == ESP_NOW_SEND_SUCCESS ? "Delivery Success" : "Delivery Fail");
}

void setup() {
  Serial.begin(115200);
  WiFi.mode(WIFI_STA);

  if (esp_now_init() != ESP_OK) {
    Serial.println("Error initializing ESP-NOW");
    return;
  }

  esp_now_register_send_cb(OnDataSent);

  memcpy(peerInfo.peer_addr, broadcastAddress, 6);
  peerInfo.channel = 0;  
  peerInfo.encrypt = false;
  
  if (esp_now_add_peer(&peerInfo) != ESP_OK){
    Serial.println("Failed to add peer");
    return;
  }
}

void loop() {
  strcpy(myData.a, "Hello ESP32");
  myData.b = random(1,20);
  myData.c = 1.2;
  myData.d = false;

  esp_err_t result = esp_now_send(broadcastAddress, (uint8_t *) &myData, sizeof(myData));
  delay(2000);
}
`},{id:"espnow-receiver-arduino-wifi",sensor:"espnow-receiver",sensorLabel:"ESP-NOW Receiver",environment:"arduino",environmentLabel:"Arduino IDE",protocol:"wifi",protocolLabel:"ESP-NOW",language:"cpp",filename:"espnow_receiver.ino",dependencies:[],notes:["Run this on your receiving ESP32.","You can find this board's MAC address by running WiFi.macAddress()."],generate:()=>`#include <esp_now.h>
#include <WiFi.h>

typedef struct struct_message {
  char a[32];
  int b;
  float c;
  bool d;
} struct_message;

struct_message myData;

void OnDataRecv(const uint8_t * mac, const uint8_t *incomingData, int len) {
  memcpy(&myData, incomingData, sizeof(myData));
  Serial.print("Bytes received: ");
  Serial.println(len);
  Serial.print("Char: ");
  Serial.println(myData.a);
  Serial.print("Int: ");
  Serial.println(myData.b);
  Serial.print("Float: ");
  Serial.println(myData.c);
  Serial.print("Bool: ");
  Serial.println(myData.d);
  Serial.println();
}

void setup() {
  Serial.begin(115200);
  WiFi.mode(WIFI_STA);

  if (esp_now_init() != ESP_OK) {
    Serial.println("Error initializing ESP-NOW");
    return;
  }
  
  esp_now_register_recv_cb(OnDataRecv);
}

void loop() {
  // Event-driven. Data is handled in OnDataRecv callback.
  delay(10000);
}
`},{id:"uart-comm-arduino-serial",sensor:"uart-comm",sensorLabel:"UART Communication",environment:"arduino",environmentLabel:"Arduino IDE",protocol:"uart",protocolLabel:"Serial2",language:"cpp",filename:"uart_communication.ino",dependencies:[],notes:["Hardware Serial2 on ESP32 defaults to RX=16, TX=17.","Cross-connect TX of Board A to RX of Board B, and vice versa. DON'T forget common GND!"],generate:()=>`#include <Arduino.h>

#define RX_PIN 16
#define TX_PIN 17

void setup() {
  Serial.begin(115200); // Debug port
  Serial2.begin(115200, SERIAL_8N1, RX_PIN, TX_PIN); // Communication port
  Serial.println("ESP32 UART Communication Started.");
}

void loop() {
  // Read from Serial2 and print to Serial
  if (Serial2.available()) {
    String incoming = Serial2.readStringUntil('\\n');
    Serial.print("Received: ");
    Serial.println(incoming);
  }

  // Send a message every 3 seconds
  static unsigned long lastSend = 0;
  if (millis() - lastSend > 3000) {
    Serial2.println("Hello from ESP32 UART!");
    lastSend = millis();
  }
}
`},{id:"esp32s3-usb-cdc-arduino-serial",sensor:"esp32s3-usb-cdc",sensorLabel:"Native USB CDC",environment:"arduino",environmentLabel:"Arduino IDE",protocol:"usb",protocolLabel:"Native USB",language:"cpp",filename:"esp32s3_native_usb.ino",dependencies:[],notes:["Ensure 'USB CDC On Boot' is enabled in Arduino IDE Tools menu.","Hardware Serial (Serial0) will map to the native USB port instead of UART."],generate:()=>`void setup() {
  // For ESP32-S3 with Native USB CDC enabled, this connects to the USB port
  Serial.begin(115200);
  
  // Wait for USB Serial to connect (optional, but helpful for missing early logs)
  while(!Serial) {
    delay(10);
  }
  Serial.println("ESP32-S3 Native USB Initialized!");
}

void loop() {
  Serial.println("Hello over Native USB!");
  delay(1000);
}
`},{id:"esp32s3-camera-arduino-i2s",sensor:"esp32s3-camera",sensorLabel:"OV2640 Camera",environment:"arduino",environmentLabel:"Arduino IDE",protocol:"i2s",protocolLabel:"Parallel Camera",language:"cpp",filename:"esp32s3_camera.ino",dependencies:[{name:"esp32-camera",version:"built-in"}],notes:["Assumes typical ESP32-S3 WROOM Camera Pinout.","Requires PSRAM enabled in Arduino IDE Tools menu!"],generate:()=>`#include "esp_camera.h"

// Typical ESP32-S3 WROOM Camera Pinout
#define PWDN_GPIO_NUM  -1
#define RESET_GPIO_NUM -1
#define XCLK_GPIO_NUM  15
#define SIOD_GPIO_NUM  4
#define SIOC_GPIO_NUM  5
#define Y2_GPIO_NUM    11
#define Y3_GPIO_NUM    9
#define Y4_GPIO_NUM    8
#define Y5_GPIO_NUM    10
#define Y6_GPIO_NUM    12
#define Y7_GPIO_NUM    18
#define Y8_GPIO_NUM    17
#define Y9_GPIO_NUM    16
#define VSYNC_GPIO_NUM 6
#define HREF_GPIO_NUM  7
#define PCLK_GPIO_NUM  13

void setup() {
  Serial.begin(115200);
  
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.frame_size = FRAMESIZE_UXGA;
  config.pixel_format = PIXFORMAT_JPEG;
  config.grab_mode = CAMERA_GRAB_WHEN_EMPTY;
  config.fb_location = CAMERA_FB_IN_PSRAM;
  config.jpeg_quality = 12;
  config.fb_count = 1;

  // Init Camera
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x", err);
    return;
  }
  Serial.println("Camera initialized!");
}

void loop() {
  camera_fb_t * fb = esp_camera_fb_get();
  if (!fb) {
    Serial.println("Camera capture failed");
    return;
  }
  
  Serial.printf("Captured %d bytes\\n", fb->len);
  esp_camera_fb_return(fb);
  delay(2000);
}
`}],g=new Set(f.filter(e=>"platformio"===e.environment).map(e=>e.sensor)),h=f.filter(e=>"arduino"===e.environment&&!g.has(e.sensor)).map(function(e){return Object.freeze({...e,id:e.id.replace("-arduino-","-platformio-"),environment:"platformio",environmentLabel:"PlatformIO / Arduino",filename:e.filename.endsWith(".ino")?"main.cpp":e.filename,generate:(i={})=>{let t=e.generate(i);return t.includes("#include <Arduino.h>")?t:`#include <Arduino.h>
${t}`}})}),S=Object.freeze([...f,...h]),I=Object.freeze({bme280:[{key:"i2cAddress",label:"I2C address",type:"select",options:[{value:"0x76",label:"0x76 (SDO tied to GND, most breakout boards ship this way)"},{value:"0x77",label:"0x77 (SDO tied to VDDIO)"}],default:"0x76"}],mpu6050:[{key:"i2cAddress",label:"I2C address",type:"select",options:[{value:"0x68",label:"0x68 (AD0 low, default)"},{value:"0x69",label:"0x69 (AD0 tied high, for running two on one bus)"}],default:"0x68"}],hcsr04:[{key:"trigPin",label:"Trigger pin (GPIO)",type:"number",default:5},{key:"echoPin",label:"Echo pin (GPIO)",type:"number",default:18}],dht11:[{key:"dataPin",label:"Data pin (GPIO)",type:"number",default:4}],dht22:[{key:"dataPin",label:"Data pin (GPIO)",type:"number",default:4}],pir:[{key:"pirPin",label:"Output pin (GPIO)",type:"number",default:13}]}),b=Object.freeze([...l({target:"ssd1306-oled",label:"SSD1306 OLED display",protocol:"i2c",filename:"ssd1306_example.ino",dependencies:[{name:"Adafruit SSD1306",version:"^2.5.13"},{name:"Adafruit GFX Library",version:"^1.11.9"}],notes:["Common modules are 128x64 or 128x32 at I2C address 0x3C (sometimes 0x3D).","Call display.display() after every draw - nothing appears on the panel until you do."],generate:()=>`#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_ADDR 0x3C

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

void setup() {
  Serial.begin(115200);
  if (!display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR)) {
    Serial.println("SSD1306 not found");
    while (true) delay(10);
  }
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
}

void loop() {
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("Hello, sensor!");
  display.print("Uptime: ");
  display.print(millis() / 1000);
  display.println("s");
  display.display();
  delay(1000);
}
`,espidf:{dependencies:[{name:"esp-idf",version:"v5.0+"}],notes:["Sends the real SSD1306 power-on command sequence and can address individual pixels directly.","Text/font rendering is intentionally out of scope here - it needs a font-rasterizing library (e.g. esp-idf-component u8g2) rather than something safe to hand-roll; this starter proves the panel is alive by lighting a test pattern."],generate:()=>`#include <string.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/i2c.h"

#define I2C_MASTER_SCL_IO 22
#define I2C_MASTER_SDA_IO 21
#define I2C_MASTER_NUM    I2C_NUM_0
#define I2C_MASTER_FREQ_HZ 400000
#define OLED_ADDR 0x3C

static void i2c_master_init(void)
{
    i2c_config_t conf = {
        .mode = I2C_MODE_MASTER,
        .sda_io_num = I2C_MASTER_SDA_IO,
        .scl_io_num = I2C_MASTER_SCL_IO,
        .sda_pullup_en = GPIO_PULLUP_ENABLE,
        .scl_pullup_en = GPIO_PULLUP_ENABLE,
        .master.clk_speed = I2C_MASTER_FREQ_HZ,
    };
    i2c_param_config(I2C_MASTER_NUM, &conf);
    i2c_driver_install(I2C_MASTER_NUM, conf.mode, 0, 0, 0);
}

static void ssd1306_cmd(uint8_t cmd)
{
    uint8_t packet[2] = { 0x00, cmd }; // Co=0, D/C=0 (command)
    i2c_master_write_to_device(I2C_MASTER_NUM, OLED_ADDR, packet, 2, pdMS_TO_TICKS(100));
}

static void ssd1306_init(void)
{
    const uint8_t init_sequence[] = {
        0xAE,       // Display off
        0xD5, 0x80, // Clock divide
        0xA8, 0x3F, // Multiplex ratio (64 rows)
        0xD3, 0x00, // Display offset
        0x40,       // Start line 0
        0x8D, 0x14, // Charge pump enable
        0x20, 0x00, // Horizontal addressing mode
        0xA1,       // Segment remap
        0xC8,       // COM scan direction
        0xDA, 0x12, // COM pins
        0x81, 0xCF, // Contrast
        0xD9, 0xF1, // Pre-charge
        0xDB, 0x40, // VCOMH deselect
        0xA4,       // Resume to RAM content
        0xA6,       // Normal (not inverted) display
        0xAF,       // Display on
    };
    for (size_t i = 0; i < sizeof(init_sequence); i++) ssd1306_cmd(init_sequence[i]);
}

static void ssd1306_fill_test_pattern(void)
{
    uint8_t page_buf[65];
    page_buf[0] = 0x40; // Co=0, D/C=1 (data stream)
    for (uint8_t page = 0; page < 8; page++) {
        ssd1306_cmd(0xB0 + page); // Set page address
        ssd1306_cmd(0x00);        // Lower column = 0
        ssd1306_cmd(0x10);        // Higher column = 0
        memset(&page_buf[1], (page % 2) ? 0xAA : 0x55, 64);
        i2c_master_write_to_device(I2C_MASTER_NUM, OLED_ADDR, page_buf, sizeof(page_buf), pdMS_TO_TICKS(100));
    }
}

void app_main(void)
{
    i2c_master_init();
    ssd1306_init();
    ssd1306_fill_test_pattern();
    // A striped test pattern confirms the panel and wiring are alive; add u8g2 (idf-component-manager)
    // for real text/graphics rendering.
}
`}}),...l({target:"lcd1602-i2c",label:"1602 LCD (I2C backpack)",protocol:"i2c",filename:"lcd1602_example.ino",dependencies:[{name:"LiquidCrystal I2C",version:"^1.1.4"}],notes:["Most PCF8574 backpacks default to address 0x27 (some ship as 0x3F).","Run an I2C scan first if the display stays blank - a wrong address is the most common issue."],generate:()=>`#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);

void setup() {
  Wire.begin();
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Hello, sensor!");
}

void loop() {
  lcd.setCursor(0, 1);
  lcd.print("Uptime: ");
  lcd.print(millis() / 1000);
  lcd.print("s ");
  delay(1000);
}
`,espidf:{notes:["Drives the PCF8574 I2C backpack in 4-bit HD44780 mode directly - no external component required.","Default backpack address is 0x27 (some ship as 0x3F)."],generate:()=>`#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/i2c.h"
#include "rom/ets_sys.h"

#define I2C_MASTER_SCL_IO 22
#define I2C_MASTER_SDA_IO 21
#define I2C_MASTER_NUM    I2C_NUM_0
#define I2C_MASTER_FREQ_HZ 100000
#define LCD_ADDR 0x27
#define LCD_BACKLIGHT 0x08
#define ENABLE_BIT    0x04

static void i2c_master_init(void)
{
    i2c_config_t conf = {
        .mode = I2C_MODE_MASTER,
        .sda_io_num = I2C_MASTER_SDA_IO,
        .scl_io_num = I2C_MASTER_SCL_IO,
        .sda_pullup_en = GPIO_PULLUP_ENABLE,
        .scl_pullup_en = GPIO_PULLUP_ENABLE,
        .master.clk_speed = I2C_MASTER_FREQ_HZ,
    };
    i2c_param_config(I2C_MASTER_NUM, &conf);
    i2c_driver_install(I2C_MASTER_NUM, conf.mode, 0, 0, 0);
}

static void lcd_write_nibble(uint8_t nibble)
{
    uint8_t data = (nibble & 0xF0) | LCD_BACKLIGHT;
    uint8_t withEnable = data | ENABLE_BIT;
    i2c_master_write_to_device(I2C_MASTER_NUM, LCD_ADDR, &withEnable, 1, pdMS_TO_TICKS(100));
    ets_delay_us(1);
    i2c_master_write_to_device(I2C_MASTER_NUM, LCD_ADDR, &data, 1, pdMS_TO_TICKS(100));
    ets_delay_us(50);
}

static void lcd_send(uint8_t value, bool isData)
{
    uint8_t rs = isData ? 0x01 : 0x00;
    lcd_write_nibble((value & 0xF0) | rs);
    lcd_write_nibble(((value << 4) & 0xF0) | rs);
}

static void lcd_command(uint8_t cmd) { lcd_send(cmd, false); }
static void lcd_print(const char *text) { for (const char *c = text; *c; c++) lcd_send((uint8_t)*c, true); }

static void lcd_init(void)
{
    vTaskDelay(50 / portTICK_PERIOD_MS);
    lcd_write_nibble(0x30); vTaskDelay(5 / portTICK_PERIOD_MS);
    lcd_write_nibble(0x30); vTaskDelay(1 / portTICK_PERIOD_MS);
    lcd_write_nibble(0x30);
    lcd_write_nibble(0x20); // Switch to 4-bit mode

    lcd_command(0x28); // Function set: 4-bit, 2 line, 5x8 dots
    lcd_command(0x0C); // Display on, cursor off
    lcd_command(0x06); // Entry mode: increment cursor
    lcd_command(0x01); // Clear display
    vTaskDelay(2 / portTICK_PERIOD_MS);
}

void app_main(void)
{
    i2c_master_init();
    lcd_init();
    lcd_command(0x80); // Cursor to line 1
    lcd_print("Hello, sensor!");

    int seconds = 0;
    while (1) {
        char line[17];
        snprintf(line, sizeof(line), "Uptime: %ds  ", seconds++);
        lcd_command(0xC0); // Cursor to line 2
        lcd_print(line);
        vTaskDelay(1000 / portTICK_PERIOD_MS);
    }
}
`}}),...l({target:"ds3231-rtc",label:"DS3231 real-time clock",protocol:"i2c",filename:"ds3231_example.ino",dependencies:[{name:"RTClib",version:"^2.1.4"}],notes:["Keeps time through power loss on its coin-cell backup battery.","Set the time once (e.g. adjust(DateTime(F(__DATE__), F(__TIME__)))) after first flashing, then remove that call."],generate:()=>`#include <Wire.h>
#include <RTClib.h>

RTC_DS3231 rtc;

void setup() {
  Serial.begin(115200);
  if (!rtc.begin()) {
    Serial.println("DS3231 not found");
    while (true) delay(10);
  }
  if (rtc.lostPower()) {
    Serial.println("RTC lost power; set the time before trusting readings.");
  }
}

void loop() {
  DateTime now = rtc.now();
  Serial.printf("%04d-%02d-%02d %02d:%02d:%02d\\n", now.year(), now.month(), now.day(), now.hour(), now.minute(), now.second());
  delay(1000);
}
`,espidf:{notes:["Reads/writes the DS3231's BCD time registers directly - no external component required.","Set the time once with a write before relying on it; this starter only reads."],generate:()=>`#include <stdio.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/i2c.h"

#define I2C_MASTER_SCL_IO 22
#define I2C_MASTER_SDA_IO 21
#define I2C_MASTER_NUM    I2C_NUM_0
#define I2C_MASTER_FREQ_HZ 100000
#define DS3231_ADDR 0x68

static void i2c_master_init(void)
{
    i2c_config_t conf = {
        .mode = I2C_MODE_MASTER,
        .sda_io_num = I2C_MASTER_SDA_IO,
        .scl_io_num = I2C_MASTER_SCL_IO,
        .sda_pullup_en = GPIO_PULLUP_ENABLE,
        .scl_pullup_en = GPIO_PULLUP_ENABLE,
        .master.clk_speed = I2C_MASTER_FREQ_HZ,
    };
    i2c_param_config(I2C_MASTER_NUM, &conf);
    i2c_driver_install(I2C_MASTER_NUM, conf.mode, 0, 0, 0);
}

static uint8_t bcd_to_dec(uint8_t bcd) { return ((bcd / 16) * 10) + (bcd % 16); }

void app_main(void)
{
    i2c_master_init();

    while (1) {
        uint8_t reg = 0x00; // Seconds register, start of the time block
        uint8_t raw[7];
        if (i2c_master_write_read_device(I2C_MASTER_NUM, DS3231_ADDR, &reg, 1, raw, 7, pdMS_TO_TICKS(100)) != ESP_OK) {
            printf("DS3231 not found at 0x%02X\\n", DS3231_ADDR);
            vTaskDelay(1000 / portTICK_PERIOD_MS);
            continue;
        }

        uint8_t seconds = bcd_to_dec(raw[0] & 0x7F);
        uint8_t minutes = bcd_to_dec(raw[1]);
        uint8_t hours   = bcd_to_dec(raw[2] & 0x3F);
        uint8_t day     = bcd_to_dec(raw[4]);
        uint8_t month   = bcd_to_dec(raw[5] & 0x1F);
        uint8_t year    = bcd_to_dec(raw[6]);

        printf("20%02d-%02d-%02d %02d:%02d:%02d\\n", year, month, day, hours, minutes, seconds);
        vTaskDelay(1000 / portTICK_PERIOD_MS);
    }
}
`}}),...l({target:"bno055-imu",label:"BNO055 9-DOF absolute orientation sensor",protocol:"i2c",filename:"bno055_example.ino",dependencies:[{name:"Adafruit BNO055",version:"^1.6.3"}],notes:["Runs its own sensor-fusion firmware - it reports orientation directly rather than raw accel/gyro/mag.","Needs a figure-8 motion during first power-up for magnetometer calibration to converge."],generate:()=>`#include <Wire.h>
#include <Adafruit_BNO055.h>

Adafruit_BNO055 bno = Adafruit_BNO055(55, 0x28);

void setup() {
  Serial.begin(115200);
  if (!bno.begin()) {
    Serial.println("BNO055 not found");
    while (true) delay(10);
  }
  bno.setExtCrystalUse(true);
}

void loop() {
  sensors_event_t event;
  bno.getEvent(&event);
  Serial.print("Heading: "); Serial.print(event.orientation.x);
  Serial.print(" Roll: "); Serial.print(event.orientation.y);
  Serial.print(" Pitch: "); Serial.println(event.orientation.z);
  delay(100);
}
`,espidf:{notes:["Sets NDOF fusion mode and reads the Euler-angle registers directly - no external component required.","Needs a figure-8 motion during first power-up for magnetometer calibration to converge."],generate:()=>`#include <stdio.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/i2c.h"

#define I2C_MASTER_SCL_IO 22
#define I2C_MASTER_SDA_IO 21
#define I2C_MASTER_NUM    I2C_NUM_0
#define I2C_MASTER_FREQ_HZ 100000
#define BNO055_ADDR 0x28
#define BNO055_OPR_MODE_REG 0x3D
#define BNO055_NDOF_MODE     0x0C
#define BNO055_EULER_H_LSB   0x1A

static void i2c_master_init(void)
{
    i2c_config_t conf = {
        .mode = I2C_MODE_MASTER,
        .sda_io_num = I2C_MASTER_SDA_IO,
        .scl_io_num = I2C_MASTER_SCL_IO,
        .sda_pullup_en = GPIO_PULLUP_ENABLE,
        .scl_pullup_en = GPIO_PULLUP_ENABLE,
        .master.clk_speed = I2C_MASTER_FREQ_HZ,
    };
    i2c_param_config(I2C_MASTER_NUM, &conf);
    i2c_driver_install(I2C_MASTER_NUM, conf.mode, 0, 0, 0);
}

void app_main(void)
{
    i2c_master_init();

    uint8_t set_mode[2] = { BNO055_OPR_MODE_REG, BNO055_NDOF_MODE };
    if (i2c_master_write_to_device(I2C_MASTER_NUM, BNO055_ADDR, set_mode, 2, pdMS_TO_TICKS(100)) != ESP_OK) {
        printf("BNO055 not found at 0x%02X\\n", BNO055_ADDR);
        return;
    }
    vTaskDelay(20 / portTICK_PERIOD_MS); // Mode-switch settling time

    while (1) {
        uint8_t reg = BNO055_EULER_H_LSB;
        uint8_t raw[6];
        i2c_master_write_read_device(I2C_MASTER_NUM, BNO055_ADDR, &reg, 1, raw, 6, pdMS_TO_TICKS(100));

        int16_t heading = (raw[1] << 8) | raw[0];
        int16_t roll    = (raw[3] << 8) | raw[2];
        int16_t pitch   = (raw[5] << 8) | raw[4];

        // Euler registers report 1 LSB = 1/16 degree.
        printf("Heading: %.2f  Roll: %.2f  Pitch: %.2f\\n", heading / 16.0, roll / 16.0, pitch / 16.0);
        vTaskDelay(100 / portTICK_PERIOD_MS);
    }
}
`}}),...l({target:"sgp30-air-quality",label:"SGP30 VOC/eCO2 air-quality sensor",protocol:"i2c",filename:"sgp30_example.ino",dependencies:[{name:"Adafruit SGP30",version:"^2.0.3"}],notes:["eCO2/TVOC readings only stabilize after roughly 15s of warm-up and improve over the first 12h of run time.","Call IAQinit() once per boot before reading."],generate:()=>`#include <Wire.h>
#include <Adafruit_SGP30.h>

Adafruit_SGP30 sgp;

void setup() {
  Serial.begin(115200);
  if (!sgp.begin()) {
    Serial.println("SGP30 not found");
    while (true) delay(10);
  }
}

void loop() {
  if (!sgp.IAQmeasure()) {
    Serial.println("Measurement failed");
    return;
  }
  Serial.print("eCO2: "); Serial.print(sgp.eCO2); Serial.print(" ppm  TVOC: "); Serial.print(sgp.TVOC); Serial.println(" ppb");
  delay(1000);
}
`,espidf:{notes:["Sends the Sensirion 16-bit command + CRC-8 protocol directly - no external component required.","eCO2/TVOC only stabilize after roughly 15s of warm-up and improve over the first 12h of run time."],generate:()=>`#include <stdio.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/i2c.h"

#define I2C_MASTER_SCL_IO 22
#define I2C_MASTER_SDA_IO 21
#define I2C_MASTER_NUM    I2C_NUM_0
#define I2C_MASTER_FREQ_HZ 100000
#define SGP30_ADDR 0x58

static void i2c_master_init(void)
{
    i2c_config_t conf = {
        .mode = I2C_MODE_MASTER,
        .sda_io_num = I2C_MASTER_SDA_IO,
        .scl_io_num = I2C_MASTER_SCL_IO,
        .sda_pullup_en = GPIO_PULLUP_ENABLE,
        .scl_pullup_en = GPIO_PULLUP_ENABLE,
        .master.clk_speed = I2C_MASTER_FREQ_HZ,
    };
    i2c_param_config(I2C_MASTER_NUM, &conf);
    i2c_driver_install(I2C_MASTER_NUM, conf.mode, 0, 0, 0);
}

// Sensirion CRC-8: polynomial 0x31, init 0xFF.
static uint8_t sensirion_crc8(const uint8_t *data, size_t len)
{
    uint8_t crc = 0xFF;
    for (size_t i = 0; i < len; i++) {
        crc ^= data[i];
        for (int bit = 0; bit < 8; bit++) {
            crc = (crc & 0x80) ? (crc << 1) ^ 0x31 : (crc << 1);
        }
    }
    return crc;
}

static void sgp30_send_command(uint16_t command)
{
    uint8_t packet[2] = { command >> 8, command & 0xFF };
    i2c_master_write_to_device(I2C_MASTER_NUM, SGP30_ADDR, packet, 2, pdMS_TO_TICKS(100));
}

void app_main(void)
{
    i2c_master_init();

    sgp30_send_command(0x2003); // sgp30_iaq_init
    vTaskDelay(10 / portTICK_PERIOD_MS);

    while (1) {
        sgp30_send_command(0x2008); // sgp30_measure_iaq
        vTaskDelay(12 / portTICK_PERIOD_MS); // Measurement duration

        uint8_t raw[6];
        if (i2c_master_read_from_device(I2C_MASTER_NUM, SGP30_ADDR, raw, 6, pdMS_TO_TICKS(100)) == ESP_OK) {
            if (sensirion_crc8(raw, 2) == raw[2] && sensirion_crc8(raw + 3, 2) == raw[5]) {
                uint16_t eco2 = (raw[0] << 8) | raw[1];
                uint16_t tvoc = (raw[3] << 8) | raw[4];
                printf("eCO2: %d ppm  TVOC: %d ppb\\n", eco2, tvoc);
            } else {
                printf("SGP30 CRC check failed\\n");
            }
        }
        vTaskDelay(1000 / portTICK_PERIOD_MS);
    }
}
`}}),...l({target:"ina219-power",label:"INA219 current/power sensor",protocol:"i2c",filename:"ina219_example.ino",dependencies:[{name:"Adafruit INA219",version:"^1.2.3"}],notes:["Measures bus voltage and shunt current on the high side - wire the load's supply through the module's screw terminals or VIN+/VIN- pads.","Default calibration assumes a 0.1ohm shunt and supports up to ~3.2A."],generate:()=>`#include <Wire.h>
#include <Adafruit_INA219.h>

Adafruit_INA219 ina219;

void setup() {
  Serial.begin(115200);
  if (!ina219.begin()) {
    Serial.println("INA219 not found");
    while (true) delay(10);
  }
}

void loop() {
  float busVoltage = ina219.getBusVoltage_V();
  float current_mA = ina219.getCurrent_mA();
  float power_mW = ina219.getPower_mW();
  Serial.printf("Bus: %.2fV  Current: %.1fmA  Power: %.1fmW\\n", busVoltage, current_mA, power_mW);
  delay(500);
}
`,espidf:{notes:["Programs the calibration register and reads bus/current/power registers directly - no external component required.","Default calibration assumes a 0.1ohm shunt and supports up to ~3.2A."],generate:()=>`#include <stdio.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/i2c.h"

#define I2C_MASTER_SCL_IO 22
#define I2C_MASTER_SDA_IO 21
#define I2C_MASTER_NUM    I2C_NUM_0
#define I2C_MASTER_FREQ_HZ 100000
#define INA219_ADDR 0x40
#define REG_CONFIG      0x00
#define REG_SHUNT       0x01
#define REG_BUS         0x02
#define REG_POWER       0x03
#define REG_CURRENT     0x04
#define REG_CALIBRATION 0x05

static void i2c_master_init(void)
{
    i2c_config_t conf = {
        .mode = I2C_MODE_MASTER,
        .sda_io_num = I2C_MASTER_SDA_IO,
        .scl_io_num = I2C_MASTER_SCL_IO,
        .sda_pullup_en = GPIO_PULLUP_ENABLE,
        .scl_pullup_en = GPIO_PULLUP_ENABLE,
        .master.clk_speed = I2C_MASTER_FREQ_HZ,
    };
    i2c_param_config(I2C_MASTER_NUM, &conf);
    i2c_driver_install(I2C_MASTER_NUM, conf.mode, 0, 0, 0);
}

static void write_reg16(uint8_t reg, uint16_t value)
{
    uint8_t packet[3] = { reg, value >> 8, value & 0xFF };
    i2c_master_write_to_device(I2C_MASTER_NUM, INA219_ADDR, packet, 3, pdMS_TO_TICKS(100));
}

static int16_t read_reg16(uint8_t reg)
{
    uint8_t raw[2];
    i2c_master_write_read_device(I2C_MASTER_NUM, INA219_ADDR, &reg, 1, raw, 2, pdMS_TO_TICKS(100));
    return (raw[0] << 8) | raw[1];
}

void app_main(void)
{
    i2c_master_init();

    // Default Adafruit calibration: 0.1ohm shunt, 32V/2A range -> current LSB = 100uA, cal = 4096.
    write_reg16(REG_CALIBRATION, 4096);
    write_reg16(REG_CONFIG, 0x399F); // 32V range, 320mV shunt range, 12-bit, continuous

    while (1) {
        uint16_t busRaw = read_reg16(REG_BUS);
        float busVoltage = (busRaw >> 3) * 0.004f; // LSB = 4mV, right-aligned after status bits
        float current_mA = read_reg16(REG_CURRENT) * 0.1f; // 100uA LSB -> mA
        float power_mW = read_reg16(REG_POWER) * 2.0f;     // Power LSB = 20x current LSB

        printf("Bus: %.2fV  Current: %.1fmA  Power: %.1fmW\\n", busVoltage, current_mA, power_mW);
        vTaskDelay(500 / portTICK_PERIOD_MS);
    }
}
`}}),...l({target:"neo6m-gps",label:"NEO-6M GPS module",protocol:"uart",filename:"neo6m_example.ino",dependencies:[{name:"TinyGPSPlus",version:"^1.1.0"}],notes:["Needs a clear sky view - it will not get a fix indoors.","First fix after cold start can take 30s-a few minutes."],generate:(e={})=>{let i=o(e.rxPin,16),t=o(e.txPin,17);return`#include <TinyGPSPlus.h>
#include <HardwareSerial.h>

HardwareSerial gpsSerial(1);
TinyGPSPlus gps;

void setup() {
  Serial.begin(115200);
  gpsSerial.begin(9600, SERIAL_8N1, ${i}, ${t});
}

void loop() {
  while (gpsSerial.available()) {
    gps.encode(gpsSerial.read());
  }
  if (gps.location.isUpdated()) {
    Serial.print("Lat: "); Serial.print(gps.location.lat(), 6);
    Serial.print(" Lng: "); Serial.println(gps.location.lng(), 6);
  }
}
`},espidf:{notes:["Parses $GPGGA sentences directly over ESP-IDF's UART driver for latitude/longitude/fix quality.","This is a minimal single-sentence parser, not a full NMEA library - it covers the common case but skips checksum verification and the other sentence types (GPRMC, GPGSV, ...)."],generate:(e={})=>{var i,t;return i=o(e.rxPin,16),t=o(e.txPin,17),`#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/uart.h"

#define GPS_UART_NUM UART_NUM_1
#define GPS_RX_PIN   ${i}
#define GPS_TX_PIN   ${t}
#define GPS_BAUD     9600

static double nmea_to_decimal(const char *field, char hemisphere)
{
    double raw = atof(field);
    int degrees = (int)(raw / 100);
    double minutes = raw - (degrees * 100);
    double decimal = degrees + minutes / 60.0;
    if (hemisphere == 'S' || hemisphere == 'W') decimal = -decimal;
    return decimal;
}

// Minimal $GPGGA parser: $GPGGA,time,lat,N/S,lon,E/W,fix,sats,hdop,alt,...
static void parse_gpgga(char *sentence)
{
    char *fields[15] = { 0 };
    int count = 0;
    char *token = strtok(sentence, ",");
    while (token && count < 15) { fields[count++] = token; token = strtok(NULL, ","); }
    if (count < 6 || fields[2][0] == '\\0') return; // No fix yet

    double lat = nmea_to_decimal(fields[2], fields[3][0]);
    double lng = nmea_to_decimal(fields[4], fields[5][0]);
    printf("Lat: %.6f  Lng: %.6f\\n", lat, lng);
}

void app_main(void)
{
    uart_config_t uart_config = {
        .baud_rate = GPS_BAUD,
        .data_bits = UART_DATA_8_BITS,
        .parity = UART_PARITY_DISABLE,
        .stop_bits = UART_STOP_BITS_1,
        .flow_ctrl = UART_HW_FLOWCTRL_DISABLE,
    };
    uart_driver_install(GPS_UART_NUM, 1024, 0, 0, NULL, 0);
    uart_param_config(GPS_UART_NUM, &uart_config);
    uart_set_pin(GPS_UART_NUM, GPS_TX_PIN, GPS_RX_PIN, UART_PIN_NO_CHANGE, UART_PIN_NO_CHANGE);

    char line[128];
    int pos = 0;
    uint8_t byte;
    while (1) {
        int len = uart_read_bytes(GPS_UART_NUM, &byte, 1, pdMS_TO_TICKS(1000));
        if (len <= 0) continue;
        if (byte == '\\n') {
            line[pos] = '\\0';
            if (strncmp(line, "$GPGGA", 6) == 0) parse_gpgga(line);
            pos = 0;
        } else if (byte != '\\r' && pos < (int)sizeof(line) - 1) {
            line[pos++] = (char)byte;
        }
    }
}
`}}}),...l({target:"sd-card-logger",label:"SD card data logger",protocol:"spi",filename:"sd_logger_example.ino",dependencies:[],notes:["Uses the board-core SD library over hardware SPI.","Format the card as FAT32 before first use."],generate:(e={})=>{let i=o(e.csPin,5);return`#include <SPI.h>
#include <SD.h>

constexpr int CS_PIN = ${i};

void setup() {
  Serial.begin(115200);
  if (!SD.begin(CS_PIN)) {
    Serial.println("SD card mount failed");
    while (true) delay(10);
  }

  File dataFile = SD.open("/log.csv", FILE_APPEND);
  if (dataFile) {
    dataFile.println("timestamp_ms,value");
    dataFile.close();
  }
}

void loop() {
  File dataFile = SD.open("/log.csv", FILE_APPEND);
  if (dataFile) {
    dataFile.printf("%lu,%d\\n", millis(), analogRead(34));
    dataFile.close();
  } else {
    Serial.println("Failed to open log.csv");
  }
  delay(1000);
}
`},espidf:{notes:["Uses ESP-IDF's sdspi host driver and the FATFS VFS layer (esp_vfs_fat_sdspi_mount) - the standard native way to log to an SD card.","Format the card as FAT32 before first use."],generate:(e={})=>{var i;return i=o(e.csPin,5),`#include <stdio.h>
#include "esp_vfs_fat.h"
#include "driver/sdspi_host.h"
#include "sdmmc_cmd.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

#define PIN_NUM_MISO 19
#define PIN_NUM_MOSI 23
#define PIN_NUM_CLK  18
#define PIN_NUM_CS   ${i}

void app_main(void)
{
    esp_vfs_fat_sdmmc_mount_config_t mount_config = {
        .format_if_mount_failed = false,
        .max_files = 5,
    };

    sdmmc_host_t host = SDSPI_HOST_DEFAULT();
    spi_bus_config_t bus_cfg = {
        .mosi_io_num = PIN_NUM_MOSI,
        .miso_io_num = PIN_NUM_MISO,
        .sclk_io_num = PIN_NUM_CLK,
        .quadwp_io_num = -1,
        .quadhd_io_num = -1,
    };
    spi_bus_initialize(host.slot, &bus_cfg, SPI_DMA_CH_AUTO);

    sdspi_device_config_t slot_config = SDSPI_DEVICE_CONFIG_DEFAULT();
    slot_config.gpio_cs = PIN_NUM_CS;
    slot_config.host_id = host.slot;

    sdmmc_card_t *card;
    esp_err_t ret = esp_vfs_fat_sdspi_mount("/sdcard", &host, &slot_config, &mount_config, &card);
    if (ret != ESP_OK) {
        printf("SD card mount failed (0x%x) - check wiring and that it's formatted FAT32\\n", ret);
        return;
    }

    FILE *header = fopen("/sdcard/log.csv", "a");
    if (header) { fprintf(header, "timestamp_ms,value\\n"); fclose(header); }

    int tick = 0;
    while (1) {
        FILE *f = fopen("/sdcard/log.csv", "a");
        if (f) {
            fprintf(f, "%d,%d\\n", tick * 1000, tick % 100);
            fclose(f);
        } else {
            printf("Failed to open log.csv\\n");
        }
        tick++;
        vTaskDelay(1000 / portTICK_PERIOD_MS);
    }
}
`}}}),...l({target:"rotary-encoder",label:"Rotary encoder (quadrature)",protocol:"gpio",filename:"rotary_encoder_example.ino",dependencies:[],notes:["Wire the encoder's common pin to GND and enable internal pull-ups on CLK/DT.","The push-button (SW) pin, if present, is a separate active-low digital input."],generate:(e={})=>{let i=o(e.clkPin,32),t=o(e.dtPin,33);return`volatile int position = 0;
constexpr int CLK_PIN = ${i};
constexpr int DT_PIN = ${t};
int lastClkState;

void IRAM_ATTR onClkChange() {
  int clkState = digitalRead(CLK_PIN);
  if (clkState != lastClkState) {
    if (digitalRead(DT_PIN) != clkState) position++;
    else position--;
  }
  lastClkState = clkState;
}

void setup() {
  Serial.begin(115200);
  pinMode(CLK_PIN, INPUT_PULLUP);
  pinMode(DT_PIN, INPUT_PULLUP);
  lastClkState = digitalRead(CLK_PIN);
  attachInterrupt(digitalPinToInterrupt(CLK_PIN), onClkChange, CHANGE);
}

void loop() {
  static int lastReported = 0;
  if (position != lastReported) {
    Serial.print("Position: ");
    Serial.println(position);
    lastReported = position;
  }
  delay(10);
}
`},espidf:{notes:["Decodes the quadrature signal with a GPIO ISR, same approach as the Arduino version.","Wire the encoder's common pin to GND; CLK/DT use internal pull-ups."],generate:(e={})=>{var i,t;return i=o(e.clkPin,32),t=o(e.dtPin,33),`#include <stdio.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/gpio.h"
#include "esp_attr.h"

#define CLK_PIN ${i}
#define DT_PIN  ${t}

static volatile int position = 0;
static volatile int last_clk_state = 0;

static void IRAM_ATTR clk_isr_handler(void *arg)
{
    int clk_state = gpio_get_level(CLK_PIN);
    if (clk_state != last_clk_state) {
        if (gpio_get_level(DT_PIN) != clk_state) position++;
        else position--;
    }
    last_clk_state = clk_state;
}

void app_main(void)
{
    gpio_config_t io_conf = {
        .pin_bit_mask = (1ULL << CLK_PIN) | (1ULL << DT_PIN),
        .mode = GPIO_MODE_INPUT,
        .pull_up_en = GPIO_PULLUP_ENABLE,
        .intr_type = GPIO_INTR_ANYEDGE,
    };
    gpio_config(&io_conf);

    last_clk_state = gpio_get_level(CLK_PIN);

    gpio_install_isr_service(0);
    gpio_isr_handler_add(CLK_PIN, clk_isr_handler, NULL);

    int last_reported = 0;
    while (1) {
        if (position != last_reported) {
            printf("Position: %d\\n", position);
            last_reported = position;
        }
        vTaskDelay(10 / portTICK_PERIOD_MS);
    }
}
`}}}),d({target:"ble-client",label:"BLE GATT client (scanner)",protocol:"ble",dependencies:[{name:"esp-idf",version:"v5.0+, Bluedroid enabled"}],notes:["Scans for advertising BLE devices and logs their addresses - a connect-and-read client needs the full GATT client callback flow, which is why the Arduino/NimBLE variant remains the practical default for this target.","Scanning continuously consumes significant power."],generate:()=>`#include "esp_bt.h"
#include "esp_bt_main.h"
#include "esp_gap_ble_api.h"
#include "esp_log.h"

static const char *TAG = "ble_scanner";

static void gap_event_handler(esp_gap_ble_cb_event_t event, esp_ble_gap_cb_param_t *param)
{
    if (event == ESP_GAP_BLE_SCAN_RESULT_EVT && param->scan_rst.search_evt == ESP_GAP_SEARCH_INQ_RES_EVT) {
        ESP_LOGI(TAG, "Found device, RSSI %d", param->scan_rst.rssi);
    }
}

void app_main(void)
{
    esp_bt_controller_config_t bt_cfg = BT_CONTROLLER_INIT_CONFIG_DEFAULT();
    esp_bt_controller_init(&bt_cfg);
    esp_bt_controller_enable(ESP_BT_MODE_BLE);
    esp_bluedroid_init();
    esp_bluedroid_enable();

    esp_ble_gap_register_callback(gap_event_handler);

    static esp_ble_scan_params_t scan_params = {
        .scan_type = BLE_SCAN_TYPE_ACTIVE,
        .own_addr_type = BLE_ADDR_TYPE_PUBLIC,
        .scan_filter_policy = BLE_SCAN_FILTER_ALLOW_ALL,
        .scan_interval = 0x50,
        .scan_window = 0x30,
    };
    esp_ble_gap_set_scan_params(&scan_params);
    esp_ble_gap_start_scanning(30); // Scan for 30 seconds

    ESP_LOGI(TAG, "BLE scan started");
}
`})]),v=Object.freeze([...l({target:"deep-sleep-timer",label:"Deep sleep (timer wake)",protocol:"power",filename:"deep_sleep_example.ino",dependencies:[],notes:["Deep sleep resets the chip on wake - anything not in RTC memory or persisted externally is lost, including variable state.","Typical battery-node pattern: wake, read sensor, transmit, sleep. This starter times the wake interval only; wire in the sensor read where marked."],generate:(e={})=>{let i=Number.isFinite(e.sleepSeconds)?e.sleepSeconds:60;return`#include <Arduino.h>

constexpr uint64_t SLEEP_SECONDS = ${i};
RTC_DATA_ATTR int bootCount = 0; // Survives deep sleep - regular globals do not

void setup() {
  Serial.begin(115200);
  bootCount++;
  Serial.printf("Boot #%d, awake for a reading\\n", bootCount);

  // TODO: read the sensor and transmit here before going back to sleep.

  esp_sleep_enable_timer_wakeup(SLEEP_SECONDS * 1000000ULL);
  Serial.printf("Sleeping for %llu seconds...\\n", SLEEP_SECONDS);
  Serial.flush();
  esp_deep_sleep_start();
}

void loop() {
  // Never reached - the chip resets on wake and re-runs setup().
}
`},espidf:{notes:["Uses esp_sleep_enable_timer_wakeup + esp_deep_sleep_start directly.","RTC_DATA_ATTR-equivalent persistence in raw ESP-IDF is the RTC_DATA_ATTR macro from esp_attr.h, used the same way as in Arduino."],generate:(e={})=>{var i;return i=Number.isFinite(e.sleepSeconds)?e.sleepSeconds:60,`#include <stdio.h>
#include "esp_sleep.h"
#include "esp_attr.h"

#define SLEEP_SECONDS ${i}
RTC_DATA_ATTR static int boot_count = 0;

void app_main(void)
{
    boot_count++;
    printf("Boot #%d, awake for a reading\\n", boot_count);

    // TODO: read the sensor and transmit here before going back to sleep.

    esp_sleep_enable_timer_wakeup((uint64_t)SLEEP_SECONDS * 1000000ULL);
    printf("Sleeping for %d seconds...\\n", SLEEP_SECONDS);
    esp_deep_sleep_start();
}
`}}}),...l({target:"deep-sleep-gpio-wake",label:"Deep sleep (GPIO wake)",protocol:"power",filename:"deep_sleep_gpio_example.ino",dependencies:[],notes:["ext0 wake requires an RTC-capable GPIO (e.g. GPIO33 on most ESP32 dev boards) and only supports a single pin.","Combine with the timer-wake pattern (esp_sleep_enable_timer_wakeup) for a periodic check-in plus event wake."],generate:(e={})=>{let i=o(e.wakePin,33);return`#include <Arduino.h>

constexpr gpio_num_t WAKE_PIN = GPIO_NUM_${i};

void setup() {
  Serial.begin(115200);

  esp_sleep_wakeup_cause_t cause = esp_sleep_get_wakeup_cause();
  if (cause == ESP_SLEEP_WAKEUP_EXT0) {
    Serial.println("Woke from GPIO trigger");
  } else {
    Serial.println("Normal boot or reset");
  }

  pinMode(WAKE_PIN, INPUT_PULLDOWN);
  esp_sleep_enable_ext0_wakeup(WAKE_PIN, 1); // Wake on rising edge

  Serial.println("Going to sleep until the pin goes high...");
  Serial.flush();
  esp_deep_sleep_start();
}

void loop() {}
`}}),...l({target:"https-client",label:"HTTPS client (TLS)",protocol:"http",filename:"https_client.ino",dependencies:[],notes:["Replace ROOT_CA with the server's actual root CA certificate in PEM form - do not ship setInsecure() in production, it skips certificate validation entirely.","Fetch the correct root CA with: openssl s_client -connect host:443 -showcerts"],generate:()=>`#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>

const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* API_URL = "https://example.com/api/telemetry";

// Replace with the real root CA for your endpoint (openssl s_client -connect host:443 -showcerts).
const char* ROOT_CA = \\
"-----BEGIN CERTIFICATE-----\\n" \\
"REPLACE_WITH_YOUR_ROOT_CA\\n" \\
"-----END CERTIFICATE-----\\n";

void setup() {
  Serial.begin(115200);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) delay(250);
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClientSecure client;
    client.setCACert(ROOT_CA);
    // Only while proving out wiring on a test endpoint: client.setInsecure();

    HTTPClient https;
    if (https.begin(client, API_URL)) {
      int status = https.GET();
      Serial.printf("HTTPS status: %d\\n", status);
      if (status > 0) Serial.println(https.getString());
      https.end();
    } else {
      Serial.println("Unable to connect to endpoint");
    }
  }
  delay(10000);
}
`}),...l({target:"mqtts-publisher",label:"MQTTS publisher (TLS)",protocol:"mqtt",filename:"mqtts_publisher.ino",dependencies:[{name:"PubSubClient",version:"^2.8"}],notes:["Replace ROOT_CA with the broker's actual root CA certificate - do not ship setInsecure() in production.","TLS brokers default to port 8883, not 1883."],generate:()=>`#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>

const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* MQTT_BROKER = "YOUR_MQTT_BROKER";
constexpr uint16_t MQTT_PORT = 8883;

// Replace with the real root CA for your broker.
const char* ROOT_CA = \\
"-----BEGIN CERTIFICATE-----\\n" \\
"REPLACE_WITH_YOUR_ROOT_CA\\n" \\
"-----END CERTIFICATE-----\\n";

WiFiClientSecure network;
PubSubClient client(network);

void connectMqtt() {
  while (!client.connected()) {
    if (client.connect("esp32-workbench-tls")) {
      client.publish("workbench/telemetry", "{\\"temperature\\":24.5}");
    } else {
      delay(1000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) delay(250);
  network.setCACert(ROOT_CA);
  client.setServer(MQTT_BROKER, MQTT_PORT);
}

void loop() {
  if (!client.connected()) connectMqtt();
  client.loop();
  static unsigned long last = 0;
  if (millis() - last > 5000) {
    client.publish("workbench/telemetry", "online");
    last = millis();
  }
}
`}),...l({target:"ota-update",label:"OTA firmware update",protocol:"wifi",filename:"ota_update.ino",dependencies:[{name:"ArduinoOTA",version:"built-in"}],notes:["Set an OTA password before shipping - an open OTA port lets anyone on the network reflash the device.","Upload via Arduino IDE/PlatformIO's 'Upload' once the device shows up as a network port, or trigger it from a CI pipeline with espota.py."],generate:()=>`#include <WiFi.h>
#include <ArduinoOTA.h>

const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

void setup() {
  Serial.begin(115200);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) delay(250);

  ArduinoOTA.setHostname("esp32-workbench");
  ArduinoOTA.setPassword("CHANGE_ME_BEFORE_SHIPPING");

  ArduinoOTA.onStart([]() { Serial.println("OTA update starting"); });
  ArduinoOTA.onEnd([]() { Serial.println("OTA update complete"); });
  ArduinoOTA.onError([](ota_error_t error) { Serial.printf("OTA error [%u]\\n", error); });

  ArduinoOTA.begin();
  Serial.println("OTA ready");
}

void loop() {
  ArduinoOTA.handle();
  // Normal sensor/telemetry work goes here - keep it non-blocking so OTA stays responsive.
}
`}),...l({target:"watchdog-recovery",label:"Watchdog-guarded sensor loop",protocol:"power",filename:"watchdog_example.ino",dependencies:[],notes:["This is the pattern the other sensor templates' `while (1);` hang-on-error should be replaced with in a fielded device: bounded retries, then a controlled reset instead of a silent hang.","esp_task_wdt reboots the board if loop() doesn't call reset() within the timeout - remove the reset() call temporarily to test that it actually reboots."],generate:(e={})=>{let i=Number.isFinite(e.timeoutSeconds)?e.timeoutSeconds:8;return`#include <Arduino.h>
#include <esp_task_wdt.h>

constexpr int WDT_TIMEOUT_SECONDS = ${i};
constexpr int MAX_INIT_RETRIES = 5;

bool initSensorWithRetries() {
  for (int attempt = 1; attempt <= MAX_INIT_RETRIES; attempt++) {
    // TODO: replace with the real sensor .begin() check, e.g. if (bme.begin(0x76)) return true;
    bool ok = true;
    if (ok) return true;

    Serial.printf("Sensor init failed (attempt %d/%d), retrying...\\n", attempt, MAX_INIT_RETRIES);
    delay(500 * attempt); // Back off a little longer each retry
  }
  return false;
}

void setup() {
  Serial.begin(115200);

  esp_task_wdt_config_t wdt_config = {
    .timeout_ms = WDT_TIMEOUT_SECONDS * 1000,
    .idle_core_mask = 0,
    .trigger_panic = true
  };
  esp_task_wdt_init(&wdt_config);
  esp_task_wdt_add(NULL);

  if (!initSensorWithRetries()) {
    Serial.println("Sensor never came up after retries - rebooting via watchdog instead of hanging forever.");
    while (true) { delay(10); } // Intentionally do NOT reset the watchdog: it will reboot the board.
  }
}

void loop() {
  // TODO: real sensor read goes here.
  esp_task_wdt_reset(); // Prove to the watchdog this loop iteration is alive.
  delay(1000);
}
`}})]);function P({target:e,label:i,protocol:t,dependencies:n={},notes:r={},raspberryPi:a,jetson:o}){let s=[];return a&&s.push(Object.freeze({id:`${e}-raspberry-pi-${t}`,target:e,label:i,environment:"raspberry-pi",environmentLabel:"Raspberry Pi 4/5 (Python)",protocol:t,protocolLabel:t.toUpperCase(),language:"python",filename:"main.py",dependencies:Object.freeze(n.raspberryPi??[]),notes:Object.freeze(r.raspberryPi??[]),generate:a})),o&&s.push(Object.freeze({id:`${e}-jetson-${t}`,target:e,label:i,environment:"jetson",environmentLabel:"Jetson Nano/Orin (Python)",protocol:t,protocolLabel:t.toUpperCase(),language:"python",filename:"main.py",dependencies:Object.freeze(n.jetson??[]),notes:Object.freeze(r.jetson??[]),generate:o})),s}let T=Object.freeze([...P({target:"sbc-gpio-io",label:"Digital I/O (LED + button)",protocol:"gpio",dependencies:{raspberryPi:[{name:"gpiozero",version:"^2.0"},{name:"rpi-lgpio (Pi 5 only)",version:"latest"}],jetson:[{name:"Jetson.GPIO",version:"^2.1.0"}]},notes:{raspberryPi:["gpiozero picks the right backend automatically on Pi 4 (RPi.GPIO) and Pi 5 (lgpio) - on Pi 5 install it with: sudo apt install python3-lgpio, or pip install rpi-lgpio.","Pin numbers are BCM numbering (the number printed on gpiozero's own pinout, not the physical header position)."],jetson:["Jetson.GPIO uses physical BOARD pin numbers by default here, not BCM/SoC numbers - check your carrier board's 40-pin header diagram.","GPIO access needs either sudo or membership in the gpio group (sudo usermod -aG gpio $USER, then re-login)."]},raspberryPi:(e={})=>{let i=Number.isInteger(e.ledPin)?e.ledPin:17,t=Number.isInteger(e.buttonPin)?e.buttonPin:27;return`from gpiozero import LED, Button
from signal import pause

LED_PIN = ${i}
BUTTON_PIN = ${t}

led = LED(LED_PIN)
button = Button(BUTTON_PIN, pull_up=True)

button.when_pressed = led.on
button.when_released = led.off

print("Press the button to light the LED. Ctrl+C to exit.")
pause()
`},jetson:(e={})=>{let i=Number.isInteger(e.ledPin)?e.ledPin:18,t=Number.isInteger(e.buttonPin)?e.buttonPin:16;return`import Jetson.GPIO as GPIO
import time

LED_PIN = ${i}     # Physical (BOARD) pin number
BUTTON_PIN = ${t}  # Physical (BOARD) pin number

GPIO.setmode(GPIO.BOARD)
GPIO.setup(LED_PIN, GPIO.OUT, initial=GPIO.LOW)
GPIO.setup(BUTTON_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)

try:
    print("Press the button to light the LED. Ctrl+C to exit.")
    while True:
        GPIO.output(LED_PIN, GPIO.LOW if GPIO.input(BUTTON_PIN) else GPIO.HIGH)
        time.sleep(0.05)
except KeyboardInterrupt:
    pass
finally:
    GPIO.cleanup()
`}}),...P({target:"sbc-pwm",label:"PWM output (LED fade / servo)",protocol:"pwm",dependencies:{raspberryPi:[{name:"gpiozero",version:"^2.0"}],jetson:[{name:"Jetson.GPIO",version:"^2.1.0"}]},notes:{raspberryPi:["Any GPIO pin can do software PWM through gpiozero; for jitter-free control (e.g. servos) prefer a hardware PWM-capable pin (GPIO12/13/18/19)."],jetson:["Hardware PWM is only broken out on specific header pins (pin 32 or 33 on most Jetson carrier boards) - check your board's pinout before wiring."]},raspberryPi:(e={})=>{let i=Number.isInteger(e.pwmPin)?e.pwmPin:18;return`from gpiozero import PWMLED
from time import sleep

led = PWMLED(${i})

try:
    while True:
        for brightness in range(0, 101, 5):
            led.value = brightness / 100
            sleep(0.05)
        for brightness in range(100, -1, -5):
            led.value = brightness / 100
            sleep(0.05)
except KeyboardInterrupt:
    led.off()
`},jetson:(e={})=>{let i=Number.isInteger(e.pwmPin)?e.pwmPin:32;return`import Jetson.GPIO as GPIO
import time

PWM_PIN = ${i}  # Hardware PWM-capable header pin

GPIO.setmode(GPIO.BOARD)
GPIO.setup(PWM_PIN, GPIO.OUT)
pwm = GPIO.PWM(PWM_PIN, 100)  # 100 Hz
pwm.start(0)

try:
    while True:
        for duty in range(0, 101, 5):
            pwm.ChangeDutyCycle(duty)
            time.sleep(0.05)
        for duty in range(100, -1, -5):
            pwm.ChangeDutyCycle(duty)
            time.sleep(0.05)
except KeyboardInterrupt:
    pass
finally:
    pwm.stop()
    GPIO.cleanup()
`}}),...P({target:"sbc-i2c-sensor",label:"I2C sensor read (BME280)",protocol:"i2c",dependencies:{raspberryPi:[{name:"smbus2",version:"^0.4.3"}],jetson:[{name:"smbus2",version:"^0.4.3"}]},notes:{raspberryPi:["Enable I2C first with: sudo raspi-config -> Interface Options -> I2C.","Confirm the address and wiring with: i2cdetect -y 1"],jetson:["The I2C bus number depends on the carrier board - run i2cdetect -y -l to list buses, then i2cdetect -y <bus> to find the device.","You may need to run with sudo unless your user is in the i2c group."]},raspberryPi:(e={})=>E(e.i2cBus??1,"0x77"===e.i2cAddress?119:118),jetson:(e={})=>E(e.i2cBus??1,"0x77"===e.i2cAddress?119:118)}),...P({target:"sbc-spi-transfer",label:"SPI transfer",protocol:"spi",dependencies:{raspberryPi:[{name:"spidev",version:"^3.6"}],jetson:[{name:"spidev",version:"^3.6"}]},notes:{raspberryPi:["Enable SPI first with: sudo raspi-config -> Interface Options -> SPI."],jetson:["SPI must be enabled for your specific carrier board via jetson-io (sudo /opt/nvidia/jetson-io/jetson-io.py) before /dev/spidev* appears."]},raspberryPi:(e={})=>C(e.spiBus??0,e.spiDevice??0),jetson:(e={})=>C(e.spiBus??0,e.spiDevice??0)}),...P({target:"sbc-camera",label:"Camera capture",protocol:"camera",dependencies:{raspberryPi:[{name:"picamera2",version:"system package, preinstalled on Raspberry Pi OS"}],jetson:[{name:"opencv-python",version:"^4.9"},{name:"GStreamer + L4T multimedia API",version:"ships with JetPack"}]},notes:{raspberryPi:["Uses the libcamera-based picamera2 stack (the Legacy camera stack and raspistill are deprecated).","Works on both the Pi 4's and Pi 5's camera connectors without code changes."],jetson:["nvarguscamerasrc is the Jetson-specific GStreamer element for CSI camera modules (e.g. IMX219) - it will not work with a USB webcam, use cv2.VideoCapture(0) directly for those.","Requires the nvargus-daemon service to be running (it starts automatically on JetPack)."]},raspberryPi:()=>`from picamera2 import Picamera2
import time

picam2 = Picamera2()
config = picam2.create_still_configuration()
picam2.configure(config)
picam2.start()
time.sleep(2)  # Let auto-exposure and white balance settle
picam2.capture_file("capture.jpg")
picam2.stop()
print("Saved capture.jpg")
`,jetson:()=>`import cv2

def gstreamer_pipeline(sensor_id=0, capture_width=1280, capture_height=720, framerate=30):
    return (
        f"nvarguscamerasrc sensor-id={sensor_id} ! "
        f"video/x-raw(memory:NVMM), width={capture_width}, height={capture_height}, "
        f"format=NV12, framerate={framerate}/1 ! "
        "nvvidconv flip-method=0 ! video/x-raw, format=BGRx ! "
        "videoconvert ! video/x-raw, format=BGR ! appsink"
    )

cap = cv2.VideoCapture(gstreamer_pipeline(), cv2.CAP_GSTREAMER)
if not cap.isOpened():
    raise RuntimeError("Unable to open CSI camera - check the ribbon cable and the nvargus-daemon service")

ret, frame = cap.read()
if ret:
    cv2.imwrite("capture.jpg", frame)
    print("Saved capture.jpg")
cap.release()
`})]);function E(e,i){return`import smbus2
import time

I2C_BUS = ${e}
BME280_ADDR = ${119===i?"0x77":"0x76"}

bus = smbus2.SMBus(I2C_BUS)


def read_calibration():
    calib = bus.read_i2c_block_data(BME280_ADDR, 0x88, 24)
    dig_T1 = calib[1] << 8 | calib[0]
    dig_T2 = to_signed16(calib[3] << 8 | calib[2])
    dig_T3 = to_signed16(calib[5] << 8 | calib[4])
    dig_P1 = calib[7] << 8 | calib[6]
    dig_P2 = to_signed16(calib[9] << 8 | calib[8])
    dig_P3 = to_signed16(calib[11] << 8 | calib[10])
    dig_P4 = to_signed16(calib[13] << 8 | calib[12])
    dig_P5 = to_signed16(calib[15] << 8 | calib[14])
    dig_P6 = to_signed16(calib[17] << 8 | calib[16])
    dig_P7 = to_signed16(calib[19] << 8 | calib[18])
    dig_P8 = to_signed16(calib[21] << 8 | calib[20])
    dig_P9 = to_signed16(calib[23] << 8 | calib[22])
    return (dig_T1, dig_T2, dig_T3, dig_P1, dig_P2, dig_P3, dig_P4, dig_P5, dig_P6, dig_P7, dig_P8, dig_P9)


def to_signed16(value):
    return value - 65536 if value > 32767 else value


def read_bme280():
    (dig_T1, dig_T2, dig_T3, dig_P1, dig_P2, dig_P3, dig_P4, dig_P5, dig_P6, dig_P7, dig_P8, dig_P9) = read_calibration()

    # Normal mode, 16x oversampling on temperature and pressure.
    bus.write_i2c_block_data(BME280_ADDR, 0xF4, [0xB7])
    time.sleep(0.05)

    raw = bus.read_i2c_block_data(BME280_ADDR, 0xF7, 6)
    adc_p = (raw[0] << 12) | (raw[1] << 4) | (raw[2] >> 4)
    adc_t = (raw[3] << 12) | (raw[4] << 4) | (raw[5] >> 4)

    var1 = (adc_t / 16384.0 - dig_T1 / 1024.0) * dig_T2
    var2 = ((adc_t / 131072.0 - dig_T1 / 8192.0) ** 2) * dig_T3
    t_fine = var1 + var2
    temperature = t_fine / 5120.0

    p1 = t_fine / 2.0 - 64000.0
    p2 = p1 * p1 * dig_P6 / 32768.0
    p2 = p2 + p1 * dig_P5 * 2.0
    p2 = p2 / 4.0 + dig_P4 * 65536.0
    p1 = (dig_P3 * p1 * p1 / 524288.0 + dig_P2 * p1) / 524288.0
    p1 = (1.0 + p1 / 32768.0) * dig_P1
    if p1 == 0:
        pressure = 0
    else:
        pressure = 1048576.0 - adc_p
        pressure = (pressure - p2 / 4096.0) * 6250.0 / p1
        p1 = dig_P9 * pressure * pressure / 2147483648.0
        p2 = pressure * dig_P8 / 32768.0
        pressure = pressure + (p1 + p2 + dig_P7) / 16.0

    return temperature, pressure / 100.0


if __name__ == "__main__":
    try:
        while True:
            temperature_c, pressure_hpa = read_bme280()
            print(f"Temperature C: {temperature_c:.2f}")
            print(f"Pressure hPa: {pressure_hpa:.2f}")
            time.sleep(2)
    except KeyboardInterrupt:
        pass
    finally:
        bus.close()
`}function C(e,i){return`import spidev
import time

spi = spidev.SpiDev()
spi.open(${e}, ${i})
spi.max_speed_hz = 1000000
spi.mode = 0

try:
    while True:
        response = spi.xfer2([0x00])
        print(f"SPI response: 0x{response[0]:02X}")
        time.sleep(1)
except KeyboardInterrupt:
    pass
finally:
    spi.close()
`}let A=Object.freeze([Object.freeze({id:"sensor",label:"Sensors",summary:"Read physical measurements from real devices."}),Object.freeze({id:"communication",label:"Communication",summary:"Move data between boards, services, and apps."}),Object.freeze({id:"interface",label:"Board interfaces",summary:"Bring up buses, cameras, USB, and peripheral links."}),Object.freeze({id:"hardening",label:"Production hardening",summary:"Deep sleep, TLS, OTA updates, and watchdog recovery for fielded devices."}),Object.freeze({id:"sbc",label:"Single-board computers",summary:"GPIO, I2C, SPI, and camera code for Raspberry Pi and Jetson boards."})]),O=Object.freeze([["bme280","sensor","BME280","Temperature, humidity, and pressure",["i2c"]],["mpu6050","sensor","MPU6050","Acceleration and angular velocity",["i2c"]],["hcsr04","sensor","HC-SR04","Ultrasonic distance",["gpio"]],["irsensor","sensor","IR obstacle sensor","Digital obstacle presence",["gpio"]],["dht11","sensor","DHT11","Basic temperature and humidity",["gpio"]],["dht22","sensor","DHT22","Improved temperature and humidity",["gpio"]],["mq2","sensor","MQ-2","Smoke and combustible gas response",["adc"]],["pir","sensor","HC-SR501 PIR","Motion detection",["gpio"]],["bmp280","sensor","BMP280","Temperature and barometric pressure",["i2c"]],["ds18b20","sensor","DS18B20","Digital temperature on a OneWire bus",["onewire"]],["bh1750","sensor","BH1750","Ambient light in lux",["i2c"]],["vl53l0x","sensor","VL53L0X","Time-of-flight distance",["i2c"]],["ads1115","sensor","ADS1115","16-bit external analog conversion",["i2c"]],["hx711","sensor","HX711 + load cell","Weight and force measurement",["gpio"]],["soil-moisture","sensor","Capacitive soil moisture","Calibrated analog moisture level",["adc"]],["ssd1306-oled","sensor","SSD1306 OLED display","128x64/128x32 I2C display output",["i2c"]],["lcd1602-i2c","sensor","1602 LCD (I2C backpack)","16x2 character display output",["i2c"]],["ds3231-rtc","sensor","DS3231 RTC","Battery-backed real-time clock",["i2c"]],["bno055-imu","sensor","BNO055 IMU","Fused 9-DOF absolute orientation",["i2c"]],["sgp30-air-quality","sensor","SGP30","eCO2 and TVOC air quality",["i2c"]],["ina219-power","sensor","INA219","Current, bus voltage, and power",["i2c"]],["neo6m-gps","sensor","NEO-6M GPS","Latitude/longitude from NMEA sentences",["uart"]],["sd-card-logger","sensor","SD card logger","Local CSV logging with no network",["spi"]],["rotary-encoder","sensor","Rotary encoder","Quadrature position input",["gpio"]],["espnow-sender","communication","ESP-NOW sender","Low-latency ESP32 peer messages",["wifi"]],["espnow-receiver","communication","ESP-NOW receiver","Receive ESP32 peer messages",["wifi"]],["uart-comm","communication","UART link","Board-to-board serial communication",["uart"]],["http-client","communication","HTTP client","Send or fetch web API data",["http"]],["http-server","communication","HTTP server","Expose a local device endpoint",["http"]],["mqtt-publisher","communication","MQTT publisher","Publish device telemetry",["mqtt"]],["mqtt-subscriber","communication","MQTT subscriber","Receive device commands",["mqtt"]],["ble-server","communication","BLE GATT server","Advertise readable or notifiable data",["ble"]],["ble-client","communication","BLE GATT client","Scan and connect to peripherals",["ble"]],["esp32s3-usb-cdc","interface","ESP32-S3 USB CDC","Native USB serial bring-up",["usb"]],["esp32s3-camera","interface","OV2640 camera","ESP32-S3 camera capture",["i2s"]],["i2c-scanner","interface","I2C bus scanner","Discover device addresses",["i2c"]],["spi-transfer","interface","SPI transfer","Full-duplex peripheral exchange",["spi"]],["deep-sleep-timer","hardening","Deep sleep (timer wake)","Wake on a fixed interval to save battery",["power"]],["deep-sleep-gpio-wake","hardening","Deep sleep (GPIO wake)","Wake on an external signal",["power"]],["https-client","hardening","HTTPS client (TLS)","Certificate-validated HTTP requests",["http"]],["mqtts-publisher","hardening","MQTTS publisher (TLS)","Certificate-validated MQTT telemetry",["mqtt"]],["ota-update","hardening","OTA firmware update","Reflash over Wi-Fi instead of USB",["wifi"]],["watchdog-recovery","hardening","Watchdog-guarded sensor loop","Bounded retries and reset instead of a silent hang",["power"]],["sbc-gpio-io","sbc","Digital I/O","LED output and button input",["gpio"]],["sbc-pwm","sbc","PWM output","LED fade or servo control",["pwm"]],["sbc-i2c-sensor","sbc","I2C sensor read (BME280)","Register-level I2C read over Linux i2c-dev",["i2c"]],["sbc-spi-transfer","sbc","SPI transfer","Full-duplex exchange over Linux spidev",["spi"]],["sbc-camera","sbc","Camera capture","Still-image capture from the CSI camera connector",["camera"]]].map(([e,i,t,n,r])=>Object.freeze({id:e,family:i,label:t,summary:n,protocols:Object.freeze(r)}))),R=Object.freeze([["weather-station","sensor","bme280","Weather station","Read temperature, humidity, and pressure together",{i2cAddress:"0x76"}],["tank-distance","sensor","vl53l0x","Tank distance","Measure short-range distance without an ultrasonic echo",{}],["load-cell-scale","sensor","hx711","Load-cell scale","Start a calibrated weight measurement",{dataPin:19,clockPin:18,calibrationFactor:-7050}],["light-monitor","sensor","bh1750","Light monitor","Report ambient illuminance in lux",{}],["plant-moisture","sensor","soil-moisture","Plant moisture","Calibrate dry and wet soil readings",{adcPin:34,dryReading:3e3,wetReading:1300}],["temperature-bus","sensor","ds18b20","Temperature bus","Read a waterproof OneWire temperature probe",{dataPin:4}],["status-display","sensor","ssd1306-oled","Status display","Show live readings on a small OLED panel",{}],["field-clock","sensor","ds3231-rtc","Field clock","Keep accurate time with no network connection",{}],["orientation-tracker","sensor","bno055-imu","Orientation tracker","Read fused heading, roll, and pitch",{}],["air-quality-monitor","sensor","sgp30-air-quality","Air quality monitor","Track eCO2 and TVOC indoors",{}],["power-monitor","sensor","ina219-power","Power monitor","Measure current and power draw of a load",{}],["gps-tracker","sensor","neo6m-gps","GPS tracker","Report live latitude and longitude",{rxPin:16,txPin:17}],["offline-logger","sensor","sd-card-logger","Offline data logger","Log readings to a CSV file with no network",{csPin:5}],["board-telemetry","communication","mqtt-publisher","Publish telemetry","Send periodic device state through MQTT",{}],["remote-command","communication","mqtt-subscriber","Receive commands","Subscribe to a command topic",{}],["local-api","communication","http-server","Local device API","Expose a JSON health endpoint",{}],["peer-link","communication","espnow-sender","ESP-NOW peer link","Send a compact message between ESP32 boards",{}],["bus-diagnostics","interface","i2c-scanner","I2C diagnostics","Find addresses during hardware bring-up",{}],["spi-bring-up","interface","spi-transfer","SPI bring-up","Verify chip-select and transfer wiring",{csPin:5}],["battery-node","hardening","deep-sleep-timer","Battery-powered node","Wake on a timer, read, transmit, sleep",{sleepSeconds:300}],["secure-telemetry","hardening","https-client","Secure telemetry","Send readings to a TLS-verified endpoint",{}],["field-update","hardening","ota-update","Field firmware update","Reflash a deployed device over Wi-Fi",{}],["pi-blink","sbc","sbc-gpio-io","Pi/Jetson digital I/O","Light an LED from a button on a Linux SBC",{}],["pi-weather","sbc","sbc-i2c-sensor","Pi/Jetson weather read","Read a BME280 over Linux i2c-dev",{i2cAddress:"0x76"}],["pi-camera","sbc","sbc-camera","Pi/Jetson camera capture","Grab a still frame from the CSI camera",{}]].map(([e,i,t,n,r,a])=>Object.freeze({id:e,family:i,target:t,title:n,summary:r,params:Object.freeze(a)}))),D=Object.freeze({...I,bmp280:I.bme280,ds18b20:[{key:"dataPin",label:"Data pin (GPIO)",type:"number",default:4}],hx711:[{key:"dataPin",label:"Data pin (GPIO)",type:"number",default:19},{key:"clockPin",label:"Clock pin (GPIO)",type:"number",default:18},{key:"calibrationFactor",label:"Calibration factor",type:"number",default:-7050}],"soil-moisture":[{key:"adcPin",label:"ADC pin",type:"number",default:34},{key:"dryReading",label:"Dry calibration reading",type:"number",default:3e3},{key:"wetReading",label:"Wet calibration reading",type:"number",default:1300}],"spi-transfer":[{key:"csPin",label:"Chip-select pin",type:"number",default:5}],"neo6m-gps":[{key:"rxPin",label:"RX pin (GPIO, board receives here)",type:"number",default:16},{key:"txPin",label:"TX pin (GPIO)",type:"number",default:17}],"sd-card-logger":[{key:"csPin",label:"Chip-select pin",type:"number",default:5}],"rotary-encoder":[{key:"clkPin",label:"CLK pin (GPIO)",type:"number",default:32},{key:"dtPin",label:"DT pin (GPIO)",type:"number",default:33}],"deep-sleep-timer":[{key:"sleepSeconds",label:"Sleep duration (seconds)",type:"number",default:60}],"deep-sleep-gpio-wake":[{key:"wakePin",label:"Wake pin (RTC-capable GPIO)",type:"number",default:33}],"watchdog-recovery":[{key:"timeoutSeconds",label:"Watchdog timeout (seconds)",type:"number",default:8}],"sbc-gpio-io":[{key:"ledPin",label:"LED pin",type:"number",default:17},{key:"buttonPin",label:"Button pin",type:"number",default:27}],"sbc-pwm":[{key:"pwmPin",label:"PWM pin",type:"number",default:18}],"sbc-i2c-sensor":[{key:"i2cBus",label:"I2C bus number",type:"number",default:1},{key:"i2cAddress",label:"I2C address",type:"select",options:[{value:"0x76",label:"0x76 (SDO tied to GND, most breakout boards ship this way)"},{value:"0x77",label:"0x77 (SDO tied to VDDIO)"}],default:"0x76"}],"sbc-spi-transfer":[{key:"spiBus",label:"SPI bus number",type:"number",default:0},{key:"spiDevice",label:"SPI device (chip-select) number",type:"number",default:0}]}),N=new Map(O.map(({id:e,family:i})=>[e,i])),w=Object.freeze({i2c:["Connect SDA and SCL to the board I2C pins.","Connect a common ground and use the module's supported supply voltage."],gpio:["Connect signal pins exactly as configured and share ground."],adc:["Connect the analog output to an ADC-capable pin and share ground."],onewire:["Connect DATA to the configured GPIO with the required pull-up resistor."],wifi:["No signal wires are required; both devices need compatible 2.4 GHz radio settings."],http:["No peripheral wiring is required beyond board power and network connectivity."],mqtt:["No peripheral wiring is required beyond board power and network connectivity."],ble:["No peripheral wiring is required beyond board power and BLE radio availability."],uart:["Cross TX to RX, RX to TX, and connect grounds."],usb:["Use the board's native USB connector and a data-capable cable."],i2s:["Camera data and clock pins must match the board module pinout."],spi:["Connect SCK, MOSI, MISO, CS, power, and a common ground."],power:["No peripheral wiring is required for the sleep/wake behavior itself; wire whatever sensor you read before sleeping separately."],pwm:["Connect the signal wire to the configured pin, power and ground per the load's rating - use a driver transistor or motor driver for anything beyond a small LED."],camera:["Seat the CSI ribbon cable with the contacts facing the board's HDMI/USB side (Pi) or as marked on the connector (Jetson) - a reversed or half-seated cable is the most common no-image cause."]}),y=S.map(e=>Object.freeze({...e,target:e.sensor,label:e.sensorLabel,family:N.get(e.sensor)})),M=[..._,...b,...v,...T],L=Object.freeze([...y,...M.map(e=>Object.freeze({...e,family:N.get(e.target)}))]);function x(e){return L.find(i=>i.target===e)}e.s(["default",0,function(){let[e,o]=(0,t.useState)({family:"sensor",target:"bme280",environment:"arduino",protocol:"i2c"}),[s,l]=(0,t.useState)({}),[d,_]=(0,t.useState)("weather-station"),c=(0,t.useMemo)(()=>O.filter(i=>i.family===e.family),[e.family]),p=(0,t.useMemo)(()=>L.filter(i=>i.target===e.target),[e.target]),u=(0,t.useMemo)(()=>[...new Map(p.map(e=>[e.environment,e.environmentLabel])).entries()],[p]),m=(0,t.useMemo)(()=>[...new Map(p.filter(i=>i.environment===e.environment).map(e=>[e.protocol,e.protocolLabel])).entries()],[e.environment,p]),f=(0,t.useMemo)(()=>R.filter(i=>i.family===e.family),[e.family]),g=D[e.target]??[],h=s[e.target]??{},I=(0,t.useMemo)(()=>(function(e,i={}){let t=e.target??e.sensor,n=O.find(({id:e})=>e===t);if(!n||e.family&&e.family!==n.family)return{ok:!1,error:"UNSUPPORTED_CONFIGURATION",code:"",filename:null,dependencies:[],notes:[],wiring:[]};let r=M.find(i=>i.target===t&&i.environment===e.environment&&i.protocol===e.protocol),a=r?{ok:!0,code:r.generate(i),filename:r.filename,language:r.language,dependencies:r.dependencies,notes:r.notes}:function(e,i={}){let t=S.find(i=>i.sensor===e.sensor&&i.environment===e.environment&&i.protocol===e.protocol);return t?{ok:!0,code:t.generate(i),filename:t.filename,language:t.language,dependencies:t.dependencies,notes:t.notes}:{ok:!1,error:"UNSUPPORTED_CONFIGURATION",code:"",filename:null,dependencies:[],notes:[]}}({sensor:t,environment:e.environment,protocol:e.protocol},i);return{...a,wiring:a.ok?[...w[e.protocol]??["Check the selected board and module documentation before wiring."]]:[]}})(e,h),[e,h]),b=(i,t)=>{l(n=>({...n,[e.target]:{...n[e.target],[i.key]:"number"===i.type?Number(t):t}}))};return(0,i.jsx)(a.ToolShell,{slug:"sensor-code-generator",title:"Embedded Code Workbench",description:"Choose a sensor, communication workflow, or board interface. Start from a working example, adjust real wiring values, and copy a documented starter project.",children:(0,i.jsxs)("div",{className:"embedded-workbench",children:[(0,i.jsx)("div",{className:"embedded-family-tabs",role:"tablist","aria-label":"Embedded code family",children:A.map(t=>(0,i.jsxs)("button",{className:`embedded-family-tab${e.family===t.id?" is-active":""}`,type:"button",role:"tab","aria-selected":e.family===t.id,"aria-pressed":e.family===t.id,onClick:()=>{let e;(e=function(e){let i=R.find(i=>i.family===e);if(!i)return null;let t=L.find(e=>e.target===i.target);return t?{example:i,params:{...i.params},selection:{family:e,target:i.target,environment:t.environment,protocol:t.protocol}}:null}(t.id))&&(_(e.example.id),l(i=>({...i,[e.selection.target]:e.params})),o(e.selection))},children:[(0,i.jsx)("strong",{children:t.label}),(0,i.jsx)("span",{children:t.summary})]},t.id))}),(0,i.jsx)(n,{examples:f,activeExampleId:d,onSelect:e=>{let i=x(e.target);i&&(_(e.id),l(i=>({...i,[e.target]:{...e.params}})),o({family:e.family,target:e.target,environment:i.environment,protocol:i.protocol}))}}),(0,i.jsxs)("div",{className:"embedded-workbench-grid",children:[(0,i.jsxs)("section",{className:"embedded-controls","aria-labelledby":"embedded-configuration-title",children:[(0,i.jsxs)("div",{className:"embedded-section-heading",children:[(0,i.jsx)("span",{className:"mono",children:"CONFIGURATION"}),(0,i.jsx)("h2",{id:"embedded-configuration-title",children:"Choose the hardware path"})]}),(0,i.jsxs)("label",{className:"tool-input",children:[(0,i.jsx)("span",{children:"sensor"===e.family?"Sensor":"communication"===e.family?"Communication workflow":"Board interface"}),(0,i.jsx)("select",{value:e.target,onChange:i=>((i,t=e.family)=>{let n=x(i);n&&o({family:t,target:i,environment:n.environment,protocol:n.protocol})})(i.target.value),children:c.map(e=>(0,i.jsxs)("option",{value:e.id,children:[e.label," - ",e.summary]},e.id))})]}),(0,i.jsxs)("label",{className:"tool-input",children:[(0,i.jsx)("span",{children:"Target environment"}),(0,i.jsx)("select",{value:e.environment,onChange:e=>{var i;let t;return i=e.target.value,void((t=p.find(e=>e.environment===i))&&o(e=>({...e,environment:i,protocol:t.protocol})))},children:u.map(([e,t])=>(0,i.jsx)("option",{value:e,children:t},e))})]}),(0,i.jsxs)("label",{className:"tool-input",children:[(0,i.jsx)("span",{children:"Protocol or bus"}),(0,i.jsx)("select",{value:e.protocol,onChange:e=>o(i=>({...i,protocol:e.target.value})),children:m.map(([e,t])=>(0,i.jsx)("option",{value:e,children:t},e))})]}),g.length?(0,i.jsxs)("div",{className:"embedded-parameter-group",children:[(0,i.jsx)("h3",{children:"Wiring and calibration"}),g.map(e=>(0,i.jsxs)("label",{className:"tool-input",children:[(0,i.jsx)("span",{children:e.label}),"select"===e.type?(0,i.jsx)("select",{value:String(h[e.key]??e.default),onChange:i=>b(e,i.target.value),children:e.options?.map(e=>(0,i.jsx)("option",{value:e.value,children:e.label},e.value))}):(0,i.jsx)("input",{type:"text",inputMode:"numeric",pattern:"-?[0-9]*",lang:"en",autoComplete:"off",value:String(h[e.key]??e.default),onChange:i=>b(e,i.target.value)})]},e.key))]}):null]}),(0,i.jsxs)("section",{className:"embedded-output","aria-live":"polite","aria-labelledby":"embedded-output-title",children:[(0,i.jsxs)("div",{className:"embedded-section-heading",children:[(0,i.jsx)("span",{className:"mono",children:"GENERATED STARTER"}),(0,i.jsx)("h2",{id:"embedded-output-title",children:"Code, wiring, and dependencies"})]}),I.ok?(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(r,{code:I.code,label:I.filename||"main.cpp"}),(0,i.jsxs)("div",{className:"embedded-notes-grid",children:[(0,i.jsxs)("div",{children:[(0,i.jsx)("h3",{children:"Wiring"}),(0,i.jsx)("ul",{children:I.wiring.map(e=>(0,i.jsx)("li",{children:e},e))})]}),(0,i.jsxs)("div",{children:[(0,i.jsx)("h3",{children:"Notes"}),(0,i.jsx)("ul",{children:I.notes.map(e=>(0,i.jsx)("li",{children:e},e))})]}),(0,i.jsxs)("div",{children:[(0,i.jsx)("h3",{children:"Dependencies"}),I.dependencies.length?(0,i.jsx)("ul",{children:I.dependencies.map(e=>(0,i.jsxs)("li",{children:[e.name," ",(0,i.jsx)("code",{children:e.version})]},e.name))}):(0,i.jsx)("p",{children:"Uses board-core libraries only."})]})]})]}):(0,i.jsxs)("div",{className:"embedded-error",children:[(0,i.jsx)("strong",{children:"That combination is not available."}),(0,i.jsx)("p",{children:"Choose one of the environment and protocol pairs shown in the controls."})]})]})]})]})})}],15004)}]);