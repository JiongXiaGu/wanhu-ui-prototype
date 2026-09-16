import { useRef, useState } from 'react';
import { Camera, Cloud, CloudFog, CloudRain, CloudSnow, CloudSun, RotateCcw, Sun, X } from 'lucide-react';
import type { ContextPanel } from '../app/ui-state';
import { RuntimeParameterRow, SegmentedControl } from '../ui/Controls';
import { SeasonTrack, TimeOfDayTrack } from './weather-visual-controls';

interface Props {
  panel: Exclude<ContextPanel, 'none'>;
  dayTime: number;
  onDayTimeChange: (value: number) => void;
  onClose: () => void;
}

const CAMERA_DEFAULTS = { fov: 60, height: 42, pitch: 38 };
const WEATHER_DEFAULTS = {
  cloud: 42,
  precipitation: 0,
  snow: 0,
  fog: 4,
  windDirection: 135,
  windStrength: 1.2,
  gust: 0.35,
  season: 0.48,
};

const WEATHER_PRESETS = [
  {
    id: 'clear',
    label: '晴天',
    icon: Sun,
    settings: { cloud: 12, precipitation: 0, snow: 0, fog: 0, windDirection: 120, windStrength: 0.8, gust: 0.12 },
  },
  {
    id: 'cloudy',
    label: '多云',
    icon: CloudSun,
    settings: { cloud: 42, precipitation: 0, snow: 0, fog: 4, windDirection: 135, windStrength: 1.2, gust: 0.35 },
  },
  {
    id: 'overcast',
    label: '阴天',
    icon: Cloud,
    settings: { cloud: 78, precipitation: 0, snow: 0, fog: 12, windDirection: 150, windStrength: 1.0, gust: 0.28 },
  },
  {
    id: 'light-rain',
    label: '小雨',
    icon: CloudRain,
    settings: { cloud: 76, precipitation: 35, snow: 0, fog: 16, windDirection: 150, windStrength: 1.5, gust: 0.42 },
  },
  {
    id: 'heavy-rain',
    label: '大雨',
    icon: CloudRain,
    settings: { cloud: 94, precipitation: 78, snow: 0, fog: 22, windDirection: 165, windStrength: 2.0, gust: 0.65 },
  },
  {
    id: 'snow',
    label: '雪天',
    icon: CloudSnow,
    settings: { cloud: 88, precipitation: 20, snow: 72, fog: 12, windDirection: 140, windStrength: 1.3, gust: 0.30 },
  },
  {
    id: 'fog',
    label: '雾天',
    icon: CloudFog,
    settings: { cloud: 56, precipitation: 0, snow: 0, fog: 82, windDirection: 110, windStrength: 0.55, gust: 0.10 },
  },
] as const;

type WeatherPresetId = (typeof WEATHER_PRESETS)[number]['id'];
type WeatherSettings = typeof WEATHER_DEFAULTS;

