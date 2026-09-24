import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { LoadGameSpace } from './archive/LoadGameSpace';
import { resolveReviewBootstrap } from './app/scenarios';
import type { Screen } from './app/ui-state';
import { GameplayScreen } from './gameplay/GameplayScreen';
import { LoadingSpace } from './loading/LoadingSpace';
import { MainMenu, type MainMenuAction } from './menu/MainMenu';
import { NewGameSpace } from './new-game/NewGameSpace';
import { SettingsPanel } from './settings/SettingsPanel';
import { DialogHost, NotificationHost, useDialogSystem } from './ui/dialog/DialogSystem';
import { useKeyedTransition } from './ui/motion';
import { HoverOverlayHost } from './ui/hover/HoverOverlay';

const MAIN_BG = '/assets/wanhu-main-menu.png';
const GAME_BG = '/assets/wanhu-gameplay-city.png';
const GAME_BG_NIGHT = '/assets/wanhu-gameplay-city-night.png';

export default function App() {
  const reviewBootstrap = useMemo(() => resolveReviewBootstrap(window.location.search), []);
  const reviewTarget = useMemo(() => new URLSearchParams(window.location.search).get('review'), []);
  const [screen, setScreen] = useState<Screen>(reviewBootstrap.screen);
  const [simScale, setSimScale] = useState(1);
  const dialogs = useDialogSystem();
  const screenMotion = useKeyedTransition(screen);

  useEffect(() => {
    if (reviewTarget !== 'dialog-dropdown') return;
    dialogs.choiceInput({
      title: '下拉选择验收',
      label: '方案名称',
      initialValue: '测试方案',
      choiceLabel: '方案来源',
      choices: ['系统内置', '创意工坊', '我的方案'],
      initialChoice: '系统内置',
      choiceLayout: 'dropdown',
      confirmText: '确认',
      onConfirm: () => undefined,
    });
  }, [reviewTarget, dialogs.choiceInput]);

  useEffect(() => {
    const updateScale = () => setSimScale(Math.min(window.innerWidth / 1920, window.innerHeight / 1080));
    for (const src of [GAME_BG, GAME_BG_NIGHT]) {
      const image = new Image();
      image.src = src;
    }
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const canvasStyle = useMemo(() => ({ transform: `translate(-50%, -50%) scale(${simScale})` }), [simScale]);

  function enterGameDirectly() {
    setScreen('gameplay');
  }

  function beginLoading() {
    setScreen('loading');
  }

  function handleMenu(action: MainMenuAction) {
    if (action === 'continue') enterGameDirectly();
    if (action === 'new') setScreen('newGame');
    if (action === 'load') setScreen('load');
    if (action === 'settings') setScreen('settings');
    if (action === 'exit') {
      dialogs.confirm({
        title: '退出游戏？',
        message: '确定要退出《万户天工》吗？',
        confirmText: '退出游戏',
        onConfirm: () => dialogs.toast('原型环境不会真正退出程序。', 'neutral'),
      });
    }
  }

  function renderScreen(target: Screen) {
    if (target === 'menu') return <MainMenu background={MAIN_BG} onAction={handleMenu} />;
    if (target === 'newGame') {
      return <FlowBackdrop background={MAIN_BG}><NewGameSpace onBack={() => setScreen('menu')} onStart={beginLoading} /></FlowBackdrop>;
    }
    if (target === 'load') {
      return <FlowBackdrop background={MAIN_BG}><LoadGameSpace context="menu" onBack={() => setScreen('menu')} onLoad={beginLoading} /></FlowBackdrop>;
    }
    if (target === 'settings') {
      return <FlowBackdrop background={MAIN_BG}><SettingsPanel context="menu" onClose={() => setScreen('menu')} onApply={() => setScreen('menu')} /></FlowBackdrop>;
    }
    if (target === 'loading') {
      return <LoadingSpace background={GAME_BG} staticProgress={reviewBootstrap.loadingProgress} onComplete={enterGameDirectly} />;
    }
    return <GameplayScreen background={GAME_BG} nightBackground={GAME_BG_NIGHT} initialState={reviewBootstrap.gameplay} onMainMenu={() => setScreen('menu')} />;
  }

  return (
    <div className="viewport-shell">
      <main className="game-canvas" style={canvasStyle}>
        {screenMotion.outgoing && (
          <div key={screenMotion.outgoing} className="app-screen-motion-layer is-exiting" aria-hidden="true">
            {renderScreen(screenMotion.outgoing)}
          </div>
        )}
        <div key={screenMotion.active} className={`app-screen-motion-layer is-active is-${screenMotion.activePhase}`}>
          {renderScreen(screenMotion.active)}
        </div>

        <HoverOverlayHost />
        <NotificationHost />
        <DialogHost />
      </main>
    </div>
  );
}

function FlowBackdrop({ background, children }: { background: string; children: ReactNode }) {
  return <section className="screen flow-screen" style={{ backgroundImage: `url(${background})` }}><div className="flow-shade" />{children}</section>;
}
