import { useEffect } from 'react';
import type { PauseView } from '../app/ui-state';
import { SaveGameSpace } from '../archive/SaveGameSpace';
import { SettingsPanel } from '../settings/SettingsPanel';

interface PauseLayerProps {
  view: PauseView;
  onViewChange: (view: PauseView) => void;
  onResume: () => void;
  onMainMenu: () => void;
}

const items = [
  { label: '继续游戏', action: 'resume', detail: '返回昭平城。' },
  { label: '保存游戏', action: 'save', detail: '保存当前游戏组中的城市进度。' },
  { label: '游戏设置', action: 'settings', detail: '调整显示、图形、音频、操作与游戏选项。' },
  { label: '返回主菜单', action: 'main-menu', detail: '离开当前城市并返回主菜单。' },
] as const;

export function PauseLayer({ view, onViewChange, onResume, onMainMenu }: PauseLayerProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
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
            <h2>暂停</h2>
            <span>昭平城 · 第十二年秋</span>
          </header>

          <nav className="pause-command-list" aria-label="暂停菜单命令">
            {items.map((item, index) => (
              <button
                key={item.action}
                type="button"
                title={item.detail}
                className={index === 0 ? 'is-primary' : ''}
                onClick={
                  item.action === 'resume' ? onResume :
                  item.action === 'save' ? () => onViewChange('save') :
                  item.action === 'settings' ? () => onViewChange('settings') :
                  onMainMenu
                }
              >
                <b>{item.label}</b>
              </button>
            ))}
          </nav>

          <footer className="pause-footer">
            <span><kbd>Esc</kbd>继续游戏</span>
          </footer>
        </section>
      )}

      {view === 'save' && (
        <div className="pause-secondary-surface">
          <SaveGameSpace context="pause" onBack={() => onViewChange('menu')} />
        </div>
      )}

      {view === 'settings' && (
        <div className="pause-secondary-surface">
          <SettingsPanel context="pause" onClose={() => onViewChange('menu')} onApply={() => onViewChange('menu')} />
        </div>
      )}
    </div>
  );
}
