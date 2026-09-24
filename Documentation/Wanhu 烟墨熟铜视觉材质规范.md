# Wanhu 烟墨熟铜视觉材质规范

本文件维护《万户天工》UI 的共享色彩语义、材质配方与使用边界。整体视觉和页面家族见 [UI Toolkit 视觉总规范](<UI Toolkit视觉总规范.md>)；具体实现以源码为准，不能用文档里的概括覆盖组件的真实差异。

## 材质身份

主工作表面是低饱和烟墨灰，阅读前景为暖纸色浅字，熟铜负责状态与关键动作。世界画面和真实内容图像承担主要色彩。不是仿古卷轴、写实石纹、黑金手游，也不是所有元素都带发光边的玻璃皮肤。

“同一家族”不等于所有表面使用同一个 RGB。Context / Workspace 更中性、略暖；顶部常驻 HUD、Control Tray、Readout 仍有较轻、略冷的烟灰配方。不得据此扩大为整套蓝色科技风，也不得因旧文档禁止 `B > R` 就擅自重涂这些现存角色。

阅读密集区域应有自己的稳定 Tint，尤其不能因绿色植被透入就成为明显墨绿面板。任务重量通过面积、密度、遮挡、前景对比和阴影共同表达，不按 Surface 名称线性增加 Alpha。

## 色值的所有者

共享 Token 在 `src/ui/wanhu-theme-tokens.css`，主要 Surface Consumer 在 `src/ui/wanhu-surface-system.css`。局部前景还由 Controls、Workspace Skin、Hover 等模块持有。先读 `src/main.tsx` 的加载顺序，再追踪目标元素的选择器和作用域。

下面是当前源码原值，不是截图吸色，也不是可以忽略背景与叠层的最终像素。改动共享值时应同步此表。历史 `styles.css :root` 的 `--paper:#efe9dd`、`--gold:#c9a55f`、`--workspace:rgba(26,33,30,.95)` 不能作为新 USS 的默认配色；它们与当前 `--wanhu-*` 不是全仓库一一自动替换关系，部分旧消费者仍存在。

## 共享 Palette

以下 Token 均位于 `.game-canvas` 作用域。

| Token | 当前值 | 职责 |
| --- | --- | --- |
| `--wanhu-color-ink-950` | `#171a19` | 深墨基础色 |
| `--wanhu-color-ink-900` | `#242725` | 深层 Graphite 基础色 |
| `--wanhu-color-ink-800` | `#2e312e` | Graphite 基础色；不是所有面板的实际背景 |
| `--wanhu-color-paper-primary` | `#eee9df` | 核心文字与数值 |
| `--wanhu-color-text-secondary` | `#d4cfc6` | 普通正文、参数等主要阅读前景 |
| `--wanhu-color-paper-secondary` | `#c1bcb2` | 较弱的纸色前景 |
| `--wanhu-color-text-muted` | `#afb0a9` | 辅助阅读前景 |
| `--wanhu-color-paper-tertiary` | `#a2a49e` | 低优先级前景 |
| `--wanhu-color-icon` | `#9ca099` | 默认图标 |
| `--wanhu-color-icon-hover` | `#d8d3ca` | 中性提亮图标 |
| `--wanhu-color-brass` | `#a9844b` | 熟铜基础填色、状态线 |
| `--wanhu-color-brass-high` | `#c5a469` | 较强熟铜状态 |
| `--wanhu-color-brass-text` | `#d1b47a` | 小字号熟铜文字、独立 Focus 语义 |
| `--wanhu-color-brass-soft` | `rgba(169,132,75,.105)` | 弱熟铜染色 |
| `--wanhu-color-cinnabar` | `#985447` | 危险语义基础色 |

Paper Secondary 与 Text Secondary 是不同 Token，不能因为英文后缀相同就合并。Brass Text 也不是 Brass 的同义别名：小字需要更高亮度，不能直接使用较暗的填色值。

