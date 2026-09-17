# Wanhu HUD Glass 视觉规范

Wanhu HUD Glass 是 Wanhu Mist Glass 在 Gameplay 常驻 HUD 上的角色化应用。它不改变 HUD 的布局、尺寸或交互，而是统一顶部状态栏、底部主 Dock、右下 Utility 与操作提示的材质语言。

## 目标

常驻 HUD 必须与 Environment、Workspace、Asset Inspector 属于同一套中性 Mist Glass 家族，不再保留独立的深墨绿 HUD 皮肤。

统一内容：

- 中性暖石灰灰 Tint；
- Paper White 主文字；
- Muted Gray 次级文字；
- Old Gold 只表达当前、选中、重点状态；
- 极弱 `glass-noise-soft.png`；
- 统一 Edge、Shadow、Scene Blur 语言。

角色之间只通过 Surface Alpha、Edge、Shadow 和任务强度区分，不通过不同色相区分。

## Surface Role

### HUD Glass

用于顶部世界状态、资源、时间与模拟速度。

白天基线：

- Surface：约 `rgba(82,84,82,.50)`；
- Blur：`20px` Scene Blur；
- Edge：约 `.18`；
- 任务：长期稳定阅读。

顶部第二排导航属于 Secondary HUD：

- Surface：约 `.42`；
- 与主状态栏同色相；
- 更轻，避免顶部形成厚重双层黑条。

### Dock Glass

用于底部 Main Command Bar。

- Surface：约 `.58`；
- Blur：`20px` Scene Blur；
- Edge：约 `.19`；
- 比 Top HUD 更实，因为它承担高频主操作与大量图标状态。

Dock 不是黑色底板；世界仍应能进入材质，但不能影响图标和标签识别。

### Utility Glass

用于右下 World Utility Toolbar 和右上 System Menu。

- Toolbar Surface：约 `.42`；
- Menu Surface：约 `.40`；
- Blur：`20px` Scene Blur；
- 默认低存在感，Hover / Active 才明显提高对比度。

### Hint Glass

用于 Operation Hint。

- Surface：约 `.46`；
- Blur：`20px` Scene Blur；
- 比 Utility 略实，用于保护 8–10px 小字号文本；
- 仍然是只读辅助信息，不做成独立深色卡片。

## 夜晚

夜晚不切换到另一套蓝黑/墨绿皮肤，只做轻微亮度与 Alpha 调整：

- Top HUD：约 `.47`；
- Secondary HUD：约 `.39`；
- Main Dock：约 `.56`；
- Utility：约 `.39`；
- Hint：约 `.43`；
- System Menu：约 `.37`。

通过更亮的中性 Tint 和轻微 brightness 提升维持可读性，不通过单纯加黑解决。

## Unity UI Toolkit / URP 约束

常驻 HUD 大多直接覆盖 Scene，因此可以使用共享 Scene Blur Texture：

`Scene → Shared URP Blur Texture → HUD Tint / Edge / Noise / Content`

规则：

- HUD 不各自创建 RenderTexture；
- 所有 HUD 共用同一份 Scene Blur；
- HUD 之间相互重叠时，不假设上层 HUD 可以再次模糊下层 UI；
- 层级差仍依靠 Tint Alpha、Edge、Shadow；
- 对于 Inspector 等覆盖 Workspace 的 Elevated Surface，继续遵循“不能依赖 UI-over-UI Blur”的独立规则。

## 状态色

Old Gold 只用于：

- 当前模式；
- 当前类别；
- 当前速度；
- Primary Hint；
- Focus / Active 状态。

默认 Surface、Border 和普通 Hover 不使用大面积金色。

## Review 门槛

HUD 材质改动必须同时检查：

- 白天完整 Gameplay HUD；
- 夜晚完整 Gameplay HUD；
- Top HUD、Secondary HUD、Dock、Utility、Hint、System Menu 的 Alpha 层级；
- 所有角色继续使用共享 Noise；
- Scene Blur 保持单一共享来源；
- 不改变既有 HUD 几何、布局、功能和输入行为。
