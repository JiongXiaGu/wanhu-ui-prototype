import { useMemo, useState } from 'react';
import { Check, ChevronLeft, Clock3, FolderOpen, Save } from 'lucide-react';

export type ArchiveMode = 'load' | 'save';

interface ArchivePanelProps {
  mode: ArchiveMode;
  context: 'menu' | 'pause';
  onBack: () => void;
  onLoad?: () => void;
}

type SaveEntry = {
  id: string;
  name: string;
  dateLabel: string;
  meta: string;
  savedAt: string;
  automatic?: boolean;
  empty?: boolean;
};

type GameGroup = {
  id: string;
  city: string;
  era: string;
  season: string;
  playTime: string;
  lastPlayed: string;
  population: string;
  wealth: string;
  seed: string;
  version: string;
  image: string;
  saves: SaveEntry[];
};

const gameGroups: GameGroup[] = [
  {
    id: 'zhaoping', city: '昭平城', era: '第十二年', season: '秋 · 晴', playTime: '42h 18m', lastPlayed: '今天 14:27',
    population: '8,426', wealth: '24,680', seed: '268041', version: '0.8.4', image: '/assets/wanhu-gameplay-city.png',
    saves: [
      { id: 'zp-auto', name: '自动存档', dateLabel: '今天', meta: '第十二年 · 秋 · 晴 · 14:27', savedAt: '14:27', automatic: true },
      { id: 'zp-1', name: '城南水渠完成前', dateLabel: '今天', meta: '第十二年 · 秋 · 晴 · 14:18', savedAt: '14:18' },
      { id: 'zp-2', name: '西市扩建', dateLabel: '今天', meta: '第十二年 · 秋 · 晴 · 11:52', savedAt: '11:52' },
      { id: 'zp-3', name: '冬季前备份', dateLabel: '昨天', meta: '第十一年 · 冬 · 阴 · 22:41', savedAt: '22:41' },
      { id: 'zp-empty', name: '创建新存档', dateLabel: '当前游戏', meta: '保存当前昭平城进度', savedAt: '空槽', empty: true },
    ],
  },
  {
    id: 'linchuan', city: '临川府', era: '第七年', season: '夏 · 多云', playTime: '18h 42m', lastPlayed: '昨天 23:18',
    population: '4,972', wealth: '13,240', seed: '714209', version: '0.8.4', image: '/assets/wanhu-gameplay-lake.png',
    saves: [
      { id: 'lc-auto', name: '自动存档', dateLabel: '昨天', meta: '第七年 · 夏 · 多云 · 23:18', savedAt: '23:18', automatic: true },
      { id: 'lc-1', name: '东岸桥区', dateLabel: '昨天', meta: '第七年 · 夏 · 多云 · 22:06', savedAt: '22:06' },
      { id: 'lc-2', name: '水路调整前', dateLabel: '9 月 12 日', meta: '第六年 · 春 · 雨 · 18:31', savedAt: '18:31' },
    ],
  },
  {
    id: 'nanling', city: '南陵', era: '第三年', season: '春 · 小雨', playTime: '7h 09m', lastPlayed: '9 月 10 日 19:42',
    population: '2,118', wealth: '7,360', seed: '390174', version: '0.8.3', image: '/assets/wanhu-main-menu.png',
    saves: [
      { id: 'nl-auto', name: '自动存档', dateLabel: '9 月 10 日', meta: '第三年 · 春 · 小雨 · 19:42', savedAt: '19:42', automatic: true },
      { id: 'nl-1', name: '初建城墙', dateLabel: '9 月 10 日', meta: '第三年 · 春 · 小雨 · 18:55', savedAt: '18:55' },
    ],
  },
];

