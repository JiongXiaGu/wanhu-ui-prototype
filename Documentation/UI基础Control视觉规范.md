# UI 基础 Control 视觉规范

## 1. 目标

本规范定义《万户天工》所有基础交互控件的共享视觉与交互语法，覆盖 Web Prototype 与最终 Unity UI Toolkit。

目标不是让所有控件长得完全一样，而是让相同语义只维护一套视觉状态与代码契约，避免 Settings、Gameplay Tool、Context Surface、Archive、Dialog 等空间继续复制 Slider / Select / Toggle / Input。

共享视觉代码：

- `src/ui/ui-control-system.css`
- `src/ui/Controls.tsx`

页面 CSS 只负责布局、宽度、Label 列、内容密度等 Context Geometry，不重新定义基础材质与状态色。

## 2. 视觉原则

- 黛墨 / 玉青 Surface；
- 暖金只用于 Fill / Selected / On / Focus / Primary；
- Track / Border 在夜景下仍必须可辨认，但不靠强 Glow；
- Hover 提升可操作性，Focus 必须能服务键盘 / 手柄；
- 圆角层级保持克制：普通 Field 10px，内部按钮 / Option 8px；
- 控件视觉尺寸可以小，但交互 Hit Area 不能过小；
- 同一控件在不同页面允许尺寸档位不同，但状态语法不变。

## 3. Slider

### 3.1 使用场景

用于连续或准连续数值：

- Camera FOV / 高度 / 俯角；
- Weather 云量 / 风力 / 日内时间 / 季节进度；
- Building Placement 旋转 / 吸附 / 层高 / 屋顶参数；
- Road Placement 宽度 / 标高 / 曲线平滑；
- Settings 音量 / 灵敏度 / UI 缩放等。

离散且选项极少的值不要为了“统一”强制用 Slider，优先 Segmented / Select。

### 3.2 基线

- Visual Track：约 4px；
- Hit Area：约 24px 或更高；
- Thumb：默认约 11px，Hover / Focus 可提升到约 13px；
- Fill：低饱和暖金；
- Empty Track：低亮纸灰 / 玉青；
- Focus：弱暖金 Ring，不使用高亮粗描边；
- Disabled：整体降低透明度，但仍保留当前数值关系。

### 3.3 结构

Web：

```text
SliderControl
├ Track
│ └ Fill
├ Thumb
└ native range input
```

隐藏的 native range 负责 Pointer / Keyboard / Accessibility；可视 Track / Thumb 只表达美术。

Unity：优先包装 UI Toolkit `Slider / SliderInt`，统一添加共享 USS Class，不在业务页面重复绘制 Slider。

## 4. Numeric Slider Field

游戏运行时最常见的参数结构：

```text
Label │ - │ Slider │ + │ Value
```

Web 当前共享实现：`RuntimeParameterRow`。

语义：

- `- / +` 是 Stepper One-shot Action；
- Slider 负责快速连续调整；
- ValueField 显示精确值；
- Label 与单位格式由业务提供。

建筑、道路、相机、天气等只配置：

```text
label
value
min
max
step
formatter
disabled
onChange
```

不要再为每个 Tool 创建自己的 Track / Thumb。

## 5. Stepper Button

用于 Numeric Field 的 `- / +`：

- 推荐 27–30px；
- 8px Radius；
- Default 保持低存在感；
- Hover 提升 Border / Text；
- Active 只做轻微位移；
- 不保留 Selected；
- Disabled 与所属 Field 同步。

不要把 Stepper 做成明显的 Primary Button。

## 6. Value Field

默认只读显示：

- 8px Radius；
- Tabular Number；
- 与 Stepper 同高度；
- 右对齐数值；
- Tool Parameter Panel 如果空间紧，可以用无边框透明变体。

以后确实需要直接输入数字时，再增加 editable 变体；不要默认让所有 Value 都变成文本输入框。

## 7. Select / Dropdown

### 使用场景

- 分辨率；
- 显示器；
- 语言；
- 质量档；
- 较多离散选项。

### 规则

- Trigger 10px Radius；
- Popup 与 Trigger 使用同一 Field Surface 家族；
- Popup 允许 Glass Blur；
- Selected 用暖金 Tone；
- Hover / Keyboard Highlight 使用中性提亮；
- 必须支持 Escape / Arrow / Enter / Space；
- 靠近屏幕底部时允许向上展开。

最终 Unity 建议封装 `DropdownField / PopupField`，不要在各 Settings 页面复制 Popup 逻辑。

