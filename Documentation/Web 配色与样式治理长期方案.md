# Web 配色与样式治理长期方案

本方案只治理 `wanhu-ui-prototype` 的 Web 视觉原型：让当前配色、Surface、Control 与 Feature CSS 有稳定权威，让后续 AI 能准确理解并复用设计语言。

本仓库**不负责实施 Unity 工程里的正式 USS**。Unity 侧由后续制作 AI 根据这里已经收敛的语义、Token、页面规范、截图与迁移边界实现；本仓库只保证“交给 Unity 的设计依据足够清楚且不会互相矛盾”。

## 总目标

长期收敛到：

```text
视觉意图与页面家族
        ↓
Theme Token
        ↓
Surface Recipe
        ↓
Control / Overlay
        ↓
Shared Component
        ↓
Feature Geometry / Business Variant
```

具体实现仍以当前代码为权威。治理的目标不是“所有颜色都必须变成变量”，而是让**共享语义只有一个所有者**，局部业务颜色有明确边界。

最终应做到：

- 其他 AI 不再从 `styles.css`、旧 Pass、Study 或截图单像素猜共享色；
- Paper / Brass / Cinnabar / Hover / Focus / Selected 有稳定语义；
- Context / Work / Blocking / Elevated 的材质配方不会在 Feature 中复制；
- Slider / Toggle / Select / Dialog / Hover 等基础控件不被业务 CSS 私自重画；
- Blueprint Preview、Management Topic、Source Badge、用户自选颜色等局部内容色仍可保留；
- CI 阻止已经退役的共享色和私有 Surface 所有权重新扩散；
- 每次视觉改动都能说明“改的是 Theme、Surface、Control 还是 Feature”。

## 治理原则

### 不做全仓库 Replace All

颜色整理必须按语义处理。相似 RGB 不等于相同职责。

例如：

- `#A9844B` 是共享 Aged Brass；
- `#C5A469` 是较强 Brass；
- `#D1B47A` 是小字号 Brass Text；
- Source Badge 的蓝灰 / 暖灰是来源信息；
- Management Topic Accent 是数据与专题身份；
- Blueprint Preview 的 Shade 属于媒体内容构图。

后面三类不能因为“看起来也是颜色”就强行改成 Brass Token。

### 先治理所有权，再追求零硬编码

允许 Component 持有真正局部的透明度、遮罩、数据色与图像 Overlay。

不允许 Feature 重新拥有：

- 共享 Paper / Brass / Cinnabar；
- 通用 Hover / Selected / Focus；
- 大型 Surface Root 的背景与 Blur；
- Slider / Toggle / Select 等共享控件内部；
- Modal Backdrop / Surface；
- Catalog Pager 的公共状态语言。

### 每阶段单独验收

不要把 Theme、Surface、Controls、所有 Feature 一次改完。

Runtime CSS 发生视觉变化时：

1. 先做源码 Ownership Review；
2. Build；
3. UI Review；
4. 实际打开受影响完整截图；
5. 有回退先修；
6. 再进入下一阶段。

纯文档或 Guard 变更不为了绿色状态机械做视觉审图。

## Phase 0：视觉权威与读取路径

这一阶段建立“应该相信什么”。

当前入口：

- `Documentation/UI Toolkit视觉总规范.md`：视觉全貌与页面家族；
- `Documentation/Wanhu 烟墨熟铜视觉材质规范.md`：准确共享 Palette / Surface Recipe；
- `src/ui/wanhu-theme-tokens.css`：共享 Token 实现权威；
- `src/ui/wanhu-surface-system.css`：大型 Surface 消费；
- `src/ui/ui-control-system.css`：基础控件；
- `src/main.tsx`：实际 CSS 加载顺序。

必须保留的规则：

- 代码是具体实现权威；
- 文档描述意图、职责与不变量；
- 不能从旧 `styles.css :root` 或截图取色覆盖当前 Token；
- 未实际打开截图时只报告源码审查；
- Web 通过不等于 Unity Player 已验证。

