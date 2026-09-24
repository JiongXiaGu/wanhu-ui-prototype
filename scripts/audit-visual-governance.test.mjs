import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const auditScript=fileURLToPath(new URL('./audit-visual-governance.mjs',import.meta.url));

/* 运行真实 CLI，不复制其匹配实现。临时目录只包含测试 CSS，不写入项目 src。 */
async function runAudit(files){
  const root=await mkdtemp(path.join(tmpdir(),'wanhu-visual-guard-'));
  try{
    await mkdir(path.join(root,'src'),{recursive:true});
    for(const [file,content] of Object.entries(files)){
      const target=path.join(root,file);
      await mkdir(path.dirname(target),{recursive:true});
      await writeFile(target,content,'utf8');
    }
    const result=spawnSync(process.execPath,[auditScript],{
      cwd:root,encoding:'utf8',timeout:15000,
    });
    assert.ifError(result.error);
    assert.equal(result.signal,null,'Audit must exit normally, not be killed');
    return {status:result.status,output:result.stdout+result.stderr};
  }finally{
    await rm(root,{recursive:true,force:true});
  }
}

const retiredCommandAliases=[
  ...['lg','md','sm'].flatMap(size=>['top','bottom'].map(edge=>`--command-surface-${size}-${edge}`)),
  '--command-border','--command-divider','--command-hover',
  ...['top','bottom','line'].map(state=>`--command-active-${state}`),
  ...['top','bottom','hover-top','hover-bottom'].map(state=>`--command-primary-${state}`),
  '--command-icon','--command-icon-hover','--command-icon-active',
  ...['bg','edge','shadow'].map(part=>`--command-tooltip-${part}`),
  '--command-blur','--command-blur-lg','--command-blur-md','--command-blur-sm',
];

for(const alias of retiredCommandAliases){
  test(`reject retired command alias: ${alias}`,async()=>{
    const result=await runAudit({'src/ui/probe.css':`.probe{${alias}:transparent;color:var(${alias})}`});
    assert.equal(result.status,1,result.output);
    assert.match(result.output,/retired command visual compatibility aliases/);
    assert.ok(result.output.includes(alias),result.output);
    assert.match(result.output,/legacy-command-[\w-]+=2/);
  });
}

test('preserve command geometry and canonical semantic consumers',async()=>{
  const result=await runAudit({'src/ui/probe.css':`.probe{
    --command-radius:14px;--command-icon-size:24px;--command-divider-height:44px;
    --command-lg-width:880px;--command-lg-height:84px;
    border-radius:var(--command-radius);width:var(--command-lg-width);
    color:var(--wanhu-color-brass-high);background:var(--wanhu-command-hover);
    border-color:var(--wanhu-command-divider);box-shadow:var(--wanhu-command-tooltip-shadow);
  }`});
  assert.equal(result.status,0,result.output);
});

test('match a complete alias, not a longer custom-property identifier',async()=>{
  // 这些名字只验证词法边界，不授权 Feature 创建新的视觉 Owner。
  const css=retiredCommandAliases.map(alias=>`${alias}-fixture:0;`).join('');
  const result=await runAudit({'src/ui/probe.css':`.probe{${css}--fixture--command-hover:0}`});
  assert.equal(result.status,0,result.output);
});

for(const value of ['var(--paper)','var(--gold)','var(--gold-hi)','var(--gold-fill)',
  '#efe9dd','#C9A55F','#e2c27d','#c9aa68','#C9A55F80']){
  test(`reject retired shared palette: ${value}`,async()=>{
    const result=await runAudit({'src/probe.css':`.probe{color:${value}}`});
    assert.equal(result.status,1,result.output);
    assert.match(result.output,/retired shared/);
  });
}

for(const [r,g,b] of [[201,165,95],[210,179,111],[201,170,104]]){
  const values=[
    `rgba(${r},${g},${b},.045)`,
    `rgb(${r}, ${g}, ${b})`,
    `rgba( ${r}, ${g}, ${b}, .1)`,
    `rgb(${r} ${g} ${b})`,
    `rgb(${r} ${g} ${b} / .1)`,
    `RGBA(${r}\n${g}\n${b} / 20%)`,
    `rgb(${r}.0 ${g}.00 ${b}.0 / .5)`,
  ];
  for(const value of values){
    test(`reject equivalent retired RGB: ${JSON.stringify(value)}`,async()=>{
      const result=await runAudit({'src/probe.css':`.probe{color:${value}}`});
      assert.equal(result.status,1,result.output);
      assert.match(result.output,/retired shared palette literal/);
    });
  }
}

