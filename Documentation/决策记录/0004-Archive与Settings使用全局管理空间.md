# Archive 与 Settings 使用全局管理空间

## 决策

Archive 与 Settings 使用独立的全屏 Global Management Space，不使用普通中型 Modal。

## Archive

Load 的信息层级：

`Game Group → Save Timeline → Save Preview`

Game Group 代表玩家从一次新建游戏开始的一整场游戏，Save 是该游戏组内部的历史节点。

Pause Save 复用同一 Archive 视觉系统，但锁定当前 Game Group，避免将当前城市保存进其他游戏组。

## Settings

Main Menu Settings 与 Pause Settings 复用同一个 Settings 组件。

Settings 使用顶部水平分类：

- 显示
- 图形
- 音频
- 操作
- 游戏

不维护两套设置界面。

## 原因

Archive 和 Settings 都是完整管理任务，内容量和交互深度已经超过普通 Modal。

使用全屏空间可以：

- 保留游戏背景作为环境上下文；
- 建立更清晰的页面构图；
- 减少框套框；
- 让 Load / Save / Settings 在主菜单与 Pause 中拥有一致体验。

## 约束

全屏不意味着填满屏幕。

允许大面积留白，并优先通过 Tone、背景遮罩和内容图像建立层级，不为了填空增加无意义 Preview、Summary 或统计区。
