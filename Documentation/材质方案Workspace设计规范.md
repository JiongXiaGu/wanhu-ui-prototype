# 材质方案 Workspace 设计规范

`MaterialSchemeWorkspace` 是 `material-palette` Tool 内部的中央 Work Surface，用于浏览系统内置、创意工坊与玩家保存的材质方案。

它不是新的 Gameplay Workspace 状态，也不替代左侧 Surface 参数面板。

## 1. 空间关系

Material Tool 同时允许三块 UI 共存：

```text
左下
Material Surface Parameters

中下工具栏上方
Material Scheme Workspace

中下
Material ToolActionBar
```

点击左侧“方案”行：

- 左侧 Surface 参数保持挂载；
- 中央 Material Scheme Workspace 打开；
- Bottom Material ToolActionBar 保持挂载；
- 当前 Draft 与 CurrentScheme 仍由同一个 MaterialPaletteController 持有。

关闭中央 Workspace：

- 只关闭方案浏览器；
- 不退出 Material Tool；
- 不关闭左侧参数。

Material Scheme Host 宽度约 1040px；它与左侧约 400px Surface Panel 共存，因此不直接照搬建筑 Workspace 的 1240px Host 宽度，但 Rail、Filter、Card、Typography、Hover / Focus 与 Pager 继续共用同一视觉母版。

## 2. Workspace 信息架构

材质方案 Workspace 采用和建筑 Workspace 相同的“左分类 + 顶部筛选 + 内容卡片 + 底部分页”结构。

### 左侧材质分类 Rail

固定为：

```text
全部
木头
瓦片
墙面
```

左侧分类只表达材质类别，不承担来源切换。

### 顶部来源筛选

顶部 Catalog Filter 固定为：

```text
全部 | 系统内置 | 创意工坊 | 我的方案
```

它不是页面切换，而是来源筛选，并与左侧材质分类组合生效：

```text
Source Filter × Material Category
```

例如：

- 系统内置 × 木头；
- 创意工坊 × 瓦片；
- 我的方案 × 墙面。

第一阶段 Web Demo：

- 系统内置保留 9 个演示方案；
- 创意工坊提供少量演示方案，只用于验证来源筛选与 Card 来源标识；
- 我的方案来自当前 Tool Session 内玩家保存的数据。

正式 Unity：

- 系统内置接 `SystemPresetLibrary`；
- 创意工坊接 Workshop / Mod Content Source；
- 我的方案接玩家存档 / `UserPresetLibrary`。

### 右上 Workspace Action

来源筛选右侧保留两个与方案库直接相关的动作：

```text
保存配色 | 粘贴配色
```

#### 保存配色

- 将左侧当前完整 Surface Draft 保存为“我的方案”；
- 保存后自动切换到“我的方案”来源；
- Web Demo 当前自动命名为“我的配色 NN”；
- 保存方案保留当前材质类别，例如从木头方案修改后保存，仍归类到木头；
- 正式 Unity 后续接统一命名 Dialog 与持久化。

#### 粘贴配色

- 读取 Material Surface Clipboard；
- Clipboard 为空时按钮 Disabled；
- 点击后把完整 Surface 参数粘贴到左侧当前 Draft；
- 粘贴后 CurrentScheme 变为“自定义 · 未保存”；
- 不新增另一套 Clipboard 状态。

## 3. Card 视觉与来源

材质方案继续复用建筑 / Design Workspace 的 `WorkspaceItemCard`，但 Material 业务不强制使用 Preview 槽。没有真实材质缩略图时，不用纯色块或假材质纹理冒充 Preview。

稳定规则：

- Card 高度 64px；
- 4 列 × 2 行，每页 8 项；
- Card 默认无常驻边框；
- Hover / Focus、Typography、Copy 间距与 Design Workspace 共用；
- Material Card 不显示纯色大图、假木纹 / 假瓦纹 / 假墙纹；
- 第一行：方案名；
- 第二行：来源 Badge + 细 BaseColor 色线 + 类型 · 质感；
- BaseColor 色线约 28×3px，只承担辅助色彩记忆；
- Current 材质方案继续使用共享左侧熟铜状态线；
- “我的方案”额外拥有删除按钮；
- 如果未来存在真实 `MaterialPresetThumbnail`，才启用共享 Preview 槽。

