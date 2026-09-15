import { useReducer } from 'react';
import type { GameplayUiState } from '../app/ui-state';
import { gameplayUiReducer, selectGameplaySpace } from '../app/ui-state';
import { BuildingWorkspace } from '../workspace/BuildingWorkspace';
import { BuildingPlacementOverlay } from '../tools/building-placement/BuildingPlacementOverlay';
import { BuildingPlacementDock } from '../tools/building-placement/BuildingPlacementDock';
import { CommandBar, WorldUtilityToolbar } from './CommandBar';
import { GameplayHUD } from './GameplayHUD';
import { GameplayOperationHints } from './GameplayOperationHints';
import { ManagementSpace } from './ManagementSpace';
import { PauseLayer } from './PauseLayer';
import { RightEdgeFlyout } from './RightEdgeFlyout';

interface GameplayScreenProps {
  background: string;
  initialState: GameplayUiState;
  onMainMenu: () => void;
}

export function GameplayScreen({ background, initialState, onMainMenu }: GameplayScreenProps) {
  const [state, dispatch] = useReducer(gameplayUiReducer, initialState);
  const space = selectGameplaySpace(state);
  const toolOpen = state.tool === 'building-placement';
  const showManagementNavigation = space === 'gameplay' || space === 'management';
  const showWorldUtilityToolbar = space === 'gameplay' || space === 'workspace' || space === 'tool';

  function exitTool() {
    dispatch({ type: 'EXIT_TOOL' });
  }

  return (
    <section className={`screen gameplay-screen gameplay-screen--${space}`} style={{ backgroundImage: `url(${background})` }}>
      <div className="game-vignette" />
      <div className={`map-view-layer map-view-layer--${state.mapView}`} aria-hidden="true" />

      <GameplayHUD
        flyout={state.flyout}
        management={state.management}
        mapView={state.mapView}
        speed={state.speed}
        showManagementNavigation={showManagementNavigation}
        onFlyoutChange={(flyout) => dispatch({ type: 'SET_FLYOUT', flyout })}
        onManagementChange={(management) => dispatch({ type: 'SET_MANAGEMENT', management })}
        onMapViewChange={(mapView) => dispatch({ type: 'SET_MAP_VIEW', mapView })}
        onSpeedChange={(speed) => dispatch({ type: 'SET_SPEED', speed })}
        onPause={() => dispatch({ type: 'SET_PAUSED', paused: true })}
      />

      {showWorldUtilityToolbar && (
        <WorldUtilityToolbar
          gridSnap={state.gridSnap}
          gridVisible={state.gridVisible}
          canUndo={state.canUndo}
          canRedo={state.canRedo}
          onToggleGridSnap={() => dispatch({ type: 'TOGGLE_GRID_SNAP' })}
          onToggleGridVisible={() => dispatch({ type: 'TOGGLE_GRID_VISIBLE' })}
          onUndo={() => dispatch({ type: 'UNDO' })}
          onRedo={() => dispatch({ type: 'REDO' })}
        />
      )}

      {(space === 'gameplay' || space === 'workspace') && (
        <CommandBar activeCategory={state.activeCategory} onCategoryChange={(category) => dispatch({ type: 'SET_CATEGORY', category })} />
      )}

      {space === 'workspace' && state.workspace === 'building' && (
        <BuildingWorkspace
          onClose={() => dispatch({ type: 'CLOSE_WORKSPACE' })}
          onSelectBuilding={() => dispatch({ type: 'ENTER_BUILDING_PLACEMENT' })}
        />
      )}

      {toolOpen && !state.paused && (
        <>
          <BuildingPlacementOverlay
            terrainMode={state.terrainMode}
            adjustmentMode={state.adjustmentMode}
            onClose={exitTool}
            onDirty={() => dispatch({ type: 'MARK_HISTORY_DIRTY' })}
          />
          <BuildingPlacementDock state={state} dispatch={dispatch} onComplete={exitTool} onCancel={exitTool} />
        </>
      )}

      {space !== 'management' && !state.paused && (
        <GameplayOperationHints toolActive={toolOpen} adjustmentMode={state.adjustmentMode} />
      )}

      {state.flyout !== 'none' && !state.paused && (
        <RightEdgeFlyout flyout={state.flyout} onClose={() => dispatch({ type: 'SET_FLYOUT', flyout: 'none' })} />
      )}

      {space === 'management' && state.management !== 'none' && (
        <ManagementSpace
          view={state.management}
          onClose={() => dispatch({ type: 'SET_MANAGEMENT', management: 'none' })}
        />
      )}

      {state.paused && (
        <PauseLayer
          view={state.pauseView}
          onViewChange={(view) => dispatch({ type: 'SET_PAUSE_VIEW', view })}
          onResume={() => dispatch({ type: 'SET_PAUSED', paused: false })}
          onMainMenu={onMainMenu}
        />
      )}
    </section>
  );
}
