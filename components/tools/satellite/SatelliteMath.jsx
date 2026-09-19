import katex from 'katex';
import 'katex/dist/katex.min.css';
export default function SatelliteMath({latex,description}){
  if(!latex)return null;
  const html=katex.renderToString(latex,{throwOnError:false,strict:'ignore',trust:false,output:'htmlAndMathml',displayMode:true});
  return <div className="satellite-equation" role="group" aria-label={description||latex}><div dangerouslySetInnerHTML={{__html:html}}/></div>;
}
