# 材质方案 Workspace 设计规范

`MaterialSchemeWorkspace` 是 `material-palette` Tool 内部的中央资源库，用于浏览系统内置、创意工坊与玩家保存的材质方案。它与左侧 Surface 参数面板、底部 Material ToolActionBar 同时存在，不拥有独立 Material Draft。

## 1. 总体空间关系

```text
左下：Material Surface Parameters
中下：Material Scheme Workspace
底部：Material ToolActionBar
```

规则：

- 打开方案库时左侧 Surface 保持挂载；
- Workspace 位于 ToolActionBar 上方；
- Material Workspace 宽度约 1040px，避免与左侧约 400px Surface Panel 重叠；
- Rail / Source Filter / Card / Pager 继续复用 Design Workspace 视觉母版；
- 关闭 Workspace 只关闭方案库，不退出 Material Tool。

## 2. 来源筛选

顶部来源固定为：

```text
全部 | 系统内置 | 创意工坊 | 我的方案
```

来源与左侧材质族组合筛选：

```text
Source × MaterialFamily
```

来源数据：

- `builtin` → 系统内置；
- `workshop` → 创意工坊；
- `mine` → 我的方案。

系统内置和创意工坊保持只读；只有“我的方案”支持重命名、移动分类、复制参数、删除与拖拽。

## 3. Material Family

左侧不再使用“木头 / 瓦片 / 墙面”这种混合材质与用途的分类，统一改成 Material Family：

```text
all             → 全部（仅 Filter）
wood            → 木材
stone           → 石材
metal           → 金属
masonry         → 砖瓦
plaster-earth   → 灰泥 / 土
fabric          → 布料
glass           → 玻璃
lacquer         → 漆饰
other           → 其他
```

`all` 永远不是资源分类，只是 Filter。

左 Rail 每页最多 7 项；当前 10 个入口形成两页：

第一页：

```text
全部
木材
石材
金属
砖瓦
灰泥 / 土
布料
```

第二页：

```text
玻璃
漆饰
其他
```

Rail 分页复用 Design Workspace 的纵向 Pager。

拖拽只允许投放到当前可见的真实 Material Family；跨页分类使用 Card 菜单“移动分类…”完成，不做拖动时自动翻页。

## 4. Card 信息结构

Material Card 继续复用共享 `WorkspaceItemCard`，但在没有真实 `MaterialPresetThumbnail` 时隐藏 Preview 槽。

Card：

```text
┌────────────────────────────────┐
│ 方案名称              来源 Badge│
│ ━━━   Material Family · 质感  ···│
└────────────────────────────────┘
```

信息优先级：

1. 方案名称；
2. 右上角来源 Badge；
3. 第二行 Material Family + 粗糙 / 哑光 / 偏哑光 / 光滑；
4. BaseColor 仅用约 28×3px 细线辅助记忆。

来源 Badge 必须位于 Card 第一行右侧：

- 系统内置：中性灰；
- 创意工坊：冷灰青；
- 我的方案：暖灰铜。

`···` 只在“我的方案” Hover / Focus 时出现，不与来源 Badge 混为同一信息。

## 5. Workspace Actions

Source Filter 右侧：

```text
保存配色 | 粘贴配色
```

### 保存配色

使用共享 ChoiceInput Dialog：

```text
保存配色

方案名称
[                 ]

材质分类
[ 木材          ▾ ]

取消             保存
```

规则：

- 名称支持自定义；
- 我的方案内禁止完全同名；
- 分类使用 Dropdown，不横向铺满所有 Material Family；
- 默认分类继承 CurrentFamily；
- 默认名称优先为“当前方案名 + 副本”，没有稳定方案名时使用“我的配色 NN”；
- 保存后来源切到“我的方案”；
- 保存不会修改 Draft 内的 Material 参数。

### 粘贴配色

- 复用现有 Surface Clipboard；
- Clipboard 为空时 Disabled；
- 粘贴后 CurrentScheme → 自定义 · 未保存；
- 不建立第二套 Clipboard。

## 6. 我的方案管理

Hover / Focus 我的方案 Card 后显示 `···`。

一级菜单固定为：

```text
重命名
移动分类…
复制参数
删除
```

不在一级菜单内横向塞所有分类。

### 重命名

