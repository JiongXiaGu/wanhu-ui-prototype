import { useState } from 'react';
import { Check, ChevronLeft, Gamepad2, Monitor, RotateCcw, Settings2, SlidersHorizontal, Speaker } from 'lucide-react';

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

const categories: { key: Category; icon: typeof Monitor; detail: string }[] = [
  { key: '显示', icon: Monitor, detail: '显示输出、分辨率与界面缩放' },
  { key: '图形', icon: SlidersHorizontal, detail: '画面质量与性能相关选项' },
  { key: '音频', icon: Speaker, detail: '各类声音与输出音量' },
  { key: '操作', icon: Gamepad2, detail: '镜头控制与快捷键绑定' },
  { key: '游戏', icon: Settings2, detail: '自动保存、提示与游戏行为' },
];

const rows: Record<Category, SettingRow[]> = {
  显示: [
    { title: '显示模式', detail: '选择游戏窗口的输出方式。', value: '无边框全屏', kind: 'select' },
    { title: '分辨率', detail: '设置游戏最终输出分辨率。', value: '3840 × 2160', kind: 'select' },
    { title: '界面缩放', detail: '调整 HUD 与所有面板的整体尺寸。', value: '100%', kind: 'slider', pct: 50 },
    { title: 'HDR 输出', detail: '需要系统与显示设备同时支持 HDR。', value: '开启', kind: 'toggle' },
    { title: '垂直同步', detail: '将游戏帧输出与显示器刷新率同步。', value: '开启', kind: 'toggle' },
  ],
  图形: [
    { title: '图形质量', detail: '控制阴影、反射和环境细节的总体预设。', value: '自定义', kind: 'select' },
    { title: '阴影质量', detail: '控制建筑、居民与植被的动态阴影质量。', value: '高', kind: 'select' },
    { title: '抗锯齿', detail: '设置当前画面的边缘平滑方式。', value: 'TAA', kind: 'select' },
    { title: '动态分辨率', detail: '高负载时自动降低内部渲染分辨率以稳定性能。', value: '关闭', kind: 'toggle' },
    { title: '环境细节距离', detail: '调整远处建筑与植被的显示精度。', value: '78%', kind: 'slider', pct: 78 },
  ],
  音频: [
    { title: '主音量', detail: '控制所有游戏声音的整体音量。', value: '80%', kind: 'slider', pct: 80 },
    { title: '环境音量', detail: '控制城市、居民与自然环境声音。', value: '75%', kind: 'slider', pct: 75 },
    { title: '音乐音量', detail: '控制背景音乐与事件音乐音量。', value: '70%', kind: 'slider', pct: 70 },
    { title: '界面音量', detail: '控制按钮、提示与操作反馈音。', value: '65%', kind: 'slider', pct: 65 },
    { title: '后台失焦静音', detail: '游戏窗口失去焦点时暂停声音输出。', value: '关闭', kind: 'toggle' },
  ],
  操作: [
    { title: '镜头平移', detail: '移动城市观察视角。', value: 'W / A / S / D', kind: 'binding', keys: ['W', 'A', 'S', 'D'] },
    { title: '镜头旋转', detail: '顺时针或逆时针旋转镜头。', value: 'Q / E', kind: 'binding', keys: ['Q', 'E'] },
    { title: '确认操作', detail: '放置建筑或确认当前工具。', value: '鼠标左键', kind: 'binding', keys: ['左键'] },
    { title: '取消操作', detail: '关闭当前工具或返回上一层。', value: 'Esc', kind: 'binding', keys: ['Esc'] },
    { title: '镜头灵敏度', detail: '调整拖拽、旋转与缩放的响应速度。', value: '1.00', kind: 'slider', pct: 50 },
  ],
  游戏: [
    { title: '自动保存间隔', detail: '定期写入当前游戏组的自动存档。', value: '10 分钟', kind: 'select' },
    { title: '自动存档数量', detail: '每个游戏组最多保留的自动存档历史数量。', value: '5', kind: 'select' },
    { title: '操作提示', detail: '显示当前工具的操作方式与快捷键。', value: '开启', kind: 'toggle' },
    { title: '确认危险操作', detail: '拆除建筑或覆盖存档前进行二次确认。', value: '开启', kind: 'toggle' },
    { title: '居民故事提示', detail: '居民出现可交互事件时的提示详细程度。', value: '完整', kind: 'select' },
  ],
};

export function SettingsPanel({ context, onClose, onApply }: SettingsPanelProps) {
  const [active, setActive] = useState<Category>('显示');

  return (
    <section className={`settings-space settings-panel--${context}`} aria-label="游戏设置">
      <header className="global-space-header settings-space__header">
        <button type="button" className="global-space-back" onClick={onClose}><ChevronLeft size={16} />返回</button>
        <div className="global-space-heading"><h1>游戏设置</h1></div>
      </header>

      <nav className="settings-space__tabs" aria-label="设置分类">
        {categories.map(({ key, icon: Icon, detail }) => (
          <button key={key} type="button" className={active === key ? 'is-active' : ''} title={detail} onClick={() => setActive(key)}>
            <Icon size={15} />
            <span>{key}</span>
          </button>
        ))}
      </nav>

      <main className="settings-space__content">
        <div className="settings-space__rows">
          {rows[active].map((row) => <SettingsRowView key={row.title} row={row} />)}
        </div>
      </main>

      <footer className="global-space-footer settings-space__footer">
        <button type="button" className="settings-restore"><RotateCcw size={13} />恢复默认</button>
        <div>
          <button type="button" className="global-space-secondary" onClick={onClose}>取消</button>
          <button type="button" className="global-space-primary" onClick={onApply}><Check size={14} />应用</button>
        </div>
      </footer>
    </section>
  );
}

function SettingsRowView({ row }: { row: SettingRow }) {
  return (
    <div className="settings-row-v2" title={row.detail}>
      <span className="settings-row-v2__copy"><b>{row.title}</b></span>
      <div className={`settings-row-v2__control settings-row-v2__control--${row.kind}`}>
        {row.kind === 'slider' && <><div className="settings-slider"><i style={{ width: `${row.pct ?? 50}%` }} /><em style={{ left: `${row.pct ?? 50}%` }} /></div><output>{row.value}</output></>}
        {row.kind === 'select' && <button type="button">{row.value}<span>⌄</span></button>}
        {row.kind === 'toggle' && <button type="button" className={`settings-toggle ${row.value === '开启' ? 'is-on' : ''}`}><i /><span>{row.value}</span></button>}
        {row.kind === 'binding' && <div className="settings-binding">{row.keys?.map((key) => <kbd key={key}>{key}</kbd>)}</div>}
      </div>
    </div>
  );
}
