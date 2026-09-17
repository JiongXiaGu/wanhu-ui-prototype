# Wanhu Mist Glass 视觉材质规范

Wanhu Mist Glass 是《万户天工》Gameplay UI 的共享玻璃材质语言。它不负责具体界面布局，而负责 Environment、Design Workspace、Asset Inspector、后续 Camera、Selection、Placement 等 Surface 在同一世界画面上的材质一致性。

## 核心原则

- 世界画面是主要美术内容，UI 负责组织信息，不用大面积插画或重色块替代世界本身。
- Environment、Workspace、Inspector 属于同一材质家族，不依靠不同色相区分；差异来自 Surface Tier、信息密度与职责。
- Context Surface 更轻、更透；Work Surface 更稳、更实；Elevated Surface 通过 Local Occlusion、Edge、Shadow 与局部实度建立层级。
- 色彩保持中性石灰灰，主文字使用 Paper White，Muted 信息使用中性暖灰；暖金只用于 Selected / Focus / Current / Primary 或少量关键值。
- 昼夜使用同一材质家族。夜景只做小幅亮度、Edge 与 Surface 修正，不建立第二套 Night Theme。
- Noise 只承担极弱雾面材质感，不承载内容，不应肉眼成为颗粒图案。

## v1 基准

经过 Environment + Design Workspace 的 A / B / C 白天与夜晚联合 Review，v1 采用高透明 C 档作为 Context / Work 默认基准。

### 共享色彩

- Paper White：`#f0ede6`
- Primary Text：`#d8d5ce`
- Muted：`#b7b4ad`
- Faint：`#92938f`
- Semantic Jade：`#9ea7a2`
- Old Gold：`#c9aa68`

玉青只用于少量语义图标；旧金不作为大面积装饰色。

### Environment / Context

白天：

- 主 Surface：`rgba(86,88,86,.31)`
- 二级 Card：`rgba(255,255,255,.040)`
- Hover Card：`rgba(255,255,255,.066)`
- Edge：`rgba(255,255,255,.22)`
- Rule：`rgba(255,255,255,.10)`
- Web Review Scene Blur：`26px`

夜晚：

- 主 Surface：`rgba(104,106,104,.29)`
- 二级 Card：`rgba(255,255,255,.046)`
- Edge：`rgba(255,255,255,.24)`
- Rule：`rgba(255,255,255,.11)`
- Web Review Brightness：约 `1.09`

### Design Workspace / Work

白天：

- Root Surface：`rgba(86,88,86,.34)`
- Body Surface：`rgba(54,57,55,.43)`
- Rail：`rgba(255,255,255,.014)`
- Asset Row：`rgba(255,255,255,.008)`
- Asset Hover：`rgba(255,255,255,.035)`
- Edge：`rgba(255,255,255,.22)`
- Rule：`rgba(255,255,255,.10)`
- Web Review Scene Blur：`26px`

夜晚：

- Root Surface：`rgba(104,106,104,.32)`
- Body Surface：`rgba(65,68,66,.42)`
- Edge：`rgba(255,255,255,.24)`
- Rule：`rgba(255,255,255,.11)`

Workspace 比 Environment 稍实，是因为它承担持续浏览与高密度阅读，不代表另一套颜色系统。

### Asset Inspector / Elevated

Asset Inspector 不依赖 UI-over-UI Blur。它必须在底层 Workspace UI 仍然清晰存在的条件下保持可读。

白天：

- Elevated Surface：`rgba(64,67,65,.76)`
- Local Occlusion：`rgba(18,21,20,.22)`
- Edge：`rgba(255,255,255,.26)`
- Rule：`rgba(255,255,255,.075)`
- Inspector 自身 Web `backdrop-filter`：`none`

夜晚：

- Elevated Surface：`rgba(72,75,73,.74)`
- Local Occlusion：`rgba(16,18,17,.26)`
- Edge：`rgba(255,255,255,.28)`
- Rule：`rgba(255,255,255,.085)`

Elevated 层级主要依靠局部遮蔽、Edge 与 Shadow，而不是申请更强的独立 Blur。详细规则见 `Documentation/Asset Inspector视觉规范.md`。

## 材质由五类变量共同决定

不要只用“透明度”描述玻璃。正式调节时应同时考虑：

1. **Tint / Surface Alpha**：决定世界透入程度和基本阅读稳定性；
2. **Scene Blur**：弱化世界细节，不替代 Surface 自身对比度；
3. **Edge**：在高透明情况下维持玻璃轮廓；
4. **Noise**：提供极弱雾面材质感；
5. **Shadow / Elevation / Local Occlusion**：表达 Workspace、Inspector、Popup 等高度关系并抑制底层 UI 干扰。

提高层级不等于提高 Blur。尤其是 UI 叠 UI 的浮层，不能假设底层 UI 会进入 Blur Texture；必要时应提高局部 Surface 实度并加入 Local Occlusion。

## A / B / C Review 档

`data-glass-study="a|b|c"` 仅用于视觉复核：

- A：旧版较厚灰板基准；
- B：中度透明过渡档；
- C：v1 选定 Context / Work 基准。

它们不是玩家主题，不进入 Gameplay 设置，不应发展成三套运行时 Skin。

## Unity UI Toolkit 落地

Web 的 `backdrop-filter` 只用于验证 Scene Glass 的视觉关系，不是 Unity 实现合同。

Unity 目标：

- 使用**单一共享 URP Blur Service / Fullscreen Pass** 提供场景级 Blur；
- Blur Texture 默认只包含场景，不假设其中包含已经绘制的 UI Toolkit；
- UXML / USS 负责 Surface Tint、Edge、Radius、Noise、文字与状态；
- `glass-noise-soft` 作为极弱可复用材质纹理；
- 不为每个 `VisualElement` 创建独立 RenderTexture / Blur 链；
- 不为了 Inspector / Popup 再创建第二次 UI Blur；
- Context / Work / Elevated / Blocking 等 Tier 使用共享 Token / USS Class，不复制完整面板样式；
- Elevated UI 使用普通 `VisualElement` Occlusion Plate + Surface + Shadow 建立高度关系；
- 夜景通过统一状态 Class / Token 做少量修正，不维护另一套 Night USS。

如果 Unity 最终 Blur 性能或平台能力不足，Surface Tint、Edge 与 Local Occlusion 本身也必须保证基础可读性，Blur 只作为场景增强层。

## 后续推广

当前视觉基准：

1. Environment / Context；
2. Design Workspace / Work；
3. Asset Inspector / Elevated。

后续按顺序推广到：

1. Camera Context Surface；
2. Placement Tool 参数面板；
3. Selection Inspector / Blueprint 等新增 Surface。

推广时优先复用这套材质 Token，不重新为每个模块设计独立灰色、蓝色或绿色皮肤。