Phase 0 完成后，不再创建第二份“AI 专用色表”。

## Phase 1：退役旧共享主题色

目标：停止旧 Paper / Gold / Workspace Theme 继续扩散，并逐步移除 Runtime 中仍在生效的第二套共享色。

当前重点债务包括：

```text
#c9a55f
#e2c27d
#efe9dd
rgba(201,165,95,...)
rgba(210,179,111,...)
旧 --gold / --gold-hi / --gold-fill / --paper 等共享变量
```

处理方式：

1. 先建立 CI Ratchet：现有债务暂时允许，新文件不得新增；
2. 按 Consumer 判断语义；
3. Shared Selected / Focus / Primary 改用当前 Brass Token；
4. Main Menu 等确属局部身份的颜色改成明确局部语义，不能继续冒充全局 Theme；
5. 已被正式 Catalog / Surface 覆盖的旧声明在确认无其它 Consumer 后删除；
6. 每清掉一个旧债务文件，就从 Ratchet Baseline 中移除。

Phase 1 不处理：

- Preview 图片色；
- Management Topic Accent；
- Source Badge；
- 用户自选颜色；
- Danger 等已经有明确独立语义的局部颜色。

完成标准：

> Runtime 新代码不再需要知道旧 `#C9A55F` 是什么；共享熟铜只从当前 Theme 读取。

### Phase 1 进度：Batch 1 已完成

第一批只处理主菜单基础层与共享全屏 Control：

- `src/styles.css`：退役共享 `--paper / --gold / --gold-hi / --gold-fill`，消费者改用当前 Paper / Brass / Focus 语义；
- `src/menu-refine.css`：主菜单当前态改用正式 Brass Hue，保持原透明度与布局；
- `src/ui/ui-visual-system.css`：Segmented 与 Global Space Primary 不再使用旧 `201/165/95` Hue，状态线直接消费正式 Brass / Brass High；
- Ratchet 已从 Baseline 移除以上文件，并禁止旧 `--paper / --gold*` 变量重新进入 Runtime。

这一批不处理 Workspace、HUD、Management、Loading、Hover 等后续债务。

验证：Build #1470 与 UI Review #455 通过；UI Review 现在额外上传轻量 `visual-governance-review`，固定包含 Main Menu / New Game / Settings / Save 四张治理关键图及 readability report，供后续每批颜色整理快速人工审图。

下一批优先处理 Catalog Workspace 的旧共享 Brass / Paper 债务，再单独进入 HUD / Management，避免跨页面家族一次改色。

### Phase 1 进度：Batch 2 已完成

第二批只处理 Workspace 共享状态语义，不改 Layout / Card 尺寸 / Blueprint 4:3 Preview / Design 4×2 Grid / Surface Recipe：

- `src/workspace.css`：旧 Rail / Filter / Card / Pager Brass 债务退出；Hover / Pressed 使用中性 Control Hover，Selected 使用 Control Active，Focus 独立使用 Control Focus；
- `src/workspace/workspace-world-first-glass.css`：移除局部 `--workspace-gold*`，Rail / Filter Selected 改消费共享 Active Token；Design Search Hover 不再使用 Brass；
- Pager Current 固定使用 Paper White，Inactive 使用 Gray；Favorite 星只使用 Brass Text 且无 Glow；Source Badge 继续保留蓝灰 / 暖灰来源语义；
- Ratchet 已从 Baseline 移除 `workspace.css` 与 `workspace-world-first-glass.css`，并将旧 `--paper / --gold*` 变量加入 Runtime 禁止项。

验证：与 `main` 应用源码一致的临时验证 PR 仅额外开启 UI Review 的 PR 触发，Build #1475 与 UI Review #457 均通过；`audit:visual` 在 Build 中通过。已实际查看 Design / Blueprint / MaterialPreset / BuildingScheme Workspace 截图，确认 Workspace 未整体变灰、Hover 不发黄、Selected 保持弱熟铜识别、Favorite 为低权重星标、Pager Current 为 Paper White，Card Variant / Source Badge 未被统一破坏。临时 PR 已关闭，复用的 `tmp-*` 分支已恢复原 SHA。

