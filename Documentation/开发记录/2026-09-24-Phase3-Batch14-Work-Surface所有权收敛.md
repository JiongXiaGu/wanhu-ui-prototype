# Phase 3 Batch 14：Work Surface 所有权收敛

## 接手与范围

接手 main 为 `366fa69f5cf67960a0e2f67d30bbab996cb94dcb`。本批只处理 Work / Catalog Surface 的所有权与失效兼容层，不重做 Workspace 布局、Card 结构、Blueprint 4:3 Preview、Source Badge、Management Topic 或用户自选颜色，也不提前进入 Phase 4 Control 状态整理。

## 盘点结果

按 `src/main.tsx` 加载顺序对照：

1. `workspace-world-first-glass.css`：Workspace 内容前景与交互局部语义；
2. `wanhu-edge-elevation.css`：较早加载的历史 Edge / Elevation Pass；
3. `wanhu-surface-system.css`：最后加载的正式 Work Surface Owner。

发现两类债务。

第一类是 Surface System 中 14 个 Workspace 兼容定义。实际 Workspace 内容仍消费 `--workspace-paper / --workspace-text / --workspace-muted / --workspace-faint / --workspace-jade`，这些值已经由 `workspace-world-first-glass.css` 定义；Surface 中的重复定义没有必要。其余 9 个名称已经没有 Runtime Consumer：

```text
--workspace-glass-surface
--workspace-glass-body
--workspace-glass-rail
--workspace-glass-card
--workspace-glass-card-hover
--workspace-edge
--workspace-rule
--workspace-gold
--workspace-gold-soft
```

第二类是 `wanhu-edge-elevation.css` 对 `.workspace--design`、Header、Primary Rail、Context Filter 写入另一套 border / box-shadow。由于该文件比 Surface System 更早加载，而且正式 Surface Selector 更具体，这些声明已经不是当前最终值，但源码仍会误导后续 AI 以为 Work Surface 有第二套正式配方。

## 处理

Runtime 提交：`cfdf0ad0a481e237a530923643aaa56eb614c0a8`。

- 从 `wanhu-surface-system.css` 删除 14 个 Workspace 兼容定义；
- 保留 `workspace-world-first-glass.css` 中真实消费的五个内容前景变量，不把内容层强塞进 Surface Recipe；
- 删除 `wanhu-edge-elevation.css` 中失效的 Design Workspace Edge / Shadow / Separator 配方，并留下明确所有权注释；
- 正式 Work Root / Header / Body / Rail / Filter / Card 继续直接消费 `--wanhu-surface-work-*`，最终 Recipe 数值没有调整；
- 对 9 个已退役桥接名新增完整名称 Guard，防止重新建立第二套 Work Surface。

## 防回退与验证

视觉治理回归从 98 项增加至 109 项：

- 9 项逐名验证旧 Work Surface Bridge 的定义与引用都会失败；
- 1 项验证正式 `--wanhu-surface-work-*` Recipe 与 Workspace 内容变量继续允许；
- 1 项验证完整标识符边界，避免前后缀误判。

Build #1539，Run `36005674047` 全部通过：

- 109 tests / 109 pass / 0 fail；
- Runtime CSS scanned: 64；
- Legacy palette debt files: 0；
- Retired Work Surface aliases guarded: 9；
- Visual governance ratchet: PASS；
- Building Selection / Scheme / Placement：11 checks PASS；
- World Utility / Demolition：8 checks PASS；
- `tsc -b && vite build` 通过。

UI Review #483，Run `36005674329` 全部通过。下载并实际查看：

- `workspace-pager-review` Artifact `10810294605`：`workspace-pager-design.png`；
- `blueprint-workspace-review` Artifact `10810213623`：`blueprint-workspace-all.png`。

对应 Tool Usability Report 为 `errors: []`。实际页面中 Work Surface 外框、阴影、Header / Rail / Filter 层次、Pager、Design 列表与 Blueprint Media Card 均未发现因本批清理出现的明显回退。

本批没有做逐像素 Diff，也没有将 Web Playwright Review 解释为 Unity 6.6 Player、URP Blur 成本或最终设备表现验证。

## 下一批

继续 Phase 3，但切换到 Context / Environment Surface。先盘点 Weather 的内容变量与 Context 材质桥接，再决定哪些别名可以删除；保持当前 Root / Header / Body / Footer、Noise、Edge、Shadow、Filter 与昼夜覆盖结果，不把参数控件配色混入 Surface Batch。
