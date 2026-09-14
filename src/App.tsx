import { useEffect, useMemo, useState } from 'react';
import {
  AlignJustify,
  Archive,
  ArrowLeft,
  ArrowRight,
  Blocks,
  Box,
  Bridge,
  Building2,
  Camera,
  Castle,
  ChevronRight,
  CloudSun,
  Fence,
  FolderOpen,
  Layers3,
  LogOut,
  Menu as MenuIcon,
  Milestone,
  Mountain,
  Palette,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Route,
  Settings,
  Sparkles,
  Trees,
  Waves,
  X,
} from 'lucide-react';

type Screen = 'menu' | 'newGame' | 'load' | 'settings' | 'gameplay';
type Flyout = 'none' | 'camera' | 'weather';

const MAIN_BG = 'https://1dce6fef-d5b3-4158-ac04-f4528783a773.sandbox.floot.app/_cdn/static/6259882c-f656-4f9d-99ae-b99aa520f801.png';
const GAME_BG = 'https://1dce6fef-d5b3-4158-ac04-f4528783a773.sandbox.floot.app/_cdn/static/37cf3f78-6eea-4644-b44f-834fa31ca298.png';

const menuItems = [
  { key: 'continue', title: '继续游戏', meta: '昭平城 · 第十二年 秋 · 自动存档', icon: Play },
  { key: 'new', title: '新游戏', meta: '建立新的城市与世界', icon: Plus },
  { key: 'load', title: '载入游戏', meta: '浏览已有存档', icon: FolderOpen },
  { key: 'settings', title: '设置', meta: '显示 · 图形 · 音频 · 操作', icon: Settings },
  { key: 'exit', title: '退出游戏', meta: '返回桌面', icon: LogOut },
] as const;

const categoryItems = [
  { name: '全部', icon: Blocks },
  { name: '道路', icon: Route },
  { name: '桥梁', icon: Bridge },
  { name: '运河', icon: Waves },
  { name: '城墙', icon: Castle },
  { name: '围墙', icon: Fence },
  { name: '建筑', icon: Building2 },
  { name: '装饰', icon: Trees },
] as const;

