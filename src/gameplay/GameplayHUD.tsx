import { Archive, Box, CloudSun, Layers3, Sparkles } from 'lucide-react';
import { ResourceValue } from '../ui/Controls';

export function GameplayHUD() {
  return (
    <div className="hud-group global-hud">
      <div className="resource-strip global-hud__resources">
        <ResourceValue icon={<Archive size={13} />} label="钱粮" value="24,680" />
        <ResourceValue icon={<Sparkles size={13} />} label="人口" value="8,426" />
        <ResourceValue icon={<Box size={13} />} label="木材" value="3,240" />
        <ResourceValue icon={<Layers3 size={13} />} label="石料" value="2,780" />
      </div>
      <i className="global-hud__divider" />
      <div className="global-hud__time">
        <span className="global-hud__weather"><CloudSun size={14} /><small>晴</small></span>
        <span className="global-hud__clock">秋 · 14:30</span>
      </div>
    </div>
  );
}
