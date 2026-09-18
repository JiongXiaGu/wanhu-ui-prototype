# 2026-09-19 Terrain Edit World Tool

本轮把 World Utility 的“地形编辑”从占位按钮接成正式 Tool Space。

## 状态架构

- Tool 新增 `terrain-edit`；
- 旧 `TerrainMode` 改名 `BuildingTerrainMode`；
- 新增 `TerrainEditMode`；
- 新增 Terrain Contours / Slope View / Protect Built 状态；
- 新增 `ToolOrigin`；
- `EXIT_TOOL` 不再根据 road/building 猜返回 Workspace。

## 共享 Tool Action

新增 `src/tools/ToolActionBar.tsx`。

- PlacementActionBar 变为 Adapter；
- Building / Road 保持完成 + 取消；
- Terrain 直接使用共享 Shell，只显示完成。

## Terrain UI

新增：

- `src/tools/terrain-edit/TerrainEditTool.tsx`
- `src/tools/terrain-edit/terrain-edit.css`

包含：

- Left Context；
- Brush Radius / Strength / Falloff；
- Flatten Target Height；
- Slope 摘要；
- 五种 Mode；
- Terrain Context Utility；
- Terrain Operation Hints；
- World Brush Visualization 占位。

## Unity 边界

Web Brush Ring 只用于视觉验证。真实 Terrain 修改、保护查询、Undo Command 和 Brush Renderer 属于 Unity TerrainBrushController / World Renderer，不属于 UI Toolkit。