function formatTime(value: number) {
  const totalMinutes = Math.round(value * 60) % (24 * 60);
  const hours = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
  const minutes = (totalMinutes % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

function formatWeatherState(weather: typeof WEATHER_DEFAULTS) {
  if (weather.fog >= 55) return '雾天';
  if (weather.snow >= 35) return '雪天';
  if (weather.precipitation >= 60) return '大雨';
  if (weather.precipitation >= 15) return '小雨';
  if (weather.cloud >= 72) return '阴天';
  if (weather.cloud >= 28) return '多云';
  return '晴天';
}

function weatherSettingsEqual(left: WeatherSettings, right: WeatherSettings) {
  return (Object.keys(WEATHER_DEFAULTS) as Array<keyof WeatherSettings>)
    .every((key) => Math.abs(left[key] - right[key]) < 0.0001);
}

export function GameplayContextPanel({ panel, dayTime, onDayTimeChange, onClose }: Props) {
  const [cameraMode, setCameraMode] = useState('经营');
  const [weatherMode, setWeatherMode] = useState('场景模拟');
  const [camera, setCamera] = useState(CAMERA_DEFAULTS);
  const [weather, setWeather] = useState(WEATHER_DEFAULTS);
  const [weatherPreset, setWeatherPreset] = useState<WeatherPresetId>('cloudy');
  const [weatherPresetDirty, setWeatherPresetDirty] = useState(false);
  const runtimeEnvironment = useRef({ weather: { ...WEATHER_DEFAULTS }, dayTime });
  const isCamera = panel === 'camera';
  const weatherLocked = weatherMode === '跟随世界';
  const HeadingIcon = isCamera ? Camera : CloudSun;
  const environmentModified = !weatherSettingsEqual(weather, runtimeEnvironment.current.weather)
    || Math.abs(dayTime - runtimeEnvironment.current.dayTime) >= 0.0001;

  const updateWeather = (key: keyof typeof WEATHER_DEFAULTS, value: number) => {
    setWeather((current) => ({ ...current, [key]: value }));
    if (key !== 'season') setWeatherPresetDirty(true);
  };

  const applyWeatherPreset = (presetId: WeatherPresetId) => {
    const preset = WEATHER_PRESETS.find((item) => item.id === presetId);
    if (!preset) return;
    setWeather((current) => ({ ...current, ...preset.settings }));
    setWeatherPreset(presetId);
    setWeatherPresetDirty(false);
  };

  const restoreRuntimeEnvironment = () => {
    setWeather({ ...runtimeEnvironment.current.weather });
    onDayTimeChange(runtimeEnvironment.current.dayTime);
    setWeatherPreset('cloudy');
    setWeatherPresetDirty(false);
  };

  const changeEnvironmentMode = (mode: string) => {
    if (mode === '跟随世界') restoreRuntimeEnvironment();
    setWeatherMode(mode);
  };

  return (
    <aside
      className={`gameplay-left-context-surface gameplay-context-panel gameplay-context-panel--${panel}`}
      aria-label={isCamera ? '相机面板' : '环境面板'}
      data-context-mode={isCamera ? cameraMode : weatherMode}
      data-weather-preset={isCamera ? undefined : weatherPreset}
      data-weather-preset-modified={isCamera ? undefined : String(weatherPresetDirty)}
      data-environment-modified={isCamera ? undefined : String(environmentModified)}
    >
      <header>
        <div className="gameplay-context-panel__heading">
          <span className="gameplay-context-panel__heading-icon"><HeadingIcon /></span>
          <div className="gameplay-context-panel__heading-copy">
            <b className="gameplay-context-panel__title">{isCamera ? '相机' : '环境'}</b>
            {!isCamera && <span>天气、风场与时节</span>}
          </div>
        </div>
        <button className="icon-button" onClick={onClose} aria-label="关闭面板"><X /></button>
      </header>

      {isCamera ? (
        <div className="gameplay-context-panel__body">
          <section className="gameplay-context-panel__section" title="切换适合经营、规划或截图的镜头预设。">
            <div className="gameplay-context-panel__section-title"><b>视图模式</b></div>
            <SegmentedControl items={['经营', '规划', '摄影']} active={cameraMode} onChange={setCameraMode} />
          </section>

          <section className="gameplay-context-panel__section">
            <div className="gameplay-context-panel__section-title gameplay-context-panel__section-title--action">
              <b>镜头参数</b>
              <i />
              <button type="button" className="gameplay-context-panel__inline-action" onClick={() => setCamera(CAMERA_DEFAULTS)}><RotateCcw size={12} />恢复默认</button>
            </div>
            <RuntimeParameterRow label="视野角度" value={camera.fov} min={30} max={90} step={1} format={(value) => `${value.toFixed(0)}°`} onChange={(value) => setCamera((current) => ({ ...current, fov: value }))} />
            <RuntimeParameterRow label="镜头高度" value={camera.height} min={10} max={100} step={1} format={(value) => `${value.toFixed(0)} m`} onChange={(value) => setCamera((current) => ({ ...current, height: value }))} />
            <RuntimeParameterRow label="俯视角度" value={camera.pitch} min={15} max={75} step={1} format={(value) => `${value.toFixed(0)}°`} onChange={(value) => setCamera((current) => ({ ...current, pitch: value }))} />
          </section>
        </div>
      ) : (
        <>
          <div className={`gameplay-context-panel__body gameplay-context-panel__body--weather ${weatherLocked ? 'is-world-follow' : 'is-scene-simulation'}`}>
            {weatherLocked ? (
              <section className="gameplay-context-panel__section weather-world-summary" aria-label="当前世界环境">
                <div className="gameplay-context-panel__section-title"><b>当前世界环境</b></div>
                <div className="weather-world-summary__rows">
                  <div><span>天气状态</span><b>{formatWeatherState(weather)}</b></div>
                  <div><span>云量</span><b>{weather.cloud.toFixed(0)}%</b></div>
                  <div><span>风场</span><b>{weather.windDirection.toFixed(0)}° · {weather.windStrength.toFixed(1)}</b></div>
                  <div><span>日内时间</span><b>{formatTime(dayTime)}</b></div>
                  <div><span>季节进度</span><b>{Math.round(weather.season * 100)}%</b></div>
                </div>
                <p>当前参数由世界模拟系统驱动。切换到场景模拟后可临时覆盖环境表现。</p>
              </section>
            ) : (
              <>
                <section className="gameplay-context-panel__section weather-preset-section" aria-label="天气预设">
                  <div className="weather-preset-section__heading"><b>天气预设</b></div>
                  <div className="weather-preset-grid">
                    {WEATHER_PRESETS.map((preset) => {
                      const PresetIcon = preset.icon;
                      const isActive = preset.id === weatherPreset;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          className={`weather-preset-card ${isActive ? 'is-active' : ''}`}
                          data-preset-id={preset.id}
                          aria-label={`${preset.label}天气预设`}
                          aria-pressed={isActive}
                          onClick={() => applyWeatherPreset(preset.id)}
                        >
                          <PresetIcon className="weather-preset-card__icon" />
                          <span>{preset.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section className="gameplay-context-panel__section">
                  <div className="gameplay-context-panel__section-title"><b>天气参数</b></div>
                  <RuntimeParameterRow label="云量" value={weather.cloud} min={0} max={100} step={1} format={(value) => `${value.toFixed(0)}%`} onChange={(value) => updateWeather('cloud', value)} />
                  <RuntimeParameterRow label="降水强度" value={weather.precipitation} min={0} max={100} step={1} format={(value) => `${value.toFixed(0)}%`} onChange={(value) => updateWeather('precipitation', value)} />
                  <RuntimeParameterRow label="积雪量" value={weather.snow} min={0} max={100} step={1} format={(value) => `${value.toFixed(0)}%`} onChange={(value) => updateWeather('snow', value)} />
                  <RuntimeParameterRow label="雾量" value={weather.fog} min={0} max={100} step={1} format={(value) => `${value.toFixed(0)}%`} onChange={(value) => updateWeather('fog', value)} />
                </section>

                <section className="gameplay-context-panel__section weather-wind-section">
                  <div className="gameplay-context-panel__section-title"><b>风场</b></div>
                  <RuntimeParameterRow label="风向" value={weather.windDirection} min={0} max={360} step={5} format={(value) => `${value.toFixed(0)}°`} onChange={(value) => updateWeather('windDirection', value)} />
                  <RuntimeParameterRow label="风力" value={weather.windStrength} min={0} max={5} step={0.1} format={(value) => value.toFixed(1)} onChange={(value) => updateWeather('windStrength', value)} />
                  <RuntimeParameterRow label="阵风" value={weather.gust} min={0} max={1} step={0.05} format={(value) => value.toFixed(2)} onChange={(value) => updateWeather('gust', value)} />
                </section>

                <section className="gameplay-context-panel__section weather-time-season-section">
                  <div className="gameplay-context-panel__section-title"><b>时间与季节</b></div>
                  <TimeOfDayTrack value={dayTime} onChange={onDayTimeChange} />
                  <SeasonTrack value={weather.season} onChange={(value) => setWeather((current) => ({ ...current, season: value }))} />
                </section>
              </>
            )}
          </div>

          <footer className="gameplay-context-panel__footer gameplay-context-panel__footer--weather-mode" aria-label="环境模式">
            <button
              type="button"
              className="environment-reset-button"
              disabled={weatherLocked || !environmentModified}
              aria-label="恢复当前游戏环境"
              title={weatherLocked ? '跟随世界时由世界系统驱动' : environmentModified ? '恢复到打开环境面板时的游戏状态' : '当前已与游戏环境一致'}
              onClick={restoreRuntimeEnvironment}
            >
              <RotateCcw />
              <span>恢复当前</span>
            </button>
            <div className="environment-mode-switch">
              <SegmentedControl items={['跟随世界', '场景模拟']} active={weatherMode} onChange={changeEnvironmentMode} />
            </div>
          </footer>
        </>
      )}
    </aside>
  );
}
