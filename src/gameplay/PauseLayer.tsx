import { useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import type { PauseView } from '../app/ui-state';
import { SaveGameSpace } from '../archive/SaveGameSpace';
import { SettingsPanel } from '../settings/SettingsPanel';
import { useDialogSystem } from '../ui/dialog/DialogSystem';
import { MOTION_MS, usePresence, type MotionPhase } from '../ui/motion';

interface PauseLayerProps {
  view: PauseView;
  motionPhase?: MotionPhase;
  interactive?: boolean;
  onViewChange: (view: PauseView) => void;
  onResume: () => void;
  onMainMenu: () => void;
}

const items = [
  { label: '继续游戏', action: 'resume' },
  { label: '保存游戏', action: 'save' },
  { label: '游戏设置', action: 'settings' },
  { label: '返回主菜单', action: 'main-menu' },
] as const;

type PauseAction = (typeof items)[number]['action'];

export function PauseLayer({ view, motionPhase = 'steady', interactive = true, onViewChange, onResume, onMainMenu }: PauseLayerProps) {
  const dialogs = useDialogSystem();
  const previousViewRef = useRef(view);
  const transitionFromRef = useRef(view);
  if (previousViewRef.current !== view) {
    transitionFromRef.current = previousViewRef.current;
    previousViewRef.current = view;
  }
  const transitionFrom = transitionFromRef.current;
  const menuPresence = usePresence(view === 'menu', {
    enterDelayMs: transitionFrom !== 'menu' && view === 'menu' ? MOTION_MS.fast : 0,
  });
  const secondaryPresence = usePresence(view !== 'menu', {
    enterDelayMs: transitionFrom === 'menu' && view !== 'menu' ? MOTION_MS.fast : 0,
  });
  const lastSecondaryView = useRef<Exclude<PauseView, 'menu'>>('save');
  if (view !== 'menu') lastSecondaryView.current = view;
  const renderedSecondaryView = view !== 'menu' ? view : lastSecondaryView.current;
  const menuButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!interactive || event.key !== 'Escape' || event.defaultPrevented) return;
      if (view === 'menu') onResume();
      else onViewChange('menu');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, interactive, onResume, onViewChange]);

  useEffect(() => {
    if (!interactive || view !== 'menu') return;
    const frame = window.requestAnimationFrame(() => {
      menuButtonRefs.current[0]?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [view, interactive]);

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
        data-pause-action={item.action}
        onClick={() => runAction(item.action)}
      >
        <b>{item.label}</b>
      </button>
    );
  }

  return (
    <div className={`pause-layer is-${motionPhase}`} role="dialog" aria-modal="true" aria-label="暂停菜单" aria-busy={motionPhase !== 'steady'}>
      <div className="pause-shade" />
      <div className="pause-atmosphere" />

      {menuPresence.mounted && (
        <section className={`pause-command-surface motion-center-surface is-${menuPresence.phase}`}>
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

      {secondaryPresence.mounted && renderedSecondaryView === 'save' && (
        <div className={`pause-secondary-surface motion-fade-surface is-${secondaryPresence.phase}`}>
          <SaveGameSpace context="pause" onBack={() => onViewChange('menu')} />
        </div>
      )}
      {secondaryPresence.mounted && renderedSecondaryView === 'settings' && (
        <div className={`pause-secondary-surface motion-fade-surface is-${secondaryPresence.phase}`}>
          <SettingsPanel context="pause" onClose={() => onViewChange('menu')} onApply={() => onViewChange('menu')} />
        </div>
      )}
    </div>
  );
}
