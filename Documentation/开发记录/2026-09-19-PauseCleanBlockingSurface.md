# 2026-09-19 Pause Clean Blocking Surface

本轮针对 Pause 菜单的“磨砂发灰 / 颗粒偏脏”问题，保留原有 3+1 信息架构，只重做材质与内部层级。

## 修改

- 世界层继续负责 Dim + Blur；
- Pause Command Surface 本体移除共享 Noise Texture；
- Pause Surface 本体移除 backdrop blur，改为干净的半透明 Smoked Graphite；
- Surface 通过稳定 Tint / Edge / Shadow 建立 Blocking 层级；
- Header 增加极弱中性 Graphite Lift 与底部 Rule；
- Command Row 统一为 50px Hit Area，默认透明、Hover 中性、Focus 弱熟铜 + 左侧 2px 状态线；
- Divider 缩进并降低存在感；
- Surface 宽度从 432px 调整到 448px，留白与命令密度重新平衡；
- 返回主菜单继续保持中性，风险语义仍由后续共享 Dialog 表达。

## Unity 落地

- World Dim / Blur 映射共享 URP Fullscreen Pass；
- Pause Panel 自身不需要 RenderTexture / 二次 Blur；
- Panel Tint / Edge / Shadow 与 Header / Row 状态可直接映射 USS；
- 保留现有 Focus、Arrow / Home / End 与 Esc 行为，不改输入结构。

## 验证

- GitHub Actions Visual Review 已退出默认流程；
- 本轮默认验证为 Build + 代码 / 状态 / 样式所有权检查。
