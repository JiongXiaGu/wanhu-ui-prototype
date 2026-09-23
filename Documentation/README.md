# Documentation

本目录维护《万户天工》UI Prototype 的稳定设计、职责契约、当前上下文与演进记录。代码是具体实现权威；文档不替代真实样式链和测试。

## 接手入口

依次读取 [工作交接](<工作交接.md>)、[项目概览](<项目概览.md>)、[UI Toolkit 视觉总规范](<UI Toolkit视觉总规范.md>)，再读取本任务涉及的领域规范和代码。

| 领域 | 文档 | 职责 |
| --- | --- | --- |
| 视觉全貌 | [UI Toolkit 视觉总规范](<UI Toolkit视觉总规范.md>) | 页面家族、阅读顺序、状态区别、CSS 到 USS 的判读方法与现存例外 |
| 配色与材质 | [烟墨熟铜视觉材质规范](<Wanhu 烟墨熟铜视觉材质规范.md>) | 当前 Theme Token、Root/Body/Backdrop 配方、局部前景与昼夜边界 |
| 长期视觉治理 | [Web 配色与样式治理长期方案](<Web 配色与样式治理长期方案.md>) | 分阶段收敛 Theme / Surface / Control / Feature CSS，并定义 CI Ratchet；不实施 Unity USS |
| 信息设计 | [UI设计原则](<UI设计原则.md>) | 减少冗余、空间与内容取舍；不重复维护色卡 |
| 表面与操作语法 | [UI Surface与Control视觉规范](<UI Surface与Control视觉规范.md>) | Family、按钮、Segmented、全屏和底部命令组合 |
| 字体与资源 | `UI Typography与Icon尺寸规范.md`、`UI图标资产管线.md` | 语义档位、PNG Runtime / SVG Source、字体与 Player 边界 |
| 基础控件 | `UI基础Control视觉规范.md` | Slider / Numeric Field / Toggle / Select / Text Input |
| 空间与动效 | `UI空间与状态架构.md`、`UI Motion System设计规范.md` | State、Input、Presence、Focus 与空间交接 |
| Unity | `UI Toolkit落地规范.md`、`Unity 6.6视觉能力与回退规范.md` | UXML / USS / C# 所有权、实际版本能力与回退 |
| 目录与建造 | `Design Workspace设计规范.md`、`蓝图Workspace设计规范.md`、各 Tool 规范 | 内容与交互契约，不各建独立皮肤 |
| 全屏与管理 | Pause / Global Space / Management、Settings / Archive / Save / New Game 对应规范 | 保留不同页面的信息架构 |

## 当前事实与历史隔离

`工作交接.md` 只保留当前可执行规则。`历史/` 的快照、`开发记录/` 的阶段叙述、Study / Pass 实验说明不作为当前取色入口。旧内容若与代码和现行规范冲突，应追踪演进，不直接恢复旧实现。

本轮重要差异与读取范围见 [视觉语言与样式权威审查](<代码审查/2026-09-24-视觉语言与样式权威审查.md>)。原有 Edge / Character / HUD Glass 等专项材料仍可追溯意图，但其中的局部色值、旧选择器和引擎限制必须与当前代码、材质规范、6.6 专项规范交叉核对。

## 维护原则

正式文档记录意图、职责、数据所有权、契约、不变量、生命周期和边界，不逐行重复实现，不创建 `_AI` 文档层，也不加入文档状态/审核状态/核验时间等机器式元数据。

Theme 改色需同步材质规范；组件变体变化需同步对应领域规范。总规范只做跨域阅读入口，不再复制一套私有色卡。阶段过程放 `开发记录/`，结构与缺陷分析放带日期的 `代码审查/`。

任何交付应分清源码审查、构建、截图下载、实际审图和 Unity Player 验证。历史 Actions 成功不能被写成本轮已经实际看图。