Phase 1 下一批继续按页面家族处理 HUD / Management / Loading 等债务，不把 Workspace 再与其它系统混改。

### Phase 1 进度：Batch 3 已完成

第三批只处理 Gameplay Persistent HUD / Main Dock 家族的旧共享色债务，不改 Top Tray / Main Dock / Compass 几何，也不修改 HUD Surface Recipe：

- `src/gameplay/gameplay-top-shell.css`：速度档与 Information View 的 Hover / Selected 改为当前 Control / Brass 语义，退役旧 201/165/95 fallback 与状态线；
- `src/gameplay/gameplay-corner-hud.css`：Compass 北向、针尖、建造态南北轴仍属于方向内容强调，但旧 Brass Hue 已迁移到当前 Aged Brass；System Menu Hover 不再使用 Brass 边框；
- `src/ui/wanhu-surface-system.css`：最终生效的 System Menu Hover Edge 同步改为中性 Control Border，避免后加载 Surface Owner 把旧的“Hover 发金”语义重新覆盖回来；
- Main Dock、Bottom Command、Operation Hints、Utility Toolbar 经审查本身已经没有 Phase 1 旧共享色债务，本批不为了“统一”重复改写；
- Ratchet 已从 Baseline 移除 `gameplay-top-shell.css` 与 `gameplay-corner-hud.css`。

验证：使用与 `main` 应用源码一致的临时 PR，仅额外开启 UI Review 的 PR 触发；Build #1480 与 UI Review #459 均通过，`audit:visual` 在 Build 中通过。已实际查看 Top Control Tray、Compass、System Menu 与 Main Dock 设计 / 蓝图两态截图：持续 Selected 仍有弱熟铜识别，Compass 方向强调没有被去色，System Menu 保持中性，Main Dock 几何与状态层级未回退。临时 PR #7 已关闭，复用的 `tmp-*` 分支已恢复原 SHA。

Phase 1 后续继续把 Management 与 Loading 分开处理，不把专题内容色或外围空间颜色误并为共享 Brass。

### Phase 1 进度：Batch 4 已完成

第四批只处理 Management 页面家族的 Ratchet 旧共享色债务，不重做 Management UI，也不修改 Topic Accent / 图表业务色 / Management Surface Recipe：

- `src/gameplay/city-management.css` 实际只剩两处退役共享色命中：Header 图标历史 Brass fallback，以及 Task Row 的旧金色 Hover；
- Header fallback 改为当前 Brass Hue；最终生效的标题图标仍由后加载 `management-panel-skin.css` 使用 `--management-topic-accent`，因此 Civic / Economy / Resource / Governance / Defense 等专题身份不被抹平；
- Task Row Hover 改为 `--wanhu-control-hover`；这与最终 Management Skin 的中性 Hover 一致，不再保留“鼠标经过就发金”的旧状态语言；
- 财政收入图、税率 Slider、专题 Header Tint 等内容表达继续消费正式 Topic / Brass 语义，本批不把它们误判为旧共享主题色；
- Ratchet 已从 Baseline 移除 `src/gameplay/city-management.css`。

验证：使用与 `main` 应用源码一致的临时 PR，仅额外开启 UI Review 的 PR 触发；Build #1485 与 UI Review #461 均通过，`audit:visual` 在 Build 中通过。已实际查看 Management Finance 完整截图：暖棕财政 Topic Accent、收入图、税率 Slider 与数值强调保持可读；页面没有整体变灰，也没有恢复金色 Hover。临时 PR #8 已关闭，复用的 `tmp-*` 分支已恢复原 SHA。

