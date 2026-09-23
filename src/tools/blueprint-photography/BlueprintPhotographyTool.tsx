import { useEffect, useState } from 'react';
import { Camera, Grid3X3, RotateCcw } from '../../ui/icons/runtime-icons.generated';
import { RuntimeParameterRow } from '../../ui/Controls';
import { LeftContextPanel, LeftContextSection } from '../../ui/LeftContextPanel';
import type { MotionPhase } from '../../ui/motion';
import { ToolActionBar, type ToolQuickAction } from '../ToolActionBar';

export interface BlueprintPreviewCapture {
  previewAsset: string;
  previewPosition: string;
  previewSize: string;
}

interface BlueprintPhotographyToolProps {
  sceneAsset: string;
  motionPhase?: MotionPhase;
  onCancel: () => void;
  onCapture: (capture: BlueprintPreviewCapture) => void;
}

type CameraSettings = { fov: number; height: number; pitch: number };

const CAMERA_DEFAULTS: CameraSettings = {
  fov: 45,
  height: 28,
  pitch: 24,
};

export function BlueprintPhotographyTool({
  sceneAsset,
  motionPhase = 'steady',
  onCancel,
  onCapture,
}: BlueprintPhotographyToolProps) {
  const [fov, setFov] = useState(CAMERA_DEFAULTS.fov);
  const [height, setHeight] = useState(CAMERA_DEFAULTS.height);
  const [pitch, setPitch] = useState(CAMERA_DEFAULTS.pitch);
  const [gridVisible, setGridVisible] = useState(false);

  function resetCameraParameters() {
    setFov(CAMERA_DEFAULTS.fov);
    setHeight(CAMERA_DEFAULTS.height);
    setPitch(CAMERA_DEFAULTS.pitch);
  }

  function completePhotography() {
    onCapture({
      previewAsset: sceneAsset,
      previewPosition: '50% 50%',
      previewSize: 'cover',
    });
  }

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === 'Enter') {
        event.preventDefault();
        completePhotography();
      } else if (event.key.toLowerCase() === 'g') {
        event.preventDefault();
        setGridVisible((current) => !current);
      } else if (event.key.toLowerCase() === 'r') {
        event.preventDefault();
        resetCameraParameters();
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [sceneAsset]);

  const quickActions: ToolQuickAction[] = [
    {
      id: 'reset-camera',
      label: '恢复镜头参数',
      shortLabel: '恢复镜头',
      icon: RotateCcw,
      onClick: resetCameraParameters,
    },
    {
      id: 'composition-grid',
      label: gridVisible ? '关闭构图线' : '显示构图线',
      shortLabel: '构图线',
      icon: Grid3X3,
      active: gridVisible,
      pressed: gridVisible,
      onClick: () => setGridVisible((current) => !current),
    },
  ];

  return (
    <section
      className="blueprint-photography"
      aria-label="蓝图摄影模式"
      data-blueprint-photography="active"
      data-blueprint-preview-ratio="4:3"
    >
      <div className="blueprint-photography__wash" aria-hidden="true" />

      <div className="blueprint-photography__canvas" aria-label="蓝图摄影取景示意">
        <div
          className="blueprint-photography__frame"
          role="img"
          aria-label="蓝图 4 比 3 预览取景框"
          style={{ backgroundImage: `url(${sceneAsset})` }}
        >
          {gridVisible && (
            <div className="blueprint-photography__grid" aria-hidden="true">
              <i /><i /><i /><i />
            </div>
          )}
          <span className="blueprint-photography__ratio">4:3</span>
        </div>
      </div>

      <LeftContextPanel
        as="section"
        ariaLabel="蓝图摄影参数"
        icon={Camera}
        title="蓝图摄影"
        subtitle="4:3 预览构图"
        className={`blueprint-photography-context-panel motion-left-surface is-${motionPhase}`}
        bodyClassName="blueprint-photography-context-panel__body"
        showClose={false}
        onClose={onCancel}
        dataAttributes={{ 'data-blueprint-camera-preset': 'photography' }}
      >
        <LeftContextSection title="镜头参数">
          <RuntimeParameterRow label="视野角度" value={fov} min={30} max={90} step={1} format={(value) => `${value.toFixed(0)}°`} onChange={setFov} />
          <RuntimeParameterRow label="镜头高度" value={height} min={10} max={100} step={1} format={(value) => `${value.toFixed(0)} m`} onChange={setHeight} />
          <RuntimeParameterRow label="俯视角度" value={pitch} min={15} max={75} step={1} format={(value) => `${value.toFixed(0)}°`} onChange={setPitch} />
        </LeftContextSection>
        <LeftContextSection title="预览规格">
          <dl className="blueprint-photography__spec">
            <div><dt>画幅比例</dt><dd>4:3</dd></div>
            <div><dt>1080p 取景框</dt><dd>最大 900 × 675</dd></div>
            <div><dt>屏幕安全距离</dt><dd>上下 ≥ 96 px</dd></div>
          </dl>
          <p className="blueprint-photography__prototype-note">Web 仅验证面板、取景比例与安全距离；镜头运动和真实截图由 Unity 实现。</p>
        </LeftContextSection>
      </LeftContextPanel>

      <div
        className={`tool-bottom-cluster blueprint-photography-toolbar-cluster motion-bottom-surface is-${motionPhase}`}
        aria-label="蓝图摄影主控栏"
        aria-busy={motionPhase !== 'steady'}
      >
        <ToolActionBar
          ariaLabel="蓝图摄影操作栏"
          modeGroups={[]}
          quickActions={quickActions}
          quickActionPresentation="icon-label"
          completeLabel="完成摄影"
          completeShortLabel="完成"
          completeKind="commit"
          cancelLabel="取消摄影"
          cancelShortLabel="取消"
          commitGroupLabel="蓝图摄影任务"
          showCancel
          onComplete={completePhotography}
          onCancel={onCancel}
        />
      </div>
    </section>
  );
}
