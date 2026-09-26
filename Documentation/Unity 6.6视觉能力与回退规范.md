# Unity 6.6 视觉能力与回退规范

《万户天工》当前目标运行时为 **Unity 6000.6.2f1 + URP + UI Toolkit**。Web 仓库负责美术、比例、信息架构、交互与迁移依据，不维护正式 Unity USS 镜像。

本文件记录项目级迁移决策。除非明确写有 Player / Editor 实测结论，否则“官方支持某能力”不等于本项目已经通过运行时验证。

## 判断优先级

涉及 USS / UI Toolkit 能力时统一按以下顺序判断：

1. **本项目 6000.6.2f1 实测结果**；
2. Unity 对应版本官方文档；
3. Web CSS / 浏览器能力；
4. 历史聊天、旧交接或其他 Unity 版本经验。

项目实测与跨版本文档出现差异时，以当前项目安装版本实测为准。未来升级 Unity 6.7 后重新验证，不提前把 6.7 能力写成 6.6 已可用。

## 6000.6.2f1 当前兼容基线

### 背景渐变

当前项目 **不能直接依赖 CSS 背景渐变**。6000.6.2f1 实测会拒绝 USS 中的：

- `linear-gradient()`
- `radial-gradient()`

因此全屏底色、按钮、选中卡片、Media Card 遮蔽等核心视觉不得以渐变成立。优先使用：

- 明确的 `background-color`；
- 透明度；
- 实线边缘；
- 独立 Overlay VisualElement；
- 小型纹理 / Sprite / Painter2D，仅在确有必要时使用。

Unity 6.7 文档已经提供 UI Toolkit Gradient Background 说明，但必须等项目实际升级并完成 Player / Editor 复核后再决定是否解除本限制：

- https://docs.unity.com/en-us/engine/6000.7/manual/uitoolkits/uielements/uie-uss/properties/uib-styling-ui-backgrounds

### Shadow 与边框

6000.6.2f1 不按完整 CSS 处理 `box-shadow`、Inset / Spread 和 `border-style`。Unity 的 `filter: drop-shadow(...)` 与 CSS 矩形 `box-shadow` 不是一回事。

设计层级必须首先依靠：

- Surface 明暗与 Alpha；
- 实线 Border；
- 独立背景 / Edge Element；
- 必要时 9-slice / Sprite / 自定义绘制；
- 原生 `drop-shadow` 仅作为可替代的外部柔阴影候选，并需要 Unity 实测。

不能让 Hover / Selected / Focus 只有复杂阴影存在时才可辨认。

### Filter

Unity 6.6 内置 Filter 能力不等于完整 CSS Filter 集。本项目当前的 `brightness()` / `saturate()` 依赖自定义滤镜实现，因此：

- 新设计不把它们作为每个按钮、列表项、Card 都能任意组合的基础状态语言；
- 普通 Hover 优先使用前景色、Surface Tint、Overlay、Opacity；
- 共享材质确有需要时，由 Surface 契约集中持有滤镜链；
- Feature 不私有复制同一套滤镜配方。

### Backdrop Filter

`backdrop-filter` 可以保留为共享 Surface 的静态能力，但不是普通颜色属性。

当前约束：

- 只在 URP + Screen Space Runtime Panel 的适用范围内考虑；
- 非 URP / World Space 不能把它作为必要表现；
- 新增 Blur Owner 必须进入共享 Surface 契约；
- 不对 Blur Radius 做 USS Transition；
- 入场与退场继续使用 Opacity + Translate；
- 可读性必须在“Blur 完全关闭”时仍成立。

Dialog / Pause 当前不额外模糊自身后方 UI，是项目美术与成本选择，不表示引擎完全不支持。

### USS 变量

USS 不是完整 CSS 变量系统。Web 原型不要把迁移成立建立在以下写法上：

- `rgb(var(--channels))`
- `rgba(var(--channels))`
- 使用 CSS 数学函数对变量做颜色或几何计算

共享 Token 应尽量直接提供最终语义值，例如完整 RGBA、长度或时间，而不是拆成需要浏览器二次计算的通道。

## Unity 6.6 Visual Parity

正式 Web Runtime 是 Unity 6000.6.2f1 最终 UI 的布局 / 美术 / 交互参考。目标不是“Web 保留增强、Unity 提供降级”，而是 **Web 与 Unity 的正式视觉结果尽量一致**。

允许 Web 与 Unity 使用不同技术实现同一视觉，例如 CSS 背景色对应 USS `background-color`，或 Web / Unity 共用同一张 PNG / 9-slice / Sprite；但正式 Web 美术不应长期依赖 Unity 6.6 无法等价复现的浏览器专属效果。

对以下能力采用统一策略：

