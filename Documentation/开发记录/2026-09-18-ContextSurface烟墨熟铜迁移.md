# 2026-09-18 Context Surface 烟墨熟铜迁移

本轮以 Design Workspace 为 Work Surface 视觉锚点，重做左下 Environment / Camera Context 的材质关系。

## 目标

- Context 与 Workspace 一眼属于同一 Smoked Graphite 家族；
- 去掉早期偏青绿 Surface 对植被背景的放大；
- Context 的“轻”通过任务重量、Header / Body Density 和较弱 Shadow 表达，而不是继续降低 Alpha；
- Environment 天气预设从持续 mini-card 改为轻量 Choice；
- Context 参数 Slider 保持中性 Track / Paper Thumb，熟铜只集中到 Current / Focus / Dragging；
- `weather-art-pass.css` 不再拥有 Panel 材质，只保留日内 / 季节语义轨道。

## 所有权

```text
wanhu-theme-tokens.css
  → Context palette / density tokens

wanhu-surface-system.css
  → Context Root / Header / Body / Footer material

gameplay-context-panel.css
  → Shared geometry + compact control geometry

weather-mist-glass.css
  → Weather preset / summary business content

weather-art-pass.css
  → Time / season semantic gradients only
```

## Review

Visual Review 新增白天 Environment / Workspace 成对截图，并断言 Context Surface RGB 通道保持接近中性；Night Review 同样检查夜景 Context 不发生绿色 / 蓝色偏移。