export function ArchivePanel({ mode, context, onBack, onLoad }: ArchivePanelProps) {
  const isLoad = mode === 'load';
  const groups = isLoad ? gameGroups : [gameGroups[0]];
  const [groupId, setGroupId] = useState(groups[0].id);
  const group = groups.find((item) => item.id === groupId) ?? groups[0];
  const initialSave = isLoad ? group.saves.find((save) => !save.empty)?.id ?? group.saves[0].id : group.saves.find((save) => !save.automatic && !save.empty)?.id ?? group.saves[0].id;
  const [saveId, setSaveId] = useState(initialSave);
  const [saved, setSaved] = useState(false);

  const selectedSave = useMemo(() => group.saves.find((save) => save.id === saveId) ?? group.saves[0], [group, saveId]);

  function selectGroup(nextId: string) {
    const next = groups.find((item) => item.id === nextId)!;
    setGroupId(nextId);
    const nextSave = isLoad ? next.saves.find((save) => !save.empty) : next.saves.find((save) => !save.automatic && !save.empty);
    setSaveId((nextSave ?? next.saves[0]).id);
    setSaved(false);
  }

  function selectSave(save: SaveEntry) {
    if (isLoad && save.empty) return;
    if (!isLoad && save.automatic) return;
    setSaveId(save.id);
    setSaved(false);
  }

  const title = isLoad ? '游戏档案' : '保存游戏';

  return (
    <section className={`archive-space archive-space--${mode} archive-space--${context}`} aria-label={title}>
      <header className="global-space-header">
        <button type="button" className="global-space-back" onClick={onBack}><ChevronLeft size={16} />返回</button>
        <div className="global-space-heading">
          <small>{isLoad ? 'CITY ARCHIVE' : 'SAVE CURRENT CITY'}</small>
          <div><h1>{title}</h1><span>{isLoad ? `${groups.length} 个游戏组 · 选择一座城市继续` : '昭平城 · 当前游戏组'}</span></div>
        </div>
        <div className="global-space-meta">本地档案</div>
      </header>

      <div className="archive-space__layout">
        <aside className="archive-groups">
          <div className="archive-column-heading">
            <b>{isLoad ? '游戏组' : '当前游戏'}</b>
            <span>{isLoad ? '每组代表一场独立游戏' : '保存仅写入当前游戏组'}</span>
          </div>
          <div className="archive-group-list">
            {groups.map((item) => (
              <button key={item.id} type="button" className={`archive-group-card ${item.id === group.id ? 'is-selected' : ''}`} onClick={() => selectGroup(item.id)}>
                <div className="archive-group-card__image" style={{ backgroundImage: `url(${item.image})` }} />
                <div className="archive-group-card__body">
                  <div><b>{item.city}</b><span>{item.era} · {item.season}</span></div>
                  <small><Clock3 size={11} />{item.playTime}<i />最近 {item.lastPlayed}</small>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <main className="archive-timeline">
          <div className="archive-column-heading">
            <b>存档记录</b>
            <span>{group.city} · {group.saves.filter((save) => !save.empty).length} 个可用节点</span>
          </div>
          <div className="archive-timeline__list">
            {group.saves.map((save, index) => {
              const disabled = (isLoad && save.empty) || (!isLoad && save.automatic);
              return (
                <button
                  key={save.id}
                  type="button"
                  disabled={disabled}
                  className={`archive-save-node ${save.id === selectedSave.id ? 'is-selected' : ''} ${save.automatic ? 'is-auto' : ''} ${save.empty ? 'is-empty' : ''}`}
                  onClick={() => selectSave(save)}
                >
                  <span className="archive-save-node__rail"><i />{index < group.saves.length - 1 && <em />}</span>
                  <span className="archive-save-node__date">{save.dateLabel}</span>
                  <span className="archive-save-node__copy"><b>{save.name}</b><small>{save.meta}</small></span>
                  <span className="archive-save-node__time">{save.savedAt}</span>
                </button>
              );
            })}
          </div>
        </main>

        <aside className="archive-preview">
          <div className="archive-preview__image" style={{ backgroundImage: `url(${group.image})` }}>
            <span>{selectedSave.automatic ? 'AUTO SAVE' : selectedSave.empty ? 'NEW SAVE' : 'MANUAL SAVE'}</span>
          </div>
          <div className="archive-preview__title">
            <small>{selectedSave.name}</small>
            <h2>{group.city}</h2>
            <span>{selectedSave.meta}</span>
          </div>
          <div className="archive-preview__stats">
            <span><small>人口</small><b>{group.population}</b></span>
            <span><small>钱粮</small><b>{group.wealth}</b></span>
            <span><small>游戏时间</small><b>{group.playTime}</b></span>
            <span><small>世界种子</small><b>{group.seed}</b></span>
            <span><small>版本</small><b>{group.version}</b></span>
            <span><small>保存时间</small><b>{selectedSave.savedAt}</b></span>
          </div>
          <div className="archive-preview__note">
            {isLoad
              ? '载入后将回到该存档保存时的城市状态。'
              : selectedSave.empty
                ? '将在当前游戏组中创建新的手动存档节点。'
                : selectedSave.automatic
                  ? '自动存档由系统管理，不能手动覆盖。'
                  : '覆盖已有手动存档前会再次确认。'}
          </div>
        </aside>
      </div>

      <footer className="global-space-footer">
        <span>{saved ? '当前城市已经保存。' : isLoad ? `${group.city} · ${selectedSave.name}` : '当前游戏组：昭平城'}</span>
        <div>
          <button type="button" className="global-space-secondary" onClick={onBack}>取消</button>
          {isLoad ? (
            <button type="button" className="global-space-primary" onClick={onLoad}><FolderOpen size={14} />载入此存档</button>
          ) : (
            <button type="button" className="global-space-primary" disabled={selectedSave.automatic} onClick={() => setSaved(true)}>
              {saved ? <Check size={14} /> : <Save size={14} />}{saved ? '已保存' : selectedSave.empty ? '创建新存档' : '保存到此处'}
            </button>
          )}
        </div>
      </footer>
    </section>
  );
}
