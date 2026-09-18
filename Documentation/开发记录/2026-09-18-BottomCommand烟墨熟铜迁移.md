# 2026-09-18 Bottom Command 烟墨熟铜迁移

本轮把 Main Dock（L）、Placement Action Bar（M）、World Utility（S）从历史深青 / 墨绿 Command Palette 迁入统一 Smoked Graphite 家族。

## 所有权

```text
Theme Tokens
  → L / M / S Density + Brass State
Surface System
  → L / M / S Root Material
Component CSS
  → Geometry + Business State Geometry
```

`gameplay-hud-layout.css` 不再拥有 Command Palette；`bottom-command-system.css` 不再拥有 Root Material。

## 视觉关系

- L：较轻 Work；
- M：Focused Work，最稳定；
- S：Ambient，最轻；
- 三者同 Hue；
- Active / Toggle On 使用 Aged Brass；
- Quick Action 中性；
- Placement Confirm 是唯一 Primary，但不做亮金大按钮。

## Review

新增 `capture-bottom-command-system-review.mjs`，覆盖 Gameplay / Building / Road 的白天与夜晚，并检查：

- RGB 中性；
- 14px 共享 Radius；
- Noise Material；
- L/M/S Density；
- Active Line；
- Mode / Quick Action 语义。
