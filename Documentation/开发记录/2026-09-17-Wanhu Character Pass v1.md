# 2026-09-17 Wanhu Character Pass v1

本轮在 Wanhu Mist Glass、Contrast / Identity 与 Edge / Elevation 已稳定的基础上完成第一轮 Character Pass，没有继续调整大材质或既定布局。

## 本轮完成

- Top HUD：天气 / 时间改为信息组起始梁头锚点；资源组使用 10–12px 短结构接缝，不恢复完整 Divider。
- Design Workspace：标题 Character Marker 移到图标 / 起始边附近，避免读成标题下划线；Context Filter Active 使用更明确的 L-joint + Joint Node。
- Main Dock：保留台基式 Active，使用短基座 + 中央节点表达“承托 / 落位”，不回到完整 pill。
- Workspace 打开增加约 180ms 的 `opacity + translateY(6px → 0)` 落位动画；不 Scale Surface，并保持原有水平中心锚点。
- `prefers-reduced-motion` 下关闭 Character 装饰动画。
- `Documentation/Wanhu Character视觉规范.md` 已同步上述稳定规则。

Utility / Operation Hint 本轮继续保持无 Character 装饰。

## Review

临时分支：`tmp-character-pass-review-v2`

自动复核：

- Build：通过；
- Visual Review：通过；
- 新增断言覆盖天气锚点、资源短接缝、Workspace 中心锚点、标题梁头、Filter L-joint、Dock 台基尺寸与 reduced-motion。

人工审图覆盖：

- 白天普通 Gameplay；
- 夜晚普通 Gameplay；
- 白天 Workspace；
- 夜晚 Workspace。

审图结论：第一轮识别语言保持克制；夜景 Old Gold 未过亮；标题与天气标记不再明显读成普通文字下划线；Filter 结构关系在整屏尺度可辨认；Dock Active 保持当前方案。

## 复核流程修正

此前项目规范要求临时分支审图后再合入 `main`，但 Build / Visual Review 仅监听 `main`。本轮将两个 workflow 扩展为支持 `tmp-*` 分支，并让 Visual Review concurrency 按 Git ref 隔离，使“先临时分支复核、后合入 main”可以实际执行。
