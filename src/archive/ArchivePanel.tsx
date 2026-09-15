import { useMemo, useState, type KeyboardEvent } from 'react';
import {
  Check,
  ChevronLeft,
  Clock3,
  FolderOpen,
  Pencil,
  Save,
  Trash2,
  X,
} from 'lucide-react';

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
  image: string;
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

const initialGameGroups: GameGroup[] = [
  {
    id: 'zhaoping', city: '昭平城', era: '第十二年', season: '秋 · 晴', playTime: '42h 18m', lastPlayed: '今天 14:27',
    population: '8,426', wealth: '24,680', seed: '268041', version: '0.8.4', image: '/assets/wanhu-gameplay-city.png',
    saves: [
      { id: 'zp-auto', name: '自动存档', dateLabel: '今天', meta: '第十二年 · 秋 · 晴', savedAt: '14:27', automatic: true, image: '/assets/wanhu-gameplay-city.png' },
      { id: 'zp-1', name: '城南水渠完成前', dateLabel: '今天', meta: '第十二年 · 秋 · 晴', savedAt: '14:18', image: '/assets/wanhu-gameplay-lake.png' },
      { id: 'zp-2', name: '西市扩建', dateLabel: '今天', meta: '第十二年 · 秋 · 晴', savedAt: '11:52', image: '/assets/wanhu-main-menu.png' },
      { id: 'zp-3', name: '冬季前备份', dateLabel: '昨天', meta: '第十一年 · 冬 · 阴', savedAt: '22:41', image: '/assets/wanhu-gameplay-city.png' },
      { id: 'zp-empty', name: '创建新存档', dateLabel: '当前', meta: '保存昭平城当前进度', savedAt: '空槽', empty: true, image: '/assets/wanhu-gameplay-city.png' },
    ],
  },
  {
    id: 'linchuan', city: '临川府', era: '第七年', season: '夏 · 多云', playTime: '18h 42m', lastPlayed: '昨天 23:18',
    population: '4,972', wealth: '13,240', seed: '714209', version: '0.8.4', image: '/assets/wanhu-gameplay-lake.png',
    saves: [
      { id: 'lc-auto', name: '自动存档', dateLabel: '昨天', meta: '第七年 · 夏 · 多云', savedAt: '23:18', automatic: true, image: '/assets/wanhu-gameplay-lake.png' },
      { id: 'lc-1', name: '东岸桥区', dateLabel: '昨天', meta: '第七年 · 夏 · 多云', savedAt: '22:06', image: '/assets/wanhu-gameplay-city.png' },
      { id: 'lc-2', name: '水路调整前', dateLabel: '9 月 12 日', meta: '第六年 · 春 · 雨', savedAt: '18:31', image: '/assets/wanhu-main-menu.png' },
    ],
  },
  {
    id: 'nanling', city: '南陵', era: '第三年', season: '春 · 小雨', playTime: '7h 09m', lastPlayed: '9 月 10 日 19:42',
    population: '2,118', wealth: '7,360', seed: '390174', version: '0.8.3', image: '/assets/wanhu-main-menu.png',
    saves: [
      { id: 'nl-auto', name: '自动存档', dateLabel: '9 月 10 日', meta: '第三年 · 春 · 小雨', savedAt: '19:42', automatic: true, image: '/assets/wanhu-main-menu.png' },
      { id: 'nl-1', name: '初建城墙', dateLabel: '9 月 10 日', meta: '第三年 · 春 · 小雨', savedAt: '18:55', image: '/assets/wanhu-gameplay-city.png' },
    ],
  },
];

