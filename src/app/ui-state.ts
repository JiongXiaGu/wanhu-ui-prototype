export type Screen = 'menu' | 'newGame' | 'load' | 'settings' | 'loading' | 'gameplay';
export type Flyout = 'none' | 'camera' | 'weather';
export type ManagementView = 'none' | 'city' | 'population' | 'finance' | 'policy' | 'commerce' | 'governance' | 'military';
export type MapView = 'default' | 'land-value' | 'population' | 'commerce' | 'traffic' | 'security' | 'water';
export type Workspace = 'none' | 'design';
export type Tool = 'none' | 'building-placement';
export type TerrainMode = 'balanced-earthwork' | 'fill-only' | 'manual-elevation';
export type AdjustmentMode = 'position' | 'massing' | 'roof' | 'facade';
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
  flyout: Flyout;
  management: ManagementView;
  mapView: MapView;
  mapPanelOpen: boolean;
  paused: boolean;
  pauseView: PauseView;
  speed: Speed;
  dockMode: DockMode;
  dockCategory: DockCategory | null;
  terrainMode: TerrainMode;
  adjustmentMode: AdjustmentMode;
  gridSnap: boolean;
  gridVisible: boolean;
  canUndo: boolean;
  canRedo: boolean;
}

export const initialGameplayUiState: GameplayUiState = {
  workspace: 'none',
  tool: 'none',
  flyout: 'none',
  management: 'none',
  mapView: 'default',
  mapPanelOpen: false,
  paused: false,
  pauseView: 'menu',
  speed: 1,
  dockMode: 'design',
  dockCategory: null,
  terrainMode: 'balanced-earthwork',
  adjustmentMode: 'position',
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
  | { type: 'EXIT_TOOL' }
  | { type: 'SET_FLYOUT'; flyout: Flyout }
  | { type: 'SET_MANAGEMENT'; management: ManagementView }
  | { type: 'TOGGLE_MAP_PANEL' }
  | { type: 'CLOSE_MAP_PANEL' }
  | { type: 'SET_MAP_VIEW'; mapView: MapView }
  | { type: 'SET_PAUSED'; paused: boolean }
  | { type: 'SET_PAUSE_VIEW'; view: PauseView }
  | { type: 'SET_SPEED'; speed: Speed }
  | { type: 'SET_TERRAIN_MODE'; mode: TerrainMode }
  | { type: 'SET_ADJUSTMENT_MODE'; mode: AdjustmentMode }
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
        mapPanelOpen: false,
      };
    case 'SET_DOCK_CATEGORY': {
      const dockCategory = state.dockCategory === action.category ? null : action.category;
      return {
        ...state,
        dockCategory,
        workspace: workspaceForDockSelection(state.dockMode, dockCategory),
        management: 'none',
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
        workspace: 'none',
        tool: 'building-placement',
        management: 'none',
        flyout: 'none',
        mapView: 'default',
        mapPanelOpen: false,
        terrainMode: 'balanced-earthwork',
        adjustmentMode: 'position',
        canUndo: false,
        canRedo: false,
      };
    case 'EXIT_TOOL':
      return {
        ...state,
        tool: 'none',
        workspace: 'design',
        dockMode: 'design',
        dockCategory: 'building',
        management: 'none',
        flyout: 'none',
        mapView: 'default',
        mapPanelOpen: false,
        canUndo: false,
        canRedo: false,
      };
    case 'SET_FLYOUT': {
      const flyout = togglePanel(state.flyout, action.flyout, 'none' as Flyout);
      return {
        ...state,
        flyout,
        management: flyout === 'none' ? state.management : 'none',
        mapPanelOpen: flyout === 'none' ? state.mapPanelOpen : false,
        mapView: flyout === 'none' ? state.mapView : 'default',
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
        dockCategory: opening && state.workspace !== 'none' ? null : state.dockCategory,
        flyout: opening ? 'none' : state.flyout,
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
        flyout: action.mapView === 'default' ? state.flyout : 'none',
      };
    case 'SET_PAUSED':
      return {
        ...state,
        paused: action.paused,
        pauseView: 'menu',
        management: action.paused ? 'none' : state.management,
        flyout: action.paused ? 'none' : state.flyout,
        mapView: action.paused ? 'default' : state.mapView,
        mapPanelOpen: false,
      };
    case 'SET_PAUSE_VIEW':
      return state.paused ? { ...state, pauseView: action.view } : state;
    case 'SET_SPEED':
      return { ...state, speed: action.speed };
    case 'SET_TERRAIN_MODE':
      return { ...state, terrainMode: action.mode, canUndo: true, canRedo: false };
    case 'SET_ADJUSTMENT_MODE':
      return { ...state, adjustmentMode: action.mode, canUndo: true, canRedo: false };
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
