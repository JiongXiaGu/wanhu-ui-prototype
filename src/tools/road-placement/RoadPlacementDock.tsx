import type { Dispatch } from 'react';
import { Minus, Route, Sparkles } from '../../ui/icons/runtime-icons.generated';
import type { GameplayUiAction, GameplayUiState } from '../../app/ui-state';
import { PlacementActionBar, type PlacementModeGroup } from '../placement/PlacementActionBar';
import type { MotionPhase } from '../../ui/motion';
interface Props { state: GameplayUiState; motionPhase?: MotionPhase; dispatch: Dispatch<GameplayUiAction>; onComplete: () => void; onCancel: () => void; }
export function RoadPlacementDock({ state, motionPhase = 'steady', dispatch, onComplete, onCancel }: Props) {
  const modeGroups: PlacementModeGroup[] = [{ id: 'road-draw-mode', label: '道路绘制模式', items: [
    { id: 'smart-curve', label: '智能曲线', icon: Sparkles, active: state.roadDrawMode === 'smart-curve', onClick: () => dispatch({ type: 'SET_ROAD_DRAW_MODE', mode: 'smart-curve' }) },
    { id: 'curve', label: '曲线', icon: Route, active: state.roadDrawMode === 'curve', onClick: () => dispatch({ type: 'SET_ROAD_DRAW_MODE', mode: 'curve' }) },
    { id: 'straight', label: '直线', icon: Minus, active: state.roadDrawMode === 'straight', onClick: () => dispatch({ type: 'SET_ROAD_DRAW_MODE', mode: 'straight' }) },
  ]}];
  return <div className={`tool-bottom-cluster road-placement-toolbar-cluster motion-bottom-surface is-${motionPhase}`} aria-label="道路铺设主控栏" aria-busy={motionPhase !== 'steady'}>
    <PlacementActionBar ariaLabel="道路铺设操作栏" modeGroups={modeGroups} confirmLabel="完成道路铺设" confirmShortLabel="完成铺设" cancelLabel="取消道路铺设" cancelShortLabel="取消" onConfirm={onComplete} onCancel={onCancel} />
  </div>;
}
