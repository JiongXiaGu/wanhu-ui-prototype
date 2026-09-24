# Phase 3 Batch 16：Blocking / Global Space Surface 所有权收敛

## 接手与范围

接手 main 为 `7ac27107668f322b5608853e9a8f218bce8b645d`。本批只处理 Pause 与 Settings / Load / Save / New Game 的共享 Surface 所有权，不改变 Global Space 配方数值、不重做页面结构，也不提前整理 Warning / Danger、Primary / Secondary Button、Toggle、Slider 等 Phase 4 Control 状态。

## 盘点结果

真实加载链显示：

1. `styles.css` 很早就写入旧 `.pause-layer / .pause-shade`；
2. `archive-panel.css` 作为 Load / Save 共用结构文件，仍给 `.global-space-header / .global-space-footer` 写共享背景和 Rule；
3. `ui-visual-system.css` 又给 `.global-space-footer` 写一套 `--ui-footer-surface-top / bottom` 渐变、Shadow 和 `--ui-footer-backdrop`；
4. 最后加载的 `wanhu-surface-system.css` 以更具体 Selector / important 规则重新写 Global Space Root、Header、Footer，并接管 Pause Surface。

因此前三层中存在“看起来像正式材质、实际最终不生效”的历史 Owner。继续保留会误导后续 Web / Unity AI，也容易在重排 CSS 时重新改变视觉。

## 处理

Runtime 提交：`cd6f556d1bf9b1d4d3070a28574e152fa046ecb3`。

### Pause

`styles.css` 删除旧 `.pause-layer / .pause-shade`。正式几何在 `gameplay/pause-layer.css`，Scene Attenuation / Panel 材质在 `wanhu-surface-system.css`。

### Global Space Header / Footer

`archive-panel.css` 仍是通用 Header / Footer 的结构来源，但只保留 flex / spacing / padding 与 1px Border width/style。背景、Rule 色、Shadow、Blur 全部交给 Surface System。

### Footer 旧材质

`ui-visual-system.css` 删除：

```text
--ui-footer-surface-top
--ui-footer-surface-bottom
--ui-footer-backdrop
```

以及对应 `.global-space-footer` 渐变 / Border / Shadow / Backdrop Filter。该文件继续负责 Segmented 与 Full-screen Action Button，不再拥有全屏页材质。

### Feature Root

`save-game-space.css` 与 `new-game-space.css` 删除 Root 的私有透明背景；Archive Pause Root 也不再声明 Background。所有这些节点都带 `wanhu-global-space`，最终 Root Recipe 由 Surface System 单独持有。

## 防回退

新增 3 个完整名称 Guard，旧 `--ui-footer-*` 变量不能回流。

新增 5 个文件级 Surface Ownership Guard：

```text
src/archive/archive-panel.css
src/archive/save-game-space.css
src/new-game/new-game-space.css
src/settings/settings-panel.css
src/ui/ui-visual-system.css
```

这些文件允许几何和内容规则，但对应 Root / Header / Footer 不允许重新持有 Background、Border Color、Shadow 或 Backdrop Filter。

另对 `src/styles.css` 单独保护，禁止再次出现 `.pause-layer / .pause-shade` Owner。回归测试从 117 项增加到 128 项。

## Guard 修复记录

初始 Guard 在生成 RegExp escape helper 时，replacement string 中的 `$&` 被 JavaScript `String.replace` 展开成匹配文本，导致审计脚本语法错误；第一次修复又产生了 selector 双反斜杠。

这两次问题只发生在 Guard 代码，Runtime CSS 从 `cd6f556d...` 后没有改变。最终使用 `String.fromCharCode(92)` 构造单个反斜杠，避免模板 / replacement 转义歧义。最终 Guard 提交：`ca9565ad7e42a2f5f14693bd02b0747e2d806e9b`。

## 验证记录

最终 Build #1545，Run `36013244997` 全部通过：

- 128 tests / 128 pass / 0 fail；
- Runtime CSS scanned: 64；
- Legacy palette debt files: 0；
- Retired Global Space Surface aliases guarded: 3；
- Blocking / Global Space Surface ownership files guarded: 5；
- Legacy root Pause selectors guarded: 2；
- Visual governance ratchet: PASS；
- Building Selection / Scheme / Placement：11 checks PASS；
- World Utility / Demolition：8 checks PASS；
- `tsc -b && vite build` 通过。

Runtime UI Review #485，Run `36013056471` 全部通过。该 Review 对应 `cd6f556d...`，后续提交只修改 Guard，所以页面 Runtime 与最终代码一致。

下载并实际查看 `visual-governance-review` Artifact `10812879320`：

- `readability-new-game.png`；
- `readability-settings.png`；
- `readability-save.png`；
- `readability-report.json`：25 组 checks，`runtimeErrors: []`。

实际页面中 Global Space Root、顶部 Header Rule、底部 Footer Rule / Surface、正文分区和按钮区未发现明显回退。Pause 也在同一完整 UI Review 矩阵中通过。

本批未做逐像素 Diff，也不将 Web Playwright Review 解释为 Unity 6000.6.2f1 Player、真实 Backdrop Filter 成本或设备性能验证。

## 并行 Unity 兼容工作流

Batch 16 验证后，main 并行合入 `42d11d724773d0fb373a0d1038f27c651196b6e6`，新增 Unity 6000.6.2f1 实测兼容规范和 `audit:unity` Telemetry / Warning。该提交没有修改 Runtime CSS，因此不改变本批视觉证据。

它明确要求后续 Surface 整理不能让 Gradient / box-shadow / brightness / saturate 等 Web-only 能力成为 Unity 成立的必要条件；当前 Telemetry 仍非阻塞，视觉治理完成后再冻结 Baseline。

## 下一批

继续 Phase 3，处理 Persistent HUD / Elevated Surface。优先盘点：

- `--hud-surface-blocking-top / bottom`；
- `--hud-accent-bg`；
- Persistent Information / Control / Ambient / Readout Surface 的真实 Owner；
- `wanhu-edge-elevation.css` 中 HUD / Elevated Inspector 与后加载 Surface System 的最终覆盖关系。

Top HUD 的轻冷灰身份、Rich Hover、Tooltip、Warning / Danger 与基础 Control 状态保持现状，后者继续留到 Phase 4。
