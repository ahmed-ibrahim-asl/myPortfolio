const historyKey = "asl-satellite-history";
export function browserStorage() {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}
export function encodeProblem(slug, values) {
  const payload = JSON.stringify({ slug, values });
  return `?v=2&p=${encodeURIComponent(payload)}`;
}
export function decodeProblem(query, allowedFields = []) {
  try {
    const params = new URLSearchParams(query);
    const version = params.get("v");
    if (!["1", "2"].includes(version) || (params.get("p")?.length ?? 0) > 12000) return null;
    const p = JSON.parse(params.get("p"));
    if (
      !p ||
      typeof p.slug !== "string" ||
      !/^[a-z-]+$/.test(p.slug) ||
      !p.values ||
      typeof p.values !== "object" ||
      Array.isArray(p.values)
    )
      return null;
    const values = {};
    for (const key of allowedFields) {
      const value = p.values[key];
      if (typeof value === "number" && Number.isFinite(value)) values[key] = value;
      else if (typeof value === "string" && value.length <= 60 && /^[a-zA-Z0-9. -]+$/.test(value))
        values[key] = value;
      else if (
        Array.isArray(value) &&
        value.length <= 12 &&
        value.every(
          (stage) =>
            stage &&
            typeof stage === "object" &&
            Object.values(stage).every((n) => typeof n === "number" && Number.isFinite(n))
        )
      )
        values[key] = value;
      else if (
        value &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        Object.keys(value).length <= 20 &&
        Object.values(value).every((n) => typeof n === "number" && Number.isFinite(n))
      )
        values[key] = value;
    }
    if (
      version === "1" &&
      p.slug === "orbit" &&
      allowedFields.includes("muKm3S2") &&
      typeof p.values.mu === "number" &&
      Number.isFinite(p.values.mu)
    )
      values.muKm3S2 = p.values.mu / 1e9;
    return { slug: p.slug, values };
  } catch {
    return null;
  }
}
export function readHistory(storage) {
  try {
    const rows = JSON.parse(storage?.getItem(historyKey) || "[]");
    return Array.isArray(rows)
      ? rows
          .filter(
            (r) => r && typeof r.slug === "string" && r.values && typeof r.values === "object"
          )
          .slice(0, 10)
      : [];
  } catch {
    return [];
  }
}
export function saveHistory(storage, entry) {
  if(!storage)return false;
  try {
    const prior = readHistory(storage).filter(
      (r) =>
        r.slug !== entry.slug ||
        JSON.stringify(r.values) !== JSON.stringify(entry.values) ||
        r.mode !== entry.mode
    );
    storage?.setItem(
      historyKey,
      JSON.stringify([{ ...entry, savedAt: new Date().toISOString() }, ...prior].slice(0, 10))
    );
    return true;
  } catch {
    return false;
  }
}
export function transferValues(from, to, results) {
  const pick = (source, target) =>
    Number.isFinite(results[source]) ? { [target]: results[source] } : {};
  if (from === "look-angles" && to === "rf-path") return pick("slantRangeM", "distanceM");
  if (from === "look-angles" && to === "link-budget")
    return { ...pick("slantRangeM", "distanceM"), linkMode: "basic" };
  if (from === "antenna" && to === "rf-path")
    return {
      ...pick("gainDb", "receiveGainDb"),
      ...(Number.isFinite(results.effectiveApertureM2)
        ? { ...pick("effectiveApertureM2", "effectiveApertureM2"), rfMode: "pfd-receive" }
        : {})
    };
  if (from === "antenna" && to === "link-budget")
    return { ...pick("gainDb", "receiveGainDb"), linkMode: "basic" };
  if (from === "noise-gt" && to === "link-budget") return pick("gtDbK", "downlinkGtDbK");
  if (from === "orbit" && to === "doppler-delay") return pick("altitudeM", "uplinkDistanceM");
  return {};
}
export function readProgress(storage) {
  try {
    const value = JSON.parse(storage?.getItem("asl-satellite-progress") || "[]");
    return Array.isArray(value) ? value.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}
export function saveProgress(storage, slug, complete = true) {
  const values = new Set(readProgress(storage));
  complete ? values.add(slug) : values.delete(slug);
  try {
    storage?.setItem("asl-satellite-progress", JSON.stringify([...values]));
  } catch {}
  return [...values];
}
