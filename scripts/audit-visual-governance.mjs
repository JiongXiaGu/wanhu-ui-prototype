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

/* Phase 4 Batch 18：普通 Button / Dialog Button 直接消费正式 Control 状态，不再维护第二套边框别名。 */
const RETIRED_PHASE4_CONTROL_VISUAL_ALIASES=[
  '--ui-control-hover','--ui-control-border','--ui-control-border-hover',
];
const RETIRED_PHASE4_CONTROL_VISUAL_ALIAS_MARKERS=RETIRED_PHASE4_CONTROL_VISUAL_ALIASES.map(name=>({
  name,re:new RegExp(String.raw`(?<![-\\w])${name}(?![-\\w])`,'g'),
}));

/* Phase 4 Batch 19：Control recipe 归 ui-control-system.css；旧 Visual System 不再拥有 Segmented skin。 */
const CONTROL_RECIPE_OWNER_FILE='src/ui/ui-control-system.css';
const CONTROL_RECIPE_VARIABLES=[
  '--ui-control-radius','--ui-control-radius-inner',
  '--ui-segment-surface','--ui-segment-border','--ui-segment-hover',
  '--ui-segment-active-top','--ui-segment-active-bottom',
];
const CONTROL_RECIPE_VARIABLE_DECLARATION_MARKERS=CONTROL_RECIPE_VARIABLES.map(name=>({
  name,re:new RegExp(escapeRegExp(name)+String.raw`\s*:`,'g'),
}));
const RETIRED_SEGMENTED_OWNER_FILE='src/ui/ui-visual-system.css';
const RETIRED_SEGMENTED_OWNER_SELECTORS=[
  '.game-canvas .segment','.game-canvas .bp-segment','.game-canvas .new-game-segmented',
];

/* Phase 4 Batch 20：Dialog Choice Dropdown 改为共享 SelectControl，私有 Trigger / Menu skin 退役。 */
const RETIRED_DIALOG_SELECT_OWNER_FILE='src/ui/dialog/dialog.css';
const RETIRED_DIALOG_SELECT_OWNER_SELECTORS=[
  '.ui-dialog-choice-trigger','.ui-dialog-choice-menu',
];

/* HUD 前景别名已退役；只枚举完整名称，不禁止仍在使用的材质、背景或几何变量。 */
const RETIRED_HUD_FOREGROUND_ALIASES=[
  '--hud-text','--hud-text-secondary','--hud-icon','--hud-accent','--hud-accent-text',
  '--wanhu-hud-paper','--wanhu-hud-text','--wanhu-hud-muted','--wanhu-hud-faint','--wanhu-hud-gold',
];
const RETIRED_HUD_FOREGROUND_ALIAS_MARKERS=RETIRED_HUD_FOREGROUND_ALIASES.map(name=>({
  name,re:new RegExp(String.raw`(?<![-\w])${name}(?![-\w])`,'g'),
}));

/* Phase 2 Batch 13：Tonal / Identity / Character 已确认无 Runtime Consumer，完整退役。 */
const RETIRED_SEMANTIC_COMPATIBILITY_ALIASES=[
  '--wanhu-tonal-ink-950','--wanhu-tonal-ink-900','--wanhu-tonal-ink-800',
  '--wanhu-tonal-paper','--wanhu-tonal-secondary','--wanhu-tonal-tertiary',
  '--wanhu-tonal-brass','--wanhu-tonal-brass-hi','--wanhu-tonal-brass-soft','--wanhu-tonal-cinnabar',
  '--wanhu-identity-paper','--wanhu-identity-text','--wanhu-identity-secondary','--wanhu-identity-muted',
  '--wanhu-identity-faint','--wanhu-identity-gold','--wanhu-identity-gold-hi',
  '--wanhu-character-gold','--wanhu-character-gold-hi','--wanhu-character-gold-soft',
  '--wanhu-character-joint','--wanhu-character-rule','--wanhu-character-beam',
];
const RETIRED_SEMANTIC_COMPATIBILITY_ALIAS_MARKERS=RETIRED_SEMANTIC_COMPATIBILITY_ALIASES.map(name=>({
  name,re:new RegExp(String.raw`(?<![-\w])${name}(?![-\w])`,'g'),
}));

