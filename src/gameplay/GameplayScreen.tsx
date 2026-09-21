import { useEffect, useReducer, useRef, useState } from 'react';
import type { GameplayUiState } from '../app/ui-state';
import { gameplayUiReducer, isDesignDockCategory, selectGameplaySpace } from '../app/ui-state';
import { DesignWorkspace } from '../workspace/DesignWorkspace';
import { DESIGN_WORKSPACES } from '../workspace/design-workspace-model';
import { BuildingPlacementOverlay } from '../tools/building-placement/BuildingPlacementOverlay';
import { BuildingPlacementDock } from '../tools/building-placement/BuildingPlacementDock';
import { RoadPlacementOverlay } from '../tools/road-placement/RoadPlacementOverlay';
import { RoadPlacementDock } from '../tools/road-placement/RoadPlacementDock';
import { TerrainEditTool } from '../tools/terrain-edit/TerrainEditTool';
import { TreePlacementTool } from '../tools/tree-placement/TreePlacementTool';
import { CityWallConstructionOverlay } from '../tools/city-wall-construction/CityWallConstructionOverlay';
import { CityWallConstructionDock } from '../tools/city-wall-construction/CityWallConstructionDock';
import { CityWallGateOverlay } from '../tools/city-wall-gate/CityWallGateOverlay';
import { CityWallGateDock } from '../tools/city-wall-gate/CityWallGateDock';
import { CityWallAccessStairOverlay } from '../tools/city-wall-access-stair/CityWallAccessStairOverlay';
import { CityWallAccessStairDock } from '../tools/city-wall-access-stair/CityWallAccessStairDock';
import { CityWallTransitionStairOverlay } from '../tools/city-wall-transition-stair/CityWallTransitionStairOverlay';
import { CityWallTransitionStairDock } from '../tools/city-wall-transition-stair/CityWallTransitionStairDock';
import { ColorTool } from '../tools/color-tool/ColorTool';
import { CommandBar } from './CommandBar';
import { ContextUtilityToolbar } from './ContextUtilityToolbar';
import { GameplayContextPanel } from './GameplayContextPanel';
import { GameplayCompassHud, GameplaySystemMenuButton } from './GameplayCornerHud';
import { GameplayHUD } from './GameplayHUD';
import { GameplayOperationHints } from './GameplayOperationHints';
import { ManagementSpace } from './management/ManagementSpace';
import { PauseLayer } from './PauseLayer';
import { MOTION_MS, usePresence } from '../ui/motion';
import { BuildingSelectionLayer } from '../selection/BuildingSelectionLayer';
import { BuildingSelectionInspector } from '../selection/BuildingSelectionInspector';
import { BuildingSelectionActionBar } from '../selection/BuildingSelectionActionBar';
import { getBuildingSelectionDefinition } from '../selection/building-selection-model';

interface GameplayScreenProps {
  background: string;
  nightBackground: string;
  initialState: GameplayUiState;
  onMainMenu: () => void;
}

