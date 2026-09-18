# 2026-09-18 Left Context Numeric Layout 修复

## 问题

共享 Numeric Slider 重构后，`RuntimeParameterRow` DOM 已变为：

```text
RuntimeParameterRow
├ Label
└ NumericSliderField
   ├ -
   ├ Slider
   ├ +
   └ Value
```

但 Left Context CSS 仍使用历史五列 Grid：

```text
Label | - | Slider | + | Value
```

导致 Camera / Environment 在参数行右侧保留三列无效空间，Environment 400px 面板出现明显右侧空白。同时 Stepper / Value 的 Context 样式仍使用旧 direct-child Selector，已经选不中当前 DOM。

## 修复

- Left Context Row 恢复共享两列结构，不覆盖 `grid-template-columns`；
- 通过 `--ui-parameter-label-width:86px`、`--ui-parameter-step-size:28px`、`--ui-parameter-value-width:50px` 调整 Context 密度；
- NumericSliderField 内部 Gap 调整为 5px；
- Stepper / Value Context Selector 改为 `.ui-numeric-slider-field > ...`；
- Environment 继续保持 400px，不用缩面板掩盖布局问题；
- Camera 同时获得相同修复；
- 删除已不被 Runtime Import 的 `advanced-parameter-panels.css`，避免旧 RightEdgeFlyout Slider 被误认为第二套正式控件。

## Review

Left Context Review 新增自动断言：

- Parameter Row 必须只有两个直接子节点；
- computed Grid 必须只有两列；
- NumericSliderField / ValueField 右边缘必须贴合 Row 右边缘；
- Slider 可用宽度至少 96px；
- Environment Width 保持 400px。
