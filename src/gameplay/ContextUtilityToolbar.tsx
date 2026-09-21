import { useEffect, useRef, useState } from 'react';
import type { UiIconComponent } from '../ui/icons/runtime-icons.generated';
import {
  Building2,
  Copy,
  Grid3X3,
  Magnet,
  Move,
  Redo2,
  Route,
  Ruler,
  Layers3,
  ShieldCheck,
  ScanLine,
  Undo2,
  Trash2,
} from '../ui/icons/runtime-icons.generated';
import type { CityWallGatePlacementMode, Tool, WorldSelection } from '../app/ui-state';

export type UtilityContext = 'world' | 'building-selection' | 'building-placement' | 'road-placement' | 'terrain-edit' | 'tree-placement' | 'city-wall-construction' | 'city-wall-gate-free' | 'city-wall-gate-connected' | 'city-wall-access-stair' | 'city-wall-transition-stair' | 'color-tool';
type UtilityKind = 'toggle' | 'action' | 'history';
export type UtilityItemId =
  | 'selection-focus-building'
  | 'selection-remove-building'
  | 'world-bulk-demolish'
  | 'grid-snap'
  | 'grid-visible'
  | 'copy'
  | 'move'
  | 'undo'
  | 'redo'
  | 'building-align-road'
  | 'building-calibrate-footprint'
  | 'road-straighten-segment'
  | 'road-connect-node'
  | 'terrain-contours'
  | 'terrain-slope-view'
  | 'terrain-protect-built'
  | 'tree-avoid-buildings'
  | 'tree-avoid-roads'
  | 'city-wall-top-line'
  | 'city-wall-nodes'
  | 'city-wall-gate-connections'
  | 'city-wall-gate-clearance'
  | 'city-wall-access-stair-clearance'
  | 'city-wall-transition-stair-clearance';

interface UtilityItem {
  id: UtilityItemId;
  label: string;
  icon: UiIconComponent;
  kind: UtilityKind;
}

interface ContextUtilityToolbarProps {
  tool: Tool;
  selection: WorldSelection;
  worldDemolitionMode: boolean;
  gridSnap: boolean;
  gridVisible: boolean;
  canUndo: boolean;
  canRedo: boolean;
  terrainContours: boolean;
  terrainSlopeView: boolean;
  terrainProtectBuilt: boolean;
  treeAvoidBuildings: boolean;
  treeAvoidRoads: boolean;
  cityWallTopLine: boolean;
  cityWallNodes: boolean;
  cityWallGatePlacementMode: CityWallGatePlacementMode;
  cityWallGateConnections: boolean;
  cityWallGateClearance: boolean;
  cityWallAccessStairClearance: boolean;
  cityWallTransitionStairClearance: boolean;
  onToggleGridSnap: () => void;
  onToggleGridVisible: () => void;
  onToggleWorldDemolitionMode: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onToggleTerrainContours: () => void;
  onToggleTerrainSlopeView: () => void;
  onToggleTerrainProtection: () => void;
  onToggleTreeAvoidBuildings: () => void;
  onToggleTreeAvoidRoads: () => void;
  onToggleCityWallTopLine: () => void;
  onToggleCityWallNodes: () => void;
  onToggleCityWallGateConnections: () => void;
  onToggleCityWallGateClearance: () => void;
  onToggleCityWallAccessStairClearance: () => void;
  onToggleCityWallTransitionStairClearance: () => void;
  onToolAction: (id: UtilityItemId) => void;
}

const WORLD_GROUPS: readonly (readonly UtilityItem[])[] = [
  [
    { id: 'grid-snap', label: '网格吸附', icon: Magnet, kind: 'toggle' },
    { id: 'grid-visible', label: '网格显示', icon: Grid3X3, kind: 'toggle' },
    { id: 'copy', label: '范围复制', icon: Copy, kind: 'action' },
    { id: 'move', label: '范围移动', icon: Move, kind: 'action' },
  ],
  [
    { id: 'undo', label: '撤销 · Ctrl+Z', icon: Undo2, kind: 'history' },
    { id: 'redo', label: '重做 · Ctrl+Y', icon: Redo2, kind: 'history' },
  ],
  [
    { id: 'world-bulk-demolish', label: '批量摧毁建筑', icon: Trash2, kind: 'toggle' },
  ],
];

