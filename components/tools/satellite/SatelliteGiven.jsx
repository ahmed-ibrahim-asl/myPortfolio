import { satelliteInputs, visibleFields } from "../../../data/satellite-inputs.js";
const allFields = Object.values(satelliteInputs).flatMap((t) => t.fields);
const nestedFields = {
  antennaTemperatureK: { label: "Antenna noise temperature", unit: "K" },
  pathTemperatureK: { label: "Path physical temperature", unit: "K" }
};
function Rows({ entries, prefix = "" }) {
  return entries.map(([key, value, field]) => {
    const known = field || nestedFields[key] || allFields.find((f) => f.key === key);
    const unit =
      known?.units?.[0]?.[0] ||
      known?.unit ||
      (key.endsWith("K") ? "K" : key.endsWith("Db") ? "dB" : "");
    return (
      <div key={`${prefix}${key}`}>
        <dt>
          {prefix}
          {known?.label || key}
        </dt>
        <dd>
          {String(value)} {unit}
        </dd>
      </div>
    );
  });
}
export default function SatelliteGiven({
  slug,
  values,
  heading = "Given — normalized input units"
}) {
  const fields = visibleFields(slug, values).filter(
    (f) => !(values.noiseMode === "nf" && values.nfInput !== "nf" && f.key === "noiseFigureDb")
  );
  return (
    <>
      {heading && <h3>{heading}</h3>}
      <p>Values below are the SI values used by the calculation, after display-unit conversion.</p>
      <dl>
        <Rows entries={fields.map((f) => [f.key, values[f.key], f])} />
        {values.noiseMode === "nf" && values.nfInput === "factor" && (
          <Rows
            entries={[
              ["noiseFactor", values.noiseFactor, { label: "Noise factor", unit: "linear" }]
            ]}
          />
        )}
        {values.noiseMode === "nf" && values.nfInput === "te" && (
          <Rows
            entries={[
              [
                "equivalentTemperatureK",
                values.equivalentTemperatureK,
                { label: "Equivalent added temperature", unit: "K" }
              ]
            ]}
          />
        )}
        {values.linkMode === "course-ft" &&
          ["uplink", "downlink"].map((leg) => (
            <Rows key={leg} prefix={`${leg} / `} entries={Object.entries(values[leg])} />
          ))}
        {values.noiseMode === "cascade" &&
          values.stages?.map((stage, index) => (
            <Rows
              key={index}
              prefix={`Stage ${index + 1} / `}
              entries={Object.entries(stage).map(([key, value]) => [
                key,
                value,
                { label: key === "gainDb" ? "Power gain" : "Noise figure", unit: "dB" }
              ])}
            />
          ))}
      </dl>
    </>
  );
}
