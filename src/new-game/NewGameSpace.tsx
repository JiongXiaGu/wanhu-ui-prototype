import { useMemo, useState } from 'react';
import { ChevronLeft, Dices } from 'lucide-react';
import './new-game-space.css';

type MapKind = 'preset' | 'random';
type MapFilter = 'all' | MapKind;

type MapOption = {
  id: string;
  kind: MapKind;
  name: string;
  image: string;
  description: string;
  dimensions: string;
  terrain: string;
  water: string;
};

type RandomProfile = {
  style: string;
  coast: string;
  river: string;
  lakes: string;
};

interface NewGameSpaceProps {
  onBack: () => void;
  onStart: () => void;
}

const MAPS: MapOption[] = [
  {
    id: 'river-valley',
    kind: 'preset',
    name: '河谷平原',
    image: '/assets/wanhu-gameplay-city.png',
    description: '开阔平原被主河道贯穿，城市扩张空间充足，适合作为标准开局地图。',
    dimensions: '350 × 640',
    terrain: '平原',
    water: '主河道',
  },
  {
    id: 'water-town',
    kind: 'preset',
    name: '江南水网',
    image: '/assets/wanhu-gameplay-lake.png',
    description: '河港、湖塘与支流交错，水运、桥梁和临水营造会更早进入城市发展。',
    dimensions: '480 × 480',
    terrain: '平缓',
    water: '水网密集',
  },
  {
    id: 'northern-hills',
    kind: 'preset',
    name: '北地丘陵',
    image: '/assets/wanhu-main-menu.png',
    description: '地势起伏更明显，可用平地更集中，城市需要顺应山形逐步展开。',
    dimensions: '420 × 600',
    terrain: '丘陵',
    water: '溪谷',
  },
  {
    id: 'lake-plain',
    kind: 'preset',
    name: '湖滨平原',
    image: '/assets/wanhu-gameplay-lake.png',
    description: '大面积湖岸与平缓腹地并存，适合发展湖港、沿岸街区和跨水连接。',
    dimensions: '400 × 520',
    terrain: '平原',
    water: '湖岸',
  },
  {
    id: 'foothill-basin',
    kind: 'preset',
    name: '山前盆地',
    image: '/assets/wanhu-gameplay-city.png',
    description: '山地围合出较完整的盆地空间，中心区平缓，外围地势逐步抬升。',
    dimensions: '512 × 512',
    terrain: '盆地',
    water: '支流',
  },
  {
    id: 'random-world',
    kind: 'random',
    name: '随机世界',
    image: '/assets/wanhu-gameplay-city.png',
    description: '根据地图尺寸与随机种子在开始游戏时生成一个新的世界。',
    dimensions: '',
    terrain: '随机生成',
    water: '随机生成',
  },
];

const FILTERS: { key: MapFilter; label: string }[] = [
  { key: 'all', label: '所有地图' },
  { key: 'preset', label: '预定义地图' },
  { key: 'random', label: '随机地图' },
];
const SIZES = ['小型', '中型', '大型'];
const GAME_MODES = ['低配', '造景', '完整'];
const CITY_NAMES = ['昭平城', '临江城', '云津城', '南陵城', '清河城', '澄江府', '上阳城', '归安县'];
const RANDOM_PROFILES: RandomProfile[] = [
  { style: '江河平原', coast: '无海岸', river: '有主河道', lakes: '少量湖泊' },
  { style: '海湾丘陵', coast: '临海', river: '短河流', lakes: '少量湖泊' },
  { style: '湖沼水乡', coast: '无海岸', river: '河网密集', lakes: '湖泊较多' },
  { style: '山间盆地', coast: '无海岸', river: '支流穿行', lakes: '少量湖泊' },
  { style: '沿海平原', coast: '长海岸线', river: '有入海河', lakes: '零散湖泊' },
];

function randomProfileFor(seed: string) {
  const digits = seed.replace(/\D/g, '');
  const value = Number(digits.slice(-6)) || 0;
  return RANDOM_PROFILES[value % RANDOM_PROFILES.length];
}

