import type { Dispatch } from 'react';
import type { GameplayUiAction, GameplayUiState } from '../../app/ui-state';

interface DockProps {
  state: GameplayUiState;
  dispatch: Dispatch<GameplayUiAction>;
  onComplete: () => void;
  onCancel: () => void;
}

export function BuildingPlacementDock({ state, dispatch, onComplete, onCancel }: DockProps) {
  return (
    <div className="tool-bottom-cluster building-placement-toolbar-cluster" aria-label="建筑放置主控栏">
      <div className="tool-bottom-cluster__primary">
        <div className="bp-mode-group bp-terrain-group" role="group" aria-label="地形处理方式">
          <button
            type="button"
            className={`bp-mode-action ${state.terrainMode === 'balanced-earthwork' ? 'is-active' : ''}`}
            aria-pressed={state.terrainMode === 'balanced-earthwork'}
            data-tooltip="平衡挖填"
            onClick={() => dispatch({ type: 'SET_TERRAIN_MODE', mode: 'balanced-earthwork' })}
          >平</button>
          <button
            type="button"
            className={`bp-mode-action ${state.terrainMode === 'fill-only' ? 'is-active' : ''}`}
            aria-pressed={state.terrainMode === 'fill-only'}
            data-tooltip="只填不挖"
            onClick={() => dispatch({ type: 'SET_TERRAIN_MODE', mode: 'fill-only' })}
          >填</button>
          <button
            type="button"
            className={`bp-mode-action ${state.terrainMode === 'manual-elevation' ? 'is-active' : ''}`}
            aria-pressed={state.terrainMode === 'manual-elevation'}
            data-tooltip="手动调整建筑标高"
            onClick={() => dispatch({ type: 'SET_TERRAIN_MODE', mode: 'manual-elevation' })}
          >高</button>
        </div>

        <i className="bp-divider" aria-hidden="true" />

        <div className="bp-mode-group bp-adjustment-group" role="group" aria-label="建筑调整对象">
          <button
            type="button"
            className={`bp-mode-action ${state.adjustmentMode === 'position' ? 'is-active' : ''}`}
            aria-pressed={state.adjustmentMode === 'position'}
            data-tooltip="位置调整"
            onClick={() => dispatch({ type: 'SET_ADJUSTMENT_MODE', mode: 'position' })}
          >位</button>
          <button
            type="button"
            className={`bp-mode-action ${state.adjustmentMode === 'massing' ? 'is-active' : ''}`}
            aria-pressed={state.adjustmentMode === 'massing'}
            data-tooltip="楼身调整"
            onClick={() => dispatch({ type: 'SET_ADJUSTMENT_MODE', mode: 'massing' })}
          >层</button>
          <button
            type="button"
            className={`bp-mode-action ${state.adjustmentMode === 'roof' ? 'is-active' : ''}`}
            aria-pressed={state.adjustmentMode === 'roof'}
            data-tooltip="屋顶调整"
            onClick={() => dispatch({ type: 'SET_ADJUSTMENT_MODE', mode: 'roof' })}
          >顶</button>
          <button type="button" className="bp-mode-action" data-tooltip="立面调整尚未开放" disabled>面</button>
        </div>

        <i className="bp-divider" aria-hidden="true" />

        <div className="bp-submit-group" role="group" aria-label="建筑放置任务">
          <button type="button" className="bp-submit bp-submit--complete" onClick={onComplete}>完成</button>
          <button type="button" className="bp-submit" onClick={onCancel}>取消</button>
        </div>
      </div>
    </div>
  );
}
