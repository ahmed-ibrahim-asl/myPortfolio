// Raspberry Pi 4/5 and Jetson Nano/Orin are Linux single-board computers, not microcontrollers -
// there is no Arduino/PlatformIO/ESP-IDF here, the code is Python against the board's GPIO/camera
// stack. Pi 4 and Pi 5 are intentionally treated as ONE "raspberry-pi" environment: gpiozero
// auto-selects a working pin factory on both (RPi.GPIO on Pi 4, lgpio on Pi 5, once the right
// backend package is installed), which is exactly the abstraction that makes one script correct
// on either board - see the dependency notes below for the one thing that differs between them.

function sbcRecord({ target, label, protocol, dependencies = {}, notes = {}, raspberryPi, jetson }) {
  const records = [];
  if (raspberryPi) {
    records.push(Object.freeze({
      id: `${target}-raspberry-pi-${protocol}`,
      target,
      label,
      environment: "raspberry-pi",
      environmentLabel: "Raspberry Pi 4/5 (Python)",
      protocol,
      protocolLabel: protocol.toUpperCase(),
      language: "python",
      filename: "main.py",
      dependencies: Object.freeze(dependencies.raspberryPi ?? []),
      notes: Object.freeze(notes.raspberryPi ?? []),
      generate: raspberryPi
    }));
  }
  if (jetson) {
    records.push(Object.freeze({
      id: `${target}-jetson-${protocol}`,
      target,
      label,
      environment: "jetson",
      environmentLabel: "Jetson Nano/Orin (Python)",
      protocol,
      protocolLabel: protocol.toUpperCase(),
      language: "python",
      filename: "main.py",
      dependencies: Object.freeze(dependencies.jetson ?? []),
      notes: Object.freeze(notes.jetson ?? []),
      generate: jetson
    }));
  }
  return records;
}

