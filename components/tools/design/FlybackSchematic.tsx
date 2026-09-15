import type { KeyboardEvent } from 'react';
import ui from './SmpsDesigner.module.css';
import type { flybackDesign } from '@/lib/tools/smps-design';

type Props={mode:'ac'|'dc';phase:string;result:ReturnType<typeof flybackDesign>;output:number;selected:string;onSelect:(id:string)=>void};
const fmt=(n:number)=>Number(n.toPrecision(4)).toString();

/** Conventional-current diagram. Rectifier phase is independent of the switching cycle. */
export default function FlybackSchematic({mode,phase,result:r,output,selected,onSelect}:Props){
 const store=phase==='store',transfer=phase==='transfer';
 const wire=(d:string,active=false)=><path d={d} className={active?ui.liveWire:ui.wire}/>;
 const inspect=(id:string,label:string)=>({role:'button',tabIndex:0,'aria-label':`Inspect ${label}`,'aria-pressed':selected===id,onClick:()=>onSelect(id),onKeyDown:(e:KeyboardEvent)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect(id);}}});
 const diode=(x1:number,y1:number,x2:number,y2:number,name:string)=>{
  const length=Math.hypot(x2-x1,y2-y1),angle=Math.atan2(y2-y1,x2-x1)*180/Math.PI,c=length/2;
  return <g key={name} data-bridge-diode={name} transform={`translate(${x1} ${y1}) rotate(${angle})`}><title>{`${name}: anode to cathode`}</title>{wire(`M0 0H${c-15}M${c+15} 0H${length}M${c-15} -13L${c+15} 0L${c-15} 13ZM${c+15} -17V17`)}</g>;
 };
 return <div className={ui.circuitSheet}>
 <div className={ui.sheetHeading}><span>COMPONENT SCHEMATIC / DCM FLYBACK</span><strong>{store?'Q1 ON · D5 blocks':transfer?'Q1 OFF · D5 conducts':'Q1 OFF · D5 blocks'}</strong></div>
 <svg className={ui.schematic} viewBox="0 0 1200 610" role="img" aria-label="Isolated flyback component schematic with bridge rectifier, input capacitor, N-channel MOSFET, coupled windings, output diode and load">
  <title>Component-level flyback power stage</title>
  <desc>Separate primary and secondary returns. AC rectification is not synchronized to the high-frequency switching phase. Gate drive is functional; protection, compensation and controller supply are not specified.</desc>
  <path d="M665 75V545" className={ui.barrier}/>
  <text x="70" y="40">{mode==='ac'?'RECTIFIED MAINS / PRIMARY':'DC SOURCE / PRIMARY'}</text>
  <text x="760" y="40">ISOLATED SECONDARY</text>
  {mode==='ac'?<g {...inspect('input','AC bridge and reservoir')}>
   <rect x="35" y="65" width="260" height="270" className={ui.hit}/>
   {diode(60,200,160,100,'D1')}{diode(260,200,160,100,'D2')}{diode(160,300,60,200,'D3')}{diode(160,300,260,200,'D4')}
   {wire('M30 200H60M260 200H300M160 100H320M160 300V520H320')}
   <circle cx="30" cy="200" r="5" className={ui.terminal}/><circle cx="300" cy="200" r="5" className={ui.terminal}/>
   <text x="30" y="178">L</text><text x="286" y="178">N</text>
   <text x="65" y="115">D1</text><text x="237" y="135">D2</text><text x="65" y="303">D3</text><text x="237" y="303">D4</text>
   <text x="184" y="368" className={ui.captionText}>AC bridge</text>
   <text x="184" y="389" className={ui.captionText}>Line frequency</text>
  </g>:<g {...inspect('input','DC input and bypass')}>
   <rect x="70" y="150" width="180" height="250" className={ui.hit}/>
   {wire('M160 100H320M160 100V256M160 324V520H320',store)}
   <circle cx="160" cy="290" r="34" className={ui.wire}/>
   <text x="152" y="281">+</text><text x="152" y="313">−</text><text x="88" y="226">DC input</text>
  </g>}
  {wire('M320 100H580M320 520H580',store)}
  <g {...inspect('input','Cbulk input capacitor')}>
   <rect x="296" y="234" width="54" height="105" className={ui.hit}/>
   {wire('M320 100V274M300 274H340M300 292H340M320 292V520')}
   <text x="347" y="270">{mode==='ac'?'Cbulk':'Cin'}</text><text x="347" y="295" className={ui.captionText}>Input reservoir</text>
  </g>
  <g {...inspect('magnetics','T1 coupled windings')}>
   <rect x="553" y="110" width="194" height="169" className={ui.hit}/>
   {wire('M580 100V128a15 15 0 0 0 0 30a15 15 0 0 0 0 30a15 15 0 0 0 0 30a15 15 0 0 0 0 30V280',store)}
   {wire('M720 100V128a15 15 0 0 1 0 30a15 15 0 0 1 0 30a15 15 0 0 1 0 30a15 15 0 0 1 0 30V280',transfer)}
   {wire('M631 122V255M643 122V255')}
   <circle cx="563" cy="119" r="5" fill="currentColor"/><circle cx="737" cy="264" r="5" fill="currentColor"/>
   <text x="612" y="84">T1</text><text x="535" y="199" textAnchor="end">Np</text><text x="758" y="199">Ns</text>
  </g>
  {wire('M580 280V370',store)}
  <g {...inspect('switch','Q1 N-channel MOSFET')}>
   <rect x="530" y="347" width="102" height="117" className={ui.hit}/>
   {wire('M580 370H557V383M557 389V401M557 408V420M557 427V439H580V450M540 383V439',store)}
   {wire('M580 370H615V388M615 433V450H580M604 403H626M615 403L604 425H626ZM615 425V433')}
   <text x="598" y="335">Q1</text><text x="480" y="348" textAnchor="end" className={ui.captionText}>N-MOSFET</text>
   <text x="594" y="356" className={ui.pin}>D</text><text x="519" y="399" className={ui.pin}>G</text><text x="591" y="474" className={ui.pin}>S</text>
  </g>
  {wire('M580 450V520',store)}
  <g {...inspect('switch','PWM gate drive')}>
   <rect x="365" y="385" width="115" height="60" className={ui.device}/>
   <text x="422" y="409" textAnchor="middle">PWM</text><text x="422" y="430" textAnchor="middle" className={ui.captionText}>Gate drive</text>
   {wire('M480 411H540M422 445V520')}
  </g>
  {wire('M720 100H825M895 100H1100M720 280V520H940',transfer)}
  <g {...inspect('diode','D5 output rectifier')}>
   <rect x="818" y="76" width="87" height="65" className={ui.hit}/>
   {wire('M825 100H840M870 100H895M840 85L870 100L840 115ZM870 80V120',transfer)}
   <text x="840" y="64">D5</text><text x="825" y="153" className={ui.captionText}>Output rectifier</text>
  </g>
  <g {...inspect('capacitor','Cout output capacitor')}>
   <rect x="914" y="244" width="58" height="100" className={ui.hit}/>
   {wire('M940 100V274M920 274H960M920 292H960M940 292V520',true)}
   <text x="968" y="270">Cout</text><text x="968" y="295" className={ui.captionText}>Reservoir</text>
  </g>
  {wire('M1100 100V249M1100 321V520H940',true)}
  <rect x="1086" y="249" width="28" height="72" className={ui.liveWire}/>
  <text x="1125" y="290">Load</text><text x="1098" y="78" textAnchor="end">Vout +</text>
  <text x="240" y="557">PRIMARY RETURN{mode==='ac'?' · HAZARDOUS':''}</text><text x="800" y="557">SECONDARY RETURN</text>
  {[{x:320,y:100},{x:320,y:520},{x:422,y:520},{x:580,y:520},{x:940,y:100},{x:940,y:520}].map(({x,y})=><circle key={`${x}-${y}`} cx={x} cy={y} r="4" fill="currentColor"/>)}
  <text x="665" y="592" textAnchor="middle" className={ui.captionText}>No electrical connection across the isolation barrier</text>
 </svg>
 <dl className={ui.sheetValues}>
  <div><dt>Primary DC bus</dt><dd>{fmt(r.busMin)}–{fmt(r.busMax)} V</dd></div>
  <div><dt>T1 · primary Lm</dt><dd>{fmt(r.inductance*1e6)} µH</dd></div>
  <div><dt>T1 · Np : Ns</dt><dd>{fmt(r.ratio)} : 1</dd></div>
  <div><dt>Cout · ideal minimum</dt><dd>{fmt(r.capacitance*1e6)} µF</dd></div>
  <div><dt>DC output</dt><dd>{fmt(output)} V</dd></div>
 </dl>
 <p className={ui.sheetNote}>Component-level power stage, not a finished supply: input filtering and protection, clamp/snubber, feedback, controller supply and compensation still require design. Cbulk is shown but not sized. Gold marks the selected switching-current path; it does not model the AC bridge charging pulses.</p>
 </div>;
}