const BUILDING_GROUPS: readonly (readonly UtilityItem[])[] = [
  [
    { id: 'grid-snap', label: '网格吸附', icon: Magnet, kind: 'toggle' },
    { id: 'grid-visible', label: '网格显示', icon: Grid3X3, kind: 'toggle' },
  ],
  [
    { id: 'building-align-road', label: '对齐最近道路', icon: Route, kind: 'action' },
    { id: 'building-calibrate-footprint', label: '校准建筑基底', icon: Building2, kind: 'action' },
  ],
  [
    { id: 'undo', label: '撤销 · Ctrl+Z', icon: Undo2, kind: 'history' },
    { id: 'redo', label: '重做 · Ctrl+Y', icon: Redo2, kind: 'history' },
  ],
];

const ROAD_GROUPS: readonly (readonly UtilityItem[])[] = [
  [
    { id: 'grid-snap', label: '网格吸附', icon: Magnet, kind: 'toggle' },
    { id: 'grid-visible', label: '网格显示', icon: Grid3X3, kind: 'toggle' },
  ],
  [
    { id: 'road-straighten-segment', label: '拉直当前道路段', icon: Ruler, kind: 'action' },
    { id: 'road-connect-node', label: '连接最近道路节点', icon: Route, kind: 'action' },
  ],
  [
    { id: 'undo', label: '撤销 · Ctrl+Z', icon: Undo2, kind: 'history' },
    { id: 'redo', label: '重做 · Ctrl+Y', icon: Redo2, kind: 'history' },
  ],
];


const TERRAIN_GROUPS: readonly (readonly UtilityItem[])[] = [
  [
    { id: 'grid-visible', label: '网格显示', icon: Grid3X3, kind: 'toggle' },
    { id: 'terrain-contours', label: '等高线', icon: Layers3, kind: 'toggle' },
    { id: 'terrain-slope-view', label: '坡度视图', icon: Mountain, kind: 'toggle' },
    { id: 'terrain-protect-built', label: '保护已建区域', icon: ShieldCheck, kind: 'toggle' },
  ],
  [
    { id: 'undo', label: '撤销 · Ctrl+Z', icon: Undo2, kind: 'history' },
    { id: 'redo', label: '重做 · Ctrl+Y', icon: Redo2, kind: 'history' },
  ],
];

const TREE_GROUPS: readonly (readonly UtilityItem[])[] = [
  [
    { id: 'tree-avoid-buildings', label: '避让建筑', icon: Building2, kind: 'toggle' },
    { id: 'tree-avoid-roads', label: '避让道路', icon: Route, kind: 'toggle' },
  ],
  [
    { id: 'undo', label: '撤销 · Ctrl+Z', icon: Undo2, kind: 'history' },
    { id: 'redo', label: '重做 · Ctrl+Y', icon: Redo2, kind: 'history' },
  ],
];

const CITY_WALL_CONSTRUCTION_GROUPS: readonly (readonly UtilityItem[])[] = [
  [
    { id: 'grid-snap', label: '网格吸附', icon: Magnet, kind: 'toggle' },
    { id: 'grid-visible', label: '网格显示', icon: Grid3X3, kind: 'toggle' },
  ],
  [
    { id: 'city-wall-top-line', label: '墙顶线', icon: Layers3, kind: 'toggle' },
    { id: 'city-wall-nodes', label: '节点显示', icon: ScanLine, kind: 'toggle' },
  ],
  [
    { id: 'undo', label: '撤销 · Ctrl+Z', icon: Undo2, kind: 'history' },
    { id: 'redo', label: '重做 · Ctrl+Y', icon: Redo2, kind: 'history' },
  ],
];

