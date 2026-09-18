# 2026-09-18 World Utility 可读性与引导优化

本轮保留全部 10 个 World Utility 功能，但将上一版“过强的小号 Command Bar”收束为真正的 Ambient Utility Rail。

## 最终顺序

```text
世界编辑        范围操作       精确辅助       历史
⌂  ⛶  △  ◌  ·  ⧉  ✥  ·  🧲  ▦  ·  ↶  ↷
```

功能顺序对应：

```text
地图解锁 / 编辑区域 / 地形编辑 / 配色工具
范围复制 / 范围移动
网格吸附 / 网格显示
撤销 / 重做
```

## Visual Hierarchy v3

上一版为提高辨识度将 S 档放大到 22px Icon / 56px 高，结果与 Placement Action Bar 过于接近。本版回调为：

- Surface Density：`.42` → 约 `.49`，避免世界纹理直接穿透；夜晚约 `.50`；
- Height：56 → 52px；
- Button Hit Area：42 → 40px；
- Icon：22 → 20px；
- Stroke：1.68 → 1.62；
- Width：500 → **458px**；
- 1920×1080 下与 940px 居中的 Main Dock 保持 **16px 真实间距**；
- Divider：22 → 18px，Margin 6px，并进一步降低 Alpha；
- Default Icon 回到 Neutral Muted；
- Hover 使用圆形局部 Tone；
- Toggle On 使用 Brass Icon + 约 12px 短 Tick + 几乎无底衬；
- Placement 仍使用更完整的 Active Tone + 更长状态线，因此主辅角色不再可互换。

## Player Attention

普通 Gameplay：

```text
World > Main Dock > Top HUD > World Utility > Operation Hints
```

Placement：

```text
World Ghost > Placement Action Bar > Left Context > World Utility > Operation Hints
```

Operation Hints 的通用镜头控制继续降为 Secondary（约 58%），不与 World Utility 共同形成右侧第二视觉中心。

## Review

Bottom Command Review 检查：

- 10 个功能完整；
- 4 个语义 Group；
- 顺序固定为 世界编辑 / 范围操作 / 精确辅助 / 历史；
- 3 条 Divider；
- Utility Icon = 20px、Stroke 1.60–1.64；
- Utility Width ≈ 458px、Height <= 52px；
- Main Dock ↔ Utility Gap ≈ 16px；
- Utility Surface Alpha 约 .48–.50；
- Utility Active Tick <= 12.5px；
- 白天 / 夜晚继续保持 M > L > S。
