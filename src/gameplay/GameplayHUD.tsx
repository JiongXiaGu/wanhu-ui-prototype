import { Archive, Box, Layers3, Sparkles } from 'lucide-react';
import { ResourceValue } from '../ui/Controls';

export function GameplayHUD() {
  return (
    <div className="hud-group">
      <div className="city-status">
        <div><span>昭平城</span><b>第十二年 · 秋</b></div>
        <small>晴 · 14:30</small>
      </div>
      <div className="resource-strip">
        <ResourceValue icon={<Archive size={12} />} label="钱粮" value="24,680" />
        <ResourceValue icon={<Sparkles size={12} />} label="人口" value="8,426" />
        <ResourceValue icon={<Box size={12} />} label="木材" value="3,240" />
        <ResourceValue icon={<Layers3 size={12} />} label="石料" value="2,780" />
      </div>
    </div>
  );
}