test('preserve current hue, neighboring colors, topic and content colors',async()=>{
  const result=await runAudit({'src/probe.css':`.probe{
    --topic:#8294a0;--content:#b79255;color:#a9844b;
    background:rgba(169,132,75,.105);border-color:rgb(201 165 96);
    outline-color:rgb(201 166 95);box-shadow:0 0 1px rgb(202 165 95);
  }`});
  assert.equal(result.status,0,result.output);
});

test('RGB channels must match whole numeric values',async()=>{
  const result=await runAudit({'src/probe.css':'.probe{color:rgb(201 165 95.5)}'});
  assert.equal(result.status,0,result.output);
});

test('scan nested runtime CSS, but exclude review studies and non-CSS files',async()=>{
  const files={
    'src/review/nested/study.css':'.study{color:#c9a55f;background:var(--command-hover);color:var(--hud-text)}',
    'src/example.ts':'const historicalExample = "--command-hover";',
    'src/ui/nested/clean.css':'.clean{color:var(--wanhu-color-paper-primary)}',
  };
  const clean=await runAudit(files);
  assert.equal(clean.status,0,clean.output);
  assert.match(clean.output,/Runtime CSS scanned: 1/);
  const dirty=await runAudit({...files,'src/ui/nested/dirty.css':'.dirty{color:var(--command-icon)}'});
  assert.equal(dirty.status,1,dirty.output);
  assert.match(dirty.output,/src\/ui\/nested\/dirty\.css/);
});


const retiredHudAliases=[
  '--hud-text','--hud-text-secondary','--hud-icon','--hud-accent','--hud-accent-text',
  '--wanhu-hud-paper','--wanhu-hud-text','--wanhu-hud-muted','--wanhu-hud-faint','--wanhu-hud-gold',
];

for(const alias of retiredHudAliases){
  test(`reject retired HUD foreground alias: ${alias}`,async()=>{
    const result=await runAudit({'src/ui/probe.css':`.probe{${alias}:transparent;color:var(${alias})}`});
    assert.equal(result.status,1,result.output);
    assert.match(result.output,/retired HUD foreground compatibility aliases/);
    assert.ok(result.output.includes(alias+'=2'),result.output);
  });
}

test('preserve HUD geometry and canonical foreground',async()=>{
  const result=await runAudit({'src/ui/probe.css':`.probe{
    --hud-edge:16px;--hud-radius-sm:10px;--hud-radius-md:14px;
    --hud-core-width:880px;--hud-bottom-panel-height:84px;
    color:var(--wanhu-color-paper-primary);
    border-color:var(--wanhu-color-brass-high);
  }`});
  assert.equal(result.status,0,result.output);
  assert.match(result.output,/Retired HUD foreground aliases guarded: 10/);
});

test('HUD guard matches complete identifiers, not prefixes or suffixes',async()=>{
  // 仅验证词法边界，不授权新建前景 Owner。
  const css=retiredHudAliases.map(alias=>`${alias}-fixture:0;--fixture${alias}:0;`).join('');
  const result=await runAudit({'src/ui/probe.css':`.probe{${css}}`});
  assert.equal(result.status,0,result.output);
});


const retiredSemanticCompatibilityAliases=[
  '--wanhu-tonal-ink-950','--wanhu-tonal-ink-900','--wanhu-tonal-ink-800',
  '--wanhu-tonal-paper','--wanhu-tonal-secondary','--wanhu-tonal-tertiary',
  '--wanhu-tonal-brass','--wanhu-tonal-brass-hi','--wanhu-tonal-brass-soft','--wanhu-tonal-cinnabar',
  '--wanhu-identity-paper','--wanhu-identity-text','--wanhu-identity-secondary','--wanhu-identity-muted',
  '--wanhu-identity-faint','--wanhu-identity-gold','--wanhu-identity-gold-hi',
  '--wanhu-character-gold','--wanhu-character-gold-hi','--wanhu-character-gold-soft',
  '--wanhu-character-joint','--wanhu-character-rule','--wanhu-character-beam',
];