来源 Badge 固定三种：

```text
系统内置
创意工坊
我的方案
```

来源是方案的重要元数据，Card 本身必须能够脱离当前 Filter 后仍说明其来源。

## 4. Surface 与方案状态

Material Surface 默认工作流为 Metallic。

### Metallic

颜色顺序：

```text
BaseColor
EmissionColor HDR
NightEmissionColor HDR
```

`SpecularColor` 完全隐藏，不使用 Disabled 占位。

### Specular

颜色顺序：

```text
BaseColor
EmissionColor HDR
NightEmissionColor HDR
SpecularColor
```

高光颜色永远位于最后。

切换工作流只改变可见性，不清空隐藏值。

## 5. Apply / Custom / Source

应用任意来源方案：

- 替换完整 Surface Draft；
- 更新 CurrentScheme；
- 更新当前材质类别；
- Workspace 不自动关闭；
- 左侧参数立即刷新。

玩家随后手动修改任意参数：

```text
CurrentScheme
→ 自定义 · 未保存
```

但当前材质类别继续保留，以便之后“保存配色”时仍进入正确的木头 / 瓦片 / 墙面分类。

包括以下操作都会进入未保存状态：

- Color；
- HDR Intensity；
- RGB / HSV；
- PBR；
- Texture；
- Workflow；
- Paste。

## 6. Unity UI Toolkit 映射

```text
MaterialPaletteController
├ CurrentDraft
├ CurrentScheme
├ CurrentCategory
├ SurfaceClipboard
├ SystemPresetLibrary
├ WorkshopPresetLibrary
├ UserPresetLibrary
└ SchemeWorkspaceState
   ├ SourceFilter
   ├ CategoryFilter
   └ Page
```

`MaterialSchemeWorkspace.uxml`：

```text
Header
├ Title
└ Close

Body
├ Primary Rail
└ Catalog
   ├ Source Filter
   │  ├ 全部
   │  ├ 系统内置
   │  ├ 创意工坊
   │  ├ 我的方案
   │  └ Actions
   │     ├ 保存配色
   │     └ 粘贴配色
   ├ 4×2 Pooled Cards
   └ Pager
```

Card：

```text
WorkspaceItemCard
├ StateLine
└ Copy
   ├ Title
   └ Meta
      ├ SourceBadge
      ├ BaseColorAccent
      └ TypeAndFinish
```

规则：

- 4×2 使用显式 Flex Rows，不依赖 CSS Grid；
- Preview Element 必须可选；
- BaseColor Accent / SourceBadge / StateLine 都使用真实 VisualElement；
- Workspace 自身不拥有 Material Draft；
- Workspace 只向 Controller 发送 Apply / Save / Paste / Delete / Filter / Page 请求；
- 左侧参数与中央 Workspace 读取同一 Controller 状态。

## 7. UI Review

必须检查：

- 点击方案入口后左侧 Surface 仍存在；
- 中央 Workspace 位于 Material ToolActionBar 上方且不与左侧 Surface 重叠；
- 左侧 Rail 固定为全部 / 木头 / 瓦片 / 墙面；
- 顶部来源固定为全部 / 系统内置 / 创意工坊 / 我的方案；
- 左侧分类与顶部来源可以组合筛选；
- 右上存在保存配色 / 粘贴配色；
- Surface Clipboard 为空时粘贴 Disabled，有值时 Enabled；
- 系统内置 9 个方案形成两页；
- 创意工坊演示方案能单独筛选；
- 每张 Card 显示来源 Badge；
- Material Card 不回归纯色 Preview / 四色条；
- BaseColor 只保持细线级别；
- 保存配色后进入我的方案并保留材质类别；
- 我的方案支持应用 / 删除；
- 粘贴配色后 CurrentScheme 变为自定义 · 未保存；
- Apply 后 Workspace 不关闭，左侧参数实时更新；
- Metallic 下 SpecularColor 不存在；
- Specular 下 SpecularColor 出现在颜色序列最后。
