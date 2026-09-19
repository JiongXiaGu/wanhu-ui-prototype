# 城墙 Workspace 设计规范

城墙 Workspace 负责选择 **城墙体系与体系内构件**。它不是城墙营造参数面板，也不直接承担路径绘制、门洞嵌入或楼梯参数编辑。

## 1. 领域结构

正式信息结构：

```text
CityWallSystem
  └ CityWallModule
       ├ 城墙
       ├ 城墙门洞
       ├ 登城梯
       └ 高差楼梯
```

当前 Web Prototype 首轮体系：

- 小倾斜角；
- 高倾斜角；
- 临水；
- 山地。

每个体系首轮固定提供四类构件。后续允许体系增加，但 Workspace 结构不随体系数量变化。

## 2. Workspace 映射

继续复用共享 `DesignWorkspace`：

```text
Header
+ Primary Rail        = 城墙体系
+ Context Filter      = 构件类别
+ 4×2 Content Pool    = 具体城墙模块
+ Pager
+ Shared Asset Inspector
```

不得恢复旧 `CityWallSelectionWorkspace` 的独立 Workspace Shell。

## 3. Primary Rail

左侧只选择 **城墙体系**：

```text
所有
小倾斜角
高倾斜角
临水
山地
```

以下内容不再作为一级体系：

- 夯土城墙；
- 包砖城墙；
- 城门段；
- 马面角楼。

材料、形态或特殊节点如果未来需要表达，应进入具体 System / Module 数据，而不是重新破坏 System → Module 的层级。

## 4. Context Filter

顶部固定：

```text
全部 / 城墙 / 门洞 / 登城梯 / 高差楼梯
```

UI 使用“门洞”作为短标签；领域语义是“城墙门洞”。

旧版“陆门 / 水门”不再拆成一级分类。水门属于门洞类的具体模块，例如“拱券水门洞”。

## 5. Content Card

Card 表示具体模块，不表示参数组合。

当前示例：

### 小倾斜角

- 标准墙段；
- 拱券门洞；
- 直登城梯；
- 马道高差梯。

### 高倾斜角

- 高倾角标准墙段；
- 高墙拱券门洞；
- 高墙登城梯；
- 高墙高差梯。

### 临水

- 临水标准墙段；
- 拱券水门洞；
- 临水登城梯；
- 临水高差梯。

### 山地

- 山地顺坡墙段；
- 山地拱券门洞；
- 山地登城梯；
- 山地高差梯。

楼梯宽度、高度、高差、坡度、门洞净宽/净高、墙高等都属于后续 Tool 参数，不允许为了这些参数复制大量 Card。

## 6. Asset Inspector

城墙使用共享 Inspector Shell，但信息语义改为：

- 所属体系；
- 构件类型；
- 营造方式。

营造方式：

- 城墙 → 路径绘制；
- 城墙门洞 → 嵌入墙段；
- 登城梯 → 依附墙侧；
- 高差楼梯 → 连接马道。

Description 可以说明后续 Tool 的参数职责，但本轮 Card 点击不进入 Tool。

## 7. 后续 Tool 边界

旧 Unity 原型已经验证四类构件需要不同世界交互：

```text
城墙
→ CityWallConstruction
→ Path Tool
→ 城外正面 / 墙高 / 整体找平 / 随地形

城墙门洞
→ CityWallGatePlacement
→ Embedded Module Tool
→ 城门纵深 / 门洞净宽 / 门洞净高

登城梯
→ CityWallGroundAccessPlacement
→ Wall Attachment Tool
→ 楼梯宽度 / 楼梯高度 / 目标坡度

高差楼梯
→ CityWallWalkwayTransitionPlacement
→ Walkway Transition Tool
→ 楼梯宽度 / 楼梯高差 / 目标坡度
```

本轮不实现这些 Tool，只固定 Workspace 数据边界。

## 8. Unity UI Toolkit 映射

正式 Unity 推荐：

```text
CityWallCatalog
├ Systems
└ Modules
   ├ SystemId
   ├ Category
   ├ ModuleId
   └ ToolType

DesignWorkspaceController
├ PrimaryRail.Bind(Systems)
├ Filter.Bind(ModuleCategory)
└ ContentPool.Bind(filtered Modules)
```

固定 4×2 可见槽位继续使用普通 VisualElement Pool，不需要 ListView。

## 9. Visual Review

至少覆盖：

- 所有体系 / 全部构件默认态；
- 小倾斜角体系，必须同时显示四类模块；
- 门洞筛选；
- 临水体系下水门仍属于门洞；
- 旧夯土 / 包砖 / 马面角楼 / 地形筛选不再出现；
- Workspace 尺寸、分页和共享 Inspector 不被城墙特例破坏。
