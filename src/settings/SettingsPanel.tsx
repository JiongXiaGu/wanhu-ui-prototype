import { useState } from 'react';
import { Check, ChevronDown, ChevronLeft, Gamepad2, Monitor, RotateCcw, Settings2, SlidersHorizontal, Speaker } from 'lucide-react';

export type SettingsContext = 'menu' | 'pause';

interface SettingsPanelProps {
  context: SettingsContext;
  onClose: () => void;
  onApply: () => void;
}

type Category = '显示' | '图形' | '音频' | '操作' | '游戏';
type SettingKind = 'select' | 'slider' | 'toggle' | 'binding';

type SettingRow = {
  title: string;
  detail: string;
  value: string;
  kind: SettingKind;
  pct?: number;
  keys?: string[];
};

type SettingGroup = {
  title: string;
  rows: SettingRow[];
};

const categories: { key: Category; icon: typeof Monitor; detail: string }[] = [
  { key: '显示', icon: Monitor, detail: '显示输出、分辨率与界面缩放' },
  { key: '图形', icon: SlidersHorizontal, detail: '渲染质量、城市细节与性能' },
  { key: '音频', icon: Speaker, detail: '音量、声场与后台播放行为' },
  { key: '操作', icon: Gamepad2, detail: '镜头手感、鼠标与快捷键' },
  { key: '游戏', icon: Settings2, detail: '存档、提示、语言与游戏行为' },
];

