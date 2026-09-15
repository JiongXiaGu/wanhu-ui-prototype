import { useState, type KeyboardEvent } from 'react';
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  Monitor,
  Plus,
  RotateCcw,
  Settings2,
  SlidersHorizontal,
  Speaker,
} from 'lucide-react';

export type SettingsContext = 'menu' | 'pause';

interface SettingsPanelProps {
  context: SettingsContext;
  onClose: () => void;
  onApply: () => void;
}

type Category = '显示' | '图形' | '音频' | '操作' | '游戏';
type SettingKind = 'select' | 'slider' | 'toggle';

type SettingRow = {
  title: string;
  detail: string;
  value: string;
  kind: SettingKind;
  pct?: number;
};

type SettingGroup = {
  title: string;
  rows: SettingRow[];
};

type BindingSlot = 'primary' | 'secondary';
type BindingValue = { primary: string; secondary: string };
type BindingItem = {
  id: string;
  label: string;
  detail: string;
  primary: string;
  secondary?: string;
};
type BindingGroup = {
  id: string;
  title: string;
  bindings: BindingItem[];
};

type ListeningBinding = { id: string; slot: BindingSlot } | null;
type BindingConflict = { id: string; slot: BindingSlot; owner: string } | null;

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

const bindingGroups: BindingGroup[] = [
  {
    id: 'basic',
    title: '基础操作',
    bindings: [
      { id: 'camera-move', label: '移动镜头', detail: '移动城市观察视角。', primary: 'W / A / S / D', secondary: '↑ / ↓ / ← / →' },
      { id: 'confirm', label: '确认操作', detail: '放置建筑或确认当前工具。', primary: '鼠标左键', secondary: 'Enter' },
      { id: 'cancel', label: '取消操作', detail: '关闭当前工具或返回上一层。', primary: 'Esc', secondary: '鼠标右键' },
      { id: 'pause', label: '暂停游戏', detail: '暂停或恢复当前城市模拟。', primary: 'Space', secondary: 'P' },
    ],
  },
  {
    id: 'construction',
    title: '营造与道路',
    bindings: [
      { id: 'rotate', label: '旋转构件', detail: '旋转当前正在放置或调整的构件。', primary: 'R' },
      { id: 'rotate-reverse', label: '反向旋转', detail: '向相反方向旋转当前构件。', primary: 'Shift + R' },
      { id: 'undo', label: '撤销', detail: '撤销最近一次营造操作。', primary: 'Ctrl + Z' },
      { id: 'redo', label: '重做', detail: '重做最近一次被撤销的营造操作。', primary: 'Ctrl + Y' },
      { id: 'snap-toggle', label: '切换吸附', detail: '切换当前工具的吸附状态。', primary: 'G' },
    ],
  },
  {
    id: 'time',
    title: '时间控制',
    bindings: [
      { id: 'speed-1', label: '正常速度', detail: '切换到正常模拟速度。', primary: '1' },
      { id: 'speed-2', label: '二倍速度', detail: '切换到二倍模拟速度。', primary: '2' },
      { id: 'speed-4', label: '四倍速度', detail: '切换到四倍模拟速度。', primary: '3' },
      { id: 'pause-time', label: '暂停 / 继续', detail: '暂停或继续城市模拟。', primary: 'Space' },
    ],
  },
  {
    id: 'camera',
    title: '镜头操作',
    bindings: [
      { id: 'camera-yaw-left', label: '向左旋转镜头', detail: '围绕当前观察中心向左旋转。', primary: 'Q' },
      { id: 'camera-yaw-right', label: '向右旋转镜头', detail: '围绕当前观察中心向右旋转。', primary: 'E' },
      { id: 'camera-reset', label: '恢复默认视角', detail: '恢复默认经营镜头。', primary: 'Home' },
      { id: 'camera-photo', label: '摄影模式', detail: '进入或退出摄影镜头模式。', primary: 'F8' },
    ],
  },
  {
    id: 'quickbar',
    title: '快捷栏',
    bindings: [
      { id: 'tool-road', label: '道路', detail: '快速进入道路营造。', primary: 'Alt + 1' },
      { id: 'tool-wall', label: '城墙', detail: '快速进入城墙营造。', primary: 'Alt + 2' },
      { id: 'tool-building', label: '建筑', detail: '快速打开建筑 Workspace。', primary: 'Alt + 3' },
      { id: 'tool-decoration', label: '装饰', detail: '快速打开装饰 Workspace。', primary: 'Alt + 4' },
    ],
  },
];

