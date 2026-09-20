# 2026-09-20 Building Scheme Mode

## 目标

新增“方案模式”框架，用于选择场景建筑并管理该建筑当前使用的完整配色方案。

与 Material Palette 的边界：

- Material Palette：编辑单个 Surface / Material 参数；
- Building Scheme Mode：给整栋建筑选择一个 BuildingColorScheme；
- Building Instance：保存 SchemeId + Weathering。

## 第一阶段实现

### 入口

World Utility 新增：

```text
方案模式
```

对应 Tool：

```text
building-scheme
ENTER_BUILDING_SCHEME
```

进入后隐藏 Bottom World Utility 与普通 Operation Hints。

### 建筑选择

Web Prototype 放入 4 个 Building Handle：

- 重檐楼阁 03；
- 临街客栈 07；
- 州衙侧殿 02；
- 河畔民居 12。

它们只是场景 Picking Adapter。

### 左侧 Appearance Panel

复用 PlacementContextPanel → LeftContextPanel。

只显示：

- 当前配色方案；
- 做旧程度。

点击配色方案打开中央 Workspace。

### BuildingSchemeWorkspace

直接消费：

```text
workspace workspace--catalog workspace--building-scheme
```

左 Rail：

```text
全部 / 素雅 / 沉稳 / 明快 / 华丽 / 自然 / 其他
```

顶部：

```text
全部 / 系统内置 / 创意工坊 / 玩家方案
```

第一阶段提供 14 个 Demo Scheme，覆盖 Source / Style 组合和 2 页内容。

Card：

- Name；
- Source；
- 36×3px 三段 Palette Accent；
- Style；
- Current StateLine。

不制造 Placeholder Thumbnail。

### Apply 与 Rebind

Apply：

- 更新当前 Building.schemeId；
- 左 Panel 立即同步；
- Workspace 保持打开。

切 Building：

- 左 Panel Rebind；
- Workspace 保持打开；
- Selected Scheme 改为新建筑当前方案；
- 不重置 Style / Source。

## Unity 边界

正式实现：

```text
BuildingSelectionController
BuildingAppearanceModel
BuildingColorSchemeLibrary
BuildingSchemeWorkspaceController
```

Web Handle 坐标与本地 React State 不迁移。

完整规范：`Documentation/建筑配色方案模式设计规范.md`。


## 架构修正：并入 Material Palette

初版将 Building Scheme Mode 实现为独立 World Tool，这是对产品信息架构的误读。

修正后：

- 顶层 Tool 只有 `material-palette`；
- Building Scheme 是 `materialPaletteMode=scheme`；
- Light Adjustment 是 `materialPaletteMode=lighting`；
- Surface 是 `materialPaletteMode=surface`；
- 三者共用 MaterialPaletteDock；
- World Utility 只保留“配色工具”。

BuildingSchemeModeOverlay / LightAdjustmentOverlay 保留为子模式内容组件，它们不再拥有独立 Tool State。
