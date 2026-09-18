# Gameplay 采用烟墨熟铜材质母版

## 决策

《万户天工》Gameplay UI 的正式材质身份统一为：

**Smoked Graphite / 烟墨石质 + Paper White / 暖纸 + Aged Brass / 熟铜。**

Design Workspace 当前稳定的视觉结果作为 Work Surface 的主要锚点。Environment、Camera、Placement、HUD、Dock、Inspector、Settings 等后续都从同一材质母版派生，不再维护独立绿色、蓝色或灰色主题。

## 原因

早期 Context Surface 通过偏青 Tint、更低 Alpha 和较强世界透入制造“玻璃感”。在《万户天工》大量植被、农田和河岸场景中，这会让 Environment 等面板肉眼读成墨绿色，与已经趋于中性 Graphite 的 Workspace 产生明显割裂。

统一后：

- 世界继续承担主要色彩；
- UI 的结构 Surface 保持中性或略暖 Graphite；
- Context 的“轻”通过视觉重量表达，不机械等于更低 Alpha；
- Work 通过更高阅读稳定性表达持续任务；
- Blocking / Elevated 仍使用同一 Hue，只增加 Density / Occlusion / Shadow；
- 熟铜只表达 Selected / On / Focus / Primary；
- 昼夜保持同一 Palette。

## 约束

- 结构 Surface 不得明显读成绿色 / 蓝色 Theme；
- 世界颜色不能成为 UI 本身的主 Tint；
- Context 与 Workspace 必须一眼属于同一材质家族；
- 不通过每个页面独立调 Hue 来建立身份；
- 不用传统纹样、木纹、卷轴、粗金边替代材质层级；
- Unity 正式实现继续使用共享 URP Scene Blur，不为每个 Panel 单独 Blur。
