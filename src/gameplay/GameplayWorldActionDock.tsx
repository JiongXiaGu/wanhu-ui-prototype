import type { ContextPanel } from '../app/ui-state';
import type { MotionPhase } from '../ui/motion';
import {
  Camera,
  CloudSun,
  DoorOpen,
  Mountain,
  Palette,
  ScanLine,
} from '../ui/icons/runtime-icons.generated';

export type WorldActionDockId = 'unlock' | 'region' | 'terrain' | 'palette';

interface Props {
  contextPanel: ContextPanel;
  motionPhase?: MotionPhase;
  onContextPanelChange: (panel: ContextPanel) => void;
  onWorldAction: (id: WorldActionDockId) => void;
}

export function GameplayWorldActionDock({
  contextPanel,
  motionPhase = 'steady',
  onContextPanelChange,
  onWorldAction,
}: Props) {
  return (
    <nav
      className={'gameplay-world-action-dock bottom-command-surface bottom-command-surface--sm motion-bottom-surface is-' + motionPhase}
      aria-label="世界与场景工具"
      aria-busy={motionPhase !== 'steady'}
    >
      <span className="gameplay-world-action-dock__group" aria-label="场景观察">
        <button
          type="button"
          className={contextPanel === 'camera' ? 'is-active' : ''}
          aria-label="相机"
          aria-pressed={contextPanel === 'camera'}
          data-tooltip="相机"
          onClick={() => onContextPanelChange('camera')}
        >
          <Camera />
        </button>
        <button
          type="button"
          className={contextPanel === 'weather' ? 'is-active' : ''}
          aria-label="环境控制"
          aria-pressed={contextPanel === 'weather'}
          data-tooltip="环境控制"
          onClick={() => onContextPanelChange('weather')}
        >
          <CloudSun />
        </button>
      </span>

      <i className="gameplay-world-action-dock__separator" aria-hidden="true" />

      <span className="gameplay-world-action-dock__group" aria-label="世界编辑">
        <button type="button" aria-label="地图解锁" data-tooltip="地图解锁" onClick={() => onWorldAction('unlock')}><DoorOpen /></button>
        <button type="button" aria-label="编辑区域" data-tooltip="编辑区域" onClick={() => onWorldAction('region')}><ScanLine /></button>
        <button type="button" aria-label="地形编辑" data-tooltip="地形编辑" onClick={() => onWorldAction('terrain')}><Mountain /></button>
        <button type="button" aria-label="配色工具" data-tooltip="配色工具" onClick={() => onWorldAction('palette')}><Palette /></button>
      </span>
    </nav>
  );
}
