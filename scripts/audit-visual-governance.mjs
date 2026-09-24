import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const SRC_ROOT='src';

/*
 * Phase 1 visual-governance ratchet.
 *
 * These files still contain retired shared palette literals from the early Web
 * theme. They are debt, not approved design tokens. Existing occurrences are
 * temporarily allowed so the cleanup can happen page-family by page-family.
 *
 * Rule: debt may shrink, but it must not spread to any new runtime CSS file.
 * Remove a file from this set as soon as its retired shared colors are cleaned.
 */
const LEGACY_SHARED_COLOR_BASELINE_FILES=new Set([
  'src/tools/color-tool/modes/scheme/scheme-mode.css',
  'src/ui/color/color-parameter-field.css',
  'src/ui/dialog/dialog.css',
  'src/ui/hover/hover-overlay.css',
  'src/ui/wanhu-character.css',
]);

const RETIRED_SHARED_COLOR_MARKERS=[
  {id:'legacy-paper-var',re:/--paper\b/gi},
  {id:'legacy-gold-var',re:/--gold(?:-hi|-fill)?\b/gi},
  {id:'legacy-paper-hex',re:/#efe9dd/gi},
  {id:'legacy-brass-hex',re:/#c9a55f/gi},
  {id:'legacy-brass-high-hex',re:/#e2c27d/gi},
  {id:'legacy-brass-rgb',re:/rgba\(201\s*,\s*165\s*,\s*95\s*,/gi},
  {id:'legacy-character-brass-rgb',re:/rgba\(210\s*,\s*179\s*,\s*111\s*,/gi},
  {id:'legacy-card-brass-hex',re:/#c9aa68/gi},
  {id:'legacy-card-brass-rgb',re:/rgba\(201\s*,\s*170\s*,\s*104\s*,/gi},
];

async function walk(dir){
  const entries=await readdir(dir,{withFileTypes:true});
  const files=[];
  for(const entry of entries){
    const full=path.join(dir,entry.name);
    if(entry.isDirectory())files.push(...await walk(full));
    else files.push(full.replaceAll('\\','/'));
  }
  return files;
}

function countMatches(text,re){
  return [...text.matchAll(new RegExp(re.source,re.flags))].length;
}

const files=(await walk(SRC_ROOT)).filter(file=>
  file.endsWith('.css')
  && !file.startsWith('src/review/')
);

const debt=[];
const errors=[];
const cleanBaselineFiles=[];

for(const file of files){
  const text=await readFile(file,'utf8');
  const markers=[];

  for(const marker of RETIRED_SHARED_COLOR_MARKERS){
    const count=countMatches(text,marker.re);
    if(count>0)markers.push({id:marker.id,count});
  }

  if(markers.length===0){
    if(LEGACY_SHARED_COLOR_BASELINE_FILES.has(file))cleanBaselineFiles.push(file);
    continue;
  }

  debt.push({file,markers});

  const retiredVariableMarkers=markers.filter(marker=>
    marker.id==='legacy-paper-var' || marker.id==='legacy-gold-var'
  );

  if(retiredVariableMarkers.length){
    errors.push(
      file + ': retired shared --paper / --gold* variables are fully retired and may not return. '
      + 'Use current wanhu semantic Theme tokens.'
    );
  }else if(!LEGACY_SHARED_COLOR_BASELINE_FILES.has(file)){
    errors.push(
      file + ': retired shared palette literal introduced outside the Phase 1 baseline. '
      + 'Use current wanhu Theme / Surface / Control tokens or document a real content-color exception.'
    );
  }
}

console.log('Wanhu Web visual governance audit');
console.log('---------------------------------');
console.log('Runtime CSS scanned: ' + files.length);
console.log('Legacy palette debt files: ' + debt.length);

if(debt.length){
  console.log('\nPhase 1 legacy palette debt:');
  for(const item of debt){
    const summary=item.markers.map(marker=>marker.id + '=' + marker.count).join(', ');
    console.log('- ' + item.file + ': ' + summary);
  }
}

if(cleanBaselineFiles.length){
  console.log('\nRatchet cleanup opportunities:');
  for(const file of cleanBaselineFiles){
    console.log('- ' + file + ': baseline entry is now clean; remove it from LEGACY_SHARED_COLOR_BASELINE_FILES.');
  }
}

if(errors.length){
  console.error('\nVisual governance guard failures:');
  for(const error of errors)console.error('- ' + error);
  process.exitCode=1;
}else{
  console.log('\nVisual governance ratchet: PASS');
}