const buildingCards = [
  ['八角楼阁式木塔', '木构 · 七层', '城市地标 / 寺观'],
  ['重檐楼阁', '木构 · 双檐', '公共建筑'],
  ['钟楼', '木构 · 三层', '城市设施'],
  ['鼓楼', '木构 · 三层', '城市设施'],
  ['城门楼阁', '木构 · 城防', '城门建筑'],
  ['临水榭台', '木构 · 水岸', '园林建筑'],
] as const;

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [simScale, setSimScale] = useState(1);
  const [loading, setLoading] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [toolOpen, setToolOpen] = useState(false);
  const [flyout, setFlyout] = useState<Flyout>('none');
  const [paused, setPaused] = useState(false);
  const [exitNotice, setExitNotice] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [activeCategory, setActiveCategory] = useState('全部');

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
      setWorkspaceOpen(false);
      setToolOpen(false);
      setFlyout('none');
      setPaused(false);
    }, 420);
  }

  function handleMenu(key: typeof menuItems[number]['key']) {
    if (key === 'continue') enterGame();
    if (key === 'new') setScreen('newGame');
    if (key === 'load') setScreen('load');
    if (key === 'settings') setScreen('settings');
    if (key === 'exit') setExitNotice(true);
  }

  return (
    <div className="viewport-shell">
      <main className="game-canvas" style={canvasStyle}>
        {screen === 'menu' && (
          <section className="screen main-menu-screen" style={{ backgroundImage: `url(${MAIN_BG})` }}>
            <div className="main-menu-shade" />
            <div className="brand-block">
              <div className="kicker">WANHU TIANGONG</div>
              <h1>万户天工</h1>
              <div className="brand-rule" />
              <p>泛中国古代城市营造模拟</p>
            </div>

            <nav className="main-menu-list">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button key={item.key} className={`menu-row ${index === 0 ? 'is-primary' : ''}`} onClick={() => handleMenu(item.key)}>
                    <span className="menu-index">{String(index + 1).padStart(2, '0')}</span>
                    <span className="menu-icon"><Icon size={17} /></span>
                    <span className="menu-copy"><b>{item.title}</b><small>{item.meta}</small></span>
                    <ChevronRight size={16} />
                  </button>
                );
              })}
            </nav>
            <div className="top-meta"><span>Prototype 0.2</span><i /><span>GitHub / Vercel</span></div>
            <footer className="main-footer"><span>WANHU PROJECT</span><span>城起于地 · 工成于人</span></footer>
            {exitNotice && <div className="toast">原型环境不会真正退出程序。<button onClick={() => setExitNotice(false)}><X size={14} /></button></div>}
          </section>
        )}

        {screen === 'newGame' && (
          <FlowBackdrop background={MAIN_BG}>
            <div className="flow-frame">
              <header className="flow-header">
                <button className="ghost-button" onClick={() => setScreen('menu')}><ArrowLeft size={15}/>返回</button>
                <div className="flow-title"><small>NEW CITY</small><h2>新建城市</h2></div>
                <span className="step-count">01 / 04</span>
              </header>
              <div className="flow-body">
                <aside className="step-rail">
                  {['世界','地形','规则','开始'].map((step, i) => <div className={`step-item ${i === 0 ? 'is-active' : ''}`} key={step}><span>{String(i + 1).padStart(2,'0')}</span><b>{step}</b></div>)}
                </aside>
                <div className="new-game-content">
                  <div className="section-eyebrow">选择世界原型</div>
                  <div className="preset-grid">
                    <PresetCard icon={<Waves/>} title="河谷平原" copy="开阔冲积平原与主河道，适合建立大型城市。" tag="推荐" selected />
                    <PresetCard icon={<Milestone/>} title="江南水网" copy="河港密集、湖塘交错，水运与桥梁更重要。" tag="水网" />
                    <PresetCard icon={<Mountain/>} title="北地丘陵" copy="起伏地势明显，城墙与道路更需要顺应山形。" tag="丘陵" />
                  </div>
                  <div className="world-summary">
                    <Summary label="城市名称" value="昭平" />
                    <Summary label="世界种子" value="268041" />
                    <Summary label="地图规模" value="大型" />
                    <Summary label="起始年代" value="初建" />
                  </div>
                </div>
              </div>
              <footer className="flow-actions"><button className="ghost-button" onClick={() => setScreen('menu')}>取消</button><button className="gold-button" onClick={enterGame}>开始营造 <ArrowRight size={15}/></button></footer>
            </div>
          </FlowBackdrop>
        )}

        {screen === 'load' && (
          <FlowBackdrop background={MAIN_BG}>
            <div className="modal wide-modal">
              <header className="modal-header"><div><small>SAVE ARCHIVE</small><h2>载入游戏</h2></div><button className="icon-button" onClick={() => setScreen('menu')}><X/></button></header>
              <div className="save-list">
                <SaveRow title="昭平城" meta="第十二年 · 秋 · 晴" time="自动存档 · 今天 14:32" selected onClick={enterGame}/>
                <SaveRow title="临川府" meta="第七年 · 夏 · 多云" time="手动存档 · 昨天 23:18" onClick={enterGame}/>
              </div>
              <footer className="modal-footer"><button className="ghost-button" onClick={() => setScreen('menu')}>返回</button><span>2 个本地存档</span></footer>
            </div>
          </FlowBackdrop>
        )}

        {screen === 'settings' && (
          <FlowBackdrop background={MAIN_BG}>
            <div className="modal settings-modal">
              <header className="modal-header"><div><small>OPTIONS</small><h2>设置</h2></div><button className="icon-button" onClick={() => setScreen('menu')}><X/></button></header>
              <div className="settings-layout">
                <nav>{['显示','图形','音频','操作','游戏'].map((x,i)=><button key={x} className={i===0?'is-active':''}>{x}</button>)}</nav>
                <div className="settings-body">
                  <SettingRow title="显示模式" note="当前窗口输出模式" value="无边框全屏"/>
                  <SettingRow title="分辨率" note="渲染输出尺寸" value="1920 × 1080"/>
                  <SettingRow title="界面缩放" note="HUD 与面板整体缩放" value="100%"/>
                  <SettingRow title="垂直同步" note="与显示器刷新率同步" value="开启"/>
                </div>
              </div>
              <footer className="modal-footer"><button className="ghost-button" onClick={()=>setScreen('menu')}>取消</button><button className="gold-button" onClick={()=>setScreen('menu')}>应用</button></footer>
            </div>
          </FlowBackdrop>
        )}

        {screen === 'gameplay' && (
          <section className="screen gameplay-screen" style={{ backgroundImage: `url(${GAME_BG})` }}>
            <div className="game-vignette" />

            <div className="hud-group">
              <div className="city-status"><div><span>昭平城</span><b>第十二年 · 秋</b></div><small>晴 · 14:30</small></div>
              <div className="resource-strip">
                <Resource icon={<Archive size={12}/>} label="钱粮" value="24,680" />
                <Resource icon={<Sparkles size={12}/>} label="人口" value="8,426" />
                <Resource icon={<Box size={12}/>} label="木材" value="3,240" />
                <Resource icon={<Layers3 size={12}/>} label="石料" value="2,780" />
              </div>
            </div>

            <div className="quick-controls">
              <button className={flyout==='camera'?'is-active':''} onClick={()=>setFlyout(flyout==='camera'?'none':'camera')}><Camera size={15}/>相机</button>
              <button className={flyout==='weather'?'is-active':''} onClick={()=>setFlyout(flyout==='weather'?'none':'weather')}><CloudSun size={15}/>天气</button>
              <i />
              <button className="speed"><Pause size={13}/></button>
              {[1,2,4].map(v=><button key={v} className={`speed ${speed===v?'is-active':''}`} onClick={()=>setSpeed(v)}>×{v}</button>)}
              <i />
              <button onClick={()=>setPaused(true)}><MenuIcon size={15}/>菜单</button>
            </div>

            {!toolOpen && <div className="command-bar">
              <div className="mode-rail"><button className="is-active">设计</button><button>蓝图</button></div><i />
              <div className="category-row">
                {categoryItems.map(({name,icon:Icon})=><button key={name} className={activeCategory===name?'is-active':''} onClick={()=>{setActiveCategory(name); if(name==='建筑')setWorkspaceOpen(!workspaceOpen);}}><Icon size={17}/><span>{name}</span></button>)}
              </div>
            </div>}

            {workspaceOpen && !toolOpen && <section className="workspace">
              <header><div><b>建筑</b><span>选择形制 · 点击建筑进入放置工具</span></div><button className="icon-button" onClick={()=>setWorkspaceOpen(false)}><X/></button></header>
              <div className="workspace-body">
                <aside>{['全部','住宅','商业','工坊','官署','宗教','军务'].map((v,i)=><button key={v} className={i===0?'is-active':''}>{v}</button>)}</aside>
                <div className="catalog">
                  <div className="filter-row">{['全部','楼阁','塔','院落','水榭','城门'].map((v,i)=><button key={v} className={i===0?'is-active':''}>{v}</button>)}</div>
                  <div className="card-grid">{buildingCards.map(([name,type,use])=><button className="building-card" key={name} onClick={()=>{setToolOpen(true);setWorkspaceOpen(false)}}><div className="card-thumb"><Building2/></div><div><b>{name}</b><span>{type}</span><small>{use}</small></div></button>)}</div>
                </div>
              </div>
            </section>}

            {toolOpen && <section className="tool-overlay">
              <header><div><b>建筑放置</b><span>八角楼阁式木塔</span></div><button className="icon-button" onClick={()=>setToolOpen(false)}><X/></button></header>
              <div className="tool-body">
                <Segment items={['整体','楼身','屋顶']} active="整体" />
                <h3>楼身比例</h3><Parameter label="楼层数量" value="3" pct={42}/><Parameter label="单层高度" value="4.2" pct={48}/>
                <div className="inline-segment"><span>柱网布局</span><Segment items={['疏朗','均衡','紧凑']} active="均衡"/></div>
                <h3>屋顶轮廓</h3><Parameter label="出檐尺度" value="2.7" pct={68}/>
                <div className="icon-strip"><span>快捷选项</span><div><button className="is-active">⌁</button><button>▦</button><button>♙</button><button>⇋</button></div></div>
              </div>
            </section>}

            {flyout !== 'none' && <aside className="flyout">
              <header><b>{flyout==='camera'?'相机':'天气'}</b><button className="icon-button" onClick={()=>setFlyout('none')}><X/></button></header>
              {flyout==='camera' ? <div className="flyout-body"><h3>视图模式</h3><Segment items={['经营','规划','摄影']} active="经营"/><p>经营模式适合日常建造与世界浏览。</p><h3>镜头</h3><Parameter label="视野角度" value="60" pct={52}/><button className="reset-button"><RotateCcw size={13}/>恢复默认</button></div> : <div className="flyout-body"><Segment items={['跟随世界','场景模拟']} active="场景模拟"/><p>场景模拟设置随存档保存。</p><h3>天气</h3><Parameter label="云量" value="42%" pct={42}/><Parameter label="积雪量" value="0%" pct={0}/><h3>风场</h3><Parameter label="风向" value="135°" pct={38}/><Parameter label="风力" value="1.2" pct={28}/><Parameter label="阵风" value="0.35" pct={35}/><h3>天象与历法</h3><Parameter label="日内时间" value="14:30" pct={61}/><Parameter label="季节进度" value="0.48" pct={48}/></div>}
            </aside>}

            {paused && <div className="pause-layer"><div className="pause-shade"/><section className="pause-panel"><small>GAME PAUSED</small><h2>暂停</h2><button className="is-primary" onClick={()=>setPaused(false)}>继续游戏</button><button>保存游戏</button><button>游戏设置</button><button onClick={()=>{setPaused(false);setScreen('menu')}}>返回主菜单</button></section></div>}
          </section>
        )}

        {loading && <div className="loading-layer"><div>万户天工</div><i/><span>正在进入昭平城…</span></div>}
      </main>
    </div>
  );
}

