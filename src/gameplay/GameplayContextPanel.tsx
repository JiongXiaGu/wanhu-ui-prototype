import { useRef, useState } from 'react';
import { Camera, Cloud, CloudFog, CloudRain, CloudSnow, CloudSun, Sun } from 'lucide-react';
import type { ContextPanel } from '../app/ui-state';
import { RuntimeParameterRow, SegmentedControl } from '../ui/Controls';
import { LeftContextModeFooter, LeftContextPanel, LeftContextSection } from '../ui/LeftContextPanel';
import { SeasonTrack, TimeOfDayTrack } from './weather-visual-controls';

interface Props {
  panel: Exclude<ContextPanel, 'none'>;
  dayTime: number;
  onDayTimeChange: (value: number) => void;
  onClose: () => void;
}

const CAMERA_PRESETS = {
  '经营': { fov: 60, height: 42, pitch: 38 },
  '规划': { fov: 52, height: 62, pitch: 52 },
  '摄影': { fov: 45, height: 28, pitch: 24 },
} as const;

type CameraMode = keyof typeof CAMERA_PRESETS;
type CameraSettings = { fov: number; height: number; pitch: number };

const CAMERA_DEFAULTS: CameraSettings = { ...CAMERA_PRESETS['经营'] };
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

function cameraSettingsEqual(left: CameraSettings, right: CameraSettings) {
  return Math.abs(left.fov - right.fov) < 0.0001
    && Math.abs(left.height - right.height) < 0.0001
    && Math.abs(left.pitch - right.pitch) < 0.0001;
}

