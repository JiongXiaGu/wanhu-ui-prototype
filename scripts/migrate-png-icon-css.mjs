import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT='src';
async function walk(dir){
  const entries=await readdir(dir,{withFileTypes:true});
  const out=[];
  for(const entry of entries){
    const full=path.join(dir,entry.name);
    if(entry.isDirectory()) out.push(...await walk(full));
    else if(entry.name.endsWith('.css') && !full.replaceAll('\\\\','/').startsWith('src/review/')) out.push(full);
  }
  return out;
}

let changed=0;
let selectorReplacements=0;
let strokeDeclarations=0;
for(const file of await walk(ROOT)){
  const text=await readFile(file,'utf8');
  const matches=[...text.matchAll(/\bsvg\b/g)].length;
  const strokes=[...text.matchAll(/stroke-width\s*:[^;}]*(?:;|(?=}))/g)].length;
  if(!matches && !strokes) continue;
  let next=text.replace(/\bsvg\b/g,'.ui-icon');
  next=next.replace(/\s*stroke-width\s*:[^;}]*(?:;|(?=}))/g,'');
  if(next!==text){
    await writeFile(file,next,'utf8');
    changed+=1;
    selectorReplacements+=matches;
    strokeDeclarations+=strokes;
  }
}

console.log('Migrated PNG icon CSS files:',changed);
console.log('svg selector tokens replaced:',selectorReplacements);
console.log('dead stroke-width declarations removed:',strokeDeclarations);
