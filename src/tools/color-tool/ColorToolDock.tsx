import type { Dispatch } from 'react';
import type { GameplayUiAction, GameplayUiState } from '../../app/ui-state';
import type { MotionPhase } from '../../ui/motion';
import { ToolActionBar, type ToolModeGroup } from '../ToolActionBar';

interface Props {
  state: GameplayUiState;
  motionPhase?: MotionPhase;
  dispatch: Dispatch<GameplayUiAction>;
  onComplete: () => void;
}

export function ColorToolDock({ state, motionPhase = 'steady', dispatch, onComplete }: Props) {
  const modeGroups: ToolModeGroup[] = [{
    id: 'color-tool-mode', label: '配色工具模式', presentation: 'icon-label',
    items: [
      { id: 'surface', label: '表面模式', shortLabel: '表面', icon: 'layers-3', active: state.colorToolMode === 'surface', onClick: () => dispatch({ type: 'SET_COLOR_TOOL_MODE', mode: 'surface' }) },
      { id: 'lighting', label: '灯光模式', shortLabel: '灯光', icon: 'lightbulb', active: state.colorToolMode === 'lighting', onClick: () => dispatch({ type: 'SET_COLOR_TOOL_MODE', mode: 'lighting' }) },
      { id: 'scheme', label: '方案模式', shortLabel: '方案', icon: 'palette', active: state.colorToolMode === 'scheme', onClick: () => dispatch({ type: 'SET_COLOR_TOOL_MODE', mode: 'scheme' }) },
    ],
  }];

  return (
    <div className={'tool-bottom-cluster color-tool-toolbar-cluster motion-bottom-surface is-' + motionPhase} aria-label="配色工具主控栏" aria-busy={motionPhase !== 'steady'}>
      {/* 没有整轮回退契约，仅展示真实的结束动作。 */}
      <ToolActionBar ariaLabel="配色工具操作栏" modeGroups={modeGroups} completeLabel="完成配色" completeShortLabel="完成" completeKind="exit" commitGroupLabel="配色工具任务" onComplete={onComplete} />
    </div>
  );
}