const groups: Record<Category, SettingGroup[]> = {
  显示: [
    {
      title: '显示输出',
      rows: [
        { title: '显示模式', detail: '选择独占全屏、无边框全屏或窗口模式。', value: '无边框全屏', kind: 'select' },
        { title: '显示器', detail: '选择游戏输出到的显示设备。', value: '显示器 1', kind: 'select' },
        { title: '分辨率', detail: '设置游戏最终输出分辨率。', value: '3840 × 2160', kind: 'select' },
        { title: '屏幕刷新率', detail: '选择当前显示器使用的刷新率。', value: '165 Hz', kind: 'select' },
        { title: 'HDR 输出', detail: '需要系统与显示设备同时支持 HDR。', value: '开启', kind: 'toggle' },
        { title: '垂直同步', detail: '将游戏帧输出与显示器刷新率同步。', value: '开启', kind: 'toggle' },
        { title: '帧率限制', detail: '限制游戏最大输出帧率。', value: '120 FPS', kind: 'select' },
      ],
    },
    {
      title: '界面',
      rows: [
        { title: '界面缩放', detail: '调整 HUD、Workspace 与所有菜单的整体尺寸。', value: '100%', kind: 'slider', pct: 50 },
        { title: '安全区域', detail: '调整界面与屏幕边缘之间的安全距离。', value: '100%', kind: 'slider', pct: 82 },
      ],
    },
  ],
  图形: [
    {
      title: '图形质量',
      rows: [
        { title: '综合质量', detail: '统一调整常用画质选项；修改单项后会切换为自定义。', value: '自定义', kind: 'select' },
        { title: '渲染比例', detail: '调整内部渲染分辨率比例。', value: '100%', kind: 'slider', pct: 72 },
        { title: '抗锯齿', detail: '设置当前画面的边缘平滑方式。', value: 'TAA', kind: 'select' },
        { title: '超分辨率', detail: '在支持的硬件上使用超分辨率技术提高性能。', value: 'DLSS · 质量', kind: 'select' },
        { title: '帧生成', detail: '在支持的硬件上启用帧生成。', value: '关闭', kind: 'toggle' },
        { title: '低延迟模式', detail: '降低输入到画面呈现之间的延迟。', value: '开启', kind: 'toggle' },
      ],
    },
    {
      title: '城市细节',
      rows: [
        { title: '建筑细节距离', detail: '控制远处建筑切换细节层级的距离。', value: '82%', kind: 'slider', pct: 82 },
        { title: '居民显示距离', detail: '控制远处居民与群体的显示距离。', value: '72%', kind: 'slider', pct: 72 },
        { title: '植被质量', detail: '控制树木、灌木与农田植被细节。', value: '高', kind: 'select' },
        { title: '植被显示距离', detail: '控制远处植被的显示范围。', value: '78%', kind: 'slider', pct: 78 },
        { title: '阴影质量', detail: '控制建筑、居民与植被动态阴影质量。', value: '高', kind: 'select' },
        { title: '阴影距离', detail: '控制动态阴影的最大绘制距离。', value: '68%', kind: 'slider', pct: 68 },
        { title: '地形质量', detail: '控制地形细分、贴图与远景精度。', value: '高', kind: 'select' },
        { title: '水体质量', detail: '控制河流、湖泊与水岸效果。', value: '高', kind: 'select' },
      ],
    },
    {
      title: '光照与特效',
      rows: [
        { title: '反射质量', detail: '控制屏幕空间与水面反射质量。', value: '高', kind: 'select' },
        { title: '环境光遮蔽', detail: '增强建筑接触面与角落的空间层次。', value: '开启', kind: 'toggle' },
        { title: '体积雾', detail: '控制城市远景和天气中的体积雾效果。', value: '开启', kind: 'toggle' },
        { title: '云层质量', detail: '控制天气系统中云层的渲染质量。', value: '高', kind: 'select' },
        { title: '动态云影', detail: '模拟云层在地表与建筑上的动态阴影。', value: '开启', kind: 'toggle' },
        { title: 'Bloom', detail: '控制高亮区域的泛光效果。', value: '开启', kind: 'toggle' },
        { title: '景深', detail: '控制摄影视角下的景深效果。', value: '开启', kind: 'toggle' },
        { title: '动态模糊', detail: '控制镜头快速移动时的动态模糊。', value: '关闭', kind: 'toggle' },
      ],
    },
  ],
  音频: [
    {
      title: '音量',
      rows: [
        { title: '主音量', detail: '控制所有游戏声音的整体音量。', value: '80%', kind: 'slider', pct: 80 },
        { title: '音乐音量', detail: '控制背景音乐与事件音乐音量。', value: '72%', kind: 'slider', pct: 72 },
        { title: '游戏音效', detail: '控制营造、居民与模拟反馈音效。', value: '76%', kind: 'slider', pct: 76 },
        { title: '环境声音', detail: '控制城市、居民与自然环境声音。', value: '68%', kind: 'slider', pct: 68 },
        { title: '界面声音', detail: '控制按钮、提示与操作反馈音。', value: '65%', kind: 'slider', pct: 65 },
      ],
    },
    {
      title: '播放行为',
      rows: [
        { title: '失去焦点时静音', detail: '游戏窗口失去焦点时暂停声音输出。', value: '开启', kind: 'toggle' },
        { title: '界面提示音', detail: '启用菜单、按钮和工具操作反馈音。', value: '开启', kind: 'toggle' },
        { title: '城市环境声', detail: '启用居民、市场、水岸和自然环境声场。', value: '开启', kind: 'toggle' },
        { title: '平滑切换场景音乐', detail: '在主菜单、城市与事件音乐之间使用平滑过渡。', value: '开启', kind: 'toggle' },
      ],
    },
  ],
  操作: [
    {
      title: '鼠标与镜头',
      rows: [
        { title: '指针灵敏度', detail: '调整鼠标拖拽和指针相关操作的响应速度。', value: '1.00', kind: 'slider', pct: 50 },
        { title: '滚轮灵敏度', detail: '调整滚轮缩放与分页操作的响应速度。', value: '1.00', kind: 'slider', pct: 50 },
        { title: '水平反转', detail: '反转水平镜头输入方向。', value: '关闭', kind: 'toggle' },
        { title: '垂直反转', detail: '反转垂直镜头输入方向。', value: '关闭', kind: 'toggle' },
        { title: '滚轮反转', detail: '反转滚轮缩放方向。', value: '关闭', kind: 'toggle' },
        { title: '键盘移动速度', detail: '调整使用键盘平移世界相机的速度。', value: '1.00', kind: 'slider', pct: 50 },
        { title: '键盘旋转速度', detail: '调整使用键盘旋转世界相机的速度。', value: '1.00', kind: 'slider', pct: 50 },
        { title: '屏幕边缘滚动', detail: '鼠标接近屏幕边缘时移动世界相机。', value: '开启', kind: 'toggle' },
        { title: '边缘滚动速度', detail: '调整屏幕边缘滚动的相机移动速度。', value: '1.00', kind: 'slider', pct: 50 },
      ],
    },
    {
      title: '基础操作',
      rows: [
        { title: '镜头平移', detail: '移动城市观察视角。', value: 'W / A / S / D', kind: 'binding', keys: ['W', 'A', 'S', 'D'] },
        { title: '镜头旋转', detail: '顺时针或逆时针旋转镜头。', value: 'Q / E', kind: 'binding', keys: ['Q', 'E'] },
        { title: '确认操作', detail: '放置建筑或确认当前工具。', value: '鼠标左键', kind: 'binding', keys: ['左键'] },
        { title: '取消操作', detail: '关闭当前工具或返回上一层。', value: 'Esc', kind: 'binding', keys: ['Esc'] },
        { title: '暂停游戏', detail: '暂停或恢复当前城市模拟。', value: 'Space', kind: 'binding', keys: ['Space'] },
      ],
    },
    {
      title: '营造与时间',
      rows: [
        { title: '旋转构件', detail: '旋转当前正在放置或调整的构件。', value: 'R', kind: 'binding', keys: ['R'] },
        { title: '撤销', detail: '撤销最近一次营造操作。', value: 'Ctrl / Z', kind: 'binding', keys: ['Ctrl', 'Z'] },
        { title: '重做', detail: '重做最近一次被撤销的营造操作。', value: 'Ctrl / Y', kind: 'binding', keys: ['Ctrl', 'Y'] },
        { title: '降低游戏速度', detail: '降低当前模拟速度。', value: '1', kind: 'binding', keys: ['1'] },
        { title: '提高游戏速度', detail: '提高当前模拟速度。', value: '3', kind: 'binding', keys: ['3'] },
      ],
    },
  ],
  游戏: [
    {
      title: '存档',
      rows: [
        { title: '自动保存间隔', detail: '定期写入当前游戏组的自动存档。', value: '10 分钟', kind: 'select' },
        { title: '自动存档数量', detail: '每个游戏组最多保留的自动存档历史数量。', value: '5', kind: 'select' },
      ],
    },
    {
      title: '游戏体验',
      rows: [
        { title: '显示营造教程', detail: '显示第一次使用营造系统时的教学内容。', value: '开启', kind: 'toggle' },
        { title: '操作提示', detail: '显示当前工具的操作方式与快捷键。', value: '开启', kind: 'toggle' },
        { title: '重要操作二次确认', detail: '拆除建筑或覆盖存档前进行二次确认。', value: '开启', kind: 'toggle' },
        { title: '居民故事提示', detail: '调整居民出现可交互事件时的提示详细程度。', value: '完整', kind: 'select' },
        { title: '重要事件自动暂停', detail: '发生高优先级城市事件时自动暂停模拟。', value: '开启', kind: 'toggle' },
      ],
    },
    {
      title: '语言与菜单',
      rows: [
        { title: '界面语言', detail: '选择游戏界面使用的语言。', value: '简体中文', kind: 'select' },
        { title: '主菜单镜头运动', detail: '启用主菜单背景城市的缓慢镜头运动。', value: '开启', kind: 'toggle' },
      ],
    },
  ],
};