旧文档参考色 `#b9b5ab`、`#a88752`、`#c0a064` 已不代表当前对应 Token。共享表中不再列没有对应现行 Token 的“Smoke”色作为必须复制的数值。

## 主要 Surface 的原始底色与滤镜

本表是默认/白天配方的入口，不是完整材质的替代。完整 Edge、Shadow、Highlight、Shade 和状态值继续由对应 Token 与 Consumer 持有。

| Consumer / Token | 原始底色 | 当前 Web Filter |
| --- | --- | --- |
| Top Status / `--wanhu-surface-info-bg` | `rgba(25,31,33,.50)` | `blur(20px) saturate(.92) brightness(.98)` |
| Control Tray / `--wanhu-surface-control-bg` | `rgba(24,30,32,.41)` | `blur(20px) saturate(.93) brightness(.985)` |
| Context / `--wanhu-surface-context-bg` | `rgba(45,47,44,.89)` | `blur(16px) saturate(.82) brightness(.99)` |
| Catalog Root / `--wanhu-surface-work-sheet-bg` | `rgba(43,45,42,.78)` | `blur(20px) saturate(.86) brightness(.985)` |
| Catalog Body / `--wanhu-surface-work-body-overlay` | `rgba(21,23,21,.22)`，叠在 Root 内 | 不单独再 Blur |
| Main Dock L / `--wanhu-bottom-command-lg-bg` | `rgba(46,48,45,.58)` | `blur(20px) saturate(.86) brightness(.99)` |
| Action Bar M / `--wanhu-bottom-command-md-bg` | `rgba(43,45,42,.80)` | `blur(18px) saturate(.84) brightness(.99)` |
| Utility S / `--wanhu-bottom-command-sm-bg` | `rgba(48,50,46,.42)` | `blur(20px) saturate(.88) brightness(.995)` |
| Readout / `--wanhu-surface-readout-bg` | `rgba(22,28,30,.45)` | `blur(20px) saturate(.93) brightness(.985)` |
| Management / `--wanhu-management-surface-bg` | `rgba(39,41,39,.975)` | Panel 自身 `none` |
| Pause Panel / `--wanhu-pause-surface-bg` | `rgba(40,42,39,.955)` | Panel 自身 `none` |
| Global Space / `--wanhu-global-space-top` → `bottom` | `rgba(48,50,46,.94)` → `rgba(31,34,31,.965)` | `blur(7px) saturate(.78) brightness(.88)` |
| Select Menu / `--wanhu-surface-blocking-menu` | `rgba(34,36,33,.98)` | 不增加私有 Blur |

Context 的 .89 大于 Work Root 的 .78，说明“Context 更轻”是任务与构图关系，不是 Alpha 数值关系。不能为了满足一个想象的透明度阶梯而改代码。

## Root、Body 与背景合成

Context 实际组合为 Root 底色、Highlight / Shade 渐变、共享 Noise，再加 Header / Body / Footer 的局部叠层。Header 为 `rgba(255,249,238,.025)`，Body 使用 `rgba(8,10,9,.10)` 作为暗叠层端点。Section 默认透明，主要用留白、标题和弱分隔组织参数。

Catalog Root 在底色之上使用极弱亮暗渐变与 Noise；Body 再叠 `rgba(21,23,21,.22)`。不能只拿 Root 的 RGBA 就宣称还原了正文区域，也不能把 Body Overlay 当成独立面板底色。

普通 Alpha 合成可以帮助理解叠加关系，但完整页面还包含渐变、滤镜、纹理和世界背景。这里不把多层结果压成一个承诺到处一致的 HEX。半透明应放在背景/材质节点；常态下不要用父节点整体 opacity 让文字、图标一同褪色。Presence 动画和 Disabled 是另外的语义。

## Edge、Noise 与 Shadow

边缘用于交代轮廓与前后关系，不是装饰金框。当前 Context Edge 为纸色 .095，Work Edge 为 .045，Top Status 为 .12；差异是有意义的，不能用一个统一 Border Alpha 覆盖所有 Consumer。

