import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const SRC_ROOT='src';

const PARITY_METRIC_KEYS=[
  'linear','radial','shadow','filter','brightness','saturate',
  'composedColor','variableMath','backdrop','backdropTransition',
];
const ZERO_PARITY=Object.fromEntries(PARITY_METRIC_KEYS.map(key=>[key,0]));
const parityBaseline=(owner,values)=>({owner,...ZERO_PARITY,...values});

// W2.12 freeze point. Values are exact current debt, not budgets.
// Any Runtime reduction must tighten the matching entry in the same PR;
// any increase or new file with tracked debt fails audit:unity.
const UNITY_PARITY_BASELINE=new Map([
  ['src/tools/color-tool/modes/scheme/scheme-mode.css',parityBaseline('world-adapter',{shadow:3})],
  ['src/tools/color-tool/modes/surface/material-preset-workspace.css',parityBaseline('content-enhancement',{shadow:3})],
  ['src/fullscreen-actions.css',parityBaseline('ui-enhancement',{shadow:2,variableMath:2})],
  ['src/tools/blueprint-photography/blueprint-photography.css',parityBaseline('world-adapter',{shadow:2,variableMath:1})],
  ['src/selection/building-selection.css',parityBaseline('world-adapter',{shadow:2})],
  ['src/tools/color-tool/modes/lighting/lighting-mode.css',parityBaseline('world-adapter',{shadow:2})],
  ['src/tools/terrain-edit/terrain-edit.css',parityBaseline('world-adapter',{shadow:2})],
  ['src/tools/tree-placement/tree-placement.css',parityBaseline('world-adapter',{shadow:2,filter:2})],
  ['src/workspace/workspace-world-first-glass.css',parityBaseline('surface-enhancement',{shadow:2})],
  ['src/gameplay/gameplay-hud-layout.css',parityBaseline('layout-adapter',{variableMath:5})],
  ['src/tools/city-wall-gate/city-wall-gate.css',parityBaseline('layout-adapter',{variableMath:3})],
  ['src/tools/color-tool/modes/scheme/building-scheme-workspace.css',parityBaseline('content-enhancement',{shadow:1})],
  ['src/ui/ui-control-system.css',parityBaseline('layout-adapter',{variableMath:3})],
  ['src/gameplay/gameplay-context-panel.css',parityBaseline('layout-adapter',{variableMath:2})],
  ['src/ui/ui-motion-system.css',parityBaseline('layout-adapter',{variableMath:2})],
  ['src/gameplay/gameplay-corner-hud.css',parityBaseline('surface-enhancement',{variableMath:1,backdrop:2})],
  ['src/gameplay/gameplay-top-shell.css',parityBaseline('layout-adapter',{variableMath:1})],
  ['src/settings/settings-panel.css',parityBaseline('layout-adapter',{variableMath:1})],
  ['src/tools/city-wall-access-stair/city-wall-access-stair.css',parityBaseline('layout-adapter',{variableMath:1})],
  ['src/workspace.css',parityBaseline('surface-enhancement',{filter:1,backdrop:1})],
  ['src/gameplay/city-management.css',parityBaseline('surface-enhancement',{backdrop:1})],
  ['src/gameplay/management-panel-skin.css',parityBaseline('surface-enhancement',{backdrop:2})],
  ['src/new-game/new-game-space.css',parityBaseline('surface-enhancement',{backdrop:1})],
  ['src/loading/loading-space.css',parityBaseline('surface-enhancement',{backdrop:2})],
  ['src/ui/wanhu-surface-system.css',parityBaseline('shared-surface',{backdrop:36})],
]);

const APPROVED_BACKDROP_FILES=new Set(
  [...UNITY_PARITY_BASELINE.entries()]
    .filter(([,baseline])=>baseline.backdrop>0)
    .map(([file])=>file)
);

const SHARED_CONTROL_INTERNAL_OWNER_FILES=new Set([
  'src/ui/ui-control-system.css',
  // Temporary migration bridge; Phase 2 will reduce this to shared variables only.
  'src/gameplay/gameplay-context-panel.css',
]);
const SHARED_CONTROL_INTERNAL_SELECTOR=/\.(?:ui-slider__track|ui-slider__thumb|ui-stepper-button|ui-select__menu)\b|\.ui-toggle\s*>\s*i\b/;

