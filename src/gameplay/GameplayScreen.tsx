import { useEffect, useReducer, useRef, useState } from 'react';
import type { GameplayUiState } from '../app/ui-state';
import { gameplayUiReducer, isBlueprintDockCategory, isDesignDockCategory, selectGameplaySpace } from '../app/ui-state';
import { DesignWorkspace } from '../workspace/DesignWorkspace';
import { DESIGN_WORKSPACES } from '../workspace/design-workspace-model';
import { BlueprintWorkspace } from '../workspace/BlueprintWorkspace';
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
import { BUILDING_SELECTIONS, getBuildingSelectionDefinition } from '../selection/building-selection-model';
import { BuildingSchemeWorkspace } from '../tools/color-tool/modes/scheme/BuildingSchemeWorkspace';
import { BUILDING_COLOR_SCHEMES, getBuildingColorScheme } from '../tools/color-tool/modes/scheme/building-scheme-catalog';
import { useDialogSystem } from '../ui/dialog/DialogSystem';

interface GameplayScreenProps {
  background: string;
  nightBackground: string;
  initialState: GameplayUiState;
  onMainMenu: () => void;
}

export function GameplayScreen({ background, nightBackground, initialState, onMainMenu }: GameplayScreenProps) {
  const [state, dispatch] = useReducer(gameplayUiReducer, initialState);
  const dialogs = useDialogSystem();
  const [dayTime, setDayTime] = useState(14.5);
  const [selectionFocusPulse, setSelectionFocusPulse] = useState(0);
  const [removedBuildingIds, setRemovedBuildingIds] = useState<Set<string>>(() => new Set());
  const [buildingAppearance, setBuildingAppearance] = useState<Record<string, { schemeId: string; weathering: number }>>(() => (
    Object.fromEntries(BUILDING_SELECTIONS.map((building) => [building.id, { ...building.appearance }]))
  ));
  const space = selectGameplaySpace(state);
  const toolOpen = state.tool !== 'none';
  const showControlTray = space === 'gameplay' || space === 'management' || space === 'workspace';
  const showContextUtilityToolbar = space === 'gameplay' || space === 'workspace' || space === 'tool';
  const showCompassHud = !state.paused && space !== 'management';
  const showContextPanel = !state.paused && space === 'gameplay' && state.contextPanel !== 'none';
  const selectionOpen = !state.paused && space === 'gameplay' && state.selection !== null;
  const worldUtilityStacked = !state.paused
    && (space === 'gameplay' || space === 'workspace')
    && state.tool === 'none'
    && state.selection === null;
  const placementUtilityStacked = !state.paused && (
    state.tool === 'building-placement'
    || state.tool === 'road-placement'
    || state.tool === 'tree-placement'
    || state.tool === 'city-wall-construction'
    || state.tool === 'city-wall-gate'
    || state.tool === 'city-wall-access-stair'
    || state.tool === 'city-wall-transition-stair'
  );
  const buildingSelectionActive = !state.paused && !state.worldDemolitionMode && space === 'gameplay' && state.tool === 'none' && state.workspace === 'none' && state.management === 'none' && state.contextPanel === 'none' && !state.mapPanelOpen;
  const selectedBuilding = state.selection?.kind === 'building' && !removedBuildingIds.has(state.selection.entityId)
    ? getBuildingSelectionDefinition(state.selection.entityId)
    : null;
  const selectedAppearance = selectedBuilding ? buildingAppearance[selectedBuilding.id] ?? selectedBuilding.appearance : null;
  const selectedScheme = selectedAppearance ? getBuildingColorScheme(selectedAppearance.schemeId) : BUILDING_COLOR_SCHEMES[0];
  const isNight = dayTime >= 18 || dayTime < 6;
  const sceneBackground = isNight ? nightBackground : background;
  const designWorkspace = state.workspace === 'design' && isDesignDockCategory(state.dockCategory)
    ? DESIGN_WORKSPACES[state.dockCategory]
    : null;
  const blueprintWorkspaceCategory = state.workspace === 'blueprint' && isBlueprintDockCategory(state.dockCategory)
    ? state.dockCategory
    : null;
  const activeWorkspace = designWorkspace
    ? { kind: 'design' as const, definition: designWorkspace }
    : blueprintWorkspaceCategory
      ? { kind: 'blueprint' as const, category: blueprintWorkspaceCategory }
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
  const workspacePresence = usePresence(activeWorkspace !== null, { enterDelayMs: enteringFromTool ? MOTION_MS.fast : 0 });
  const toolPresence = usePresence(toolOpen && !state.paused, { enterDelayMs: enteringTool ? MOTION_MS.fast : 0 });
  const contextPresence = usePresence(showContextPanel);
  const selectionPresence = usePresence(selectionOpen);
  const selectionSchemePresence = usePresence(selectionOpen && state.buildingSchemeOpen && selectedBuilding !== null);
  const managementPresence = usePresence(space === 'management' && state.management !== 'none', { exitMs: MOTION_MS.fast });
  const pausePresence = usePresence(state.paused, { exitMs: MOTION_MS.fast });

  const lastWorkspaceRef = useRef(activeWorkspace);
  if (activeWorkspace) lastWorkspaceRef.current = activeWorkspace;
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

  const renderedWorkspace = activeWorkspace ?? lastWorkspaceRef.current;
  const renderedTool = state.tool !== 'none' ? state.tool : lastToolRef.current;
  const renderedContextPanel = state.contextPanel !== 'none' ? state.contextPanel : lastContextPanelRef.current;
  const renderedSelection = state.selection ?? lastSelectionRef.current;
  const renderedSelectedBuilding = renderedSelection?.kind === 'building' && !removedBuildingIds.has(renderedSelection.entityId)
    ? getBuildingSelectionDefinition(renderedSelection.entityId)
    : null;
  const renderedAppearance = renderedSelectedBuilding ? buildingAppearance[renderedSelectedBuilding.id] ?? renderedSelectedBuilding.appearance : null;
  const renderedScheme = renderedAppearance ? getBuildingColorScheme(renderedAppearance.schemeId) : BUILDING_COLOR_SCHEMES[0];
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
      if (state.buildingSchemeOpen) {
        dispatch({ type: 'CLOSE_SELECTED_BUILDING_SCHEME' });
        return;
      }
      if (state.worldDemolitionMode) {
        dispatch({ type: 'EXIT_WORLD_DEMOLITION_MODE' });
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
  }, [state.buildingSchemeOpen, state.contextPanel, state.management, state.mapPanelOpen, state.mapView, state.paused, state.selection, state.tool, state.workspace, state.worldDemolitionMode]);

  function exitTool() {
    dispatch({ type: 'EXIT_TOOL' });
  }

  function updateSelectedAppearance(patch: Partial<{ schemeId: string; weathering: number }>) {
    if (!selectedBuilding) return;
    setBuildingAppearance((current) => ({
      ...current,
      [selectedBuilding.id]: {
        ...(current[selectedBuilding.id] ?? selectedBuilding.appearance),
        ...patch,
      },
    }));
    dispatch({ type: 'MARK_HISTORY_DIRTY' });
  }

  function requestRemoveSelectedBuilding() {
    if (!selectedBuilding) return;
    const entityId = selectedBuilding.id;
    const name = selectedBuilding.name;
    dialogs.confirm({
      title: '移除建筑',
      message: '是否移除「' + name + '」？移除后，该建筑将从城市中删除。',
      confirmText: '确认移除',
      cancelText: '取消',
      tone: 'danger',
      visualTone: 'danger',
      onConfirm: () => {
        setRemovedBuildingIds((current) => {
          const next = new Set(current);
          next.add(entityId);
          return next;
        });
        dispatch({ type: 'MARK_HISTORY_DIRTY' });
        dispatch({ type: 'CLEAR_SELECTION' });
        dialogs.toast('已移除「' + name + '」', 'warning');
      },
    });
  }

  return (
    <section
      className={`screen gameplay-screen gameplay-screen--${space} ${isNight ? 'is-night' : 'is-day'} ${worldUtilityStacked ? 'has-world-utility-stack' : ''} ${placementUtilityStacked ? 'has-placement-utility-stack' : ''} ${state.worldDemolitionMode ? 'is-world-demolition-mode' : ''}`}
      data-time-of-day={isNight ? 'night' : 'day'}
      data-world-demolition={state.worldDemolitionMode ? 'active' : 'inactive'}
      style={{ backgroundImage: `url(${sceneBackground})` }}
    >
      <div className="game-vignette" />
      <div className={`map-view-layer map-view-layer--${state.mapView}`} aria-hidden="true" />

      <BuildingSelectionLayer
        selection={state.selection}
        active={buildingSelectionActive}
        focusPulse={selectionFocusPulse}
        removedBuildingIds={removedBuildingIds}
        onSelect={(entityId) => dispatch({ type: 'SELECT_BUILDING', entityId })}
        onClear={() => dispatch({ type: 'CLEAR_SELECTION' })}
      />

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
          stackWorldTools={worldUtilityStacked}
          worldDemolitionMode={state.worldDemolitionMode}
          gridSnap={state.gridSnap}
          gridVisible={state.gridVisible}
          canUndo={state.canUndo}
          canRedo={state.canRedo}
          terrainContours={state.terrainContours}
          terrainSlopeView={state.terrainSlopeView}
          terrainProtectBuilt={state.terrainProtectBuilt}
          treePlacementMode={state.treePlacementMode}
          treeSingleSelected={state.treeSingleSelected}
          treeAvoidBuildings={state.treeAvoidBuildings}
          treeAvoidRoads={state.treeAvoidRoads}
          cityWallConstructionMode={state.cityWallConstructionMode}
          cityWallTopLine={state.cityWallTopLine}
          cityWallNodes={state.cityWallNodes}
          cityWallGatePlacementMode={state.cityWallGatePlacementMode}
          cityWallGateConnections={state.cityWallGateConnections}
          cityWallGateClearance={state.cityWallGateClearance}
          cityWallAccessStairClearance={state.cityWallAccessStairClearance}
          cityWallTransitionStairClearance={state.cityWallTransitionStairClearance}
          onToggleGridSnap={() => dispatch({ type: 'TOGGLE_GRID_SNAP' })}
          onToggleGridVisible={() => dispatch({ type: 'TOGGLE_GRID_VISIBLE' })}
          onToggleWorldDemolitionMode={() => dispatch({ type: 'TOGGLE_WORLD_DEMOLITION_MODE' })}
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
            else if (id === 'palette') dispatch({ type: 'ENTER_COLOR_TOOL' });
            else if (id === 'selection-focus-building') setSelectionFocusPulse((value) => value + 1);
            else if (id === 'selection-remove-building') requestRemoveSelectedBuilding();
            else if (id === 'city-wall-flip-facing') dispatch({ type: 'FLIP_CITY_WALL_FACING' });
            else if (id === 'city-wall-gate-rotate-left') dispatch({ type: 'ROTATE_CITY_WALL_GATE', direction: 'left' });
            else if (id === 'city-wall-gate-rotate-right') dispatch({ type: 'ROTATE_CITY_WALL_GATE', direction: 'right' });
            else if (id === 'city-wall-gate-flip-facing') dispatch({ type: 'FLIP_CITY_WALL_GATE_FACING' });
            else if (id === 'city-wall-access-stair-rotate-left') dispatch({ type: 'ROTATE_CITY_WALL_ACCESS_STAIR', direction: 'left' });
            else if (id === 'city-wall-access-stair-rotate-right') dispatch({ type: 'ROTATE_CITY_WALL_ACCESS_STAIR', direction: 'right' });
            else if (id === 'city-wall-access-stair-flip-direction') dispatch({ type: 'FLIP_CITY_WALL_ACCESS_STAIR_DIRECTION' });
            else if (id === 'city-wall-transition-stair-rotate-left') dispatch({ type: 'ROTATE_CITY_WALL_TRANSITION_STAIR', direction: 'left' });
            else if (id === 'city-wall-transition-stair-rotate-right') dispatch({ type: 'ROTATE_CITY_WALL_TRANSITION_STAIR', direction: 'right' });
            else if (id === 'city-wall-transition-stair-flip-direction') dispatch({ type: 'FLIP_CITY_WALL_TRANSITION_STAIR_DIRECTION' });
            else if (id === 'tree-move-selection') dispatch({ type: 'TOGGLE_TREE_SINGLE_MOVED' });
            else if (id === 'tree-rotate-selection-left') dispatch({ type: 'ROTATE_TREE_SINGLE', direction: 'left' });
            else if (id === 'tree-rotate-selection-right') dispatch({ type: 'ROTATE_TREE_SINGLE', direction: 'right' });
            else if (id === 'tree-delete-selection') dispatch({ type: 'DELETE_TREE_SINGLE' });
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

      {workspacePresence.mounted && renderedWorkspace?.kind === 'design' && (
        <DesignWorkspace
          key={renderedWorkspace.definition.id}
          definition={renderedWorkspace.definition}
          motionPhase={workspacePresence.phase}
          onClose={() => dispatch({ type: 'CLOSE_WORKSPACE' })}
          onSelectItem={(item) => {
            const definition = renderedWorkspace.definition;
            if (definition.id === 'building') dispatch({ type: 'ENTER_BUILDING_PLACEMENT' });
            if (definition.id === 'road') dispatch({ type: 'ENTER_ROAD_PLACEMENT' });
            if (definition.id === 'tree') dispatch({ type: 'ENTER_TREE_PLACEMENT', speciesId: item.id, speciesName: item.name });
            if (definition.id === 'city-wall' && item.toolType === 'city-wall-construction') {
              const systemName = definition.primaryCategories.find((entry) => entry.key === item.primary)?.label ?? '城墙';
              dispatch({ type: 'ENTER_CITY_WALL_CONSTRUCTION', moduleId: item.id, moduleName: item.name, systemId: item.primary, systemName });
            }
            if (definition.id === 'city-wall' && item.toolType === 'city-wall-gate') {
              const systemName = definition.primaryCategories.find((entry) => entry.key === item.primary)?.label ?? '城墙';
              dispatch({ type: 'ENTER_CITY_WALL_GATE', moduleId: item.id, moduleName: item.name, systemId: item.primary, systemName });
            }
            if (definition.id === 'city-wall' && item.toolType === 'city-wall-access-stair') {
              const systemName = definition.primaryCategories.find((entry) => entry.key === item.primary)?.label ?? '城墙';
              dispatch({ type: 'ENTER_CITY_WALL_ACCESS_STAIR', moduleId: item.id, moduleName: item.name, systemId: item.primary, systemName });
            }
            if (definition.id === 'city-wall' && item.toolType === 'city-wall-transition-stair') {
              const systemName = definition.primaryCategories.find((entry) => entry.key === item.primary)?.label ?? '城墙';
              dispatch({ type: 'ENTER_CITY_WALL_TRANSITION_STAIR', moduleId: item.id, moduleName: item.name, systemId: item.primary, systemName });
            }
          }}
        />
      )}

      {workspacePresence.mounted && renderedWorkspace?.kind === 'blueprint' && (
        <BlueprintWorkspace
          key={renderedWorkspace.category}
          category={renderedWorkspace.category}
          motionPhase={workspacePresence.phase}
          onClose={() => dispatch({ type: 'CLOSE_WORKSPACE' })}
          onSelectItem={(item) => dialogs.toast('蓝图“' + item.name + '”的放置流程将在下一阶段接入。')}
        />
      )}

      {selectionPresence.mounted && renderedSelectedBuilding && renderedAppearance && (
        <>
          <BuildingSelectionInspector
            building={renderedSelectedBuilding}
            schemeName={renderedScheme.name}
            schemeOpen={state.buildingSchemeOpen}
            weathering={renderedAppearance.weathering}
            motionPhase={selectionPresence.phase}
            onOpenScheme={() => dispatch({ type: 'OPEN_SELECTED_BUILDING_SCHEME' })}
            onWeatheringChange={(weathering) => updateSelectedAppearance({ weathering })}
            onClose={() => dispatch({ type: 'CLEAR_SELECTION' })}
          />
          <BuildingSelectionActionBar
            motionPhase={selectionPresence.phase}
            schemeOpen={state.buildingSchemeOpen}
            onMove={() => dispatch({ type: 'ENTER_SELECTED_BUILDING_MOVE' })}
            onToggleScheme={() => dispatch({ type: 'TOGGLE_SELECTED_BUILDING_SCHEME' })}
            onClose={() => dispatch({ type: 'CLEAR_SELECTION' })}
          />
        </>
      )}

      {selectionSchemePresence.mounted && selectedBuilding && selectedAppearance && (
        <BuildingSchemeWorkspace
          motionPhase={selectionSchemePresence.phase}
          schemes={BUILDING_COLOR_SCHEMES}
          selectedSchemeId={selectedAppearance.schemeId}
          onApply={(schemeId) => updateSelectedAppearance({ schemeId })}
          onClose={() => dispatch({ type: 'CLOSE_SELECTED_BUILDING_SCHEME' })}
        />
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
          <CityWallAccessStairDock motionPhase={toolPresence.phase} onComplete={exitTool} onCancel={exitTool} />
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
          <CityWallTransitionStairDock motionPhase={toolPresence.phase} onComplete={exitTool} onCancel={exitTool} />
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

      {!state.paused && (
        <GameplayOperationHints
          tool={state.tool}
          workspace={state.workspace}
          dockCategory={state.dockCategory}
          selection={state.selection}
          buildingSchemeOpen={state.buildingSchemeOpen}
          management={state.management}
          contextPanel={state.contextPanel}
          mapView={state.mapView}
          mapPanelOpen={state.mapPanelOpen}
          worldDemolitionMode={state.worldDemolitionMode}
          buildingPlacementIntent={state.buildingPlacementIntent}
          roadDrawMode={state.roadDrawMode}
          terrainEditMode={state.terrainEditMode}
          treePlacementMode={state.treePlacementMode}
          colorToolMode={state.colorToolMode}
          cityWallConstructionMode={state.cityWallConstructionMode}
          cityWallGatePlacementMode={state.cityWallGatePlacementMode}
          utilityPresent={showContextUtilityToolbar}
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