共享 Noise 源为 `/assets/ui/materials/glass-noise-soft.png`，典型铺设尺寸 256×256，只提供很弱的表面变化。是否使用 Noise 由材质 Recipe 决定，不是所有 Panel 都自动附加：Dialog、Pause Panel 当前不铺颗粒，Management Panel 的正式 Consumer 也未使用该 Noise。

Shadow 与内高光必须查看最终 Consumer。`wanhu-edge-elevation.css` 比 `wanhu-surface-system.css` 更早加载；其中某个漂亮的旧阴影配方不一定仍是当前有效值。迁移时分别表达外投影、内高光与 Local Occlusion，不逐字把 CSS 多重 box-shadow 塞进一个 drop-shadow。

## Tooltip、Rich Hover、Popover 不共用一个背景值

| 对象 | 当前配方入口 | 重要差异 |
| --- | --- | --- |
| Tooltip | `--wanhu-command-tooltip-bg:rgba(25,26,24,.985)` | 深而实的小型只读解释；纸色弱边 |
| Rich Hover | `hover-overlay.css` 的 `.ui-hover-card` | 较亮灰底 + 内部暗遮蔽 + 浅边 + 投影 |
| Catalog Item Menu | `workspace.css` 的 `.workspace-item-menu` | `rgba(31,37,34,.985)`；可交互的局部菜单 |
| Select Menu | 共享 Blocking Menu Token | 高实度读数选择菜单，不使用 Rich Hover 的配方 |

Rich Hover 当前底色为 `rgba(64,67,65,.88)`，有共享 Noise；内部 `.ui-hover-card__occlusion` 为 `rgba(18,21,20,.30)`，向内缩 2px；外边为 `rgba(255,255,255,.26)`，圆角 14px。标题 `#f0ede6`、正文 `#b7b4ad` 等由 Hover 样式持有。这不是普通 Modal 的背景、不是只改透明度就能替换的 Tooltip，也不能把外层灰底当成其最终中心像素。

## Modal 与 Pause

真正阻塞 Dialog 和 Blueprint Editor 复用 `ui-modal-backdrop` / `ui-modal-surface`，而不是各自维护一套背景。

| Token | 当前值 |
| --- | --- |
| `--wanhu-dialog-backdrop` | `rgba(5,7,7,.89)` |
| `--wanhu-dialog-radius` | `12px` |
| `--wanhu-dialog-surface-bg` | `rgba(43,45,42,.95)` |
| `--wanhu-dialog-surface-highlight` | `rgba(255,249,238,.018)` |
| `--wanhu-dialog-surface-shade` | `rgba(8,10,9,.052)` |
| `--wanhu-dialog-surface-edge` | `rgba(238,233,223,.085)` |
| `--wanhu-dialog-surface-rule` | `rgba(238,233,223,.060)` |
| `--wanhu-dialog-surface-shadow` | `0 30px 80px rgba(4,6,5,.44), inset 0 1px 0 rgba(255,255,255,.024)` |

Backdrop 是高不透明近黑遮罩，不是纯黑屏；Panel 自身仍是烟墨灰。两个节点当前均不附加 backdrop Blur；Panel 不铺 Noise。不要用“以后引擎支持”作为重新添加多层磨砂的理由。

Pause 是独立 Screen Space，不套用小型 Dialog 的几何。默认 Pause 世界遮罩为 `rgba(12,14,13,.44)`，场景 Filter 为 `blur(8px) brightness(.70) saturate(.80)`；这是场景弱化，不是 Pause Panel 自己再 Blur。不能把“Pause Panel 无 Blur”写成“整个暂停画面没有 Blur”。

## 状态色与允许的内容色

普通 Hover：`--wanhu-control-hover:rgba(255,255,255,.045)`。Selected / On：`--wanhu-control-active-bg:rgba(169,132,75,.075)`，状态线为 `rgba(169,132,75,.78)`；Focus 独立表达，不代替 Selected。