const SHARED_SURFACE_MATERIAL_OWNER_FILES=new Set([
  'src/ui/wanhu-surface-system.css',
  // Existing Workspace legacy material owners are frozen until their dedicated cleanup pass.
  'src/workspace.css',
  'src/workspace/workspace-world-first-glass.css',
]);
const SHARED_SURFACE_ROOT_SELECTOR=/(?:^|,)\s*(?:\.gameplay-screen[^,{]*\s+)?\.(?:bottom-command-surface(?:--(?:lg|md|sm))?|gameplay-left-context-surface|workspace--catalog)\s*(?:$|,)/;
const SHARED_SURFACE_MATERIAL_PROPERTY=/(?:background(?:-color|-image)?|box-shadow|(?:-webkit-)?backdrop-filter)\s*:/;

const SHARED_MODAL_STYLE_OWNER_FILES=new Set([
  'src/ui/dialog/dialog.css',
  'src/ui/wanhu-surface-system.css',
  'src/ui/wanhu-theme-tokens.css',
]);
const SHARED_MODAL_STYLE_HOOK=/\.ui-modal-(?:backdrop|surface)\b|--wanhu-dialog-/;

const SHARED_WORKSPACE_CARD_CHROME_OWNER='src/workspace.css';
const SHARED_WORKSPACE_CARD_CHROME_SELECTOR=/\.(?:workspace-item-card__source|workspace-item-menu-trigger|workspace-item-menu)\b/;

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

function countNonNoneBoxShadows(text){
  return [...text.matchAll(/\bbox-shadow\s*:\s*([^;}\n]+)/gi)]
    .filter(match=>match[1].trim().toLowerCase()!=='none')
    .length;
}

