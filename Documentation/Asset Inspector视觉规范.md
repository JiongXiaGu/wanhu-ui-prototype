# Asset Inspector 视觉规范

Asset Inspector 是绑定资产卡片的短时只读详情浮层。它用于点击前的快速决策，不承担确认、放置、购买或参数编辑。

## 层级定位

Asset Inspector 属于 Wanhu Mist Glass 的 **Elevated Glass**：

`World → Context / Work → Elevated Inspector`

它必须明显高于 Workspace，但仍与 Environment / Workspace 使用同一套中性石灰灰、Paper White、Muted Gray、Old Gold 语言，不设计独立蓝色、绿色或黑色皮肤。

## Unity UI Toolkit 约束

正式 Unity 实现以“共享场景 Blur，不模糊底层 UI”为前提：

- Blur 来源只有共享 URP Blur Service / Fullscreen Pass；
- Blur Texture 只包含场景，不假设其中已经包含 UI Toolkit 输出；
- Inspector 不能依赖“再把 Workspace / HUD 模糊一次”来建立层级；
- Inspector 不创建独立 RenderTexture 或第二条 Blur 链；
- Web Prototype 的 Inspector 明确禁用 `backdrop-filter`，用于模拟 UI Toolkit 的限制。

因此 Inspector 的层级主要由 **Local Occlusion + Surface Tint + Edge + Shadow** 建立，而不是更强 Blur。

## Local Occlusion

Inspector 覆盖的区域需要压低底层 Workspace UI 的可见度，否则资产名称、缩略图、Active 金线会穿过半透明 Inspector 干扰阅读。

Web Prototype 使用 Inspector 内部的局部半透明遮蔽层模拟这一行为。Unity 对应普通 `VisualElement`：

`InspectorRoot → OcclusionPlate → ElevatedSurface → Content`

OcclusionPlate：

- 与 Inspector 尺寸一致或略向内收；
- 不 Blur；
- 不接收输入；
- 中性深灰，中等 Alpha；
- 只遮挡 Inspector 正下方，不使用全屏 Scrim。

## Elevated Glass v1

人工审图后的正式基线以“底层 UI 不明显穿透”为优先，不追求 Inspector 自身的高透明度。

白天：

- Surface：`rgba(64,67,65,.84)`
- Local Occlusion：`rgba(18,21,20,.30)`
- Edge：`rgba(255,255,255,.28)`
- Rule：`rgba(255,255,255,.085)`
- Scene/UI Backdrop Blur：Inspector 自身为 `none`

夜晚：

- Surface：`rgba(72,75,73,.82)`
- Local Occlusion：`rgba(16,18,17,.32)`
- Edge：`rgba(255,255,255,.30)`
- Rule：`rgba(255,255,255,.095)`

阴影比 Workspace 明显一档；顶部只保留极弱纸白高光，不使用暖金描边。

这组参数的目的不是让 Inspector 变成不透明卡片，而是在 **UI Toolkit 无法模糊底层 UI** 的前提下，把 Workspace 的文字、缩略图和状态线压到约一成左右的残余可见度。

## 内容层级

默认结构：

`Title / Meta / Fact Grid / Description`

建议基线：

- Title：约 `15px / 600`，Paper White；
- Meta：约 `10.2px`，Muted；
- Fact Label：约 `10.5px`，Faint；
- Fact Value：约 `11px`，Paper White；
- Description：约 `10.6px`，Muted；
- 造价等少量关键值允许使用 Old Gold；不要让整行或整个 Inspector 变成金色。

Header 与 Facts 之间可以保留一条极弱 Divider；Facts 与 Description 主要依靠间距分组，不持续堆叠分割线。

## 几何与生命周期

- `min-width: 240px`；
- `max-width: 380px`；
- `min-height: 90px`；
- `max-height: 320px`；
- Gameplay Safe Edge：`16px`；
- Anchor Gap：`12px`；
- 定位优先：右 → 左 → 下 → 上，并 Clamp 到 Safe Edge；
- 首次 Hover 约 `280ms` 后显示；
- 已显示时在相邻资产间移动立即换内容；
- Keyboard / Gamepad Focus 立即显示；
- `pointer-events:none`，Unity 对应 `pickingMode=Ignore`；
- Card 点击进入 Tool 前清理 Inspector。

## Review 门槛

重要修改必须同时检查：

- 白天 Workspace + Inspector；
- 夜晚 Workspace + Inspector；
- Inspector 自身 `backdrop-filter:none`；
- Local Occlusion 存在且不是透明层；
- Workspace 文字、缩略图、Active 状态不会明显穿透干扰 Inspector 内容；
- Edge / Shadow 足以表达 Elevated 层级；
- 仍满足 Safe Edge、Intrinsic Size 与 Hover / Focus 生命周期。