for(const alias of retiredSemanticCompatibilityAliases){
  test(`reject retired semantic compatibility alias: ${alias}`,async()=>{
    const result=await runAudit({'src/ui/probe.css':`.probe{${alias}:transparent;color:var(${alias})}`});
    assert.equal(result.status,1,result.output);
    assert.match(result.output,/retired Tonal \/ Identity \/ Character compatibility aliases/);
    assert.ok(result.output.includes(alias+'=2'),result.output);
  });
}

test('preserve canonical Theme and Surface tokens',async()=>{
  const result=await runAudit({'src/ui/probe.css':`.probe{
    color:var(--wanhu-color-paper-primary);
    border-color:var(--wanhu-color-brass-high);
    background:var(--wanhu-color-brass-soft);
    box-shadow:var(--wanhu-surface-info-shadow);
    backdrop-filter:var(--wanhu-surface-elevated-filter);
  }`});
  assert.equal(result.status,0,result.output);
  assert.match(result.output,/Retired Tonal \/ Identity \/ Character aliases guarded: 23/);
});

test('semantic compatibility guard matches complete identifiers only',async()=>{
  // 仅验证完整名称边界；带前后缀的自定义属性不代表推荐的新 Owner。
  const css=retiredSemanticCompatibilityAliases
    .map(alias=>`${alias}-fixture:0;--fixture${alias}:0;`)
    .join('');
  const result=await runAudit({'src/ui/probe.css':`.probe{${css}}`});
  assert.equal(result.status,0,result.output);
});


const retiredWorkSurfaceCompatibilityAliases=[
  '--workspace-glass-surface','--workspace-glass-body','--workspace-glass-rail',
  '--workspace-glass-card','--workspace-glass-card-hover',
  '--workspace-edge','--workspace-rule','--workspace-gold','--workspace-gold-soft',
];

for(const alias of retiredWorkSurfaceCompatibilityAliases){
  test(`reject retired Work Surface compatibility alias: ${alias}`,async()=>{
    const result=await runAudit({'src/ui/probe.css':`.probe{${alias}:transparent;background:var(${alias})}`});
    assert.equal(result.status,1,result.output);
    assert.match(result.output,/retired Work Surface compatibility aliases/);
    assert.ok(result.output.includes(alias+'=2'),result.output);
  });
}

test('preserve canonical Work Surface recipe and Workspace content variables',async()=>{
  const result=await runAudit({'src/ui/probe.css':`.probe{
    --workspace-paper:var(--wanhu-color-paper-primary);
    --workspace-text:var(--wanhu-color-text-secondary);
    --workspace-muted:#a19f99;
    --workspace-faint:var(--wanhu-color-paper-tertiary);
    --workspace-jade:#9b9e99;
    color:var(--workspace-paper);
    background:var(--wanhu-surface-work-sheet-bg);
    border-color:var(--wanhu-surface-work-edge);
    box-shadow:var(--wanhu-surface-work-shadow);
    backdrop-filter:var(--wanhu-surface-work-filter);
  }`});
  assert.equal(result.status,0,result.output);
  assert.match(result.output,/Retired Work Surface aliases guarded: 9/);
});

test('Work Surface guard matches complete identifiers only',async()=>{
  const css=retiredWorkSurfaceCompatibilityAliases
    .map(alias=>`${alias}-fixture:0;--fixture${alias}:0;`)
    .join('');
  const result=await runAudit({'src/ui/probe.css':`.probe{${css}}`});
  assert.equal(result.status,0,result.output);
});


const retiredContextSurfaceCompatibilityAliases=[
  '--weather-mist-surface','--weather-mist-card','--weather-mist-card-hover',
  '--weather-edge','--weather-rule',
];

for(const alias of retiredContextSurfaceCompatibilityAliases){
  test(`reject retired Context / Environment Surface alias: ${alias}`,async()=>{
    const result=await runAudit({'src/gameplay/probe.css':`.probe{${alias}:transparent;background:var(${alias})}`});
    assert.equal(result.status,1,result.output);
    assert.match(result.output,/retired Context \/ Environment Surface compatibility aliases/);
    assert.ok(result.output.includes(alias+'=2'),result.output);
  });
}

