# 2026-09-17 Workspace 视觉母版

本轮把 Environment 已验证的 World-first Glass 视觉语言推广到 Design Workspace，但不改变 Design Workspace 的信息架构、状态模型和几何基线。

## 本轮内容

- 新增 `src/workspace/workspace-world-first-glass.css`，作为 Design Workspace 独立视觉覆盖层；
- Workspace Root 改为中性雾面玻璃，保留极弱 `glass-noise-soft.png` 材质纹理；
- Header 作为 Context Tier，比 Body 更轻、更透，不再像独立深色标题条；
- Body 作为 Work Tier，保持资产浏览的稳定阅读性；
- Primary Rail 去掉独立深色栏感，Selected 使用克制暖金左状态线；
- Context Filter 改为轻量 Tab 视觉，Selected 使用暖金下状态线；
- Search 回到 Utility Action 语义，默认弱化，Hover / Editing 才显现；
- Asset Card 默认更平，仅 Hover / Focus 抬升，不产生持续 Selected；
- Pager 默认低存在感，Current Page 使用旧金；
- Asset Inspector 保持比 Workspace 更深、更实的悬浮层级；
- 保持 1240×370 Workspace、146px Rail、4×2 Grid、255×100 Card、64×64 Preview 等原有结构基线；
- 补充 22:00 夜景 Workspace Visual Review，验证同一材质在昼夜都可读。

## 视觉决策

Workspace 不复制 Environment 的具体组件外观，只共享以下材质和状态原则：

- 世界画面是主要美术内容；
- UI 使用中性石灰灰 / Paper White / Muted Gray；
- 暖金只用于 Selected / Focus / Current；
- 玉青只用于少量语义 Icon；
- 不依赖插画贴图增加“丰富度”；
- 不依赖 Web Blur 保证基础可读性；
- Unity 最终使用共享 URP Blur Service + USS Surface Tier。

正式视觉规则见：`Documentation/Workspace World-first Glass视觉规范.md`。

## 复核

保留原有八类 Design Workspace Playwright 复核：道路、桥梁、建筑、台基、城墙、围墙、装饰、树木。重点继续检查：

- Workspace 固定几何；
- Rail / Context Filter 唯一 Active；
- 4×2 Content Grid；
- Asset Card Action Button 语义；
- Asset Inspector Hover / Focus 生命周期；
- Building Placement 往返；
- 昼夜 Workspace 材质与世界背景关系。