import { Building2, X } from 'lucide-react';

const buildingCards = [
  ['八角楼阁式木塔', '木构 · 七层', '城市地标 / 寺观'],
  ['重檐楼阁', '木构 · 双檐', '公共建筑'],
  ['钟楼', '木构 · 三层', '城市设施'],
  ['鼓楼', '木构 · 三层', '城市设施'],
  ['城门楼阁', '木构 · 城防', '城门建筑'],
  ['临水榭台', '木构 · 水岸', '园林建筑'],
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
            {buildingCards.map(([name, type, use]) => (
              <button className="building-card" key={name} title={`${type} · ${use}`} onClick={onSelectBuilding}>
                <div className="card-thumb"><Building2 /></div>
                <div><b>{name}</b><span>{type}</span></div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
