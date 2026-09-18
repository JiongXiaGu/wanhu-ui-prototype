# UI Surface 与 Control 视觉规范

本规范定义《万户天工》跨空间 Surface 层级、Blur、圆角、通用状态与页面 Action 语义。具体 Palette 与材质身份以 `Documentation/Wanhu 烟墨熟铜视觉材质规范.md` 为权威来源；Slider / Toggle / Select / Text Input 的细节以 `Documentation/UI基础Control视觉规范.md` 为准。

## 1. 总原则

- 所有结构 Surface 使用同一 Smoked Graphite / 烟墨材质家族；
- Surface 的职责差异主要由 Density、明度、Shadow、Local Occlusion 与信息密度表达，不靠明显换 Hue；
- Context 更轻是“任务重量更轻”，不等于必须显著降低 Alpha；
- 世界颜色可以作为环境信息透入，但不能把 UI 本身染成绿色或蓝色；
- Paper White 保证阅读，Aged Brass 只用于 Selected / On / Focus / Primary；
- 不给整个组件设置统一 `opacity` 来制造透明感；
- Blur 只弱化世界细节，不替代 Surface Tint；
- 昼夜不维护两套 Theme。

一句话标准：

> **同一块烟墨材料，根据任务强度形成 Ambient / Context / Work / Blocking / Elevated，而不是五套不同颜色的面板。**

## 2. 圆角层级

1080p 基线：

- `8px`：小型 Option / Auxiliary Action；
- `10px`：普通 Button、Segmented、Tooltip、小型输入控件；
- `14px`：Top Shell、Command Surface；
- `18px`：Workspace、Context Surface、Tool Parameter 等大型 Surface。

圆角表达层级，不要求所有 Card 使用同一 Radius。

## 3. Surface Tier

| Tier | 语义 | 主要 Consumer |
| --- | --- | --- |
| Ambient | 低干扰常驻辅助 | Compass、System Menu、World Utility、Operation Hints |
| Context | 临时观察 / 调整 | Environment、Camera、Workspace Header、轻 Selection |
| Work | 持续浏览 / 执行任务 | Workspace Body、Main Dock、Placement Action Bar、Tool Parameter |
| Blocking | 明显压住世界的重空间 | Management、Pause、Settings、Archive |
| Elevated | 覆盖其它 UI | Inspector、Popover、Dialog |

### Ambient

- 最轻；
- 世界感最强；
- Foreground 仍保持可读；
- 不把辅助层做成灰到消失。

### Context

- 与 Work 完全同 Hue；
- 视觉重量稍轻，但阅读稳定性接近 Work；
- 不允许因为世界背景是绿色而读成“绿色面板”；
- Environment / Camera 是左下 Context 母版。

### Work

- 当前 Design Workspace 是视觉锚点；
- 比 Context 更稳定、更适合高密度阅读；
- Body 可以比 Header 更实，但两者仍是一种材料。

### Blocking

- 同一 Graphite Hue 的高密度版本；
- 用于完整管理任务；
- 不切换成另一套“菜单皮肤”。

### Elevated

- 同一 Hue；
- 使用 Local Occlusion / Edge / Shadow 建立高度；
- 不要求再次 Blur 已绘制 UI。

## 4. Blur

### Gameplay Surface

Context / Work 可以保留适量世界环境感，但基础可读性来自 Surface 自身。

### Blocking

Pause / Settings / Archive / Management 更适合共享 Scene Blur / Dim，让世界整体先弱化。

### 禁止

- 每个 Button 自己 Blur；
- 每个 Panel 建独立 RenderTexture；
- UI-over-UI 申请第二次实时 Blur；
- 用 Blur 代替 Surface Tint。

## 5. Segmented Control

Segmented 表示 2–5 项局部互斥模式。

适合：

- Camera View Mode；
- Weather Scene Mode；
- Building Placement 局部模式；
- New Game 少量互斥档位。

不适合：

- One-shot Action；
- 页面主导航；
- 大量分类浏览；
- On / Off Toggle；
- 7 个以上的天气预设列表。

视觉：

- 外壳弱 Surface / Border；
- Option 默认透明；
- Hover 中性提亮；
- Active 使用极弱熟铜 Tone + 熟铜前景；
- 不额外叠加粗金边。

## 6. Button 语义

### Secondary

返回、取消、普通次级流程：

- 弱 Border / Surface；
- Hover 提升前景；
- 不常驻熟铜填充。

### Primary

当前页面唯一推进动作：

- 比 Secondary 强一档；
- 允许极弱熟铜 Surface / 状态线；
- 不使用厚金边或 Glow。

### Utility

恢复默认、重命名、低频辅助动作：

- 默认接近无框；
- Hover 才出现 Tone；
- 不长期占据视觉焦点。

## 7. Full-screen Action Footer

Settings / New Game / Load / Save 使用统一 `global-space-footer` 语义：

- 同一烟墨 Graphite 家族；
- 顶部弱 Rule；
- 不形成独立大黑条；
- Action 跟随页面 Content Safe Area；
- Settings 允许右侧为空，不为了对称制造按钮。

## 8. Bottom Command Visual System

Main Dock / Placement Action Bar / World Utility 是同一 Command 家族：

- Main Dock：Work；
- Placement Action Bar：稳定 Work；
- World Utility：Ambient。

共享 Hue、Edge、Hover、Active、Divider、Tooltip；尺寸和 Shadow 用于区分 L / M / S。

专用尺寸规则见 `Documentation/Bottom Command Visual System设计规范.md`。

## 9. 代码所有权

正式视觉层级：

```text
src/ui/wanhu-theme-tokens.css
        ↓
src/ui/wanhu-surface-system.css
        ↓
src/ui/ui-control-system.css
        ↓
Component Geometry CSS
```

- Theme：Palette / Material / State Tokens；
- Surface：五档 Surface Recipe；
- Control：基础交互控件视觉状态；
- Component：Geometry / Typography / Layout。

不要在 Component CSS 里重新发明另一套 Green / Blue / Gold Token。

## 10. Unity UI Toolkit 映射

建议正式 USS：

```text
UISurface.uss
UIControls.uss
BottomCommand.uss
FullscreenActions.uss
```

概念 Class：

```text
.ui-surface--ambient
.ui-surface--context
.ui-surface--work
.ui-surface--blocking
.ui-surface--elevated

.ui-button--primary
.ui-button--secondary
.ui-button--utility

.ui-segmented
.ui-segmented__option
.ui-segmented__option--active
```

Scene Blur 使用共享 URP Fullscreen Pass；Surface VisualElement 只声明 Tint / Edge / Noise / Density。

## 11. 审查清单

- Surface 是否属于明确 Tier？
- 是否仍使用中性 Smoked Graphite，而不是局部绿色 / 蓝色皮肤？
- Context 是否只是视觉重量更轻，而不是透到被世界染色？
- Workspace 与 Context 是否同一家族？
- Hover / Active 是否清楚但克制？
- 熟铜是否只表达语义状态？
- 夜景是否保持同一 Palette？
- 是否已有共享 Control / Surface 契约却又在业务 CSS 复制了一份？
