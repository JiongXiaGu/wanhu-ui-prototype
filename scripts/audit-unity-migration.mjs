import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const SRC_ROOT='src';
const APPROVED_BACKDROP_FILES=new Set([
  'src/styles.css',
  'src/workspace.css',
  'src/workspace/workspace-world-first-glass.css',
  'src/gameplay/gameplay-corner-hud.css',
  'src/gameplay/gameplay-top-shell.css',
  'src/gameplay/city-management.css',
  'src/gameplay/management-panel-skin.css',
  'src/gameplay-refine.css',
  'src/gameplay/weather-mist-glass.css',
  'src/gameplay/operation-hints-refined.css',
  'src/operation-hints.css',
  'src/new-game/new-game-space.css',
  'src/loading/loading-space.css',
  'src/ui/asset-inspector/asset-inspector.css',
  'src/ui/ui-control-system.css',
  'src/ui/ui-visual-system.css',
  'src/ui/wanhu-surface-system.css',
]);

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

function count(re,text){
  return [...text.matchAll(re)].length;
}

function lineHits(text,re){
  return text.split('\n')
    .map((line,index)=>({line:index+1,text:line.trim()}))
    .filter(item=>re.test(item.text));
}

const files=(await walk(SRC_ROOT)).filter(file=>
  /\.(css|tsx?|jsx?)$/.test(file)
  && !file.startsWith('src/review/')
);
const errors=[];
const warnings=[];
const metrics={
  cssGrid:0,
  pseudoElements:0,
  backdropFilters:0,
  imageFilters:0,
  browserApis:0,
};
const backdropFiles=new Set();
const gridFiles=new Set();
const lucideIcons=new Set();