## 8. Toggle

用于布尔状态：

- 开 / 关；
- 显示 / 隐藏；
- 启用 / 禁用某功能。

短胶囊 Track 是允许的语义例外，不代表整体 UI 进入大胶囊风格。

基线：

- Track 约 38×20；
- Thumb 约 12px；
- Off 使用中性灰；
- On 使用暖金；
- Track 只弱着色，不整块高亮。

Settings Toggle、Archive“隐藏过时存档”等应使用同一视觉 Token。

## 9. Text Input

共享：

- Text / Placeholder / Caret；
- Border；
- Focus Ring；
- Disabled；
- 10px Radius Token。

但根据职责分三类：

```text
TextField       常规输入，例如重命名 Dialog
SearchField     搜索，可更轻、更扁平
InlineRename    列表原地编辑，可弱化外框
```

三者共享状态语言，不要求 Box 完全一致。

## 10. Segmented Control 边界

Segmented 只用于 2–5 项互斥 Mode，例如：

- Camera View Mode；
- Weather Environment Mode；
- Building Placement 放置方式 / 柱网；
- New Game 选项。

不要把 Slider、Toggle、页面导航或 One-shot Action 塞进 Segmented。

Building Placement 的旧 `bp-segment` 已转向共享 `SegmentedControl`。

## 11. 代码所有权

### 共享层

`src/ui/Controls.tsx`：

- `SegmentedControl`
- `SliderControl`
- `RuntimeParameterRow`
- `SelectControl`
- `ToggleSwitch`
- `TextInput`

`src/ui/ui-control-system.css`：

- 基础 Control Token；
- Slider / Stepper / Value / Select / Toggle / TextInput；
- 迁移期间 Settings / Archive / Dialog 等旧结构的兼容桥接皮肤。

### Context 层

例如：

`src/tools/placement/placement-parameter-controls.css`

只定义：

- Label 列宽；
- Control 尺寸档；
- Row 高度；
- 是否使用 Borderless Value 变体。

不重新定义 Slider Fill / Thumb / Focus 色。

## 12. Unity UI Toolkit 映射

建议正式工程建立：

```text
UIControls.uss

.ui-slider
.ui-slider__track
.ui-slider__fill
.ui-slider__thumb

.ui-stepper-button
.ui-value-field

.ui-select
.ui-select__trigger
.ui-select__popup
.ui-select__option
.ui-select__option--selected

.ui-toggle
.ui-toggle--on

.ui-text-field
.ui-search-field

.ui-segmented
.ui-segmented__option
.ui-segmented__option--active
```

推荐 UXML / C#：

- `WanhuSliderField`：Slider + Stepper + Value；
- `WanhuSelectField`：统一 PopupField / DropdownField 包装；
- `WanhuToggle`：统一 Toggle 包装；
- `WanhuTextField`：TextField + 语义变体；
- C# 只绑定 Value、Range、Disabled、ReadOnly 与业务事件；
- Color / Radius / Hover / Focus 全部归 USS。

不要在 BuildingTool、RoadTool、Weather、Settings 各自复制一套 USS。

## 13. 当前迁移状态

已完成：

- `RuntimeParameterRow` 进入共享 Slider / Stepper / ValueField；
- Building Placement Numeric Control 共用共享 Slider；
- Building Placement Segment 共用 `SegmentedControl`；
- Road Placement Numeric Control 共用共享 Slider；
- Camera / Weather 的 Runtime Parameter 继续使用同一共享 Slider；
- Settings Slider / Select / Toggle 暂时保留成熟的页面交互逻辑，但视觉已经通过共享 Token / Compatibility Bridge 对齐；
- Archive Toggle、Dialog Input、Archive Inline Input、Workspace Search 已开始消费共享 Field Token。

下一阶段：

- 将 Settings 的本地 Slider / Select / Toggle React 逻辑逐步迁入共享 Component；
- Dialog Text Input 改为直接使用 `TextInput`；
- 清理 `tool-overlay.css` 中不再运行的旧 `.parameter-row / .segment / .track`；
- 清理 Settings / Archive 中被共享 Control 完全替代的旧视觉声明。

## 14. 夜景要求

基础控件不能依赖世界背景亮度来维持可读性。

夜景中：

- Empty Track 仍应可辨；
- Thumb 与 Value 不能消失；
- Focus 仍使用低强度暖金；
- Select Popup / Text Field 自己保持稳定玉青 Tint；
- Blur 只提供环境色，不负责对比度。
