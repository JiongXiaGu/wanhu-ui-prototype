import type { CSSProperties } from 'react';
import { Navigation2 } from 'lucide-react';

interface WindCompassProps {
  value: number;
  onChange: (value: number) => void;
}

interface TimeOfDayTrackProps {
  value: number;
  onChange: (value: number) => void;
}

interface SeasonTrackProps {
  value: number;
  onChange: (value: number) => void;
}

const WIND_DIRECTIONS = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];

function snap(value: number, step: number) {
  return Math.round(value / step) * step;
}

export function formatWindDirection(value: number) {
  const normalized = ((value % 360) + 360) % 360;
  const index = Math.round(normalized / 45) % 8;
  return WIND_DIRECTIONS[index];
}

export function WindCompass({ value, onChange }: WindCompassProps) {
  const normalized = ((value % 360) + 360) % 360;

  const setFromPointer = (clientX: number, clientY: number, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const dx = clientX - (rect.left + rect.width / 2);
    const dy = clientY - (rect.top + rect.height / 2);
    const angle = (Math.atan2(dx, -dy) * 180) / Math.PI;
    onChange((snap(angle < 0 ? angle + 360 : angle, 5) + 360) % 360);
  };

  return (
    <div
      className="weather-wind-compass"
      role="slider"
      tabIndex={0}
      aria-label="风向"
      aria-valuemin={0}
      aria-valuemax={360}
      aria-valuenow={Math.round(normalized)}
      aria-valuetext={`${Math.round(normalized)}° ${formatWindDirection(normalized)}`}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        setFromPointer(event.clientX, event.clientY, event.currentTarget);
      }}
      onPointerMove={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          setFromPointer(event.clientX, event.clientY, event.currentTarget);
        }
      }}
      onKeyDown={(event) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        const delta = event.key === 'ArrowRight' ? 5 : -5;
        onChange((normalized + delta + 360) % 360);
      }}
    >
      <span className="weather-wind-compass__cardinal is-north">北</span>
      <span className="weather-wind-compass__cardinal is-east">东</span>
      <span className="weather-wind-compass__cardinal is-south">南</span>
      <span className="weather-wind-compass__cardinal is-west">西</span>
      <span className="weather-wind-compass__ring" />
      <span className="weather-wind-compass__needle" style={{ transform: `translate(-50%, -88%) rotate(${normalized}deg)` }}>
        <Navigation2 />
      </span>
      <span className="weather-wind-compass__center" />
      <strong>{Math.round(normalized)}°</strong>
      <small>{formatWindDirection(normalized)}</small>
    </div>
  );
}

export function TimeOfDayTrack({ value, onChange }: TimeOfDayTrackProps) {
  const position = Math.min(100, Math.max(0, (value / 24) * 100));
  return (
    <div className="weather-visual-row weather-time-control">
      <div className="weather-visual-row__heading"><span>日内时间</span><b>{formatTimeValue(value)}</b></div>
      <div className="weather-time-track" style={{ '--weather-track-position': `${position}%` } as CSSProperties}>
        <div className="weather-time-track__segments" aria-hidden="true">
          <i className="is-night" /><i className="is-dawn" /><i className="is-day" /><i className="is-dusk" />
        </div>
        <div className="weather-time-track__thumb" aria-hidden="true" />
        <input aria-label="日内时间" type="range" min={0} max={24} step={0.25} value={value} onChange={(event) => onChange(Number(event.target.value))} />
      </div>
      <div className="weather-time-track__ticks"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span></div>
    </div>
  );
}

export function SeasonTrack({ value, onChange }: SeasonTrackProps) {
  const position = Math.min(100, Math.max(0, value * 100));
  return (
    <div className="weather-visual-row weather-season-control">
      <div className="weather-visual-row__heading"><span>季节进度</span><b>{value.toFixed(2)}</b></div>
      <div className="weather-season-track" style={{ '--weather-track-position': `${position}%` } as CSSProperties}>
        <div className="weather-season-track__segments" aria-hidden="true">
          <i className="is-spring" /><i className="is-summer" /><i className="is-autumn" /><i className="is-winter" />
        </div>
        <div className="weather-season-track__thumb" aria-hidden="true" />
        <input aria-label="季节进度" type="range" min={0} max={1} step={0.01} value={value} onChange={(event) => onChange(Number(event.target.value))} />
      </div>
      <div className="weather-season-track__labels"><span>春</span><span>夏</span><span>秋</span><span>冬</span></div>
    </div>
  );
}

function formatTimeValue(value: number) {
  const totalMinutes = Math.round(value * 60) % (24 * 60);
  const hours = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
  const minutes = (totalMinutes % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}
