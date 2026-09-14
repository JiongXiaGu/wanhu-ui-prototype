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
          <div className="right-edge-flyout__title">
            <small>{isCamera ? 'CAMERA CONTROL' : 'ENVIRONMENT CONTROL'}</small>
            <div>
              <b>{isCamera ? '相机' : '天气'}</b>
              <span>{isCamera ? '经营视角与镜头参数' : '场景天气、风场与历法'}</span>
            </div>
          </div>
        </div>
        <button className="icon-button" onClick={onClose} aria-label="关闭面板"><X /></button>
      </header>

      {isCamera ? (
        <div className="right-edge-flyout__body">
          <div className="right-edge-flyout__summary">
            <div className="right-edge-flyout__summary-copy">
              <b>当前视图</b>
              <span>日常营造与城市浏览</span>
            </div>
            <strong className="right-edge-flyout__summary-value">{cameraMode}</strong>
          </div>

          <section className="right-edge-flyout__section">
            <div className="right-edge-flyout__section-title"><b>视图模式</b><span>VIEW PRESET</span></div>
            <SegmentedControl items={['经营', '规划', '摄影']} active={cameraMode} onChange={setCameraMode} />
            <div className="right-edge-flyout__mode-note">
              <b>{cameraMode}模式</b>
              <span>{cameraMode === '经营' ? '适合日常建造、居民观察与城市浏览。' : cameraMode === '规划' ? '强调道路、地块与空间关系，便于规划施工。' : '减少操作干扰，保留更纯净的城市画面。'}</span>
            </div>
          </section>

          <section className="right-edge-flyout__section">
            <div className="right-edge-flyout__section-title"><b>镜头参数</b><span>LENS</span></div>
            <ParameterRow label="视野角度" value="60°" pct={52} />
            <ParameterRow label="镜头高度" value="42 m" pct={46} />
            <ParameterRow label="俯视角度" value="38°" pct={40} />
          </section>

          <div className="right-edge-flyout__action-row">
            <button className="reset-button"><RotateCcw size={13} />恢复默认镜头</button>
          </div>
        </div>
      ) : (
        <div className="right-edge-flyout__body">
          <div className="right-edge-flyout__summary">
            <div className="right-edge-flyout__summary-copy">
              <b>当前环境</b>
              <span>昭平城 · 第十二年秋</span>
            </div>
            <strong className="right-edge-flyout__summary-value">晴 · 14:30</strong>
          </div>

          <section className="right-edge-flyout__section">
            <div className="right-edge-flyout__section-title"><b>环境模式</b><span>SIMULATION</span></div>
            <SegmentedControl items={['跟随世界', '场景模拟']} active={weatherMode} onChange={setWeatherMode} />
            <div className="right-edge-flyout__mode-note">
              <b>{weatherMode}</b>
              <span>{weatherMode === '场景模拟' ? '当前调整随存档保存，用于场景与画面控制。' : '天气由世界模拟推进，不使用本面板的手动覆盖值。'}</span>
            </div>
          </section>

          <section className="right-edge-flyout__section">
            <div className="right-edge-flyout__section-title"><b>天气</b><span>WEATHER</span></div>
            <ParameterRow label="云量" value="42%" pct={42} />
            <ParameterRow label="积雪量" value="0%" pct={0} />
          </section>

          <section className="right-edge-flyout__section">
            <div className="right-edge-flyout__section-title"><b>风场</b><span>WIND</span></div>
            <ParameterRow label="风向" value="135°" pct={38} />
            <ParameterRow label="风力" value="1.2" pct={28} />
            <ParameterRow label="阵风" value="0.35" pct={35} />
          </section>

          <section className="right-edge-flyout__section">
            <div className="right-edge-flyout__section-title"><b>天象与历法</b><span>TIME & SEASON</span></div>
            <ParameterRow label="日内时间" value="14:30" pct={61} />
            <ParameterRow label="季节进度" value="0.48" pct={48} />
          </section>
        </div>
      )}
    </aside>
  );
}
