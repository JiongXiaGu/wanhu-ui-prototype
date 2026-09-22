import type { Dispatch } from 'react';
import { ArrowUp, Mountain, Ruler } from '../../ui/icons/runtime-icons.generated';
import type { GameplayUiAction, GameplayUiState } from '../../app/ui-state';
import { PlacementActionBar, type PlacementModeGroup } from '../placement/PlacementActionBar';
import type { MotionPhase } from '../../ui/motion';
interface Props { state: GameplayUiState; motionPhase?: MotionPhase; dispatch: Dispatch<GameplayUiAction>; onComplete: () => void; onCancel: () => void; }
export function BuildingPlacementDock({ state, motionPhase = 'steady', dispatch, onComplete, onCancel }: Props) {
  const terrainGroup: PlacementModeGroup = { id: 'terrain', label: '地形处理方式', items: [
    { id: 'balanced-earthwork', label: '平衡挖填', icon: Mountain, active: state.buildingTerrainMode === 'balanced-earthwork', onClick: () => dispatch({ type: 'SET_BUILDING_TERRAIN_MODE', mode: 'balanced-earthwork' }) },
    { id: 'fill-only', label: '只填不挖', icon: ArrowUp, active: state.buildingTerrainMode === 'fill-only', onClick: () => dispatch({ type: 'SET_BUILDING_TERRAIN_MODE', mode: 'fill-only' }) },
    { id: 'manual-elevation', label: '手动标高', icon: Ruler, active: state.buildingTerrainMode === 'manual-elevation', onClick: () => dispatch({ type: 'SET_BUILDING_TERRAIN_MODE', mode: 'manual-elevation' }) },
  ]};
  const moving = state.buildingPlacementIntent === 'move';
  return <div className={'tool-bottom-cluster building-placement-toolbar-cluster motion-bottom-surface is-' + motionPhase} aria-label={moving ? '移动建筑主控栏' : '建筑放置主控栏'}>
    <PlacementActionBar ariaLabel={moving ? '移动建筑操作栏' : '建筑放置操作栏'} modeGroups={[terrainGroup]}
      confirmLabel={moving ? '完成移动' : '完成放置'} confirmShortLabel={moving ? '完成移动' : '完成放置'}
      cancelLabel={moving ? '取消移动' : '取消放置'} cancelShortLabel={moving ? '取消移动' : '取消放置'}
      onConfirm={onComplete} onCancel={onCancel} />
  </div>;
}
