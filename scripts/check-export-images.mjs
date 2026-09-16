import fs from 'node:fs';
import path from 'node:path';
const errors = new Set();
let count = 0;
function walk(dir) {
  for (const file of fs.readdirSync(dir, {withFileTypes:true})) {
    const target = path.join(dir,file.name);
    if(file.isDirectory()) walk(target);
    else if(target.endsWith('.html')) {
      for(const match of fs.readFileSync(target,'utf8').matchAll(/<img[^>]+src="([^"]+)/g)) {
        const src = match[1];
        if(!src.startsWith('/')) continue;
        count++;
        const local = path.join('out',decodeURIComponent(src.replace(/^\//,'')));
        if(!fs.existsSync(local)) errors.add(src);
      }
    }
  }
}
walk('out');
console.log({checked:count,broken:[...errors]});
if(errors.size) process.exitCode=1;