function createDefaultBindings(): Record<string, BindingValue> {
  const entries = bindingGroups.flatMap((group) => group.bindings.map((binding) => [
    binding.id,
    { primary: binding.primary, secondary: binding.secondary ?? '' },
  ] as const));
  return Object.fromEntries(entries);
}

function getBindingItem(id: string) {
  return bindingGroups.flatMap((group) => group.bindings).find((binding) => binding.id === id);
}

export function SettingsPanel({ context, onClose, onApply }: SettingsPanelProps) {
  const [active, setActive] = useState<Category>('显示');
  const [bindings, setBindings] = useState<Record<string, BindingValue>>(createDefaultBindings);
  const [openBindingGroups, setOpenBindingGroups] = useState<string[]>(['basic']);
  const [listening, setListening] = useState<ListeningBinding>(null);
  const [bindingConflict, setBindingConflict] = useState<BindingConflict>(null);

  function toggleBindingGroup(id: string) {
    setOpenBindingGroups((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function resetBinding(id: string) {
    const source = getBindingItem(id);
    if (!source) return;
    setBindings((current) => ({
      ...current,
      [id]: { primary: source.primary, secondary: source.secondary ?? '' },
    }));
    setBindingConflict(null);
    setListening(null);
  }

  function startListening(id: string, slot: BindingSlot) {
    setListening({ id, slot });
    setBindingConflict(null);
  }

  function handleBindingKeyDown(event: KeyboardEvent<HTMLButtonElement>, id: string, slot: BindingSlot) {
    if (!listening || listening.id !== id || listening.slot !== slot) return;
    event.preventDefault();
    event.stopPropagation();

    if (event.key === 'Escape') {
      setListening(null);
      setBindingConflict(null);
      return;
    }

    if (event.key === 'Backspace' || event.key === 'Delete') {
      setBindings((current) => ({ ...current, [id]: { ...current[id], [slot]: '' } }));
      setListening(null);
      setBindingConflict(null);
      return;
    }

    const nextBinding = formatBindingKey(event);
    if (!nextBinding) return;

    const conflictOwner = bindingGroups
      .flatMap((group) => group.bindings)
      .find((binding) => binding.id !== id && (bindings[binding.id]?.primary === nextBinding || bindings[binding.id]?.secondary === nextBinding));

    if (conflictOwner) {
      setBindingConflict({ id, slot, owner: conflictOwner.label });
      return;
    }

    setBindings((current) => ({ ...current, [id]: { ...current[id], [slot]: nextBinding } }));
    setListening(null);
    setBindingConflict(null);
  }

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
          {active === '操作' ? (
            <ControlsSettingsView
              rows={groups.操作[0].rows}
              bindings={bindings}
              openGroups={openBindingGroups}
              listening={listening}
              conflict={bindingConflict}
              onToggleGroup={toggleBindingGroup}
              onStartListening={startListening}
              onBindingKeyDown={handleBindingKeyDown}
              onResetBinding={resetBinding}
            />
          ) : (
            groups[active].map((group) => (
              <section className="settings-section" key={group.title}>
                <header className="settings-section__title"><b>{group.title}</b><i /></header>
                <div className="settings-section__rows">
                  {group.rows.map((row) => <SettingsRowView key={row.title} row={row} />)}
                </div>
              </section>
            ))
          )}
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

function ControlsSettingsView({
  rows,
  bindings,
  openGroups,
  listening,
  conflict,
  onToggleGroup,
  onStartListening,
  onBindingKeyDown,
  onResetBinding,
}: {
  rows: SettingRow[];
  bindings: Record<string, BindingValue>;
  openGroups: string[];
  listening: ListeningBinding;
  conflict: BindingConflict;
  onToggleGroup: (id: string) => void;
  onStartListening: (id: string, slot: BindingSlot) => void;
  onBindingKeyDown: (event: KeyboardEvent<HTMLButtonElement>, id: string, slot: BindingSlot) => void;
  onResetBinding: (id: string) => void;
}) {
  return (
    <>
      <section className="settings-section">
        <header className="settings-section__title"><b>鼠标与镜头</b><i /></header>
        <div className="settings-section__rows">
          {rows.map((row) => <SettingsRowView key={row.title} row={row} />)}
        </div>
      </section>

      <section className="settings-section settings-binding-section">
        <header className="settings-section__title"><b>按键绑定</b><i /></header>
        <div className="settings-binding-table-header" aria-hidden="true">
          <span>操作</span>
          <span>主要按键</span>
          <span>次要按键</span>
          <i />
        </div>

        <div className="settings-binding-groups">
          {bindingGroups.map((group) => {
            const open = openGroups.includes(group.id);
            return (
              <section className={`settings-binding-group ${open ? 'is-open' : ''}`} key={group.id}>
                <button type="button" className="settings-binding-group__header" onClick={() => onToggleGroup(group.id)} aria-expanded={open}>
                  <ChevronRight size={14} />
                  <b>{group.title}</b>
                  <span>{group.bindings.length} 项</span>
                </button>

                {open && (
                  <div className="settings-binding-group__rows">
                    {group.bindings.map((binding) => (
                      <BindingRow
                        key={binding.id}
                        binding={binding}
                        value={bindings[binding.id]}
                        listening={listening}
                        conflict={conflict}
                        onStartListening={onStartListening}
                        onKeyDown={onBindingKeyDown}
                        onReset={onResetBinding}
                      />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </section>
    </>
  );
}

function BindingRow({
  binding,
  value,
  listening,
  conflict,
  onStartListening,
  onKeyDown,
  onReset,
}: {
  binding: BindingItem;
  value: BindingValue;
  listening: ListeningBinding;
  conflict: BindingConflict;
  onStartListening: (id: string, slot: BindingSlot) => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>, id: string, slot: BindingSlot) => void;
  onReset: (id: string) => void;
}) {
  const renderBindingButton = (slot: BindingSlot) => {
    const isListening = listening?.id === binding.id && listening.slot === slot;
    const isConflict = conflict?.id === binding.id && conflict.slot === slot;
    const text = value?.[slot] ?? '';

    return (
      <button
        type="button"
        className={`settings-binding-cell ${slot === 'primary' ? 'settings-binding-cell--primary' : 'settings-binding-cell--secondary'} ${isListening ? 'is-listening' : ''} ${isConflict ? 'is-conflict' : ''} ${!text ? 'is-empty' : ''}`}
        aria-label={`${binding.label}${slot === 'primary' ? '主要按键' : '次要按键'}：${text || '未设置'}`}
        onClick={() => onStartListening(binding.id, slot)}
        onKeyDown={(event) => onKeyDown(event, binding.id, slot)}
      >
        {isListening ? (
          <span>按下新的按键…</span>
        ) : text ? (
          <kbd>{text}</kbd>
        ) : (
          <span className="settings-binding-cell__empty"><Plus size={12} />添加</span>
        )}
      </button>
    );
  };

  const rowConflict = conflict?.id === binding.id ? `与“${conflict.owner}”冲突` : '';

  return (
    <div className={`settings-binding-row ${rowConflict ? 'has-conflict' : ''}`} title={binding.detail}>
      <span className="settings-binding-row__label"><b>{binding.label}</b>{rowConflict && <small>{rowConflict}</small>}</span>
      {renderBindingButton('primary')}
      {renderBindingButton('secondary')}
      <button type="button" className="settings-binding-row__reset" aria-label={`恢复${binding.label}默认按键`} onClick={() => onReset(binding.id)}>
        <RotateCcw size={13} />
      </button>
    </div>
  );
}

function formatBindingKey(event: KeyboardEvent<HTMLButtonElement>) {
  const modifierOnly = ['Control', 'Shift', 'Alt', 'Meta'];
  if (modifierOnly.includes(event.key)) return '';

  const aliases: Record<string, string> = {
    ' ': 'Space',
    ArrowUp: '↑',
    ArrowDown: '↓',
    ArrowLeft: '←',
    ArrowRight: '→',
  };

  const base = aliases[event.key] ?? (event.key.length === 1 ? event.key.toUpperCase() : event.key);
  const parts: string[] = [];
  if (event.ctrlKey) parts.push('Ctrl');
  if (event.shiftKey) parts.push('Shift');
  if (event.altKey) parts.push('Alt');
  if (event.metaKey) parts.push('Meta');
  parts.push(base);
  return parts.join(' + ');
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
      </div>
    </div>
  );
}
