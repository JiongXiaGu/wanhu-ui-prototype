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
  note: string;
  value: string;
  kind: SettingKind;
  pct?: number;
  keys?: string[];
};

const categories: { key: Category; icon: typeof Monitor; note: string }[] = [
  { key: '显示', icon: Monitor, note: '输出与界面' },
  { key: '图形', icon: SlidersHorizontal, note: '画质与性能' },
  { key: '音频', icon: Speaker, note: '音量与输出' },
  { key: '操作', icon: Gamepad2, note: '镜头与快捷键' },
  { key: '游戏', icon: Settings2, note: '存档与提示' },
];

const rows: Record<Category, SettingRow[]> = {
  显示: [
    { title: '显示模式', note: '当前窗口输出方式', value: '无边框全屏', kind: 'select' },
    { title: '分辨率', note: '渲染输出尺寸', value: '3840 × 2160', kind: 'select' },
    { title: '界面缩放', note: 'HUD 与面板整体缩放', value: '100%', kind: 'slider', pct: 50 },
    { title: 'HDR 输出', note: '需要系统和显示器同时支持', value: '开启', kind: 'toggle' },
    { title: '垂直同步', note: '与显示器刷新率同步', value: '开启', kind: 'toggle' },
  ],
  图形: [
    { title: '图形质量', note: '阴影、反射和环境细节的总体预设', value: '自定义', kind: 'select' },
    { title: '阴影质量', note: '建筑、居民与植被动态阴影', value: '高', kind: 'select' },
    { title: '抗锯齿', note: '当前画面边缘平滑方式', value: 'TAA', kind: 'select' },
    { title: '动态分辨率', note: '负载较高时自动降低内部渲染分辨率', value: '关闭', kind: 'toggle' },
    { title: '环境细节距离', note: '远处建筑和植被的显示精度', value: '78%', kind: 'slider', pct: 78 },
  ],
  音频: [
    { title: '主音量', note: '所有声音的整体音量', value: '80%', kind: 'slider', pct: 80 },
    { title: '环境音量', note: '城市场景与自然环境', value: '75%', kind: 'slider', pct: 75 },
    { title: '音乐音量', note: '背景音乐与事件音乐', value: '70%', kind: 'slider', pct: 70 },
    { title: '界面音量', note: '按钮、提示与反馈音', value: '65%', kind: 'slider', pct: 65 },
    { title: '后台失焦静音', note: '切换到其他窗口时暂停游戏声音', value: '关闭', kind: 'toggle' },
  ],
  操作: [
    { title: '镜头平移', note: '移动城市视角', value: 'W / A / S / D', kind: 'binding', keys: ['W', 'A', 'S', 'D'] },
    { title: '镜头旋转', note: '顺时针 / 逆时针旋转', value: 'Q / E', kind: 'binding', keys: ['Q', 'E'] },
    { title: '确认操作', note: '放置建筑或确认当前工具', value: '鼠标左键', kind: 'binding', keys: ['左键'] },
    { title: '取消操作', note: '关闭当前工具或返回上一层', value: 'Esc', kind: 'binding', keys: ['Esc'] },
    { title: '镜头灵敏度', note: '拖拽、旋转与缩放响应速度', value: '1.00', kind: 'slider', pct: 50 },
  ],
  游戏: [
    { title: '自动保存间隔', note: '定期写入当前游戏组的自动存档', value: '10 分钟', kind: 'select' },
    { title: '自动存档数量', note: '每个游戏组保留的自动存档历史', value: '5', kind: 'select' },
    { title: '操作提示', note: '显示当前工具的 GameplayOperationHints', value: '开启', kind: 'toggle' },
    { title: '确认危险操作', note: '拆除和覆盖存档前进行二次确认', value: '开启', kind: 'toggle' },
    { title: '居民故事提示', note: '居民发生可交互事件时显示提示', value: '完整', kind: 'select' },
  ],
};

