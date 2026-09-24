import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const SRC_ROOT='src';

/*
 * Retired shared-palette guard.
 *
 * Phase 1 cleanup has completed, so the legacy baseline is intentionally empty.
 * Any retired Paper / Gold / old Brass literal found in Runtime CSS is now a
 * regression and must fail the audit rather than becoming a new exception.
 */
const LEGACY_SHARED_COLOR_BASELINE_FILES=new Set([
]);

/* 按完整变量名匹配，不能把 icon-size / divider-height 等几何误判为视觉别名。 */
function commandAlias(pattern){
  return new RegExp(String.raw`(?<![-\w])--command-${pattern}(?![-\w])`,'gi');
}

/* 同一退役 Hue 的 rgb / rgba、逗号 / 空格写法属于同一债务。
   这里只检查数值 RGB 字面量，不承担完整 CSS 颜色表达式求值。 */
function retiredRgb(red,green,blue){
  const channel=value=>String.raw`${value}(?:\.0+)?`;
  const [r,g,b]=[red,green,blue].map(channel);
  return new RegExp(
    String.raw`\brgba?\(\s*(?:${r}\s*,\s*${g}\s*,\s*${b}(?=\s*[,\)])|${r}\s+${g}\s+${b}(?=\s*[/\)]))`,
    'gi',
  );
}

const RETIRED_COMMAND_VISUAL_ALIAS_MARKERS=[
  {id:'legacy-command-surface-alias',re:commandAlias('surface-(?:lg|md|sm)-(?:top|bottom)')},
  {id:'legacy-command-border-alias',re:commandAlias('border')},
  {id:'legacy-command-divider-alias',re:commandAlias('divider')},
  {id:'legacy-command-hover-alias',re:commandAlias('hover')},
  {id:'legacy-command-active-alias',re:commandAlias('active-(?:top|bottom|line)')},
  {id:'legacy-command-primary-alias',re:commandAlias('primary-(?:top|bottom|hover-top|hover-bottom)')},
  {id:'legacy-command-icon-alias',re:commandAlias('icon(?:-hover|-active)?')},
  {id:'legacy-command-tooltip-alias',re:commandAlias('tooltip-(?:bg|edge|shadow)')},
  {id:'legacy-command-blur-alias',re:commandAlias('blur(?:-(?:lg|md|sm))?')},
];

/* HUD 前景别名已退役；只枚举完整名称，不禁止仍在使用的材质、背景或几何变量。 */
const RETIRED_HUD_FOREGROUND_ALIASES=[
  '--hud-text','--hud-text-secondary','--hud-icon','--hud-accent','--hud-accent-text',
  '--wanhu-hud-paper','--wanhu-hud-text','--wanhu-hud-muted','--wanhu-hud-faint','--wanhu-hud-gold',
];
const RETIRED_HUD_FOREGROUND_ALIAS_MARKERS=RETIRED_HUD_FOREGROUND_ALIASES.map(name=>({
  name,re:new RegExp(String.raw`(?<![-\w])${name}(?![-\w])`,'g'),
}));

const RETIRED_SHARED_COLOR_MARKERS=[
  {id:'legacy-paper-var',re:/--paper\b/gi},
  {id:'legacy-gold-var',re:/--gold(?:-hi|-fill)?\b/gi},
  {id:'legacy-paper-hex',re:/#efe9dd/gi},
  {id:'legacy-brass-hex',re:/#c9a55f/gi},
  {id:'legacy-brass-high-hex',re:/#e2c27d/gi},
  {id:'legacy-brass-rgb',re:retiredRgb(201,165,95)},
  {id:'legacy-character-brass-rgb',re:retiredRgb(210,179,111)},
  {id:'legacy-card-brass-hex',re:/#c9aa68/gi},
  {id:'legacy-card-brass-rgb',re:retiredRgb(201,170,104)},
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

  const commandAliases=[];
  for(const marker of RETIRED_COMMAND_VISUAL_ALIAS_MARKERS){
    const matches=[...text.matchAll(new RegExp(marker.re.source,marker.re.flags))];
    if(matches.length){
      commandAliases.push({id:marker.id,count:matches.length,names:[...new Set(matches.map(match=>match[0]))]});
    }
  }
  if(commandAliases.length){
    errors.push(
      file + ': retired command visual compatibility aliases may not return. '
      + 'Use canonical --wanhu-command-* / --wanhu-color-* semantic tokens; keep only command geometry variables. '
      + commandAliases.map(marker=>marker.id + '=' + marker.count + ' [' + marker.names.join(', ') + ']').join('; ')
    );
  }

  const hudAliases=[];
  for(const marker of RETIRED_HUD_FOREGROUND_ALIAS_MARKERS){
    const count=countMatches(text,marker.re);
    if(count)hudAliases.push({name:marker.name,count});
  }
  if(hudAliases.length){
    errors.push(
      file + ': retired HUD foreground compatibility aliases may not return. '
      + 'Use the existing Surface foreground owner / canonical --wanhu-color-* tokens; preserve HUD material and geometry. '
      + hudAliases.map(marker=>marker.name + '=' + marker.count).join('; ')
    );
  }

  if(markers.length===0 && commandAliases.length===0 && hudAliases.length===0){
    if(LEGACY_SHARED_COLOR_BASELINE_FILES.has(file))cleanBaselineFiles.push(file);
    continue;
  }

  if(markers.length)debt.push({file,markers});

  const retiredVariableMarkers=markers.filter(marker=>
    marker.id==='legacy-paper-var' || marker.id==='legacy-gold-var'
  );

  if(retiredVariableMarkers.length){
    errors.push(
      file + ': retired shared --paper / --gold* variables are fully retired and may not return. '
      + 'Use current wanhu semantic Theme tokens.'
    );
  }else if(markers.length && !LEGACY_SHARED_COLOR_BASELINE_FILES.has(file)){
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
console.log('Retired command visual aliases guarded: ' + RETIRED_COMMAND_VISUAL_ALIAS_MARKERS.length);
console.log('Retired HUD foreground aliases guarded: ' + RETIRED_HUD_FOREGROUND_ALIASES.length);

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
