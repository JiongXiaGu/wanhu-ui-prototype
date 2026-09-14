# 万户天工 UI Prototype

交互式 UI 美术与流程原型，用于在 Unity UI Toolkit 正式实现前验证《万户天工》的界面视觉、空间关系和完整玩家流程。

## 当前流程

- 主菜单
- 新建城市
- 载入游戏
- 设置
- Gameplay HUD
- Gameplay Quick Controls
- CommandBar
- Building Selection Workspace
- Building Placement ToolOverlay
- Camera / Weather Right Edge Flyout
- Pause Layer

## 设计基线

- 固定逻辑画布：1920 × 1080
- 黛墨底、暖金强调、浅纸文字、弱边框分层
- 世界画面优先占据屏幕中心
- ToolOverlay 偏左
- Camera / Weather 从右侧边缘滑出
- Quick Controls 位于右上
- CommandBar 位于底部中央

## 开发

```bash
npm install
npm run dev
```

生产构建：

```bash
npm run build
```

## 部署

仓库已包含 `vercel.json`，可直接在 Vercel Import Git Repository 后部署。之后 main 分支提交会自动触发部署。
