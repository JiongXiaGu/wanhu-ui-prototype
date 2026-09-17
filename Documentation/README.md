# Documentation

本目录用于长期维护《万户天工》UI Prototype 的稳定设计信息、关键决策、阶段开发记录和当前工作上下文。

## 新接手入口

按以下顺序阅读：

1. `工作交接.md`
2. `项目概览.md`
3. `UI设计原则.md`
4. `UI空间与状态架构.md`
5. 当前任务相关的 `决策记录/`、组件 / Control 规范和代码

## 文档职责

### 项目概览.md

记录项目定位、技术栈、部署、核心空间和长期工作方式。

### UI设计原则.md

记录长期美术、信息密度、Surface、Typography、Tooltip 和视觉审查规则。

### UI空间与状态架构.md

记录 Gameplay / Workspace / Tool / Pause / Flyout / Global Space 的职责与状态边界。

### UI Surface与Control视觉规范.md

记录 Surface、Blur、Button、Segmented、Footer 等跨空间视觉语法。

### UI基础Control视觉规范.md

记录 Slider、Numeric Slider Field、Stepper、Value Field、Select、Toggle、Text Input 的共享视觉、使用边界和 Unity UI Toolkit 映射。基础控件迁移优先以此文档为准。

### Bottom Command Visual System设计规范.md

记录 Main Dock、Placement Action Bar、World Utility Toolbar 的 L / M / S 底部命令栏视觉系统。

### 决策记录/

记录已经确定、后续不应反复从零讨论的重要设计决策，以及为什么这样决定。

### 开发记录/

按日期记录阶段性修改、审图结论、原因和下一步。不是逐 commit 流水账。

### 工作交接.md

维护当前正在做什么、已经完成什么、下一步是什么、哪些地方不要回退。新对话优先读取。

### 代码审查/

按日期保存代码结构、逻辑风险、技术债务和优化建议，方便后续定位。

## 维护原则

- 代码是具体实现的权威来源；
- 文档记录稳定事实、职责边界、契约、关键不变量和设计原因；
- 不建立 `_AI` 目录；
- 正式设计文档不加入“文档状态、审核状态、核验时间”等机器式元数据；
- 视觉或架构决策发生变化时，应更新对应正式文档和 `工作交接.md`；
- 阶段完成后在 `开发记录/` 留下简明记录；
- 不把每次 1～2 px CSS 微调写成开发日志。
