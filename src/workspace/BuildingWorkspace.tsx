import { useMemo, useState } from 'react';
import {
  Building2,
  DoorOpen,
  Grid2X2,
  House,
  Landmark,
  PanelsTopLeft,
  Sparkles,
  Waves,
  X,
} from 'lucide-react';

const primaryCategories = [
  { key: '全部', icon: Grid2X2, filters: ['全部', '庑殿', '歇山', '悬山', '硬山', '攒尖', '卷棚', '其他'] },
  { key: '塔', icon: Landmark, filters: ['全部', '攒尖', '楼阁式', '密檐', '覆钵', '其他'] },
  { key: '殿', icon: Building2, filters: ['全部', '庑殿', '歇山', '悬山', '硬山', '卷棚'] },
  { key: '楼阁', icon: PanelsTopLeft, filters: ['全部', '重檐', '歇山', '庑殿', '攒尖', '其他'] },
  { key: '屋舍', icon: House, filters: ['全部', '悬山', '硬山', '卷棚', '歇山'] },
  { key: '门', icon: DoorOpen, filters: ['全部', '门楼', '歇山', '硬山', '悬山', '牌楼'] },
  { key: '廊榭', icon: Waves, filters: ['全部', '卷棚', '歇山', '悬山', '平顶'] },
  { key: '特殊', icon: Sparkles, filters: ['全部', '工程', '水工', '城防', '祭祀', '其他'] },
] as const;

type PrimaryCategory = (typeof primaryCategories)[number]['key'];

const buildingCards = [
  { name: '八角楼阁式木塔', form: '塔', filter: '楼阁式', meta: '楼阁式 · 七层', detail: '城市地标 / 寺观', tone: 'tower' },
  { name: '密檐砖塔', form: '塔', filter: '密檐', meta: '密檐 · 九层', detail: '寺观 / 地标', tone: 'pagoda' },
  { name: '重檐大殿', form: '殿', filter: '庑殿', meta: '庑殿 · 重檐', detail: '礼制 / 公共建筑', tone: 'hall' },
  { name: '重檐楼阁', form: '楼阁', filter: '重檐', meta: '重檐 · 双层', detail: '公共建筑', tone: 'pavilion' },
  { name: '三开间民居', form: '屋舍', filter: '硬山', meta: '硬山 · 三开间', detail: '住宅', tone: 'house' },
  { name: '城门楼阁', form: '门', filter: '门楼', meta: '门楼 · 城防', detail: '城门建筑', tone: 'gate' },
  { name: '临水榭台', form: '廊榭', filter: '卷棚', meta: '卷棚 · 水岸', detail: '园林建筑', tone: 'waterside' },
  { name: '观象台', form: '特殊', filter: '工程', meta: '工程 · 高台', detail: '特殊工程', tone: 'special' },
] as const;

interface BuildingWorkspaceProps {
  onClose: () => void;
  onSelectBuilding: () => void;
}

export function BuildingWorkspace({ onClose, onSelectBuilding }: BuildingWorkspaceProps) {
  const [primary, setPrimary] = useState<PrimaryCategory>('全部');
  const [filter, setFilter] = useState('全部');

  const activeCategory = primaryCategories.find((item) => item.key === primary) ?? primaryCategories[0];
  const visibleCards = useMemo(
    () => buildingCards.filter((item) => (primary === '全部' || item.form === primary) && (filter === '全部' || item.filter === filter)),
    [primary, filter],
  );

  function selectPrimary(next: PrimaryCategory) {
    setPrimary(next);
    setFilter('全部');
  }

  return (
    <section className="workspace workspace--building">
      <header className="workspace-header">
        <b>建筑</b>
        <button className="icon-button" onClick={onClose} aria-label="关闭建筑目录"><X /></button>
      </header>

      <div className="workspace-body">
        <nav className="workspace-primary-rail" aria-label="建筑形制">
          {primaryCategories.map(({ key, icon: Icon }) => (
            <button
              key={key}
              type="button"
              className={primary === key ? 'is-active' : ''}
              onClick={() => selectPrimary(key)}
            >
              <Icon size={16} />
              <span>{key}</span>
            </button>
          ))}
        </nav>

        <div className="workspace-catalog">
          <nav className="workspace-context-filter" aria-label="当前建筑筛选">
            {activeCategory.filters.map((item) => (
              <button
                key={item}
                type="button"
                className={filter === item ? 'is-active' : ''}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </nav>

          <div className="workspace-content-grid">
            {visibleCards.map(({ name, meta, detail, tone }) => (
              <button
                type="button"
                className="building-card"
                key={name}
                title={`${meta} · ${detail}`}
                onClick={onSelectBuilding}
              >
                <div className={`card-thumb card-thumb--${tone}`} aria-hidden="true" />
                <div className="building-card__copy">
                  <b>{name}</b>
                  <span>{meta}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
