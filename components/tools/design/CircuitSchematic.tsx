'use client';
import type { ReactNode } from 'react';
import styles from './DesignLab.module.css';

function Part({id,label,selected,onSelect,children,x,y,w=110,h=95}:{id:string;label:string;selected:string;onSelect:(id:string)=>void;children:ReactNode;x:number;y:number;w?:number;h?:number}) {
  return <g role="button" tabIndex={0} aria-label={label} aria-pressed={selected===id} onClick={()=>onSelect(id)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect(id);}}}><rect className={styles.hit} x={x} y={y} width={w} height={h}/>{children}</g>;
}
const Ground=({x,y}:{x:number;y:number})=><g stroke="currentColor" strokeWidth="2"><path d={`M${x} ${y}v12m-16 0h32m-25 7h18m-12 7h6`}/></g>;
export default function CircuitSchematic({kind,labels,selected,onSelect,turns=10}:{kind:string;labels:string[];selected:string;onSelect:(id:string)=>void;turns?:number}) {
  const coil=kind==='air-core-coil-designer',lc=kind==='lc-resonance-designer';
  return <svg className={styles.diagram} viewBox="0 0 700 320" role="group" aria-label={coil?'Single-layer air-core coil geometry':lc?'Parallel LC tank schematic':'Buffered RC band-pass schematic'}>
    <title>{coil?'Air-core coil winding':lc?'Ideal parallel LC resonator':'High-pass RC, ideal buffer, low-pass RC'}</title>
    {coil?<>
      <text x="35" y="35">Single-layer winding · schematic scale</text>
      <Part id="geometry" label="Inspect coil geometry" selected={selected} onSelect={onSelect} x={90} y={60} w={500} h={170}>
        <path d="M40 160H125M555 160H660" fill="none" stroke="currentColor" strokeWidth="3"/>
        {Array.from({length:Math.min(turns,30)},(_,i)=>{const step=400/Math.min(turns,30);return <ellipse key={i} cx={140+i*step} cy="150" rx={step*.7} ry="68" fill="none" stroke="currentColor" strokeWidth="2"/>;})}
        <text x="210" y="265">{labels[0]} mean diameter · {turns} turns</text>
      </Part>
      <path d="M125 235v-10m0 5H555m0-5v10" fill="none" stroke="currentColor"/>
      <text x="265" y="295">Winding length: {labels[1]}</text>
    </>:lc?<>
      <text x="35" y="35">Parallel tank · no active oscillator stage</text>
      <path d="M90 95H580M220 95v40m0 80v35h280v-60m0-25V95" fill="none" stroke="currentColor" strokeWidth="2"/>
      <circle cx="220" cy="95" r="4" fill="currentColor"/><circle cx="500" cy="95" r="4" fill="currentColor"/>
      <text x="80" y="75">Tank node</text>
      <Part id="inductor" label="Inspect inductor" selected={selected} onSelect={onSelect} x={120} y={120} w={210} h={110}>
        <path d="M220 135c-30 0-30 20 0 20c-30 0-30 20 0 20c-30 0-30 20 0 20c-30 0-30 20 0 20" fill="none" stroke="currentColor" strokeWidth="3"/>
        <text x="245" y="175">L {labels[0]}</text>
      </Part>
      <Part id="capacitor" label="Inspect capacitor" selected={selected} onSelect={onSelect} x={425} y={125} w={220} h={100}>
        <path d="M475 165h50m-50 25h50" fill="none" stroke="currentColor" strokeWidth="3"/>
        <text x="535" y="182">C {labels[1]}</text>
      </Part><Ground x={360} y={250}/>
      <text x="40" y="305" className={styles.small}>Select L or C to inspect its effect. Winding resistance is included only in the Q estimate.</text>
    </>:<>
      <text x="25" y="35">High-pass → ideal unity buffer → low-pass</text>
      <path d="M30 110h60m25 0h95v48m0-48h90m75 0h40m80 0h115v48m0-48h60M210 220v35m400-30v30" fill="none" stroke="currentColor" strokeWidth="2"/>
      <text x="25" y="85">Vin</text><text x="622" y="85">Vout</text>
      <Part id="highpass" label="Inspect high-pass RC stage" selected={selected} onSelect={onSelect} x={70} y={60} w={215} h={190}>
        <path d="M90 85v50m25-50v50M200 158h20v62h-20z" fill="none" stroke="currentColor" strokeWidth="3"/>
        <text x="65" y="62">C1 {labels[0]}</text><text x="230" y="197">R1</text><text x="35" y="235">R1 {labels[1]}</text>
      </Part><Ground x={210} y={255}/>
      <Part id="buffer" label="Inspect ideal buffer" selected={selected} onSelect={onSelect} x={285} y={65} w={105} h={150}>
        <path d="M300 70L375 110L300 150Z" fill="var(--bg-surface)" stroke="currentColor" strokeWidth="2"/>
        <text x="315" y="116">1×</text><text x="295" y="180" className={styles.small}>Ideal buffer</text>
      </Part>
      <Part id="lowpass" label="Inspect low-pass RC stage" selected={selected} onSelect={onSelect} x={405} y={60} w={255} h={180}>
        <path d="M415 100h80v20h-80zM585 158h50m-50 27h50M610 185v40" fill="none" stroke="currentColor" strokeWidth="3"/>
        <text x="402" y="75">R2 {labels[2]}</text><text x="492" y="218">C2 {labels[0]}</text>
      </Part><Ground x={610} y={255}/>
      <circle cx="210" cy="110" r="4" fill="currentColor"/><circle cx="610" cy="110" r="4" fill="currentColor"/>
      <text x="340" y="305" className={styles.small}>Ideal source · high-impedance load</text>
    </>}
  </svg>;
}
