# 2026-09-18 Left Context 单一材质 Owner

Camera / Environment / Road Placement / Building Placement 的左下窗口正式收束为一个 Surface 路径：

```text
LeftContextPanel
  → gameplay-left-context-surface
  → wanhu-surface-system.css
```

- `LeftContextPanel` 自动附加唯一 Surface Hook；
- `legacyGameplayClass` 删除；
- Placement 不再通过 `:not(.gameplay-context-panel)` 获取第二份材质；
- `gameplay-context-panel.css` 只负责结构、几何、Section 和紧凑控件布局；
- Root / Header / Body / Footer 材质只由 `wanhu-surface-system.css` 提供；
- 历史 `wanhu-mist-glass-production.css` 退出 Runtime；
- Camera / Environment 的业务 modifier 继续保留，但不拥有另一套 Shell Recipe。

Visual Review 会打开 Camera / Environment / Building / Road，并比较实际 computed material fingerprint，四者必须解析到同一 Surface Recipe。
