import {
  Blocks,
  Bridge,
  Building2,
  Castle,
  Copy,
  DoorOpen,
  Fence,
  Grid3X3,
  Magnet,
  Mountain,
  Move,
  Palette,
  Redo2,
  Route,
  ScanLine,
  Trees,
  Undo2,
  Waves,
} from 'lucide-react';

const categories = [
  { name: '全部', icon: Blocks },
  { name: '道路', icon: Route },
  { name: '桥梁', icon: Bridge },
  { name: '运河', icon: Waves },
  { name: '城墙', icon: Castle },
  { name: '围墙', icon: Fence },
  { name: '建筑', icon: Building2 },
  { name: '装饰', icon: Trees },
] as const;

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
  [
    { id: 'unlock', label: '地图解锁', icon: DoorOpen },
    { id: 'region', label: '编辑区域', icon: ScanLine },
    { id: 'terrain', label: '地形编辑', icon: Mountain },
    { id: 'palette', label: '配色工具', icon: Palette },
  ],
  [
    { id: 'grid-snap', label: '网格吸附', icon: Magnet },
    { id: 'grid-visible', label: '网格显示', icon: Grid3X3 },
    { id: 'copy', label: '范围复制', icon: Copy },
    { id: 'move', label: '范围移动', icon: Move },
  ],
  [
    { id: 'undo', label: '撤销 · Ctrl+Z', icon: Undo2 },
    { id: 'redo', label: '重做 · Ctrl+Y', icon: Redo2 },
  ],
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
    <div className="world-utility-toolbar" aria-label="世界工具">
      {worldUtilityGroups.map((group, groupIndex) => (
        <span className="world-utility-toolbar__group" key={group[0].id}>
          {groupIndex > 0 && <i className="world-utility-toolbar__separator" />}
          {group.map(({ id, label, icon: Icon }) => {
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
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CommandBar({ activeCategory, onCategoryChange }: CommandBarProps) {
  return (
    <div className="command-bar">
      <div className="mode-rail">
        <button className="is-active">设计</button>
        <button>蓝图</button>
      </div>
      <i />
      <div className="category-row">
        {categories.map(({ name, icon: Icon }) => (
          <button key={name} className={activeCategory === name ? 'is-active' : ''} onClick={() => onCategoryChange(name)}>
            <Icon size={17} />
            <span>{name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
