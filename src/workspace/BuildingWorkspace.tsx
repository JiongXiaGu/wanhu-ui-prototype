import { Bell, Building2, Castle, DoorOpen, Landmark, Waves, X } from 'lucide-react';

const buildingCards = [
  { name: '八角楼阁式木塔', type: '木构 · 七层', use: '城市地标 / 寺观', icon: Landmark },
  { name: '重檐楼阁', type: '木构 · 双檐', use: '公共建筑', icon: Building2 },
  { name: '钟楼', type: '木构 · 三层', use: '城市设施', icon: Bell },
  { name: '鼓楼', type: '木构 · 三层', use: '城市设施', icon: Castle },
  { name: '城门楼阁', type: '木构 · 城防', use: '城门建筑', icon: DoorOpen },
  { name: '临水榭台', type: '木构 · 水岸', use: '园林建筑', icon: Waves },
] as const;

interface BuildingWorkspaceProps {
  onClose: () => void;
  onSelectBuilding: () => void;
}

export function BuildingWorkspace({ onClose, onSelectBuilding }: BuildingWorkspaceProps) {
  return (
    <section className="workspace">
      <header>
        <div><b>建筑</b></div>
        <button className="icon-button" onClick={onClose} aria-label="关闭建筑目录"><X /></button>
      </header>
      <div className="workspace-body">
        <aside>
          {['全部', '住宅', '商业', '工坊', '官署', '宗教', '军务'].map((item, index) => (
            <button key={item} className={index === 0 ? 'is-active' : ''}>{item}</button>
          ))}
        </aside>
        <div className="catalog">
          <div className="filter-row">
            {['全部', '楼阁', '塔', '院落', '水榭', '城门'].map((item, index) => (
              <button key={item} className={index === 0 ? 'is-active' : ''}>{item}</button>
            ))}
          </div>
          <div className="card-grid">
            {buildingCards.map(({ name, type, use, icon: Icon }) => (
              <button className="building-card" key={name} title={`${type} · ${use}`} onClick={onSelectBuilding}>
                <div className="card-thumb"><Icon /></div>
                <div className="building-card__copy"><b>{name}</b><span>{type}</span></div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