Brass 服务 Current / Selected / On / Focus / Primary，以及已定义的警告和收藏等语义；不是所有可点击项、所有标题和所有边缘的默认色。

Gameplay Persistent HUD 继续遵守同一规则：速度当前档、Information View 当前项可使用熟铜 Selected / On；System Menu 普通 Hover 只做中性提亮和中性边缘。Compass 的“北”、北针和建造态南北轴属于方向内容强调，不是按钮 Hover，因此允许使用当前 Brass Hue，但不由此把 Compass 其它刻度、圆环或整块 Surface 染成金色。

Loading 是图片主导的外围 Screen，不属于 Global Space 或 Blocking Panel。进度条可以使用 Brass → Brass High → Brass Text 表达当前加载进程；Tip 普通 Hover 只提亮文字/底色，键盘 Focus 使用独立 `--wanhu-control-focus` 轮廓。不能因为进度条使用熟铜，就给整个 Loading 遮罩、提示区域或背景添加金色 Tint。

Dialog 的 Warning 与 Danger 不相同：

- Warning：Header Tint `rgba(169,132,75,.070)`，顶部细线 `rgba(189,153,89,.78)`，图标 Brass High；
- Danger：Header Tint `rgba(152,84,71,.075)`，顶部细线 `rgba(152,84,71,.86)`，图标局部前景 `#c87f73`；
- Body 保持中性，普通确认不凭空加警告色，危险不做闪烁和震动。

管理专题允许受控内容色：overview `#b3a07a`、civic `#b58d78`、economy `#b79255`、resource `#8f9c72`、governance `#8294a0`、defense `#aa6d62`。它们只进入 Header / 图表 / 数据强调，不改公共按钮和全页 Body。这些内容色不意味着另建六套 Theme。

Catalog 来源 Badge 也有共享局部前景：Compact Workshop 为 `#96a7aa`、User 为 `#b8a47d`；Media Workshop 为 `#a9b8bb`、User 为 `#c2ad82`。名称后的收藏星消费 `--wanhu-color-brass-text`，保持低权重且不添加 Glow。来源色由 `workspace.css` 持有，不把它们冒充全局 Brass / Focus Token。

## 昼夜

昼夜保持同一色彩语义，不切换独立蓝色/绿色主题。Theme 中的夜景覆盖位于 `.gameplay-screen[data-time-of-day="night"]`；只有处于该作用域的 Consumer 才继承，不能声称任意顶层 Global Space 自动获得夜景覆盖。

当前夜景关键差异：Context 为 `rgba(49,51,48,.90)`；Work Root 为 `rgba(47,49,46,.80)`、Body 为 `rgba(23,25,23,.24)`；Bottom L / M / S 分别为 `rgba(50,52,49,.60)` / `rgba(47,49,46,.82)` / `rgba(52,54,50,.44)`。Filter、Edge 与 Pause / Global Space 的夜景值继续从同一 Token 文件读取，不靠统一加亮百分比推导。

## Unity 6.6 与维护边界

优先在实际 Unity 6.6 + URP 屏幕空间 Panel 中验证原生 backdrop-filter / drop-shadow；共享 Scene Blur / URP Pass 从强制前置依赖调整为性能或效果不满足时的回退。当前 Modal 不使用 UI-over-UI Blur 是项目设计选择，不是引擎一概不支持。

具体版本与限制见 [Unity 6.6 视觉能力与回退规范](<Unity 6.6视觉能力与回退规范.md>)。Web Filter 字符串是目标配方，不意味着 USS 所有语法、色彩处理和成本逐字相同；保留无 Blur 的稳定 Tint 回退，实际渲染需 Player 对照。

共享颜色调整在 Theme，完整表面材质在 Surface，控件内部状态在 Controls，局部内容在对应组件。仍有历史局部硬编码和特殊前景，不能在文档中谎称全局已完全 Token 化，也不能新建一个末尾美化文件掩盖所有权问题。