test('Weather content variables stay out of shared Surface System',async()=>{
  const result=await runAudit({
    'src/ui/wanhu-surface-system.css':`.probe{
      --weather-paper:#fff;--weather-text:#fff;--weather-muted:#aaa;--weather-faint:#888;
      --weather-gold:#a9844b;--weather-gold-focus:#c5a469;--weather-gold-soft:rgba(169,132,75,.105);
    }`,
    'src/gameplay/weather-mist-glass.css':'.weather{color:var(--wanhu-color-paper-primary)}',
  });
  assert.equal(result.status,1,result.output);
  assert.match(result.output,/Weather content variables must not be owned or overridden by the shared Surface System/);
  for(const name of ['--weather-paper','--weather-text','--weather-muted','--weather-faint','--weather-gold','--weather-gold-focus','--weather-gold-soft']){
    assert.ok(result.output.includes(name+'=1'),result.output);
  }
});

test('preserve Weather content owner and canonical Context Surface recipe',async()=>{
  const result=await runAudit({
    'src/gameplay/weather-mist-glass.css':`.weather{
      --weather-paper:var(--wanhu-color-paper-primary);
      --weather-text:#cbc6bd;--weather-muted:#9d9f9a;--weather-faint:#858984;
      --weather-gold:var(--wanhu-color-brass);
      --weather-gold-focus:var(--wanhu-color-brass-high);
      --weather-gold-soft:var(--wanhu-color-brass-soft);
      color:var(--weather-paper);
    }`,
    'src/ui/wanhu-surface-system.css':`.context{
      background:var(--wanhu-surface-context-bg);
      border-color:var(--wanhu-surface-context-edge);
      box-shadow:var(--wanhu-surface-context-shadow);
      backdrop-filter:var(--wanhu-surface-context-filter);
    }`,
  });
  assert.equal(result.status,0,result.output);
  assert.match(result.output,/Retired Context \/ Environment Surface aliases guarded: 5/);
  assert.match(result.output,/Weather content variables protected from Surface ownership: 7/);
});

test('Context Surface guard matches complete identifiers only',async()=>{
  const css=retiredContextSurfaceCompatibilityAliases
    .map(alias=>`${alias}-fixture:0;--fixture${alias}:0;`)
    .join('');
  const result=await runAudit({'src/gameplay/probe.css':`.probe{${css}}`});
  assert.equal(result.status,0,result.output);
});


const retiredGlobalSpaceSurfaceAliases=[
  '--ui-footer-surface-top','--ui-footer-surface-bottom','--ui-footer-backdrop',
];

for(const alias of retiredGlobalSpaceSurfaceAliases){
  test(`reject retired Global Space Surface alias: ${alias}`,async()=>{
    const result=await runAudit({'src/ui/probe.css':`.probe{${alias}:transparent;background:var(${alias})}`});
    assert.equal(result.status,1,result.output);
    assert.match(result.output,/retired Global Space Surface aliases/);
    assert.ok(result.output.includes(alias+'=2'),result.output);
  });
}

test('reject Global Space Header and Footer material in archive structural CSS',async()=>{
  const result=await runAudit({'src/archive/archive-panel.css':`
    .global-space-header{border-bottom-width:1px;border-bottom-style:solid;background:#111}
    .global-space-footer{border-top-width:1px;border-top-style:solid;backdrop-filter:blur(8px)}
  `});
  assert.equal(result.status,1,result.output);
  assert.match(result.output,/shared Blocking \/ Global Space material must be owned/);
  assert.match(result.output,/\.global-space-header \[background\]/);
  assert.match(result.output,/\.global-space-footer \[backdrop-filter\]/);
});