function FlowBackdrop({background,children}:{background:string;children:React.ReactNode}){return <section className="screen flow-screen" style={{backgroundImage:`url(${background})`}}><div className="flow-shade"/>{children}</section>}
function PresetCard({icon,title,copy,tag,selected}:{icon:React.ReactNode;title:string;copy:string;tag:string;selected?:boolean}){return <article className={`preset-card ${selected?'is-selected':''}`}><div className="preset-visual">{icon}</div><b>{title}</b><p>{copy}</p><span>{tag}</span></article>}
function Summary({label,value}:{label:string;value:string}){return <div><small>{label}</small><strong>{value}</strong></div>}
function SaveRow({title,meta,time,selected,onClick}:{title:string;meta:string;time:string;selected?:boolean;onClick:()=>void}){return <button className={`save-row ${selected?'is-selected':''}`} onClick={onClick}><div className="save-thumb"/><div><b>{title}</b><span>{meta}</span><small>{time}</small></div><em>{selected?'继续':'载入'} →</em></button>}
function SettingRow({title,note,value}:{title:string;note:string;value:string}){return <div className="setting-row"><span><b>{title}</b><small>{note}</small></span><strong>{value}</strong></div>}
function Resource({icon,label,value}:{icon:React.ReactNode;label:string;value:string}){return <span>{icon}<small>{label}</small><b>{value}</b></span>}
function Segment({items,active}:{items:string[];active:string}){return <div className="segment">{items.map(x=><button className={x===active?'is-active':''} key={x}>{x}</button>)}</div>}
function Parameter({label,value,pct}:{label:string;value:string;pct:number}){return <div className="parameter-row"><span>{label}</span><button>−</button><div className="track"><i style={{width:`${pct}%`}}/></div><button>＋</button><output>{value}</output></div>}
