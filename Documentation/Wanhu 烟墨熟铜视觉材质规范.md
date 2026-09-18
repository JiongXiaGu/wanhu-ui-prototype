# Wanhu 烟墨熟铜视觉材质规范

本规范是《万户天工》UI 的**配色与材质权威来源**。它定义全游戏共享的基础色相、Surface 身份、前景层级与状态金属语言；具体页面的几何、信息架构和交互仍由各自组件规范负责。

Design Workspace 当前已经形成较稳定的视觉结果，因此后续 Gameplay Surface 统一以 **Workspace 的烟熏 Graphite / 雾面工作玻璃**作为 Work Surface 的视觉锚点。Environment、Camera、Placement、HUD、Inspector、Settings 等不再各自发展独立灰、绿、蓝皮肤。

## 1. 核心身份：Smoked Graphite + Aged Brass

《万户天工》的 UI 不是仿古卷轴，也不是现代 SaaS 毛玻璃。目标是：

> **烟墨石质的中性工作表面 + 暖纸前景 + 少量熟铜状态，形成克制、有重量、像仪器而不像网页的策略游戏 UI。**

可以借鉴《冰汽时代》有效的“物理重量、仪表感、中性色与金属状态”，但不复制工业钢铁主题；《万户天工》使用更温和的烟墨、旧石、熟铜与纸白。

稳定原则：

- 世界画面提供主要色彩，UI 本身主动退后；
- 结构 Surface 使用**中性或略暖 Graphite**，不得肉眼读成青绿 / 墨绿 / 蓝灰主题；
- Paper White 承担阅读，Aged Brass 只承担 Selected / Focus / On / Primary / Current；
- Cinnabar 只用于真正 Warning / Danger；
- 不用资源分类色给人口、金钱、库存等常驻 UI 分配不同 Hue；
- 角色差异主要由 Surface Density、明度、Shadow、Local Occlusion 与信息密度表达，而不是换主题色；
- Blur 只弱化世界细节，不负责基础可读性；
- 昼夜使用同一套色彩语义，不维护独立 Night Theme。

## 2. Palette

以下是视觉目标参考值，用于建立色相关系；最终 Web / Unity Token 可以在同屏 Review 中微调明度和 Alpha，但不得改变语义。

| Role | Reference | 用途 |
| --- | --- | --- |
| Ink Deep | `#171A19` | 最深遮蔽 / Shadow 基底 |
| Graphite Deep | `#242725` | 深层 Surface |
| Graphite | `#2E312E` | 主烟墨材料 |
| Smoke | `#3E413C` | 较轻 Header / Hover |
| Paper Primary | `#EEE9DF` | 标题、核心数值 |
| Paper Secondary | `#B9B5AB` | 普通正文、参数 |
| Muted | `#8C8F89` | 次级标签、默认 Icon |
| Aged Brass | `#A88752` | Selected / On / Focus |
| Brass Highlight | `#C0A064` | 强状态 / Primary |
| Cinnabar | `#985447` | Danger / Warning |

### 2.1 Surface Hue 不变量

结构性 Surface 的 R / G / B 应保持接近，允许非常轻的暖偏移，但不允许靠明显 `G > R` 或 `B > R` 建立身份。

尤其在《万户天工》大量植被、农田、河岸背景下：

> **Surface 必须有足够自己的中性 Tint，不能让世界绿色透入后把面板整体染成绿色。**

如果 Context Panel 在绿色世界背景上肉眼读成“墨绿 UI”，应优先调整 Surface 自身中性色与视觉密度，而不是继续降低 Alpha 或增加 Blur。

## 3. Workspace 是 Work Surface 视觉锚点

当前 Design Workspace 的稳定观感作为后续统一参照：

- Root / Header：较轻的烟熏 Graphite；
- Body：更稳、更深的中性 Graphite；
- Header 与 Body 属于同一 Hue，只用轻微明度 / Density 差建立层级；
- 默认 Asset / Rail 不形成卡片海；
- 暖金只出现在 Active / Current / Focus；
- 世界仍可感知，但正文区域不被世界色彩污染。

“以 Workspace 为锚点”不是冻结某个具体 RGBA，而是冻结以下关系：

> **中性略暖 Graphite + 克制透景 + 明暗分层 + 少量熟铜状态。**

## 4. Surface Family

所有 Surface 共享同一 Smoked Graphite Hue。层级差来自视觉重量，不来自换色。

### Ambient

用于 Compass、System Menu、World Utility、Operation Hints 等低干扰常驻 UI。

- 世界感最强；
- Surface 最轻；
- 前景仍必须可读；
- 不因为“轻”而让 Icon / Text 一起变透明。

### Context

用于 Environment、Camera、轻量 Selection / Scene Control。

Context 是**轻量仪器面板**，不是绿色玻璃。

- 与 Workspace 使用同一 Hue；
- 视觉重量低于 Work，但阅读稳定性仍应接近 Work；
- “更轻”不等于必须显著降低 Alpha；
- 面板后方世界细节不能直接穿入正文区域；
- Header 可比 Body 亮约一个轻微层级，Body 稳定承载参数。

Context 相对 Work 的目标是：

> **约 85–90% 的阅读稳定性，明显更轻的任务重量。**

这个比例是视觉关系，不是 CSS Alpha 公式。

### Work

用于 Design Workspace、Main Dock、Placement 工作主控等持续操作区域。

- 当前 Workspace 是主要视觉母版；
- 比 Context 更稳定；
- Body 保证高密度阅读；
- 不使用纯黑桌面应用窗口。

### Blocking

用于 Management、Pause、Settings、Archive 等需要明显压住世界的重空间。

