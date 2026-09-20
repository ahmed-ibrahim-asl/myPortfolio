import Link from 'next/link';
import RotExplorer from './RotExplorer';
import VigenereExplorer from './VigenereExplorer';
import ShiftCipherExplorer from './ShiftCipherExplorer';
import TranspositionExplorer from './TranspositionExplorer';
import PlayfairExplorer from './PlayfairExplorer';
import HillExplorer from './HillExplorer';
import HashExplorer from './HashExplorer';
import AesExplorer from './AesExplorer';
import CircuitDesigner from './CircuitDesigner';
import CascadedOpAmpDesigner from './CascadedOpAmpDesigner';
import ControlDesignAssistant from './ControlDesignAssistant';
import LogicGateDesigner from './LogicGateDesigner';
import PowerConversionDesigner from './PowerConversionDesigner';
import SmpsDesigner from './SmpsDesigner';
import { ToolDirectAnswer, ToolSearchHook, ToolSearchSchema } from '../ToolSearchHook';
import styles from './DesignLab.module.css';

export function DesignToolPage({tool}:{tool:{slug:string;title:string;summary:string;category:string}}) {
  const rot=tool.slug==='rot-explorer'; const vigenere=tool.slug==='vigenere-cipher'; const affine=tool.slug==='affine-cipher'; const transposition=tool.slug==='transposition-cipher'; const playfair=tool.slug==='playfair-cipher'; const hill=tool.slug==='hill-cipher'; const hash=tool.slug==='hash-generator'; const aes=tool.slug==='aes-hex-calculator'; const textEncoding=rot||vigenere||affine||transposition||playfair||hill||hash||aes; const control=tool.slug==='control-design-assistant'; const logic=tool.slug==='logic-gate-designer'; const power=tool.category==='Power Conversion & Supplies';
  const powerKind=tool.slug==='bridge-rectifier-designer'?'bridge':tool.slug==='linear-regulator-stability-designer'?'linear':'buck';
  return <article className={styles.root}><header className={styles.intro}><Link href={`/tools/category/${textEncoding?'text-encoding':'circuit-design'}/`}>← {tool.category}</Link><p className={styles.eyebrow}>{textEncoding?'Text & Encoding / letter transformations':control||logic?'Control Design / memory and state':power?'Power Conversion / design models':'Circuit Design / interactive engineering'}</p><h1>{tool.title}</h1><p>{tool.summary}</p></header><ToolDirectAnswer slug={tool.slug}/><ToolSearchSchema slug={tool.slug}/>{tool.slug==='smps-designer'?<SmpsDesigner/>:rot?<RotExplorer/>:vigenere?<VigenereExplorer/>:affine?<ShiftCipherExplorer/>:transposition?<TranspositionExplorer/>:playfair?<PlayfairExplorer/>:hill?<HillExplorer/>:hash?<HashExplorer/>:aes?<AesExplorer/>:control?<ControlDesignAssistant/>:logic?<LogicGateDesigner/>:power?<PowerConversionDesigner kind={powerKind}/>:tool.slug==='cascaded-opamp-gain-designer'?<CascadedOpAmpDesigner/>:<CircuitDesigner kind={tool.slug}/>}<ToolSearchHook slug={tool.slug}/></article>;
}
