import { useEffect, useReducer } from 'react';
import type { GameplayUiState } from '../app/ui-state';
import { gameplayUiReducer, isDesignDockCategory, selectGameplaySpace } from '../app/ui-state';
import { DesignWorkspace } from '../workspace/DesignWorkspace';
import { DESIGN_WORKSPACES } from '../workspace/design-workspace-model';
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
  const showControlTray = space === 'gameplay' || space === 'management' || space === 'workspace';
  const showWorldUtilityToolbar = space === 'gameplay' || space === 'workspace' || space === 'tool';
  const designWorkspace = state.workspace === 'design' && isDesignDockCategory(state.dockCategory)
    ? DESIGN_WORKSPACES[state.dockCategory]
    : null;

  useEffect(() => {
    function handleGameplayEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape' || event.defaultPrevented || state.paused) return;

      // A focused workspace search owns its first Escape so the query can collapse
      // without also dismissing the whole workspace in the same key press.
      if (state.workspace !== 'none' && document.activeElement instanceof HTMLElement && document.activeElement.closest('.workspace-search')) return;

      event.preventDefault();

      if (state.flyout !== 'none') {
        dispatch({ type: 'SET_FLYOUT', flyout: 'none' });
        return;
      }
      if (state.mapPanelOpen) {
        dispatch({ type: 'CLOSE_MAP_PANEL' });
        return;
      }
      if (state.tool !== 'none') {
        dispatch({ type: 'EXIT_TOOL' });
        return;
      }
      if (state.workspace !== 'none') {
        dispatch({ type: 'CLOSE_WORKSPACE' });
        return;
      }
      if (state.management !== 'none') {
        dispatch({ type: 'SET_MANAGEMENT', management: 'none' });
        return;
      }
      if (state.mapView !== 'default') {
        dispatch({ type: 'SET_MAP_VIEW', mapView: 'default' });
        return;
      }

      dispatch({ type: 'SET_PAUSED', paused: true });
    }

    window.addEventListener('keydown', handleGameplayEscape);
    return () => window.removeEventListener('keydown', handleGameplayEscape);
  }, [state.flyout, state.management, state.mapPanelOpen, state.mapView, state.paused, state.tool, state.workspace]);

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
        mapPanelOpen={state.mapPanelOpen}
        speed={state.speed}
        showControlTray={showControlTray}
        onFlyoutChange={(flyout) => dispatch({ type: 'SET_FLYOUT', flyout })}
        onManagementChange={(management) => dispatch({ type: 'SET_MANAGEMENT', management })}
        onToggleMapPanel={() => dispatch({ type: 'TOGGLE_MAP_PANEL' })}
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
        <CommandBar
          mode={state.dockMode}
          activeCategory={state.dockCategory}
          onModeChange={(mode) => dispatch({ type: 'SET_DOCK_MODE', mode })}
          onCategoryChange={(category) => dispatch({ type: 'SET_DOCK_CATEGORY', category })}
        />
      )}

      {designWorkspace && (
        <DesignWorkspace
          key={designWorkspace.id}
          definition={designWorkspace}
          onClose={() => dispatch({ type: 'CLOSE_WORKSPACE' })}
          onSelectItem={() => {
            if (designWorkspace.id === 'building') dispatch({ type: 'ENTER_BUILDING_PLACEMENT' });
          }}
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
