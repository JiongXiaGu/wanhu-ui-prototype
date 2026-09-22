import type { UiIconComponent } from '../ui/icons/runtime-icons.generated';
import {
  Blocks,
  BookOpen,
  Bridge,
  Building2,
  Castle,
  Fence,
  Hammer,
  House,
  Landmark,
  Layers3,
  Palette,
  Pencil,
  Route,
  ScrollText,
  Shield,
  Store,
  Trees,
} from '../ui/icons/runtime-icons.generated';
import type { DockCategory, DockMode } from '../app/ui-state';
import type { MotionPhase } from '../ui/motion';

interface MainDockItem {
  id: DockCategory;
  label: string;
  icon: UiIconComponent;
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

const MAIN_DOCK_MODES: ReadonlyArray<{ id: DockMode; label: string; icon: UiIconComponent }> = [
  { id: 'design', label: '设计', icon: Pencil },
  { id: 'blueprint', label: '蓝图', icon: ScrollText },
];

interface CommandBarProps {
  mode: DockMode;
  motionPhase?: MotionPhase;
  activeCategory: DockCategory | null;
  onModeChange: (mode: DockMode) => void;
  onCategoryChange: (category: DockCategory) => void;
}

export function CommandBar({ mode, motionPhase = 'steady', activeCategory, onModeChange, onCategoryChange }: CommandBarProps) {
  const items = MAIN_DOCK_ITEMS[mode];

  return (
    <div
      className={`command-bar main-dock bottom-command-surface bottom-command-surface--lg motion-bottom-surface is-${motionPhase}`}
      data-dock-mode={mode}
      aria-label="建造主工具栏"
      aria-busy={motionPhase !== 'steady'}
    >
      <div className="mode-rail main-dock__mode-switch" role="group" aria-label="建造模式">
        {MAIN_DOCK_MODES.map(({ id, label, icon: Icon }) => {
          const active = mode === id;
          return (
            <button
              key={id}
              type="button"
              className={`main-dock__mode-button ${active ? 'is-active' : ''}`}
              data-mode-id={id}
              aria-label={label}
              aria-pressed={active}
              onClick={() => onModeChange(id)}
            >
              <i className="main-dock__state-line" aria-hidden="true" />
              <Icon size={20} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      <i className="main-dock__divider" aria-hidden="true" />

      <div
        key={mode}
        className="category-row main-dock__categories"
        aria-label={mode === 'design' ? '设计分类' : '蓝图分类'}
      >
        {items.map(({ id, label, icon: Icon }) => {
          const selected = activeCategory === id;
          return (
            <button
              key={id}
              type="button"
              className={`main-dock__category-button ${selected ? 'is-active' : ''}`}
              aria-label={label}
              aria-pressed={selected}
              onClick={() => onCategoryChange(id)}
            >
              <i className="main-dock__state-line" aria-hidden="true" />
              <Icon size={24} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
