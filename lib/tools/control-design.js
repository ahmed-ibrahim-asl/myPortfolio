export function recommendControl({
  bits = 1,
  clocked = true,
  setReset = false,
  toggle = false,
  sequence = false,
  shift = false
} = {}) {
  if (!Number.isInteger(bits) || bits < 1 || bits > 64)
    throw new RangeError("Choose between 1 and 64 bits.");
  if (sequence)
    return {
      kind: "Counter",
      part: "74HC161 / CD4029 family",
      reason: "You need stored state that advances through a sequence on clock events.",
      truth: [
        ["CLK", "RESET", "Q(next)"],
        ["↑", "1", "0"],
        ["↑", "0", "Q+1"]
      ]
    };
  if (shift)
    return {
      kind: "Shift register",
      part: "74HC595 / 74HC165 family",
      reason: "You need several stored bits to move serially between positions.",
      truth: [
        ["CLK", "SERIAL IN", "Q(next)"],
        ["↑", "0/1", "shift + load"]
      ]
    };
  if (bits > 1)
    return {
      kind: "Register",
      part: "74HC173 / 74HC574 family",
      reason: "You need several D flip-flops operated together to store a word.",
      truth: [
        ["CLK", "LOAD", "Q(next)"],
        ["↑", "0", "Q"],
        ["↑", "1", "D"]
      ]
    };
  if (toggle)
    return {
      kind: "T flip-flop",
      part: "74HC74 configured as toggle / 74HC73 family",
      reason: "Each active clock event should reverse the stored state.",
      truth: [
        ["CLK", "T", "Q(next)"],
        ["↑", "0", "Q"],
        ["↑", "1", "¬Q"]
      ]
    };
  if (setReset && !clocked)
    return {
      kind: "SR latch",
      part: "74HC279 / cross-coupled gates",
      reason: "You need level-sensitive set and reset behavior without a clock.",
      truth: [
        ["S", "R", "Q(next)"],
        ["0", "0", "Q"],
        ["1", "0", "1"],
        ["0", "1", "0"]
      ]
    };
  if (setReset)
    return {
      kind: "JK flip-flop",
      part: "74HC112 / CD4027 family",
      reason: "Clocked set, reset, hold, and toggle controls map naturally to JK inputs.",
      truth: [
        ["J", "K", "Q(next)"],
        ["0", "0", "Q"],
        ["0", "1", "0"],
        ["1", "0", "1"],
        ["1", "1", "¬Q"]
      ]
    };
  return {
    kind: "D flip-flop",
    part: "74HC74 / CD4013 family",
    reason: "You need to copy one input bit into memory on a clock edge.",
    truth: [
      ["CLK", "D", "Q(next)"],
      ["↑", "0", "0"],
      ["↑", "1", "1"],
      ["—", "X", "Q"]
    ]
  };
}

// Abstract active-high functional model; package-level asynchronous pins are not simulated.
export function stepMemory(kind, q, inputs = {}, edge = false, bits = 1) {
  if (!Number.isInteger(bits) || bits < 1 || bits > 8)
    throw new RangeError("Choose 1–8 stored bits.");
  const mask = 2 ** bits - 1;
  if (!Number.isInteger(q) || q < 0 || q > mask)
    throw new RangeError("State is outside the selected width.");
  const bit = (name) => Number(Boolean(inputs[name]));
  if (kind === "sr") {
    if (bit("s") && bit("r"))
      throw new RangeError("Forbidden: S and R cannot both be high on this NOR latch.");
    return bit("s") ? 1 : bit("r") ? 0 : q;
  }
  if (!["d", "jk", "t", "counter", "shift", "register"].includes(kind))
    throw new RangeError("Unknown memory operation.");
  if (!edge) return q;
  if (kind === "d") return bit("d");
  if (kind === "t") return bit("t") ? q ^ 1 : q;
  if (kind === "jk") return (bit("j") & (q ^ 1)) | ((bit("k") ^ 1) & q);
  if (kind === "counter") return (q + 1) & mask;
  if (kind === "shift") return ((q << 1) | bit("d")) & mask;
  const word = inputs.word ?? 0;
  if (!Number.isInteger(word) || word < 0 || word > mask)
    throw new RangeError("Data word is outside the selected width.");
  return word;
}
