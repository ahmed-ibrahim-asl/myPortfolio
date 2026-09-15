function positive(...values) {
  if(values.some(v=>!Number.isFinite(v)||v<=0)) throw new RangeError('Enter finite, positive values for every field.');
}
export function coilEstimate(diameterMm,lengthMm,turns,wireMm) {
  positive(diameterMm,lengthMm,turns,wireMm);
  if(!Number.isInteger(turns)||turns>10000) throw new RangeError('Use a whole number of turns, up to 10,000.');
  const r=diameterMm/50.8,l=lengthMm/25.4;
  const inductanceUh=r*r*turns*turns/(9*r+10*l);
  const warnings=[];
  if(lengthMm<0.8*diameterMm/2) warnings.push('This coil is short relative to its radius. Wheeler’s approximation is less reliable here.');
  if(turns*wireMm>lengthMm) warnings.push('The insulated wire will not fit in a single layer at this winding length. Increase length or reduce turns/wire diameter.');
  if(wireMm>=diameterMm) warnings.push('Wire diameter must be smaller than the mean winding diameter.');
  return {inductanceUh,pitchMm:lengthMm/turns,wireLengthM:turns*Math.hypot(Math.PI*diameterMm,lengthMm/turns)/1000,warnings};
}
export function tankDesign(frequencyHz,capacitanceF,seriesResistance) {
  positive(frequencyHz,capacitanceF,seriesResistance);
  const inductanceH=1/((2*Math.PI*frequencyHz)**2*capacitanceF);
  const reactance=2*Math.PI*frequencyHz*inductanceH;
  const q=reactance/seriesResistance;
  return {inductanceH,reactance,q};
}
export function bandpassGain(f,low,high) {
  positive(f,low,high);
  return (f/Math.hypot(f,low))*(high/Math.hypot(f,high));
}
export function bandpassDesign(low,high,capacitanceF) {
  positive(low,high,capacitanceF);
  if(low>=high) throw new RangeError('The high-pass corner must be below the low-pass corner.');
  const center=Math.sqrt(low*high), bandwidth=low+high;
  const edge=Math.sqrt(bandwidth**2+4*low*high);
  return {rHighPass:1/(2*Math.PI*low*capacitanceF),rLowPass:1/(2*Math.PI*high*capacitanceF),center,peak:high/(low+high),low3db:2*low*high/(edge+bandwidth),high3db:(edge+bandwidth)/2};
}