export function SettingsPanel({ context, onClose, onApply }: SettingsPanelProps) {
  const [active, setActive] = useState<Category>('显示');

  return (
    <section className={`settings-space settings-panel--${context}`} data-active={active} aria-label="游戏设置">
      <header className="global-space-header settings-space__header">
        <button type="button" className="global-space-back" onClick={onClose}><ChevronLeft size={16} />返回</button>
        <div className="global-space-heading"><h1>游戏设置</h1></div>
      </header>

      <nav className="settings-space__tabs" aria-label="设置分类">
        {categories.map(({ key, icon: Icon, detail }) => (
          <button key={key} type="button" className={active === key ? 'is-active' : ''} title={detail} onClick={() => setActive(key)}>
            <Icon size={16} />
            <span>{key}</span>
          </button>
        ))}
      </nav>

      <main className="settings-space__content">
        <div className="settings-list" key={active}>
          {groups[active].map((group) => (
            <section className="settings-section" key={group.title}>
              <header className="settings-section__title"><b>{group.title}</b><i /></header>
              <div className="settings-section__rows">
                {group.rows.map((row) => <SettingsRowView key={row.title} row={row} />)}
              </div>
            </section>
          ))}
        </div>
      </main>

      <footer className="global-space-footer settings-space__footer">
        <button type="button" className="settings-restore"><RotateCcw size={14} />恢复当前分类默认值</button>
        <div>
          <button type="button" className="global-space-secondary" onClick={onClose}>取消</button>
          <button type="button" className="global-space-primary" onClick={onApply}><Check size={14} />应用</button>
        </div>
      </footer>
    </section>
  );
}

function SettingsRowView({ row }: { row: SettingRow }) {
  const isOn = row.value === '开启';

  return (
    <div className={`settings-row settings-row--${row.kind}`} title={row.detail}>
      <span className="settings-row__label"><b>{row.title}</b></span>
      <div className={`settings-row__control settings-row__control--${row.kind}`}>
        {row.kind === 'slider' && (
          <>
            <div className="settings-slider"><i style={{ width: `${row.pct ?? 50}%` }} /><em style={{ left: `${row.pct ?? 50}%` }} /></div>
            <output>{row.value}</output>
          </>
        )}
        {row.kind === 'select' && (
          <button type="button" className="settings-select-value">
            <span>{row.value}</span><ChevronDown size={14} />
          </button>
        )}
        {row.kind === 'toggle' && (
          <button type="button" className={`settings-toggle ${isOn ? 'is-on' : ''}`} aria-label={`${row.title}：${row.value}`}>
            <i />
          </button>
        )}
        {row.kind === 'binding' && <div className="settings-binding">{row.keys?.map((key) => <kbd key={key}>{key}</kbd>)}</div>}
      </div>
    </div>
  );
}
