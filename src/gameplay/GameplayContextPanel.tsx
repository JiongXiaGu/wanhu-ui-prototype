import { useState } from 'react';
import { Camera, CloudSun, RotateCcw, X } from 'lucide-react';
import type { ContextPanel } from '../app/ui-state';
import { RuntimeParameterRow, SegmentedControl } from '../ui/Controls';

interface Props {
  panel: Exclude<ContextPanel, 'none'>;
  onClose: () => void;
}

const CAMERA_DEFAULTS = { fov: 60, height: 42, pitch: 38 };
const WEATHER_DEFAULTS = { cloud: 42, snow: 0, windDirection: 135, windStrength: 1.2, gust: 0.35, dayTime: 14.5, season: 0.48 };

function formatTime(value: number) {
  const totalMinutes = Math.round(value * 60) % (24 * 60);
  const hours = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
  const minutes = (totalMinutes % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function GameplayContextPanel({ panel, onClose }: Props) {
  const [cameraMode, setCameraMode] = useState('经营');
  const [weatherMode, setWeatherMode] = useState('场景模拟');
  const [camera, setCamera] = useState(CAMERA_DEFAULTS);
  const [weather, setWeather] = useState(WEATHER_DEFAULTS);
  const isCamera = panel === 'camera';
  const weatherLocked = weatherMode === '跟随世界';
  const HeadingIcon = isCamera ? Camera : CloudSun;

  return (
    <aside
      className={`gameplay-left-context-surface gameplay-context-panel gameplay-context-panel--${panel}`}
      aria-label={isCamera ? '相机面板' : '天气面板'}
    >
      <header>
        <div className="gameplay-context-panel__heading">
          <span className="gameplay-context-panel__heading-icon"><HeadingIcon /></span>
          <b className="gameplay-context-panel__title">{isCamera ? '相机' : '天气'}</b>
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
        <div className="gameplay-context-panel__body">
          <section className="gameplay-context-panel__section" title="跟随世界使用模拟天气；场景模拟允许手动覆盖天气参数。">
            <div className="gameplay-context-panel__section-title"><b>环境模式</b></div>
            <SegmentedControl items={['跟随世界', '场景模拟']} active={weatherMode} onChange={setWeatherMode} />
          </section>

          <section className="gameplay-context-panel__section">
            <div className="gameplay-context-panel__section-title"><b>天气</b></div>
            <RuntimeParameterRow label="云量" value={weather.cloud} min={0} max={100} step={1} disabled={weatherLocked} format={(value) => `${value.toFixed(0)}%`} onChange={(value) => setWeather((current) => ({ ...current, cloud: value }))} />
            <RuntimeParameterRow label="积雪量" value={weather.snow} min={0} max={100} step={1} disabled={weatherLocked} format={(value) => `${value.toFixed(0)}%`} onChange={(value) => setWeather((current) => ({ ...current, snow: value }))} />
          </section>

          <section className="gameplay-context-panel__section">
            <div className="gameplay-context-panel__section-title"><b>风场</b></div>
            <RuntimeParameterRow label="风向" value={weather.windDirection} min={0} max={360} step={5} disabled={weatherLocked} format={(value) => `${value.toFixed(0)}°`} onChange={(value) => setWeather((current) => ({ ...current, windDirection: value }))} />
            <RuntimeParameterRow label="风力" value={weather.windStrength} min={0} max={5} step={0.1} disabled={weatherLocked} format={(value) => value.toFixed(1)} onChange={(value) => setWeather((current) => ({ ...current, windStrength: value }))} />
            <RuntimeParameterRow label="阵风" value={weather.gust} min={0} max={1} step={0.05} disabled={weatherLocked} format={(value) => value.toFixed(2)} onChange={(value) => setWeather((current) => ({ ...current, gust: value }))} />
          </section>

          <section className="gameplay-context-panel__section">
            <div className="gameplay-context-panel__section-title"><b>时间与季节</b></div>
            <RuntimeParameterRow label="日内时间" value={weather.dayTime} min={0} max={24} step={0.25} disabled={weatherLocked} format={formatTime} onChange={(value) => setWeather((current) => ({ ...current, dayTime: value }))} />
            <RuntimeParameterRow label="季节进度" value={weather.season} min={0} max={1} step={0.01} disabled={weatherLocked} format={(value) => value.toFixed(2)} onChange={(value) => setWeather((current) => ({ ...current, season: value }))} />
          </section>
        </div>
      )}
    </aside>
  );
}