for(const [file,selector] of [
  ['src/archive/save-game-space.css','.save-game-space'],
  ['src/new-game/new-game-space.css','.new-game-space'],
  ['src/settings/settings-panel.css','.settings-space'],
  ['src/ui/ui-visual-system.css','.global-space-footer'],
]){
  test(`reject private Global Space root material: ${file} ${selector}`,async()=>{
    const result=await runAudit({[file]:`${selector}{background:rgba(1,2,3,.5);box-shadow:0 1px 2px #000}`});
    assert.equal(result.status,1,result.output);
    assert.match(result.output,/shared Blocking \/ Global Space material must be owned/);
    assert.ok(result.output.includes(selector),result.output);
  });
}

test('reject legacy Pause root ownership in styles.css',async()=>{
  const result=await runAudit({'src/styles.css':'.pause-layer{position:absolute}.pause-shade{background:#000}'});
  assert.equal(result.status,1,result.output);
  assert.match(result.output,/legacy Pause ownership may not return to root styles/);
  assert.match(result.output,/\.pause-layer/);
  assert.match(result.output,/\.pause-shade/);
});

test('preserve Global Space geometry and canonical Surface owner',async()=>{
  const result=await runAudit({
    'src/archive/archive-panel.css':`
      .global-space-header{border-bottom-width:1px;border-bottom-style:solid}
      .global-space-footer{border-top-width:1px;border-top-style:solid;color:var(--wanhu-color-paper-tertiary)}
    `,
    'src/new-game/new-game-space.css':'.new-game-space{position:absolute;inset:0;display:flex}',
    'src/ui/ui-visual-system.css':'.global-space-primary{color:var(--wanhu-color-brass-high)}',
    'src/ui/wanhu-surface-system.css':`
      .wanhu-global-space{background-image:var(--wanhu-material-noise);backdrop-filter:var(--wanhu-global-space-filter)}
      .wanhu-global-space .global-space-header{background:var(--wanhu-global-space-header-bg);border-bottom-color:var(--wanhu-global-space-rule)}
      .wanhu-global-space .global-space-footer{background:var(--wanhu-global-space-footer-bg);border-top-color:var(--wanhu-global-space-rule);box-shadow:inset 0 1px 0 rgba(255,255,255,.01);backdrop-filter:none}
    `,
  });
  assert.equal(result.status,0,result.output);
  assert.match(result.output,/Retired Global Space Surface aliases guarded: 3/);
  assert.match(result.output,/Blocking \/ Global Space Surface ownership files guarded: 5/);
  assert.match(result.output,/Legacy root Pause selectors guarded: 2/);
});

test('Global Space alias guard matches complete identifiers only',async()=>{
  const css=retiredGlobalSpaceSurfaceAliases.map(alias=>`${alias}-fixture:0;--fixture${alias}:0;`).join('');
  const result=await runAudit({'src/ui/probe.css':`.probe{${css}}`});
  assert.equal(result.status,0,result.output);
});


