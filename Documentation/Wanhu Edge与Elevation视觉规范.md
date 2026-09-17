# Wanhu Edge 与 Elevation 视觉规范

本规范建立在 Wanhu Mist Glass、Wanhu HUD Glass 与 Contrast / Identity 之上，正式解决“大面积 Surface 全部使用同一种白色 1px 外框”导致的网页面板感与角色同质化问题。

## 核心原则

1. **边缘不是统一描边，而是材质与高度的一部分。**
2. **统一光向：左上柔光，右下暗轮廓。** Directional Surface 使用左上亮、右下暗的非对称边缘。
3. **大面积 Work / Command / Utility Surface 默认 Borderless。** 它们依靠 Surface Tone、顶部微高光、暗下缘与 Shadow 建立边界。
4. **Elevated Surface 保留方向性 Contour。** Inspector 等覆盖其它 UI 的浮层必须有明确高度。
5. **内部结构线与外框分开。** Workspace 可以取消外框，但 Header、Rail、Filter 仍保留低亮度暗分隔。
6. **不改变既定 Blur 约束。** Unity 最终仍使用共享 Scene Blur；Inspector 不依赖 UI-over-UI Blur。

## 正式角色映射

### Top HUD：Directional Edge

顶部主状态栏采用 Directional Edge：

- Top：约 `rgba(255,255,255,.14)`；
- Left：约 `rgba(255,255,255,.09)`；
- Right：约 `rgba(8,11,10,.16)`；
- Bottom：约 `rgba(8,11,10,.24)`；
- Shadow 中等，保持悬浮信息层身份。

顶部第二排导航使用同一光向，但 Edge 与 Shadow 再弱一档，避免形成第二块同重量的面板。

### Workspace：Borderless Work Surface

Workspace 外壳不再使用完整白框：

- Outer Border：透明，保留 1px 几何槽位但不作为视觉结构；
- Shadow：中高，表达 Work Surface 与世界的分离；
- Top Highlight：通过 inset 高光表达；
- Bottom Contour：通过 inset 暗边表达；
- Header / Rail / Filter：使用低 Alpha 暗分隔，不恢复白色 Divider。

Workspace 的层级应主要来自 Header / Body Tone、内容排版、内部节奏与 Shadow，而不是框中框。

### Main Dock：Borderless Command Base

Main Dock 是高频操作基座：

- Outer Border：透明；
- Shadow 比 Workspace 更贴地、更紧；
- 上缘保留极弱高光；
- 下缘保留更明确的暗边；
- Active 状态继续使用低强度 Old Gold Surface + 状态线。

Dock 不应被读成另一块 HUD 窗口。

### Utility / Hint / Menu：Borderless Utility

这些 Surface 最轻：

- Outer Border：透明；
- Shadow 最弱；
- 依靠 Surface Tone 与前景对比保持可读；
- 不使用完整白色外框抢夺注意力。

### Asset Inspector：Directional Elevated Contour

Inspector 覆盖 Workspace UI，因此保留方向性 Contour：

- Top / Left：亮边；
- Right / Bottom：暗边；
- Shadow：全系统最明显的一档；
- Local Occlusion 继续存在；
- `backdrop-filter:none` 规则不变，不依赖再次模糊底层 UI。

## Elevation 层级

建议从低到高：

`Utility → HUD → Dock / Workspace → Inspector`

高度主要由以下变量组合表达：

- Surface Density；
- Edge Grammar；
- Shadow Radius / Offset；
- Top Highlight；
- Bottom Contour。

不要简单理解为“层级越高，白框越亮”。

## Unity UI Toolkit 落地

正式 Unity 实现优先使用普通 `VisualElement` 能力：

- Directional Edge：按 Top / Left / Right / Bottom 分别设置边框颜色；
- Borderless：保留透明边框或直接使用无视觉边框的 Surface；
- Internal Rule：独立 `VisualElement` 或单边 Border；
- Highlight / Contour：可用额外 1px 子元素或 9-slice 材质；
- Shadow：若目标 UI Toolkit 版本的原生阴影能力不足，使用 9-slice Shadow Sprite 或位于 Surface 后方的专用 Shadow VisualElement；
- Blur：继续由共享 URP Scene Blur Texture / Fullscreen Pass 提供，不为不同 Elevation 新建 Blur 链。

Web 原型里的 CSS `box-shadow` 是视觉参考，不是要求 Unity 必须使用同名属性实现。

## Review 门槛

重要修改至少检查：

- 白天与夜晚；
- Top HUD 是否仍有 Directional Edge；
- Workspace / Main Dock / Utility 是否没有结构性完整白框；
- Workspace Header / Filter 内部分隔仍然可见；
- Inspector 是否保持 Directional Elevated Contour；
- Shadow 层级是否符合 Utility < HUD < Work / Dock < Inspector；
- 不修改 Workspace 280px、Asset Card / Preview 64px 等既定几何；
- 不重新引入 UI-over-UI Blur 依赖。
