import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Milestone, Mountain, Waves } from 'lucide-react';
import { ArchivePanel } from './archive/ArchivePanel';
import { resolveReviewBootstrap } from './app/scenarios';
import type { Screen } from './app/ui-state';
import { GameplayScreen } from './gameplay/GameplayScreen';
import { MainMenu, type MainMenuAction } from './menu/MainMenu';
import { SettingsPanel } from './settings/SettingsPanel';

const MAIN_BG = '/assets/wanhu-main-menu.png';
const GAME_BG = '/assets/wanhu-gameplay-city.png';

export default function App() {
  const reviewBootstrap = useMemo(() => resolveReviewBootstrap(window.location.search), []);
  const [screen, setScreen] = useState<Screen>(reviewBootstrap.screen);
  const [simScale, setSimScale] = useState(1);
  const [loading, setLoading] = useState(false);
  const [exitNotice, setExitNotice] = useState(false);

  useEffect(() => {
    const updateScale = () => setSimScale(Math.min(window.innerWidth / 1920, window.innerHeight / 1080));
    const preload = new Image();
    preload.src = GAME_BG;
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const canvasStyle = useMemo(() => ({ transform: `translate(-50%, -50%) scale(${simScale})` }), [simScale]);

  function enterGame() {
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setScreen('gameplay');
    }, 420);
  }

  function handleMenu(action: MainMenuAction) {
    if (action === 'continue') enterGame();
    if (action === 'new') setScreen('newGame');
    if (action === 'load') setScreen('load');
    if (action === 'settings') setScreen('settings');
    if (action === 'exit') setExitNotice(true);
  }

  return (
    <div className="viewport-shell">
      <main className="game-canvas" style={canvasStyle}>
        {screen === 'menu' && (
          <MainMenu
            background={MAIN_BG}
            exitNotice={exitNotice}
            onAction={handleMenu}
            onCloseNotice={() => setExitNotice(false)}
          />
        )}

        {screen === 'newGame' && (
          <FlowBackdrop background={MAIN_BG}>
            <div className="flow-frame">
              <header className="flow-header">
                <button className="ghost-button" onClick={() => setScreen('menu')}><ArrowLeft size={15} />返回</button>
                <div className="flow-title"><small>NEW CITY</small><h2>新建城市</h2></div>
                <span className="step-count">01 / 04</span>
              </header>
              <div className="flow-body">
                <aside className="step-rail">
                  {['世界', '地形', '规则', '开始'].map((step, index) => (
                    <div className={`step-item ${index === 0 ? 'is-active' : ''}`} key={step}>
                      <span>{String(index + 1).padStart(2, '0')}</span><b>{step}</b>
                    </div>
                  ))}
                </aside>
                <div className="new-game-content">
                  <div className="section-eyebrow">选择世界原型</div>
                  <div className="preset-grid">
                    <PresetCard icon={<Waves />} title="河谷平原" copy="开阔冲积平原与主河道，适合建立大型城市。" tag="推荐" selected />
                    <PresetCard icon={<Milestone />} title="江南水网" copy="河港密集、湖塘交错，水运与桥梁更重要。" tag="水网" />
                    <PresetCard icon={<Mountain />} title="北地丘陵" copy="起伏地势明显，城墙与道路更需要顺应山形。" tag="丘陵" />
                  </div>
                  <div className="world-summary">
                    <Summary label="城市名称" value="昭平" />
                    <Summary label="世界种子" value="268041" />
                    <Summary label="地图规模" value="大型" />
                    <Summary label="起始年代" value="初建" />
                  </div>
                </div>
              </div>
              <footer className="flow-actions">
                <button className="ghost-button" onClick={() => setScreen('menu')}>取消</button>
                <button className="gold-button" onClick={enterGame}>开始营造 <ArrowRight size={15} /></button>
              </footer>
            </div>
          </FlowBackdrop>
        )}

        {screen === 'load' && (
          <FlowBackdrop background={MAIN_BG}>
            <ArchivePanel mode="load" context="menu" onBack={() => setScreen('menu')} onLoad={enterGame} />
          </FlowBackdrop>
        )}

        {screen === 'settings' && (
          <FlowBackdrop background={MAIN_BG}>
            <SettingsPanel
              context="menu"
              onClose={() => setScreen('menu')}
              onApply={() => setScreen('menu')}
            />
          </FlowBackdrop>
        )}

        {screen === 'gameplay' && (
          <GameplayScreen background={GAME_BG} initialState={reviewBootstrap.gameplay} onMainMenu={() => setScreen('menu')} />
        )}

        {loading && <div className="loading-layer"><div>万户天工</div><i /><span>正在进入昭平城…</span></div>}
      </main>
    </div>
  );
}

function FlowBackdrop({ background, children }: { background: string; children: ReactNode }) {
  return <section className="screen flow-screen" style={{ backgroundImage: `url(${background})` }}><div className="flow-shade" />{children}</section>;
}

function PresetCard({ icon, title, copy, tag, selected }: { icon: ReactNode; title: string; copy: string; tag: string; selected?: boolean }) {
  return <article className={`preset-card ${selected ? 'is-selected' : ''}`}><div className="preset-visual">{icon}</div><b>{title}</b><p>{copy}</p><span>{tag}</span></article>;
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div><small>{label}</small><strong>{value}</strong></div>;
}