export const SBC_CONFIGURATIONS = Object.freeze([
  ...sbcRecord({
    target: "sbc-gpio-io", label: "Digital I/O (LED + button)", protocol: "gpio",
    dependencies: {
      raspberryPi: [{ name: "gpiozero", version: "^2.0" }, { name: "rpi-lgpio (Pi 5 only)", version: "latest" }],
      jetson: [{ name: "Jetson.GPIO", version: "^2.1.0" }]
    },
    notes: {
      raspberryPi: [
        "gpiozero picks the right backend automatically on Pi 4 (RPi.GPIO) and Pi 5 (lgpio) - on Pi 5 install it with: sudo apt install python3-lgpio, or pip install rpi-lgpio.",
        "Pin numbers are BCM numbering (the number printed on gpiozero's own pinout, not the physical header position)."
      ],
      jetson: [
        "Jetson.GPIO uses physical BOARD pin numbers by default here, not BCM/SoC numbers - check your carrier board's 40-pin header diagram.",
        "GPIO access needs either sudo or membership in the gpio group (sudo usermod -aG gpio $USER, then re-login)."
      ]
    },
    raspberryPi: (params = {}) => {
      const ledPin = Number.isInteger(params.ledPin) ? params.ledPin : 17;
      const buttonPin = Number.isInteger(params.buttonPin) ? params.buttonPin : 27;
      return `from gpiozero import LED, Button\nfrom signal import pause\n\nLED_PIN = ${ledPin}\nBUTTON_PIN = ${buttonPin}\n\nled = LED(LED_PIN)\nbutton = Button(BUTTON_PIN, pull_up=True)\n\nbutton.when_pressed = led.on\nbutton.when_released = led.off\n\nprint("Press the button to light the LED. Ctrl+C to exit.")\npause()\n`;
    },
    jetson: (params = {}) => {
      const ledPin = Number.isInteger(params.ledPin) ? params.ledPin : 18;
      const buttonPin = Number.isInteger(params.buttonPin) ? params.buttonPin : 16;
      return `import Jetson.GPIO as GPIO\nimport time\n\nLED_PIN = ${ledPin}     # Physical (BOARD) pin number\nBUTTON_PIN = ${buttonPin}  # Physical (BOARD) pin number\n\nGPIO.setmode(GPIO.BOARD)\nGPIO.setup(LED_PIN, GPIO.OUT, initial=GPIO.LOW)\nGPIO.setup(BUTTON_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)\n\ntry:\n    print("Press the button to light the LED. Ctrl+C to exit.")\n    while True:\n        GPIO.output(LED_PIN, GPIO.LOW if GPIO.input(BUTTON_PIN) else GPIO.HIGH)\n        time.sleep(0.05)\nexcept KeyboardInterrupt:\n    pass\nfinally:\n    GPIO.cleanup()\n`;
    }
  }),
  ...sbcRecord({
    target: "sbc-pwm", label: "PWM output (LED fade / servo)", protocol: "pwm",
    dependencies: {
      raspberryPi: [{ name: "gpiozero", version: "^2.0" }],
      jetson: [{ name: "Jetson.GPIO", version: "^2.1.0" }]
    },
    notes: {
      raspberryPi: ["Any GPIO pin can do software PWM through gpiozero; for jitter-free control (e.g. servos) prefer a hardware PWM-capable pin (GPIO12/13/18/19)."],
      jetson: ["Hardware PWM is only broken out on specific header pins (pin 32 or 33 on most Jetson carrier boards) - check your board's pinout before wiring."]
    },
    raspberryPi: (params = {}) => {
      const pin = Number.isInteger(params.pwmPin) ? params.pwmPin : 18;
      return `from gpiozero import PWMLED\nfrom time import sleep\n\nled = PWMLED(${pin})\n\ntry:\n    while True:\n        for brightness in range(0, 101, 5):\n            led.value = brightness / 100\n            sleep(0.05)\n        for brightness in range(100, -1, -5):\n            led.value = brightness / 100\n            sleep(0.05)\nexcept KeyboardInterrupt:\n    led.off()\n`;
    },
    jetson: (params = {}) => {
      const pin = Number.isInteger(params.pwmPin) ? params.pwmPin : 32;
      return `import Jetson.GPIO as GPIO\nimport time\n\nPWM_PIN = ${pin}  # Hardware PWM-capable header pin\n\nGPIO.setmode(GPIO.BOARD)\nGPIO.setup(PWM_PIN, GPIO.OUT)\npwm = GPIO.PWM(PWM_PIN, 100)  # 100 Hz\npwm.start(0)\n\ntry:\n    while True:\n        for duty in range(0, 101, 5):\n            pwm.ChangeDutyCycle(duty)\n            time.sleep(0.05)\n        for duty in range(100, -1, -5):\n            pwm.ChangeDutyCycle(duty)\n            time.sleep(0.05)\nexcept KeyboardInterrupt:\n    pass\nfinally:\n    pwm.stop()\n    GPIO.cleanup()\n`;
    }
  }),
  ...sbcRecord({
    target: "sbc-i2c-sensor", label: "I2C sensor read (BME280)", protocol: "i2c",
    dependencies: {
      raspberryPi: [{ name: "smbus2", version: "^0.4.3" }],
      jetson: [{ name: "smbus2", version: "^0.4.3" }]
    },
    notes: {
      raspberryPi: ["Enable I2C first with: sudo raspi-config -> Interface Options -> I2C.", "Confirm the address and wiring with: i2cdetect -y 1"],
      jetson: ["The I2C bus number depends on the carrier board - run i2cdetect -y -l to list buses, then i2cdetect -y <bus> to find the device.", "You may need to run with sudo unless your user is in the i2c group."]
    },
    raspberryPi: (params = {}) => bme280Smbus2(params.i2cBus ?? 1, params.i2cAddress === "0x77" ? 0x77 : 0x76),
    jetson: (params = {}) => bme280Smbus2(params.i2cBus ?? 1, params.i2cAddress === "0x77" ? 0x77 : 0x76)
  }),
  ...sbcRecord({
    target: "sbc-spi-transfer", label: "SPI transfer", protocol: "spi",
    dependencies: {
      raspberryPi: [{ name: "spidev", version: "^3.6" }],
      jetson: [{ name: "spidev", version: "^3.6" }]
    },
    notes: {
      raspberryPi: ["Enable SPI first with: sudo raspi-config -> Interface Options -> SPI."],
      jetson: ["SPI must be enabled for your specific carrier board via jetson-io (sudo /opt/nvidia/jetson-io/jetson-io.py) before /dev/spidev* appears."]
    },
    raspberryPi: (params = {}) => spidevTransfer(params.spiBus ?? 0, params.spiDevice ?? 0),
    jetson: (params = {}) => spidevTransfer(params.spiBus ?? 0, params.spiDevice ?? 0)
  }),
  ...sbcRecord({
    target: "sbc-camera", label: "Camera capture", protocol: "camera",
    dependencies: {
      raspberryPi: [{ name: "picamera2", version: "system package, preinstalled on Raspberry Pi OS" }],
      jetson: [{ name: "opencv-python", version: "^4.9" }, { name: "GStreamer + L4T multimedia API", version: "ships with JetPack" }]
    },
    notes: {
      raspberryPi: ["Uses the libcamera-based picamera2 stack (the Legacy camera stack and raspistill are deprecated).", "Works on both the Pi 4's and Pi 5's camera connectors without code changes."],
      jetson: ["nvarguscamerasrc is the Jetson-specific GStreamer element for CSI camera modules (e.g. IMX219) - it will not work with a USB webcam, use cv2.VideoCapture(0) directly for those.", "Requires the nvargus-daemon service to be running (it starts automatically on JetPack)."]
    },
    raspberryPi: () => `from picamera2 import Picamera2\nimport time\n\npicam2 = Picamera2()\nconfig = picam2.create_still_configuration()\npicam2.configure(config)\npicam2.start()\ntime.sleep(2)  # Let auto-exposure and white balance settle\npicam2.capture_file("capture.jpg")\npicam2.stop()\nprint("Saved capture.jpg")\n`,
    jetson: () => `import cv2\n\ndef gstreamer_pipeline(sensor_id=0, capture_width=1280, capture_height=720, framerate=30):\n    return (\n        f"nvarguscamerasrc sensor-id={sensor_id} ! "\n        f"video/x-raw(memory:NVMM), width={capture_width}, height={capture_height}, "\n        f"format=NV12, framerate={framerate}/1 ! "\n        "nvvidconv flip-method=0 ! video/x-raw, format=BGRx ! "\n        "videoconvert ! video/x-raw, format=BGR ! appsink"\n    )\n\ncap = cv2.VideoCapture(gstreamer_pipeline(), cv2.CAP_GSTREAMER)\nif not cap.isOpened():\n    raise RuntimeError("Unable to open CSI camera - check the ribbon cable and the nvargus-daemon service")\n\nret, frame = cap.read()\nif ret:\n    cv2.imwrite("capture.jpg", frame)\n    print("Saved capture.jpg")\ncap.release()\n`
  })
]);