- 同一 Graphite Hue；
- 更高密度；
- 世界仍可作为环境上下文，但不干扰阅读；
- 不切换成另一套菜单主题色。

### Elevated

用于 Asset Inspector、Popover、Dialog 等覆盖其它 UI 的表面。

- 同一 Hue；
- 通过 Local Occlusion、Edge、Shadow 与较高实度建立高度；
- 不依赖第二次 UI-over-UI Blur；
- 不通过独立蓝 / 绿 / 黑皮肤表达“浮层”。

## 5. Context Panel 视觉母版

左下 Environment / Camera / Placement Parameter 等 Context Surface 后续统一遵循：

### 5.1 Root / Header / Body

- Root 使用 18px 大 Surface 圆角语义；
- Header 与 Body 不换 Hue；
- Header 可比 Body轻微提亮约 4–6%；
- Header / Body 之间只用弱 Rule，不做明显色条；
- Body 可以比早期 Context 更实，优先保证参数稳定阅读；
- Edge 只承担玻璃轮廓与方向性高光，不形成完整亮框。

### 5.2 Section

- Section 默认透明；
- 只通过间距、标题、极弱 Rule 分组；
- 不为每个 Section 创建独立 Card；
- 普通 Section 不使用暖金边线。

### 5.3 Weather / Preset Choice

Environment 的天气预设不应继续表现为一排持续存在的小玻璃 Card。

默认：

- Icon + Label；
- 背景接近透明；
- Hover 才出现极弱 Smoke Tone；
- Current 使用熟铜文字 / Icon、短状态线或极弱暖金 Tone；
- 不用七个独立圆角 Box 抢视觉焦点。

大量选项不强行伪装成 Segmented Control；Segmented 仍只服务少量 2–5 项互斥模式。

### 5.4 Parameter Controls

参数控件继续消费共享 Control System。

Context 高密度参数建议：

- Empty Track：中性纸灰；
- Progress：中性浅灰或极低饱和熟铜；
- Thumb：Paper White；
- Focus / Dragging：熟铜；
- Stepper：低存在感烟墨按钮；
- Value：稳定 Paper Secondary / Primary。

一屏大量 Slider 时，不应让每条轨道长期呈现高亮金色。

## 6. Edge / Noise / Shadow

### Edge

- 使用低对比暖纸灰；
- 高透明 Surface 可稍增强轮廓；
- 不使用粗完整亮边；
- Elevated 可以比 Context / Work 更清楚，但仍克制。

### Noise

- 只提供极弱雾面材料感；
- 不成为可识别颗粒图案；
- 同一共享纹理服务整个家族，不按页面复制纹理方案。

### Shadow / Local Occlusion

- Ambient 最弱；
- Context 轻；
- Work 稳定；
- Elevated 最明显；
- UI-over-UI 浮层优先增加 Local Occlusion，而不是申请更强 Blur。

## 7. 状态色

### Default

Paper / Neutral Gray。

### Hover

提高一档前景与极弱 Smoke Tone，不使用暖金证明“可点击”。

### Selected / Current / On

Aged Brass + 极弱暖金 Tone / 状态线。

### Focus

细熟铜 Ring / Line，必须服务键盘与手柄。

### Primary

Brass Highlight 只用于当前页面或任务唯一推进动作。

### Danger

Cinnabar 只用于不可逆或真正危险操作。

一句话：

> **熟铜表达状态，不表达“这是一个按钮”。**

## 8. 昼夜

昼夜不切换 Palette。

夜景允许：

- 小幅提高 Surface 自身亮度或密度；
- 小幅增强 Edge；
- 保持 Paper / Muted / Brass 对比关系。

禁止：

- 夜晚换一套蓝色 / 绿色 Theme；
- 夜晚单纯降低 Panel Alpha；
- 依赖背景刚好够亮来维持可读性。

## 9. Blur

正式 Unity 使用共享 URP Blur Service / Fullscreen Pass：

```text
World Camera
↓
Shared Scene Blur
↓
UI Toolkit Panel
   ├ Surface Tint
   ├ Edge
   ├ Noise
   └ Content
```

Blur Texture 默认只包含世界场景，不假设已经绘制的 UI 会再次进入 Blur。

Surface 自己必须保证基础可读性；Blur 是环境增强，不是材质本体。

## 10. 代码所有权

长期目标：

```text
wanhu-theme-tokens.css
        ↓
wanhu-surface-system.css
        ↓
ui-control-system.css
        ↓
Component Geometry CSS
```

- Theme：Palette、材质 Token、状态色；
- Surface：Ambient / Context / Work / Blocking / Elevated Recipe；
- Control：Slider / Toggle / Select / Button 状态；
- Component：尺寸、间距、布局与业务结构。

组件 CSS 不重新定义自己的绿色 / 蓝色 / 金色 Theme。

## 11. Review 门槛

涉及 Gameplay Surface 的重要视觉调整，至少同时检查：

- 白天 Workspace；
- 白天 Environment / Camera Context；
- 夜晚 Workspace；
- 夜晚 Environment / Camera Context；
- Main Dock / HUD 与以上 Surface 同屏关系；
- Selected / Hover / Focus 是否仍只有少量熟铜；
- 绿色植被背景下 Context 是否仍读成中性 Graphite。

关键判断：

1. Environment 与 Workspace 是否一眼属于同一家族？
2. Context 是否更轻，但没有变成透明绿玻璃？
3. Workspace 是否仍然是世界上的“工作玻璃”，而不是黑色窗口？
4. Surface 身份是否来自 Density / Elevation，而不是 Hue？
5. 世界是否仍是画面主体？
