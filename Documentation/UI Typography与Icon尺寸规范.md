# UI Typography 与 Icon 尺寸规范

本规范定义 Web Prototype 与 Unity UI Toolkit 共用的文字层级和图标逻辑尺寸。目标不是把所有文字做成一个字号，而是让相同语义消费同一尺寸档位，避免页面自行发明 6px、7.2px、8.8px 等不可维护数值。

## 1. 1920×1080 基线

正式 Typography Token：

```text
Micro             9.5px   极低优先级但仍需要阅读的 Metadata
Caption          10px     Tooltip、辅助标签、参数标签
Label            10.5px   普通 Control / Filter / Secondary Action
Body             11px     正文、列表信息
Body Strong      12px     强调正文、小标题
Subheading       13px     局部分组标题
Panel Title      16px     Context / Tool Panel 标题
Workspace Title  18px     Workspace 主标题
```

稳定规则：

- **9.5px 是可读文字下限，不是默认字号**；
- 常规交互文字优先 10～11px；
- 需要持续阅读的正文不得使用 9px 以下；
- 6～8px 不允许作为正式用户信息字号；
- 只有纯装饰刻度、无须阅读的图形标记可以小于 Micro；
- 不通过更小字号解决布局拥挤，应调整信息密度、行高或可见字段。

对应 Web Token：

```css
--wanhu-type-micro
--wanhu-type-caption
--wanhu-type-label
--wanhu-type-body
--wanhu-type-body-strong
--wanhu-type-subheading
--wanhu-type-panel-title
--wanhu-type-workspace-title
--wanhu-type-tooltip
```

Unity 建议建立同名语义变量，不机械复制页面局部字号。

## 2. Icon 逻辑尺寸

PNG Source / Runtime 仍固定为 64×64，UI 显示尺寸使用以下档位：

```text
XS   14px   极小行内状态、Check、Chevron
S    16px   普通按钮、资源、列表
M    18px   Workspace / Header
L    20px   Tool / Command 主按钮
XL   24px   少量强调入口
```

对应：

```css
--wanhu-icon-xs
--wanhu-icon-sm
--wanhu-icon-md
--wanhu-icon-lg
--wanhu-icon-xl
```

规则：

- 不因为 PNG 是 64×64 就让每个页面自由填写任意逻辑尺寸；
- 12～13px Icon 只保留给极窄的状态 Check 等已有特例，并优先审查是否可提升到 XS；
- Icon-only Button 的 Hit Area 与图标尺寸分离，Hit Area 通常 ≥28px；
- Heading / Command / Rail 的图标尺寸由共享组件 Contract 持有，业务 CSS 不重新定义。

## 3. Shared Component 映射

```text
Tooltip                      → Type Tooltip (10)
Parameter Label / Value      → Type Caption (10)
Select / Secondary Action    → Type Label (10.5)
Context Subtitle             → Type Caption (10)
Context Title                → Panel Title (16)
Workspace Title              → Workspace Title (18)

Inline Check / Chevron       → Icon XS (14)
Generic Button               → Icon S (16)
Workspace Header             → Icon M (18)
Tool / Bottom Command        → Icon L (20)
```

## 4. 允许业务自行决定的内容

以下不是简单 Token 替换，需要结合信息密度审查：

- Archive Save / Group Card；
- Management Dashboard；
- Inventory Management；
- 地图图例与 Compass 方位字；
- 世界中的临时 Scene Handle Label；
- 复杂图表轴标签。

这些区域如果存在 7～9px 字号，优先决定“是否减少同时显示的信息”，而不是简单把所有文字放大导致布局挤压。

## 5. 代码所有权

```text
wanhu-theme-tokens.css
    ↓ Typography / Icon semantic tokens
Shared Component CSS
    ↓ chooses semantic tier
Feature CSS
    ↓ layout only; only exceptional metadata may choose Micro
```

禁止：

- 新增 6 / 7 / 8px 正式文字；
- 同一语义在不同页面分别写 9 / 9.3 / 9.6 / 9.8px；
- Feature CSS 覆盖 Shared Component 的基础字号；
- 用 transform scale 缩小文字；
- 为同一类型 Icon 创建大量 15 / 17 / 19px 私有尺寸。

## 6. 审查基线

每次 UI Review 检查：

1. 1080p 下正文是否无需靠近屏幕阅读；
2. Secondary Text 是否仍能一眼辨认；
3. 图标与旁边文字是否视觉重量匹配；
4. Icon-only Button 是否有足够 Hit Area；
5. 同类 Context / Workspace / Tool 是否尺寸一致；
6. 低优先级信息是否真的需要常驻，而不是靠 7px 字号硬塞进去。

自动审查：

```bash
npm run audit:scale
```

Audit 的 `<10px` 统计是审查线索，不代表所有命中都必须机械改大。
