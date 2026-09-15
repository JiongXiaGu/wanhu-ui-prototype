export type Screen = 'menu' | 'newGame' | 'load' | 'settings' | 'loading' | 'gameplay';
export type Flyout = 'none' | 'camera' | 'weather';
export type ManagementView = 'none' | 'city' | 'population' | 'finance' | 'policy' | 'commerce' | 'governance' | 'military';
export type MapView = 'default' | 'land-value' | 'population' | 'commerce' | 'traffic' | 'security' | 'water';
export type Workspace = 'none' | 'building';
export type Tool = 'none' | 'building-placement';
export type TerrainMode = 'balanced-earthwork' | 'fill-only' | 'manual-elevation';
export type AdjustmentMode = 'position' | 'massing' | 'roof' | 'facade';
export type GameplaySpace = 'gameplay' | 'management' | 'workspace' | 'tool' | 'pause';
export type PauseView = 'menu' | 'save' | 'settings';
export type Speed = 0 | 1 | 2 | 4;

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
  activeCategory: string;
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
  activeCategory: '全部',
  terrainMode: 'balanced-earthwork',
  adjustmentMode: 'position',
  gridSnap: true,
  gridVisible: true,
  canUndo: false,
  canRedo: false,
};

export type GameplayUiAction =
  | { type: 'SET_CATEGORY'; category: string }
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

function workspaceForCategory(category: string): Workspace {
  return category === '建筑' ? 'building' : 'none';
}

export function gameplayUiReducer(state: GameplayUiState, action: GameplayUiAction): GameplayUiState {
  switch (action.type) {
    case 'SET_CATEGORY': {
      const targetWorkspace = workspaceForCategory(action.category);
      const closingSameWorkspace = targetWorkspace !== 'none'
        && state.workspace === targetWorkspace
        && state.activeCategory === action.category;

      return {
        ...state,
        activeCategory: closingSameWorkspace ? '全部' : action.category,
        workspace: closingSameWorkspace ? 'none' : targetWorkspace,
        management: 'none',
        mapPanelOpen: false,
      };
    }
    case 'CLOSE_WORKSPACE':
      return {
        ...state,
        workspace: 'none',
        activeCategory: state.workspace === 'building' && state.activeCategory === '建筑' ? '全部' : state.activeCategory,
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
        workspace: 'building',
        activeCategory: '建筑',
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
        activeCategory: opening && state.workspace === 'building' ? '全部' : state.activeCategory,
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
