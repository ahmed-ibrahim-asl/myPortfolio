export const asPin = (value, fallback) => Number.isInteger(value) ? value : fallback;

export function addrHex(value) {
  return `0x${value.toString(16).toUpperCase()}`;
}

// Arduino and PlatformIO/Arduino-framework code is byte-identical except for the explicit
// `#include <Arduino.h>` PlatformIO needs (the Arduino IDE injects it implicitly). Deriving the
// PlatformIO variant from the Arduino one - rather than hand-duplicating every template - is what
// keeps the two in sync and gives every sensor real, working PlatformIO output for free.
export function toPlatformIo(arduinoCode) {
  if (arduinoCode.includes("#include <Arduino.h>")) return arduinoCode;
  return `#include <Arduino.h>\n${arduinoCode}`;
}

export function record({ target, label, protocol, filename, dependencies = [], notes, generate, espidf }) {
  const arduino = Object.freeze({
    id: `${target}-arduino-${protocol}`,
    target,
    label,
    environment: "arduino",
    environmentLabel: "Arduino IDE",
    protocol,
    protocolLabel: protocol.toUpperCase(),
    language: "cpp",
    filename,
    dependencies: Object.freeze(dependencies),
    notes: Object.freeze(notes),
    generate
  });

  const platformio = Object.freeze({
    ...arduino,
    id: `${target}-platformio-${protocol}`,
    environment: "platformio",
    environmentLabel: "PlatformIO / Arduino",
    filename: filename.endsWith(".ino") ? "main.cpp" : filename,
    generate: (params = {}) => toPlatformIo(generate(params))
  });

  const records = [arduino, platformio];

  if (espidf) {
    records.push(Object.freeze({
      id: `${target}-esp-idf-${protocol}`,
      target,
      label,
      environment: "esp-idf",
      environmentLabel: "ESP-IDF",
      protocol,
      protocolLabel: protocol.toUpperCase(),
      language: "c",
      filename: "main.c",
      dependencies: Object.freeze(espidf.dependencies ?? []),
      notes: Object.freeze(espidf.notes ?? notes),
      generate: espidf.generate
    }));
  }

  return records;
}

// For sensors whose Arduino/PlatformIO pair already lives elsewhere (hand-written, tested) and
// only need an ESP-IDF sibling added alongside it, rather than a full record() that would
// duplicate the existing arduino/platformio entries.
export function espIdfOnly({ target, label, protocol, dependencies = [], notes, generate }) {
  return Object.freeze({
    id: `${target}-esp-idf-${protocol}`,
    target,
    label,
    environment: "esp-idf",
    environmentLabel: "ESP-IDF",
    protocol,
    protocolLabel: protocol.toUpperCase(),
    language: "c",
    filename: "main.c",
    dependencies: Object.freeze(dependencies),
    notes: Object.freeze(notes),
    generate
  });
}
