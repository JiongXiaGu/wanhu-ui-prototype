# World Utility 双层与批量摧毁入口

本轮只调整普通主游玩状态的 World Utility。

```text
第一行
地图解锁 | 区域编辑 | 地形编辑 | 配色工具

第二行
网格吸附 | 网格显示 | 范围复制 | 范围移动 | Undo | Redo | 批量摧毁
```

仍然使用一个 Bottom Command Surface，不拆成两张卡。第一行居中表达世界模式，第二行承担辅助和动作；批量摧毁独立为第二行最右危险组。

新增 `worldDemolitionMode`。只有普通 Gameplay 可以 Toggle；激活后 Building Selection Hit Area 暂停，Operation Hints 改为批量摧毁操作提示，Esc 退出。打开 Workspace、Context、Management、Map、Pause 或进入 Tool 时自动清除该模式。

Web V1 不实现真实拖框、空间查询、批量实体删除或资源返还。Unity 正式版由 WorldDemolitionController + Command History 持有这些行为，UI 只表达模式与命令入口。