export function GameplayContextPanel({ panel, dayTime, onDayTimeChange, onClose }: Props) {
  const [cameraMode, setCameraMode] = useState<CameraMode>('经营');
  const [weatherMode, setWeatherMode] = useState('场景模拟');
  const [camera, setCamera] = useState<CameraSettings>(CAMERA_DEFAULTS);
  const [weather, setWeather] = useState(WEATHER_DEFAULTS);
  const [weatherPreset, setWeatherPreset] = useState<WeatherPresetId>('cloudy');
  const [weatherPresetDirty, setWeatherPresetDirty] = useState(false);
  const runtimeEnvironment = useRef({ weather: { ...WEATHER_DEFAULTS }, dayTime });
  const isCamera = panel === 'camera';
  const weatherLocked = weatherMode === '跟随世界';
  const HeadingIcon = isCamera ? Camera : CloudSun;
  const environmentModified = !weatherSettingsEqual(weather, runtimeEnvironment.current.weather)
    || Math.abs(dayTime - runtimeEnvironment.current.dayTime) >= 0.0001;
  const cameraModified = cameraMode !== '经营' || !cameraSettingsEqual(camera, CAMERA_DEFAULTS);

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

  const changeCameraMode = (mode: string) => {
    if (!(mode in CAMERA_PRESETS)) return;
    const nextMode = mode as CameraMode;
    setCameraMode(nextMode);
    setCamera({ ...CAMERA_PRESETS[nextMode] });
  };

  const restoreCameraDefaults = () => {
    setCameraMode('经营');
    setCamera({ ...CAMERA_DEFAULTS });
  };

  const footer = isCamera ? (
    <LeftContextModeFooter
      actionLabel="恢复默认"
      actionAriaLabel="恢复默认镜头参数"
      actionTitle={cameraModified ? '恢复经营模式默认镜头参数' : '当前已是默认镜头参数'}
      actionDisabled={!cameraModified}
      actionClassName="camera-reset-button"
      onAction={restoreCameraDefaults}
      modeClassName="camera-mode-switch"
    >
      <SegmentedControl items={Object.keys(CAMERA_PRESETS)} active={cameraMode} onChange={changeCameraMode} />
    </LeftContextModeFooter>
  ) : (
    <LeftContextModeFooter
      actionLabel="恢复当前"
      actionAriaLabel="恢复当前游戏环境"
      actionTitle={weatherLocked ? '跟随世界时由世界系统驱动' : environmentModified ? '恢复到打开环境面板时的游戏状态' : '当前已与游戏环境一致'}
      actionDisabled={weatherLocked || !environmentModified}
      actionClassName="environment-reset-button"
      onAction={restoreRuntimeEnvironment}
      modeClassName="environment-mode-switch"
    >
      <SegmentedControl items={['跟随世界', '场景模拟']} active={weatherMode} onChange={changeEnvironmentMode} />
    </LeftContextModeFooter>
  );

  return (
    <LeftContextPanel
      ariaLabel={isCamera ? '相机面板' : '环境面板'}
      icon={HeadingIcon}
      title={isCamera ? '相机' : '环境'}
      subtitle={isCamera ? '视图与镜头参数' : '天气、风场与时节'}
      className={`gameplay-left-context-surface gameplay-context-panel--${panel}`}
      bodyClassName={!isCamera ? `gameplay-context-panel__body--weather ${weatherLocked ? 'is-world-follow' : 'is-scene-simulation'}` : ''}
      footerClassName="gameplay-context-panel__footer--mode"
      footer={footer}
      onClose={onClose}
      dataAttributes={{
        'data-context-mode': isCamera ? cameraMode : weatherMode,
        'data-weather-preset': isCamera ? undefined : weatherPreset,
        'data-weather-preset-modified': isCamera ? undefined : String(weatherPresetDirty),
        'data-environment-modified': isCamera ? undefined : String(environmentModified),
      }}
    >
      {isCamera ? (
        <LeftContextSection title="镜头参数" className="camera-parameter-section">
          <RuntimeParameterRow label="视野角度" value={camera.fov} min={30} max={90} step={1} format={(value) => `${value.toFixed(0)}°`} onChange={(value) => setCamera((current) => ({ ...current, fov: value }))} />
          <RuntimeParameterRow label="镜头高度" value={camera.height} min={10} max={100} step={1} format={(value) => `${value.toFixed(0)} m`} onChange={(value) => setCamera((current) => ({ ...current, height: value }))} />
          <RuntimeParameterRow label="俯视角度" value={camera.pitch} min={15} max={75} step={1} format={(value) => `${value.toFixed(0)}°`} onChange={(value) => setCamera((current) => ({ ...current, pitch: value }))} />
        </LeftContextSection>
      ) : weatherLocked ? (
        <LeftContextSection title="当前世界环境" className="weather-world-summary" ariaLabel="当前世界环境">
          <div className="weather-world-summary__rows">
            <div><span>天气状态</span><b>{formatWeatherState(weather)}</b></div>
            <div><span>云量</span><b>{weather.cloud.toFixed(0)}%</b></div>
            <div><span>风场</span><b>{weather.windDirection.toFixed(0)}° · {weather.windStrength.toFixed(1)}</b></div>
            <div><span>日内时间</span><b>{formatTime(dayTime)}</b></div>
            <div><span>季节进度</span><b>{Math.round(weather.season * 100)}%</b></div>
          </div>
          <p>当前参数由世界模拟系统驱动。切换到场景模拟后可临时覆盖环境表现。</p>
        </LeftContextSection>
      ) : (
        <>
          <LeftContextSection title="天气预设" className="weather-preset-section" ariaLabel="天气预设">
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
          </LeftContextSection>

          <LeftContextSection title="天气参数">
            <RuntimeParameterRow label="云量" value={weather.cloud} min={0} max={100} step={1} format={(value) => `${value.toFixed(0)}%`} onChange={(value) => updateWeather('cloud', value)} />
            <RuntimeParameterRow label="降水强度" value={weather.precipitation} min={0} max={100} step={1} format={(value) => `${value.toFixed(0)}%`} onChange={(value) => updateWeather('precipitation', value)} />
            <RuntimeParameterRow label="积雪量" value={weather.snow} min={0} max={100} step={1} format={(value) => `${value.toFixed(0)}%`} onChange={(value) => updateWeather('snow', value)} />
            <RuntimeParameterRow label="雾量" value={weather.fog} min={0} max={100} step={1} format={(value) => `${value.toFixed(0)}%`} onChange={(value) => updateWeather('fog', value)} />
          </LeftContextSection>

          <LeftContextSection title="风场" className="weather-wind-section">
            <RuntimeParameterRow label="风向" value={weather.windDirection} min={0} max={360} step={5} format={(value) => `${value.toFixed(0)}°`} onChange={(value) => updateWeather('windDirection', value)} />
            <RuntimeParameterRow label="风力" value={weather.windStrength} min={0} max={5} step={0.1} format={(value) => value.toFixed(1)} onChange={(value) => updateWeather('windStrength', value)} />
            <RuntimeParameterRow label="阵风" value={weather.gust} min={0} max={1} step={0.05} format={(value) => value.toFixed(2)} onChange={(value) => updateWeather('gust', value)} />
          </LeftContextSection>

          <LeftContextSection title="时间与季节" className="weather-time-season-section">
            <TimeOfDayTrack value={dayTime} onChange={onDayTimeChange} />
            <SeasonTrack value={weather.season} onChange={(value) => setWeather((current) => ({ ...current, season: value }))} />
          </LeftContextSection>
        </>
      )}
    </LeftContextPanel>
  );
}
