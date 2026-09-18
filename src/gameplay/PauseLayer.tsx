import { useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import type { PauseView } from '../app/ui-state';
import { SaveGameSpace } from '../archive/SaveGameSpace';
import { SettingsPanel } from '../settings/SettingsPanel';
import { useDialogSystem } from '../ui/dialog/DialogSystem';

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

type PauseAction = (typeof items)[number]['action'];

export function PauseLayer({ view, onViewChange, onResume, onMainMenu }: PauseLayerProps) {
  const dialogs = useDialogSystem();
  const menuButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      if (view === 'menu') onResume();
      else onViewChange('menu');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, onResume, onViewChange]);

  useEffect(() => {
    if (view !== 'menu') return;
    const frame = window.requestAnimationFrame(() => {
      menuButtonRefs.current[0]?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [view]);

  function confirmReturnToMainMenu() {
    dialogs.confirm({
      title: '返回主菜单？',
      message: '将结束当前游戏并返回主菜单。',
      confirmText: '返回主菜单',
      onConfirm: onMainMenu,
    });
  }

  function runAction(action: PauseAction) {
    if (action === 'resume') onResume();
    else if (action === 'save') onViewChange('save');
    else if (action === 'settings') onViewChange('settings');
    else confirmReturnToMainMenu();
  }

  function handleMenuKeyDown(event: ReactKeyboardEvent<HTMLElement>) {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    const buttons = menuButtonRefs.current.filter((button): button is HTMLButtonElement => button !== null);
    if (buttons.length === 0) return;

    event.preventDefault();
    const activeIndex = buttons.indexOf(document.activeElement as HTMLButtonElement);
    let nextIndex = activeIndex < 0 ? 0 : activeIndex;

    if (event.key === 'ArrowDown') nextIndex = (nextIndex + 1) % buttons.length;
    else if (event.key === 'ArrowUp') nextIndex = (nextIndex - 1 + buttons.length) % buttons.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = buttons.length - 1;

    buttons[nextIndex]?.focus({ preventScroll: true });
  }

  function renderCommand(item: (typeof items)[number], index: number) {
    return (
      <button
        key={item.action}
        ref={(node) => { menuButtonRefs.current[index] = node; }}
        type="button"
        title={item.detail}
        data-pause-action={item.action}
        onClick={() => runAction(item.action)}
      >
        <b>{item.label}</b>
      </button>
    );
  }

  return (
    <div className="pause-layer" role="dialog" aria-modal="true" aria-label="暂停菜单">
      <div className="pause-shade" />
      <div className="pause-atmosphere" />

      {view === 'menu' && (
        <section className="pause-command-surface">
          <header className="pause-heading">
            <h2>暂停</h2>
            <p>昭平城 · 第十二年秋</p>
          </header>

          <nav className="pause-command-list" aria-label="暂停菜单命令" onKeyDown={handleMenuKeyDown}>
            <div className="pause-command-group">
              {items.slice(0, 3).map((item, index) => renderCommand(item, index))}
            </div>
            <div className="pause-command-divider" aria-hidden="true" />
            <div className="pause-command-group pause-command-group--exit">
              {renderCommand(items[3], 3)}
            </div>
          </nav>
        </section>
      )}

      {view === 'save' && <div className="pause-secondary-surface"><SaveGameSpace context="pause" onBack={() => onViewChange('menu')} /></div>}
      {view === 'settings' && <div className="pause-secondary-surface"><SettingsPanel context="pause" onClose={() => onViewChange('menu')} onApply={() => onViewChange('menu')} /></div>}
    </div>
  );
}
