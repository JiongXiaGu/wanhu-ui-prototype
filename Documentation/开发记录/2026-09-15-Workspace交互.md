# 2026-09-15 Workspace 交互调整

## 背景

Building Workspace 在多轮视觉调整后已经形成：

`Primary Rail + Context Filter + Content Grid`

但继续审图时发现两个问题：

1. `全部建筑` 被做成了一个特殊入口，视觉和其它一级筛选项不同；
2. 一级筛选变化会影响顶部 Context Filter，使两个筛选维度耦合；
3. 分组分页虽然解决了大量建筑的无限滚动问题，但鼠标滚轮交互没有利用起来。

## 本轮调整

### 1. `全部建筑` 回归普通一级筛选

`全部建筑` 与：

- 塔；
- 殿；
- 楼阁；
- 屋舍；
- 门；
- 廊榭；
- 亭；
- 牌坊；
- 特殊；

使用同一种 Primary Rail Item。

不再使用：

- 独立大按钮；
- 固定特殊区域；
- 额外分隔线；
- 特殊 Selected 视觉。

建筑当前每组显示 5 个一级筛选项。

### 2. Primary Rail 与 Context Filter 改为正交筛选

建筑顶部 Context Filter 固定为：

`全部 / 庑殿 / 歇山 / 悬山 / 硬山 / 攒尖 / 卷棚 / 其他`

逻辑：

- Primary Rail 决定“哪一类建筑”；
- Context Filter 决定“哪一种屋顶 / 形制条件”；
- 两者共同过滤 Content Grid；
- 切换 Primary Rail 不再重置顶部 Context Filter；
- 选择 `全部建筑` 只取消一级类别限制，不改变顶部筛选状态。

Visual Review 已增加 `03c-workspace-filter-persistence.png` 验证：先选择顶部 `歇山`，再切换 `塔`，再回到 `全部建筑`，顶部仍保持 `歇山`。

### 3. 增加鼠标滚轮分页

分页视觉继续保留：

- Primary Rail：左侧竖向刻度；
- Content Grid：底部弱圆点 + 当前暖金短横。

滚轮只是额外输入方式，不取代分页 UI。

交互：

- 鼠标位于 Primary Rail：滚轮上下切换类别组；
- 鼠标位于 Content Grid：滚轮上下切换建筑内容组；
- Context Filter / 搜索区域不触发组分页。

为避免高精度滚轮 / 触控板一次滑动连续翻多组：

- 使用滚动距离累计阈值；
- 当前 Prototype 阈值为 72；
- 每次有效翻组后锁定约 220 ms；
- 一次有效滚动只允许翻一组；
- 首尾边界不循环。

### 4. 滚轮翻组不等于自动筛选

Primary Rail 的组分页只改变“当前看到哪些一级筛选项”。

它不会：

- 自动选择新组第一个分类；
- 修改当前 Primary Rail 实际筛选；
- 修改顶部 Context Filter。

这样“浏览分类组”和“实际选择筛选条件”职责分离。

## 自动验证

Visual Review 从原有状态增加：

- `03a-workspace-content-wheel.png`：主内容滚轮一次翻一组；
- `03b-workspace-category-wheel.png`：左侧滚轮一次翻一组分类；
- `03c-workspace-filter-persistence.png`：Primary Rail 改变后顶部筛选保持不变。

最新代码 Build 成功；上述 Visual Review 全部通过。

## 当前结论

Workspace 的大量内容浏览不采用“纯滚动列表”和“传统数字页码”二选一。

当前方案是：

**固定容量分组 + 明确分页视觉 + 滚轮快捷翻组 + 搜索精准定位。**

这比取消分页 UI 更合理：分页视觉提供当前位置和可点击入口，滚轮只负责提高鼠标操作效率。
