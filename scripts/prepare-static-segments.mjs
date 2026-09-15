// Next's Windows export nests segment keys with path separators while the client
// requests dot-separated segment filenames. Add portable aliases, preserving originals.
import {readdir,copyFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
export async function prepareStaticSegments(root=path.resolve('out')) {
  let count=0;
  async function walk(dir,segmentRoot=null) {
    for(const entry of await readdir(dir,{withFileTypes:true})) {
      const full=path.join(dir,entry.name);
      if(entry.isDirectory()) {
        if(entry.name==='_next'||entry.name==='media'||entry.name==='vendor') continue;
        await walk(full,segmentRoot||(entry.name.startsWith('__next.')?{parent:dir,folder:entry.name}:null));
      } else if(segmentRoot&&entry.name.endsWith('.txt')) {
        const relative=path.relative(segmentRoot.parent,full).split(path.sep).join('.');
        await copyFile(full,path.join(segmentRoot.parent,relative));count++;
      }
    }
  }
  await walk(root);return count;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) console.log(`Prepared ${await prepareStaticSegments()} static segment aliases.`);
