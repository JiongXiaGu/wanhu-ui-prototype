import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const SRC='src';
const READABLE_FONT_FLOOR=9.5;
const ALLOWED_BELOW_FLOOR=[
  {
    file:'src/gameplay/gameplay-corner-hud.css',
    selectors:['.gameplay-compass-hud__cardinal','.gameplay-compass-hud__cardinal--south'],
    reason:'Compass cardinal glyphs are symbolic orientation markers, not continuous readable text.',
  },
];

async function walk(dir){
  const entries=await readdir(dir,{withFileTypes:true});
  const files=[];
  for(const entry of entries){
    const full=path.join(dir,entry.name);
    if(entry.isDirectory()) files.push(...await walk(full));
    else if(/\.(css|tsx?|jsx?)$/.test(entry.name) && !full.replaceAll('\\','/').startsWith('src/review/')) files.push(full.replaceAll('\\','/'));
  }
  return files;
}

const files=await walk(SRC);
const fonts=new Map();
const iconSizes=new Map();
const hardcodedIconCss=[];
const tinyFonts=[];
const belowFloorFonts=[];
const allowedBelowFloorFonts=[];
const tinyIcons=[];
const svgSelectors=[];
let fontSizeTokenUses=0;
let fontSizeHardcodedUses=0;

function add(map,key,item){
  if(!map.has(key)) map.set(key,[]);
  map.get(key).push(item);
}

for(const file of files){
  const text=await readFile(file,'utf8');
  const lines=text.split('\n');

  if(file.endsWith('.css')){
    const cssForRules=text.replace(/\/\*[\s\S]*?\*\//g,(comment)=>comment.replace(/[^\n]/g,' '));
    for(const match of cssForRules.matchAll(/([^{}]+)\{([^{}]*)\}/g)){
      const selector=match[1].trim();
      const body=match[2];
      const line=cssForRules.slice(0,match.index).split('\n').length;
      if(/\bsvg\b/.test(selector)){
        svgSelectors.push({file,line,selector,body:body.trim().replace(/\s+/g,' ')});
      }
      for(const sizeMatch of body.matchAll(/font-size\s*:\s*([^;}]*)/g)){
        const raw=sizeMatch[1].trim();
        if(/var\(/.test(raw)) fontSizeTokenUses+=1;
        else if(/px\b/.test(raw)) fontSizeHardcodedUses+=1;

        const numeric=raw.match(/^([0-9.]+)px$/);
        if(numeric){
          const value=Number(numeric[1]);
          if(value<READABLE_FONT_FLOOR){
            const item={file,line,selector,value,text:'font-size:'+raw};
            const allowed=ALLOWED_BELOW_FLOOR.some((entry)=>
              entry.file===file && entry.selectors.some((allowedSelector)=>selector.includes(allowedSelector))
            );
            (allowed?allowedBelowFloorFonts:belowFloorFonts).push(item);
          }
        }
      }
    }
    lines.forEach((line,index)=>{
      for(const match of line.matchAll(/font-size\s*:\s*([0-9.]+)px/g)){
        const value=Number(match[1]);
        const item={file,line:index+1,text:line.trim()};
        add(fonts,value,item);
        if(value<10) tinyFonts.push({value,...item});
      }
      if(/\.ui-icon\b|\bicon\b/i.test(line)){
        for(const match of line.matchAll(/(?:width|height|flex-basis)\s*:\s*([0-9.]+)px/g)){
          const value=Number(match[1]);
          const item={file,line:index+1,text:line.trim()};
          add(iconSizes,value,item);
          hardcodedIconCss.push({value,...item});
          if(value<14) tinyIcons.push({value,...item});
        }
      }
    });
  }else{
    lines.forEach((line,index)=>{
      for(const match of line.matchAll(/\bsize=\{([0-9.]+)\}/g)){
        const value=Number(match[1]);
        const item={file,line:index+1,text:line.trim()};
        add(iconSizes,value,item);
        if(value<14) tinyIcons.push({value,...item});
      }
    });
  }
}

function summary(map){
  return [...map.entries()]
    .sort((a,b)=>a[0]-b[0])
    .map(([value,items])=>({value,count:items.length,files:new Set(items.map(x=>x.file)).size}));
}

console.log('UI size audit');
console.log('-------------');
console.log('Runtime files scanned:',files.length);
console.log('\nFont-size distribution (px):');
for(const row of summary(fonts)) console.log(`${row.value}: ${row.count} declarations / ${row.files} files`);
console.log('\nIcon-size signals (px):');
for(const row of summary(iconSizes)) console.log(`${row.value}: ${row.count} signals / ${row.files} files`);

console.log(`\nFonts below 10px: ${tinyFonts.length}`);
for(const hit of tinyFonts) console.log(`FONT<10 ${hit.value}px ${hit.file}:${hit.line} ${hit.text}`);


const fileFontStats=new Map();
for(const hit of tinyFonts){
  const stat=fileFontStats.get(hit.file)??{below10:0,belowFloor:0,below9:0,below8:0,min:Infinity};
  stat.below10+=1;
  if(hit.value<9) stat.below9+=1;
  if(hit.value<8) stat.below8+=1;
  stat.min=Math.min(stat.min,hit.value);
  fileFontStats.set(hit.file,stat);
}
for(const hit of belowFloorFonts){
  const stat=fileFontStats.get(hit.file)??{below10:0,belowFloor:0,below9:0,below8:0,min:Infinity};
  stat.belowFloor+=1;
  fileFontStats.set(hit.file,stat);
}

console.log('\nSmall-font hotspots:');
for(const [file,stat] of [...fileFontStats.entries()].sort((a,b)=>b[1].below10-a[1].below10 || a[0].localeCompare(b[0]))){
  console.log('HOTSPOT ' + file + ' <10=' + stat.below10 + ' <9.5=' + stat.belowFloor + ' <9=' + stat.below9 + ' <8=' + stat.below8 + ' min=' + stat.min + 'px');
}

console.log(`\nTypography floor violations (<${READABLE_FONT_FLOOR}px): ${belowFloorFonts.length}`);
console.log(`Allowed symbolic text below floor: ${allowedBelowFloorFonts.length}`);
console.log(`Icon signals below 14px: ${tinyIcons.length}`);
for(const hit of tinyIcons) console.log(`ICON<14 ${hit.value}px ${hit.file}:${hit.line} ${hit.text}`);

console.log('\nTypography ownership:');
console.log('Hardcoded px font-size declarations:',fontSizeHardcodedUses);
console.log('Token-backed font-size declarations:',fontSizeTokenUses);

console.log('\nRuntime CSS selectors still targeting svg:',svgSelectors.length);
for(const hit of svgSelectors){
  console.log('SVGSELECTOR ' + hit.file + ':' + hit.line + ' ' + hit.selector + ' {' + hit.body + '}');
}

console.log('\nAudit note: raw size alone is not an automatic failure; classify each hit by semantic role before changing UI.');
