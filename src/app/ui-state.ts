export type Screen = 'menu' | 'newGame' | 'load' | 'settings' | 'loading' | 'gameplay';
export type ContextPanel = 'none' | 'camera' | 'weather';
export type ManagementView = 'none' | 'city' | 'population' | 'finance' | 'inventory' | 'policy' | 'commerce' | 'governance' | 'military';
export type MapView = 'default' | 'land-value' | 'population' | 'commerce' | 'traffic' | 'security' | 'water';
export type Workspace = 'none' | 'design';
export type Tool = 'none' | 'building-placement' | 'road-placement' | 'terrain-edit' | 'tree-placement' | 'city-wall-construction' | 'city-wall-gate' | 'city-wall-access-stair' | 'city-wall-transition-stair' | 'color-tool';
export type BuildingTerrainMode = 'balanced-earthwork' | 'fill-only' | 'manual-elevation';
export type TerrainEditMode = 'raise' | 'lower' | 'flatten' | 'smooth' | 'slope';
export type TreePlacementMode = 'brush' | 'single';
export type AdjustmentMode = 'position' | 'massing' | 'roof' | 'facade';
export type RoadDrawMode = 'smart-curve' | 'curve' | 'straight';
export type CityWallConstructionMode = 'range' | 'fixed-width';
export type CityWallFacingSide = 'left' | 'right';
export type CityWallGatePlacementMode = 'free' | 'wall-connected';
export type ColorToolMode = 'surface' | 'lighting' | 'scheme';
export type GameplaySpace = 'gameplay' | 'management' | 'workspace' | 'tool' | 'pause';
export type PauseView = 'menu' | 'save' | 'settings';
export type Speed = 0 | 1 | 2 | 4;

export type DockMode = 'design' | 'blueprint';
export type DesignDockCategory =
  | 'road'
  | 'bridge'
  | 'building'
  | 'platform'
  | 'city-wall'
  | 'wall'
  | 'decoration'
  | 'tree';
export type BlueprintDockCategory =
  | 'all'
  | 'residential'
  | 'commercial'
  | 'workshop'
  | 'administration'
  | 'science'
  | 'faith'
  | 'military'
  | 'palace';
export type DockCategory = DesignDockCategory | BlueprintDockCategory;

export type ToolOrigin =
  | { kind: 'gameplay' }
  | { kind: 'design-workspace'; category: DesignDockCategory };

const DESIGN_DOCK_CATEGORIES: readonly DesignDockCategory[] = [
  'road',
  'bridge',
  'building',
  'platform',
  'city-wall',
  'wall',
  'decoration',
  'tree',
];

export function isDesignDockCategory(category: DockCategory | null): category is DesignDockCategory {
  return category !== null && DESIGN_DOCK_CATEGORIES.includes(category as DesignDockCategory);
}

export interface GameplayUiState {
  workspace: Workspace;
  tool: Tool;
  toolOrigin: ToolOrigin | null;
  contextPanel: ContextPanel;
  management: ManagementView;
  mapView: MapView;
  mapPanelOpen: boolean;
  paused: boolean;
  pauseView: PauseView;
  speed: Speed;
  dockMode: DockMode;
  dockCategory: DockCategory | null;
  buildingTerrainMode: BuildingTerrainMode;
  terrainEditMode: TerrainEditMode;
  terrainContours: boolean;
  terrainSlopeView: boolean;
  terrainProtectBuilt: boolean;
  treePlacementMode: TreePlacementMode;
  treeSpeciesId: string;
  treeSpeciesName: string;
  treeVariant: number;
  treeAvoidBuildings: boolean;
  treeAvoidRoads: boolean;
  cityWallConstructionMode: CityWallConstructionMode;
  cityWallFacingSide: CityWallFacingSide;
  cityWallModuleId: string;
  cityWallModuleName: string;
  cityWallSystemId: string;
  cityWallSystemName: string;
  cityWallTopLine: boolean;
  cityWallNodes: boolean;
  cityWallGatePlacementMode: CityWallGatePlacementMode;
  cityWallGateRotation: number;
  cityWallGateFacingFlipped: boolean;
  cityWallGateConnections: boolean;
  cityWallGateClearance: boolean;
  cityWallAccessStairRotation: number;
  cityWallAccessStairReversed: boolean;
  cityWallAccessStairClearance: boolean;
  cityWallTransitionStairRotation: number;
  cityWallTransitionStairReversed: boolean;
  cityWallTransitionStairClearance: boolean;
  colorToolMode: ColorToolMode;
  adjustmentMode: AdjustmentMode;
  roadDrawMode: RoadDrawMode;
  gridSnap: boolean;
  gridVisible: boolean;
  canUndo: boolean;
  canRedo: boolean;
}

