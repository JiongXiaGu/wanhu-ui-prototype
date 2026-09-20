import type { Dispatch } from 'react';
import type { GameplayUiAction, GameplayUiState } from '../../app/ui-state';
import type { MotionPhase } from '../../ui/motion';
import { PlacementActionBar, type PlacementModeGroup } from '../placement/PlacementActionBar';

interface Props {
  state: GameplayUiState;
  motionPhase?: MotionPhase;
  dispatch: Dispatch<GameplayUiAction>;
  onComplete: () => void;
  onCancel: () => void;
}

export function ColorToolDock({ state, motionPhase = 'steady', dispatch, onComplete, onCancel }: Props) {
  const modeGroups: PlacementModeGroup[] = [{
    id: 'color-tool-mode',
    label: '配色工具模式',
    items: [
      {
        id: 'surface',
        label: '表面模式',
        icon: 'layers-3',
        active: state.colorToolMode === 'surface',
        onClick: () => dispatch({ type: 'SET_COLOR_TOOL_MODE', mode: 'surface' }),
      },
      {
        id: 'lighting',
        label: '灯光模式',
        icon: 'lightbulb',
        active: state.colorToolMode === 'lighting',
        onClick: () => dispatch({ type: 'SET_COLOR_TOOL_MODE', mode: 'lighting' }),
      },
      {
        id: 'scheme',
        label: '方案模式',
        icon: 'palette',
        active: state.colorToolMode === 'scheme',
        onClick: () => dispatch({ type: 'SET_COLOR_TOOL_MODE', mode: 'scheme' }),
      },
    ],
  }];

  return (
    <div
      className={'tool-bottom-cluster color-tool-toolbar-cluster motion-bottom-surface is-' + motionPhase}
      aria-label="配色工具主控栏"
      aria-busy={motionPhase !== 'steady'}
    >
      <PlacementActionBar
        ariaLabel="配色工具操作栏"
        modeGroups={modeGroups}
        confirmLabel="完成配色"
        cancelLabel="取消配色"
        onConfirm={onComplete}
        onCancel={onCancel}
      />
    </div>
  );
}