/* Phase 3 Batch 14：Work Surface 旧桥接名已无 Consumer，Surface 只保留正式 Recipe。 */
const RETIRED_WORK_SURFACE_COMPATIBILITY_ALIASES=[
  '--workspace-glass-surface','--workspace-glass-body','--workspace-glass-rail',
  '--workspace-glass-card','--workspace-glass-card-hover',
  '--workspace-edge','--workspace-rule','--workspace-gold','--workspace-gold-soft',
];
const RETIRED_WORK_SURFACE_COMPATIBILITY_ALIAS_MARKERS=RETIRED_WORK_SURFACE_COMPATIBILITY_ALIASES.map(name=>({
  name,re:new RegExp(String.raw`(?<![-\w])${name}(?![-\w])`,'g'),
}));

/* Phase 3 Batch 15：Environment 不再拥有 Context Surface 的兼容桥接。 */
const RETIRED_CONTEXT_SURFACE_COMPATIBILITY_ALIASES=[
  '--weather-mist-surface','--weather-mist-card','--weather-mist-card-hover',
  '--weather-edge','--weather-rule',
];
const RETIRED_CONTEXT_SURFACE_COMPATIBILITY_ALIAS_MARKERS=RETIRED_CONTEXT_SURFACE_COMPATIBILITY_ALIASES.map(name=>({
  name,re:new RegExp(String.raw`(?<![-\w])${name}(?![-\w])`,'g'),
}));

/* Weather 内容变量属于 Feature 内容层，不允许 Surface System 再次覆盖。 */
const WEATHER_CONTENT_VARIABLES=[
  '--weather-paper','--weather-text','--weather-muted','--weather-faint',
  '--weather-gold','--weather-gold-focus','--weather-gold-soft',
];
const WEATHER_CONTENT_VARIABLE_MARKERS=WEATHER_CONTENT_VARIABLES.map(name=>({
  name,re:new RegExp(String.raw`(?<![-\w])${name}(?![-\w])`,'g'),
}));

/* Phase 3 Batch 16：Global Space Footer 的早期材质桥接完整退役。 */
const RETIRED_GLOBAL_SPACE_SURFACE_ALIASES=[
  '--ui-footer-surface-top','--ui-footer-surface-bottom','--ui-footer-backdrop',
];
const RETIRED_GLOBAL_SPACE_SURFACE_ALIAS_MARKERS=RETIRED_GLOBAL_SPACE_SURFACE_ALIASES.map(name=>({
  name,re:new RegExp(String.raw`(?<![-\w])${name}(?![-\w])`,'g'),
}));

/* Phase 3 Batch 17：HUD 旧材质桥接与局部 Surface Owner 退役。 */
const RETIRED_HUD_SURFACE_ALIASES=[
  '--hud-glass-filter','--hud-glass-filter-soft',
  '--hud-surface-ambient-top','--hud-surface-ambient-bottom',
  '--hud-surface-context-top','--hud-surface-context-bottom',
  '--hud-surface-work-top','--hud-surface-work-bottom',
  '--hud-surface-blocking-top','--hud-surface-blocking-bottom',
  '--hud-surface-primary-top','--hud-surface-primary-bottom',
  '--hud-surface-secondary-top','--hud-surface-secondary-bottom',
  '--hud-surface-tertiary-top','--hud-surface-tertiary-bottom',
  '--hud-border-strong','--hud-border-soft','--hud-rule',
  '--hud-shadow-primary','--hud-shadow-secondary','--hud-accent-bg',
  '--wanhu-hud-filter','--wanhu-hud-filter-soft',
];
const RETIRED_HUD_SURFACE_ALIAS_MARKERS=RETIRED_HUD_SURFACE_ALIASES.map(name=>({
  name,re:new RegExp(String.raw`(?<![-\w])${name}(?![-\w])`,'g'),
}));

const HUD_SURFACE_OWNERSHIP_RULES=[
  {file:'src/gameplay/gameplay-top-shell.css',selectors:[
    '.gameplay-top-status','.gameplay-top-shell.has-navigation .gameplay-top-status',
    '.gameplay-top-speed-button.is-active','.gameplay-top-map-panel','.gameplay-top-map-panel>header',
  ]},
  {file:'src/gameplay/gameplay-corner-hud.css',selectors:[
    '.gameplay-system-menu-button','.gameplay-system-menu-button:hover',
  ]},
];
const RETIRED_EDGE_ELEVATION_OWNER_FILE='src/ui/wanhu-edge-elevation.css';

const SURFACE_MATERIAL_PROPERTIES=[
  'background','background-color','background-image',
  'border-color','border-top-color','border-right-color','border-bottom-color','border-left-color',
  'box-shadow','backdrop-filter','-webkit-backdrop-filter',
];