const CITY_WALL_GATE_FREE_GROUPS: readonly (readonly UtilityItem[])[] = [
  [
    { id: 'grid-snap', label: '网格吸附', icon: Magnet, kind: 'toggle' },
    { id: 'grid-visible', label: '网格显示', icon: Grid3X3, kind: 'toggle' },
    { id: 'city-wall-gate-clearance', label: '门洞净空', icon: Ruler, kind: 'toggle' },
  ],
  [
    { id: 'undo', label: '撤销 · Ctrl+Z', icon: Undo2, kind: 'history' },
    { id: 'redo', label: '重做 · Ctrl+Y', icon: Redo2, kind: 'history' },
  ],
];

const CITY_WALL_GATE_CONNECTED_GROUPS: readonly (readonly UtilityItem[])[] = [
  [
    { id: 'grid-visible', label: '网格显示', icon: Grid3X3, kind: 'toggle' },
    { id: 'city-wall-gate-connections', label: '墙体连接点', icon: ScanLine, kind: 'toggle' },
    { id: 'city-wall-gate-clearance', label: '门洞净空', icon: Ruler, kind: 'toggle' },
  ],
  [
    { id: 'undo', label: '撤销 · Ctrl+Z', icon: Undo2, kind: 'history' },
    { id: 'redo', label: '重做 · Ctrl+Y', icon: Redo2, kind: 'history' },
  ],
];

const CITY_WALL_ACCESS_STAIR_GROUPS: readonly (readonly UtilityItem[])[] = [
  [
    { id: 'grid-snap', label: '网格吸附', icon: Magnet, kind: 'toggle' },
    { id: 'grid-visible', label: '网格显示', icon: Grid3X3, kind: 'toggle' },
    { id: 'city-wall-access-stair-clearance', label: '楼梯净空', icon: Ruler, kind: 'toggle' },
  ],
  [
    { id: 'undo', label: '撤销 · Ctrl+Z', icon: Undo2, kind: 'history' },
    { id: 'redo', label: '重做 · Ctrl+Y', icon: Redo2, kind: 'history' },
  ],
];

const CITY_WALL_TRANSITION_STAIR_GROUPS: readonly (readonly UtilityItem[])[] = [
  [
    { id: 'grid-snap', label: '网格吸附', icon: Magnet, kind: 'toggle' },
    { id: 'grid-visible', label: '网格显示', icon: Grid3X3, kind: 'toggle' },
    { id: 'city-wall-transition-stair-clearance', label: '楼梯净空', icon: Ruler, kind: 'toggle' },
  ],
  [
    { id: 'undo', label: '撤销 · Ctrl+Z', icon: Undo2, kind: 'history' },
    { id: 'redo', label: '重做 · Ctrl+Y', icon: Redo2, kind: 'history' },
  ],
];

const BUILDING_SELECTION_GROUPS: readonly (readonly UtilityItem[])[] = [
  [
    { id: 'selection-focus-building', label: '聚焦所选建筑', icon: ScanLine, kind: 'action' },
  ],
  [
    { id: 'undo', label: '撤销 · Ctrl+Z', icon: Undo2, kind: 'history' },
    { id: 'redo', label: '重做 · Ctrl+Y', icon: Redo2, kind: 'history' },
  ],
  [
    { id: 'selection-remove-building', label: '移除建筑', icon: Trash2, kind: 'action' },
  ],
];

const COLOR_TOOL_GROUPS: readonly (readonly UtilityItem[])[] = [
  [
    { id: 'undo', label: '撤销 · Ctrl+Z', icon: Undo2, kind: 'history' },
    { id: 'redo', label: '重做 · Ctrl+Y', icon: Redo2, kind: 'history' },
  ],
];

const DEFINITIONS: Record<UtilityContext, readonly (readonly UtilityItem[])[]> = {
  world: WORLD_GROUPS,
  'building-selection': BUILDING_SELECTION_GROUPS,
  'building-placement': BUILDING_GROUPS,
  'road-placement': ROAD_GROUPS,
  'terrain-edit': TERRAIN_GROUPS,
  'tree-placement': TREE_GROUPS,
  'city-wall-construction': CITY_WALL_CONSTRUCTION_GROUPS,
  'city-wall-gate-free': CITY_WALL_GATE_FREE_GROUPS,
  'city-wall-gate-connected': CITY_WALL_GATE_CONNECTED_GROUPS,
  'city-wall-access-stair': CITY_WALL_ACCESS_STAIR_GROUPS,
  'city-wall-transition-stair': CITY_WALL_TRANSITION_STAIR_GROUPS,
  'color-tool': COLOR_TOOL_GROUPS,
};

