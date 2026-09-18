# Global Space Visual System 设计规范

Settings / Load / Save / New Game 属于同一类长时全屏系统空间。它们的信息架构不同，但视觉母版必须相同。

## 1. 共享契约

四页 Root 必须使用：

```text
.wanhu-global-space
├ .global-space-header
├ Page-specific Body
└ .global-space-footer
```

正式所有权：

```text
wanhu-theme-tokens.css
        ↓
wanhu-surface-system.css
        ↓
ui-control-system.css / ui-visual-system.css
        ↓
settings / archive / save / new-game geometry CSS
```

## 2. 必须一致

Settings / Load / Save / New Game 在相同视觉状态下必须共享：

- Smoked Graphite Hue；
- Global Noise；
- Scene Blur / Saturation / Brightness；
- Header Surface 与 Rule；
- Footer Surface 与 Rule；
- Paper Primary / Secondary / Tertiary；
- Brass / Cinnabar 状态语义；
- Secondary / Primary Button 视觉。

页面不得通过自己的 Root CSS 改写这些属性。

## 3. 允许不同

允许由业务决定：

- 内容宽度；
- 单列 / 双列结构；
- 列表、卡片、参数行的 Geometry；
- Settings Tabs；
- Load 游戏组列表；
- Save 当前游戏摘要；
- New Game 地图浏览 / 开局方案双栏结构。

## 4. 状态语义

- Default / Metadata：Neutral Paper；
- Hover：Neutral Graphite lift；
- Selected / Current / On / Primary：Aged Brass；
- Outdated：Muted Amber；
- Incompatible / Danger：Cinnabar；
- 不允许用绿色、蓝色或金色区分普通业务分类。

## 5. 昼夜

昼夜只通过全局 Token 调整 Density / Scene attenuation。Settings 与 Save 在同一夜景世界下必须计算为同一 Root / Header / Footer Material。

## 6. 验收门槛

Settings / Load / Save / New Game 必须继续遵守同一个 Global Space 所有权链：

- Root 使用 `.wanhu-global-space`；
- Header / Footer 使用共享 Global Space Class；
- Root / Header / Footer 材质由共享 Token / Surface System 持有；
- 页面 Geometry CSS 不重新定义独立 Root Theme；
- Build 必须通过。

不再要求 GitHub Actions Visual Review、computed-style Playwright 对比或截图 Artifact。
