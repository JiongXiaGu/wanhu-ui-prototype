import { useState } from 'react';
import { Camera, CloudSun, RotateCcw, X } from 'lucide-react';
import type { ContextPanel } from '../app/ui-state';
import { RuntimeParameterRow, SegmentedControl } from '../ui/Controls';

interface Props {
  panel: Exclude<ContextPanel, 'none'>;
  dayTime: number;
  onDayTimeChange: (value: number) => void;
  onClose: () => void;
}

const CAMERA_DEFAULTS = { fov: 60, height: 42, pitch: 38 };
const WEATHER_DEFAULTS = { cloud: 42, snow: 0, windDirection: 135, windStrength: 1.2, gust: 0.35, season: 0.48 };

function formatTime(value: number) {
  const totalMinutes = Math.round(value * 60) % (24 * 60);
  const hours = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
  const minutes = (totalMinutes % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

function formatWeatherState(cloud: number) {
  if (cloud >= 72) return '阴';
  if (cloud >= 28) return '晴间多云';
  return '晴';
}

export function GameplayContextPanel({ panel, dayTime, onDayTimeChange, onClose }: Props) {
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
      data-context-mode={isCamera ? cameraMode : weatherMode}
    >
      <header>
        <div className="gameplay-context-panel__heading">
          <span className="gameplay-context-panel__heading-icon"><HeadingIcon /></span>
          <div className="gameplay-context-panel__heading-copy">
            <b className="gameplay-context-panel__title">{isCamera ? '相机' : '天气'}</b>
            {!isCamera && <span>场景环境</span>}
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
              <section className="gameplay-context-panel__section weather-world-summary" aria-label="当前世界天气">
                <div className="gameplay-context-panel__section-title"><b>当前世界天气</b></div>
                <div className="weather-world-summary__rows">
                  <div><span>天气状态</span><b>{formatWeatherState(weather.cloud)}</b></div>
                  <div><span>云量</span><b>{weather.cloud.toFixed(0)}%</b></div>
                  <div><span>风场</span><b>{weather.windDirection.toFixed(0)}° · {weather.windStrength.toFixed(1)}</b></div>
                  <div><span>日内时间</span><b>{formatTime(dayTime)}</b></div>
                  <div><span>季节进度</span><b>{Math.round(weather.season * 100)}%</b></div>
                </div>
                <p>当前参数由世界模拟系统驱动。切换到场景模拟后可临时覆盖环境表现。</p>
              </section>
            ) : (
              <>
                <section className="gameplay-context-panel__section">
                  <div className="gameplay-context-panel__section-title"><b>天气</b></div>
                  <RuntimeParameterRow label="云量" value={weather.cloud} min={0} max={100} step={1} format={(value) => `${value.toFixed(0)}%`} onChange={(value) => setWeather((current) => ({ ...current, cloud: value }))} />
                  <RuntimeParameterRow label="积雪量" value={weather.snow} min={0} max={100} step={1} format={(value) => `${value.toFixed(0)}%`} onChange={(value) => setWeather((current) => ({ ...current, snow: value }))} />
                </section>

                <section className="gameplay-context-panel__section">
                  <div className="gameplay-context-panel__section-title"><b>风场</b></div>
                  <RuntimeParameterRow label="风向" value={weather.windDirection} min={0} max={360} step={5} format={(value) => `${value.toFixed(0)}°`} onChange={(value) => setWeather((current) => ({ ...current, windDirection: value }))} />
                  <RuntimeParameterRow label="风力" value={weather.windStrength} min={0} max={5} step={0.1} format={(value) => value.toFixed(1)} onChange={(value) => setWeather((current) => ({ ...current, windStrength: value }))} />
                  <RuntimeParameterRow label="阵风" value={weather.gust} min={0} max={1} step={0.05} format={(value) => value.toFixed(2)} onChange={(value) => setWeather((current) => ({ ...current, gust: value }))} />
                </section>

                <section className="gameplay-context-panel__section">
                  <div className="gameplay-context-panel__section-title"><b>时间与季节</b></div>
                  <RuntimeParameterRow label="日内时间" value={dayTime} min={0} max={24} step={0.25} format={formatTime} onChange={onDayTimeChange} />
                  <RuntimeParameterRow label="季节进度" value={weather.season} min={0} max={1} step={0.01} format={(value) => value.toFixed(2)} onChange={(value) => setWeather((current) => ({ ...current, season: value }))} />
                </section>
              </>
            )}
          </div>

          <footer className="gameplay-context-panel__footer gameplay-context-panel__footer--weather-mode" aria-label="环境模式">
            <SegmentedControl items={['跟随世界', '场景模拟']} active={weatherMode} onChange={setWeatherMode} />
          </footer>
        </>
      )}
    </aside>
  );
}