function contextForState(tool: Tool, gateMode: CityWallGatePlacementMode, selection: WorldSelection): UtilityContext {
  if (tool === 'building-placement') return 'building-placement';
  if (tool === 'road-placement') return 'road-placement';
  if (tool === 'terrain-edit') return 'terrain-edit';
  if (tool === 'tree-placement') return 'tree-placement';
  if (tool === 'city-wall-construction') return 'city-wall-construction';
  if (tool === 'city-wall-gate') return gateMode === 'wall-connected' ? 'city-wall-gate-connected' : 'city-wall-gate-free';
  if (tool === 'city-wall-access-stair') return 'city-wall-access-stair';
  if (tool === 'city-wall-transition-stair') return 'city-wall-transition-stair';
  if (tool === 'color-tool') return 'color-tool';
  if (selection?.kind === 'building') return 'building-selection';
  return 'world';
}

function ariaLabelForContext(context: UtilityContext) {
  if (context === 'building-selection') return '选中建筑快捷工具';
  if (context === 'building-placement') return '建筑放置辅助工具';
  if (context === 'road-placement') return '道路铺设辅助工具';
  if (context === 'terrain-edit') return '地形编辑辅助工具';
  if (context === 'tree-placement') return '树木放置辅助工具';
  if (context === 'city-wall-construction') return '城墙主体营造辅助工具';
  if (context === 'city-wall-gate-free') return '城墙门洞自由放置辅助工具';
  if (context === 'city-wall-gate-connected') return '城墙门洞连接辅助工具';
  if (context === 'city-wall-access-stair') return '登城梯放置辅助工具';
  if (context === 'city-wall-transition-stair') return '高差楼梯放置辅助工具';
  if (context === 'color-tool') return '配色工具辅助操作';
  return '世界工具';
}