for(const file of files){
  const text=await readFile(file,'utf8');

  if (
    file.startsWith('src/tools/material-palette/')
    || file.startsWith('src/tools/light-adjustment/')
    || file.startsWith('src/tools/building-scheme/')
  ) {
    errors.push(`${file}: retired color-tool path. Surface / Lighting / Scheme must live under src/tools/color-tool/.`);
  }

  if (
    file === 'src/tools/color-tool/modes/surface/MaterialSchemeWorkspace.tsx'
    || file === 'src/tools/color-tool/modes/surface/material-scheme-workspace.css'
  ) {
    errors.push(`${file}: retired MaterialSchemeWorkspace rename residue. Surface preset browsing is owned by MaterialPresetWorkspace.`);
  }

  if (file === 'src/main.tsx' && !text.includes("import './ui/color/color-parameter-field.css';")) {
    errors.push(`${file}: shared ColorParameterField stylesheet must be part of the canonical runtime cascade.`);
  }

  if (!file.endsWith('.css')) {
    const legacyColorIdentifiers = [
      'MaterialPaletteMode',
      'materialPaletteMode',
      'ENTER_MATERIAL_PALETTE',
      'SET_MATERIAL_PALETTE_MODE',
      'MaterialPaletteTool',
      'MaterialPaletteDock',
      'MaterialSchemeWorkspace',
    ];
    for (const marker of legacyColorIdentifiers) {
      if (text.includes(marker)) {
        errors.push(`${file}: retired color-tool identifier "${marker}". Use ColorTool ownership and ColorToolMode.`);
      }
    }
  }

  if (
    file.startsWith('src/tools/color-tool/modes/')
    && file.endsWith('.css')
    && /\.workspace--catalog\s+\.workspace-(?:primary-rail|catalog|context-filter|content-stage|content-row|content-pager)\b/.test(text)
  ) {
    errors.push(`${file}: mode CSS must not own shared Catalog geometry. Move layout to src/workspace/workspace-catalog.css and keep only feature modifiers here.`);
  }

  if (
    file.startsWith('src/tools/color-tool/modes/')
    && file.endsWith('.css')
    && /\.(?:ui-numeric-slider-field|ui-color-parameter-field|gameplay-left-context-surface)\b/.test(text)
  ) {
    errors.push(`${file}: mode CSS must not restyle shared NumericSliderField / ColorParameterField / LeftContextPanel Surface ownership.`);
  }

  const retiredColorCssMarkers = [
    'material-palette-prototype',
    'material-palette-surface',
    'material-palette-section',
    'material-palette-workflow-bottom',
  ];
  for (const marker of retiredColorCssMarkers) {
    if (text.includes(marker)) {
      errors.push(`${file}: retired Color Tool CSS hook "${marker}" must not remain in runtime ownership.`);
    }
  }

  const legacyMarkers = ['tool-overlay', 'tool-body'];
  for (const marker of legacyMarkers) {
    if (text.includes(marker)) {
      errors.push(`${file}: Legacy runtime class "${marker}" is retired. Use LeftContextPanel / PlacementContextPanel ownership instead.`);
    }
  }

  if (file === 'src/styles.css' && /\.parameter-row\s*\{[^}]*grid-template-columns\s*:[^;}]*29px[^;}]*29px/s.test(text)) {
    errors.push(`${file}: Legacy five-column ParameterRow layout is retired. RuntimeParameterRow must be Label + NumericSliderField.`);
  }

  if(file.endsWith('.css')){
    const hasHits=lineHits(text,/:has\(/);
    for(const hit of hasHits)errors.push(`${file}:${hit.line} CSS :has() is forbidden in runtime prototype structure.`);

    const implicitTransitionHits=lineHits(text,/transition\s*:\s*(?:\d*\.\d+|\d+)(?:ms|s)\b/);
    for(const hit of implicitTransitionHits)errors.push(`${file}:${hit.line} transition must name properties and consume Motion tokens.`);

    const backdropCount=count(/(?:-webkit-)?backdrop-filter\s*:/g,text);
    if(backdropCount){
      metrics.backdropFilters+=backdropCount;
      backdropFiles.add(file);
      if(!APPROVED_BACKDROP_FILES.has(file)){
        errors.push(`${file}: new backdrop-filter owner is not approved. Use Surface System / shared scene blur mapping instead.`);
      }
    }

    const gridCount=count(/display\s*:\s*grid|grid-template(?:-columns|-rows)?\s*:|grid-column\s*:|grid-row\s*:/g,text);
    if(gridCount){
      metrics.cssGrid+=gridCount;
      gridFiles.add(file);
    }

    metrics.pseudoElements+=count(/::before|::after/g,text);
    metrics.imageFilters+=count(/(^|[;{]\s*)filter\s*:/gm,text);

    if(/@import\s+url\(/.test(text)){
      warnings.push(`${file}: external web-font import is Web-only; Unity must use imported font assets.`);
    }
  }else{
    metrics.browserApis+=count(/\b(?:window|document)\./g,text);
    for(const match of text.matchAll(/import\s*{([^}]*)}\s*from\s*['"]lucide-react['"]/g)){
      for(const raw of match[1].split(',')){
        const name=raw.trim().split(/\s+as\s+/)[0]?.trim();
        if(name)lucideIcons.add(name);
      }
    }
  }
}

if(metrics.cssGrid){
  warnings.push(`CSS Grid migration debt: ${metrics.cssGrid} declarations across ${gridFiles.size} files. Keep every layout expressible as nested Flex/UXML rows and columns.`);
}
if(metrics.pseudoElements){
  warnings.push(`Pseudo-element migration debt: ${metrics.pseudoElements} selectors. Structural markers should become real elements before Unity migration.`);
}
if(metrics.imageFilters){
  warnings.push(`CSS filter migration debt: ${metrics.imageFilters} declarations. Plan Tint/Overlay/Material equivalents.`);
}
if(metrics.browserApis){
  warnings.push(`Browser API adapters: ${metrics.browserApis} references. Keep them at Web adapter boundaries; do not let them own game state.`);
}
if(backdropFiles.size){
  warnings.push(`Backdrop blur debt is contained to ${backdropFiles.size} approved files; do not add new owners.`);
}

console.log('Unity UI Toolkit migration audit');
console.log('--------------------------------');
console.log(`Runtime files scanned: ${files.length}`);
console.log(`Lucide source icons in use: ${lucideIcons.size}`);
console.log(`CSS Grid declarations: ${metrics.cssGrid}`);
console.log(`Pseudo-element selectors: ${metrics.pseudoElements}`);
console.log(`Backdrop filter declarations: ${metrics.backdropFilters}`);
console.log(`CSS filter declarations: ${metrics.imageFilters}`);
console.log(`Browser API references: ${metrics.browserApis}`);

if(lucideIcons.size){
  console.log('\nIcon source manifest:');
  console.log([...lucideIcons].sort().join(', '));
}

if(warnings.length){
  console.log('\nTracked migration debt:');
  for(const warning of warnings)console.log(`- ${warning}`);
}

if(errors.length){
  console.error('\nMigration guard failures:');
  for(const error of errors)console.error(`- ${error}`);
  process.exitCode=1;
}else{
  console.log('\nMigration guard: PASS');
}
