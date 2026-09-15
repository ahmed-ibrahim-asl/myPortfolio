// Single source of truth for each field's physically sane range, its default, and the unit
// shown in inline validation. The UI clamps to these same bounds on blur so the displayed
// value never disagrees with the value normalizeBatteryInputs uses for the calculation.
export const BATTERY_FIELD_RANGES = {
  capacityMah: { min: 0, max: 50000, default: 2000, label: "Battery capacity", unit: "mAh" },
  usableCapacityPercent: { min: 10, max: 100, default: 100, label: "Usable capacity", unit: "%" },
  activeCurrentMa: { min: 0, max: 1000, default: 120, label: "Active draw", unit: "mA" },
  activeDurationMs: { min: 0, max: 60000, default: 500, label: "Active duration", unit: "ms" },
  wifiCurrentMa: { min: 0, max: 1000, default: 140, label: "Wi-Fi draw", unit: "mA" },
  wifiDurationMs: { min: 0, max: 60000, default: 2000, label: "Wi-Fi duration", unit: "ms" },
  sleepCurrentUa: { min: 0, max: 100000, default: 10, label: "Deep sleep draw", unit: "µA" },
  sleepDurationSec: { min: 0, max: 604800, default: 300, label: "Sleep duration", unit: "s" }
};

export function normalizeBatteryInputs(rawInputs) {
  const getNum = (val, def) => (val !== undefined && val !== null && !isNaN(val)) ? Number(val) : def;
  const clampField = (name, val) => {
    const range = BATTERY_FIELD_RANGES[name];
    return Math.max(range.min, Math.min(range.max, getNum(val, range.default)));
  };
  return {
    capacityMah: clampField("capacityMah", rawInputs.capacityMah),
    usableCapacityPercent: clampField("usableCapacityPercent", rawInputs.usableCapacityPercent),
    activeCurrentMa: clampField("activeCurrentMa", rawInputs.activeCurrentMa),
    activeDurationMs: clampField("activeDurationMs", rawInputs.activeDurationMs),
    wifiEnabled: Boolean(rawInputs.wifiEnabled),
    wifiCurrentMa: clampField("wifiCurrentMa", rawInputs.wifiCurrentMa),
    wifiDurationMs: clampField("wifiDurationMs", rawInputs.wifiDurationMs),
    sleepCurrentUa: clampField("sleepCurrentUa", rawInputs.sleepCurrentUa),
    sleepDurationSec: clampField("sleepDurationSec", rawInputs.sleepDurationSec)
  };
}

export function estimateBatteryLife(rawInputs) {
  const inputs = normalizeBatteryInputs(rawInputs);

  const activeSec = inputs.activeDurationMs / 1000;
  const wifiSec = inputs.wifiEnabled ? inputs.wifiDurationMs / 1000 : 0;
  const sleepSec = inputs.sleepDurationSec;

  const effectiveCapacityMah = inputs.capacityMah * (inputs.usableCapacityPercent / 100);

  const activeMah = (inputs.activeCurrentMa * activeSec) / 3600;
  const wifiMah = inputs.wifiEnabled ? (inputs.wifiCurrentMa * wifiSec) / 3600 : 0;
  const sleepCurrentMa = inputs.sleepCurrentUa / 1000;
  const sleepMah = (sleepCurrentMa * sleepSec) / 3600;

  const cycleDurationSec = activeSec + wifiSec + sleepSec;
  const cycleConsumptionMah = activeMah + wifiMah + sleepMah;

  if (cycleDurationSec <= 0 || cycleConsumptionMah <= 0 || effectiveCapacityMah <= 0) {
    return { ok: false, error: "INVALID_ENERGY_MODEL" };
  }

  const cycleCount = effectiveCapacityMah / cycleConsumptionMah;
  const totalHours = (cycleCount * cycleDurationSec) / 3600;
  const averageCurrentMa = (cycleConsumptionMah / cycleDurationSec) * 3600;

  return {
    ok: true,
    totalHours,
    totalDays: totalHours / 24,
    totalMonths: totalHours / 24 / 30.44,
    averageCurrentMa,
    cycleDurationSec,
    cycleConsumptionMah,
    cyclesPerDay: 86400 / cycleDurationSec,
    activeTimePercent: (activeSec / cycleDurationSec) * 100,
    wifiTimePercent: (wifiSec / cycleDurationSec) * 100,
    sleepTimePercent: (sleepSec / cycleDurationSec) * 100,
    phaseConsumptionMah: {
      active: activeMah,
      wifi: wifiMah,
      sleep: sleepMah
    }
  };
}

export function formatBatteryLife(totalDays) {
  if (totalDays < 2) {
    return {
      primary: `${Math.round(totalDays * 24)} hours`,
      secondary: `${totalDays.toFixed(1)} days`
    };
  }
  if (totalDays < 90) {
    return {
      primary: `${Math.round(totalDays)} days`,
      secondary: `${(totalDays / 30.44).toFixed(1)} months`
    };
  }
  return {
    primary: `${(totalDays / 365.25).toFixed(1)} years`,
    secondary: `${Math.round(totalDays)} days`
  };
}
