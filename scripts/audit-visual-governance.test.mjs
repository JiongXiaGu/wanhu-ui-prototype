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
    'src/review/nested/study.css':'.study{color:#c9a55f;background:var(--command-hover)}',
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
