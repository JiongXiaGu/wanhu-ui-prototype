# 2026-09-18 World Utility 可读性与引导优化

本轮不删除 World Utility 的任何功能，只解决“连续十个灰色图标难以辨认”的玩家认知问题。

## 信息架构

```text
世界编辑 │ 精确辅助 │ 范围操作 │ 历史
4 项        2 项        2 项       2 项
```

通过四个语义 Group、三条 Divider 和组间留白建立节奏，不增加常驻文字标签。

## 视觉

- S Surface Density 保持不变，不通过加深背景解决可读性；
- Icon 从 20px 提到 22px；
- Stroke 从 1.55 提到约 1.68；
- Default Icon 提亮到 Text Muted；
- Hover 使用更清楚的中性 Smoke Tone；
- Toggle On 继续使用熟铜 + 2px 状态线；
- One-shot Action 不留下 Selected；
- World Utility 宽度从 458px 增加到 500px，避免为了塞入功能继续压缩图标和组间距。

## Placement / Hints

- Placement Action Bar 仅增加 Divider 周围间距，强化 Mode / Quick / Commit 节奏；
- Operation Hints 保留全部键位，但镜头移动 / 缩放等通用操作降为 Secondary Tone，优先让玩家看到当前 Tool 特有动作。

## Review

Bottom Command Review 额外检查：

- 10 个功能完整；
- 4 个语义 Group 顺序正确；
- 3 条 Divider；
- Icon >= 22px、Stroke >= 1.65；
- Building 操作提示包含 Secondary 层；
- 白天 / 夜晚 L/M/S 层级继续保持稳定。
