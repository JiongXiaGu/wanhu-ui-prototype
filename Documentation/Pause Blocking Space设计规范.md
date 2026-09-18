# Pause Blocking Space 设计规范

Pause 是 Gameplay 的最高优先级 Blocking System Overlay。它不是另一套主菜单皮肤，而是当前城市世界之上的系统级暂停状态。

## 1. 空间关系

```text
Gameplay World
  ↓ Scene Dim / Blur
Pause Blocking Space
  ↓ Pause Command Surface
Save / Settings Global Space
  ↓ Elevated Dialog
```

世界始终作为当前游戏上下文保留。Pause 不替换场景图，不维护独立昼夜 Theme。

## 2. Scene Dim / Blur

目标是“冻结世界”，不是把世界糊成抽象背景。

参考：

- Blur 约 9px；
- Brightness 约 .68–.72；
- Saturation 约 .72–.76；
- 中性烟墨 Dim；
- 极弱 Vignette 把注意力推向中央。

基础可读性仍来自 Pause Surface 自身，不依赖 Blur。

## 3. Pause Command Surface

1920×1080 基线：

- Width 约 432px；
- Radius 18px；
- Blocking Smoked Graphite；
- Paper Primary / Secondary；
- Aged Brass 只表达 Focus；
- 不使用旧横向渐隐条；
- 不使用独立绿黑 Theme；
- 不使用大面积暖金。

Material Owner：

```text
wanhu-theme-tokens.css
  ↓ Pause / Blocking Tokens
wanhu-surface-system.css
  ↓ Pause Command Surface Material
pause-layer.css
  ↓ Geometry / Typography / Motion
```

## 4. Header

结构：

```text
暂停
昭平城 · 第十二年秋
```

- 标题约 27px；
- 使用普通 UI 字体体系，不突然切 Serif；
- Meta 使用 Muted；
- 左对齐；
- 不加 Icon Chip / 梁线 / 纹样。

## 5. Command Hierarchy

固定：

```text
继续游戏
保存游戏
游戏设置

────────

返回主菜单
```

前三项属于当前游戏流程；返回主菜单属于离开当前游戏流程。

不要给每一行画 Divider。只在 3+1 两组之间保留一条弱结构线。

## 6. Focus / Pointer State

打开 Pause：

- 默认 Focus “继续游戏”；
- ↑ / ↓ 循环导航；
- Home / End 跳到首 / 尾；
- Enter / Space 使用原生 Button 行为。

Default：

- Transparent；
- Paper Secondary。

Hover：

- 中性 Blocking Row Hover；
- Paper 提亮；
- 不使用 Brass。

Focus：

- Paper Primary；
- 极弱 Brass Tone；
- 左侧 2px 短状态线。

“继续游戏”不使用永久 Primary Skin。

## 7. Esc 与 Secondary Views

- Pause Menu：Esc → 恢复游戏；
- Pause Save：Esc → Pause Menu；
- Pause Settings：Esc → Pause Menu；
- Dialog / Safe Confirmation 优先消费 Esc。

Pause Command Surface 与 Save / Settings 不同时存在。

用户已明确：**Pause Menu 不显示底部 Esc 返回游戏提示。**

## 8. 返回主菜单

Pause Menu 本体保持中性。

点击“返回主菜单”后进入共享 Confirm Dialog；真正的危险 / 不可逆语义在 Dialog 中表达，不让 Cinnabar 常驻 Pause Menu。

## 9. Motion

- Backdrop：100–140ms；
- Command Surface：140–170ms，Opacity + 约 5px Translate；
- Row Hover：约 110ms；
- 不使用 Scale、Glow 或逐项飞入。

## 10. Review 门槛

至少检查：

- 白天 Pause；
- 夜晚 Pause；
- 432px / 18px Geometry；
- 无 `pause-footer` / Esc 提示；
- 3+1 命令结构；
- 默认 Focus 在“继续游戏”；
- Arrow Up / Down 导航；
- Shared Noise / Blocking Material；
- 无旧 `90deg` 横向渐隐材质；
- Pause → Save / Settings → Pause 的 Esc 路径；
- 夜景状态在 Pause / Settings 往返中保持。