const SURFACE_OWNERSHIP_RULES=[
  {file:'src/archive/archive-panel.css',selectors:['.archive-space','.archive-space--pause','.global-space-header','.global-space-footer']},
  {file:'src/archive/save-game-space.css',selectors:['.save-game-space']},
  {file:'src/new-game/new-game-space.css',selectors:['.new-game-space']},
  {file:'src/settings/settings-panel.css',selectors:['.settings-space']},
  {file:'src/ui/ui-visual-system.css',selectors:['.global-space-footer']},
];

function escapeRegExp(value){
  const special='\\^$.*+?()[]{}|/';
  return [...value].map(char=>special.includes(char)?String.fromCharCode(92)+char:char).join('');
}

function selectorMaterialProperties(text,selector){
  const blockRe=new RegExp(escapeRegExp(selector)+String.raw`\s*\{([^}]*)\}`,'gis');
  const hits=[];
  for(const block of text.matchAll(blockRe)){
    const body=block[1];
    for(const property of SURFACE_MATERIAL_PROPERTIES){
      const propertyRe=new RegExp(String.raw`(?:^|;)\s*`+escapeRegExp(property)+String.raw`\s*:`,'i');
      if(propertyRe.test(body))hits.push(property);
    }
  }
  return [...new Set(hits)];
}

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

  const controlVisualAliases=[];
  for(const marker of RETIRED_PHASE4_CONTROL_VISUAL_ALIAS_MARKERS){
    const count=countMatches(text,marker.re);
    if(count)controlVisualAliases.push({name:marker.name,count});
  }
  if(controlVisualAliases.length){
    errors.push(
      file + ': retired Phase 4 control visual aliases may not return. '
      + 'Use canonical --wanhu-control-* state tokens; keep component-specific geometry / recipes local. '
      + controlVisualAliases.map(marker=>marker.name + '=' + marker.count).join('; ')
    );
  }

  const controlRecipeOwnershipViolations=[];
  if(file!==CONTROL_RECIPE_OWNER_FILE){
    for(const marker of CONTROL_RECIPE_VARIABLE_DECLARATION_MARKERS){
      const count=countMatches(text,marker.re);
      if(count)controlRecipeOwnershipViolations.push({name:marker.name,count});
    }
  }

  const retiredSegmentedOwnerSelectors=[];
  if(file===RETIRED_SEGMENTED_OWNER_FILE){
    for(const selector of RETIRED_SEGMENTED_OWNER_SELECTORS){
      const selectorRe=new RegExp(escapeRegExp(selector)+String.raw`(?:\s*[>,:+.~#\[]|\s*\{|\s*,)`,'i');
      if(selectorRe.test(text))retiredSegmentedOwnerSelectors.push(selector);
    }
  }

  if(controlRecipeOwnershipViolations.length || retiredSegmentedOwnerSelectors.length){
    errors.push(
      file + ': shared Control recipe ownership must stay in ui-control-system.css. '
      + 'Do not restore Segmented skin / shared Control recipe declarations in ui-visual-system.css or Feature CSS. '
      + controlRecipeOwnershipViolations.map(marker=>marker.name + '=' + marker.count).join('; ')
      + (retiredSegmentedOwnerSelectors.length
        ? (controlRecipeOwnershipViolations.length ? '; ' : '') + 'selectors=' + retiredSegmentedOwnerSelectors.join(', ')
        : '')
    );
  }

  const retiredDialogSelectOwnerSelectors=[];
  if(file===RETIRED_DIALOG_SELECT_OWNER_FILE){
    for(const selector of RETIRED_DIALOG_SELECT_OWNER_SELECTORS){
      const selectorRe=new RegExp(escapeRegExp(selector)+String.raw`(?:\s*[>,:+.~#\[]|\s*\{|\s*,)`,'i');
      if(selectorRe.test(text))retiredDialogSelectOwnerSelectors.push(selector);
    }
    if(retiredDialogSelectOwnerSelectors.length){
      errors.push(
        file + ': Dialog Choice Dropdown must consume shared SelectControl skin from ui-control-system.css. '
        + 'Dialog CSS may keep density / geometry modifiers on .ui-dialog-choice-select only. '
        + 'selectors=' + retiredDialogSelectOwnerSelectors.join(', ')
      );
    }
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

  const semanticCompatibilityAliases=[];
  for(const marker of RETIRED_SEMANTIC_COMPATIBILITY_ALIAS_MARKERS){
    const count=countMatches(text,marker.re);
    if(count)semanticCompatibilityAliases.push({name:marker.name,count});
  }
  if(semanticCompatibilityAliases.length){
    errors.push(
      file + ': retired Tonal / Identity / Character compatibility aliases may not return. '
      + 'Use canonical --wanhu-color-* tokens or the existing component owner instead of recreating a compatibility layer. '
      + semanticCompatibilityAliases.map(marker=>marker.name + '=' + marker.count).join('; ')
    );
  }

  const workSurfaceCompatibilityAliases=[];
  for(const marker of RETIRED_WORK_SURFACE_COMPATIBILITY_ALIAS_MARKERS){
    const count=countMatches(text,marker.re);
    if(count)workSurfaceCompatibilityAliases.push({name:marker.name,count});
  }
  if(workSurfaceCompatibilityAliases.length){
    errors.push(
      file + ': retired Work Surface compatibility aliases may not return. '
      + 'Use canonical --wanhu-surface-work-* recipe tokens or the existing Workspace content owner. '
      + workSurfaceCompatibilityAliases.map(marker=>marker.name + '=' + marker.count).join('; ')
    );
  }

  const contextSurfaceCompatibilityAliases=[];
  for(const marker of RETIRED_CONTEXT_SURFACE_COMPATIBILITY_ALIAS_MARKERS){
    const count=countMatches(text,marker.re);
    if(count)contextSurfaceCompatibilityAliases.push({name:marker.name,count});
  }
  if(contextSurfaceCompatibilityAliases.length){
    errors.push(
      file + ': retired Context / Environment Surface compatibility aliases may not return. '
      + 'Environment content must consume the shared --wanhu-surface-context-* recipe through the common shell. '
      + contextSurfaceCompatibilityAliases.map(marker=>marker.name + '=' + marker.count).join('; ')
    );
  }

  const misplacedWeatherContentVariables=[];
  if(file==='src/ui/wanhu-surface-system.css'){
    for(const marker of WEATHER_CONTENT_VARIABLE_MARKERS){
      const count=countMatches(text,marker.re);
      if(count)misplacedWeatherContentVariables.push({name:marker.name,count});
    }
    if(misplacedWeatherContentVariables.length){
      errors.push(
        file + ': Weather content variables must not be owned or overridden by the shared Surface System. '
        + 'Keep them in weather-mist-glass.css; Surface System owns only --wanhu-surface-context-* material recipe. '
        + misplacedWeatherContentVariables.map(marker=>marker.name + '=' + marker.count).join('; ')
      );
    }
  }

  const globalSpaceSurfaceAliases=[];
  for(const marker of RETIRED_GLOBAL_SPACE_SURFACE_ALIAS_MARKERS){
    const count=countMatches(text,marker.re);
    if(count)globalSpaceSurfaceAliases.push({name:marker.name,count});
  }
  if(globalSpaceSurfaceAliases.length){
    errors.push(
      file + ': retired Global Space Surface aliases may not return. '
      + 'Use the canonical --wanhu-global-space-* recipe from wanhu-surface-system.css. '
      + globalSpaceSurfaceAliases.map(marker=>marker.name + '=' + marker.count).join('; ')
    );
  }

  const hudSurfaceAliases=[];
  for(const marker of RETIRED_HUD_SURFACE_ALIAS_MARKERS){
    const count=countMatches(text,marker.re);
    if(count)hudSurfaceAliases.push({name:marker.name,count});
  }
  if(hudSurfaceAliases.length){
    errors.push(
      file + ': retired HUD Surface compatibility aliases may not return. '
      + 'Use canonical --wanhu-surface-* recipes; gameplay HUD layout keeps geometry only. '
      + hudSurfaceAliases.map(marker=>marker.name + '=' + marker.count).join('; ')
    );
  }

  const hudSurfaceOwnershipViolations=[];
  const hudOwnershipRule=HUD_SURFACE_OWNERSHIP_RULES.find(rule=>rule.file===file);
  if(hudOwnershipRule){
    for(const selector of hudOwnershipRule.selectors){
      const properties=selectorMaterialProperties(text,selector);
      if(properties.length)hudSurfaceOwnershipViolations.push({selector,properties});
    }
    if(hudSurfaceOwnershipViolations.length){
      errors.push(
        file + ': persistent HUD / Elevated material must be owned by wanhu-surface-system.css. '
        + 'Component files may keep geometry, content and motion only. '
        + hudSurfaceOwnershipViolations.map(item=>item.selector + ' [' + item.properties.join(', ') + ']').join('; ')
      );
    }
  }

  const retiredEdgeElevationOwner=file===RETIRED_EDGE_ELEVATION_OWNER_FILE;
  if(retiredEdgeElevationOwner){
    errors.push(
      file + ': wanhu-edge-elevation.css is retired. '
      + 'Move live surface edge/shadow rules into wanhu-surface-system.css; keep specialized component visuals local.'
    );
  }

  const surfaceOwnershipViolations=[];
  const ownershipRule=SURFACE_OWNERSHIP_RULES.find(rule=>rule.file===file);
  if(ownershipRule){
    for(const selector of ownershipRule.selectors){
      const properties=selectorMaterialProperties(text,selector);
      if(properties.length)surfaceOwnershipViolations.push({selector,properties});
    }
    if(surfaceOwnershipViolations.length){
      errors.push(
        file + ': shared Blocking / Global Space material must be owned by wanhu-surface-system.css. '
        + 'Feature/control files may keep geometry and content, not Root/Header/Footer material. '
        + surfaceOwnershipViolations.map(item=>item.selector + ' [' + item.properties.join(', ') + ']').join('; ')
      );
    }
  }

  const legacyPauseSelectors=[];
  if(file==='src/styles.css'){
    for(const selector of ['.pause-layer','.pause-shade']){
      const re=new RegExp(escapeRegExp(selector)+String.raw`\s*\{`,'i');
      if(re.test(text))legacyPauseSelectors.push(selector);
    }
    if(legacyPauseSelectors.length){
      errors.push(
        file + ': legacy Pause ownership may not return to root styles. '
        + 'Use gameplay/pause-layer.css for geometry and wanhu-surface-system.css for material. '
        + legacyPauseSelectors.join(', ')
      );
    }
  }

  if(markers.length===0 && commandAliases.length===0 && controlVisualAliases.length===0 && controlRecipeOwnershipViolations.length===0 && retiredSegmentedOwnerSelectors.length===0 && retiredDialogSelectOwnerSelectors.length===0 && hudAliases.length===0 && semanticCompatibilityAliases.length===0 && workSurfaceCompatibilityAliases.length===0 && contextSurfaceCompatibilityAliases.length===0 && misplacedWeatherContentVariables.length===0 && globalSpaceSurfaceAliases.length===0 && hudSurfaceAliases.length===0 && surfaceOwnershipViolations.length===0 && hudSurfaceOwnershipViolations.length===0 && !retiredEdgeElevationOwner && legacyPauseSelectors.length===0){
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
console.log('Retired Phase 4 control visual aliases guarded: ' + RETIRED_PHASE4_CONTROL_VISUAL_ALIASES.length);
console.log('Shared Control recipe owner variables guarded: ' + CONTROL_RECIPE_VARIABLES.length);
console.log('Retired Segmented legacy owner selectors guarded: ' + RETIRED_SEGMENTED_OWNER_SELECTORS.length);
console.log('Retired Dialog Select owner selectors guarded: ' + RETIRED_DIALOG_SELECT_OWNER_SELECTORS.length);
console.log('Retired HUD foreground aliases guarded: ' + RETIRED_HUD_FOREGROUND_ALIASES.length);
console.log('Retired Tonal / Identity / Character aliases guarded: ' + RETIRED_SEMANTIC_COMPATIBILITY_ALIASES.length);
console.log('Retired Work Surface aliases guarded: ' + RETIRED_WORK_SURFACE_COMPATIBILITY_ALIASES.length);
console.log('Retired Context / Environment Surface aliases guarded: ' + RETIRED_CONTEXT_SURFACE_COMPATIBILITY_ALIASES.length);
console.log('Weather content variables protected from Surface ownership: ' + WEATHER_CONTENT_VARIABLES.length);
console.log('Retired Global Space Surface aliases guarded: ' + RETIRED_GLOBAL_SPACE_SURFACE_ALIASES.length);
console.log('Retired HUD Surface aliases guarded: ' + RETIRED_HUD_SURFACE_ALIASES.length);
console.log('Persistent HUD / Elevated Surface ownership files guarded: ' + HUD_SURFACE_OWNERSHIP_RULES.length);
console.log('Retired Edge / Elevation owner files guarded: 1');
console.log('Blocking / Global Space Surface ownership files guarded: ' + SURFACE_OWNERSHIP_RULES.length);
console.log('Legacy root Pause selectors guarded: 2');

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
