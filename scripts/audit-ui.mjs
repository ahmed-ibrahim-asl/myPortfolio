// Read-only browser audit of the static export. Reports are diagnostic candidates,
// not an accessibility certification: image/gradient backgrounds require visual review.
import { createServer } from 'node:http';
import { readFile, readdir, stat, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const root = path.resolve('out');
const reportDir = path.resolve('test-results/ui-audit');
await mkdir(reportDir, { recursive: true });
const routes = [];
async function walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.isDirectory() && !['_next', 'vendor', 'media'].includes(e.name)) await walk(path.join(dir, e.name));
    else if (e.name === 'index.html') routes.push('/' + path.relative(root, dir).replaceAll('\\', '/') + '/');
  }
}
await walk(root);
const selected = routes.map(r => r === '//' ? '/' : r).filter(r => !r.startsWith('/404'));
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    let file = path.resolve(root, '.' + decodeURIComponent(url.pathname).replace(/^\/myPortflio/, ''));
    if (!file.startsWith(root + path.sep) && file !== root) throw Error('invalid path');
    if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
    const type = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.mjs': 'application/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.json': 'application/json', '.pdf': 'application/pdf', '.woff2': 'font/woff2' }[path.extname(file)];
    res.setHeader('Content-Type', type || 'application/octet-stream');
    res.end(await readFile(file));
  } catch { res.writeHead(404).end(); }
}).listen(3012);
if (process.argv.includes('--serve')) {
  console.log('Serving the production export at http://localhost:3012/myPortflio/');
  await new Promise(() => {});
}
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
const results = [];
try {
  const page = await browser.newPage();
  await page.evaluateOnNewDocument(() => localStorage.setItem('asl-theme-preference', 'dark'));
  let count = 0;
  for (const route of selected) {
    for (const width of [1440, 390]) {
      await page.setViewport({ width, height: 900 });
      const response = await page.goto('http://localhost:3012/myPortflio' + route, { waitUntil: 'load' });
      if (route.includes('/gradify/planner')) await page.waitForSelector('#gradify-delta');
      for (const theme of ['dark', 'light']) {
        await page.evaluate(t => { document.documentElement.dataset.theme = t; document.documentElement.style.colorScheme = t; }, theme);
        await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' });
        const result = await page.evaluate(() => {
          const rgb = s => { const c = (s.match(/[\d.]+/g) || []).map(Number); return s.startsWith('color(srgb') ? c.map((v,i)=>i<3?v*255:v) : c; };
          const mix = (f,b) => f.slice(0,3).map((v,i) => v*(f[3]??1)+b[i]*(1-(f[3]??1)));
          const lum = c => c.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
          const visible = e => {
            if (!e.getClientRects().length || e.closest('[aria-hidden="true"], [hidden], .registration-plan-report-root')) return false;
            for(let n=e;n;n=n.parentElement){const s=getComputedStyle(n);if(s.visibility==='hidden'||s.display==='none'||Number(s.opacity)===0)return false;}
            return true;
          };
          const background = e => {
            const layers=[];
            for(let n=e;n;n=n.parentElement){const s=getComputedStyle(n);if(s.backgroundImage!=='none')return null;layers.push(rgb(s.backgroundColor));}
            return layers.reverse().reduce((b,f)=>mix(f,b),[255,255,255]);
          };
          const contrast=[]; const clipped=[];
          for (const e of document.querySelectorAll('main *')) {
            if (!visible(e) || e.closest('svg,button:disabled,[aria-disabled="true"],.sr-only')) continue;
            const text=[...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent.trim()).join(' ').trim();
            const s=getComputedStyle(e);
            if(text){const bg=background(e);if(bg){const fg=mix(rgb(s.color),bg);const a=lum(fg),b=lum(bg),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);const threshold=parseFloat(s.fontSize)>=24||(parseFloat(s.fontSize)>=18.66&&Number(s.fontWeight)>=700)?3:4.5;if(ratio<threshold-.05)contrast.push({text:text.slice(0,90),tag:e.tagName,cls:e.className,ratio:+ratio.toFixed(2),fg:s.color,bg:bg.map(Math.round)});}}
            if(e.matches('button,a.button') && e.scrollWidth>e.clientWidth+2)clipped.push({text:e.textContent.slice(0,80),width:e.clientWidth,scroll:e.scrollWidth});
          }
          return {overflow:document.documentElement.scrollWidth-innerWidth,contrast,clipped};
        });
        results.push({route,width,theme,status:response.status(),...result});
      }
    }
    if (++count % 15 === 0) console.log(`Audited ${count}/${selected.length} routes`);
  }
  await writeFile(path.join(reportDir,'results.json'), JSON.stringify(results,null,2));
  console.log(JSON.stringify({routes:selected.length,states:results.length,overflow:results.filter(r=>r.overflow>0).map(r=>[r.route,r.width,r.theme,r.overflow]),contrastStates:results.filter(r=>r.contrast.length).length,clippedStates:results.filter(r=>r.clipped.length).length}));
} finally { await browser.close(); server.close(); }
