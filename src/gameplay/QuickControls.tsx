import { Camera, CloudSun, Menu as MenuIcon, Pause } from 'lucide-react';
import type { Flyout, Speed } from '../app/ui-state';

interface QuickControlsProps {
  flyout: Flyout;
  speed: Speed;
  onFlyoutChange: (flyout: Flyout) => void;
  onSpeedChange: (speed: Speed) => void;
  onPause: () => void;
}

export function QuickControls({ flyout, speed, onFlyoutChange, onSpeedChange, onPause }: QuickControlsProps) {
  return (
    <div className="quick-controls">
      <button className={flyout === 'camera' ? 'is-active' : ''} onClick={() => onFlyoutChange(flyout === 'camera' ? 'none' : 'camera')}>
        <Camera size={15} />相机
      </button>
      <button className={flyout === 'weather' ? 'is-active' : ''} onClick={() => onFlyoutChange(flyout === 'weather' ? 'none' : 'weather')}>
        <CloudSun size={15} />天气
      </button>
      <i />
      <button className="speed" aria-label="暂停时间"><Pause size={13} /></button>
      {([1, 2, 4] as Speed[]).map((value) => (
        <button key={value} className={`speed ${speed === value ? 'is-active' : ''}`} onClick={() => onSpeedChange(value)}>×{value}</button>
      ))}
      <i />
      <button onClick={onPause}><MenuIcon size={15} />菜单</button>
    </div>
  );
}
