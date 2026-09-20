# 材质方案 Workspace 设计规范

`MaterialSchemeWorkspace` 是 `material-palette` Tool 内部的中央资源库，用于浏览系统内置、创意工坊与玩家保存的材质方案。它与左侧 Surface 参数面板、底部 Material ToolActionBar 同时存在，不拥有独立 Material Draft。

## 1. 空间与筛选

```text
左下：Material Surface Parameters
中下：Material Scheme Workspace
底部：Material ToolActionBar
```

顶部来源：

```text
全部 | 系统内置 | 创意工坊 | 我的方案
```

左侧 Material Family：

```text
全部
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

规则：

- Source × MaterialFamily 组合筛选；
- `全部` 只作为 Filter，不是可保存分类；
- Rail 每页最多 7 项，当前使用两页；
- Workspace 宽约 1040px，避免与左侧 Surface Panel 重叠；
- Material Scheme 与 Design Workspace 都直接消费共享 `workspace--catalog`，Material 不再通过挂 `workspace--design` 间接继承；
- Rail / Filter / 4×2 Content / Pager 的基础几何与状态视觉统一由共享 Catalog USS/CSS 持有；
- Category Selected = 熟铜短竖线；Rail Pager = 中性灰圆点，二者保持原有位置但不再使用相同强调色。
- Rail Pager 与 Selected Line 之间使用共享 Catalog 的真实 Gutter，不允许由 Material 私有 CSS 再压缩；当前可见间隔必须 ≥ 12px。

## 2. Card

没有真实材质 Thumbnail 时，不显示纯色大图或假材质图。

```text
┌────────────────────────────────┐
│ 方案名称              来源 Badge│
│ ━━━   Material Family · 质感  ···│
└────────────────────────────────┘
```

信息：

- 第一行左侧：方案名称；
- 第一行右侧：来源 Badge；
- 第二行：BaseColor 细线 + Family · Finish；
- `···` 只对“我的方案”显示。

来源 Badge：

- 系统内置：中性灰；
- 创意工坊：冷灰青；
- 我的方案：暖灰铜。

## 3. 保存配色

点击右上“保存配色”打开共享方案信息窗口。

由于 Material Family 目前只有 9 个，分类直接 3×3 平铺，不使用 Dropdown：

```text
保存配色

方案名称
[ 城墙暖灰 ]

材质分类
[ 木材 ] [ 石材 ] [ 金属 ]
[ 砖瓦 ] [ 灰泥/土 ] [ 布料 ]
[ 玻璃 ] [ 漆饰 ] [ 其他 ]

取消                    保存
```

规则：

- 名称可编辑；
- “我的方案”内禁止完全同名；
- 默认 Family 优先取方案库左侧当前选中的 Material Family Filter；
- 当左侧 Filter = “全部”时，才回退到 CurrentFamily；
- 这样玩家先切到“金属 / 石材 / 布料”等分类后点击“保存配色”，保存窗口会直接预选该分类；
- 默认名称优先为“当前方案名 + 副本”，没有稳定名称时使用“我的配色 NN”；
- 保存后：
  - Source 自动切到“我的方案”；
  - Family Filter 自动切到新方案 Family；
  - Rail 自动切到该 Family 所在页；
  - Content Pager 定位新 Card；
  - 新 Card 使用局部短暂 Reveal Highlight；
- 不使用全局成功 Toast 作为主要反馈。

## 4. 我的方案管理

“我的方案” Card 的 `···` 菜单固定为：

```text
编辑
复制参数
删除
```

不再单独提供“重命名”和“移动分类”。

### 编辑

“编辑”与“保存配色”复用同一个方案信息窗口：

```text
编辑方案

方案名称
[ 城墙暖灰 ]

材质分类
[ 木材 ] [ 石材 ] [ 金属 ]
[ 砖瓦 ] [ 灰泥/土 ] [ 布料 ]
[ 玻璃 ] [ 漆饰 ] [ 其他 ]