- Gradient：正式视觉确有价值时转为 Web / Unity 共用资产或共享绘制方案；价值不高时改为纯色 / Alpha / Border，不保留 Web 独占渐变。
- CSS `box-shadow` / Inset / Spread：改为实线 Edge、独立结构元素、共用 Sprite / 9-slice 或经过项目验证的 Unity 等价方案。
- `brightness()` / `saturate()`：改为明确状态色、Overlay、Alpha 或集中材质方案，不让普通控件依赖浏览器 Filter。
- Blur / Backdrop：只保留已经明确具有 Unity 6.6 对应实现路径的共享 Surface 能力；正式视觉不得在 Blur 关闭后改变信息层级。
- CSS 变量组合：Web 可使用变量组织代码，但迁移契约提供最终语义值，不要求 USS 执行浏览器式颜色数学。

共享 Segmented / Slider 已先建立无 Gradient / box-shadow 也能成立的状态语言；该工作作为向 Visual Parity 迁移的过渡证据。后续应继续调整正式 Web 样式本身，使正常 Web 截图直接接近 Unity 6.6 目标，而不是长期保留两套视觉。

## Surface 决策

继续使用 Ambient / Context / Work / Blocking / Elevated 五类职责，均属于中性烟墨材质家族。

- 可读性由 Tint、Overlay、Edge 与前景层级保证，Blur 只负责弱化世界细节；
- 新增 Blur 只能经共享 Surface 契约批准，不在按钮、列表行和缩略图上单独创建滤镜；
- Context / Workspace 保留适度背景感，阅读 Body 比 Header 更稳；
- Dialog 与 Pause Panel 保持无颗粒，不因引擎新增能力重新增加磨砂装饰；
- 半透明放在材质背景，不使用父节点整体 opacity 让文字和控件一起变淡；
- Shadow / Gradient / Filter 不得成为唯一的 Selected / Focus / Hierarchy 信号。

## 回退与性能

Unity 落地时默认先验证项目当前安装版本的原生实现；原生能力不能满足性能、构图或目标平台时，再选择共享回退方案。

低画质路径至少提供稳定的：

- 中性 Tint；
- 清晰前景；
- 实线 Edge；
- 简化阴影或无阴影；
- 无 Blur 模式。

不能让低画质关闭滤镜后文字依赖世界背景颜色。

Unity 验证应覆盖：昼夜世界、UI-over-UI、半透明与圆角边缘、1920×1080 / 2560×1440 / 3840×2160、键鼠与手柄 Focus、Disabled，以及 UI Toolkit Profiler / Frame Debugger。

## USS 所有权

Theme / Typography 定义语义值；Surface 持有完整材质与滤镜配方；Controls 持有内部结构和 Hover / Selected / Focus；Feature 只负责内容布局与必要业务差异。

不得新增末尾“美化覆盖文件”绕过这些 Owner。

Web CSS 不与 USS 逐字等价。Grid、伪元素、Mask、渐变、复杂 Shadow、Browser Filter 和浏览器字体特性都必须能够说明 Unity 映射。

## 当前 CI 策略

W2 Visual Parity 已完成存量分类，`audit:unity` 已从 Telemetry 升级为 **按文件 + 规则类型的精确 Ratchet**。

当前规则：

- 正式 Runtime 的 `linear-gradient()` / `radial-gradient()`、`brightness()` / `saturate()`、`rgb/rgba(var())` 与 Backdrop Transition 基线为 0，不允许重新出现；
- 现存非空 `box-shadow`、`filter: drop-shadow(...)`、CSS math + var() 与静态 `backdrop-filter` 按文件记录，属于 Web World Adapter、Surface Enhancement 或 Layout Adapter，不视为正式 Unity USS 方案；
- 新文件出现任何受跟踪兼容债务直接失败；
- 既有文件的任一指标增加直接失败；
- 任一指标减少时，同一 PR 必须同步收紧 `UNITY_PARITY_BASELINE`，避免以后回涨到旧上限；
- Backdrop Owner 同时受 Owner Allowlist 与精确声明数量双重约束，当前只保留真实仍有声明的 7 个文件。

Ratchet 保护的是“债务不扩散”，不是要求 Web 与 USS 逐字相同。World Preview / Selection 等 Web Adapter 后续可以继续减少，但 Unity 侧应由 Renderer / Gizmo / Overlay 等对应职责实现。

## 官方参考

- Unity 6.6 USS Properties Reference: https://docs.unity.com/en-us/engine/6000.6/manual/uitoolkits/uielements/uie-uss/properties/reference
- Unity 6.6 Built-in Filters: https://docs.unity.com/en-us/engine/6000.6/manual/uitoolkits/uielements/uie-uss/uss-filter/built-in-filters
- Unity 6.6 Backdrop Filter: https://docs.unity.com/en-us/engine/6000.6/manual/uitoolkits/uielements/uie-uss/uss-filter/backdrop-filter
- Unity 6.6 Custom Properties: https://docs.unity.com/en-us/engine/6000.6/manual/uitoolkits/uielements/uie-uss/variables/custom-properties
- Unity 6.7 UI Backgrounds / Gradients: https://docs.unity.com/en-us/engine/6000.7/manual/uitoolkits/uielements/uie-uss/properties/uib-styling-ui-backgrounds

旧交接或开发记录中涉及 Blur / Shadow / Gradient / Filter / USS Variable 的结论，以本文件和对应安装版本实测为准。