const retiredHudSurfaceAliases=[
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

for(const alias of retiredHudSurfaceAliases){
  test(`reject retired HUD Surface alias: ${alias}`,async()=>{
    const result=await runAudit({'src/gameplay/probe.css':`.probe{${alias}:transparent;background:var(${alias})}`});
    assert.equal(result.status,1,result.output);
    assert.match(result.output,/retired HUD Surface compatibility aliases/);
    assert.ok(result.output.includes(alias+'=2'),result.output);
  });
}

test('reject private Top HUD and Elevated material ownership',async()=>{
  const result=await runAudit({'src/gameplay/gameplay-top-shell.css':`
    .gameplay-top-status{background:#111;box-shadow:0 1px 2px #000}
    .gameplay-top-map-panel{border-color:#fff;backdrop-filter:blur(8px)}
  `});
  assert.equal(result.status,1,result.output);
  assert.match(result.output,/persistent HUD \/ Elevated material must be owned/);
  assert.match(result.output,/\.gameplay-top-status/);
  assert.match(result.output,/\.gameplay-top-map-panel/);
});

test('reject private System Menu Surface ownership',async()=>{
  const result=await runAudit({'src/gameplay/gameplay-corner-hud.css':'.gameplay-system-menu-button{background:#111;box-shadow:0 1px 2px #000}'});
  assert.equal(result.status,1,result.output);
  assert.match(result.output,/persistent HUD \/ Elevated material must be owned/);
  assert.match(result.output,/\.gameplay-system-menu-button/);
});

test('reject retired Edge Elevation owner file',async()=>{
  const result=await runAudit({'src/ui/wanhu-edge-elevation.css':'.gameplay-screen .gameplay-top-status{box-shadow:none}'});
  assert.equal(result.status,1,result.output);
  assert.match(result.output,/wanhu-edge-elevation\.css is retired/);
});

test('preserve HUD geometry, specialized Compass and canonical Surface owners',async()=>{
  const result=await runAudit({
    'src/gameplay/gameplay-hud-layout.css':`.gameplay-screen{
      --hud-edge:16px;--hud-radius-sm:10px;--hud-radius-md:14px;--hud-radius-lg:18px;
      --hud-core-width:880px;--hud-bottom-panel-height:84px;
    }`,
    'src/gameplay/gameplay-top-shell.css':`
      .gameplay-top-status{border:1px solid transparent;border-radius:14px}
      .gameplay-top-map-panel{border:1px solid transparent;border-radius:14px}
      .gameplay-top-map-panel>header{border-bottom:1px solid transparent}
    `,
    'src/gameplay/gameplay-corner-hud.css':`
      .gameplay-compass-hud__dial{background:radial-gradient(circle,#333,#111);box-shadow:0 1px 2px #000}
      .gameplay-system-menu-button{border:1px solid transparent}
    `,
    'src/ui/wanhu-surface-system.css':`
      .gameplay-screen .gameplay-top-status{background-color:var(--wanhu-surface-info-bg);box-shadow:var(--wanhu-surface-info-shadow)}
      .gameplay-screen .gameplay-top-map-panel{background:linear-gradient(180deg,var(--wanhu-surface-elevated-top),var(--wanhu-surface-elevated-bottom));border-color:var(--wanhu-surface-elevated-edge);box-shadow:var(--wanhu-surface-elevated-shadow);backdrop-filter:var(--wanhu-surface-elevated-filter)}
      .gameplay-screen .gameplay-system-menu-button{background-color:var(--wanhu-surface-ambient-soft-bg);box-shadow:var(--wanhu-surface-ambient-shadow)}
    `,
  });
  assert.equal(result.status,0,result.output);
  assert.match(result.output,/Retired HUD Surface aliases guarded: 24/);
  assert.match(result.output,/Persistent HUD \/ Elevated Surface ownership files guarded: 2/);
  assert.match(result.output,/Retired Edge \/ Elevation owner files guarded: 1/);
});

test('HUD Surface alias guard matches complete identifiers only',async()=>{
  const css=retiredHudSurfaceAliases.map(alias=>`${alias}-fixture:0;--fixture${alias}:0;`).join('');
  const result=await runAudit({'src/gameplay/probe.css':`.probe{${css}}`});
  assert.equal(result.status,0,result.output);
});


const retiredPhase4ControlVisualAliases=[
  '--ui-control-hover','--ui-control-border','--ui-control-border-hover',
];

for(const alias of retiredPhase4ControlVisualAliases){
  test(`reject retired Phase 4 control visual alias: ${alias}`,async()=>{
    const result=await runAudit({'src/ui/probe.css':`.probe{${alias}:transparent;border-color:var(${alias})}`});
    assert.equal(result.status,1,result.output);
    assert.match(result.output,/retired Phase 4 control visual aliases/);
    assert.ok(result.output.includes(alias+'=2'),result.output);
  });
}

test('preserve canonical Control states and component-specific Segment recipe',async()=>{
  const result=await runAudit({'src/ui/probe.css':`.probe{
    --ui-control-radius:10px;
    --ui-control-radius-inner:8px;
    --ui-segment-surface:rgba(255,255,255,.024);
    --ui-segment-border:rgba(239,233,221,.095);
    --ui-segment-hover:rgba(255,255,255,.050);
    --ui-segment-active-top:rgba(169,132,75,.115);
    --ui-segment-active-bottom:rgba(169,132,75,.040);
    border-color:var(--wanhu-control-border-soft);
    outline-color:var(--wanhu-control-border-hover);
    background:var(--wanhu-control-hover);
  }`});
  assert.equal(result.status,0,result.output);
  assert.match(result.output,/Retired Phase 4 control visual aliases guarded: 3/);
});
