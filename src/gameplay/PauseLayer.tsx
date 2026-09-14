import { useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import type { PauseView } from '../app/ui-state';
import { SettingsPanel } from '../settings/SettingsPanel';
import { SaveGamePanel } from './SaveGamePanel';

interface PauseLayerProps {
  view: PauseView;
  onViewChange: (view: PauseView) => void;
  onResume: () => void;
  onMainMenu: () => void;
}

const items = [
  { label: '继续游戏', note: '返回昭平城', action: 'resume' },
  { label: '保存游戏', note: '保存当前城市进度', action: 'save' },
  { label: '游戏设置', note: '显示 · 图形 · 音频 · 操作', action: 'settings' },
  { label: '返回主菜单', note: '离开当前城市', action: 'main-menu' },
] as const;

export function PauseLayer({ view, onViewChange, onResume, onMainMenu }: PauseLayerProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (view === 'menu') onResume();
      else onViewChange('menu');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, onResume, onViewChange]);

  return (
    <div className="pause-layer" role="dialog" aria-label="暂停菜单">
      <div className="pause-shade" />
      <div className="pause-atmosphere" />

      {view === 'menu' && (
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
                onClick={
                  item.action === 'resume' ? onResume :
                  item.action === 'save' ? () => onViewChange('save') :
                  item.action === 'settings' ? () => onViewChange('settings') :
                  onMainMenu
                }
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
      )}

      {view === 'save' && (
        <div className="pause-secondary-surface">
          <SaveGamePanel onBack={() => onViewChange('menu')} />
        </div>
      )}

      {view === 'settings' && (
        <div className="pause-secondary-surface">
          <SettingsPanel
            context="pause"
            onClose={() => onViewChange('menu')}
            onApply={() => onViewChange('menu')}
          />
        </div>
      )}
    </div>
  );
}
