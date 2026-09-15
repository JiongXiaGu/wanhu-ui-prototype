import { useMemo, useState } from 'react';
import { ChevronLeft, Dices, RefreshCw } from 'lucide-react';
import './new-game-space.css';

type SourceMode = 'preset' | 'random';
type SeedMode = 'random' | 'fixed';

type MapPreset = {
  id: string;
  name: string;
  image: string;
  description: string;
  facts: string[];
};

interface NewGameSpaceProps {
  onBack: () => void;
  onStart: () => void;
}

const MAPS: MapPreset[] = [
  {
    id: 'river-valley',
    name: '河谷平原',
    image: '/assets/wanhu-gameplay-city.png',
    description: '开阔平原被主河道贯穿，城市扩张空间充足，适合作为标准开局地图。',
    facts: ['大型', '平原', '主河道'],
  },
  {
    id: 'water-town',
    name: '江南水网',
    image: '/assets/wanhu-gameplay-lake.png',
    description: '河港、湖塘与支流交错，水运、桥梁和临水营造会更早进入城市发展。',
    facts: ['中型', '水网密集', '地势平缓'],
  },
  {
    id: 'northern-hills',
    name: '北地丘陵',
    image: '/assets/wanhu-main-menu.png',
    description: '地势起伏更明显，可用平地更集中，城市需要顺应山形逐步展开。',
    facts: ['大型', '丘陵', '起伏明显'],
  },
  {
    id: 'lake-plain',
    name: '湖滨平原',
    image: '/assets/wanhu-gameplay-lake.png',
    description: '大面积湖岸与平缓腹地并存，适合发展湖港、沿岸街区和跨水连接。',
    facts: ['中型', '湖岸', '平原'],
  },
];

const SIZES = ['小型', '中型', '大型'];
const GAME_MODES = ['低配', '造景', '完整'];

export function NewGameSpace({ onBack, onStart }: NewGameSpaceProps) {
  const [source, setSource] = useState<SourceMode>('preset');
  const [selectedMapId, setSelectedMapId] = useState(MAPS[0].id);
  const [size, setSize] = useState('大型');
  const [gameMode, setGameMode] = useState('完整');
  const [seedMode, setSeedMode] = useState<SeedMode>('random');
  const [seed, setSeed] = useState('20260824');
  const [cityName, setCityName] = useState('新建城市');

  const selectedMap = useMemo(() => MAPS.find((item) => item.id === selectedMapId) ?? MAPS[0], [selectedMapId]);
  const canStart = cityName.trim().length > 0;

  const randomizeSeed = () => setSeed(String(Math.floor(10000000 + Math.random() * 89999999)));

  return (
    <section className="new-game-space" aria-label="新建游戏">
      <header className="global-space-header new-game-space__header">
        <div className="global-space-heading"><h1>新建游戏</h1></div>
      </header>

      <nav className="new-game-space__tabs" aria-label="地图来源">
        <button type="button" className={source === 'preset' ? 'is-active' : ''} aria-pressed={source === 'preset'} onClick={() => setSource('preset')}>预定义地图</button>
        <button type="button" className={source === 'random' ? 'is-active' : ''} aria-pressed={source === 'random'} onClick={() => setSource('random')}>随机地图</button>
      </nav>

      <main className="new-game-space__body">
        <aside className="new-game-space__browser">
          {source === 'preset' ? (
            <>
              <header className="new-game-space__column-title"><b>选择地图</b><span>{MAPS.length} 张</span></header>
              <div className="new-game-space__map-list">
                {MAPS.map((map) => (
                  <button key={map.id} type="button" className={`new-game-map-card ${map.id === selectedMap.id ? 'is-selected' : ''}`} onClick={() => setSelectedMapId(map.id)}>
                    <span className="new-game-map-card__image" style={{ backgroundImage: `url(${map.image})` }} />
                    <span className="new-game-map-card__copy"><b>{map.name}</b><small>{map.facts.join(' · ')}</small></span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <header className="new-game-space__column-title"><b>生成参数</b><span>随机世界</span></header>
              <div className="new-game-generator">
                <GeneratorGroup label="地图尺寸" values={SIZES} value={size} onChange={setSize} />
                <GeneratorGroup label="游戏模式" values={GAME_MODES} value={gameMode} onChange={setGameMode} />

                <section className="new-game-generator__group">
                  <span>随机种子</span>
                  <div className="new-game-segmented">
                    <button type="button" className={seedMode === 'random' ? 'is-active' : ''} onClick={() => setSeedMode('random')}>每次随机</button>
                    <button type="button" className={seedMode === 'fixed' ? 'is-active' : ''} onClick={() => setSeedMode('fixed')}>固定种子</button>
                  </div>
                </section>

                {seedMode === 'fixed' && (
                  <section className="new-game-generator__group">
                    <span>固定种子</span>
                    <div className="new-game-seed-row">
                      <input aria-label="固定种子" value={seed} inputMode="numeric" onChange={(event) => setSeed(event.target.value.replace(/\D/g, '').slice(0, 10))} />
                      <button type="button" onClick={randomizeSeed}><RefreshCw size={13} />换一个</button>
                    </div>
                  </section>
                )}
              </div>
            </>
          )}
        </aside>

        <section className="new-game-space__preview" aria-label="地图预览">
          <div className="new-game-preview-image" style={{ backgroundImage: `url(${source === 'preset' ? selectedMap.image : '/assets/wanhu-gameplay-city.png'})` }}>
            {source === 'random' && <div className="new-game-preview-image__random"><Dices size={30} /><span>随机生成</span></div>}
          </div>

          <div className="new-game-preview-copy">
            <div>
              <h2>{source === 'preset' ? selectedMap.name : '随机世界'}</h2>
              <p>{source === 'preset' ? selectedMap.description : '游戏开始时根据当前参数生成一个新的世界。这里仅用于展示最终玩家选择流程。'}</p>
            </div>
            <div className="new-game-preview-facts" aria-label="地图信息">
              {(source === 'preset' ? selectedMap.facts : [size, `${gameMode}模式`, seedMode === 'random' ? '每次随机' : `种子 ${seed || '未设置'}`]).map((fact) => <span key={fact}>{fact}</span>)}
            </div>
          </div>
        </section>
      </main>

      <footer className="global-space-footer new-game-space__footer" aria-label="页面操作">
        <button type="button" className="global-space-secondary new-game-space__back" onClick={onBack}><ChevronLeft size={14} />返回</button>
        <label className="new-game-city-name"><span>城市名称</span><input value={cityName} maxLength={18} onChange={(event) => setCityName(event.target.value)} /></label>
        <button type="button" className="global-space-primary new-game-space__start" disabled={!canStart} onClick={onStart}>开始营造</button>
      </footer>
    </section>
  );
}

function GeneratorGroup({ label, values, value, onChange }: { label: string; values: string[]; value: string; onChange: (value: string) => void }) {
  return (
    <section className="new-game-generator__group">
      <span>{label}</span>
      <div className="new-game-segmented">
        {values.map((item) => <button key={item} type="button" className={item === value ? 'is-active' : ''} onClick={() => onChange(item)}>{item}</button>)}
      </div>
    </section>
  );
}
