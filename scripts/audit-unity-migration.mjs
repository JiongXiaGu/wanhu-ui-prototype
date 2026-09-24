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
  'src/gameplay/weather-mist-glass.css',
  'src/new-game/new-game-space.css',
  'src/loading/loading-space.css',
  'src/ui/asset-inspector/asset-inspector.css',
  'src/ui/ui-control-system.css',
  'src/ui/ui-visual-system.css',
  'src/ui/wanhu-surface-system.css',
]);

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

    // Unity 6000.6.2f1 compatibility telemetry.
    // These are intentionally warning-only while Theme / Surface / Control cleanup is still active.
    // After visual governance converges, freeze the measured baseline and convert suitable metrics to ratchets.
    metrics.linearGradients+=count(/linear-gradient\s*\(/gi,text);
    metrics.radialGradients+=count(/radial-gradient\s*\(/gi,text);
    metrics.boxShadows+=count(/\bbox-shadow\s*:/gi,text);
    metrics.brightnessFilters+=count(/\bbrightness\s*\(/gi,text);
    metrics.saturateFilters+=count(/\bsaturate\s*\(/gi,text);
    metrics.composedColorVariables+=count(/\brgba?\s*\(\s*var\s*\(/gi,text);
    metrics.variableMath+=count(/\b(?:calc|min|max|clamp)\s*\([^;{}\n]*var\s*\(/gi,text);
    metrics.backdropTransitions+=count(/\btransition(?:-property)?\s*:[^;{}\n]*backdrop-filter\b/gi,text);

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
if(metrics.cssGrid){
  warnings.push(`CSS Grid migration debt: ${metrics.cssGrid} declarations across ${gridFiles.size} files. Keep every layout expressible as nested Flex/UXML rows and columns.`);
}
if(metrics.pseudoElements){
  warnings.push(`Pseudo-element migration debt: ${metrics.pseudoElements} selectors. Structural markers should become real elements before Unity migration.`);
}
if(metrics.imageFilters){
  warnings.push(`CSS filter migration debt: ${metrics.imageFilters} declarations. Plan Tint/Overlay/Material equivalents.`);
}
if(metrics.linearGradients || metrics.radialGradients){
  warnings.push(`Unity 6000.6.2f1 gradient compatibility debt: linear=${metrics.linearGradients}, radial=${metrics.radialGradients}. Do not add new visual dependencies; audit remains telemetry-only until the current color/surface cleanup converges.`);
}
if(metrics.boxShadows){
  warnings.push(`CSS box-shadow migration debt: ${metrics.boxShadows} declarations. Unity hierarchy must remain readable with solid tint/alpha/edge even when Web shadow is removed.`);
}
if(metrics.brightnessFilters || metrics.saturateFilters){
  warnings.push(`Custom filter dependency: brightness=${metrics.brightnessFilters}, saturate=${metrics.saturateFilters}. Keep these centralized and non-essential to control state readability.`);
}
if(metrics.composedColorVariables || metrics.variableMath){
  warnings.push(`USS variable composition debt: rgb/rgba(var())=${metrics.composedColorVariables}, math-with-var=${metrics.variableMath}. Prefer final semantic token values for Unity migration.`);
}
if(metrics.backdropTransitions){
  warnings.push(`Backdrop transition debt: ${metrics.backdropTransitions} declarations reference backdrop-filter in transitions. Blur radius must not be a required interaction animation.`);
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
console.log(`Lucide runtime files: ${lucideRuntimeFiles.size}`);
console.log(`CSS Grid declarations: ${metrics.cssGrid}`);
console.log(`Pseudo-element selectors: ${metrics.pseudoElements}`);
console.log(`Backdrop filter declarations: ${metrics.backdropFilters}`);
console.log(`CSS filter declarations: ${metrics.imageFilters}`);
console.log(`Linear gradients: ${metrics.linearGradients}`);
console.log(`Radial gradients: ${metrics.radialGradients}`);
console.log(`Box shadows: ${metrics.boxShadows}`);
console.log(`brightness() filters: ${metrics.brightnessFilters}`);
console.log(`saturate() filters: ${metrics.saturateFilters}`);
console.log(`rgb/rgba(var()) compositions: ${metrics.composedColorVariables}`);
console.log(`CSS math with var(): ${metrics.variableMath}`);
console.log(`Backdrop filter transitions: ${metrics.backdropTransitions}`);
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
