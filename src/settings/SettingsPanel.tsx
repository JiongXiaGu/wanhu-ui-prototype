import { useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import {
  Check,
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
import { NumericControl, SelectControl, ToggleSwitch } from '../ui/Controls';

export type SettingsContext = 'menu' | 'pause';

interface SettingsPanelProps {
  context: SettingsContext;
  onClose: () => void;
  onApply: () => void;
}

type Category = '显示' | '图形' | '音频' | '操作' | '游戏';
type SettingKind = 'select' | 'slider' | 'toggle';
type SettingValue = string | number | boolean;
type SliderFormat = 'percent' | 'decimal2' | 'integer';

type SettingRow = {
  id: string;
  title: string;
  detail: string;
  kind: SettingKind;
  defaultValue: SettingValue;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  format?: SliderFormat;
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
type SafeConfirmation = {
  previousValues: Record<string, SettingValue>;
  changedId: string;
  changedTitle: string;
  previousValue: SettingValue;
  nextValue: SettingValue;
} | null;

const SAFE_CONFIRM_SECONDS = 15;
const SAFE_DISPLAY_SETTING_IDS = new Set(['display-mode', 'monitor', 'resolution', 'refresh-rate', 'hdr-output', 'ui-scale']);

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
        { id: 'display-mode', title: '显示模式', detail: '选择独占全屏、无边框全屏或窗口模式。', kind: 'select', defaultValue: '无边框全屏', options: ['独占全屏', '无边框全屏', '窗口'] },
        { id: 'monitor', title: '显示器', detail: '选择游戏输出到的显示设备。', kind: 'select', defaultValue: '显示器 1', options: ['显示器 1', '显示器 2'] },
        { id: 'resolution', title: '分辨率', detail: '设置游戏最终输出分辨率。', kind: 'select', defaultValue: '3840 × 2160', options: ['1920 × 1080', '2560 × 1440', '3440 × 1440', '3840 × 2160'] },
        { id: 'refresh-rate', title: '屏幕刷新率', detail: '选择当前显示器使用的刷新率。', kind: 'select', defaultValue: '165 Hz', options: ['60 Hz', '120 Hz', '144 Hz', '165 Hz', '240 Hz'] },
        { id: 'hdr-output', title: 'HDR 输出', detail: '需要系统与显示设备同时支持 HDR。', kind: 'toggle', defaultValue: true },
        { id: 'v-sync', title: '垂直同步', detail: '将游戏帧输出与显示器刷新率同步。', kind: 'toggle', defaultValue: true },
        { id: 'frame-limit', title: '帧率限制', detail: '限制游戏最大输出帧率。', kind: 'select', defaultValue: '120 FPS', options: ['30 FPS', '60 FPS', '90 FPS', '120 FPS', '144 FPS', '165 FPS', '240 FPS', '无限'] },
      ],
    },
    {
      title: '界面',
      rows: [
        { id: 'ui-scale', title: '界面缩放', detail: '调整 HUD、Workspace 与所有菜单的整体尺寸。', kind: 'select', defaultValue: '100%', options: ['80%', '90%', '100%', '110%', '125%', '150%'] },
        { id: 'safe-area', title: '安全区域', detail: '调整界面与屏幕边缘之间的安全距离。', kind: 'slider', defaultValue: 100, min: 80, max: 100, step: 1, format: 'percent' },
      ],
    },
  ],
  图形: [
    {
      title: '图形质量',
      rows: [
        { id: 'quality-preset', title: '综合质量', detail: '统一调整常用画质选项；修改单项后会切换为自定义。', kind: 'select', defaultValue: '自定义', options: ['低', '中', '高', '极高', '自定义'] },
        { id: 'render-scale', title: '渲染比例', detail: '调整内部渲染分辨率比例。', kind: 'slider', defaultValue: 100, min: 50, max: 100, step: 1, format: 'percent' },
        { id: 'anti-aliasing', title: '抗锯齿', detail: '设置当前画面的边缘平滑方式。', kind: 'select', defaultValue: 'TAA', options: ['关闭', 'FXAA', 'SMAA', 'TAA'] },
        { id: 'super-resolution', title: '超分辨率', detail: '在支持的硬件上使用超分辨率技术提高性能。', kind: 'select', defaultValue: 'DLSS · 质量', options: ['关闭', 'DLSS · 质量', 'DLSS · 平衡', 'DLSS · 性能', 'FSR · 质量', 'XeSS · 质量'] },
        { id: 'frame-generation', title: '帧生成', detail: '在支持的硬件上启用帧生成。', kind: 'toggle', defaultValue: false },
        { id: 'low-latency', title: '低延迟模式', detail: '降低输入到画面呈现之间的延迟。', kind: 'toggle', defaultValue: true },
      ],
    },
    {
      title: '城市细节',
      rows: [
        { id: 'building-distance', title: '建筑细节距离', detail: '控制远处建筑切换细节层级的距离。', kind: 'slider', defaultValue: 82, min: 25, max: 100, step: 1, format: 'percent' },
        { id: 'resident-distance', title: '居民显示距离', detail: '控制远处居民与群体的显示距离。', kind: 'slider', defaultValue: 72, min: 25, max: 100, step: 1, format: 'percent' },
        { id: 'vegetation-quality', title: '植被质量', detail: '控制树木、灌木与农田植被细节。', kind: 'select', defaultValue: '高', options: ['低', '中', '高', '极高'] },
        { id: 'vegetation-distance', title: '植被显示距离', detail: '控制远处植被的显示范围。', kind: 'slider', defaultValue: 78, min: 25, max: 100, step: 1, format: 'percent' },
        { id: 'shadow-quality', title: '阴影质量', detail: '控制建筑、居民与植被动态阴影质量。', kind: 'select', defaultValue: '高', options: ['低', '中', '高', '极高'] },
        { id: 'shadow-distance', title: '阴影距离', detail: '控制动态阴影的最大绘制距离。', kind: 'slider', defaultValue: 68, min: 25, max: 100, step: 1, format: 'percent' },
        { id: 'terrain-quality', title: '地形质量', detail: '控制地形细分、贴图与远景精度。', kind: 'select', defaultValue: '高', options: ['低', '中', '高', '极高'] },
        { id: 'water-quality', title: '水体质量', detail: '控制河流、湖泊与水岸效果。', kind: 'select', defaultValue: '高', options: ['低', '中', '高', '极高'] },
      ],
    },
    {
      title: '光照与特效',
      rows: [
        { id: 'reflection-quality', title: '反射质量', detail: '控制屏幕空间与水面反射质量。', kind: 'select', defaultValue: '高', options: ['关闭', '低', '中', '高', '极高'] },
        { id: 'ambient-occlusion', title: '环境光遮蔽', detail: '增强建筑接触面与角落的空间层次。', kind: 'toggle', defaultValue: true },
        { id: 'volumetric-fog', title: '体积雾', detail: '控制城市远景和天气中的体积雾效果。', kind: 'toggle', defaultValue: true },
        { id: 'cloud-quality', title: '云层质量', detail: '控制天气系统中云层的渲染质量。', kind: 'select', defaultValue: '高', options: ['低', '中', '高', '极高'] },
        { id: 'dynamic-cloud-shadow', title: '动态云影', detail: '模拟云层在地表与建筑上的动态阴影。', kind: 'toggle', defaultValue: true },
        { id: 'bloom', title: 'Bloom', detail: '控制高亮区域的泛光效果。', kind: 'toggle', defaultValue: true },
        { id: 'depth-of-field', title: '景深', detail: '控制摄影视角下的景深效果。', kind: 'toggle', defaultValue: true },
        { id: 'motion-blur', title: '动态模糊', detail: '控制镜头快速移动时的动态模糊。', kind: 'toggle', defaultValue: false },
      ],
    },
  ],
  音频: [
    {
      title: '音量',
      rows: [
        { id: 'master-volume', title: '主音量', detail: '控制所有游戏声音的整体音量。', kind: 'slider', defaultValue: 80, min: 0, max: 100, step: 1, format: 'percent' },
        { id: 'music-volume', title: '音乐音量', detail: '控制背景音乐与事件音乐音量。', kind: 'slider', defaultValue: 72, min: 0, max: 100, step: 1, format: 'percent' },
        { id: 'effects-volume', title: '游戏音效', detail: '控制营造、居民与模拟反馈音效。', kind: 'slider', defaultValue: 76, min: 0, max: 100, step: 1, format: 'percent' },
        { id: 'ambient-volume', title: '环境声音', detail: '控制城市、居民与自然环境声音。', kind: 'slider', defaultValue: 68, min: 0, max: 100, step: 1, format: 'percent' },
        { id: 'ui-volume', title: '界面声音', detail: '控制按钮、提示与操作反馈音。', kind: 'slider', defaultValue: 65, min: 0, max: 100, step: 1, format: 'percent' },
      ],
    },
    {
      title: '播放行为',
      rows: [
        { id: 'mute-unfocused', title: '失去焦点时静音', detail: '游戏窗口失去焦点时暂停声音输出。', kind: 'toggle', defaultValue: true },
        { id: 'ui-sound', title: '界面提示音', detail: '启用菜单、按钮和工具操作反馈音。', kind: 'toggle', defaultValue: true },
        { id: 'city-ambience', title: '城市环境声', detail: '启用居民、市场、水岸和自然环境声场。', kind: 'toggle', defaultValue: true },
        { id: 'music-transition', title: '平滑切换场景音乐', detail: '在主菜单、城市与事件音乐之间使用平滑过渡。', kind: 'toggle', defaultValue: true },
      ],
    },
  ],
  操作: [
    {
      title: '鼠标与镜头',
      rows: [
        { id: 'pointer-sensitivity', title: '指针灵敏度', detail: '调整鼠标拖拽和指针相关操作的响应速度。', kind: 'slider', defaultValue: 1, min: 0.1, max: 3, step: 0.1, format: 'decimal2' },
        { id: 'scroll-sensitivity', title: '滚轮灵敏度', detail: '调整滚轮缩放与分页操作的响应速度。', kind: 'slider', defaultValue: 1, min: 0.1, max: 3, step: 0.1, format: 'decimal2' },
        { id: 'invert-horizontal', title: '水平反转', detail: '反转水平镜头输入方向。', kind: 'toggle', defaultValue: false },
        { id: 'invert-vertical', title: '垂直反转', detail: '反转垂直镜头输入方向。', kind: 'toggle', defaultValue: false },
        { id: 'invert-scroll', title: '滚轮反转', detail: '反转滚轮缩放方向。', kind: 'toggle', defaultValue: false },
        { id: 'keyboard-move-speed', title: '键盘移动速度', detail: '调整使用键盘平移世界相机的速度。', kind: 'slider', defaultValue: 1, min: 0.1, max: 3, step: 0.1, format: 'decimal2' },
        { id: 'keyboard-rotate-speed', title: '键盘旋转速度', detail: '调整使用键盘旋转世界相机的速度。', kind: 'slider', defaultValue: 1, min: 0.1, max: 3, step: 0.1, format: 'decimal2' },
        { id: 'edge-scroll', title: '屏幕边缘滚动', detail: '鼠标接近屏幕边缘时移动世界相机。', kind: 'toggle', defaultValue: true },
        { id: 'edge-scroll-speed', title: '边缘滚动速度', detail: '调整屏幕边缘滚动的相机移动速度。', kind: 'slider', defaultValue: 1, min: 0.1, max: 3, step: 0.1, format: 'decimal2' },
      ],
    },
  ],
  游戏: [
    {
      title: '存档',
      rows: [
        { id: 'autosave-interval', title: '自动保存间隔', detail: '定期写入当前游戏组的自动存档。', kind: 'select', defaultValue: '10 分钟', options: ['关闭', '5 分钟', '10 分钟', '20 分钟', '30 分钟'] },
        { id: 'autosave-count', title: '自动存档数量', detail: '每个游戏组最多保留的自动存档历史数量。', kind: 'select', defaultValue: '5', options: ['3', '5', '10'] },
      ],
    },
    {
      title: '游戏体验',
      rows: [
        { id: 'construction-tutorial', title: '显示营造教程', detail: '显示第一次使用营造系统时的教学内容。', kind: 'toggle', defaultValue: true },
        { id: 'operation-hints', title: '操作提示', detail: '显示当前工具的操作方式与快捷键。', kind: 'toggle', defaultValue: true },
        { id: 'danger-confirmation', title: '重要操作二次确认', detail: '拆除建筑或覆盖存档前进行二次确认。', kind: 'toggle', defaultValue: true },
        { id: 'resident-story-hints', title: '居民故事提示', detail: '调整居民出现可交互事件时的提示详细程度。', kind: 'select', defaultValue: '完整', options: ['关闭', '简洁', '完整'] },
        { id: 'auto-pause-events', title: '重要事件自动暂停', detail: '发生高优先级城市事件时自动暂停模拟。', kind: 'toggle', defaultValue: true },
      ],
    },
    {
      title: '语言与菜单',
      rows: [
        { id: 'language', title: '界面语言', detail: '选择游戏界面使用的语言。', kind: 'select', defaultValue: '简体中文', options: ['简体中文', '繁體中文', 'English'] },
        { id: 'menu-camera-motion', title: '主菜单镜头运动', detail: '启用主菜单背景城市的缓慢镜头运动。', kind: 'toggle', defaultValue: true },
      ],
    },
  ],
};

