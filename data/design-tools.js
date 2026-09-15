export const designTools = [
  {slug:'smps-designer',title:'SMPS Design',category:'Power Conversion & Supplies',group:'Switching Converters',summary:'Explore AC-mains and DC-input isolated flyback supplies, calculate a first-pass DCM operating point, and follow energy through an interactive circuit.',tags:['SMPS','Flyback','PWM','Isolation'],custom:true},
  {slug:'rot-explorer',title:'ROT Explorer',category:'Text & Encoding',group:'Text transformations',summary:'Encode, decode, compare all shifts, and see every letter move through a live alphabet map.',tags:['ROT13','ROT20','Caesar cipher'],custom:true},
  {slug:'air-core-coil-designer',title:'Air-Core Coil Designer',category:'Circuit Design',group:'Inductors & Tuned Circuits',summary:'Estimate a single-layer coil from its dimensions, inspect the winding, and check whether the turns fit.',tags:['Inductor','Wheeler','Coil'],custom:true},
  {slug:'lc-resonance-designer',title:'LC Resonance Designer',category:'Circuit Design',group:'Inductors & Tuned Circuits',summary:'Choose a target frequency and capacitor to size an ideal LC tank, with a winding-loss Q estimate.',tags:['Inductor','Capacitor','Resonance'],custom:true},
  {slug:'band-pass-filter-designer',title:'Band-Pass Filter Designer',category:'Circuit Design',group:'Filters',summary:'Design a buffered RC band-pass circuit and compare stage corners with the complete frequency response.',tags:['RC filter','Band-pass','Frequency response'],custom:true},
  {slug:'cascaded-opamp-gain-designer',title:'Cascaded Op-Amp Gain Designer',category:'Circuit Design',group:'Amplifiers & Signal Conditioning',summary:'Build an inverting or non-inverting multi-stage amplifier, see total gain, and compare common op-amp ICs.',tags:['Op-amp','Gain','LM358'],custom:true},
  {slug:'control-design-assistant',title:'Control Design Assistant',category:'Control Design',group:'Memory, Timing & State',summary:'Describe the state you need and get a flip-flop, register, counter, or shift-register recommendation with a live state table.',tags:['Flip-flop','Counter','Memory'],custom:true},
  {slug:'logic-gate-designer',title:'Logic Gate Designer',category:'Control Design',group:'Combinational Logic',summary:'Set ON/OFF conditions and generate an interactive logic-gate network alongside its complete truth table.',tags:['AND','OR','XOR','Truth table'],custom:true},
  {slug:'bridge-rectifier-designer',title:'Full-Wave Bridge Rectifier Designer',category:'Power Conversion & Supplies',group:'Rectifiers & Reservoirs',summary:'Estimate rectified DC voltage, ripple frequency, reservoir capacitance, and diode stress for a low-voltage supply.',tags:['Rectifier','Ripple','Capacitor'],custom:true},
  {slug:'linear-regulator-stability-designer',title:'Linear Regulator Stability Designer',category:'Power Conversion & Supplies',group:'Regulators & Stability',summary:'Estimate heat, efficiency and voltage headroom; document capacitor and ESR requirements without a false stability verdict.',tags:['Regulator','ESR','Thermal'],custom:true},
  {slug:'buck-converter-designer',title:'Buck Converter Designer',category:'Power Conversion & Supplies',group:'Switching Converters',summary:'Estimate duty cycle, inductor, output capacitor, ripple current, peak current, and estimated total power loss.',tags:['Buck','Inductor','Switching'],custom:true},
];
export function circuitGroup(slug) {
  if(slug.includes('555')) return 'Timers & Oscillators';
  if(slug.includes('filter')) return 'Filters';
  if(slug.includes('op-amp')||slug.includes('voltage-divider')) return 'Amplifiers & Signal Conditioning';
  return 'Inductors & Tuned Circuits';
}
