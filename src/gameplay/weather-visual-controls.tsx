import type { CSSProperties } from 'react';

interface TimeOfDayTrackProps {
  value: number;
  onChange: (value: number) => void;
}

interface SeasonTrackProps {
  value: number;
  onChange: (value: number) => void;
}

export function TimeOfDayTrack({ value, onChange }: TimeOfDayTrackProps) {
  const position = Math.min(100, Math.max(0, (value / 24) * 100));
  return (
    <div className="weather-visual-row weather-time-control">
      <div className="weather-visual-row__heading"><span>日内时间</span><b>{formatTimeValue(value)}</b></div>
      <div className="weather-time-track" style={{ '--weather-track-position': `${position}%` } as CSSProperties}>
        <div className="weather-time-track__segments" aria-hidden="true" />
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
        <div className="weather-season-track__segments" aria-hidden="true" />
        <div className="weather-season-track__labels" aria-hidden="true">
          <span>春</span><span>夏</span><span>秋</span><span>冬</span>
        </div>
        <div className="weather-season-track__thumb" aria-hidden="true" />
        <input aria-label="季节进度" type="range" min={0} max={1} step={0.01} value={value} onChange={(event) => onChange(Number(event.target.value))} />
      </div>
    </div>
  );
}

function formatTimeValue(value: number) {
  const totalMinutes = Math.round(value * 60) % (24 * 60);
  const hours = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
  const minutes = (totalMinutes % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}
