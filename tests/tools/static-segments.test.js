import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {prepareStaticSegments} from '../../scripts/prepare-static-segments.mjs';
test('static segment aliases preserve nested exports and match client URLs',async()=>{
  const root=await mkdtemp(path.join(tmpdir(),'portfolio-segments-test-'));
  try{
    const route=path.join(root,'tools','sample'),nested=path.join(route,'__next.tools','$d$slug');
    await mkdir(nested,{recursive:true});await writeFile(path.join(nested,'__PAGE__.txt'),'segment fixture');
    assert.equal(await prepareStaticSegments(root),1);
    assert.equal(await readFile(path.join(route,'__next.tools.$d$slug.__PAGE__.txt'),'utf8'),'segment fixture');
    assert.equal(await readFile(path.join(nested,'__PAGE__.txt'),'utf8'),'segment fixture');
  }finally{await rm(root,{recursive:true,force:true});}
});
