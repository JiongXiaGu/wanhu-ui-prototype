# Pause Blocking Space 设计规范

Pause 是 Gameplay 的最高优先级 Blocking System Overlay。它不是另一套主菜单皮肤，而是当前城市世界被冻结后的系统层。

## 1. 空间关系

```text
Gameplay World
  ↓ Scene Dim / Blur
Pause Blocking Space
  ↓ Pause Command Surface

Pause Save / Pause Settings
  ↓ 仍保留同一世界上下文

Elevated Dialog
  ↓ 高于 Pause / Save / Settings
```

世界始终作为当前游戏上下文保留。Pause 不替换场景图，不维护独立昼夜 Theme。

## 2. Scene Dim / Blur

目标是“冻结世界”，而不是把世界糊成抽象背景。

1080p 参考：

- Blur 约 `9px`；
- Brightness 约 `.68–.72`；
- Saturation 约 `.72–.76`；
- 中性烟墨 Dim；
- 极弱 Vignette 将注意力推向中央。

基础可读性来自 Pause Surface 自身，Blur 只负责软化世界细节。

## 3. Pause Command Surface

1920×1080 基线：

- Width 约 `432px`；
- Radius `18px`；
- Blocking Smoked Graphite；
- Paper Primary / Secondary；
- Aged Brass 只表达 Focus；
- 不使用旧横向渐隐 strip；
- 不使用独立绿黑 Theme；
- 不使用大面积暖金。

正式所有权：

```text
wanhu-theme-tokens.css
  └ Palette / Pause Scene Filter / Material Values
        ↓
wanhu-surface-system.css
  └ Pause Blocking Material + Command State Tone
        ↓
pause-layer.css
  └ Geometry / Spacing / Typography / Motion
        ↓
PauseLayer.tsx
  └ Structure / Focus / Keyboard / Behavior
```

组件 CSS 不重新发明颜色或 Blocking Material。

## 4. Header

固定结构：

```text
暂停
昭平城 · 第十二年秋
```

规则：

- 标题约 `27px`；
- 使用普通 UI 字体体系，不突然切 Serif；
- Meta 使用 Muted Text；
- 左对齐；
- 不加 Icon Chip、梁线、纹样、英文眉题。

## 5. Command Hierarchy

固定为：

```text
继续游戏
保存游戏
游戏设置

────────

返回主菜单
```

前三项属于当前游戏内部流程；返回主菜单属于离开当前游戏流程。

不要给每条命令都画 Divider，只保留 3+1 两组之间的一条弱结构线。

## 6. Pointer / Focus State

打开 Pause：

- 程序化 Focus `继续游戏`；
- `↑ / ↓` 循环导航；
- `Home / End` 跳到首 / 尾；
- Enter / Space 使用原生 Button 行为。

Default：

- Transparent；
- Paper Secondary。

Hover：

- 中性 Blocking Row Hover；
- Paper 提亮；
- 不使用 Brass。

Focus / Keyboard Navigation：

- Paper Primary；
- 极弱 Brass Tone；
- 左侧约 `2px` 短状态线。

`继续游戏` 不使用永久 Primary Skin。Pause 的四个自解释命令不添加常驻说明文字或浏览器原生 title Tooltip。

## 7. Esc 与 Secondary Views

- Pause Menu：`Esc` → 恢复游戏；
- Pause Save：`Esc` → Pause Menu；
- Pause Settings：`Esc` → Pause Menu；
- Dialog / Safe Confirmation 优先消费 Esc。

Pause Menu 不显示底部 `Esc 返回游戏` 提示。

Save / Settings 打开后，Pause Command Surface 不与其同时显示，避免 Card 套 Card。

## 8. 返回主菜单

`返回主菜单` 在 Pause Menu 本体保持中性、较弱。

点击后进入共享 Confirm Dialog。确认语义由统一 Dialog System 表达，不让 Pause Menu 长期出现 Cinnabar 或大块危险色。

## 9. 昼夜

昼夜沿用同一 Palette：

- 同一中性 Graphite Hue；
- 同一 Paper / Muted / Brass 语义；
- 夜景只允许略提高 Surface Density，并调整 Scene Attenuation；
- 不建立蓝色 / 绿色 Night Pause Theme。

## 10. Motion

- Backdrop：约 100–140ms；
- Command Surface：约 140–170ms，Opacity + 约 5px Translate；
- Row Hover / Focus：约 110ms；
- 不使用 Scale、Glow、逐项飞入或弹跳。

## 11. Unity UI Toolkit 映射

推荐：

```text
PauseRoot
├ SceneBlockingLayer
└ PauseCommandSurface
   ├ Header
   └ CommandList
      ├ InGameCommandGroup
      ├ Divider
      └ ExitCommandGroup
```

- Scene Dim / Blur：共享 URP Fullscreen Pass；
- Surface Tint / Edge / Noise：共享 Blocking USS；
- Focus：C# / Input System 只切换状态 Class 或真实 Focus；
- Arrow / Home / End：输入导航逻辑；
- Esc：按 Pause View 状态回退；
- 不给每个面板创建单独 RenderTexture Blur。

## 12. Review 门槛

至少真实运行检查：

- `pause-day`；
- `pause-night`；
- `pause-save`；
- `pause-settings`；
- `pause-return-main-menu-dialog`。

同时检查：

- 432px / 18px Geometry；
- 无旧 `pause-footer` / Esc 提示；
- 无旧 `90deg` 横向渐隐材质；
- 3+1 命令结构；
- `继续游戏` 没有永久 Primary Skin；
- 默认 Focus 正确；
- Arrow Up / Down / Home / End 正确；
- Shared Noise / Blocking Material 存在；
- 日夜保持同一视觉语言；
- Pause → Save / Settings → Pause 的 Esc 路径正确；
- 返回主菜单确认由共享 Dialog System 提供。
