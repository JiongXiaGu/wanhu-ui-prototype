import { ChevronRight } from 'lucide-react';

interface PauseLayerProps {
  onResume: () => void;
  onMainMenu: () => void;
}

const items = [
  { label: '继续游戏', note: '返回昭平城', action: 'resume' },
  { label: '保存游戏', note: '保存当前城市进度', action: 'save' },
  { label: '游戏设置', note: '显示 · 图形 · 音频 · 操作', action: 'settings' },
  { label: '返回主菜单', note: '离开当前城市', action: 'main-menu' },
] as const;

export function PauseLayer({ onResume, onMainMenu }: PauseLayerProps) {
  return (
    <div className="pause-layer" role="dialog" aria-label="暂停菜单">
      <div className="pause-shade" />
      <div className="pause-atmosphere" />

      <section className="pause-command-surface">
        <header className="pause-heading">
          <small>GAME PAUSED</small>
          <div>
            <h2>暂停</h2>
            <span>昭平城 · 第十二年秋</span>
          </div>
        </header>

        <nav className="pause-command-list" aria-label="暂停菜单命令">
          {items.map((item, index) => (
            <button
              key={item.action}
              type="button"
              className={index === 0 ? 'is-primary' : ''}
              onClick={item.action === 'resume' ? onResume : item.action === 'main-menu' ? onMainMenu : undefined}
            >
              <span className="pause-command-index">{String(index + 1).padStart(2, '0')}</span>
              <span className="pause-command-copy">
                <b>{item.label}</b>
                <small>{item.note}</small>
              </span>
              <ChevronRight size={14} />
            </button>
          ))}
        </nav>

        <footer className="pause-footer">
          <span><kbd>Esc</kbd> 继续游戏</span>
          <span>WANHU PROJECT</span>
        </footer>
      </section>
    </div>
  );
}
