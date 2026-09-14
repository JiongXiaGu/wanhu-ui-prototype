import { RotateCcw, X } from 'lucide-react';
import type { Flyout } from '../app/ui-state';
import { ParameterRow, SegmentedControl } from '../ui/Controls';

interface Props {
  flyout: Exclude<Flyout, 'none'>;
  onClose: () => void;
}

export function RightEdgeFlyout({ flyout, onClose }: Props) {
  return (
    <aside className="flyout">
      <header><b>{flyout === 'camera' ? '相机' : '天气'}</b><button className="icon-button" onClick={onClose} aria-label="关闭面板"><X /></button></header>
      {flyout === 'camera' ? (
        <div className="flyout-body">
          <h3>视图模式</h3>
          <SegmentedControl items={['经营', '规划', '摄影']} active="经营" />
          <p>经营模式适合日常建造与世界浏览。</p>
          <h3>镜头</h3>
          <ParameterRow label="视野角度" value="60" pct={52} />
          <button className="reset-button"><RotateCcw size={13} />恢复默认</button>
        </div>
      ) : (
        <div className="flyout-body">
          <SegmentedControl items={['跟随世界', '场景模拟']} active="场景模拟" />
          <p>场景模拟设置随存档保存。</p>
          <h3>天气</h3>
          <ParameterRow label="云量" value="42%" pct={42} />
          <ParameterRow label="积雪量" value="0%" pct={0} />
          <h3>风场</h3>
          <ParameterRow label="风向" value="135°" pct={38} />
          <ParameterRow label="风力" value="1.2" pct={28} />
          <ParameterRow label="阵风" value="0.35" pct={35} />
          <h3>天象与历法</h3>
          <ParameterRow label="日内时间" value="14:30" pct={61} />
          <ParameterRow label="季节进度" value="0.48" pct={48} />
        </div>
      )}
    </aside>
  );
}
