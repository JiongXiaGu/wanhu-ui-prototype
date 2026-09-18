import type { LucideIcon } from 'lucide-react';
import {
  Blocks,
  BookOpen,
  Bridge,
  Building2,
  Castle,
  Copy,
  DoorOpen,
  Fence,
  Grid3X3,
  Hammer,
  House,
  Landmark,
  Layers3,
  Magnet,
  Mountain,
  Move,
  Palette,
  Redo2,
  Route,
  ScanLine,
  Shield,
  Store,
  Trees,
  Undo2,
} from 'lucide-react';
import type { DockCategory, DockMode } from '../app/ui-state';

interface MainDockItem {
  id: DockCategory;
  label: string;
  icon: LucideIcon;
}

const MAIN_DOCK_ITEMS: Record<DockMode, readonly MainDockItem[]> = {
  design: [
    { id: 'road', label: '道路', icon: Route },
    { id: 'bridge', label: '桥梁', icon: Bridge },
    { id: 'building', label: '建筑', icon: Building2 },
    { id: 'platform', label: '台基', icon: Layers3 },
    { id: 'city-wall', label: '城墙', icon: Castle },
    { id: 'wall', label: '围墙', icon: Fence },
    { id: 'decoration', label: '装饰', icon: Palette },
    { id: 'tree', label: '树木', icon: Trees },
  ],
  blueprint: [
    { id: 'all', label: '全部', icon: Blocks },
    { id: 'residential', label: '民居', icon: House },
    { id: 'commercial', label: '商业', icon: Store },
    { id: 'workshop', label: '工坊', icon: Hammer },
    { id: 'administration', label: '管理', icon: Building2 },
    { id: 'science', label: '科学', icon: BookOpen },
    { id: 'faith', label: '信仰', icon: Landmark },
    { id: 'military', label: '军事', icon: Shield },
    { id: 'palace', label: '宫殿', icon: Castle },
  ],
};

type WorldUtilityId =
  | 'unlock'
  | 'region'
  | 'terrain'
  | 'palette'
  | 'grid-snap'
  | 'grid-visible'
  | 'copy'
  | 'move'
  | 'undo'
  | 'redo';

type WorldUtilityState = {
  active?: boolean;
  pressed?: boolean;
  disabled?: boolean;
  onClick?: () => void;
};

const worldUtilityGroups = [
  {
    id: 'world-edit',
    label: '世界编辑',
    items: [
      { id: 'unlock', label: '地图解锁', icon: DoorOpen },
      { id: 'region', label: '编辑区域', icon: ScanLine },
      { id: 'terrain', label: '地形编辑', icon: Mountain },
      { id: 'palette', label: '配色工具', icon: Palette },
    ],
  },
  {
    id: 'precision',
    label: '精确辅助',
    items: [
      { id: 'grid-snap', label: '网格吸附', icon: Magnet },
      { id: 'grid-visible', label: '网格显示', icon: Grid3X3 },
    ],
  },
  {
    id: 'range-edit',
    label: '范围操作',
    items: [
      { id: 'copy', label: '范围复制', icon: Copy },
      { id: 'move', label: '范围移动', icon: Move },
    ],
  },
  {
    id: 'history',
    label: '历史',
    items: [
      { id: 'undo', label: '撤销 · Ctrl+Z', icon: Undo2 },
      { id: 'redo', label: '重做 · Ctrl+Y', icon: Redo2 },
    ],
  },
] as const;

interface WorldUtilityToolbarProps {
  gridSnap: boolean;
  gridVisible: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onToggleGridSnap: () => void;
  onToggleGridVisible: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

export function WorldUtilityToolbar({
  gridSnap,
  gridVisible,
  canUndo,
  canRedo,
  onToggleGridSnap,
  onToggleGridVisible,
  onUndo,
  onRedo,
}: WorldUtilityToolbarProps) {
  function getState(id: WorldUtilityId): WorldUtilityState {
    switch (id) {
      case 'grid-snap':
        return { active: gridSnap, onClick: onToggleGridSnap, pressed: gridSnap };
      case 'grid-visible':
        return { active: gridVisible, onClick: onToggleGridVisible, pressed: gridVisible };
      case 'undo':
        return { disabled: !canUndo, onClick: onUndo };
      case 'redo':
        return { disabled: !canRedo, onClick: onRedo };
      default:
        return {};
    }
  }

  return (
    <div className="world-utility-toolbar command-utility bottom-command-surface bottom-command-surface--sm" aria-label="世界工具">
      {worldUtilityGroups.map((group, groupIndex) => (
        <span
          className="world-utility-toolbar__group"
          key={group.id}
          role="group"
          aria-label={group.label}
          data-utility-group={group.id}
        >
          {groupIndex > 0 && <i className="world-utility-toolbar__separator" aria-hidden="true" />}
          {group.items.map(({ id, label, icon: Icon }) => {
            const state = getState(id);
            return (
              <button
                key={id}
                type="button"
                className={`world-utility-toolbar__button ${state.active ? 'is-active' : ''}`}
                data-tooltip={label}
                aria-label={label}
                aria-pressed={state.pressed}
                disabled={state.disabled}
                onClick={state.onClick}
              >
                <Icon />
              </button>
            );
          })}
        </span>
      ))}
    </div>
  );
}

interface CommandBarProps {
  mode: DockMode;
  activeCategory: DockCategory | null;
  onModeChange: (mode: DockMode) => void;
  onCategoryChange: (category: DockCategory) => void;
}

export function CommandBar({ mode, activeCategory, onModeChange, onCategoryChange }: CommandBarProps) {
  const items = MAIN_DOCK_ITEMS[mode];

  return (
    <div className="command-bar bottom-command-surface bottom-command-surface--lg" data-dock-mode={mode}>
      <div className="mode-rail" aria-label="建造模式">
        <button
          type="button"
          className={mode === 'design' ? 'is-active' : ''}
          aria-pressed={mode === 'design'}
          onClick={() => onModeChange('design')}
        >
          设计
        </button>
        <button
          type="button"
          className={mode === 'blueprint' ? 'is-active' : ''}
          aria-pressed={mode === 'blueprint'}
          onClick={() => onModeChange('blueprint')}
        >
          蓝图
        </button>
      </div>
      <i aria-hidden="true" />
      <div className="category-row" aria-label={mode === 'design' ? '设计分类' : '蓝图分类'}>
        {items.map(({ id, label, icon: Icon }) => {
          const selected = activeCategory === id;
          return (
            <button
              key={id}
              type="button"
              className={selected ? 'is-active' : ''}
              aria-pressed={selected}
              onClick={() => onCategoryChange(id)}
            >
              <Icon />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
