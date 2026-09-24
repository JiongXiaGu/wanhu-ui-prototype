# Phase 2 Batch 11：Command 语义收敛与审计回归

## 接手事实与范围

接手时 main 为 `aa6d0e2ffc82377ed8d835b618f7e96b055a8587`。Phase 1 的退役共享 Palette 已清零；从 `5fcc2694c9df0daf00ad2d4ae744d282f44d947c` 到该基线的 8 个提交，已经完成 Command Runtime 视觉兼容别名迁移及第一版 Guard。交接入口仍停留在 Phase 1，需要补齐验证与文档，而不是重复替换一次颜色。

本次补强提交为 `15518d4af1f6e558b92fdf8127b5795d95bafb19`。仅修改审计脚本、新增 CLI 回归测试并接入 Build，不改变 `src`、公共资源、依赖、CSS 加载顺序或页面交互。

## 已收敛的所有权

`src/main.tsx` 的实际顺序是 Feature CSS 在前，随后 Theme / Visual / Controls，再加载局部材质与结构层，正式 `wanhu-surface-system.css` 位于后部；不能把职责图误认为加载顺序。

Main Dock、Secondary Action Bar、Utility Toolbar 与 Tooltip 直接消费正式 Command 状态和 Palette；Theme 中的 26 个旧 Command 视觉别名及 Surface 中的对应重绑定已退役。变化集中在旧名字到正式语义的读取链，不新建第二套 Palette，不把 L / M / S Bottom Command 表面合成同一个材质。

几何仍由原 Owner 持有。`--command-radius`、`--command-icon-size`、`--command-divider-height` 等不属于被退役的视觉别名；Main Dock、二级动作栏、右下 Utility 的宽高、排列、位置和标签不变。

## 审计补强

原规则对少数别名增加了临时负向条件，但其它组仍可能把长变量名的前缀当作退役名称。现在对所有 Command 视觉别名统一做完整标识符边界匹配。失败信息同时报告命中的组、次数及实际变量名，避免只知道“某文件失败”却无法定位。

旧 RGB 检测此前只覆盖紧贴左括号的逗号分隔 `rgba` 写法。现在同一退役 Hue 的 `rgb / rgba`、逗号/空格、前导空白/换行、斜线 Alpha 与整数等值小数写法都进入同一 Guard。只扩展原有三组退役 Hue 的数值 RGB 字面量检测，不按“颜色相近”拒绝 Topic、Source 或用户内容色。

这仍不是完整 CSS 颜色求值器，不宣称覆盖百分比通道、HSL、计算表达式等所有等价表达。`src/review/` 继续排除；运行时递归扫描和空 Baseline 保持。

新增 `scripts/audit-visual-governance.test.mjs`。测试在独立临时目录构造 CSS，并运行真实审计 CLI，不复制匹配实现，不写入项目 `src`；有超时和 finally 清理。61 项覆盖退役的 26 个 Command 名称、几何与正式 Token、完整变量名边界、旧共享变量和 HEX、三组旧 Hue 的不同 RGB 写法、相邻数值/内容色，以及 Runtime / Study / 非 CSS 的扫描边界。

Build 在 `audit:visual` 前运行：

```sh
node --test scripts/audit-visual-governance.test.mjs
```

## 构建与回归证据

本地执行了上述依赖无关的 CLI 测试，61 项全部通过。没有把本地单元测试写成完整应用本地构建；完整检查使用 GitHub Actions 的实际结果。

[Build #1529](https://github.com/JiongXiaGu/wanhu-ui-prototype/actions/runs/35994984450) 对应审计提交 `15518d4af1f6e558b92fdf8127b5795d95bafb19`，已完成且成功。实际日志确认：

- CLI 回归：61 passed，0 failed，0 skipped；
- `audit:visual`：64 个 Runtime CSS，退役 Palette 债务文件 0，9 组 Command 视觉别名防回退，PASS；
- `icons:check`、`audit:scale`、`audit:unity` 均通过；
- Tool Usability 130 项、Building Selection 11 项、World Utility 8 项均通过；
- TypeScript + Vite 生产构建通过。

既有字号/迁移债务和 Vite 大体积 Chunk 提示不在本批范围；Guard 通过不表示它们已经清零。

## 视觉证据与实际查看范围

[Build #1528](https://github.com/JiongXiaGu/wanhu-ui-prototype/actions/runs/35984361650) 与 [UI Review #480](https://github.com/JiongXiaGu/wanhu-ui-prototype/actions/runs/35984361499) 均成功。受测分支头为 `0de7a7a490d1383979d8fb491feb55d4c1a0962d`。已核对 [PR #18](https://github.com/JiongXiaGu/wanhu-ui-prototype/pull/18) 的实际补丁：相对接手 main 只给 `.github/workflows/ui-review.yml` 增加 PR 触发的两行，应用源码相同。

本次下载了该次运行的 `main-dock-review`、`secondary-action-review`、`hover-surface-review` 三组 Artifact，并实际打开以下 1920×1080 完整日间截图：

- `main-dock-design.png`、`main-dock-blueprint.png`；
- `secondary-action-terrain.png`、`secondary-action-color.png`、`secondary-action-building-selection.png`；
- `secondary-action-building-placement.png`、`secondary-action-road.png`、`secondary-action-tree.png`、`secondary-action-city-wall.png`；
- `hover-tooltip-utility.png`、`hover-design-accent.png`。

所查看场景中，烟墨表面、文字层级、低面积熟铜强调与既有底栏构图保持；未发现明显的遮挡、溢出或整块表面发金。这里记录的是实际图片检查，不是逐像素前后对比，也不是本次重新运行完整昼夜/缩放矩阵。

本批新增内容只有 Guard / 测试 / CI / 文档，Runtime 与 UI Review #480 的应用源码一致，因此没有把旧截图冒称为新提交重新出图。未进行 Unity Player 验证。

PR #18 已关闭、未合并；保留验证历史分支，不强制重置。临时 PR 触发没有进入 main。

## 下一批边界

Phase 2 Batch 12 先盘点 HUD 前景色的兼容别名和实际 Consumer，再以同值映射收敛文字、图标和强调色。尚未完成全量 Consumer 盘点，不在这里列成已核验的批量替换清单。

HUD Surface、昼夜透明度/Filter、Management Topic、Source Badge、用户自选颜色不随前景别名顺手修改。继续维持共享精确值归 Theme、材质归 Surface、几何归既有 Component 的边界。
