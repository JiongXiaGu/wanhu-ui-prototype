import { useState } from 'react';
import { Camera, CloudSun, RotateCcw, X } from 'lucide-react';
import type { Flyout } from '../app/ui-state';
import { ParameterRow, SegmentedControl } from '../ui/Controls';

interface Props {
  flyout: Exclude<Flyout, 'none'>;
  onClose: () => void;
}

export function RightEdgeFlyout({ flyout, onClose }: Props) {
  const [cameraMode, setCameraMode] = useState('经营');
  const [weatherMode, setWeatherMode] = useState('场景模拟');
  const isCamera = flyout === 'camera';
  const HeadingIcon = isCamera ? Camera : CloudSun;

  return (
    <aside className={`flyout right-edge-flyout right-edge-flyout--${flyout}`}>
      <header>
        <div className="right-edge-flyout__heading">
          <span className="right-edge-flyout__heading-icon"><HeadingIcon /></span>
          <b className="right-edge-flyout__title">{isCamera ? '相机' : '天气'}</b>
        </div>
        <button className="icon-button" onClick={onClose} aria-label="关闭面板"><X /></button>
      </header>

      {isCamera ? (
        <div className="right-edge-flyout__body">
          <section className="right-edge-flyout__section" title="切换适合经营、规划或截图的镜头预设。">
            <div className="right-edge-flyout__section-title"><b>视图模式</b></div>
            <SegmentedControl items={['经营', '规划', '摄影']} active={cameraMode} onChange={setCameraMode} />
          </section>

          <section className="right-edge-flyout__section">
            <div className="right-edge-flyout__section-title"><b>镜头参数</b></div>
            <ParameterRow label="视野角度" value="60°" pct={52} />
            <ParameterRow label="镜头高度" value="42 m" pct={46} />
            <ParameterRow label="俯视角度" value="38°" pct={40} />
          </section>

          <div className="right-edge-flyout__action-row">
            <button className="reset-button"><RotateCcw size={13} />恢复默认</button>
          </div>
        </div>
      ) : (
        <div className="right-edge-flyout__body">
          <div className="right-edge-flyout__status">晴 · 14:30</div>

          <section className="right-edge-flyout__section" title="跟随世界使用模拟天气；场景模拟允许手动覆盖天气参数。">
            <div className="right-edge-flyout__section-title"><b>环境模式</b></div>
            <SegmentedControl items={['跟随世界', '场景模拟']} active={weatherMode} onChange={setWeatherMode} />
          </section>

          <section className="right-edge-flyout__section">
            <div className="right-edge-flyout__section-title"><b>天气</b></div>
            <ParameterRow label="云量" value="42%" pct={42} />
            <ParameterRow label="积雪量" value="0%" pct={0} />
          </section>

          <section className="right-edge-flyout__section">
            <div className="right-edge-flyout__section-title"><b>风场</b></div>
            <ParameterRow label="风向" value="135°" pct={38} />
            <ParameterRow label="风力" value="1.2" pct={28} />
            <ParameterRow label="阵风" value="0.35" pct={35} />
          </section>

          <section className="right-edge-flyout__section">
            <div className="right-edge-flyout__section-title"><b>时间与季节</b></div>
            <ParameterRow label="日内时间" value="14:30" pct={61} />
            <ParameterRow label="季节进度" value="0.48" pct={48} />
          </section>
        </div>
      )}
    </aside>
  );
}