function bme280Smbus2(bus, address) {
  return `import smbus2\nimport time\n\nI2C_BUS = ${bus}\nBME280_ADDR = ${address === 0x77 ? "0x77" : "0x76"}\n\nbus = smbus2.SMBus(I2C_BUS)\n\n\ndef read_calibration():\n    calib = bus.read_i2c_block_data(BME280_ADDR, 0x88, 24)\n    dig_T1 = calib[1] << 8 | calib[0]\n    dig_T2 = to_signed16(calib[3] << 8 | calib[2])\n    dig_T3 = to_signed16(calib[5] << 8 | calib[4])\n    dig_P1 = calib[7] << 8 | calib[6]\n    dig_P2 = to_signed16(calib[9] << 8 | calib[8])\n    dig_P3 = to_signed16(calib[11] << 8 | calib[10])\n    dig_P4 = to_signed16(calib[13] << 8 | calib[12])\n    dig_P5 = to_signed16(calib[15] << 8 | calib[14])\n    dig_P6 = to_signed16(calib[17] << 8 | calib[16])\n    dig_P7 = to_signed16(calib[19] << 8 | calib[18])\n    dig_P8 = to_signed16(calib[21] << 8 | calib[20])\n    dig_P9 = to_signed16(calib[23] << 8 | calib[22])\n    return (dig_T1, dig_T2, dig_T3, dig_P1, dig_P2, dig_P3, dig_P4, dig_P5, dig_P6, dig_P7, dig_P8, dig_P9)\n\n\ndef to_signed16(value):\n    return value - 65536 if value > 32767 else value\n\n\ndef read_bme280():\n    (dig_T1, dig_T2, dig_T3, dig_P1, dig_P2, dig_P3, dig_P4, dig_P5, dig_P6, dig_P7, dig_P8, dig_P9) = read_calibration()\n\n    # Normal mode, 16x oversampling on temperature and pressure.\n    bus.write_i2c_block_data(BME280_ADDR, 0xF4, [0xB7])\n    time.sleep(0.05)\n\n    raw = bus.read_i2c_block_data(BME280_ADDR, 0xF7, 6)\n    adc_p = (raw[0] << 12) | (raw[1] << 4) | (raw[2] >> 4)\n    adc_t = (raw[3] << 12) | (raw[4] << 4) | (raw[5] >> 4)\n\n    var1 = (adc_t / 16384.0 - dig_T1 / 1024.0) * dig_T2\n    var2 = ((adc_t / 131072.0 - dig_T1 / 8192.0) ** 2) * dig_T3\n    t_fine = var1 + var2\n    temperature = t_fine / 5120.0\n\n    p1 = t_fine / 2.0 - 64000.0\n    p2 = p1 * p1 * dig_P6 / 32768.0\n    p2 = p2 + p1 * dig_P5 * 2.0\n    p2 = p2 / 4.0 + dig_P4 * 65536.0\n    p1 = (dig_P3 * p1 * p1 / 524288.0 + dig_P2 * p1) / 524288.0\n    p1 = (1.0 + p1 / 32768.0) * dig_P1\n    if p1 == 0:\n        pressure = 0\n    else:\n        pressure = 1048576.0 - adc_p\n        pressure = (pressure - p2 / 4096.0) * 6250.0 / p1\n        p1 = dig_P9 * pressure * pressure / 2147483648.0\n        p2 = pressure * dig_P8 / 32768.0\n        pressure = pressure + (p1 + p2 + dig_P7) / 16.0\n\n    return temperature, pressure / 100.0\n\n\nif __name__ == "__main__":\n    try:\n        while True:\n            temperature_c, pressure_hpa = read_bme280()\n            print(f"Temperature C: {temperature_c:.2f}")\n            print(f"Pressure hPa: {pressure_hpa:.2f}")\n            time.sleep(2)\n    except KeyboardInterrupt:\n        pass\n    finally:\n        bus.close()\n`;
}

function spidevTransfer(bus, device) {
  return `import spidev\nimport time\n\nspi = spidev.SpiDev()\nspi.open(${bus}, ${device})\nspi.max_speed_hz = 1000000\nspi.mode = 0\n\ntry:\n    while True:\n        response = spi.xfer2([0x00])\n        print(f"SPI response: 0x{response[0]:02X}")\n        time.sleep(1)\nexcept KeyboardInterrupt:\n    pass\nfinally:\n    spi.close()\n`;
}