取消                保存修改
```

编辑窗口只修改资源元数据：

- name；
- family。

MaterialSurfaceDraft 的颜色 / PBR / Texture 参数继续只在左侧 Surface Panel 编辑。

如果 Edit 只改名称：

- 保持当前 Source / Family Filter；
- 更新 Card；
- Card 产生局部 Reveal Highlight。

如果 Edit 修改 Family：

- Source Filter 保持不变；
- Rail 自动切到目标 Family 所在页；
- Family Filter 自动选中目标 Family；
- Content Pager 定位修改后的 Card；
- Card 保持可见并产生局部 Reveal Highlight。

## 5. 拖拽移动

只有“我的方案”可以拖拽。

拖到左 Rail 的真实 Material Family 后：

```text
UpdatePresetMetadataCommand(id, { family })
→ Rail Page = 目标 Family 所在页
→ Family Filter = 目标 Family
→ Content Page = 目标 Card 所在页
→ Card 保持可见
→ 局部 Reveal Highlight
```

规则：

- `全部` 不接受 Drop；
- 不做自由排序；
- 不做拖动时自动翻 Rail 页；
- 拖动成功后自动选择目标分类，不让 Card 因 Filter 不匹配而“凭空消失”；
- 移动操作不显示“撤销” Toast；
- 移动结果由目标分类被选中 + Card 保持可见直接反馈。

## 6. 复制 / 删除 / 粘贴

复制参数：

- 指定“我的方案”的完整 Draft 写入现有 Surface Clipboard；
- 与左侧 Footer Clipboard 共用。

删除：

- 使用共享 Danger Confirm Dialog；
- 删除后保持当前筛选并刷新列表。

粘贴配色：

- 读取现有 Surface Clipboard；
- Clipboard 为空时 Disabled；
- 粘贴后 CurrentScheme → 自定义 · 未保存；
- Workspace 不自动跳转分类。

## 7. 数据与 Command

```text
MaterialFamily
UserMaterialPreset
├ id
├ name
├ family
├ source = mine
└ draft
```

元数据与 Draft 分离。

命令：

```text
SavePresetCommand(name, family, draft)
UpdatePresetMetadataCommand(id, { name?, family? })
CopyPresetParametersCommand(id)
DeletePresetCommand(id)
```

保存窗口与编辑窗口是同一套 Metadata Editor UI；拖拽只是 `UpdatePresetMetadataCommand` 的另一个输入适配器。

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

方案信息 Dialog：

```text
MaterialPresetMetadataDialog
├ Name TextField
├ FamilyChoiceGrid
│  ├ 木材
│  ├ 石材
│  ├ 金属
│  ├ 砖瓦
│  ├ 灰泥 / 土
│  ├ 布料
│  ├ 玻璃
│  ├ 漆饰
│  └ 其他
└ Actions
```

FamilyChoiceGrid 使用 Flex Rows / Wrap，可直接映射 UI Toolkit，不依赖 HTML Select。

## 9. UI Review

必须验证：

- Save Dialog 显示 9 个平铺 Material Family；
- Save Dialog 不回归 Dropdown；
- 保存后自动进入“我的方案 + 目标 Family”；
- 我的方案菜单只有 编辑 / 复制参数 / 删除；
- 不再出现 重命名 / 移动分类；
- Edit 与 Save 复用相同 Metadata Dialog；
- Edit 修改 Family 后 Rail 自动切页并选中目标 Family；
- Drag Move 成功后自动选择目标 Family；
- Drag Move 后 Card 保持可见；
- Move 不产生“撤销” Toast；
- Move / Edit 后使用局部 Card Reveal Highlight；
- Source Filter 在 Edit / Drag Move 时保持不变；
- Material 与 Design 的 Rail Item 高度 / Pager Marker 尺寸必须来自同一 `workspace--catalog` Contract；
- 选中“金属”等中段 Rail Item 时，熟铜 Selection Line 与中性灰 Rail Page Dot 必须视觉可区分；
- Material Root 不得重新挂 `workspace--design`；
- Copy 继续复用 Surface Clipboard；
- Delete 使用共享 Confirm Dialog。
