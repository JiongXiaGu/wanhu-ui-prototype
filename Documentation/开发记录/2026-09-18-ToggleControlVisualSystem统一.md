# 2026-09-18 Toggle Control Visual System 统一

本轮只重做共享 `ToggleSwitch`，不修改页面信息架构。

## 审查结论

正式持续布尔 Toggle 已经集中在：

- Settings；
- Load / Save 的“隐藏过时存档”。

World Utility 的 Grid / Snap、Placement Mode、Weather Preset 等虽然存在 `aria-pressed`，但属于 Toggle Button / Mode / Selected Card，不迁成 Switch。

## 新 Toggle

- Hit Area：52×32；
- Track：38×20；
- Thumb：14×14；
- 删除 Track 中间 Groove / `::before` 轨道线；
- 删除复杂 Track / Thumb 渐变；
- Off：中性 Graphite + Paper Gray Thumb；
- On：极弱 Brass Track + Brass Thumb；
- Hover：只增强 Border / Track；
- Focus：弱 Brass Ring；
- Disabled：统一透明度衰减。

## 清理

删除 Archive 旧 `.archive-hide-outdated > i > em` Toggle 皮肤，避免迁移 Unity 时出现两套 USS。

## Review

新增 `capture-toggle-system-review.mjs`，自动验证：

- Settings Off / On；
- Focus；
- Disabled；
- Load Off / On；
- Save Off；
- 52×32 / 38×20 / 14×14 Geometry；
- 无 `::before` Groove；
- 无 Track / Thumb Decorative Gradient；
- Settings / Load / Save computed visual 一致。