Phase 1 下一批单独处理 Loading / 外围空间债务；Management Topic Accent 不再纳入旧 Brass 清理。

### Phase 1 进度：Batch 5 已完成

第五批只处理 Loading 外围 Screen，不把 New Game / Save / Settings、Color Tool、Dialog / Hover 或 Character 混进同一批：

- `src/loading/loading-space.css` 的旧色命中集中在 Tip Focus 和 Progress Brass；Focus 改消费 `--wanhu-control-focus`，进度条改消费当前 Brass / Brass High / Brass Text；
- Loading 的提示图标、百分比与主要文字同时改为现行 Paper / Text / Brass Token，减少外围 Screen 继续持有近似但不同的第二套金色；
- Loading 保持“背景图像主导 + 底部提示与进度”构图，不套 `wanhu-global-space`、Workspace 或 Blocking Panel Surface，也不改变遮罩、几何、进度动画与 Tip 轮换；
- `src/loading/loading-space.css` 已从 Ratchet Baseline 移除；
- UI Review 新增固定 `review=loading`、62% 进度截图与 Token 断言，并把 `loading-space.png` 纳入轻量 `visual-governance-review` Artifact，后续 Loading 改色可持续回归。

验证：使用与 `main` 应用源码一致的临时 PR，仅额外开启 UI Review 的 PR 触发；Build #1490 与 UI Review #463 均通过，`audit:visual` 在 Build 中通过。已实际查看 Loading 62% 完整截图：城市画面仍是主体，进度条为克制熟铜，文字保持暖纸/中性灰，键盘 Focus 独立显示细熟铜轮廓，没有出现大面积金色 UI。临时 PR #9 已关闭，复用的 `tmp-*` 分支已恢复原 SHA。

Phase 1 下一批处理 Global Space 家族剩余旧 Focus 债务（`fullscreen-actions.css` / `new-game-space.css` 等）；Color Tool、Dialog / Hover 与 Character 装饰语义继续独立分批。

### Phase 1 进度：Batch 6 已完成

第六批只处理 Global Space 家族的剩余旧 Focus / Selected 语义，不重做 New Game / Save / Load / Settings 的布局与 Surface：

- `src/fullscreen-actions.css`：Archive / Save 的辅助动作键盘 Focus 退役旧 201/165/95 Hue，统一消费 `--wanhu-control-focus`；
- `src/new-game/new-game-space.css`：旧 ValueButton Focus Halo 迁移到当前 Brass Hue；Map Filter / Segmented 的键盘 Focus 不再复用 Active Line，而改用独立 Control Focus；
- New Game Map Card 的 Selected 继续保留当前填色与左侧状态线，Focus 作为独立边缘与 Selected 共存，不能通过“选中边框透明”把键盘焦点吞掉；
- `fullscreen-actions.css` 与 `new-game/new-game-space.css` 已从 Ratchet Baseline 移除；
- Readability Review 新增 New Game 当前筛选 + Focus、选中地图 + Focus、Save Utility Focus 的实际 computed-style 断言，并把 `readability-new-game-focus.png` / `readability-save-focus.png` 纳入轻量治理 Artifact。

验证过程中 Review 实际发现两层问题：第一轮暴露 New Game 选中地图 Card 的透明边框会覆盖 Focus，随后增加显式 `is-selected:focus-visible`；第二轮暴露测试在 120ms `border-color` transition 尚未结束时读取 computed style，随后在 focus 后等待 settle。最终 Build #1503 与 UI Review #469 均通过，`audit:visual` 通过；最终 Readability Report 确认 New Game Filter Focus、选中 Map Card Focus、Save Utility Focus 均为 `rgb(209,180,122)`，且 Selected 与 Focus 可同时存在。已实际查看 New Game / Save Focus 截图。临时 PR #12 已关闭，复用的 `tmp-*` 分支已恢复原 SHA。

### Phase 1 进度：Batch 7 已完成

