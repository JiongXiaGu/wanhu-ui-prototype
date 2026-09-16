import { useEffect, useReducer } from 'react';
import type { GameplayUiState } from '../app/ui-state';
import { gameplayUiReducer, isDesignDockCategory, selectGameplaySpace } from '../app/ui-state';
import { DesignWorkspace } from '../workspace/DesignWorkspace';
import { DESIGN_WORKSPACES } from '../workspace/design-workspace-model';
import { BuildingPlacementOverlay } from '../tools/building-placement/BuildingPlacementOverlay';
import { BuildingPlacementDock } from '../tools/building-placement/BuildingPlacementDock';
import { RoadPlacementOverlay } from '../tools/road-placement/RoadPlacementOverlay';
import { RoadPlacementDock } from '../tools/road-placement/RoadPlacementDock';
import { CommandBar, WorldUtilityToolbar } from './CommandBar';
import { GameplayContextPanel } from './GameplayContextPanel';
import { GameplayCompassHud, GameplaySystemMenuButton } from './GameplayCornerHud';
import { GameplayHUD } from './GameplayHUD';
import { GameplayOperationHints } from './GameplayOperationHints';
import { ManagementSpace } from './ManagementSpace';
import { PauseLayer } from './PauseLayer';

interface GameplayScreenProps {
  background: string;
  initialState: GameplayUiState;
  onMainMenu: () => void;
}

export function GameplayScreen({ background, initialState, onMainMenu }: GameplayScreenProps) {
  const [state, dispatch] = useReducer(gameplayUiReducer, initialState);
  const space = selectGameplaySpace(state);
  const buildingToolOpen = state.tool === 'building-placement';
  const roadToolOpen = state.tool === 'road-placement';
  const toolOpen = state.tool !== 'none';
  const showControlTray = space === 'gameplay' || space === 'management' || space === 'workspace';
  const showWorldUtilityToolbar = space === 'gameplay' || space === 'workspace' || space === 'tool';
  const showCompassHud = !state.paused && space !== 'management';
  const showContextPanel = !state.paused && space === 'gameplay' && state.contextPanel !== 'none';
  const designWorkspace = state.workspace === 'design' && isDesignDockCategory(state.dockCategory)
    ? DESIGN_WORKSPACES[state.dockCategory]
    : null;

  useEffect(() => {
    function handleGameplayEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape' || event.defaultPrevented || state.paused) return;

      if (state.workspace !== 'none' && document.activeElement instanceof HTMLElement && document.activeElement.closest('.workspace-search')) return;

      event.preventDefault();

      if (state.contextPanel !== 'none') {
        dispatch({ type: 'SET_CONTEXT_PANEL', panel: 'none' });
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
  }, [state.contextPanel, state.management, state.mapPanelOpen, state.mapView, state.paused, state.tool, state.workspace]);

  function exitTool() {
    dispatch({ type: 'EXIT_TOOL' });
  }

  return (
    <section className={`screen gameplay-screen gameplay-screen--${space}`} style={{ backgroundImage: `url(${background})` }}>
      <div className="game-vignette" />
      <div className={`map-view-layer map-view-layer--${state.mapView}`} aria-hidden="true" />

      {showCompassHud && <GameplayCompassHud buildMode={toolOpen} />}
      {!state.paused && <GameplaySystemMenuButton onClick={() => dispatch({ type: 'SET_PAUSED', paused: true })} />}

      <GameplayHUD
        contextPanel={state.contextPanel}
        management={state.management}
        mapView={state.mapView}
        mapPanelOpen={state.mapPanelOpen}
        speed={state.speed}
        showControlTray={showControlTray}
        onContextPanelChange={(panel) => dispatch({ type: 'SET_CONTEXT_PANEL', panel })}
        onManagementChange={(management) => dispatch({ type: 'SET_MANAGEMENT', management })}
        onToggleMapPanel={() => dispatch({ type: 'TOGGLE_MAP_PANEL' })}
        onMapViewChange={(mapView) => dispatch({ type: 'SET_MAP_VIEW', mapView })}
        onSpeedChange={(speed) => dispatch({ type: 'SET_SPEED', speed })}
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
            if (designWorkspace.id === 'road') dispatch({ type: 'ENTER_ROAD_PLACEMENT' });
          }}
        />
      )}

      {showContextPanel && state.contextPanel !== 'none' && (
        <GameplayContextPanel
          panel={state.contextPanel}
          onClose={() => dispatch({ type: 'SET_CONTEXT_PANEL', panel: 'none' })}
        />
      )}

      {buildingToolOpen && !state.paused && (
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

      {roadToolOpen && !state.paused && (
        <>
          <RoadPlacementOverlay
            drawMode={state.roadDrawMode}
            onClose={exitTool}
            onDirty={() => dispatch({ type: 'MARK_HISTORY_DIRTY' })}
          />
          <RoadPlacementDock state={state} dispatch={dispatch} onComplete={exitTool} onCancel={exitTool} />
        </>
      )}

      {space !== 'management' && !state.paused && (
        <GameplayOperationHints tool={state.tool} adjustmentMode={state.adjustmentMode} roadDrawMode={state.roadDrawMode} />
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
