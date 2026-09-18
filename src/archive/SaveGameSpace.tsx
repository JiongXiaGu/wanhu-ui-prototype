import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, Pencil, Save, Trash2, Zap } from 'lucide-react';
import { ToggleSwitch } from '../ui/Controls';
import { useDialogSystem } from '../ui/dialog/DialogSystem';
import { SaveEntryCard, type SaveCompatibility, type SaveEntryCardData, type SaveKind } from './SaveEntryCard';

interface SaveGameSpaceProps {
  context: 'pause';
  onBack: () => void;
}

type SaveFilter = 'all' | SaveKind;
type SaveEntry = SaveEntryCardData & { order: number };

const CURRENT_VERSION = '0.8.4';
const INITIAL_GROUP_NAME = '昭平城';
const CURRENT_PLAY_TIME = '46h 18m';
const CURRENT_GAME_DATE = '第12年 8月17日';
const CURRENT_SAVED_AT = '2026-09-15 18:43';
const QUICK_SAVE_LIMIT = 10;
const assetPool = ['/assets/wanhu-gameplay-city.png', '/assets/wanhu-gameplay-lake.png', '/assets/wanhu-main-menu.png'];

const filterItems: { key: SaveFilter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'auto', label: '自动存档' },
  { key: 'manual', label: '手动存档' },
  { key: 'quick', label: '快速存档' },
];

function compatibilityForVersion(version: string): SaveCompatibility {
  if (version === CURRENT_VERSION) return 'current';
  if (version.startsWith('0.8.')) return 'outdated';
  return 'incompatible';
}

function kindFor(index: number): SaveKind {
  const cycle: SaveKind[] = ['manual', 'auto', 'manual', 'quick', 'manual', 'auto'];
  return cycle[index % cycle.length];
}

function prefixFor(kind: SaveKind) {
  if (kind === 'auto') return '自动存档';
  if (kind === 'quick') return '快速存档';
  return '手动存档';
}

