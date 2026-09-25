export const FULL_REVIEW_GROUPS = ['core','hud','dialog','readability','tools','selection'];

export const MODULES = [
  { id:'shared-style', reviews:FULL_REVIEW_GROUPS, matchers:[
    /^src\/ui\/(?:wanhu-theme-tokens|wanhu-surface-system|ui-control-system|ui-visual-system)\.css$/,
    /^src\/fullscreen-actions\.css$/,
  ]},
  { id:'hud-shell', reviews:['hud','tools'], matchers:[
    /^src\/gameplay\/(?:GameplayHUD|GameplayCornerHud|ContextUtilityToolbar|CommandBar)\.tsx$/,
    /^src\/gameplay\/(?:gameplay-top-shell|gameplay-corner-hud|gameplay-hud-layout|context-utility-toolbar|main-dock|operation-hints)\.css$/,
    /^src\/ui\/(?:wanhu-character|wanhu-top-resource-shortcuts|wanhu-icon-led-header)\.css$/,
  ]},
  { id:'workspace', reviews:['tools'], matchers:[
    /^src\/workspace(?:\.css|\/)/,
  ]},
  { id:'map-view', reviews:['core'], matchers:[
    /^src\/gameplay\/city-management\.css$/,
    /^src\/gameplay\/GameplayScreen\.tsx$/,
  ]},
  { id:'main-menu', reviews:['readability'], matchers:[
    /^src\/menu\//,
    /^src\/menu-refine\.css$/,
  ]},
  { id:'loading', reviews:['readability'], matchers:[
    /^src\/loading\//,
  ]},
  { id:'settings-save-load', reviews:['readability','dialog'], matchers:[
    /^src\/(?:settings|archive)\//,
  ]},
  { id:'color-tool', reviews:['readability','tools'], matchers:[
    /^src\/tools\/color-tool\//,
  ]},
  { id:'city-wall-wall-gate', reviews:['core','tools'], matchers:[
    /^src\/tools\/city-wall-(?:construction|gate)\//,
  ]},
  { id:'city-wall-stairs', reviews:['core','tools'], matchers:[
    /^src\/tools\/city-wall-(?:access-stair|transition-stair)\//,
  ]},
  { id:'weather', reviews:['core','tools'], matchers:[
    /^src\/gameplay\/weather-/,
  ]},
  { id:'selection', reviews:['selection','tools'], matchers:[
    /^src\/selection\//,
  ]},
  { id:'dialog-hover', reviews:['dialog','tools'], matchers:[
    /^src\/ui\/(?:dialog|hover)\//,
  ]},
  { id:'gameplay-context', reviews:['core','tools'], matchers:[
    /^src\/gameplay\/gameplay-context-panel\.css$/,
    /^src\/ui\/LeftContextPanel\.tsx$/,
  ]},
  { id:'tools-other', reviews:['core','tools'], matchers:[
    /^src\/tools\//,
  ]},
  { id:'global-core', reviews:FULL_REVIEW_GROUPS, matchers:[
    /^src\/(?:styles|backgrounds)\.css$/,
  ]},
];

export function classifyFile(file){
  const path=file.replace(/\\/g,'/');
  if(/^Documentation\//.test(path)) return {kind:'support', path};
  if(/^public\/assets\//.test(path)) return {kind:'support', path};
  if(/^scripts\/capture-.*-review\.mjs$/.test(path)) return {kind:'support', path, reviewScript:true};
  if(/^src\/main\.tsx$/.test(path)) return {kind:'support', path};
  if(/^\.github\//.test(path) || /^scripts\/(?:ui-review-modules|check-pr-scope)\.mjs$/.test(path)) return {kind:'infra', path};
  if(/^scripts\/(?:audit-|test-)/.test(path)) return {kind:'support', path};
  if(/^(?:package\.json|package-lock\.json|vite\.config\.)/.test(path)) return {kind:'toolchain', path};
  for(const module of MODULES){
    if(module.matchers.some(re=>re.test(path))) return {kind:'module', module:module.id, path};
  }
  if(/^src\//.test(path)) return {kind:'unclassified', path};
  return {kind:'support', path};
}

export function moduleById(id){
  if(id==='full' || id==='review-infra') return {id,reviews:FULL_REVIEW_GROUPS};
  if(id==='toolchain') return {id,reviews:FULL_REVIEW_GROUPS};
  if(id==='docs') return {id,reviews:[]};
  return MODULES.find(module=>module.id===id);
}