第七批只处理 Color Tool 的旧 Focus 配色债务，不改 Color Tool 布局、MaterialPreset / BuildingScheme Workspace、Surface Recipe、HEX/RGB/HSV 结构、保存方案流程或 Dialog：

- `src/tools/color-tool/modes/scheme/scheme-mode.css` 与 `src/ui/color/color-parameter-field.css` 退役旧 `rgba(201,165,95,...)` Focus halo，统一到当前 `--wanhu-control-focus`；
- Hover 继续使用中性 Control Hover，Selected 继续使用 Active 语义，Favorite 仍只使用 Brass Text；
- 两个目标 CSS 已从 Ratchet Baseline 移除；
- Review 新增 HEX / RGB / HSV Focus，以及 Material Family / Scheme Filter 的 Selected + Focus computed-style 断言，确认 Focus 与业务选中状态可以同时存在。

验证：Build #1508 与 UI Review #471 通过，`audit:visual` 通过；已实际查看 `readability-color-tool-focus.png` 与 `color-scheme-focus.png`。临时 PR #13 已关闭且未合并。

### Phase 1 进度：Batch 8 已完成

第八批只处理 Dialog Focus 债务，不改变 Dialog 几何、Backdrop、Surface、Warning / Danger 色彩语义、输入结构或 Confirm 流程：

- `src/ui/dialog/dialog.css` 的普通按钮、Choice Grid 与 Choice Trigger 退役旧 201/165/95 Focus fallback；
- Focus 改为独立 `--wanhu-control-focus` outline，Primary / Selected / Danger 原有 border / fill / text 继续表达自身业务语义，因此 Focus 不再通过改写业务边框冒充 Selected 或 Danger；
- `dialog.css` 已从 Ratchet Baseline 移除；
- Dialog Review 新增 Primary Focus、Choice Selected + Focus、Danger Focus 的真实页面断言与截图。

验证：Build #1512 与 UI Review #473 通过，`audit:visual` 通过；已实际查看 Confirm / Choice / Danger Focus 截图，Danger 仍保持朱砂语义，Choice 当前项仍保持 Selected，键盘 Focus 为独立细熟铜轮廓。

复核 Ratchet 时确认 `src/ui/hover/hover-overlay.css` 仍有一处退役 `#c9aa68`（Rich Hover 内容 Accent），因此它继续留在 Baseline；`src/ui/wanhu-character.css` 的旧 210/179/111 Structural Accent 也继续独立处理。Phase 1 下一步先收敛 Hover，再单独审查 Character，避免把内容强调、结构装饰和共享 Control 状态混改。

## Phase 2：Semantic Token 收敛

目标：Theme 管理“共享语义”，而不是收集所有 RGBA。

稳定语义至少包括：

```text
Ink
Paper / Text
Icon
Brass
Cinnabar
Control Hover
Control Active
Control Focus
Surface Recipe
Overlay Layer
Typography / Motion
```

规则：

- Hue 与共享状态进入 Theme；
- Component 特有的 Alpha / Shade 可留在 Component；
- 不为每个 0.02 / 0.04 / 0.08 透明度建立新 Token；
- 不用 `gold`、`jade` 等模糊名字重新创建第二套共享体系；
- 兼容别名只用于迁移，不继续被新代码消费。

完成标准：

> 看见一个共享状态，可以从名字判断职责，不需要先猜 RGB。

## Phase 3：Surface Recipe 收敛

目标：Context / Work / Blocking / HUD / Elevated 的外观由共享材质 Owner 管理。

重点检查：

- Root Tint；
- Header / Body / Footer Overlay；
- Edge / Rule；
- Shadow / Local Occlusion；
- Noise；
- Backdrop Filter；
- Day / Night Override；
- 无 Blur 回退。

Feature 只选择 Surface 角色，不私有维护大型表面的完整背景配方。

特别保留：