function countNonNoneImageFilters(text){
  return [...text.matchAll(/(^|[;{]\s*)filter\s*:\s*([^;}\n]+)/gmi)]
    .filter(match=>match[2].trim().toLowerCase()!=='none')
    .length;
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
  nonNoneImageFilters:0,
  linearGradients:0,
  radialGradients:0,
  boxShadows:0,
  brightnessFilters:0,
  saturateFilters:0,
  composedColorVariables:0,
  variableMath:0,
  backdropTransitions:0,
  browserApis:0,
};
const backdropFiles=new Set();
const gridFiles=new Set();
const parityByFile=new Map();
const lucideIcons=new Set();
const lucideRuntimeFiles=new Set();

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

  if (!file.endsWith('.css') && /\bLucideIcon\b/.test(text)) {
    errors.push(`${file}: legacy LucideIcon type name is retired. Use UiIconId / UiIconComponent from the local PNG icon contract.`);
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

  if (/archive-confirm-(?:layer|dialog)/.test(text)) {
    errors.push(`${file}: retired Archive private confirm modal must not return. Route blocking confirmation through the shared Dialog system.`);
  }

  if (file === 'src/styles.css' && /\.parameter-row\s*\{[^}]*grid-template-columns\s*:[^;}]*29px[^;}]*29px/s.test(text)) {
    errors.push(`${file}: Legacy five-column ParameterRow layout is retired. RuntimeParameterRow must be Label + NumericSliderField.`);
  }

  if(file.endsWith('.css')){
    if(file !== SHARED_WORKSPACE_CARD_CHROME_OWNER && SHARED_WORKSPACE_CARD_CHROME_SELECTOR.test(text)){
      errors.push(`${file}: shared Workspace Item Card source badge / menu chrome must be owned by src/workspace.css. Feature CSS may own only Compact/Media content geometry and business states.`);
    }

    if(!SHARED_MODAL_STYLE_OWNER_FILES.has(file) && SHARED_MODAL_STYLE_HOOK.test(text)){
      errors.push(`${file}: shared Modal backdrop / surface material must remain owned by dialog.css + wanhu-surface-system.css + theme tokens. Feature CSS may own modal geometry and content layout only.`);
    }

    if(SHARED_CONTROL_INTERNAL_SELECTOR.test(text) && !SHARED_CONTROL_INTERNAL_OWNER_FILES.has(file)){
      errors.push(`${file}: shared Slider / Stepper / Select / Toggle internals must be owned by ui-control-system.css. Use semantic variables or an approved shared adapter instead.`);
    }

    if(!SHARED_SURFACE_MATERIAL_OWNER_FILES.has(file) && !file.startsWith('src/review/')){
      const cssForRules=text.replace(/\/\*[\s\S]*?\*\//g,(comment)=>comment.replace(/[^\n]/g,' '));
      for(const match of cssForRules.matchAll(/([^{}]+)\{([^{}]*)\}/g)){
        const selector=match[1].trim();
        const body=match[2];
        if(SHARED_SURFACE_ROOT_SELECTOR.test(selector) && SHARED_SURFACE_MATERIAL_PROPERTY.test(body)){
          const line=cssForRules.slice(0,match.index).split('\n').length;
          errors.push(`${file}:${line} shared Workspace / Context / Bottom Command material must be owned by wanhu-surface-system.css. Feature CSS may own geometry and foreground only.`);
        }
      }
    }

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

    // Unity 6000.6.2f1 Visual Parity inventory + W2.12 per-file Ratchet.
    const parity={
      linear:count(/linear-gradient\s*\(/gi,text),
      radial:count(/radial-gradient\s*\(/gi,text),
      shadow:countNonNoneBoxShadows(text),
      filter:countNonNoneImageFilters(text),
      brightness:count(/\bbrightness\s*\(/gi,text),
      saturate:count(/\bsaturate\s*\(/gi,text),
      composedColor:count(/\brgba?\s*\(\s*var\s*\(/gi,text),
      variableMath:count(/\b(?:calc|min|max|clamp)\s*\([^;{}\n]*var\s*\(/gi,text),
      backdrop:backdropCount,
      backdropTransition:count(/\btransition(?:-property)?\s*:[^;{}\n]*backdrop-filter\b/gi,text),
    };
    if(Object.values(parity).some(Boolean))parityByFile.set(file,parity);
    metrics.linearGradients+=parity.linear;
    metrics.radialGradients+=parity.radial;
    metrics.boxShadows+=parity.shadow;
    metrics.nonNoneImageFilters+=parity.filter;
    metrics.brightnessFilters+=parity.brightness;
    metrics.saturateFilters+=parity.saturate;
    metrics.composedColorVariables+=parity.composedColor;
    metrics.variableMath+=parity.variableMath;
    metrics.backdropTransitions+=parity.backdropTransition;

    if(/@import\s+url\(/.test(text)){
      warnings.push(`${file}: external web-font import is Web-only; Unity must use imported font assets.`);
    }
  }else{
    metrics.browserApis+=count(/\b(?:window|document)\./g,text);
    for(const match of text.matchAll(/import\s*{([^}]*)}\s*from\s*['"]lucide-react['"]/g)){
      lucideRuntimeFiles.add(file);
      for(const raw of match[1].split(',')){
        const token=raw.trim();
        if(!token || /^type\s+/.test(token))continue;
        const name=token.split(/\s+as\s+/)[0]?.trim();
        if(name && name!=='LucideIcon')lucideIcons.add(name);
      }
    }
    if(/from\s*['"]lucide-react['"]/.test(text))lucideRuntimeFiles.add(file);
  }
}

if(lucideRuntimeFiles.size){
  errors.push(`Lucide Runtime imports are frozen out: ${lucideRuntimeFiles.size} src files still import lucide-react. Runtime must consume committed PNG assets through the local icon adapter / UiIconId contract.`);
}

// Exact ratchet: decreases must tighten the baseline immediately, so old headroom cannot return later.
for(const [file,baseline] of UNITY_PARITY_BASELINE){
  const current=parityByFile.get(file) ?? ZERO_PARITY;
  for(const key of PARITY_METRIC_KEYS){
    if(current[key]>baseline[key]){
      errors.push(`${file}: Unity 6.6 parity ratchet regression for ${key}: current=${current[key]} baseline=${baseline[key]} owner=${baseline.owner}.`);
    }else if(current[key]<baseline[key]){
      errors.push(`${file}: Unity 6.6 parity baseline is stale for ${key}: current=${current[key]} baseline=${baseline[key]}. Tighten UNITY_PARITY_BASELINE in the same PR.`);
    }
  }
}
for(const [file,current] of parityByFile){
  if(UNITY_PARITY_BASELINE.has(file))continue;
  const active=PARITY_METRIC_KEYS.filter(key=>current[key]>0).map(key=>`${key}=${current[key]}`);
  if(active.length){
    errors.push(`${file}: new unclassified Unity 6.6 parity debt is forbidden: ${active.join(', ')}. Remove it or explicitly classify the existing need before merging.`);
  }
}
if(metrics.cssGrid){
  warnings.push(`CSS Grid migration debt: ${metrics.cssGrid} declarations across ${gridFiles.size} files. Keep every layout expressible as nested Flex/UXML rows and columns.`);
}
if(metrics.pseudoElements){
  warnings.push(`Pseudo-element migration debt: ${metrics.pseudoElements} selectors. Structural markers should become real elements before Unity migration.`);
}
if(metrics.nonNoneImageFilters){
  warnings.push(`CSS filter migration debt is frozen by per-file Ratchet: non-none=${metrics.nonNoneImageFilters}, total declarations=${metrics.imageFilters}.`);
}
if(metrics.linearGradients || metrics.radialGradients){
  warnings.push(`Unity 6000.6.2f1 Visual Parity ratchet violation candidate: linear=${metrics.linearGradients}, radial=${metrics.radialGradients}.`);
}
if(metrics.boxShadows){
  warnings.push(`CSS box-shadow migration debt is frozen by per-file Ratchet: ${metrics.boxShadows} declarations. Unity hierarchy must remain readable without them.`);
}
if(metrics.brightnessFilters || metrics.saturateFilters){
  warnings.push(`Custom filter dependency: brightness=${metrics.brightnessFilters}, saturate=${metrics.saturateFilters}. Keep these centralized and non-essential to control state readability.`);
}
if(metrics.composedColorVariables || metrics.variableMath){
  warnings.push(`USS variable composition debt is frozen by per-file Ratchet: rgb/rgba(var())=${metrics.composedColorVariables}, math-with-var=${metrics.variableMath}.`);
}
if(metrics.backdropTransitions){
  warnings.push(`Backdrop transition debt: ${metrics.backdropTransitions} declarations reference backdrop-filter in transitions. Blur radius must not be a required interaction animation.`);
}
if(metrics.browserApis){
  warnings.push(`Browser API adapters: ${metrics.browserApis} references. Keep them at Web adapter boundaries; do not let them own game state.`);
}
if(backdropFiles.size){
  warnings.push(`Backdrop blur debt is frozen to ${backdropFiles.size} approved owner files and exact per-file declaration counts.`);
}

console.log('Unity UI Toolkit migration audit');
console.log('--------------------------------');
console.log(`Runtime files scanned: ${files.length}`);
console.log(`Lucide source icons in use: ${lucideIcons.size}`);
console.log(`Lucide runtime files: ${lucideRuntimeFiles.size}`);
console.log(`CSS Grid declarations: ${metrics.cssGrid}`);
console.log(`Pseudo-element selectors: ${metrics.pseudoElements}`);
console.log(`Backdrop filter declarations: ${metrics.backdropFilters}`);
console.log(`CSS filter declarations: ${metrics.imageFilters}`);
console.log(`Non-none CSS filters: ${metrics.nonNoneImageFilters}`);
console.log(`Linear gradients: ${metrics.linearGradients}`);
console.log(`Radial gradients: ${metrics.radialGradients}`);
console.log(`Box shadows: ${metrics.boxShadows}`);
console.log(`brightness() filters: ${metrics.brightnessFilters}`);
console.log(`saturate() filters: ${metrics.saturateFilters}`);
console.log(`rgb/rgba(var()) compositions: ${metrics.composedColorVariables}`);
console.log(`CSS math with var(): ${metrics.variableMath}`);
console.log(`Backdrop filter transitions: ${metrics.backdropTransitions}`);
console.log(`Browser API references: ${metrics.browserApis}`);
console.log(`Unity parity ratchet files: ${UNITY_PARITY_BASELINE.size}`);

if(lucideIcons.size){
  console.log('\nIcon source manifest:');
  console.log([...lucideIcons].sort().join(', '));
}

if(parityByFile.size){
  console.log('\nUnity 6.6 Visual Parity inventory by file:');
  const rows=[...parityByFile.entries()].map(([file,value])=>({
    file,
    value,
    score:value.linear*5+value.radial*5+value.shadow*3+value.filter*4+value.brightness*4+value.saturate*4+value.backdropTransition*4+value.composedColor*2+value.variableMath+value.backdrop,
  })).sort((a,b)=>b.score-a.score || a.file.localeCompare(b.file));
  for(const row of rows){
    const v=row.value;
    console.log(`- ${row.file}: owner=${UNITY_PARITY_BASELINE.get(row.file)?.owner ?? 'UNCLASSIFIED'}, linear=${v.linear}, radial=${v.radial}, shadow=${v.shadow}, filter=${v.filter}, brightness=${v.brightness}, saturate=${v.saturate}, rgbaVar=${v.composedColor}, mathVar=${v.variableMath}, backdrop=${v.backdrop}, backdropTransition=${v.backdropTransition}, score=${row.score}`);
  }
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
