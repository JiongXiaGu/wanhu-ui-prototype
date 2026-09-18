# 2026-09-18 Settings 基础 Control 迁移

本轮把 Settings 从“页面内自建 Slider / Select / Toggle + 共享视觉兼容桥”迁入正式共享 Control System。

## 目标

- Settings 不再维护独立 Slider Pointer / Keyboard 逻辑；
- Select 不再维护独立 Popup / Keyboard / Outside Click 逻辑；
- Toggle 不再维护 Settings 专属 DOM 与状态皮肤；
- 保留 Settings 自己的全屏布局与控件密度，不把 Tool 的 Numeric Slider Field 生搬到设置页；
- 保持冷黛黑 / Paper / 熟铜视觉语义，并让控件材质更接近当前 Gameplay Context 的克制仪器感。

## 结构

共享逻辑与视觉：

- `src/ui/Controls.tsx`
- `src/ui/ui-control-system.css`

Settings 仅保留：

- `SettingRow` 数据与设置业务；
- 单列 Row Geometry；
- Slider / Select / Toggle 在 Settings 中的宽度与密度；
- Slider 的独立 Value 文本。

普通连续设置保持：

```text
Label │ Slider │ Value
```

运行时 Tool Parameter 才使用：

```text
Label │ - │ Slider │ + │ Value
```

两者共享同一个 Slider Primitive，但职责不同。

## Review

本轮 Review Scenario 覆盖：

- Display：共享 Select / Toggle；
- Graphics：共享 Slider + Toggle On / Off；
- Audio：连续 Slider 密度；
- Safe Confirmation：UI Scale Select 流程；
- Night Settings：共享控件在夜景 Blocking Surface 下保持可读。

重要 UI 修改继续遵守 `Documentation/UI原型复核流程.md`：先在 `tmp-*` 分支 Build + Visual Review + 实际审图，通过后再合入 `main`。