export function ArchivePanel({ mode, context, onBack, onLoad }: ArchivePanelProps) {
  const isLoad = mode === 'load';
  const [groups, setGroups] = useState<GameGroup[]>(() => structuredClone(isLoad ? initialGameGroups : [initialGameGroups[0]]));
  const [groupId, setGroupId] = useState(groups[0].id);
  const group = groups.find((item) => item.id === groupId) ?? groups[0];
  const initialSave = isLoad
    ? group.saves.find((save) => !save.empty)?.id ?? group.saves[0]?.id
    : group.saves.find((save) => !save.automatic && !save.empty)?.id ?? group.saves[0]?.id;
  const [saveId, setSaveId] = useState(initialSave ?? '');
  const [saved, setSaved] = useState(false);
  const [editingGroup, setEditingGroup] = useState(false);
  const [groupNameDraft, setGroupNameDraft] = useState(group.city);
  const [editingSaveId, setEditingSaveId] = useState<string | null>(null);
  const [saveNameDraft, setSaveNameDraft] = useState('');
  const [pendingDeleteSaveId, setPendingDeleteSaveId] = useState<string | null>(null);
  const [confirmDeleteGroup, setConfirmDeleteGroup] = useState(false);

  const selectedSave = useMemo(() => group?.saves.find((save) => save.id === saveId) ?? group?.saves[0], [group, saveId]);

  function updateGroup(mutator: (item: GameGroup) => GameGroup) {
    setGroups((current) => current.map((item) => item.id === group.id ? mutator(item) : item));
  }

  function selectGroup(nextId: string) {
    const next = groups.find((item) => item.id === nextId);
    if (!next) return;
    setGroupId(nextId);
    const nextSave = isLoad ? next.saves.find((save) => !save.empty) : next.saves.find((save) => !save.automatic && !save.empty);
    setSaveId((nextSave ?? next.saves[0])?.id ?? '');
    setSaved(false);
    setEditingGroup(false);
    setEditingSaveId(null);
    setPendingDeleteSaveId(null);
    setGroupNameDraft(next.city);
  }

  function selectSave(save: SaveEntry) {
    if (isLoad && save.empty) return;
    if (!isLoad && save.automatic) return;
    setSaveId(save.id);
    setSaved(false);
    setPendingDeleteSaveId(null);
  }

  function startGroupRename() {
    setGroupNameDraft(group.city);
    setEditingGroup(true);
  }

  function commitGroupRename() {
    const next = groupNameDraft.trim();
    if (next) updateGroup((item) => ({ ...item, city: next }));
    setEditingGroup(false);
  }

  function startSaveRename(save: SaveEntry) {
    if (save.empty) return;
    setSaveNameDraft(save.name);
    setEditingSaveId(save.id);
    setSaveId(save.id);
  }

  function commitSaveRename(saveIdToRename: string) {
    const next = saveNameDraft.trim();
    if (next) {
      updateGroup((item) => ({
        ...item,
        saves: item.saves.map((save) => save.id === saveIdToRename ? { ...save, name: next } : save),
      }));
    }
    setEditingSaveId(null);
  }

  function deleteSave(saveIdToDelete: string) {
    if (group.saves.length <= 1) return;
    const index = group.saves.findIndex((save) => save.id === saveIdToDelete);
    const remaining = group.saves.filter((save) => save.id !== saveIdToDelete);
    updateGroup((item) => ({ ...item, saves: remaining }));
    if (saveId === saveIdToDelete) {
      const next = remaining[Math.max(0, Math.min(index, remaining.length - 1))];
      setSaveId(next?.id ?? '');
    }
    setPendingDeleteSaveId(null);
  }

  function deleteCurrentGroup() {
    if (groups.length <= 1) return;
    const index = groups.findIndex((item) => item.id === group.id);
    const remaining = groups.filter((item) => item.id !== group.id);
    const next = remaining[Math.max(0, Math.min(index, remaining.length - 1))];
    setGroups(remaining);
    setGroupId(next.id);
    setSaveId(next.saves.find((save) => !save.empty)?.id ?? next.saves[0]?.id ?? '');
    setConfirmDeleteGroup(false);
    setEditingGroup(false);
    setGroupNameDraft(next.city);
  }

  function handleRenameKey(event: KeyboardEvent<HTMLInputElement>, commit: () => void, cancel: () => void) {
    if (event.key === 'Enter') {
      event.preventDefault();
      commit();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      cancel();
    }
  }

  function activateSave(save: SaveEntry) {
    if (save.empty && !isLoad) {
      setSaved(true);
      return;
    }
    if (isLoad) onLoad?.();
    else if (!save.automatic) setSaved(true);
  }

  return (
    <section className={`archive-space archive-space--${mode} archive-space--${context}`} aria-label={isLoad ? '读取游戏' : '保存游戏'}>
      <header className="global-space-header archive-space__header">
        <div className="global-space-heading"><h1>{isLoad ? '读取游戏' : '保存游戏'}</h1></div>
      </header>

      <div className="archive-space__layout archive-space__layout--browser">
        <aside className="archive-groups">
          <div className="archive-column-heading"><b>{isLoad ? '游戏组' : '当前游戏'}</b><span>{groups.length} 组</span></div>
          <div className="archive-group-list">
            {groups.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`archive-group-card ${item.id === group.id ? 'is-selected' : ''}`}
                onClick={() => selectGroup(item.id)}
                title={`游戏时间 ${item.playTime} · 最近 ${item.lastPlayed}`}
              >
                <span className="archive-group-card__image" style={{ backgroundImage: `url(${item.image})` }} />
                <span className="archive-group-card__body">
                  <span className="archive-group-card__title">
                    {item.id === group.id && editingGroup ? (
                      <input
                        autoFocus
                        value={groupNameDraft}
                        aria-label="重命名存档组"
                        onClick={(event) => event.stopPropagation()}
                        onChange={(event) => setGroupNameDraft(event.target.value)}
                        onBlur={commitGroupRename}
                        onKeyDown={(event) => handleRenameKey(event, commitGroupRename, () => setEditingGroup(false))}
                      />
                    ) : <b>{item.city}</b>}
                    <small>{item.saves.filter((save) => !save.empty).length} 个存档</small>
                  </span>
                  <span>{item.era} · {item.season}</span>
                  <small><Clock3 size={11} />{item.playTime}<i />{item.lastPlayed}</small>
                </span>
              </button>
            ))}
          </div>
        </aside>

        <main className="archive-saves">
          <header className="archive-saves__header">
            <div>
              <h2>{group.city}</h2>
              <span>{group.era} · {group.season}<i />{group.playTime}<i />人口 {group.population}</span>
            </div>
            <small>{isLoad ? '选择一个存档直接读取' : saved ? '已保存当前进度' : '选择存档进行覆盖或创建'}</small>
          </header>

          <div className="archive-save-list">
            {group.saves.map((save) => {
              const disabled = (isLoad && save.empty) || (!isLoad && save.automatic);
              const selected = selectedSave?.id === save.id;
              const editing = editingSaveId === save.id;
              const confirmingDelete = pendingDeleteSaveId === save.id;
              return (
                <article
                  key={save.id}
                  className={`archive-save-card ${selected ? 'is-selected' : ''} ${save.automatic ? 'is-auto' : ''} ${save.empty ? 'is-empty' : ''} ${disabled ? 'is-disabled' : ''}`}
                  onMouseEnter={() => !disabled && setSaveId(save.id)}
                  onDoubleClick={() => !disabled && activateSave(save)}
                >
                  <button
                    type="button"
                    className="archive-save-card__select"
                    disabled={disabled}
                    aria-label={`选择存档 ${save.name}`}
                    onClick={() => selectSave(save)}
                  >
                    <span className="archive-save-card__image" style={{ backgroundImage: `url(${save.image})` }} />
                    <span className="archive-save-card__copy">
                      <span className="archive-save-card__title-row">
                        {editing ? (
                          <input
                            autoFocus
                            value={saveNameDraft}
                            aria-label="重命名存档"
                            onClick={(event) => event.stopPropagation()}
                            onChange={(event) => setSaveNameDraft(event.target.value)}
                            onBlur={() => commitSaveRename(save.id)}
                            onKeyDown={(event) => handleRenameKey(event, () => commitSaveRename(save.id), () => setEditingSaveId(null))}
                          />
                        ) : <b>{save.name}</b>}
                        {save.automatic && <em>自动</em>}
                      </span>
                      <span>{save.meta}</span>
                      <small>{save.dateLabel} · {save.savedAt}</small>
                    </span>
                  </button>

                  {!save.empty && !disabled && (
                    <div className="archive-save-card__actions" aria-label="存档操作">
                      <button type="button" title="重命名存档" aria-label={`重命名 ${save.name}`} onClick={() => startSaveRename(save)}><Pencil size={15} /></button>
                      <button type="button" className="is-primary" title={isLoad ? '读取存档' : '保存到此存档'} aria-label={`${isLoad ? '读取' : '保存'} ${save.name}`} onClick={() => activateSave(save)}>{isLoad ? <FolderOpen size={16} /> : <Save size={16} />}</button>
                      <button type="button" className="is-danger" title="删除存档" aria-label={`删除 ${save.name}`} onClick={() => setPendingDeleteSaveId(save.id)}><Trash2 size={15} /></button>
                    </div>
                  )}

                  {save.empty && !isLoad && (
                    <button type="button" className="archive-save-card__create" title="创建新存档" aria-label="创建新存档" onClick={() => activateSave(save)}><Save size={16} /></button>
                  )}

                  {confirmingDelete && (
                    <div className="archive-save-card__confirm" role="dialog" aria-label="确认删除存档">
                      <span>删除这个存档？</span>
                      <button type="button" title="取消" aria-label="取消删除存档" onClick={() => setPendingDeleteSaveId(null)}><X size={14} /></button>
                      <button type="button" className="is-danger" title="确认删除" aria-label="确认删除存档" onClick={() => deleteSave(save.id)}><Trash2 size={14} /></button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </main>
      </div>

      <footer className="global-space-footer archive-space__footer" aria-label="页面操作">
        <div className="archive-space__footer-left">
          <button type="button" className="archive-footer-action" onClick={startGroupRename}><Pencil size={14} />重命名存档组</button>
          {isLoad && (
            <button type="button" className="archive-footer-action archive-footer-action--danger" disabled={groups.length <= 1} onClick={() => setConfirmDeleteGroup(true)}><Trash2 size={14} />删除存档组</button>
          )}
        </div>
        <div className="archive-space__footer-right">
          <button type="button" className="global-space-secondary archive-footer-back" onClick={onBack}><ChevronLeft size={14} />返回</button>
        </div>
      </footer>

      {confirmDeleteGroup && (
        <div className="archive-confirm-layer" role="dialog" aria-modal="true" aria-label="删除存档组">
          <section className="archive-confirm-dialog">
            <h2>删除“{group.city}”存档组？</h2>
            <p>这会删除该游戏组中的全部存档。</p>
            <footer>
              <button type="button" onClick={() => setConfirmDeleteGroup(false)}>取消</button>
              <button type="button" className="is-danger" onClick={deleteCurrentGroup}><Trash2 size={14} />删除存档组</button>
            </footer>
          </section>
        </div>
      )}
    </section>
  );
}