export const initialGameplayUiState: GameplayUiState = {
  workspace: 'none',
  tool: 'none',
  toolOrigin: null,
  contextPanel: 'none',
  management: 'none',
  mapView: 'default',
  mapPanelOpen: false,
  paused: false,
  pauseView: 'menu',
  speed: 1,
  dockMode: 'design',
  dockCategory: null,
  buildingTerrainMode: 'balanced-earthwork',
  terrainEditMode: 'raise',
  terrainContours: false,
  terrainSlopeView: false,
  terrainProtectBuilt: true,
  treePlacementMode: 'brush',
  treeSpeciesId: 'tree-pine',
  treeSpeciesName: '油松',
  treeVariant: 0,
  treeAvoidBuildings: true,
  treeAvoidRoads: true,
  cityWallConstructionMode: 'range',
  cityWallFacingSide: 'right',
  cityWallModuleId: 'citywall-gentle-wall',
  cityWallModuleName: '标准墙段',
  cityWallSystemId: 'gentle-wall',
  cityWallSystemName: '小倾斜角',
  cityWallTopLine: true,
  cityWallNodes: true,
  cityWallGatePlacementMode: 'free',
  cityWallGateRotation: 0,
  cityWallGateFacingFlipped: false,
  cityWallGateConnections: true,
  cityWallGateClearance: true,
  cityWallAccessStairRotation: 0,
  cityWallAccessStairReversed: false,
  cityWallAccessStairClearance: true,
  cityWallTransitionStairRotation: 0,
  cityWallTransitionStairReversed: false,
  cityWallTransitionStairClearance: true,
  colorToolMode: 'surface',
  adjustmentMode: 'position',
  roadDrawMode: 'smart-curve',
  gridSnap: true,
  gridVisible: true,
  canUndo: false,
  canRedo: false,
};

export type GameplayUiAction =
  | { type: 'SET_DOCK_MODE'; mode: DockMode }
  | { type: 'SET_DOCK_CATEGORY'; category: DockCategory }
  | { type: 'CLOSE_WORKSPACE' }
  | { type: 'ENTER_BUILDING_PLACEMENT' }
  | { type: 'ENTER_ROAD_PLACEMENT' }
  | { type: 'ENTER_TREE_PLACEMENT'; speciesId: string; speciesName: string }
  | { type: 'ENTER_CITY_WALL_CONSTRUCTION'; moduleId: string; moduleName: string; systemId: string; systemName: string }
  | { type: 'ENTER_CITY_WALL_GATE'; moduleId: string; moduleName: string; systemId: string; systemName: string }
  | { type: 'ENTER_CITY_WALL_ACCESS_STAIR'; moduleId: string; moduleName: string; systemId: string; systemName: string }
  | { type: 'ENTER_CITY_WALL_TRANSITION_STAIR'; moduleId: string; moduleName: string; systemId: string; systemName: string }
  | { type: 'ENTER_TERRAIN_EDIT' }
  | { type: 'ENTER_COLOR_TOOL' }
  | { type: 'SET_COLOR_TOOL_MODE'; mode: ColorToolMode }
  | { type: 'EXIT_TOOL' }
  | { type: 'SET_CONTEXT_PANEL'; panel: ContextPanel }
  | { type: 'SET_MANAGEMENT'; management: ManagementView }
  | { type: 'TOGGLE_MAP_PANEL' }
  | { type: 'CLOSE_MAP_PANEL' }
  | { type: 'SET_MAP_VIEW'; mapView: MapView }
  | { type: 'SET_PAUSED'; paused: boolean }
  | { type: 'SET_PAUSE_VIEW'; view: PauseView }
  | { type: 'SET_SPEED'; speed: Speed }
  | { type: 'SET_BUILDING_TERRAIN_MODE'; mode: BuildingTerrainMode }
  | { type: 'SET_TERRAIN_EDIT_MODE'; mode: TerrainEditMode }
  | { type: 'TOGGLE_TERRAIN_CONTOURS' }
  | { type: 'TOGGLE_TERRAIN_SLOPE_VIEW' }
  | { type: 'TOGGLE_TERRAIN_PROTECTION' }
  | { type: 'SET_TREE_PLACEMENT_MODE'; mode: TreePlacementMode }
  | { type: 'SET_TREE_VARIANT'; variant: number }
  | { type: 'TOGGLE_TREE_AVOID_BUILDINGS' }
  | { type: 'TOGGLE_TREE_AVOID_ROADS' }
  | { type: 'SET_CITY_WALL_CONSTRUCTION_MODE'; mode: CityWallConstructionMode }
  | { type: 'FLIP_CITY_WALL_FACING' }
  | { type: 'TOGGLE_CITY_WALL_TOP_LINE' }
  | { type: 'TOGGLE_CITY_WALL_NODES' }
  | { type: 'SET_CITY_WALL_GATE_MODE'; mode: CityWallGatePlacementMode }
  | { type: 'ROTATE_CITY_WALL_GATE'; direction: 'left' | 'right' }
  | { type: 'FLIP_CITY_WALL_GATE_FACING' }
  | { type: 'TOGGLE_CITY_WALL_GATE_CONNECTIONS' }
  | { type: 'TOGGLE_CITY_WALL_GATE_CLEARANCE' }
  | { type: 'ROTATE_CITY_WALL_ACCESS_STAIR'; direction: 'left' | 'right' }
  | { type: 'FLIP_CITY_WALL_ACCESS_STAIR_DIRECTION' }
  | { type: 'TOGGLE_CITY_WALL_ACCESS_STAIR_CLEARANCE' }
  | { type: 'ROTATE_CITY_WALL_TRANSITION_STAIR'; direction: 'left' | 'right' }
  | { type: 'FLIP_CITY_WALL_TRANSITION_STAIR_DIRECTION' }
  | { type: 'TOGGLE_CITY_WALL_TRANSITION_STAIR_CLEARANCE' }
  | { type: 'SET_ADJUSTMENT_MODE'; mode: AdjustmentMode }
  | { type: 'SET_ROAD_DRAW_MODE'; mode: RoadDrawMode }
  | { type: 'TOGGLE_GRID_SNAP' }
  | { type: 'TOGGLE_GRID_VISIBLE' }
  | { type: 'MARK_HISTORY_DIRTY' }
  | { type: 'UNDO' }
  | { type: 'REDO' };

