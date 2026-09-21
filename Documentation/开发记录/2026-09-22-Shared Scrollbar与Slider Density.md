# Shared Scrollbar 与 Numeric Slider Density 收敛

本轮不重新设计 Slider，而是完成共享所有权收口。

- `ui-control-system.css` 新增 `ui-scroll-region`，统一 6px Scrollbar、Thumb 与 Hover；Settings 删除私有 scrollbar 样式，LeftContextPanel Body 默认消费共享 Scrollbar。
- NumericSliderField / RuntimeParameterRow 增加 `density = standard | compact`。
- Standard：Stepper 30px、Value 68px，Settings 与 Building Selection / Building Appearance 使用。
- Compact：Stepper 28px、Value 58px，并保持更高的 Slider 命中高度，Placement / Road 等工具使用。
- Placement Feature CSS 只保留 Label Width、Row Height 等业务布局，不再持有 Slider 内部列尺寸或 Slider 高度。

Unity 迁移时保持相同语义：ScrollView/Scroller 与 NumericSliderField Variant 由共享 USS 表达，Feature 只选 Variant。
