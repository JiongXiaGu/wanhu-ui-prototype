import type { Dispatch } from 'react';
import { Home, Layers3, Square } from '../../ui/icons/runtime-icons.generated';
import type { GameplayUiAction, GameplayUiState } from '../../app/ui-state';
import { ToolActionBar, type ToolModeGroup } from '../ToolActionBar';
import type { MotionPhase } from '../../ui/motion';

interface Props { state: GameplayUiState; motionPhase?: MotionPhase; dispatch: Dispatch<GameplayUiAction>; onComplete: () => void; onCancel: () => void; }

export function BuildingEditDock({ state, motionPhase = 'steady', dispatch, onComplete, onCancel }: Props) {
  const modeGroups: ToolModeGroup[] = [{
    id: 'building-edit-mode',
    label: '建筑编辑对象',
    items: [
      { id: 'massing', label: '楼身调整', icon: Layers3, active: state.adjustmentMode === 'massing', onClick: () => dispatch({ type: 'SET_ADJUSTMENT_MODE', mode: 'massing' }) },
      { id: 'roof', label: '屋顶调整', icon: Home, active: state.adjustmentMode === 'roof', onClick: () => dispatch({ type: 'SET_ADJUSTMENT_MODE', mode: 'roof' }) },
      { id: 'facade', label: '立面调整尚未开放', icon: Square, active: false, disabled: true, onClick: () => undefined },
    ],
  }];
  return <div className={'tool-bottom-cluster building-edit-toolbar-cluster motion-bottom-surface is-' + motionPhase} aria-label="建筑编辑主控栏">
    <ToolActionBar ariaLabel="建筑编辑操作栏" modeGroups={modeGroups} completeLabel="完成编辑" cancelLabel="取消编辑" commitGroupLabel="建筑编辑任务" showCancel onComplete={onComplete} onCancel={onCancel} />
  </div>;
}
