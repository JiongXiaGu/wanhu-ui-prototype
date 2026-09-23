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
