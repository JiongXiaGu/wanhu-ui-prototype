# Bottom Command Visual System 设计规范

Bottom Command Visual System 统一 Gameplay 底部三类持续操作面：

- **Main Dock = L**：选择“要建造 / 浏览什么”；
- **Placement Action Bar = M**：当前 Tool 的模式、快捷动作与完成 / 取消；
- **Context Utility Toolbar = S**：右下固定辅助槽；Gameplay / Workspace 显示 World Utility，Tool 中切换为对应 Tool Utility。

三者是同一套 **Smoked Graphite / 烟墨熟铜** Command 家族，不是三套 Toolbar 皮肤。

## 1. 视觉身份

玩家应读成一套连续的底部控制系统：

```text
L  Main Dock              主入口 / Work
M  Placement Action Bar   当前任务主控 / Focused Work
S  Context Utility        上下文辅助 / Ambient
```

稳定规则：

- L / M / S 使用同一中性略暖 Graphite Hue；
- 层级通过 Density、尺寸、Shadow 和信息密度表达，不通过绿色 / 蓝色换 Hue；
- M 最稳，L 次之，S 最轻；
- 世界画面仍是视觉主体；
- 熟铜只表达 Active / Toggle On / Current Primary；
- 默认 Button 不形成一排独立小卡片。

## 2. 1080p 几何

### L — Main Dock

- 高约 `76px`；
- 宽约 `940px`；
- 分类图标约 `21px`；
- 允许 Icon + 两字标签；
- 14px Surface Radius。

### M — Placement Action Bar

- 高约 `68px`；
- Button `46 × 46px`；
- Icon 约 `20px`；
- 宽度由 Mode / Quick Action 数量自然决定；
- Building / Road / Wall / Bridge 等全部复用同一外壳；
- 14px Surface Radius。

### S — Context Utility

- 高约 `56px`；
- Button `42 × 42px`；
- Icon 约 `20px`；
- 右下固定 Host 常驻于 Gameplay / Workspace / Tool；
- World / Building / Road 等 Context 可以直接切换内容与宽度；
- 14px Surface Radius。

不要为了整齐把三者做成同宽同高。

## 3. Material Recipe 与所有权

正式所有权：

```text
wanhu-theme-tokens.css
  └ Bottom Command L / M / S Density + State Tokens
          ↓
wanhu-surface-system.css
  └ .bottom-command-surface--lg / --md / --sm
          ↓
Component CSS
  └ Geometry + Content + State Geometry
```

- `gameplay-hud-layout.css` 只负责尺寸、位置、安全边距；
- `bottom-command-system.css` 只保留共享 Shell Geometry；
- Main Dock、Placement、Context Utility 的业务 CSS 不重新定义 Root Surface；
- Noise / Edge / Shadow / Blur 必须来自同一 Surface System。

三个 Tier 的 RGB Hue 应保持接近中性；绿色植被背景下不得读成墨绿色 Toolbar。

## 4. Button 状态

### Default

- Transparent；
- 中性 Muted Icon / Text；
- 无持续 Border / Box。

### Hover

- Paper 提亮；
- 极弱中性 Smoke Tone；
- 不使用熟铜证明“可点击”。

### Active / Toggle On

- Aged Brass Icon / Text；
- 极弱 Brass Tone；
- 顶部 `2px` 短状态线。

Main Dock 左侧“设计 / 蓝图”是纵向 Selector，保留左侧短状态线作为方向性例外。

### Disabled

只降低亮度 / 对比。

## 5. Mode / Quick / Primary

### Mode

Exclusive Selector。Selected 持续存在。

### Quick Action

One-shot Action：

- 不使用 Selected；
- Press 后不残留金色；
- Placement 旋转 / 镜像 / 道路反转与 Context Utility 普通 One-shot 使用同一中性语言。

### Placement Confirm

“完成”是 M 档唯一持续 Primary：

- Brass Highlight Icon；
- 比 Active Mode 稍高一档的低强度 Brass Tone；
- 顶部短状态线；
- 不做大面积金底、粗框或 Glow。

“取消”保持中性，不使用 Danger Red。

## 6. Divider / Tooltip

Divider：

- 约 `24px` 高；
- 暖纸灰低 Alpha；
- L / M / S 共用同一颜色和节奏。

Tooltip：

- 中性 Graphite；
- 约 10px Radius；
- 9px 左右文字；
- 320–400ms Hover Delay；
- 不可交互；
- Placement / Context Utility 使用同一材质。

## 7. 昼夜

昼夜不换 Palette。

夜晚只允许小幅提高 L / M / S Density 与 Brightness，保持：

- M > L > S 的任务重量关系；
- Smoked Graphite Hue 不转蓝 / 绿；
- Paper / Muted / Brass 语义不变化。

## 8. Unity UI Toolkit 映射

建议共享 USS：

```text
.bottom-command-surface
.bottom-command-surface--lg
.bottom-command-surface--md
.bottom-command-surface--sm

.command-button
.command-button--active
.command-button--primary
.command-divider
```

C# 只切换状态 Class；不从颜色反推业务状态。

正式 Unity 使用共享 Scene Blur / Surface Asset，不给 L / M / S 创建三套独立 Blur 或材质。

## 9. Context Utility 切换

Bottom Command 的切换必须消费共享 Motion System：

- Exit = Fast 100ms；
- Enter = Surface 160ms；
- Bottom Preset = Fade + Y 8px；
- Context Utility Rebind 只在 Hidden 阶段发生；
- 不动画 Toolbar Width；
- 动画阶段 Pointer Input 关闭。



Context Utility 使用一个稳定 Host，而不是为 World / Building / Road 常驻三棵 VisualTree。

正式切换：

```text
GameplayUiState.tool
        ↓
Utility Context Resolver
        ↓
Utility Definition
        ↓
ContextUtilityToolbar
```

动画只使用 Opacity + TranslateY：

- Exit：约 100ms，向下 6px 淡出；
- Hidden：直接 Rebind Items 与 Width；
- Enter：约 140ms，从下方 6px 淡入；
- 不动画 Width / Height，不做横向飞入；
- Exit / Enter 阶段 Pointer Input 关闭。

Unity UI Toolkit 建议单实例 `UtilityToolbarHost` + `ContextUtilityToolbar`，C# 重绑 Definition，并通过 USS Class 驱动 `opacity / translate` Transition。

## 10. 验收门槛

Bottom Command 修改至少检查：

- 白天 Main Dock + World Utility Context；
- 白天 Building Placement + Building Utility Context；
- 白天 Road Placement + Road Utility Context；
- 夜晚 Main Dock + World Utility Context；
- 夜晚 Building Placement；
- 夜晚 Road Placement；
- 三档 Surface Hue 是否保持中性；
- Density 是否保持 M > L > S；
- Active / Toggle On 是否只使用少量熟铜；
- Quick Action 是否不残留 Selected；
- Placement Confirm 是否是唯一明显 Primary；
- Building / Road Context 中世界级地图 / 区域 / 地形 / 配色入口必须退出；
- Tool Context 中 Grid / History 必须继续存在；
- 左侧 Context + 中下 M + 右下 S 是否组成一套 Tool UI。
