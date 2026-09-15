export function evaluateGate(gate, inputs) {
  const a = Boolean(inputs[0]),
    b = Boolean(inputs[1]);
  if (gate === "NOT") return !a;
  if (gate === "AND") return a && b;
  if (gate === "OR") return a || b;
  if (gate === "NAND") return !(a && b);
  if (gate === "NOR") return !(a || b);
  if (gate === "XOR") return a !== b;
  if (gate === "XNOR") return a === b;
  throw new RangeError("Unknown gate.");
}
export function gateTruthTable(gate) {
  return (
    gate === "NOT"
      ? [
          [0, 0],
          [1, 0]
        ]
      : [
          [0, 0],
          [0, 1],
          [1, 0],
          [1, 1]
        ]
  ).map(([a, b]) => ({ a, b, y: Number(evaluateGate(gate, [a, b])) }));
}

export function evaluateRules(inputs, rules) {
  if (
    !Array.isArray(inputs) ||
    inputs.length < 2 ||
    inputs.length > 4 ||
    inputs.some((v) => v !== 0 && v !== 1)
  )
    throw new RangeError("Use 2–4 binary inputs.");
  if (
    !Array.isArray(rules) ||
    rules.some((row) => row.length !== inputs.length || row.some((v) => ![-1, 0, 1].includes(v)))
  )
    throw new RangeError("Each condition must be off, on, or ignored.");
  return Number(
    rules.some((row) => row.every((condition, i) => condition === -1 || condition === inputs[i]))
  );
}
export function rulesTruthTable(count, rules) {
  if (!Number.isInteger(count) || count < 2 || count > 4) throw new RangeError("Use 2–4 inputs.");
  return Array.from({ length: 2 ** count }, (_, n) => {
    const inputs = Array.from({ length: count }, (_, i) => (n >> (count - i - 1)) & 1);
    return { inputs, y: evaluateRules(inputs, rules) };
  });
}
