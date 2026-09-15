// A row of individual bit cells - used wherever a calculator's result is best understood as a
// literal bit pattern (shifts, complements) rather than a single number.
export function BitStrip({ bits, markIndexes = [], markClass = "bit-cell-mark", label }) {
  const marked = new Set(markIndexes);
  return (
    <div className="bit-strip" role="img" aria-label={label || `Binary ${bits}`}>
      {bits.split("").map((bit, index) => (
        <span key={index} className={`bit-cell${marked.has(index) ? ` ${markClass}` : ""}`}>
          {bit}
        </span>
      ))}
    </div>
  );
}
