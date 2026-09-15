'use client';
import { useState } from 'react';
import { coilEstimate,tankDesign,bandpassDesign,bandpassGain } from '@/lib/tools/circuit-design';
import CircuitSchematic from './CircuitSchematic';
import MathEquation from './MathEquation';
import styles from './DesignLab.module.css';

const sourceCoil='https://physlab-wiki.com/_media/phylabs/lab_courses/phys-120_130-wiki-home/winter-experiments/simple_inductance_formulas_for_radio_coils.pdf';
const sourceLC='https://www.analog.com/en/resources/analog-dialogue/studentzone/studentzone-august-2018.html';
const sourceFilter='https://www.analog.com/en/resources/analog-dialogue/studentzone/studentzone-february-2019.html';
const fmt=(n:number,unit:string)=>`${new Intl.NumberFormat('en',{maximumSignificantDigits:5}).format(n)} ${unit}`;
const configs = {
  'air-core-coil-designer': {defaults:['10','20','20','0.5'],fields:['Mean coil diameter (mm)','Winding length (mm)','Number of turns','Insulated wire diameter (mm)'],parts:['geometry'],formula:'L (µH) ≈ r² N² / (9r + 10ℓ), with radius r and length ℓ in inches.',source:sourceCoil,sourceLabel:'H. A. Wheeler: Simple Inductance Formulas for Radio Coils (1928)'},
  'lc-resonance-designer': {defaults:['1000','100','2'],fields:['Target resonance (kHz)','Capacitance (pF)','Inductor AC series resistance (Ω)'],parts:['inductor','capacitor'],formula:'L = 1 / [(2πf₀)²C] · QL ≈ 2πf₀L / Rs.',source:sourceLC,sourceLabel:'Analog Devices: Parallel LC resonance'},
  'band-pass-filter-designer': {defaults:['100','1000','100'],fields:['High-pass stage corner (Hz)','Low-pass stage corner (Hz)','Each capacitor (nF)'],parts:['highpass','buffer','lowpass'],formula:'R1 = 1/(2π fHP C1) · R2 = 1/(2π fLP C2) · |H(f)| = f/√(f² + fHP²) × fLP/√(f² + fLP²).',source:sourceFilter,sourceLabel:'Analog Devices: Cascaded RC filters and loading'},
};
type Kind=keyof typeof configs;
const equations:Record<string,[string,string][]>={
  'air-core-coil-designer':[['Wheeler · single-layer air core',String.raw`L_{\mu\mathrm{H}}\approx\frac{r^2N^2}{9r+10\ell}`]],
  'lc-resonance-designer':[['Required inductance',String.raw`L=\frac{1}{(2\pi f_0)^2C}`],['Inductor quality factor',String.raw`Q_L\approx\frac{2\pi f_0L}{R_s}`]],
  'band-pass-filter-designer':[['Stage resistances',String.raw`R_1=\frac{1}{2\pi f_{\mathrm{HP}}C_1},\qquad R_2=\frac{1}{2\pi f_{\mathrm{LP}}C_2}`],['Buffered frequency response',String.raw`|H(f)|=\frac{f}{\sqrt{f^2+f_{\mathrm{HP}}^2}}\,\frac{f_{\mathrm{LP}}}{\sqrt{f^2+f_{\mathrm{LP}}^2}}`]],
};
export default function CircuitDesigner({kind}:{kind:string}) {
  const config=configs[kind as Kind];
  const [values,setValues]=useState<string[]>(config.defaults);
  const [selected,setSelected]=useState(config.parts[0]);
  const [probe,setProbe]=useState('316');
  const [notice,setNotice]=useState('');
  const n=values.map(Number);
  const coil=kind==='air-core-coil-designer',lc=kind==='lc-resonance-designer';
  let error='',labels:string[]=[],metrics:[string,string][]=[],warnings:string[]=[];
  let filter:ReturnType<typeof bandpassDesign>|null=null;
  try {
    if(coil){const r=coilEstimate(n[0],n[1],n[2],n[3]);labels=[fmt(n[0],'mm'),fmt(n[1],'mm')];metrics=[['Estimated inductance',fmt(r.inductanceUh,'µH')],['Winding pitch',fmt(r.pitchMm,'mm/turn')],['Approximate wire length',fmt(r.wireLengthM,'m')]];warnings=r.warnings;}
    else if(lc){const r=tankDesign(n[0]*1e3,n[1]*1e-12,n[2]);labels=[fmt(r.inductanceH*1e6,'µH'),fmt(n[1],'pF')];metrics=[['Required inductance',labels[0]],['Reactance at resonance',fmt(r.reactance,'Ω')],['Inductor-only Q estimate',fmt(r.q,'')]];if(r.q<10)warnings.push('Low estimated Q: losses are significant. The ideal resonance frequency becomes a poor approximation to a real parallel tank.');}
    else{filter=bandpassDesign(n[0],n[1],n[2]*1e-9);labels=[fmt(n[2],'nF'),fmt(filter.rHighPass/1e3,'kΩ'),fmt(filter.rLowPass/1e3,'kΩ')];metrics=[['R1 · high-pass',labels[1]],['R2 · low-pass',labels[2]],['Peak frequency',fmt(filter.center,'Hz')],['Peak gain',fmt(20*Math.log10(filter.peak),'dB')],['Lower −3 dB edge¹',fmt(filter.low3db,'Hz')],['Upper −3 dB edge¹',fmt(filter.high3db,'Hz')]];}
    if(metrics.some(([,v])=>/NaN|∞|Infinity/.test(v)))throw Error('Values are outside the supported numerical range.');
  }catch(e){error=e instanceof Error?e.message:'Check your values.';}
  const explanations:Record<string,string>={
    geometry:'More turns increase inductance approximately with N². A wider coil increases it; a longer winding with the same turns generally reduces it. Diameter is measured through the wire centers, not the former alone. The drawing is schematic, with at most 30 visible loops.',
    inductor:'The inductor stores magnetic energy. For a fixed capacitor, increasing L lowers resonance. Use the measured AC series resistance at the operating frequency—not automatically the DC resistance—to estimate Q.',
    capacitor:'The capacitor stores electric energy. For a fixed target frequency, increasing C requires a smaller L. Stray capacitance adds to the intended value. Check capacitor tolerance and RF behavior.',
    highpass:'C1 is in series with the input; R1 returns its output node to ground. Low frequencies are attenuated. Increasing R1 or C1 lowers this stage’s corner frequency.',
    buffer:'The 1× block is an ideal voltage buffer, isolating R1/C1 from the next stage. A real implementation needs a unity-gain-stable amplifier with suitable bandwidth, supply, input common-mode range and output swing. Its power connections and bias network are not modeled here.',
    lowpass:'R2 is in series after the buffer; C2 returns the output to ground. High frequencies are attenuated. A low-impedance output load changes this response; this model assumes a high-impedance load.',
  };
  function download(){const lines=[config.formula,...config.fields.map((f,i)=>`${f}: ${values[i]}`),...metrics.map(([a,b])=>`${a}: ${b}`),...warnings,'Analytical estimate only; verify component tolerances and real circuit behavior.'];const u=URL.createObjectURL(new Blob([lines.join('\n')],{type:'text/plain'}));const a=document.createElement('a');a.href=u;a.download=`${kind}.txt`;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);setNotice('Design notes downloaded.');}
  return <>
    <div className={styles.grid}>
      <section className={styles.panel}><h2>{coil?'Set the winding geometry':'Set your design targets'}</h2><div className={styles.fields}>{config.fields.map((label,i)=><label className={styles.field} key={label}>{label}<input type="number" step={coil&&i===2?'1':'any'} min="0" value={values[i]} onChange={e=>setValues(v=>v.map((old,j)=>j===i?e.target.value:old))}/></label>)}</div><div className={styles.toolbar}><button type="button" onClick={()=>setValues(config.defaults)}>Reset example</button></div>{error?<p className={styles.error} role="alert">{error}</p>:<div className={styles.result} aria-live="polite">{metrics.map(([label,value])=><div className={styles.metric} key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>}
        {!error&&<button type="button" onClick={download}>Download design notes</button>}<p role="status">{notice}</p>
      </section>
      <section className={styles.panel}><h2>{coil?'Inspect the winding':'Explore the schematic'}</h2>{!error?<><div className={styles.diagramScroll} tabIndex={0} role="region" aria-label="Scrollable circuit schematic"><CircuitSchematic kind={kind} labels={labels} selected={selected} onSelect={setSelected} turns={n[2]}/></div><p className={styles.diagramHint}>Select a component below or in the drawing. On small screens, scroll the schematic sideways to inspect it.</p></>:<p className={styles.note}>Enter valid values to show the circuit and its calculated labels.</p>}
        <div className={styles.toolbar} aria-label="Circuit components">{config.parts.map(id=><button key={id} type="button" aria-pressed={id===selected} onClick={()=>setSelected(id)}>{({geometry:'Coil geometry',inductor:'Inductor L',capacitor:'Capacitor C',highpass:'High-pass RC',buffer:'Buffer',lowpass:'Low-pass RC'} as Record<string,string>)[id]}</button>)}</div>
        <div className={styles.explain} aria-live="polite"><p>{explanations[selected]}</p></div>
        {warnings.map(w=><p className={styles.note} key={w}>{w}</p>)}
        {filter&&!error&&<div className={styles.chart}><h3>Analytical frequency response</h3><ResponseChart low={n[0]} high={n[1]} probe={Number(probe)}/><label className={styles.field}>Probe frequency (Hz)<input type="number" min="0" step="any" value={probe} onChange={e=>setProbe(e.target.value)}/></label><p aria-live="polite">{Number(probe)>0&&Number.isFinite(Number(probe))?`Gain at ${probe} Hz: ${fmt(20*Math.log10(bandpassGain(Number(probe),n[0],n[1])),'dB')}`:'Enter a positive probe frequency.'}</p><p className={styles.caption}>¹ Overall half-power edges are relative to the peak gain—not necessarily the two RC stage corners. Frequency is plotted on a logarithmic axis.</p></div>}
      </section>
    </div>
    <section className={styles.foot}><h2>Model, parts and limitations</h2>{equations[kind].map(([label,tex])=><MathEquation key={label} label={label} tex={tex}/>)}{coil&&<p>Use radius r and winding length ℓ in inches; N is the turn count. The result is in microhenries.</p>}<p>{coil?'Wheeler’s single-layer air-core estimate is a starting point, not a measured RF inductance. Insulation, lead length, winding spacing and nearby metal matter. Wire length excludes connecting leads. This does not calculate safe current or self-resonance.':lc?'This is a passive tuned circuit, not a complete oscillator or transmitter. It does not start or sustain oscillation on its own. Q excludes capacitor loss, source/load damping and parasitics. Choose an inductor whose measured self-resonant frequency is safely above operation.':'This is an ideal buffered two-stage RC filter. No supply/bias, amplifier limitations, component tolerance, PCB parasitics or load effects are simulated. The schematic is an analytical model, not a ready-to-manufacture board.'}</p><p>{coil?'Use nonmagnetic formers and confirm inductance with an LCR meter. Do not use this formula for ferrite cores, multilayer windings or PCB spirals.':lc?'Compare the required value against a manufacturer’s RF inductor data: Q at your frequency, self-resonant frequency, tolerance and AC resistance. The tool cannot infer these from inductance alone.':'Use stable resistors and appropriately rated capacitors. Compare the selected capacitance’s tolerance and temperature coefficient. Select a real buffer only after defining supply voltage, signal amplitude and bandwidth.'}</p><a href={config.source} target="_blank" rel="noreferrer">Technical reference: {config.sourceLabel} ↗</a></section>
  </>;
}

function ResponseChart({low,high,probe}:{low:number;high:number;probe:number}) {
  const min=low/100,max=high*100;
  const x=(f:number)=>55+Math.log10(f/min)/Math.log10(max/min)*600;
  const y=(f:number)=>30+Math.min(80,-20*Math.log10(bandpassGain(f,low,high)))/80*200;
  const points=Array.from({length:181},(_,i)=>{const f=min*(max/min)**(i/180);return `${x(f)},${y(f)}`;}).join(' ');
  return <svg className={styles.diagram} viewBox="0 0 700 280" role="img" aria-label="Band-pass gain response, logarithmic frequency, gain from zero to minus eighty decibels"><path d="M55 30v200h600" stroke="currentColor" fill="none"/>{[0,20,40,60,80].map(db=><g key={db}><text x="4" y={35+db*2.5} className={styles.small}>{-db} dB</text><path d={`M55 ${30+db*2.5}h600`} stroke="var(--line-hairline)"/></g>)}<polyline points={points} fill="none" stroke="var(--text-accent)" strokeWidth="3"/>{[low,Math.sqrt(low*high),high].map(f=><g key={f}><path d={`M${x(f)} 30v200`} stroke="var(--line-strong)" strokeDasharray="4 5"/><text x={x(f)} y="255" textAnchor="middle" className={styles.small}>{fmt(f,'Hz')}</text></g>)}{probe>=min&&probe<=max&&<circle cx={x(probe)} cy={y(probe)} r="6" fill="var(--text-primary)"/>}</svg>;
}
