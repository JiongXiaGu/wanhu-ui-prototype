# 材质方案 Workspace 设计规范

`MaterialSchemeWorkspace` 是 `material-palette` Tool 内部的中央 Work Surface，用于浏览系统材质方案和玩家保存的自定义方案。

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

## 2. Workspace 页面

顶部页签：

```text
系统方案 | 我的方案
```

使用真实 Selection Indicator Element，不依赖结构性 pseudo-element。

### 系统方案

左侧 Rail：

- 全部；
- 木头；
- 瓦片；
- 墙面。

内容：

- 2 行 × 3 Card；
- 6 Card / 页；
- 超过 6 个方案使用 Workspace Pager；
- Card 显示类型、名称、四色预览和少量材质摘要；
- 点击 Card 立即应用方案；
- 应用后 Workspace 保持打开，方便连续对比；
- 左侧 Surface 参数实时刷新。

第一阶段 Web Demo 内置 9 个演示方案，用于验证分类和分页。它们是交互 / 构图占位，不代表最终美术库。

### 我的方案

左侧 Rail：

- 已保存；
- 保存当前。

内容：

- 同样使用 2×3 Card Pool；
- 保存当前会生成玩家自定义方案；
- 自定义方案可应用；
- 自定义方案可删除；
- 空列表显示明确 Empty State。

Web Prototype 自定义方案只保存在当前 Tool Session。正式 Unity 应接玩家存档 / MaterialPresetLibrary。

## 3. Surface 与方案状态

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

## 4. Apply / Custom

应用系统 / 自定义方案：

- 替换完整 Surface Draft；
- 更新 CurrentScheme；
- Workspace 不自动关闭；
- 左侧参数立即刷新。

玩家随后手动修改任意参数：

```text
CurrentScheme
→ 自定义 · 未保存
```

包括 Color、HDR Intensity、RGB/HSV、PBR、Texture、Workflow、Paste。

保存当前：

- 将当前完整 Draft 写入自定义方案；
- CurrentScheme 更新为保存后的方案；
- 正式 Unity 需要命名 / 持久化流程；Web Demo 目前自动生成“我的配色 NN”。

## 5. Unity UI Toolkit 映射

```text
MaterialPaletteController
├ CurrentDraft
├ CurrentScheme
├ SystemPresetLibrary
├ UserPresetLibrary
└ SchemeWorkspaceState

MaterialSurfacePanel.uxml
MaterialSchemeWorkspace.uxml
MaterialToolActionBar.uxml
```

`MaterialSchemeWorkspace.uxml`：

```text
Header
├ Title
├ Page Tabs
└ Close

Body
├ Primary Rail
└ Catalog
   ├ Summary
   ├ 2×3 Pooled Cards
   └ Pager
```

规则：

- 2×3 通过显式 Flex Rows 实现，不依赖 CSS Grid；
- Pager Marker / Tab Indicator 使用真实 VisualElement；
- Workspace 自身不拥有 Material Draft；
- Workspace 只向 Controller 发送 Apply / Save / Delete / Filter / Page 请求；
- 左侧参数与中央 Workspace 读取同一 Controller 状态。

## 6. UI Review

必须检查：

- 点击方案入口后左侧 Surface 仍存在；
- 中央 Workspace 位于 Material ToolActionBar 上方且不重叠；
- Workspace 水平居中；
- 系统方案 / 我的方案两页存在；
- 系统分类 Rail 存在；
- 9 个演示预设形成两页 Pager；
- Apply 后 Workspace 不关闭，左侧 Scheme / 参数实时更新；
- 手动修改后 CurrentScheme 变成“自定义 · 未保存”；
- 我的方案支持保存 / 应用 / 删除；
- 关闭中央 Workspace 不退出 Material Tool；
- Metallic 下 SpecularColor 不存在；
- Specular 下 SpecularColor 出现在颜色序列最后。
