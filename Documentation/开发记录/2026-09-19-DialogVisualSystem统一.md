# 2026-09-19 Dialog Visual System 统一

本轮将全局弹窗从历史绿黑 Blur 皮肤迁入正式 Smoked Graphite / Paper White / Aged Brass 视觉系统，并按 Unity UI Toolkit 的真实约束取消 UI-over-UI Blur。

## 修改

- Dialog Backdrop 改为中性半透明 Dim，移除 `backdrop-filter: blur(...)`；
- Dialog Surface 改为半透明 Smoked Graphite，自身通过 Tint / Noise / Edge / Shadow 保证可读性；
- 删除旧绿黑 Gradient 与顶部装饰金线；
- Dialog Radius 统一为 12px，Button / Input 使用当前 10px Control 语言；
- Input Default 中性，Focus 才出现弱熟铜；
- Text / Number Input 已直接迁入共享 `TextInput`，删除 Dialog Input 的兼容桥接皮肤；
- Confirm / Text / Number / Binding / Timed Confirmation 继续共享唯一 `DialogFrame`；
- Toast 同步收束为中性 Smoked Graphite 家族；
- 新增 Dialog Token，并由 `wanhu-surface-system.css` 正式持有材质；
- Playwright 增加 Confirm / Number / Timed / Text / Binding 的真实截图与 computed-style 门槛；
- 自动审查强制验证 Dialog Backdrop 与 Surface 均无 Blur、Surface 为半透明中性 Graphite。

## Unity 落地

正式 Unity 实现不依赖模糊背景 UI。Modal Layer 只负责 Dim；Dialog Panel 自身必须完成可读性与层级表达。