function togglePanel<T>(current: T, requested: T, closed: T): T {
  if (requested === closed) return closed;
  return current === requested ? closed : requested;
}

function workspaceForDockSelection(mode: DockMode, category: DockCategory | null): Workspace {
  return mode === 'design' && isDesignDockCategory(category) ? 'design' : 'none';
}

function captureToolOrigin(state: GameplayUiState): ToolOrigin {
  if (state.workspace === 'design' && isDesignDockCategory(state.dockCategory)) {
    return { kind: 'design-workspace', category: state.dockCategory };
  }
  return { kind: 'gameplay' };
}

export function gameplayUiReducer(state: GameplayUiState, action: GameplayUiAction): GameplayUiState {
  switch (action.type) {
    case 'SET_DOCK_MODE':
      if (state.dockMode === action.mode) return state;
      return {
        ...state,
        dockMode: action.mode,
        dockCategory: null,
        workspace: 'none',
        management: 'none',
        contextPanel: 'none',
        mapPanelOpen: false,
      };
    case 'SET_DOCK_CATEGORY': {
      const dockCategory = state.dockCategory === action.category ? null : action.category;
      const workspace = workspaceForDockSelection(state.dockMode, dockCategory);
      return {
        ...state,
        dockCategory,
        workspace,
        management: 'none',
        contextPanel: workspace === 'none' ? state.contextPanel : 'none',
        mapPanelOpen: false,
      };
    }
    case 'CLOSE_WORKSPACE':
      return {
        ...state,
        workspace: 'none',
        dockCategory: state.workspace === 'design' ? null : state.dockCategory,
      };
    case 'ENTER_BUILDING_PLACEMENT':
      return {
        ...state,
        toolOrigin: captureToolOrigin(state),
        workspace: 'none',
        tool: 'building-placement',
        management: 'none',
        contextPanel: 'none',
        mapView: 'default',
        mapPanelOpen: false,
        buildingTerrainMode: 'balanced-earthwork',
        adjustmentMode: 'position',
        canUndo: false,
        canRedo: false,
      };
    case 'ENTER_ROAD_PLACEMENT':
      return {
        ...state,
        toolOrigin: captureToolOrigin(state),
        workspace: 'none',
        tool: 'road-placement',
        management: 'none',
        contextPanel: 'none',
        mapView: 'default',
        mapPanelOpen: false,
        roadDrawMode: 'smart-curve',
        canUndo: false,
        canRedo: false,
      };
    case 'ENTER_TREE_PLACEMENT':
      return {
        ...state,
        toolOrigin: captureToolOrigin(state),
        workspace: 'none',
        tool: 'tree-placement',
        management: 'none',
        contextPanel: 'none',
        mapView: 'default',
        mapPanelOpen: false,
        treePlacementMode: 'brush',
        treeSpeciesId: action.speciesId,
        treeSpeciesName: action.speciesName,
        treeVariant: 0,
        canUndo: false,
        canRedo: false,
      };
    case 'ENTER_CITY_WALL_CONSTRUCTION':
      return {
        ...state,
        toolOrigin: captureToolOrigin(state),
        workspace: 'none',
        tool: 'city-wall-construction',
        management: 'none',
        contextPanel: 'none',
        mapView: 'default',
        mapPanelOpen: false,
        cityWallConstructionMode: 'range',
        cityWallFacingSide: 'right',
        cityWallModuleId: action.moduleId,
        cityWallModuleName: action.moduleName,
        cityWallSystemId: action.systemId,
        cityWallSystemName: action.systemName,
        cityWallTopLine: true,
        cityWallNodes: true,
        canUndo: false,
        canRedo: false,
      };
    case 'ENTER_CITY_WALL_GATE':
      return {
        ...state,
        toolOrigin: captureToolOrigin(state),
        workspace: 'none',
        tool: 'city-wall-gate',
        management: 'none',
        contextPanel: 'none',
        mapView: 'default',
        mapPanelOpen: false,
        cityWallModuleId: action.moduleId,
        cityWallModuleName: action.moduleName,
        cityWallSystemId: action.systemId,
        cityWallSystemName: action.systemName,
        cityWallGatePlacementMode: 'free',
        cityWallGateRotation: 0,
        cityWallGateFacingFlipped: false,
        cityWallGateConnections: true,
        cityWallGateClearance: true,
        canUndo: false,
        canRedo: false,
      };
    case 'ENTER_CITY_WALL_ACCESS_STAIR':
      return {
        ...state,
        toolOrigin: captureToolOrigin(state),
        workspace: 'none',
        tool: 'city-wall-access-stair',
        management: 'none',
        contextPanel: 'none',
        mapView: 'default',
        mapPanelOpen: false,
        cityWallModuleId: action.moduleId,
        cityWallModuleName: action.moduleName,
        cityWallSystemId: action.systemId,
        cityWallSystemName: action.systemName,
        cityWallAccessStairRotation: 0,
        cityWallAccessStairReversed: false,
        cityWallAccessStairClearance: true,
        canUndo: false,
        canRedo: false,
      };
    case 'ENTER_CITY_WALL_TRANSITION_STAIR':
      return {
        ...state,
        toolOrigin: captureToolOrigin(state),
        workspace: 'none',
        tool: 'city-wall-transition-stair',
        management: 'none',
        contextPanel: 'none',
        mapView: 'default',
        mapPanelOpen: false,
        cityWallModuleId: action.moduleId,
        cityWallModuleName: action.moduleName,
        cityWallSystemId: action.systemId,
        cityWallSystemName: action.systemName,
        cityWallTransitionStairRotation: 0,
        cityWallTransitionStairReversed: false,
        cityWallTransitionStairClearance: true,
        canUndo: false,
        canRedo: false,
      };
    case 'ENTER_COLOR_TOOL':
      return {
        ...state,
        toolOrigin: captureToolOrigin(state),
        workspace: 'none',
        tool: 'color-tool',
        management: 'none',
        contextPanel: 'none',
        mapView: 'default',
        mapPanelOpen: false,
        colorToolMode: 'surface',
        canUndo: false,
        canRedo: false,
      };
    case 'SET_COLOR_TOOL_MODE':
      return { ...state, colorToolMode: action.mode };
    case 'ENTER_TERRAIN_EDIT':
      return {
        ...state,
        toolOrigin: captureToolOrigin(state),
        workspace: 'none',
        tool: 'terrain-edit',
        management: 'none',
        contextPanel: 'none',
        mapView: 'default',
        mapPanelOpen: false,
        terrainEditMode: 'raise',
        canUndo: false,
        canRedo: false,
      };
    case 'EXIT_TOOL': {
      const returnCategory = state.toolOrigin?.kind === 'design-workspace'
        ? state.toolOrigin.category
        : null;
      const returningToWorkspace = returnCategory !== null;
      return {
        ...state,
        tool: 'none',
        toolOrigin: null,
        workspace: returningToWorkspace ? 'design' : 'none',
        dockMode: returningToWorkspace ? 'design' : state.dockMode,
        dockCategory: returnCategory,
        management: 'none',
        contextPanel: 'none',
        mapView: 'default',
        mapPanelOpen: false,
        canUndo: false,
        canRedo: false,
      };
    }
    case 'SET_CONTEXT_PANEL': {
      const contextPanel = togglePanel(state.contextPanel, action.panel, 'none' as ContextPanel);
      const opening = contextPanel !== 'none';
      return {
        ...state,
        contextPanel,
        workspace: opening ? 'none' : state.workspace,
        dockCategory: opening && state.workspace === 'design' ? null : state.dockCategory,
        management: opening ? 'none' : state.management,
        mapPanelOpen: opening ? false : state.mapPanelOpen,
        mapView: opening ? 'default' : state.mapView,
      };
    }
    case 'SET_MANAGEMENT': {
      const management = togglePanel(state.management, action.management, 'none' as ManagementView);
      const opening = management !== 'none';
      return {
        ...state,
        management,
        workspace: opening ? 'none' : state.workspace,
        tool: opening ? 'none' : state.tool,
        toolOrigin: opening ? null : state.toolOrigin,
        dockCategory: opening && state.workspace !== 'none' ? null : state.dockCategory,
        contextPanel: opening ? 'none' : state.contextPanel,
        mapView: opening ? 'default' : state.mapView,
        mapPanelOpen: false,
      };
    }
    case 'TOGGLE_MAP_PANEL': {
      const mapPanelOpen = !state.mapPanelOpen;
      return {
        ...state,
        mapPanelOpen,
        management: mapPanelOpen ? 'none' : state.management,
        contextPanel: mapPanelOpen ? 'none' : state.contextPanel,
      };
    }
    case 'CLOSE_MAP_PANEL':
      return { ...state, mapPanelOpen: false };
    case 'SET_MAP_VIEW':
      return {
        ...state,
        mapView: action.mapView,
        mapPanelOpen: false,
        management: action.mapView === 'default' ? state.management : 'none',
        contextPanel: action.mapView === 'default' ? state.contextPanel : 'none',
      };
    case 'SET_PAUSED':
      return {
        ...state,
        paused: action.paused,
        pauseView: 'menu',
        management: action.paused ? 'none' : state.management,
        contextPanel: action.paused ? 'none' : state.contextPanel,
        mapView: action.paused ? 'default' : state.mapView,
        mapPanelOpen: false,
      };
    case 'SET_PAUSE_VIEW':
      return state.paused ? { ...state, pauseView: action.view } : state;
    case 'SET_SPEED':
      return { ...state, speed: action.speed };
    case 'SET_BUILDING_TERRAIN_MODE':
      return { ...state, buildingTerrainMode: action.mode, canUndo: true, canRedo: false };
    case 'SET_TERRAIN_EDIT_MODE':
      return { ...state, terrainEditMode: action.mode };
    case 'TOGGLE_TERRAIN_CONTOURS':
      return { ...state, terrainContours: !state.terrainContours };
    case 'TOGGLE_TERRAIN_SLOPE_VIEW':
      return { ...state, terrainSlopeView: !state.terrainSlopeView };
    case 'TOGGLE_TERRAIN_PROTECTION':
      return { ...state, terrainProtectBuilt: !state.terrainProtectBuilt };
    case 'SET_TREE_PLACEMENT_MODE':
      return { ...state, treePlacementMode: action.mode, treeVariant: action.mode === 'single' && state.treeVariant === 0 ? 1 : state.treeVariant };
    case 'SET_TREE_VARIANT':
      return { ...state, treeVariant: Math.max(0, Math.min(4, action.variant)) };
    case 'TOGGLE_TREE_AVOID_BUILDINGS':
      return { ...state, treeAvoidBuildings: !state.treeAvoidBuildings };
    case 'TOGGLE_TREE_AVOID_ROADS':
      return { ...state, treeAvoidRoads: !state.treeAvoidRoads };
    case 'SET_CITY_WALL_CONSTRUCTION_MODE':
      return { ...state, cityWallConstructionMode: action.mode, canUndo: true, canRedo: false };
    case 'FLIP_CITY_WALL_FACING':
      return state.cityWallConstructionMode === 'fixed-width'
        ? { ...state, cityWallFacingSide: state.cityWallFacingSide === 'left' ? 'right' : 'left', canUndo: true, canRedo: false }
        : state;
    case 'TOGGLE_CITY_WALL_TOP_LINE':
      return { ...state, cityWallTopLine: !state.cityWallTopLine };
    case 'TOGGLE_CITY_WALL_NODES':
      return { ...state, cityWallNodes: !state.cityWallNodes };
    case 'SET_CITY_WALL_GATE_MODE':
      return {
        ...state,
        cityWallGatePlacementMode: action.mode,
        cityWallGateRotation: action.mode === 'wall-connected' ? 0 : state.cityWallGateRotation,
        cityWallGateFacingFlipped: false,
        canUndo: true,
        canRedo: false,
      };
    case 'ROTATE_CITY_WALL_GATE':
      return state.cityWallGatePlacementMode === 'free'
        ? { ...state, cityWallGateRotation: (state.cityWallGateRotation + (action.direction === 'right' ? 90 : 270)) % 360, canUndo: true, canRedo: false }
        : state;
    case 'FLIP_CITY_WALL_GATE_FACING':
      return { ...state, cityWallGateFacingFlipped: !state.cityWallGateFacingFlipped, canUndo: true, canRedo: false };
    case 'TOGGLE_CITY_WALL_GATE_CONNECTIONS':
      return { ...state, cityWallGateConnections: !state.cityWallGateConnections };
    case 'TOGGLE_CITY_WALL_GATE_CLEARANCE':
      return { ...state, cityWallGateClearance: !state.cityWallGateClearance };
    case 'ROTATE_CITY_WALL_ACCESS_STAIR':
      return {
        ...state,
        cityWallAccessStairRotation: (state.cityWallAccessStairRotation + (action.direction === 'right' ? 90 : 270)) % 360,
        canUndo: true,
        canRedo: false,
      };
    case 'FLIP_CITY_WALL_ACCESS_STAIR_DIRECTION':
      return { ...state, cityWallAccessStairReversed: !state.cityWallAccessStairReversed, canUndo: true, canRedo: false };
    case 'TOGGLE_CITY_WALL_ACCESS_STAIR_CLEARANCE':
      return { ...state, cityWallAccessStairClearance: !state.cityWallAccessStairClearance };
    case 'ROTATE_CITY_WALL_TRANSITION_STAIR':
      return {
        ...state,
        cityWallTransitionStairRotation: (state.cityWallTransitionStairRotation + (action.direction === 'right' ? 90 : 270)) % 360,
        canUndo: true,
        canRedo: false,
      };
    case 'FLIP_CITY_WALL_TRANSITION_STAIR_DIRECTION':
      return { ...state, cityWallTransitionStairReversed: !state.cityWallTransitionStairReversed, canUndo: true, canRedo: false };
    case 'TOGGLE_CITY_WALL_TRANSITION_STAIR_CLEARANCE':
      return { ...state, cityWallTransitionStairClearance: !state.cityWallTransitionStairClearance };
    case 'SET_ADJUSTMENT_MODE':
      return { ...state, adjustmentMode: action.mode, canUndo: true, canRedo: false };
    case 'SET_ROAD_DRAW_MODE':
      return { ...state, roadDrawMode: action.mode, canUndo: true, canRedo: false };
    case 'TOGGLE_GRID_SNAP':
      return { ...state, gridSnap: !state.gridSnap, canUndo: true, canRedo: false };
    case 'TOGGLE_GRID_VISIBLE':
      return { ...state, gridVisible: !state.gridVisible, canUndo: true, canRedo: false };
    case 'MARK_HISTORY_DIRTY':
      return { ...state, canUndo: true, canRedo: false };
    case 'UNDO':
      return state.canUndo ? { ...state, canUndo: false, canRedo: true } : state;
    case 'REDO':
      return state.canRedo ? { ...state, canUndo: true, canRedo: false } : state;
    default:
      return state;
  }
}

export function selectGameplaySpace(state: GameplayUiState): GameplaySpace {
  if (state.paused) return 'pause';
  if (state.tool !== 'none') return 'tool';
  if (state.workspace !== 'none') return 'workspace';
  if (state.management !== 'none') return 'management';
  return 'gameplay';
}
