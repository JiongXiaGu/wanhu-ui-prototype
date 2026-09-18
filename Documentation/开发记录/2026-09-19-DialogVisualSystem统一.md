# 2026-09-19 Dialog Visual System 统一

本轮将全局弹窗从历史绿黑 Blur 皮肤迁入正式 Smoked Graphite / Paper White / Aged Brass 视觉系统，并按 Unity UI Toolkit 的真实约束取消 UI-over-UI Blur。

## 修改

- Dialog Backdrop 改为中性半透明 Dim，移除 `backdrop-filter: blur(...)`；
- Dialog Surface 改为半透明 Smoked Graphite，自身通过 Tint / Edge / Shadow 保证可读性；
- 删除旧绿黑 Gradient 与可见颗粒磨砂 Noise，改成更干净的烟墨板材质；
- 新增 Header 语义 Tone：Neutral / Warning / Danger；
- Warning 使用弱熟铜 Header Tint + 2px 状态线；Danger 使用弱朱砂 Header Tint + 2px 状态线；
- Timed Display Confirmation 与覆盖存档进入 Warning；永久删除进入 Danger；普通输入 / 普通确认保持 Neutral；
- Dialog Radius 统一为 12px，Button / Input 使用当前 10px Control 语言；
- Input Default 中性，Focus 才出现弱熟铜；
- Text / Number Input 已直接迁入共享 `TextInput`，删除 Dialog Input 的兼容桥接皮肤；
- Confirm / Text / Number / Binding / Timed Confirmation 继续共享唯一 `DialogFrame`；
- Toast 同步收束为中性 Smoked Graphite 家族；
- 新增 Dialog Token，并由 `wanhu-surface-system.css` 正式持有材质；
- Playwright 增加 Confirm / Number / Timed / Text / Binding 的真实截图与 computed-style 门槛；
- 自动审查强制验证 Dialog Backdrop 与 Surface 均无 Blur、Surface 为半透明中性 Graphite。

## Visual Review 修复

- Warning / Danger 截图审查按真实交互路径执行：先选择 Save Card，再进入覆盖 / 删除 Action；
- 未选中卡片的 Action 保持隐藏且不可点击，Visual Review 不绕过该状态；
- Save Card stacking order 明确：整卡选择层在底层，Action 层高于选择层；
- Action 区从整卡 Select Hit Area 中物理剔除，使选择与操作拥有独立点击区域；
- 不使用 Playwright force-click 绕过交互状态。

## CI

- Dialog Tone 审查扩展后，完整 Visual Review 已接近原 6 分钟上限；
- Visual Review workflow 超时由 6 分钟调整为 10 分钟，保留完整截图链路，不删除审查项换取速度。

## Unity 落地

正式 Unity 实现不依赖模糊背景 UI。Modal Layer 只负责 Dim；Dialog Panel 自身必须完成可读性与层级表达。
