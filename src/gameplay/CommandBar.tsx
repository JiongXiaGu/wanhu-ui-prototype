import { Blocks, Bridge, Building2, Castle, Copy, DoorOpen, Fence, Grid2X2, Mountain, Move, Palette, Redo2, Route, ScanLine, Trees, Undo2, Waves } from 'lucide-react';

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

const utilities = [
  { label: '地图解锁', icon: DoorOpen },
  { label: '编辑区域', icon: ScanLine },
  { label: '修改地形', icon: Mountain },
  { label: '修改颜色', icon: Palette },
  { label: '范围复制', icon: Copy },
  { label: '范围移动', icon: Move },
  { label: '撤销 · Ctrl+Z', icon: Undo2 },
  { label: '重做 · Ctrl+Y', icon: Redo2 },
] as const;

export function UtilityToolbar() {
  return (
    <div className="command-utility" aria-label="场景工具">
      <div className="command-utility__buttons">
        {utilities.map(({ label, icon: Icon }, index) => (
          <span key={label} style={{ display: 'contents' }}>
            {(index === 4 || index === 6) && <i className="command-utility__separator" />}
            <button type="button" className="command-utility__button" data-tooltip={label} aria-label={label}>
              <Icon size={17} />
            </button>
          </span>
        ))}
      </div>
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