export function SettingsPanel({ context, onClose, onApply }: SettingsPanelProps) {
  const [active, setActive] = useState<Category>('显示');
  const activeCategory = categories.find((item) => item.key === active)!;

  return (
    <section className={`settings-space settings-panel--${context}`} aria-label="游戏设置">
      <header className="global-space-header settings-space__header">
        <button type="button" className="global-space-back" onClick={onClose}><ChevronLeft size={16} />返回</button>
        <div className="global-space-heading">
          <small>{context === 'pause' ? 'PAUSE SETTINGS' : 'OPTIONS'}</small>
          <div><h1>游戏设置</h1><span>{context === 'pause' ? '修改后返回暂停菜单' : '系统与游戏偏好'}</span></div>
        </div>
        <div className="global-space-meta">即时预览</div>
      </header>

      <nav className="settings-space__tabs" aria-label="设置分类">
        {categories.map(({ key, icon: Icon, note }) => (
          <button key={key} type="button" className={active === key ? 'is-active' : ''} onClick={() => setActive(key)}>
            <Icon size={15} />
            <span><b>{key}</b><small>{note}</small></span>
          </button>
        ))}
      </nav>

      <div className="settings-space__content">
        <main className="settings-space__settings">
          <header className="settings-section-heading">
            <div><b>{active}</b><span>{activeCategory.note}</span></div>
            <small>{rows[active].length} 项设置</small>
          </header>
          <div className="settings-space__rows">
            {rows[active].map((row) => <SettingsRowView key={row.title} row={row} />)}
          </div>
        </main>

        <aside className="settings-space__preview">
          <SettingsPreview category={active} />
        </aside>
      </div>

      <footer className="global-space-footer settings-space__footer">
        <button type="button" className="settings-restore"><RotateCcw size={13} />恢复当前分类默认值</button>
        <div>
          <button type="button" className="global-space-secondary" onClick={onClose}>取消</button>
          <button type="button" className="global-space-primary" onClick={onApply}><Check size={14} />应用设置</button>
        </div>
      </footer>
    </section>
  );
}

function SettingsRowView({ row }: { row: SettingRow }) {
  return (
    <div className="settings-row-v2">
      <span className="settings-row-v2__copy"><b>{row.title}</b><small>{row.note}</small></span>
      <div className={`settings-row-v2__control settings-row-v2__control--${row.kind}`}>
        {row.kind === 'slider' && <><div className="settings-slider"><i style={{ width: `${row.pct ?? 50}%` }} /><em style={{ left: `${row.pct ?? 50}%` }} /></div><output>{row.value}</output></>}
        {row.kind === 'select' && <button type="button">{row.value}<span>⌄</span></button>}
        {row.kind === 'toggle' && <button type="button" className={`settings-toggle ${row.value === '开启' ? 'is-on' : ''}`}><i /><span>{row.value}</span></button>}
        {row.kind === 'binding' && <div className="settings-binding">{row.keys?.map((key) => <kbd key={key}>{key}</kbd>)}</div>}
      </div>
    </div>
  );
}

function SettingsPreview({ category }: { category: Category }) {
  if (category === '显示') return <PreviewFrame title="DISPLAY OUTPUT" lead="3840 × 2160" sub="144 Hz · HDR"><div className="display-preview"><div className="display-preview__frame"><i /></div><span>UI SCALE 100%</span></div></PreviewFrame>;
  if (category === '图形') return <PreviewFrame title="GRAPHICS LOAD" lead="自定义" sub="实时估算"><Meter label="GPU 预计负载" value="76%" pct={76} /><Meter label="VRAM" value="8.7 / 12 GB" pct={72} /><PreviewDatum label="抗锯齿" value="TAA" /><PreviewDatum label="阴影" value="高" /></PreviewFrame>;
  if (category === '音频') return <PreviewFrame title="AUDIO MIX" lead="主音量 80%" sub="当前输出"><Meter label="环境" value="75%" pct={75} /><Meter label="音乐" value="70%" pct={70} /><Meter label="界面" value="65%" pct={65} /></PreviewFrame>;
  if (category === '操作') return <PreviewFrame title="INPUT MAP" lead="键盘 + 鼠标" sub="默认方案"><div className="input-preview"><span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd><small>平移</small></span><span><kbd>Q</kbd><kbd>E</kbd><small>旋转</small></span><span><kbd>Esc</kbd><small>取消</small></span></div></PreviewFrame>;
  return <PreviewFrame title="GAMEPLAY" lead="自动保存" sub="每 10 分钟"><PreviewDatum label="自动存档" value="5 个" /><PreviewDatum label="操作提示" value="开启" /><PreviewDatum label="危险操作确认" value="开启" /><PreviewDatum label="居民故事" value="完整" /></PreviewFrame>;
}

function PreviewFrame({ title, lead, sub, children }: { title: string; lead: string; sub: string; children: React.ReactNode }) {
  return <div className="settings-preview-card"><small>{title}</small><h2>{lead}</h2><span>{sub}</span><div className="settings-preview-card__body">{children}</div></div>;
}

function Meter({ label, value, pct }: { label: string; value: string; pct: number }) {
  return <div className="settings-meter"><div><span>{label}</span><b>{value}</b></div><i><em style={{ width: `${pct}%` }} /></i></div>;
}

function PreviewDatum({ label, value }: { label: string; value: string }) {
  return <div className="settings-preview-datum"><span>{label}</span><b>{value}</b></div>;
}