export function ContextUtilityToolbar({
  tool,
  selection,
  worldDemolitionMode,
  gridSnap,
  gridVisible,
  canUndo,
  canRedo,
  terrainContours,
  terrainSlopeView,
  terrainProtectBuilt,
  treeAvoidBuildings,
  treeAvoidRoads,
  cityWallTopLine,
  cityWallNodes,
  cityWallGatePlacementMode,
  cityWallGateConnections,
  cityWallGateClearance,
  cityWallAccessStairClearance,
  cityWallTransitionStairClearance,
  onToggleGridSnap,
  onToggleGridVisible,
  onToggleWorldDemolitionMode,
  onUndo,
  onRedo,
  onToggleTerrainContours,
  onToggleTerrainSlopeView,
  onToggleTerrainProtection,
  onToggleTreeAvoidBuildings,
  onToggleTreeAvoidRoads,
  onToggleCityWallTopLine,
  onToggleCityWallNodes,
  onToggleCityWallGateConnections,
  onToggleCityWallGateClearance,
  onToggleCityWallAccessStairClearance,
  onToggleCityWallTransitionStairClearance,
  onToolAction,
}: ContextUtilityToolbarProps) {
  const requestedContext = contextForState(tool, cityWallGatePlacementMode, selection);
  const [displayedContext, setDisplayedContext] = useState<UtilityContext>(requestedContext);
  const [phase, setPhase] = useState<'steady' | 'exiting' | 'entering'>('steady');
  const swapTimer = useRef<number | null>(null);
  const enterTimer = useRef<number | null>(null);

  useEffect(() => {
    if (swapTimer.current !== null) window.clearTimeout(swapTimer.current);
    if (enterTimer.current !== null) window.clearTimeout(enterTimer.current);

    if (requestedContext === displayedContext) {
      setPhase('steady');
      return;
    }

    setPhase('exiting');
    swapTimer.current = window.setTimeout(() => {
      setDisplayedContext(requestedContext);
      setPhase('entering');
      enterTimer.current = window.setTimeout(() => setPhase('steady'), 24);
    }, 100);

    return () => {
      if (swapTimer.current !== null) window.clearTimeout(swapTimer.current);
      if (enterTimer.current !== null) window.clearTimeout(enterTimer.current);
    };
  }, [requestedContext]);

  function getState(item: UtilityItem) {
    if (item.id === 'grid-snap') return { active: gridSnap, pressed: gridSnap, onClick: onToggleGridSnap };
    if (item.id === 'grid-visible') return { active: gridVisible, pressed: gridVisible, onClick: onToggleGridVisible };
    if (item.id === 'world-bulk-demolish') return { active: worldDemolitionMode, pressed: worldDemolitionMode, onClick: onToggleWorldDemolitionMode };
    if (item.id === 'undo') return { disabled: !canUndo, onClick: onUndo };
    if (item.id === 'redo') return { disabled: !canRedo, onClick: onRedo };
    if (item.id === 'terrain-contours') return { active: terrainContours, pressed: terrainContours, onClick: onToggleTerrainContours };
    if (item.id === 'terrain-slope-view') return { active: terrainSlopeView, pressed: terrainSlopeView, onClick: onToggleTerrainSlopeView };
    if (item.id === 'terrain-protect-built') return { active: terrainProtectBuilt, pressed: terrainProtectBuilt, onClick: onToggleTerrainProtection };
    if (item.id === 'tree-avoid-buildings') return { active: treeAvoidBuildings, pressed: treeAvoidBuildings, onClick: onToggleTreeAvoidBuildings };
    if (item.id === 'tree-avoid-roads') return { active: treeAvoidRoads, pressed: treeAvoidRoads, onClick: onToggleTreeAvoidRoads };
    if (item.id === 'city-wall-top-line') return { active: cityWallTopLine, pressed: cityWallTopLine, onClick: onToggleCityWallTopLine };
    if (item.id === 'city-wall-nodes') return { active: cityWallNodes, pressed: cityWallNodes, onClick: onToggleCityWallNodes };
    if (item.id === 'city-wall-gate-connections') return { active: cityWallGateConnections, pressed: cityWallGateConnections, onClick: onToggleCityWallGateConnections };
    if (item.id === 'city-wall-gate-clearance') return { active: cityWallGateClearance, pressed: cityWallGateClearance, onClick: onToggleCityWallGateClearance };
    if (item.id === 'city-wall-access-stair-clearance') return { active: cityWallAccessStairClearance, pressed: cityWallAccessStairClearance, onClick: onToggleCityWallAccessStairClearance };
    if (item.id === 'city-wall-transition-stair-clearance') return { active: cityWallTransitionStairClearance, pressed: cityWallTransitionStairClearance, onClick: onToggleCityWallTransitionStairClearance };
    if (item.kind === 'action') return { onClick: () => onToolAction(item.id) };
    return {};
  }

  const groups = DEFINITIONS[displayedContext];
  const rows: readonly (readonly (readonly UtilityItem[])[])[] = [groups];

  return (
    <div
      className={`context-utility-toolbar command-utility bottom-command-surface bottom-command-surface--sm is-${phase}`}
      data-utility-context={displayedContext}
      aria-label={ariaLabelForContext(displayedContext)}
      aria-busy={phase !== 'steady'}
    >
      {rows.map((row, rowIndex) => (
        <div className="context-utility-toolbar__row" data-utility-row={rowIndex + 1} key={rowIndex}>
          {row.map((group, groupIndex) => (
            <span className="context-utility-toolbar__group" key={group[0].id}>
              {groupIndex > 0 && <i className="context-utility-toolbar__separator" aria-hidden="true" />}
              {group.map((item) => {
                const Icon = item.icon;
                const state = getState(item);
                const danger = item.id === 'selection-remove-building' || item.id === 'world-bulk-demolish';
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`context-utility-toolbar__button ${state.active ? 'is-active' : ''} ${danger ? 'is-danger' : ''}`}
                    data-utility-kind={item.kind}
                    data-tooltip={item.label}
                    aria-label={item.label}
                    aria-pressed={item.kind === 'toggle' ? state.pressed : undefined}
                    disabled={state.disabled || phase !== 'steady'}
                    onClick={state.onClick}
                  >
                    <Icon />
                  </button>
                );
              })}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