const bindingGroups: BindingGroup[] = [
  {
    id: 'basic', title: '基础操作', bindings: [
      { id: 'camera-move', label: '移动镜头', detail: '移动城市观察视角。', primary: 'W / A / S / D', secondary: '↑ / ↓ / ← / →' },
      { id: 'confirm', label: '确认操作', detail: '放置建筑或确认当前工具。', primary: '鼠标左键', secondary: 'Enter' },
      { id: 'cancel', label: '取消操作', detail: '关闭当前工具或返回上一层。', primary: 'Esc', secondary: '鼠标右键' },
      { id: 'pause', label: '暂停游戏', detail: '暂停或恢复当前城市模拟。', primary: 'Space', secondary: 'P' },
    ],
  },
  {
    id: 'construction', title: '营造与道路', bindings: [
      { id: 'rotate', label: '旋转构件', detail: '旋转当前正在放置或调整的构件。', primary: 'R' },
      { id: 'rotate-reverse', label: '反向旋转', detail: '向相反方向旋转当前构件。', primary: 'Shift + R' },
      { id: 'undo', label: '撤销', detail: '撤销最近一次营造操作。', primary: 'Ctrl + Z' },
      { id: 'redo', label: '重做', detail: '重做最近一次被撤销的营造操作。', primary: 'Ctrl + Y' },
      { id: 'snap-toggle', label: '切换吸附', detail: '切换当前工具的吸附状态。', primary: 'G' },
    ],
  },
  {
    id: 'time', title: '时间控制', bindings: [
      { id: 'speed-1', label: '正常速度', detail: '切换到正常模拟速度。', primary: '1' },
      { id: 'speed-2', label: '二倍速度', detail: '切换到二倍模拟速度。', primary: '2' },
      { id: 'speed-4', label: '四倍速度', detail: '切换到四倍模拟速度。', primary: '3' },
      { id: 'pause-time', label: '暂停 / 继续', detail: '暂停或继续城市模拟。', primary: 'Space' },
    ],
  },
  {
    id: 'camera', title: '镜头操作', bindings: [
      { id: 'camera-yaw-left', label: '向左旋转镜头', detail: '围绕当前观察中心向左旋转。', primary: 'Q' },
      { id: 'camera-yaw-right', label: '向右旋转镜头', detail: '围绕当前观察中心向右旋转。', primary: 'E' },
      { id: 'camera-reset', label: '恢复默认视角', detail: '恢复默认经营镜头。', primary: 'Home' },
      { id: 'camera-photo', label: '摄影模式', detail: '进入或退出摄影镜头模式。', primary: 'F8' },
    ],
  },
  {
    id: 'quickbar', title: '快捷栏', bindings: [
      { id: 'tool-road', label: '道路', detail: '快速进入道路营造。', primary: 'Alt + 1' },
      { id: 'tool-wall', label: '城墙', detail: '快速进入城墙营造。', primary: 'Alt + 2' },
      { id: 'tool-building', label: '建筑', detail: '快速打开建筑 Workspace。', primary: 'Alt + 3' },
      { id: 'tool-decoration', label: '装饰', detail: '快速打开装饰 Workspace。', primary: 'Alt + 4' },
    ],
  },
];

