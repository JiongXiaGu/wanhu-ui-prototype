import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { LoadGameSpace } from './archive/LoadGameSpace';
import { resolveReviewBootstrap } from './app/scenarios';
import type { Screen } from './app/ui-state';
import { GameplayScreen } from './gameplay/GameplayScreen';
import { LoadingSpace } from './loading/LoadingSpace';
import { MainMenu, type MainMenuAction } from './menu/MainMenu';
import { NewGameSpace } from './new-game/NewGameSpace';
import { BindingDialogDemo } from './settings/BindingDialogDemo';
import { SettingsPanel } from './settings/SettingsPanel';
import { DialogHost, NotificationHost, useDialogSystem } from './ui/dialog/DialogSystem';

const MAIN_BG = '/assets/wanhu-main-menu.png';
const GAME_BG = '/assets/wanhu-gameplay-city.png';

export default function App() {
  const reviewBootstrap = useMemo(() => resolveReviewBootstrap(window.location.search), []);
  const [screen, setScreen] = useState<Screen>(reviewBootstrap.screen);
  const [simScale, setSimScale] = useState(1);
  const dialogs = useDialogSystem();

  useEffect(() => {
    const updateScale = () => setSimScale(Math.min(window.innerWidth / 1920, window.innerHeight / 1080));
    const preload = new Image();
    preload.src = GAME_BG;
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

  return (
    <div className="viewport-shell">
      <main className="game-canvas" style={canvasStyle}>
        {screen === 'menu' && <MainMenu background={MAIN_BG} onAction={handleMenu} />}

        {screen === 'newGame' && (
          <FlowBackdrop background={MAIN_BG}>
            <NewGameSpace onBack={() => setScreen('menu')} onStart={beginLoading} />
          </FlowBackdrop>
        )}

        {screen === 'load' && (
          <FlowBackdrop background={MAIN_BG}>
            <LoadGameSpace context="menu" onBack={() => setScreen('menu')} onLoad={beginLoading} />
          </FlowBackdrop>
        )}

        {screen === 'settings' && (
          <FlowBackdrop background={MAIN_BG}>
            <SettingsPanel context="menu" onClose={() => setScreen('menu')} onApply={() => setScreen('menu')} />
          </FlowBackdrop>
        )}

        {screen === 'loading' && (
          <LoadingSpace
            background={GAME_BG}
            staticProgress={reviewBootstrap.loadingProgress}
            onComplete={enterGameDirectly}
          />
        )}

        {screen === 'gameplay' && <GameplayScreen background={GAME_BG} initialState={reviewBootstrap.gameplay} onMainMenu={() => setScreen('menu')} />}

        <NotificationHost />
        <DialogHost />
        <BindingDialogDemo />
      </main>
    </div>
  );
}

function FlowBackdrop({ background, children }: { background: string; children: ReactNode }) {
  return <section className="screen flow-screen" style={{ backgroundImage: `url(${background})` }}><div className="flow-shade" />{children}</section>;
}
