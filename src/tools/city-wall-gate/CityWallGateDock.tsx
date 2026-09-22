import type { Dispatch } from 'react';
import { Link2, MousePointer2 } from '../../ui/icons/runtime-icons.generated';
import type { GameplayUiAction, GameplayUiState } from '../../app/ui-state';
import type { MotionPhase } from '../../ui/motion';
import { PlacementActionBar, type PlacementModeGroup } from '../placement/PlacementActionBar';
interface Props { state: GameplayUiState; motionPhase?: MotionPhase; dispatch: Dispatch<GameplayUiAction>; onComplete: () => void; onCancel: () => void; }
export function CityWallGateDock({ state, motionPhase = 'steady', dispatch, onComplete, onCancel }: Props) {
  const modeGroups: PlacementModeGroup[] = [{ id: 'city-wall-gate-placement-mode', label: '城墙门洞放置模式', items: [
    { id: 'free', label: '自由放置', icon: MousePointer2, active: state.cityWallGatePlacementMode === 'free', onClick: () => dispatch({ type: 'SET_CITY_WALL_GATE_MODE', mode: 'free' }) },
    { id: 'wall-connected', label: '城墙连接', icon: Link2, active: state.cityWallGatePlacementMode === 'wall-connected', onClick: () => dispatch({ type: 'SET_CITY_WALL_GATE_MODE', mode: 'wall-connected' }) },
  ]}];
  return <div className={'tool-bottom-cluster city-wall-gate-toolbar-cluster motion-bottom-surface is-' + motionPhase} aria-label="城墙门洞放置主控栏" aria-busy={motionPhase !== 'steady'}>
    <PlacementActionBar ariaLabel="城墙门洞放置操作栏" modeGroups={modeGroups} confirmLabel="完成城墙门洞放置" confirmShortLabel="完成放置" cancelLabel="取消城墙门洞放置" cancelShortLabel="取消" onConfirm={onComplete} onCancel={onCancel} />
  </div>;
}
