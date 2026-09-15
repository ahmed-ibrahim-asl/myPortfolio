import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {JSDOM} from 'jsdom';
test('all new tool SVG covers parse as XML',async()=>{
  for(const file of await readdir('public/media/tools/design')) {
    if(!file.includes('-v2-'))continue;
    const svg=await readFile(`public/media/tools/design/${file}`,'utf8');
    assert.doesNotThrow(()=>new JSDOM(svg,{contentType:'image/svg+xml'}),file);
  }
});