export function GameplayScreen({ background, nightBackground, initialState, onMainMenu }: GameplayScreenProps) {
  const [state, dispatch] = useReducer(gameplayUiReducer, initialState);
  const [dayTime, setDayTime] = useState(14.5);
  const [selectionFocusPulse, setSelectionFocusPulse] = useState(0);
  const space = selectGameplaySpace(state);
  const toolOpen = state.tool !== 'none';
  const showControlTray = space === 'gameplay' || space === 'management' || space === 'workspace';
  const showContextUtilityToolbar = space === 'gameplay' || space === 'workspace' || space === 'tool';
  const showCompassHud = !state.paused && space !== 'management';
  const showContextPanel = !state.paused && space === 'gameplay' && state.contextPanel !== 'none';
  const selectionOpen = !state.paused && space === 'gameplay' && state.selection !== null;
  const buildingSelectionActive = !state.paused && space === 'gameplay' && state.tool === 'none' && state.workspace === 'none' && state.management === 'none' && state.contextPanel === 'none' && !state.mapPanelOpen;
  const selectedBuilding = state.selection?.kind === 'building' ? getBuildingSelectionDefinition(state.selection.entityId) : null;
  const isNight = dayTime >= 18 || dayTime < 6;
  const sceneBackground = isNight ? nightBackground : background;
  const designWorkspace = state.workspace === 'design' && isDesignDockCategory(state.dockCategory)
    ? DESIGN_WORKSPACES[state.dockCategory]
    : null;

  const previousSpaceRef = useRef(space);
  const transitionFromRef = useRef(space);
  if (previousSpaceRef.current !== space) {
    transitionFromRef.current = previousSpaceRef.current;
    previousSpaceRef.current = space;
  }
  const transitionFrom = transitionFromRef.current;
  const enteringFromTool = transitionFrom === 'tool' && space !== 'tool';
  const enteringTool = transitionFrom !== 'tool' && space === 'tool';

  const mainDockVisible = (space === 'gameplay' || space === 'workspace') && state.selection === null;
  const mainDockPresence = usePresence(mainDockVisible, { enterDelayMs: enteringFromTool ? MOTION_MS.fast : 0 });
  const workspacePresence = usePresence(designWorkspace !== null, { enterDelayMs: enteringFromTool ? MOTION_MS.fast : 0 });
  const toolPresence = usePresence(toolOpen && !state.paused, { enterDelayMs: enteringTool ? MOTION_MS.fast : 0 });
  const contextPresence = usePresence(showContextPanel);
  const selectionPresence = usePresence(selectionOpen);
  const managementPresence = usePresence(space === 'management' && state.management !== 'none', { exitMs: MOTION_MS.fast });
  const pausePresence = usePresence(state.paused, { exitMs: MOTION_MS.fast });

  const lastWorkspaceRef = useRef(designWorkspace);
  if (designWorkspace) lastWorkspaceRef.current = designWorkspace;
  const lastToolRef = useRef(state.tool);
  if (state.tool !== 'none') lastToolRef.current = state.tool;
  const lastContextPanelRef = useRef(state.contextPanel);
  if (state.contextPanel !== 'none') lastContextPanelRef.current = state.contextPanel;
  const lastSelectionRef = useRef(state.selection);
  if (state.selection) lastSelectionRef.current = state.selection;
  const lastManagementRef = useRef(state.management);
  if (state.management !== 'none') lastManagementRef.current = state.management;
  const lastPauseViewRef = useRef(state.pauseView);
  if (state.paused) lastPauseViewRef.current = state.pauseView;

  const renderedWorkspace = designWorkspace ?? lastWorkspaceRef.current;
  const renderedTool = state.tool !== 'none' ? state.tool : lastToolRef.current;
  const renderedContextPanel = state.contextPanel !== 'none' ? state.contextPanel : lastContextPanelRef.current;
  const renderedSelection = state.selection ?? lastSelectionRef.current;
  const renderedSelectedBuilding = renderedSelection?.kind === 'building' ? getBuildingSelectionDefinition(renderedSelection.entityId) : null;
  const renderedManagement = state.management !== 'none' ? state.management : lastManagementRef.current;
  const renderedPauseView = state.paused ? state.pauseView : lastPauseViewRef.current;

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
      if (state.selection !== null) {
        dispatch({ type: 'CLEAR_SELECTION' });
        return;
      }

      dispatch({ type: 'SET_PAUSED', paused: true });
    }

    window.addEventListener('keydown', handleGameplayEscape);
    return () => window.removeEventListener('keydown', handleGameplayEscape);
  }, [state.contextPanel, state.management, state.mapPanelOpen, state.mapView, state.paused, state.selection, state.tool, state.workspace]);

  function exitTool() {
    dispatch({ type: 'EXIT_TOOL' });
  }

  return (
    <section
      className={`screen gameplay-screen gameplay-screen--${space} ${isNight ? 'is-night' : 'is-day'}`}
      data-time-of-day={isNight ? 'night' : 'day'}
      style={{ backgroundImage: `url(${sceneBackground})` }}
    >
      <div className="game-vignette" />
      <div className={`map-view-layer map-view-layer--${state.mapView}`} aria-hidden="true" />

      <BuildingSelectionLayer selection={state.selection} active={buildingSelectionActive} focusPulse={selectionFocusPulse} onSelect={(entityId) => dispatch({ type: 'SELECT_BUILDING', entityId })} onClear={() => dispatch({ type: 'CLEAR_SELECTION' })} />

      {showCompassHud && <GameplayCompassHud buildMode={toolOpen} />}
      {!state.paused && <GameplaySystemMenuButton onClick={() => dispatch({ type: 'SET_PAUSED', paused: true })} />}

      <GameplayHUD
        contextPanel={state.contextPanel}
        dayTime={dayTime}
        management={state.management}
        mapView={state.mapView}
        mapPanelOpen={state.mapPanelOpen}
        speed={state.speed}
        showControlTray={showControlTray}
        controlTrayEnterDelayMs={enteringFromTool ? MOTION_MS.fast : 0}
        onContextPanelChange={(panel) => dispatch({ type: 'SET_CONTEXT_PANEL', panel })}
        onManagementChange={(management) => dispatch({ type: 'SET_MANAGEMENT', management })}
        onToggleMapPanel={() => dispatch({ type: 'TOGGLE_MAP_PANEL' })}
        onMapViewChange={(mapView) => dispatch({ type: 'SET_MAP_VIEW', mapView })}
        onSpeedChange={(speed) => dispatch({ type: 'SET_SPEED', speed })}
      />

      {showContextUtilityToolbar && (
        <ContextUtilityToolbar
          tool={state.tool}
          selection={state.selection}
          gridSnap={state.gridSnap}
          gridVisible={state.gridVisible}
          canUndo={state.canUndo}
          canRedo={state.canRedo}
          terrainContours={state.terrainContours}
          terrainSlopeView={state.terrainSlopeView}
          terrainProtectBuilt={state.terrainProtectBuilt}
          treeAvoidBuildings={state.treeAvoidBuildings}
          treeAvoidRoads={state.treeAvoidRoads}
          cityWallTopLine={state.cityWallTopLine}
          cityWallNodes={state.cityWallNodes}
          cityWallGatePlacementMode={state.cityWallGatePlacementMode}
          cityWallGateConnections={state.cityWallGateConnections}
          cityWallGateClearance={state.cityWallGateClearance}
          cityWallAccessStairClearance={state.cityWallAccessStairClearance}
          cityWallTransitionStairClearance={state.cityWallTransitionStairClearance}
          onToggleGridSnap={() => dispatch({ type: 'TOGGLE_GRID_SNAP' })}
          onToggleGridVisible={() => dispatch({ type: 'TOGGLE_GRID_VISIBLE' })}
          onUndo={() => dispatch({ type: 'UNDO' })}
          onRedo={() => dispatch({ type: 'REDO' })}
          onToggleTerrainContours={() => dispatch({ type: 'TOGGLE_TERRAIN_CONTOURS' })}
          onToggleTerrainSlopeView={() => dispatch({ type: 'TOGGLE_TERRAIN_SLOPE_VIEW' })}
          onToggleTerrainProtection={() => dispatch({ type: 'TOGGLE_TERRAIN_PROTECTION' })}
          onToggleTreeAvoidBuildings={() => dispatch({ type: 'TOGGLE_TREE_AVOID_BUILDINGS' })}
          onToggleTreeAvoidRoads={() => dispatch({ type: 'TOGGLE_TREE_AVOID_ROADS' })}
          onToggleCityWallTopLine={() => dispatch({ type: 'TOGGLE_CITY_WALL_TOP_LINE' })}
          onToggleCityWallNodes={() => dispatch({ type: 'TOGGLE_CITY_WALL_NODES' })}
          onToggleCityWallGateConnections={() => dispatch({ type: 'TOGGLE_CITY_WALL_GATE_CONNECTIONS' })}
          onToggleCityWallGateClearance={() => dispatch({ type: 'TOGGLE_CITY_WALL_GATE_CLEARANCE' })}
          onToggleCityWallAccessStairClearance={() => dispatch({ type: 'TOGGLE_CITY_WALL_ACCESS_STAIR_CLEARANCE' })}
          onToggleCityWallTransitionStairClearance={() => dispatch({ type: 'TOGGLE_CITY_WALL_TRANSITION_STAIR_CLEARANCE' })}
          onToolAction={(id) => {
            if (id === 'terrain') dispatch({ type: 'ENTER_TERRAIN_EDIT' });
            else if (id === 'palette' || id === 'selection-color-building') dispatch({ type: 'ENTER_COLOR_TOOL' });
            else if (id === 'selection-focus-building') setSelectionFocusPulse((value) => value + 1);
            else if (state.tool !== 'none') dispatch({ type: 'MARK_HISTORY_DIRTY' });
          }}
        />
      )}

      {mainDockPresence.mounted && (
        <CommandBar
          mode={state.dockMode}
          motionPhase={mainDockPresence.phase}
          activeCategory={state.dockCategory}
          onModeChange={(mode) => dispatch({ type: 'SET_DOCK_MODE', mode })}
          onCategoryChange={(category) => dispatch({ type: 'SET_DOCK_CATEGORY', category })}
        />
      )}

      {workspacePresence.mounted && renderedWorkspace && (
        <DesignWorkspace
          key={renderedWorkspace.id}
          definition={renderedWorkspace}
          motionPhase={workspacePresence.phase}
          onClose={() => dispatch({ type: 'CLOSE_WORKSPACE' })}
          onSelectItem={(item) => {
            if (renderedWorkspace.id === 'building') dispatch({ type: 'ENTER_BUILDING_PLACEMENT' });
            if (renderedWorkspace.id === 'road') dispatch({ type: 'ENTER_ROAD_PLACEMENT' });
            if (renderedWorkspace.id === 'tree') dispatch({ type: 'ENTER_TREE_PLACEMENT', speciesId: item.id, speciesName: item.name });
            if (renderedWorkspace.id === 'city-wall' && item.toolType === 'city-wall-construction') {
              const systemName = renderedWorkspace.primaryCategories.find((entry) => entry.key === item.primary)?.label ?? '城墙';
              dispatch({ type: 'ENTER_CITY_WALL_CONSTRUCTION', moduleId: item.id, moduleName: item.name, systemId: item.primary, systemName });
            }
            if (renderedWorkspace.id === 'city-wall' && item.toolType === 'city-wall-gate') {
              const systemName = renderedWorkspace.primaryCategories.find((entry) => entry.key === item.primary)?.label ?? '城墙';
              dispatch({ type: 'ENTER_CITY_WALL_GATE', moduleId: item.id, moduleName: item.name, systemId: item.primary, systemName });
            }
            if (renderedWorkspace.id === 'city-wall' && item.toolType === 'city-wall-access-stair') {
              const systemName = renderedWorkspace.primaryCategories.find((entry) => entry.key === item.primary)?.label ?? '城墙';
              dispatch({ type: 'ENTER_CITY_WALL_ACCESS_STAIR', moduleId: item.id, moduleName: item.name, systemId: item.primary, systemName });
            }
            if (renderedWorkspace.id === 'city-wall' && item.toolType === 'city-wall-transition-stair') {
              const systemName = renderedWorkspace.primaryCategories.find((entry) => entry.key === item.primary)?.label ?? '城墙';
              dispatch({ type: 'ENTER_CITY_WALL_TRANSITION_STAIR', moduleId: item.id, moduleName: item.name, systemId: item.primary, systemName });
            }
          }}
        />
      )}

      {selectionPresence.mounted && renderedSelectedBuilding && (
        <>
          <BuildingSelectionInspector building={renderedSelectedBuilding} motionPhase={selectionPresence.phase} onClose={() => dispatch({ type: 'CLEAR_SELECTION' })} />
          <BuildingSelectionActionBar motionPhase={selectionPresence.phase} onMove={() => dispatch({ type: 'ENTER_SELECTED_BUILDING_MOVE' })} onClose={() => dispatch({ type: 'CLEAR_SELECTION' })} />
        </>
      )}

      {contextPresence.mounted && renderedContextPanel !== 'none' && (
        <GameplayContextPanel
          panel={renderedContextPanel}
          motionPhase={contextPresence.phase}
          dayTime={dayTime}
          onDayTimeChange={setDayTime}
          onClose={() => dispatch({ type: 'SET_CONTEXT_PANEL', panel: 'none' })}
        />
      )}

      {toolPresence.mounted && renderedTool === 'building-placement' && (
        <>
          <BuildingPlacementOverlay
            terrainMode={state.buildingTerrainMode}
            placementIntent={state.buildingPlacementIntent}
            buildingName={selectedBuilding?.name ?? undefined}
            motionPhase={toolPresence.phase}
            onClose={exitTool}
            onDirty={() => dispatch({ type: 'MARK_HISTORY_DIRTY' })}
          />
          <BuildingPlacementDock state={state} motionPhase={toolPresence.phase} dispatch={dispatch} onComplete={exitTool} onCancel={exitTool} />
        </>
      )}

      {toolPresence.mounted && renderedTool === 'road-placement' && (
        <>
          <RoadPlacementOverlay
            drawMode={state.roadDrawMode}
            motionPhase={toolPresence.phase}
            onClose={exitTool}
            onDirty={() => dispatch({ type: 'MARK_HISTORY_DIRTY' })}
          />
          <RoadPlacementDock state={state} motionPhase={toolPresence.phase} dispatch={dispatch} onComplete={exitTool} onCancel={exitTool} />
        </>
      )}

      {toolPresence.mounted && renderedTool === 'city-wall-construction' && (
        <>
          <CityWallConstructionOverlay
            moduleName={state.cityWallModuleName}
            systemName={state.cityWallSystemName}
            constructionMode={state.cityWallConstructionMode}
            facingSide={state.cityWallFacingSide}
            showTopLine={state.cityWallTopLine}
            showNodes={state.cityWallNodes}
            motionPhase={toolPresence.phase}
            onClose={exitTool}
            onDirty={() => dispatch({ type: 'MARK_HISTORY_DIRTY' })}
          />
          <CityWallConstructionDock state={state} motionPhase={toolPresence.phase} dispatch={dispatch} onComplete={exitTool} onCancel={exitTool} />
        </>
      )}

      {toolPresence.mounted && renderedTool === 'city-wall-gate' && (
        <>
          <CityWallGateOverlay
            moduleName={state.cityWallModuleName}
            systemName={state.cityWallSystemName}
            placementMode={state.cityWallGatePlacementMode}
            rotation={state.cityWallGateRotation}
            facingFlipped={state.cityWallGateFacingFlipped}
            showConnections={state.cityWallGateConnections}
            showClearance={state.cityWallGateClearance}
            motionPhase={toolPresence.phase}
            onClose={exitTool}
            onDirty={() => dispatch({ type: 'MARK_HISTORY_DIRTY' })}
          />
          <CityWallGateDock state={state} motionPhase={toolPresence.phase} dispatch={dispatch} onComplete={exitTool} onCancel={exitTool} />
        </>
      )}

      {toolPresence.mounted && renderedTool === 'city-wall-access-stair' && (
        <>
          <CityWallAccessStairOverlay
            moduleName={state.cityWallModuleName}
            systemName={state.cityWallSystemName}
            rotation={state.cityWallAccessStairRotation}
            reversed={state.cityWallAccessStairReversed}
            showClearance={state.cityWallAccessStairClearance}
            motionPhase={toolPresence.phase}
            onClose={exitTool}
            onDirty={() => dispatch({ type: 'MARK_HISTORY_DIRTY' })}
          />
          <CityWallAccessStairDock state={state} motionPhase={toolPresence.phase} dispatch={dispatch} onComplete={exitTool} onCancel={exitTool} />
        </>
      )}

      {toolPresence.mounted && renderedTool === 'city-wall-transition-stair' && (
        <>
          <CityWallTransitionStairOverlay
            moduleName={state.cityWallModuleName}
            systemName={state.cityWallSystemName}
            rotation={state.cityWallTransitionStairRotation}
            reversed={state.cityWallTransitionStairReversed}
            showClearance={state.cityWallTransitionStairClearance}
            motionPhase={toolPresence.phase}
            onClose={exitTool}
            onDirty={() => dispatch({ type: 'MARK_HISTORY_DIRTY' })}
          />
          <CityWallTransitionStairDock state={state} motionPhase={toolPresence.phase} dispatch={dispatch} onComplete={exitTool} onCancel={exitTool} />
        </>
      )}

      {toolPresence.mounted && renderedTool === 'color-tool' && (
        <ColorTool
          state={state}
          dispatch={dispatch}
          motionPhase={toolPresence.phase}
          onClose={exitTool}
          onDirty={() => dispatch({ type: 'MARK_HISTORY_DIRTY' })}
        />
      )}

      {toolPresence.mounted && renderedTool === 'terrain-edit' && (
        <TerrainEditTool
          state={state}
          motionPhase={toolPresence.phase}
          dispatch={dispatch}
          onExit={exitTool}
        />
      )}

      {toolPresence.mounted && renderedTool === 'tree-placement' && (
        <TreePlacementTool state={state} motionPhase={toolPresence.phase} dispatch={dispatch} onExit={exitTool} />
      )}

      {space !== 'management' && !state.paused && state.selection === null && state.tool !== 'terrain-edit' && state.tool !== 'tree-placement' && state.tool !== 'color-tool' && (
        <GameplayOperationHints
          tool={state.tool}
          buildingPlacementIntent={state.buildingPlacementIntent}
          roadDrawMode={state.roadDrawMode}
          terrainEditMode={state.terrainEditMode}
          cityWallConstructionMode={state.cityWallConstructionMode}
          cityWallGatePlacementMode={state.cityWallGatePlacementMode}
        />
      )}

      {managementPresence.mounted && renderedManagement !== 'none' && (
        <ManagementSpace
          view={renderedManagement}
          motionPhase={managementPresence.phase}
          onClose={() => dispatch({ type: 'SET_MANAGEMENT', management: 'none' })}
        />
      )}

      {pausePresence.mounted && (
        <PauseLayer
          view={renderedPauseView}
          motionPhase={pausePresence.phase}
          interactive={state.paused && pausePresence.phase !== 'exiting'}
          onViewChange={(view) => dispatch({ type: 'SET_PAUSE_VIEW', view })}
          onResume={() => dispatch({ type: 'SET_PAUSED', paused: false })}
          onMainMenu={onMainMenu}
        />
      )}
    </section>
  );
}