function buildSaves(): SaveEntry[] {
  return Array.from({ length: 30 }, (_, index) => {
    const kind = kindFor(index);
    const version = index < 10 ? CURRENT_VERSION : index < 22 ? '0.8.3' : '0.7.8';
    const date = new Date(Date.UTC(2026, 8, 15, 18, 31) - index * 31 * 60_000);
    const savedAt = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')} ${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')}`;
    const year = Math.max(8, 12 - Math.floor(index / 10));
    const month = Math.max(1, 8 - Math.floor((index % 10) / 3));
    const day = Math.max(1, 17 - (index % 3) * 4);
    const serialBase = kind === 'quick' ? 8 : kind === 'auto' ? 1 : 25;
    const serial = String(serialBase + Math.floor(index / 3)).padStart(3, '0');
    return {
      id: `${kind}-${index}`,
      name: index === 0 ? '城南水渠完成' : `${prefixFor(kind)}.${serial}`,
      kind,
      gameDate: `第${year}年 ${month}月${day}日`,
      savedAt,
      image: assetPool[index % assetPool.length],
      version,
      compatibility: compatibilityForVersion(version),
      order: 2000 - index,
    };
  });
}

const initialSaves = buildSaves();

function nextSerial(saves: SaveEntry[], kind: SaveKind) {
  const prefix = `${prefixFor(kind)}.`;
  const max = saves
    .filter((save) => save.kind === kind && save.name.startsWith(prefix))
    .reduce((current, save) => Math.max(current, Number(save.name.slice(prefix.length)) || 0), 0);
  return String(max + 1).padStart(3, '0');
}

export function SaveGameSpace({ context, onBack }: SaveGameSpaceProps) {
  const dialogs = useDialogSystem();
  const [groupName, setGroupName] = useState(INITIAL_GROUP_NAME);
  const [saves, setSaves] = useState<SaveEntry[]>(() => structuredClone(initialSaves));
  const [filter, setFilter] = useState<SaveFilter>('all');
  const [hideOutdated, setHideOutdated] = useState(false);
  const [selectedId, setSelectedId] = useState(saves[0]?.id ?? '');

  const visibleSaves = useMemo(() => [...saves]
    .sort((a, b) => b.order - a.order)
    .filter((save) => filter === 'all' || save.kind === filter)
    .filter((save) => !hideOutdated || save.compatibility === 'current'), [saves, filter, hideOutdated]);

  useEffect(() => {
    if (visibleSaves.length === 0) {
      setSelectedId('');
      return;
    }
    if (!visibleSaves.some((save) => save.id === selectedId)) setSelectedId(visibleSaves[0].id);
  }, [visibleSaves, selectedId]);

  function buildCurrentEntry(kind: 'manual' | 'quick', name: string, current: SaveEntry[]) {
    return {
      id: `${kind}-new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      kind,
      gameDate: CURRENT_GAME_DATE,
      savedAt: CURRENT_SAVED_AT,
      image: '/assets/wanhu-gameplay-city.png',
      version: CURRENT_VERSION,
      compatibility: 'current' as const,
      order: Math.max(...current.map((save) => save.order), 0) + 1,
    };
  }

  function startGroupRename() {
    dialogs.input({
      title: '更改存档组名称',
      label: '名称',
      initialValue: groupName,
      confirmText: '确认',
      onConfirm: setGroupName,
    });
  }

  function openSaveDialog() {
    const defaultName = `手动存档.${nextSerial(saves, 'manual')}`;
    dialogs.input({
      title: '保存存档',
      label: '存档名称',
      initialValue: defaultName,
      confirmText: '保存',
      onConfirm: (name) => {
        let created: SaveEntry | null = null;
        setSaves((current) => {
          created = buildCurrentEntry('manual', name || defaultName, current);
          return [created, ...current];
        });
        window.setTimeout(() => {
          if (!created) return;
          setSelectedId(created.id);
          setFilter('all');
          dialogs.toast(`已保存 ${created.name}`, 'success');
        }, 0);
      },
    });
  }

  function quickSave() {
    const name = `快速存档.${nextSerial(saves, 'quick')}`;
    let created: SaveEntry | null = null;
    setSaves((current) => {
      created = buildCurrentEntry('quick', name, current);
      const quick = current.filter((save) => save.kind === 'quick').sort((a, b) => b.order - a.order);
      const removeId = quick.length >= QUICK_SAVE_LIMIT ? quick[quick.length - 1]?.id : null;
      const remaining = removeId ? current.filter((save) => save.id !== removeId) : current;
      return [created, ...remaining];
    });
    window.setTimeout(() => {
      if (!created) return;
      setSelectedId(created.id);
      setFilter('all');
      dialogs.toast(`已创建 ${created.name}`, 'success');
    }, 0);
  }

  function startRename(save: SaveEntry) {
    if (save.kind !== 'manual') return;
    setSelectedId(save.id);
    dialogs.input({
      title: '重命名存档',
      label: '名称',
      initialValue: save.name,
      confirmText: '确认',
      onConfirm: (name) => setSaves((current) => current.map((item) => item.id === save.id ? { ...item, name } : item)),
    });
  }

  function requestOverwrite(save: SaveEntry) {
    setSelectedId(save.id);
    dialogs.confirm({
      title: '覆盖存档？',
      message: `当前游戏状态将替换“${save.name}”。`,
      confirmText: '覆盖存档',
      visualTone: 'warning',
      onConfirm: () => {
        setSaves((current) => {
          const nextOrder = Math.max(...current.map((item) => item.order), 0) + 1;
          return current.map((item) => item.id === save.id ? {
            ...item,
            gameDate: CURRENT_GAME_DATE,
            savedAt: CURRENT_SAVED_AT,
            image: '/assets/wanhu-gameplay-city.png',
            version: CURRENT_VERSION,
            compatibility: 'current',
            order: nextOrder,
          } : item);
        });
        dialogs.toast(`已覆盖 ${save.name}`, 'success');
      },
    });
  }

  function requestDelete(save: SaveEntry) {
    setSelectedId(save.id);
    dialogs.confirm({
      title: '删除存档？',
      message: `“${save.name}”将被永久删除。`,
      confirmText: '删除',
      tone: 'danger',
      onConfirm: () => {
        setSaves((current) => {
          const remaining = current.filter((item) => item.id !== save.id);
          if (selectedId === save.id) setSelectedId([...remaining].sort((a, b) => b.order - a.order)[0]?.id ?? '');
          return remaining;
        });
        dialogs.toast(`已删除 ${save.name}`, 'neutral');
      },
    });
  }

  return (
    <section className={`save-game-space save-game-space--${context} wanhu-global-space`} aria-label="保存游戏">
      <header className="global-space-header save-game-space__header"><div className="global-space-heading"><h1>保存游戏</h1></div></header>

      <main className="save-game-space__body">
        <section className="save-current-game" aria-label="当前游戏">
          <div><h2>{groupName}</h2><p>当前版本 v{CURRENT_VERSION}<i />已游玩 {CURRENT_PLAY_TIME}</p></div>
          <span>当前游戏</span>
        </section>

        <header className="archive-saves-toolbar save-game-space__toolbar">
          <nav className="archive-save-type-tabs" aria-label="存档类型筛选">
            {filterItems.map((item) => <button key={item.key} type="button" className={filter === item.key ? 'is-active' : ''} aria-pressed={filter === item.key} onClick={() => setFilter(item.key)}>{item.label}</button>)}
          </nav>
          <div className="archive-hide-outdated"><span>隐藏过时存档</span><ToggleSwitch label="隐藏过时存档" value={hideOutdated} className="archive-hide-outdated__toggle" onChange={setHideOutdated} /></div>
        </header>

        <div className="archive-save-list save-game-space__list">
          {visibleSaves.map((save) => {
            const manual = save.kind === 'manual';
            return (
              <SaveEntryCard
                key={save.id}
                save={save}
                selected={selectedId === save.id}
                onSelect={() => setSelectedId(save.id)}
                onHover={() => setSelectedId(save.id)}
                actions={<>{manual && <button type="button" title="重命名存档" aria-label={`重命名 ${save.name}`} onClick={() => startRename(save)}><Pencil size={15} /></button>}{manual && <button type="button" className="is-primary" title="覆盖此存档" aria-label={`覆盖 ${save.name}`} onClick={() => requestOverwrite(save)}><Save size={16} /></button>}<button type="button" className="is-danger" title="删除存档" aria-label={`删除 ${save.name}`} onClick={() => requestDelete(save)}><Trash2 size={15} /></button></>}
              />
            );
          })}
          {visibleSaves.length === 0 && <div className="archive-save-empty-state">当前筛选下没有可显示的存档。</div>}
        </div>
      </main>

      <footer className="global-space-footer save-game-space__footer" aria-label="页面操作">
        <div className="save-game-space__footer-left"><button type="button" className="global-space-secondary save-group-rename" onClick={startGroupRename}><Pencil size={14} />更改存档组名称</button></div>
        <div className="save-game-space__footer-center"><button type="button" className="global-space-secondary save-quick-action" onClick={quickSave}><Zap size={14} />快速保存</button><button type="button" className="global-space-primary save-manual-action" onClick={openSaveDialog}><Save size={14} />保存存档</button></div>
        <button type="button" className="global-space-secondary save-game-space__back" onClick={onBack}><ChevronLeft size={14} />返回</button>
      </footer>
    </section>
  );
}
