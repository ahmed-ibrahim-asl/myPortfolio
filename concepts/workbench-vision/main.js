const root=document.documentElement;
const sensor=document.querySelector('#sensor');
const bench=document.querySelector('#bench');
const updateSignal=()=>{
  const value=Number(sensor.value);
  const active=value>=60;
  document.querySelector('#sensor-value').textContent=String(value);
  document.querySelector('#evaluation').textContent=`${value} ${active?'≥':'<'} 60 · condition ${active?'met':'not met'}`;
  document.querySelector('#output-state').textContent=active?'ON':'OFF';
  document.querySelector('#output-copy').textContent=active?'Threshold reached. The output is enabled.':'Below the threshold. The output stays disabled.';
  bench.dataset.active=String(active);
};
sensor.addEventListener('input',updateSignal);
updateSignal();
const layers={
  hardware:{image:'../../media/portfolio/showcase/agribot/cover.webp',alt:'AI-styled presentation of the AgriBot agricultural robot',label:'AGRIBOT / AI-STYLED PROJECT COVER',copy:'The physical platform brings the electronics, mobile chassis, and agricultural hardware into one system.'},
  software:{image:'../../media/portfolio/showcase/agribot/cover.webp',alt:'AgriBot project cover representing its connected software and hardware',label:'AGRIBOT / SOFTWARE + CONNECTIVITY',copy:'Crop selection, fertilizer recommendations, and leaf-disease diagnosis connect with remote device management through Firewire OTA.'},
  interface:{image:'../../media/portfolio/showcase/agribot/ui-1.webp',alt:'Original AgriBot mobile interface collection',label:'AGRIBOT / ORIGINAL MOBILE INTERFACE',copy:'The mobile interface brings agricultural guidance and remote device management into a usable control surface.'}
};
document.querySelectorAll('[data-layer]').forEach(button=>button.addEventListener('click',()=>{
  const layer=layers[button.dataset.layer];
  document.querySelectorAll('[data-layer]').forEach(other=>other.setAttribute('aria-pressed',String(other===button)));
  document.querySelector('#layer-copy').textContent=layer.copy;
  const img=document.querySelector('#project-image');img.src=layer.image;img.alt=layer.alt;
  img.parentElement.dataset.view=button.dataset.layer;
  document.querySelector('#image-label').textContent=layer.label;
}));
document.querySelector('#theme').addEventListener('click',()=>{
  const light=root.dataset.theme!=='light';root.dataset.theme=light?'light':'dark';
  document.querySelector('#theme').textContent=light?'Dark mode ◐':'Light mode ◐';
  document.querySelector('#theme').setAttribute('aria-label',`Switch to ${light?'dark':'light'} theme`);
});
const motion=document.querySelector('#motion');
function setMotion(enabled){root.dataset.motion=enabled?'on':'off';motion.setAttribute('aria-pressed',String(enabled));motion.textContent=enabled?'Motion on':'Motion off';}
const preference=matchMedia('(prefers-reduced-motion: reduce)');
setMotion(!preference.matches);
preference.addEventListener('change',e=>setMotion(!e.matches));
motion.addEventListener('click',()=>setMotion(root.dataset.motion!=='on'));
