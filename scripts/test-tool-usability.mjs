import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import ts from 'typescript';
import sharp from 'sharp';
import { CUSTOM_ICON_PATHS, renderCustomIcon } from './icons/custom-icon-sources.mjs';

// 使用项目编译器加载纯几何函数，不依赖浏览器 DOM 或 Node 的实验 TypeScript 解析开关。
const source = await readFile('src/ui/asset-inspector/inspector-placement.ts', 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
const { placeInspector } = await import('data:text/javascript;base64,' + Buffer.from(compiled.outputText).toString('base64'));
const bounds = { width: 1920, height: 1080 };
const workspace = { left: 420, top: 650, width: 1080, height: 310 };
const size = { width: 320, height: 230 };
const intersects = (a, b) => a.left < b.left + b.width && a.left + a.width > b.left && a.top < b.top + b.height && a.top + a.height > b.top;
let checks = 0;
for (const left of [440, 700, 1000, 1270]) {
  for (const top of [730, 850]) {
    const anchor = { left, top, width: 180, height: 64 };
    const placed = placeInspector({ anchor, size, bounds, workspace });
    assert.equal(placed.placement, 'top');
    assert(!intersects({ ...placed, ...size }, workspace), '整张目录都必须避让，而不是只避让当前条目');
    assert(placed.left >= 16 && placed.top >= 16 && placed.left + size.width <= 1904 && placed.top + size.height <= 1064);
    checks++;
  }
}
const highWorkspace = { left: 700, top: 24, width: 640, height: 750 };
const fallback = placeInspector({ anchor: { left: 720, top: 250, width: 120, height: 64 }, size, bounds, workspace: highWorkspace });
assert(!intersects({ ...fallback, ...size }, highWorkspace), '上方放不下时应选择目录外侧');
checks++;
for (const anchor of [{ left: 16, top: 16, width: 30, height: 30 }, { left: 1870, top: 1000, width: 30, height: 30 }]) {
  const result = placeInspector({ anchor, size, bounds });
  assert(result.left >= 16 && result.top >= 16 && result.left + size.width <= 1904 && result.top + size.height <= 1064);
  checks++;
}

const manifest = JSON.parse(await readFile('public/assets/ui/icons/icon-manifest.json', 'utf8'));
for (const name of Object.keys(CUSTOM_ICON_PATHS)) {
  const icon = manifest.icons.find(entry => entry.sourceName === name);
  assert(icon && icon.origin === 'wanhu-authored', name + ': 自定义来源必须准确');
  assert.equal((await readFile(icon.sourceSvg, 'utf8')).trim(), renderCustomIcon(name));
  const { data, info } = await sharp(icon.png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  assert.equal(info.width, 64); assert.equal(info.height, 64); assert.equal(info.channels, 4);
  let visible = 0; let transparent = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] > 0) { assert.equal(data[i], 255); assert.equal(data[i + 1], 255); assert.equal(data[i + 2], 255); visible++; }
    else transparent++;
  }
  assert(visible > 100 && transparent > 100, name + ': PNG 必须有真实图形及透明背景');
  checks++;
}

// 这一轮明确排除的内容必须保持原样；这是阶段保护，不是永远冻结未来开发。
const unchanged = {
  'src/gameplay/inventory-management.css': 'c9d332c653c9fea61c918fb1dbb74af9782b7d83',
  'src/gameplay/management-panel-skin.css': '9904b60f85b1d6a95cc8e639a5fdc9ffaf196970',
  'src/tools/color-tool/modes/surface/MaterialPresetWorkspace.tsx': '6556da71c0cca9c1998bceb9bc1bf3ba4db5bf63',
  'src/tools/color-tool/modes/surface/material-preset-workspace.css': 'f86a5ffe2fd50d8def4e5012e8a45d7ca2d0c92d',
  'src/ui/wanhu-theme-tokens.css': '32bdd58af0467d1badab585ba149dfc625cd9c47',
};
for (const [file, sha] of Object.entries(unchanged)) {
  assert.equal(execFileSync('git', ['hash-object', file], { encoding: 'utf8' }).trim(), sha, file + ': 超出本轮已批准范围');
  checks++;
}
console.log(`Tool usability checks: PASS (${checks} geometry / custom icon / scope checks).`);
