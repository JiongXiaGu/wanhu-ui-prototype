# Design Workspace 设计规范

Design Workspace 是 Gameplay `设计` 模式下八个一级建造入口共享的内容浏览框架。它解决“选择具体构件 / 类型”的问题，不负责具体放置、绘制或编辑规则；真正的建造输入由进入后的 Tool 接管。

## 入口与空间关系

Main Dock 设计模式固定为：

`道路 / 桥梁 / 建筑 / 台基 / 城墙 / 围墙 / 装饰 / 树木`

玩家点击任一分类后：

```text
Main Dock Design Category
→ Design Workspace
→ 选择具体 Item
→ 对应 Tool
```

Design Workspace 是同一个 Workspace Surface，不为八类内容复制八套组件。切换设计分类时直接替换 Workspace Definition 与内容，不先关闭再打开另一块面板。

再次点击当前 Main Dock 分类、Workspace 关闭按钮或 Esc，均关闭 Workspace 并清空 `dockCategory`。Main Dock 在玩家没有明确选择分类时保持无 Selected，不保存或恢复“设计模式上一次分类”。

## 通用框架

统一结构：

`Header + Primary Rail + Context Filter + Search + Content Grid + Pager`

- Header：当前一级设计类别标题与关闭按钮；
- Primary Rail：当前类别的主要子类型；
- Context Filter：与 Primary Rail 正交的第二筛选维度；
- Search：只过滤当前 Definition 的内容；
- Content Grid：每组 `3 × 2 = 6` 项；
- Pager：无数字的点 / 短线分页，可用滚轮整组切换。

Web 原型由 `DesignWorkspace.tsx` 实现；类别、筛选和 Item 数据由 `design-workspace-model.ts` 提供。最终 Unity UI Toolkit 应保持相同的配置驱动结构，不为道路、桥梁、城墙等复制完整 UXML 树。

## Primary Rail

Primary Rail 当前为约 `146px` 的稳定槽位，必须支持 **最多 6 个汉字**的常规分类名称，例如：

- `高倾角城墙`
- `水生植物`
- `街市摆件`
- `全部桥梁`

常规名称不换行；超过 6 个汉字才允许截断并通过 Tooltip 提供完整名称。

每页最多显示 6 个 Rail 项；超过 6 个时使用左侧组分页 / 滚轮切换。Rail 内的 `全部道路 / 全部建筑 / 全部城墙` 等是正常 Filter，不做特殊入口样式。

打开 Workspace 后，Primary Rail 与 Context Filter 都必须有一个真实有效的筛选状态。默认 `全部…` / `全部` 可以 Selected，因为它们描述当前内容集合；这和 Main Dock “没有明确选择就不 Selected”是不同语义。

## 当前八类原型配置

- 道路：全部道路 / 土路 / 砂石路 / 石板路 / 砖路 / 官道；宽度作为 Context Filter；
- 桥梁：全部桥梁 / 木桥 / 石桥 / 拱桥 / 廊桥 / 浮桥；尺寸 / 宽水面作为 Context Filter；
- 建筑：沿用建筑形制 Rail，屋顶形制作为 Context Filter；
- 台基：全部台基 / 单层台基 / 多层台基 / 须弥座 / 月台 / 踏道；层数 / 宫殿 / 寺观作为 Context Filter；
- 城墙：全部城墙 / 夯土城墙 / 包砖城墙 / 高倾角城墙 / 城门段 / 马面角楼；地形作为 Context Filter；
- 围墙：全部围墙 / 夯土围墙 / 青砖围墙 / 白墙 / 花墙 / 院门；高度 / 园林作为 Context Filter；
- 装饰：全部装饰 / 灯具 / 旗幡 / 石雕 / 水景 / 街市摆件；场景用途作为 Context Filter；
- 树木：全部树木 / 乔木 / 果树 / 竹类 / 花木 / 水生植物；季相 / 水岸作为 Context Filter。

这些内容是信息架构与交互原型数据，具体历史类型、造价和游戏参数后续由各系统正式数据替换；共享 Workspace 框架不因数据替换而变化。

## Item Card

所有设计类别共用一种 Item Card 结构：

```text
预览图 | 名称
       | 一条关键属性
```

文字是主要识别信息，预览图用于快速确认。Card 不堆叠多层边框；Hover / Selected 使用弱 Tone 与细暖金状态。当前只显示一条常驻属性，更多说明进入 Tooltip 或后续详情区域。

建筑 Item 当前已经连接 Building Placement Tool。其它设计类别现阶段先完成 Workspace 浏览、筛选和显式选择；后续道路、桥梁、台基、城墙、围墙、装饰、树木分别连接自己的 Tool，不在 Workspace 内混入 Tool 参数。

## 状态与交互不变量

- `workspace='design'` 表示共享设计目录空间；
- `dockMode='design'` 且 `dockCategory` 为八类之一时才能拥有 Design Workspace；
- 同一个 Main Dock 分类再次点击 → Workspace 关闭、`dockCategory=null`；
- A 分类打开时点击 B 分类 → 保持一个 Workspace Surface，直接切换 Definition；
- 关闭 Workspace → Main Dock 分类取消 Selected；
- Camera / Weather 可以和 Design Workspace 共存；
- Top Shell、World Utility Toolbar、Main Dock 在 Design Workspace 中继续保留；
- 进入具体 Tool 后 Main Dock / Control Tray 按 Tool 空间规则隐藏；
- Building Placement 完成或取消后返回 `设计 → 建筑` Design Workspace，因为此时玩家仍处于明确的建筑任务上下文。

## 代码所有权

- `src/workspace/DesignWorkspace.tsx`：共享 Workspace 行为与结构；
- `src/workspace/design-workspace-model.ts`：八类 Definition 与原型数据；
- `src/workspace/design-workspace.css`：Design Workspace 专属 Rail / Item Card 视觉；
- `src/workspace.css`：Workspace 通用壳、Header、筛选、分页等基础样式；
- `src/app/ui-state.ts`：Workspace / Main Dock 全局状态与切换逻辑；
- `src/gameplay/GameplayScreen.tsx`：把当前 Definition 接入 Gameplay 空间。

不要重新创建 `RoadWorkspace / BridgeWorkspace / CityWallWorkspace` 等仅复制相同壳层的组件。只有当某一类别出现真正不同的稳定交互结构时，才抽取类别专用子组件。