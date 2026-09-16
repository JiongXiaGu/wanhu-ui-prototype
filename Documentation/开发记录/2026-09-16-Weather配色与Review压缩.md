# 2026-09-16 Weather 配色与 Review 压缩

## 目标

解决 Gameplay UI 在降低 Surface Alpha 后仍然偏黑、偏平的问题，并以 Weather Context Surface 作为第一块配色锚点验证“深墨青 + 玉青 + 暖金 + 纸色”是否适合昼夜场景。

本轮只建立 Weather 的局部基线，不直接把颜色强制推广到 Workspace、Top Shell 或其它系统。

## Weather 配色

Weather Surface 保留深墨青主体，只在结构节点加入装饰色：

- 面板顶部加入很弱的玉青环境 Tone 与暖金 Tone；
- Header Icon 使用玉青边界 / Surface；
- 主标题使用偏纸色；
- Section Title 使用玉青文字，并增加 3px 玉青状态点；
- Slider Fill 使用低饱和玉青渐变；
- Slider Thumb 使用柔和暖金 + 纸色边；
- 数值字段使用极弱暖金 Surface / Border；
- Stepper Hover 使用玉青 Tone。

颜色不通过父节点 `opacity` 传递，正文、Icon 与控件内容仍保持独立对比度。

## 环境模式 Segmented Control

原有 `跟随世界 / 场景模拟` 视觉的问题是 Surface、Option 和 Active 都接近同一种暗色，形成“黑胶囊里再套暗胶囊”的观感。

最终复核版采用更扁平的模式 Tab：

- 总高约 `36px`；
- 外壳 `9px` Radius；
- Option 高约 `30px`、`7px` Radius；
- Inactive 使用弱玉青灰文字与轻 Surface；
- Hover 使用弱玉青 Tone；
- Active 使用很淡的暖金填充，并用顶部 `2px` 暖金状态线确认当前模式；
- 不使用厚金框、强阴影或整块高饱和金色。

这套语法仍能直接映射到 Unity UI Toolkit 的 SegmentedControl / Option Active USS Class。

## 昼夜复核

白天与 22:00 夜景均实际审图：

- Weather Surface 在白天不再是一整块黑灰面板；
- 夜景下玉青色调与橙色建筑灯火可以共存，不需要单独 Night Theme；
- 暖金只承担 Active / Value / Thumb 等小面积强调，没有和场景灯火形成大面积竞争；
- Slider、Section、Mode 之间有颜色节奏，但正文仍保持克制；
- 第二版 Segmented 比第一版更扁平，减少长胶囊感。

当前结论：Weather 可以作为后续 Gameplay 配色系统的参考锚点，但是否推广到 Workspace / Top Shell 应继续逐块复核，而不是机械复制全部局部颜色。

## Review 图片压缩

新增 `scripts/compress-review-screenshots.mjs`，Visual Review 在所有 Playwright 截图 / 断言完成后统一压缩：

- 1920×1080 PNG 仍用于 CI 截图与断言；
- 输出预览最大宽度 `1600px`；
- WebP Quality `80`；
- 压缩成功后删除 PNG；
- Artifact 只保留 WebP。

本轮实际 Artifact 从此前约 80MB 级别降到约 3.8MB，Gameplay / Weather 单张预览通常约 120–150KB，仍可清楚检查主要文字、Surface、Active 与控件层级。

正式复核流程同步更新到 `Documentation/UI原型复核流程.md`。
