import { useState } from 'react';
import { Check, ChevronLeft, Save } from 'lucide-react';

interface SaveGamePanelProps {
  onBack: () => void;
}

type SlotId = 'manual-1' | 'manual-2' | 'manual-3';

const slots: { id: SlotId; title: string; meta: string; time: string; empty?: boolean }[] = [
  { id: 'manual-1', title: '昭平城', meta: '第十二年 · 秋 · 晴', time: '手动存档 · 今天 14:18' },
  { id: 'manual-2', title: '昭平城', meta: '第十一年 · 冬 · 阴', time: '手动存档 · 昨天 22:41' },
  { id: 'manual-3', title: '空存档槽', meta: '可用于创建新的手动存档', time: '尚未使用', empty: true },
];

export function SaveGamePanel({ onBack }: SaveGamePanelProps) {
  const [selected, setSelected] = useState<SlotId>('manual-1');
  const [saved, setSaved] = useState(false);

  return (
    <section className="pause-save-panel" aria-label="保存游戏">
      <header className="pause-save-panel__header">
        <div>
          <small>SAVE CITY</small>
          <div><h2>保存游戏</h2><span>昭平城 · 第十二年秋</span></div>
        </div>
        <button type="button" onClick={onBack}><ChevronLeft size={16} />返回</button>
      </header>

      <div className="pause-save-panel__summary">
        <div>
          <small>当前城市</small>
          <b>昭平城</b>
          <span>第十二年 · 秋 · 晴 · 14:30</span>
        </div>
        <div className="pause-save-panel__summary-stats">
          <span><small>钱粮</small><b>24,680</b></span>
          <span><small>人口</small><b>8,426</b></span>
          <span><small>最近自动保存</small><b>3 分钟前</b></span>
        </div>
      </div>

      <div className="pause-save-panel__slots">
        <div className="pause-save-panel__slot pause-save-panel__slot--auto">
          <div className="pause-save-panel__thumb" />
          <div className="pause-save-panel__slot-copy">
            <small>AUTO</small>
            <b>自动存档</b>
            <span>今天 14:27 · 第十二年秋</span>
          </div>
          <em>系统管理</em>
        </div>

        {slots.map((slot) => (
          <button
            key={slot.id}
            type="button"
            className={`pause-save-panel__slot ${selected === slot.id ? 'is-selected' : ''} ${slot.empty ? 'is-empty' : ''}`}
            onClick={() => { setSelected(slot.id); setSaved(false); }}
          >
            <div className="pause-save-panel__thumb" />
            <div className="pause-save-panel__slot-copy">
              <small>{slot.id.replace('manual-', 'SAVE 0')}</small>
              <b>{slot.title}</b>
              <span>{slot.meta}</span>
            </div>
            <em>{slot.time}</em>
          </button>
        ))}
      </div>

      <footer className="pause-save-panel__footer">
        <span>{saved ? '当前城市已经写入所选存档槽。' : '覆盖已有存档前会再次确认。'}</span>
        <div>
          <button type="button" className="pause-save-panel__secondary" onClick={onBack}>取消</button>
          <button type="button" className="pause-save-panel__primary" onClick={() => setSaved(true)}>
            {saved ? <Check size={14} /> : <Save size={14} />}
            {saved ? '已保存' : slots.find((slot) => slot.id === selected)?.empty ? '创建存档' : '保存到此处'}
          </button>
        </div>
      </footer>
    </section>
  );
}