- Top HUD 现有轻微冷灰角色；
- Context / Workspace 更中性的烟墨角色；
- Pause 的 Scene Attenuation 与 Panel 本体分离；
- Dialog / Blueprint Editor 共用 Modal Surface；
- Rich Hover 与 Tooltip 不强迫使用同一背景。

完成标准：

> 新增一个同类页面时，Feature 不需要复制五六条 Background / Shadow / Blur 才能“像现有 UI”。

## Phase 4：Control 与 Overlay 收敛

目标：基础控件与浮层不再因 Feature 不同而出现近似但不同的状态色。

范围：

- Button / Primary / Secondary / Utility；
- Segmented；
- Slider / NumericSliderField / Stepper / ValueButton；
- Toggle；
- Select / Menu；
- Text / Binding Input；
- Scrollbar；
- Tooltip；
- Rich Hover；
- Popover / Item Menu；
- Dialog。

稳定状态：

- Hover = 中性提亮；
- Selected / On = Brass；
- Focus = 独立轮廓，可与 Selected 共存；
- Pressed = 短反馈；
- Warning 与 Danger 分离；
- Disabled 不通过不可读的小字处理。

完成标准：

> 同一种 Control 的颜色和状态只有一个共享 Owner，Feature 只选 Variant / Density。

## Phase 5：Feature CSS 收尾与长期治理

按页面家族逐步清理：

1. Catalog Workspace；
2. Gameplay HUD / Main Dock；
3. Tool / Placement；
4. Color Tool；
5. Settings / Archive / Save / New Game；
6. Management；
7. Main Menu / Loading 等外围空间。

每个 Feature 只做：

- Geometry；
- Layout；
- Content hierarchy；
- 业务 Variant；
- 明确的内容色。

不再做：

- 共享 Theme；
- 共享 Surface；
- 共享 Control Skin；
- 私有 Modal；
- 私有 Scrollbar；
- 私有 Hover Framework。

完成后将视觉 CI 从“Ratchet”逐步升级为更严格的 Ownership Guard。

## Unity 交接边界

本仓库没有“Phase 6：实现正式 Unity USS”。

这里负责提供：

- 当前视觉总规范；
- 精确 Token 与材质语义；
- 页面 / Control / Surface 的职责边界；
- Web 真实 Consumer；
- 已审图的完整页面参考；
- Unity 6.6 能力与回退说明；
- 哪些 Web 技术需要映射为 UXML / USS / C# 的说明。

后续 Unity AI 负责：

- 真正创建 UXML / USS；
- Font Asset / Fallback；
- PanelSettings；
- 原生 backdrop-filter / drop-shadow 实测；
- Player DPI / 4K / Focus；
- Profiler / Frame Debugger；
- 最终性能与设备回退。

Web 仓库不得因为“方便 Unity”而提前维护一套假的 USS 镜像，否则会再次出现双重权威。

## CI 与 Ratchet

视觉治理使用“只减不增”的方式。

第一阶段 Guard 应：

- 扫描 Runtime `src/**/*.css`；
- 排除 `src/review/` Study；
- 报告退役共享色出现在哪些文件；
- 已登记债务可以暂时存在；
- **任何新文件出现退役共享色直接失败**；
- 后续每完成一批清理，就缩小允许列表；
- 不禁止 Content / Topic / User Color。

Build Workflow 必须运行该 Guard。

Guard 不是美术审图替代品。它只保证所有权和历史债务不会继续扩散。

## 后续 AI 接手规则

涉及配色、Surface、Controls、USS 迁移依据或视觉清理时：

1. 先读本方案；
2. 再读视觉总规范和烟墨熟铜规范；
3. 核对最新 main；
4. 检查 `src/main.tsx` 加载顺序；
5. 定位真正 Consumer；
6. 判断属于 Theme / Surface / Control / Feature 哪一层；
7. 只修改正确 Owner；
8. 更新 Ratchet；
9. Runtime 变化按页面实际审图。

不要为了“统一”消灭有意义的页面差异，也不要为了“保持现状”继续保留第二套共享 Theme。
