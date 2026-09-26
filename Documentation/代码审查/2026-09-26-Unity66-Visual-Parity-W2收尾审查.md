# 2026-09-26 Unity 6.6 Visual Parity W2 收尾审查

本审查基于 main `66fda4df46494c81ac75b1b1979031a43c039be1`，用于完成 W2.12。目标是冻结已经分类的 Web / Unity 兼容存量，不再把历史 Web Adapter 当成可以继续增长的预算。

## 结论

W2 Visual Parity 可以收口并转入 W3 Typography / Text Layout Parity。

当前正式 Runtime 已达到：

- Linear Gradient：0
- Radial Gradient：0
- brightness()：0
- saturate()：0
- rgb/rgba(var())：0
- Backdrop Transition：0

仍存在但已分类的迁移存量：

- 非空 box-shadow：21
- 非空 CSS filter：3
- CSS math + var()：22
- backdrop-filter 声明：45，集中在 7 个既有 Owner

这些不是“批准继续使用的新视觉语言”，而是明确的 Web Adapter / Enhancement / Layout 存量。Unity 最终实现按职责映射，不要求逐字翻译为 USS。

## 分类

### World Adapter

用于世界预览、对象选择、摄影辅助或场景 Handle。Unity 侧由 Renderer / Gizmo / Overlay / 世界空间表现接管。

包括：

- Building Selection
- Terrain Edit
- Tree Placement
- Color Tool Lighting / Scheme 场景 Handle
- Blueprint Photography

### Surface / Content Enhancement

去掉后核心层级仍由 Tint / Alpha / Border / 结构成立。Unity 可使用共享 Surface、Sprite、9-slice 或经实测的原生能力替代。

包括：

- Workspace / Work Glass
- Material Preset / Building Scheme 内容预览
- Fullscreen Action 装饰
- Persistent HUD / Management / New Game / Loading 的既有 Backdrop Owner
- `wanhu-surface-system.css` 共享 Surface

### Layout Adapter

CSS `calc/min/max/clamp` + var() 用于 Web 几何计算。Unity 迁移时解析为确定 UXML / Flex / C# 几何，不要求 USS 复制浏览器数学。

包括 HUD Layout、Top Shell、Context Panel、Settings、City Wall 参数与共享 Control / Motion。

## Ratchet 规则

`scripts/audit-unity-migration.mjs` 中的 `UNITY_PARITY_BASELINE` 是当前精确基线。

- 新文件出现受跟踪债务：失败。
- 既有文件任一指标增加：失败。
- 既有文件任一指标减少但未同步收紧基线：失败。
- Backdrop 只允许当前实际仍有声明的 7 个 Owner，同时冻结各文件声明数。
- Gradient / brightness / saturate / rgba(var()) / Backdrop Transition 当前为 0，后续不得回流。

这样可以保证后续正常制作 UI 时，兼容债务只会减少，不会因为旧上限仍有余量而反弹。

## 下一阶段

W3 不再继续逐页面清 Shadow。优先建立 Typography Fixture，检查 Font Asset / fallback、Baseline、ascender / descender、line-height、letter-spacing、Icon + Label 对齐、中文数字英文混排以及 1080p / 4K 像素取整，再从共享文字规则修正布局偏移。
