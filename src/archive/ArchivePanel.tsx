import { useMemo, useState } from 'react';
import { Check, ChevronLeft, FolderOpen, Save } from 'lucide-react';

export type ArchiveMode = 'load' | 'save';

interface ArchivePanelProps {
  mode: ArchiveMode;
  context: 'menu' | 'pause';
  onBack: () => void;
  onLoad?: () => void;
}

type SlotId = 'auto' | 'manual-1' | 'manual-2' | 'manual-3';

type ArchiveSlot = {
  id: SlotId;
  label: string;
  title: string;
  meta: string;
  time: string;
  empty?: boolean;
  automatic?: boolean;
};

const slots: ArchiveSlot[] = [
  { id: 'auto', label: 'AUTO', title: '昭平城', meta: '第十二年 · 秋 · 晴 · 14:27', time: '自动存档 · 3 分钟前', automatic: true },
  { id: 'manual-1', label: 'SAVE 01', title: '昭平城', meta: '第十二年 · 秋 · 晴 · 14:18', time: '手动存档 · 今天 14:18' },
  { id: 'manual-2', label: 'SAVE 02', title: '临川府', meta: '第七年 · 夏 · 多云 · 09:42', time: '手动存档 · 昨天 23:18' },
  { id: 'manual-3', label: 'SAVE 03', title: '空存档槽', meta: '可用于创建新的手动存档', time: '尚未使用', empty: true },
];

export function ArchivePanel({ mode, context, onBack, onLoad }: ArchivePanelProps) {
  const initialSelected: SlotId = mode === 'load' ? 'auto' : 'manual-1';
  const [selected, setSelected] = useState<SlotId>(initialSelected);
  const [saved, setSaved] = useState(false);

  const selectedSlot = useMemo(() => slots.find((slot) => slot.id === selected)!, [selected]);
  const isLoad = mode === 'load';
  const title = isLoad ? '载入游戏' : '保存游戏';
  const eyebrow = isLoad ? 'LOAD ARCHIVE' : 'SAVE CITY';

  function activateSlot(slot: ArchiveSlot) {
    if (!isLoad && slot.automatic) return;
    if (isLoad && slot.empty) return;
    setSelected(slot.id);
    setSaved(false);
  }

  return (
    <section className={`archive-panel archive-panel--${mode} archive-panel--${context}`} aria-label={title}>
      <header className="archive-panel__header">
        <div>
          <small>{eyebrow}</small>
          <div><h2>{title}</h2><span>{isLoad ? '选择一个城市存档继续营造' : '昭平城 · 第十二年秋'}</span></div>
        </div>
        <button type="button" onClick={onBack}><ChevronLeft size={16} />返回</button>
      </header>

      <div className="archive-panel__summary">
        <div>
          <small>{isLoad ? '存档档案' : '当前城市'}</small>
          <b>{isLoad ? '本地城市存档' : '昭平城'}</b>
          <span>{isLoad ? '按最近保存时间排序' : '第十二年 · 秋 · 晴 · 14:30'}</span>
        </div>
        <div className="archive-panel__summary-stats">
          {isLoad ? (
            <>
              <span><small>可载入</small><b>3</b></span>
              <span><small>自动存档</small><b>1</b></span>
              <span><small>手动存档</small><b>2</b></span>
            </>
          ) : (
            <>
              <span><small>钱粮</small><b>24,680</b></span>
              <span><small>人口</small><b>8,426</b></span>
              <span><small>最近自动保存</small><b>3 分钟前</b></span>
            </>
          )}
        </div>
      </div>

      <div className="archive-panel__slots">
        {slots.map((slot) => {
          const disabled = (!isLoad && slot.automatic) || (isLoad && slot.empty);
          return (
            <button
              key={slot.id}
              type="button"
              disabled={disabled}
              className={`archive-panel__slot ${selected === slot.id ? 'is-selected' : ''} ${slot.empty ? 'is-empty' : ''} ${slot.automatic ? 'is-automatic' : ''}`}
              onClick={() => activateSlot(slot)}
            >
              <div className="archive-panel__thumb" />
              <div className="archive-panel__slot-copy">
                <small>{slot.label}</small>
                <b>{slot.title}</b>
                <span>{slot.meta}</span>
              </div>
              <em>{slot.time}</em>
            </button>
          );
        })}
      </div>

      <footer className="archive-panel__footer">
        <span>
          {isLoad
            ? `将载入：${selectedSlot.title} · ${selectedSlot.meta}`
            : saved
              ? '当前城市已经写入所选存档槽。'
              : selectedSlot.empty
                ? '将在这个空存档槽中创建新的手动存档。'
                : '覆盖已有存档前会再次确认。'}
        </span>
        <div>
          <button type="button" className="archive-panel__secondary" onClick={onBack}>取消</button>
          {isLoad ? (
            <button type="button" className="archive-panel__primary" onClick={onLoad}>
              <FolderOpen size={14} />载入存档
            </button>
          ) : (
            <button type="button" className="archive-panel__primary" onClick={() => setSaved(true)}>
              {saved ? <Check size={14} /> : <Save size={14} />}
              {saved ? '已保存' : selectedSlot.empty ? '创建存档' : '保存到此处'}
            </button>
          )}
        </div>
      </footer>
    </section>
  );
}