export function NewGameSpace({ onBack, onStart }: NewGameSpaceProps) {
  const [filter, setFilter] = useState<MapFilter>('all');
  const [selectedMapId, setSelectedMapId] = useState(MAPS[0].id);
  const [size, setSize] = useState('大型');
  const [gameMode, setGameMode] = useState('完整');
  const [seed, setSeed] = useState('20260824');
  const [cityName, setCityName] = useState('新建城市');

  const selectedMap = useMemo(() => MAPS.find((item) => item.id === selectedMapId) ?? MAPS[0], [selectedMapId]);
  const visibleMaps = useMemo(() => filter === 'all' ? MAPS : MAPS.filter((item) => item.kind === filter), [filter]);
  const randomProfile = useMemo(() => randomProfileFor(seed), [seed]);
  const isRandom = selectedMap.kind === 'random';
  const canStart = cityName.trim().length > 0 && (!isRandom || seed.trim().length > 0);

  function chooseFilter(next: MapFilter) {
    setFilter(next);
    if (next === 'all' || selectedMap.kind === next) return;
    const first = MAPS.find((item) => item.kind === next);
    if (first) setSelectedMapId(first.id);
  }

  function randomizeSeed() {
    setSeed(String(Math.floor(10000000 + Math.random() * 89999999)));
  }

  function randomizeCityName() {
    const candidates = CITY_NAMES.filter((name) => name !== cityName.trim());
    setCityName(candidates[Math.floor(Math.random() * candidates.length)] ?? CITY_NAMES[0]);
  }

  return (
    <section className="new-game-space flow-frame" aria-label="新建游戏">
      <header className="global-space-header new-game-space__header">
        <div className="global-space-heading"><h1>新建游戏</h1></div>
      </header>

      <main className="new-game-space__body">
        <section className="new-game-map-browser" aria-label="地图选择">
          <header className="new-game-map-browser__head">
            <nav className="new-game-map-filters" aria-label="地图筛选">
              {FILTERS.map((item) => (
                <button key={item.key} type="button" className={filter === item.key ? 'is-active' : ''} aria-pressed={filter === item.key} onClick={() => chooseFilter(item.key)}>{item.label}</button>
              ))}
            </nav>
            <span>{visibleMaps.length} 张地图</span>
          </header>

          <div className="new-game-map-grid">
            {visibleMaps.map((map) => (
              <button
                key={map.id}
                type="button"
                data-map-kind={map.kind}
                className={`new-game-map-card ${map.id === selectedMap.id ? 'is-selected' : ''}`}
                aria-pressed={map.id === selectedMap.id}
                onClick={() => setSelectedMapId(map.id)}
              >
                {map.kind === 'random' && <span className="new-game-map-card__badge"><Dices size={12} /><em>随机地图</em></span>}
                <span className="new-game-map-card__image" style={{ backgroundImage: `url(${map.image})` }} />
                <span className="new-game-map-card__copy">
                  <b>{map.name}</b>
                  <span className="new-game-map-card__size">{map.kind === 'random' ? size : map.dimensions}</span>
                </span>
              </button>
            ))}
          </div>
        </section>

        <aside className="new-game-detail" aria-label="地图与开局方案">
          <header className="new-game-detail__header">
            <span>{isRandom ? '随机地图' : '预定义地图'}</span>
            <h2>{selectedMap.name}</h2>
            <p>{isRandom ? '地图特征由随机种子决定。更换种子即可快速获得另一组世界条件。' : selectedMap.description}</p>
          </header>

          <div className={`new-game-detail__facts ${isRandom ? 'is-random' : ''}`} aria-label="地图信息">
            {isRandom ? (
              <>
                <div><span>地图风格</span><b>{randomProfile.style}</b></div>
                <div><span>海岸</span><b>{randomProfile.coast}</b></div>
                <div><span>河流</span><b>{randomProfile.river}</b></div>
                <div><span>湖泊</span><b>{randomProfile.lakes}</b></div>
              </>
            ) : (
              <>
                <div><span>地图尺寸</span><b>{selectedMap.dimensions}</b></div>
                <div><span>主要地貌</span><b>{selectedMap.terrain}</b></div>
                <div><span>水系</span><b>{selectedMap.water}</b></div>
                <div><span>来源</span><b>预定义</b></div>
              </>
            )}
          </div>

          <section className="new-game-plan" aria-label="开局方案">
            <h3>开局方案</h3>

            {isRandom && <GeneratorGroup label="地图尺寸" values={SIZES} value={size} onChange={setSize} />}
            <GeneratorGroup label="游戏模式" values={GAME_MODES} value={gameMode} onChange={setGameMode} />

            <label className="new-game-plan__field">
              <span>城市名称</span>
              <div className="new-game-input-row">
                <input aria-label="城市名称" value={cityName} maxLength={18} placeholder="请输入城市名称" onChange={(event) => setCityName(event.target.value)} />
                <button type="button" className="new-game-randomize-button" aria-label="随机城市名称" title="随机城市名称" onClick={randomizeCityName}><Dices size={14} /></button>
              </div>
            </label>

            {isRandom && (
              <label className="new-game-plan__field">
                <span>随机种子</span>
                <div className="new-game-input-row">
                  <input aria-label="随机种子" value={seed} inputMode="numeric" onChange={(event) => setSeed(event.target.value.replace(/\D/g, '').slice(0, 10))} />
                  <button type="button" className="new-game-randomize-button" aria-label="随机地图种子" title="随机地图种子" onClick={randomizeSeed}><Dices size={14} /></button>
                </div>
              </label>
            )}
          </section>
        </aside>
      </main>

      <footer className="global-space-footer new-game-space__footer" aria-label="页面操作">
        <span aria-hidden="true" />
        <button type="button" className="global-space-primary new-game-space__start" disabled={!canStart} onClick={onStart}>开始营造</button>
        <button type="button" className="global-space-secondary new-game-space__back" onClick={onBack}><ChevronLeft size={14} />返回</button>
      </footer>
    </section>
  );
}

function GeneratorGroup({ label, values, value, onChange }: { label: string; values: string[]; value: string; onChange: (value: string) => void }) {
  return (
    <section className="new-game-plan__group">
      <span>{label}</span>
      <div className="new-game-segmented">
        {values.map((item) => <button key={item} type="button" className={item === value ? 'is-active' : ''} onClick={() => onChange(item)}>{item}</button>)}
      </div>
    </section>
  );
}
