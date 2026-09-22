# UI Typography 与 Icon 尺寸规范

文字与图标使用语义档位，不按页面随意缩放。正式逻辑画布仍为 1920×1080；本轮改善内部阅读比例，不改变屏幕槽位或整体缩放规则。

## 文字档位

| Token | 逻辑字号 | 职责 |
| --- | --- | --- |
| Micro | 11px | 时间、版本、来源等低优先级元信息 |
| Caption | 11px | 紧凑参数标签、局部辅助文字 |
| Label | 12px | 按钮、筛选、参数数值 |
| Body | 12px | 紧凑工具内普通正文 |
| Reading | 13px | 库存比较数据、管理列表等持续阅读内容 |
| Body Strong | 13px | 强调正文 |
| Subheading | 14px | 局部分组标题、存档名称 |
| Panel Title | 16px | Context / Tool 标题 |
| Workspace Title | 18px | Workspace 标题 |
| Tooltip | 12px | 悬停解释 |

对应 `src/ui/wanhu-theme-tokens.css` 中的 `--wanhu-type-*`。Micro 和 Caption 当前数值相同，但分别表达元信息与参数标签，不合并语义。旧的 9.5 / 10 / 10.5px 档位不再是本轮共享系统的目标。

常规字重使用 400 / 500 / 600。正文不靠全体加粗改善可读性，持续阅读行距参考 1.65。保留主界面 Noto Sans SC、品牌标题 Noto Serif SC；字体资源的离线打包与 Unity Font Asset / fallback 实际导入仍需在迁移阶段完成，不能把浏览器字体加载成功当成 Unity 字体已验收。

库存总量、人口等核心指标可使用 14px 以上字号。不要为把内容塞回固定框而缩小文字；先检查字段、间距、可用宽度与正确的滚动容器。

## 控件和图标

PNG Runtime Asset 保持 64×64，显示档位仍为 14 / 16 / 18 / 20 / 24px。Source Master 与图标生产管线不变。

图标尺寸和命中区分离。Numeric Slider 使用两档共享密度：Standard 的 Stepper 30px / Value 68px，用于 Settings 与普通 Context；Compact 的 Stepper 28px / Value 58px，用于 Placement 等高密度工具。普通 Select / Binding Field 保持 34px 高，Toggle 保持 52×32px 命中区和 38×20px 可见轨道。无需把整个工具面板放大。

数字优先 tabular-nums。相同语义的数值框宽度、单位和精度规则应一致；不要求所有参数使用相同小数位。颜色参数和数字参数继续使用共享两列 Parameter Row。

## 阅读色与状态

主文字使用暖纸白；正文、参数名称、需要比较的数值不能普遍退到接近 Disabled 的亮度。元信息比正文弱一档，但仍须可读。

小字号熟铜文字使用 `--wanhu-color-brass-text`；熟铜填色和状态线继续使用原来的 Brass / Active Token。Hover 是中性提亮，Selected / On 是熟铜，Focus 是独立轮廓，允许 Selected 与 Focus 同时存在。

## 样式归属

Theme 持有档位和色彩；共享控件选择档位；Feature 只对确有业务语义的阅读内容选择 Reading / Subheading。不得在业务文件里反复改同一种 Slider 的基础字体、圆角、内部尺寸和交互色，也不得为单个页面私有重画 Scrollbar。

Archive 的历史基础样式和后续覆盖已在原文件收敛。Management Skin 不再覆写 Inventory 的内部字体和选中样式，库存内部由自身组件文件持有。

## 验证

`npm run audit:scale` 是源码线索扫描，不等于全量可读性验收。`scripts/capture-typography-decision-review.mjs` 在真实页面检查本轮明确负责的字号、数字截断、Selected + Focus、Toggle 状态、昼夜和 4K 逻辑画布，并输出 `readability-report.json` 与截图。

本轮共享档位升级不表示仓库所有历史局部字号都已完成逐条迁移。新增修改不得再通过 7–10px 文字或 transform scale 掩盖布局问题；残留例外应按页面实际阅读需求处理。

1080p 为正式审图基准；4K 使用同一逻辑画布缩放，不维护所有数值翻倍的第二套 USS。Web 截图不能代替 Unity 6.6 Player 中的字体、DPI、PanelSettings 和手柄可读性检查。


## Secondary Action Bar 字号与图标

Gameplay 二级中下菜单是图标主导型控件，使用独立的稳定层级：

- 主图标：24px；
- 可见短标签：11px；
- 标签位于图标下方，不与图标横向并排；
- 按钮 76×64px；Bar 总高 84px；
- Selected 依靠图标色与顶部状态线，不放大图标、不改变按钮尺寸；
- Tooltip 仍使用共享 12px Tooltip 文字，不因可见标签变小而同步缩小。

此规则只约束 Secondary Bottom Action Bar；右下 Utility 继续使用 20px 图标，普通正文 / Label 继续遵守既有 12px 基线。


## Main Dock 字号与图标

一级 Main Dock 与二级 Secondary Action Bar 使用相同“图标主导、文字说明”的视觉语言，但保留层级差异：

- Category：24px 图标 + 11px 标签；
- Design / Blueprint Mode：18px 图标 + 11px 标签；
- Category 使用 Icon Top / Label Bottom；Design / Blueprint Mode 使用独立上下双行 Rail，每行 Icon Left / Label Right；
- Category Active 使用顶部状态线；Mode Active 不使用状态线，只依靠熟铜图标 / 文字与弱背景；
- Main Dock 总高 84px；Category 内部高度 64px；Mode Rail 高 64px，由两个约 68×30px 按钮上下组成；图标和标签不得因 Active 改变尺寸。