- 使用共享 Input Dialog；
- 不做双击编辑；
- 不在 Card 上常驻 TextField；
- 只修改资源名称，不修改 Draft。

### 移动分类

点击“移动分类…”后，当前 Card 菜单切换到二级 Material Family Picker：

```text
← 移动分类

木材
石材
金属
砖瓦
灰泥 / 土
布料
玻璃
漆饰
其他
```

Picker：

- 使用窄型内部滚动列表；
- 当前分类 Disabled；
- 菜单必须完整留在 Workspace 内；
- 修改的是 UserMaterialPreset.family，不修改 MaterialSurfaceDraft。

移动完成后 Toast：

```text
已移动到“木材”    撤销
```

撤销再次调用同一个 Move Command。

### 拖拽

“我的方案” Card 可以直接拖到左 Rail 当前页的 Material Family。

规则：

- 系统内置 / 创意工坊不可拖；
- “全部”不可 Drop；
- Drag 时 Rail 进入 Drop Mode；
- Drop 只修改 Material Family；
- 不自动改变当前 Filter；
- 不做自由排序；
- Drag 与二级 Picker 共用 `MovePresetCommand`。

### 复制参数 / 删除

复制参数：

- 将指定方案完整 Draft 写入 Surface Clipboard；
- Workspace“粘贴配色”和左侧 Footer“粘贴参数”共用该 Clipboard。

删除：

- 使用共享 Danger Confirm Dialog；
- 只对 `mine` 来源提供。

## 7. 数据模型

```text
MaterialFamily
UserMaterialPreset
├ id
├ name
├ family
├ source = mine
└ draft

CurrentFamily
CurrentScheme
SurfaceClipboard
```

关键边界：

- Material Family 是资源整理元数据；
- MaterialSurfaceDraft 是渲染参数；
- 移动分类不能偷偷修改 Draft；
- 手动修改 Draft 后 CurrentScheme 可以变成“自定义 · 未保存”，但 CurrentFamily 继续保留，用于之后保存时给出合理默认分类。

命令：

```text
SavePresetCommand(name, family, draft)
RenamePresetCommand(id, name)
MovePresetCommand(id, family)
CopyPresetParametersCommand(id)
DeletePresetCommand(id)
```

## 8. Unity UI Toolkit 映射

```text
MaterialPaletteController
├ CurrentDraft
├ CurrentScheme
├ CurrentFamily
├ SurfaceClipboard
├ SystemPresetLibrary
├ WorkshopPresetLibrary
├ UserPresetLibrary
└ SchemeWorkspaceState
   ├ SourceFilter
   ├ FamilyFilter
   ├ FamilyPage
   └ ContentPage
```

`MaterialSchemeWorkspace.uxml`：

```text
Header
├ Title
└ Close

Body
├ Primary Rail
│  ├ Rail Pager
│  └ Material Family Page
└ Catalog
   ├ Source Filter
   ├ Actions
   │  ├ 保存配色
   │  └ 粘贴配色
   ├ 4×2 Pooled Cards
   └ Pager
```

Card：

```text
WorkspaceItemCard
├ StateLine
└ Copy
   ├ Head
   │  ├ Title
   │  └ SourceBadge
   └ Meta
      ├ BaseColorAccent
      └ FamilyAndFinish
```

管理菜单与 Drag Adapter 只产生 Command，不直接拥有 UserPresetLibrary。

## 9. UI Review

必须检查：

- 左侧 Surface 与中央 Workspace 同时存在且不重叠；
- 来源筛选为 全部 / 系统内置 / 创意工坊 / 我的方案；
- Material Family Rail 有两页；
- 第一页与第二页分类完整；
- Card 来源 Badge 位于第一行右侧；
- Material Card 不回归纯色大图 / 四色条；
- 保存 Dialog 使用 Name + Material Family Dropdown；
- 我的方案一级菜单不内联所有分类；
- “移动分类…”进入独立二级 Family Picker；
- Family Picker 包含全部 9 个真实 Material Family；
- 菜单与 Picker 不越出 Workspace；
- Move 支持撤销；
- Drag 到 Rail 与 Picker Move 得到相同数据结果；
- CurrentFamily 与 CurrentScheme 同步；
- Copy 复用 Surface Clipboard；
- Delete 使用 Confirm Dialog；
- Metallic / Specular 颜色可见性规则保持不变。