function createDefaultSettings(): Record<string, SettingValue> {
  return Object.fromEntries(Object.values(groups).flatMap((sections) => sections.flatMap((section) => section.rows.map((row) => [row.id, row.defaultValue] as const))));
}

function createDefaultBindings(): Record<string, BindingValue> {
  return Object.fromEntries(bindingGroups.flatMap((group) => group.bindings.map((binding) => [binding.id, { primary: binding.primary, secondary: binding.secondary ?? '' }] as const)));
}

function getBindingItem(id: string) {
  return bindingGroups.flatMap((group) => group.bindings).find((binding) => binding.id === id);
}

function isSettingDisabled(id: string, values: Record<string, SettingValue>) {
  if (id === 'frame-generation') return !String(values['super-resolution']).startsWith('DLSS');
  if (id === 'edge-scroll-speed') return values['edge-scroll'] !== true;
  return false;
}

function categorySettingIds(category: Category) {
  return groups[category].flatMap((group) => group.rows.map((row) => row.id));
}

function displaySettingValue(value: SettingValue) {
  if (typeof value === 'boolean') return value ? '开启' : '关闭';
  return String(value);
}

export function SettingsPanel({ context, onClose, onApply }: SettingsPanelProps) {
  void onApply;
  const defaults = useMemo(createDefaultSettings, []);
  const defaultBindings = useMemo(createDefaultBindings, []);
  const [active, setActive] = useState<Category>('显示');
  const [values, setValues] = useState<Record<string, SettingValue>>(defaults);
  const [bindings, setBindings] = useState<Record<string, BindingValue>>(defaultBindings);
  const [openBindingGroups, setOpenBindingGroups] = useState<string[]>(['basic']);
  const [listening, setListening] = useState<ListeningBinding>(null);
  const [bindingConflict, setBindingConflict] = useState<BindingConflict>(null);
  const [safeConfirmation, setSafeConfirmation] = useState<SafeConfirmation>(null);
  const [safeSeconds, setSafeSeconds] = useState(SAFE_CONFIRM_SECONDS);

  function rollbackSafeSettings() {
    if (!safeConfirmation) return;
    setValues(safeConfirmation.previousValues);
    setSafeConfirmation(null);
    setSafeSeconds(SAFE_CONFIRM_SECONDS);
  }

  function keepSafeSettings() {
    setSafeConfirmation(null);
    setSafeSeconds(SAFE_CONFIRM_SECONDS);
  }

  useEffect(() => {
    if (!safeConfirmation) return;
    setSafeSeconds(SAFE_CONFIRM_SECONDS);
    const timer = window.setInterval(() => setSafeSeconds((current) => current - 1), 1000);
    return () => window.clearInterval(timer);
  }, [safeConfirmation]);

  useEffect(() => {
    if (safeConfirmation && safeSeconds <= 0) rollbackSafeSettings();
  }, [safeSeconds, safeConfirmation]);

  useEffect(() => {
    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (safeConfirmation) {
        event.preventDefault();
        rollbackSafeSettings();
        return;
      }
      if (listening) return;
      onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [safeConfirmation, listening, onClose]);

  function setSetting(row: SettingRow, value: SettingValue) {
    const previousValue = values[row.id];
    if (Object.is(previousValue, value)) return;

    if (SAFE_DISPLAY_SETTING_IDS.has(row.id)) {
      const previousValues = { ...values };
      setValues((current) => ({ ...current, [row.id]: value }));
      setSafeConfirmation({
        previousValues,
        changedId: row.id,
        changedTitle: row.title,
        previousValue,
        nextValue: value,
      });
      return;
    }

    setValues((current) => ({ ...current, [row.id]: value }));
  }

  function restoreCurrentCategory() {
    const ids = categorySettingIds(active);
    const previousValues = { ...values };
    const nextValues = { ...values };
    ids.forEach((id) => { nextValues[id] = defaults[id]; });

    if (active === '操作') {
      setBindings(defaultBindings);
      setBindingConflict(null);
      setListening(null);
    }

    const hasDangerousDisplayChange = active === '显示' && ids.some((id) => SAFE_DISPLAY_SETTING_IDS.has(id) && !Object.is(values[id], defaults[id]));
    setValues(nextValues);

    if (hasDangerousDisplayChange) {
      setSafeConfirmation({
        previousValues,
        changedId: 'display-defaults',
        changedTitle: '显示设置默认值',
        previousValue: '当前设置',
        nextValue: '默认设置',
      });
    }
  }

  function toggleBindingGroup(id: string) {
    setOpenBindingGroups((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function resetBinding(id: string) {
    const source = getBindingItem(id);
    if (!source) return;
    setBindings((current) => ({ ...current, [id]: { primary: source.primary, secondary: source.secondary ?? '' } }));
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

    const conflictOwner = bindingGroups.flatMap((group) => group.bindings).find((binding) => binding.id !== id && (bindings[binding.id]?.primary === nextBinding || bindings[binding.id]?.secondary === nextBinding));
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
        <div className="global-space-heading"><h1>游戏设置</h1></div>
      </header>

      <nav className="settings-space__tabs" aria-label="设置分类">
        {categories.map(({ key, icon: Icon, detail }) => (
          <button key={key} type="button" className={active === key ? 'is-active' : ''} title={detail} onClick={() => setActive(key)}>
            <Icon size={16} /><span>{key}</span>
          </button>
        ))}
      </nav>

      <main className="settings-space__content">
        <div className="settings-list" key={active}>
          {active === '操作' ? (
            <ControlsSettingsView
              rows={groups.操作[0].rows}
              values={values}
              bindings={bindings}
              openGroups={openBindingGroups}
              listening={listening}
              conflict={bindingConflict}
              onChange={(row, value) => setSetting(row, value)}
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
                  {group.rows.map((row) => (
                    <SettingsRowView
                      key={row.id}
                      row={row}
                      value={values[row.id]}
                      disabled={isSettingDisabled(row.id, values)}
                      onChange={(value) => setSetting(row, value)}
                    />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </main>

      <footer className="global-space-footer settings-space__footer settings-space__footer--autosave" aria-label="页面操作">
        <div className="settings-space__footer-left">
          <button type="button" className="global-space-secondary settings-footer-back" onClick={onClose}><ChevronLeft size={14} />返回</button>
          <button type="button" className="settings-restore" onClick={restoreCurrentCategory}><RotateCcw size={14} />恢复当前分类默认值</button>
        </div>
        <div className="settings-space__footer-right" aria-hidden="true" />
      </footer>

      {safeConfirmation && (
        <SafeDisplayConfirmation
          confirmation={safeConfirmation}
          seconds={safeSeconds}
          onRollback={rollbackSafeSettings}
          onKeep={keepSafeSettings}
        />
      )}
    </section>
  );
}

function SafeDisplayConfirmation({ confirmation, seconds, onRollback, onKeep }: {
  confirmation: NonNullable<SafeConfirmation>;
  seconds: number;
  onRollback: () => void;
  onKeep: () => void;
}) {
  return (
    <div className="settings-safe-layer" role="dialog" aria-modal="true" aria-label="保留显示设置">
      <div className="settings-safe-layer__shade" />
      <section className="settings-safe-dialog">
        <header>
          <h2>保留这些显示设置？</h2>
          <p>如果画面或界面显示异常，设置将在倒计时结束后自动恢复。</p>
        </header>
        <div className="settings-safe-dialog__change">
          <span>{confirmation.changedTitle}</span>
          <b>{displaySettingValue(confirmation.previousValue)} <i>→</i> {displaySettingValue(confirmation.nextValue)}</b>
        </div>
        <div className="settings-safe-dialog__countdown" aria-live="polite">{Math.max(0, seconds)}</div>
        <footer>
          <button type="button" className="settings-safe-dialog__rollback" onClick={onRollback}>恢复原设置</button>
          <button type="button" className="settings-safe-dialog__keep" onClick={onKeep}><Check size={14} />保留设置</button>
        </footer>
        <small><kbd>Esc</kbd> 恢复原设置</small>
      </section>
    </div>
  );
}

function ControlsSettingsView({
  rows,
  values,
  bindings,
  openGroups,
  listening,
  conflict,
  onChange,
  onToggleGroup,
  onStartListening,
  onBindingKeyDown,
  onResetBinding,
}: {
  rows: SettingRow[];
  values: Record<string, SettingValue>;
  bindings: Record<string, BindingValue>;
  openGroups: string[];
  listening: ListeningBinding;
  conflict: BindingConflict;
  onChange: (row: SettingRow, value: SettingValue) => void;
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
          {rows.map((row) => <SettingsRowView key={row.id} row={row} value={values[row.id]} disabled={isSettingDisabled(row.id, values)} onChange={(value) => onChange(row, value)} />)}
        </div>
      </section>

      <section className="settings-section settings-binding-section">
        <header className="settings-section__title"><b>按键绑定</b><i /></header>
        <div className="settings-binding-table-header" aria-hidden="true"><span>操作</span><span>主要按键</span><span>次要按键</span><i /></div>
        <div className="settings-binding-groups">
          {bindingGroups.map((group) => {
            const open = openGroups.includes(group.id);
            return (
              <section className={`settings-binding-group ${open ? 'is-open' : ''}`} key={group.id}>
                <button type="button" className="settings-binding-group__header" onClick={() => onToggleGroup(group.id)} aria-expanded={open}>
                  <ChevronRight size={14} /><b>{group.title}</b><span>{group.bindings.length} 项</span>
                </button>
                {open && (
                  <div className="settings-binding-group__rows">
                    {group.bindings.map((binding) => (
                      <BindingRow key={binding.id} binding={binding} value={bindings[binding.id]} listening={listening} conflict={conflict} onStartListening={onStartListening} onKeyDown={onBindingKeyDown} onReset={onResetBinding} />
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

function SettingsRowView({ row, value, disabled, onChange }: { row: SettingRow; value: SettingValue; disabled?: boolean; onChange: (value: SettingValue) => void }) {
  return (
    <div className={`settings-row settings-row--${row.kind} ${disabled ? 'is-disabled' : ''}`} title={row.detail} data-setting-id={row.id}>
      <span className="settings-row__label"><b>{row.title}</b></span>
      <div className={`settings-row__control settings-row__control--${row.kind}`}>
        {row.kind === 'slider' && (
          <NumericControl
            ariaLabel={row.title}
            value={Number(value)}
            min={row.min ?? 0}
            max={row.max ?? 100}
            step={row.step ?? 1}
            format={(next) => formatSliderValue(row, next)}
            disabled={disabled}
            className="settings-numeric-control"
            onChange={onChange}
          />
        )}
        {row.kind === 'select' && (
          <SelectControl
            ariaLabel={row.title}
            value={String(value)}
            options={row.options ?? []}
            disabled={disabled}
            className="settings-select-control"
            onChange={onChange}
          />
        )}
        {row.kind === 'toggle' && (
          <ToggleSwitch
            label={row.title}
            value={Boolean(value)}
            disabled={disabled}
            className="settings-toggle-control"
            onChange={onChange}
          />
        )}
      </div>
    </div>
  );
}

function formatSliderValue(row: SettingRow, value: number) {
  if (row.format === 'decimal2') return value.toFixed(2);
  if (row.format === 'percent') return `${Math.round(value)}%`;
  return `${Math.round(value)}`;
}

function BindingRow({ binding, value, listening, conflict, onStartListening, onKeyDown, onReset }: {
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
      <button type="button" className={`settings-binding-cell ${slot === 'primary' ? 'settings-binding-cell--primary' : 'settings-binding-cell--secondary'} ${isListening ? 'is-listening' : ''} ${isConflict ? 'is-conflict' : ''} ${!text ? 'is-empty' : ''}`} aria-label={`${binding.label}${slot === 'primary' ? '主要按键' : '次要按键'}：${text || '未设置'}`} onClick={() => onStartListening(binding.id, slot)} onKeyDown={(event) => onKeyDown(event, binding.id, slot)}>
        {isListening ? <span>按下新的按键…</span> : text ? <kbd>{text}</kbd> : <span className="settings-binding-cell__empty"><Plus size={12} />添加</span>}
      </button>
    );
  };
  const rowConflict = conflict?.id === binding.id ? `与“${conflict.owner}”冲突` : '';
  return (
    <div className={`settings-binding-row ${rowConflict ? 'has-conflict' : ''}`} title={binding.detail}>
      <span className="settings-binding-row__label"><b>{binding.label}</b>{rowConflict && <small>{rowConflict}</small>}</span>
      {renderBindingButton('primary')}{renderBindingButton('secondary')}
      <button type="button" className="settings-binding-row__reset" aria-label={`恢复${binding.label}默认按键`} onClick={() => onReset(binding.id)}><RotateCcw size={13} /></button>
    </div>
  );
}

function formatBindingKey(event: KeyboardEvent<HTMLButtonElement>) {
  const modifierOnly = ['Control', 'Shift', 'Alt', 'Meta'];
  if (modifierOnly.includes(event.key)) return '';
  const aliases: Record<string, string> = { ' ': 'Space', ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→' };
  const base = aliases[event.key] ?? (event.key.length === 1 ? event.key.toUpperCase() : event.key);
  const parts: string[] = [];
  if (event.ctrlKey) parts.push('Ctrl');
  if (event.shiftKey) parts.push('Shift');
  if (event.altKey) parts.push('Alt');
  if (event.metaKey) parts.push('Meta');
  parts.push(base);
  return parts.join(' + ');
}
