import type {
  BuildingPlacementIntent,
  CityWallConstructionMode,
  CityWallGatePlacementMode,
  ColorToolMode,
  ContextPanel,
  DockCategory,
  ManagementView,
  MapView,
  RoadDrawMode,
  TerrainEditMode,
  Tool,
  TreePlacementMode,
  Workspace,
  WorldSelection,
} from '../app/ui-state';

type HintRow = { binding: string; description: string; primary?: boolean };
type HintPreset = { id: string; task: string; rows: HintRow[] };

const gameplayPreset: HintPreset = {
  id: 'world',
  task: '操作提示',
  rows: [
    { binding: '鼠标右键', description: '旋转', primary: true },
    { binding: 'W / A / S / D', description: '移动' },
    { binding: '鼠标滚轮', description: '缩放' },
    { binding: 'Esc', description: '菜单' },
  ],
};

const demolitionPreset: HintPreset = {
  id: 'world-demolition',
  task: '批量摧毁',
  rows: [
    { binding: '鼠标左键拖动', description: '框选待摧毁建筑', primary: true },
    { binding: 'Shift', description: '追加选择范围' },
    { binding: 'Alt', description: '从选择中排除' },
    { binding: 'Enter', description: '确认摧毁' },
    { binding: 'Esc', description: '退出摧毁模式' },
  ],
};

const buildingSelectionPreset: HintPreset = {
  id: 'building-selection',
  task: '建筑选中',
  rows: [
    { binding: '鼠标左键', description: '选择其他建筑', primary: true },
    { binding: '鼠标右键', description: '旋转镜头' },
    { binding: 'W / A / S / D', description: '移动镜头' },
    { binding: '鼠标滚轮', description: '缩放镜头' },
    { binding: 'Esc', description: '取消选择' },
  ],
};

const buildingSchemePreset: HintPreset = {
  id: 'building-scheme',
  task: '建筑配色方案',
  rows: [
    { binding: '鼠标左键', description: '应用方案', primary: true },
    { binding: '鼠标滚轮', description: '浏览方案' },
    { binding: 'Esc', description: '返回建筑信息' },
  ],
};

const buildingPlacementPresets: Record<BuildingPlacementIntent, HintPreset> = {
  new: {
    id: 'building-placement-new',
    task: '建筑放置',
    rows: [
      { binding: '鼠标左键', description: '确定位置', primary: true },
      { binding: '鼠标右键', description: '旋转镜头' },
      { binding: 'W / A / S / D', description: '移动镜头' },
      { binding: '鼠标滚轮', description: '缩放镜头' },
      { binding: 'R', description: '顺时针旋转' },
      { binding: 'Shift + R', description: '逆时针旋转' },
      { binding: 'Ctrl + Z', description: '撤销' },
      { binding: 'Esc', description: '取消放置' },
    ],
  },
  move: {
    id: 'building-placement-move',
    task: '移动建筑',
    rows: [
      { binding: '鼠标左键', description: '确定新位置', primary: true },
      { binding: '鼠标右键', description: '旋转镜头' },
      { binding: 'W / A / S / D', description: '移动镜头' },
      { binding: '鼠标滚轮', description: '缩放镜头' },
      { binding: 'R', description: '顺时针旋转' },
      { binding: 'Shift + R', description: '逆时针旋转' },
      { binding: 'Ctrl + Z', description: '撤销' },
      { binding: 'Esc', description: '取消移动' },
    ],
  },
};

const roadPresets: Record<RoadDrawMode, HintPreset> = {
  'smart-curve': {
    id: 'road-smart-curve',
    task: '道路 · 智能曲线',
    rows: [
      { binding: '鼠标左键', description: '放置节点', primary: true },
      { binding: '鼠标右键', description: '结束当前段' },
      { binding: 'W / A / S / D', description: '移动镜头' },
      { binding: '鼠标滚轮', description: '缩放镜头' },
      { binding: 'Ctrl + Z', description: '撤销节点' },
      { binding: 'Esc', description: '取消铺设' },
    ],
  },
  curve: {
    id: 'road-curve',
    task: '道路 · 曲线',
    rows: [
      { binding: '鼠标左键', description: '放置控制点', primary: true },
      { binding: '鼠标右键', description: '结束当前段' },
      { binding: 'W / A / S / D', description: '移动镜头' },
      { binding: 'Ctrl + Z', description: '撤销控制点' },
      { binding: 'Esc', description: '取消铺设' },
    ],
  },
  straight: {
    id: 'road-straight',
    task: '道路 · 直线',
    rows: [
      { binding: '鼠标左键', description: '确定端点', primary: true },
      { binding: '鼠标右键', description: '结束当前段' },
      { binding: 'W / A / S / D', description: '移动镜头' },
      { binding: 'Ctrl + Z', description: '撤销端点' },
      { binding: 'Esc', description: '取消铺设' },
    ],
  },
};

const treePresets: Record<TreePlacementMode, HintPreset> = {
  brush: {
    id: 'tree-brush',
    task: '树木 · 刷子',
    rows: [
      { binding: '鼠标左键拖动', description: '批量种植', primary: true },
      { binding: '鼠标滚轮', description: '调整笔刷半径' },
      { binding: 'Ctrl + Z', description: '撤销种植' },
      { binding: 'Esc', description: '退出树木放置' },
    ],
  },
  single: {
    id: 'tree-single',
    task: '树木 · 单棵',
    rows: [
      { binding: '鼠标左键', description: '放置 / 选择', primary: true },
      { binding: '拖动', description: '移动选中树木' },
      { binding: 'R / Shift+R', description: '旋转选中树木' },
      { binding: 'Ctrl + Z', description: '撤销' },
      { binding: 'Esc', description: '退出树木放置' },
    ],
  },
};

const cityWallPresets: Record<CityWallConstructionMode, HintPreset> = {
  range: {
    id: 'city-wall-range',
    task: '城墙 · 范围模式',
    rows: [
      { binding: '鼠标左键拖动', description: '拉出矩形城墙范围', primary: true },
      { binding: '拖动四角', description: '调整营造范围' },
      { binding: 'W / A / S / D', description: '移动镜头' },
      { binding: '鼠标滚轮', description: '缩放镜头' },
      { binding: 'Ctrl + Z', description: '撤销范围调整' },
      { binding: 'Esc', description: '取消城墙营造' },
    ],
  },
  'fixed-width': {
    id: 'city-wall-fixed-width',
    task: '城墙 · 定宽延伸',
    rows: [
      { binding: '鼠标左键', description: '起点 / 添加转角', primary: true },
      { binding: '拖动', description: '按固定墙厚延伸' },
      { binding: 'Shift', description: '临时关闭正交吸附' },
      { binding: '鼠标右键', description: '结束当前路径' },
      { binding: 'Ctrl + Z', description: '撤销节点' },
      { binding: 'Esc', description: '取消城墙营造' },
    ],
  },
};

const cityWallGatePresets: Record<CityWallGatePlacementMode, HintPreset> = {
  free: {
    id: 'city-wall-gate-free',
    task: '城门 · 自由放置',
    rows: [
      { binding: '鼠标左键', description: '放置独立城门', primary: true },
      { binding: '拖动', description: '调整城门位置' },
      { binding: 'R / Shift+R', description: '旋转城门' },
      { binding: 'W / A / S / D', description: '移动镜头' },
      { binding: 'Ctrl + Z', description: '撤销放置' },
      { binding: 'Esc', description: '取消城门放置' },
    ],
  },
  'wall-connected': {
    id: 'city-wall-gate-connected',
    task: '城门 · 城墙连接',
    rows: [
      { binding: '鼠标移动', description: '寻找可连接墙段', primary: true },
      { binding: '鼠标左键', description: '确认墙体连接位置' },
      { binding: '自动', description: '对齐墙体并继承正反面' },
      { binding: 'Ctrl + Z', description: '撤销放置' },
      { binding: 'Esc', description: '取消城门放置' },
    ],
  },
};

const cityWallAccessStairPreset: HintPreset = {
  id: 'city-wall-access-stair',
  task: '登城梯 · 自由放置',
  rows: [
    { binding: '鼠标左键', description: '放置登城梯', primary: true },
    { binding: '拖动', description: '调整楼梯位置' },
    { binding: 'R / Shift+R', description: '旋转楼梯' },
    { binding: 'Ctrl + Z', description: '撤销放置' },
    { binding: 'Esc', description: '取消登城梯放置' },
  ],
};

const cityWallTransitionStairPreset: HintPreset = {
  id: 'city-wall-transition-stair',
  task: '高差楼梯 · 自由放置',
  rows: [
    { binding: '鼠标左键', description: '放置高差楼梯', primary: true },
    { binding: '拖动', description: '调整楼梯位置' },
    { binding: 'R / Shift+R', description: '旋转楼梯' },
    { binding: 'Ctrl + Z', description: '撤销放置' },
    { binding: 'Esc', description: '取消高差楼梯放置' },
  ],
};

const terrainPresets: Record<TerrainEditMode, HintPreset> = {
  raise: { id: 'terrain-raise', task: '地形 · 抬高', rows: [
    { binding: '鼠标左键', description: '连续抬高', primary: true }, { binding: '拖动', description: '连续编辑' },
    { binding: '鼠标滚轮', description: '调整笔刷半径' }, { binding: 'Shift', description: '临时降低强度' },
    { binding: 'Ctrl + Z', description: '撤销' }, { binding: 'Esc', description: '退出工具' },
  ]},
  lower: { id: 'terrain-lower', task: '地形 · 降低', rows: [
    { binding: '鼠标左键', description: '连续降低', primary: true }, { binding: '拖动', description: '连续编辑' },
    { binding: '鼠标滚轮', description: '调整笔刷半径' }, { binding: 'Ctrl + Z', description: '撤销' }, { binding: 'Esc', description: '退出工具' },
  ]},
  flatten: { id: 'terrain-flatten', task: '地形 · 整平', rows: [
    { binding: '鼠标左键', description: '按目标高度整平', primary: true }, { binding: 'Alt + 左键', description: '取样高度' },
    { binding: '鼠标滚轮', description: '调整笔刷半径' }, { binding: 'Ctrl + Z', description: '撤销' }, { binding: 'Esc', description: '退出工具' },
  ]},
  smooth: { id: 'terrain-smooth', task: '地形 · 平滑', rows: [
    { binding: '鼠标左键', description: '平滑地形', primary: true }, { binding: '拖动', description: '连续平滑' },
    { binding: '鼠标滚轮', description: '调整笔刷半径' }, { binding: 'Ctrl + Z', description: '撤销' }, { binding: 'Esc', description: '退出工具' },
  ]},
  slope: { id: 'terrain-slope', task: '地形 · 坡面', rows: [
    { binding: '鼠标左键', description: '指定起点 / 终点', primary: true }, { binding: '鼠标右键', description: '取消当前坡面' },
    { binding: 'Ctrl + Z', description: '撤销' }, { binding: 'Esc', description: '退出工具' },
  ]},
};

const colorPresets: Record<ColorToolMode, HintPreset> = {
  surface: { id: 'color-surface', task: '配色 · 表面', rows: [
    { binding: '鼠标左键', description: '选择表面', primary: true }, { binding: 'Ctrl + Z', description: '撤销' },
    { binding: 'Ctrl + Y', description: '重做' }, { binding: 'Esc', description: '退出配色' },
  ]},
  lighting: { id: 'color-lighting', task: '配色 · 灯光', rows: [
    { binding: '鼠标左键', description: '选择灯光', primary: true }, { binding: 'Ctrl + Z', description: '撤销' },
    { binding: 'Ctrl + Y', description: '重做' }, { binding: 'Esc', description: '退出配色' },
  ]},
  scheme: { id: 'color-scheme', task: '配色 · 方案', rows: [
    { binding: '鼠标左键', description: '选择方案', primary: true }, { binding: '鼠标滚轮', description: '浏览方案' },
    { binding: 'Ctrl + Z', description: '撤销' }, { binding: 'Esc', description: '退出配色' },
  ]},
};

const blueprintPhotographyPreset: HintPreset = {
  id: 'blueprint-photography',
  task: '蓝图摄影',
  rows: [
    { binding: '鼠标左键拖动', description: '调整构图', primary: true },
    { binding: '鼠标滚轮', description: '缩放画面' },
    { binding: '完成摄影', description: '进入蓝图编辑' },
    { binding: 'Esc', description: '取消摄影' },
  ],
};

const contextPanelPresets: Record<Exclude<ContextPanel, 'none'>, HintPreset> = {
  camera: { id: 'context-camera', task: '相机控制', rows: [
    { binding: '鼠标右键', description: '旋转镜头', primary: true }, { binding: 'W / A / S / D', description: '移动镜头' },
    { binding: '鼠标滚轮', description: '缩放镜头' }, { binding: 'Esc', description: '关闭相机面板' },
  ]},
  weather: { id: 'context-weather', task: '环境控制', rows: [
    { binding: '鼠标左键', description: '调整环境参数', primary: true }, { binding: 'Esc', description: '关闭环境面板' },
  ]},
};

const workspaceLabels: Partial<Record<DockCategory, string>> = {
  road: '道路目录', bridge: '桥梁目录', building: '建筑目录', platform: '台基目录',
  'city-wall': '城墙目录', wall: '围墙目录', decoration: '装饰目录', tree: '树木目录',
};

const blueprintWorkspaceLabels: Partial<Record<DockCategory, string>> = {
  all: '全部蓝图', residential: '民居蓝图', commercial: '商业蓝图', workshop: '工坊蓝图',
  administration: '管理蓝图', science: '科学蓝图', faith: '信仰蓝图', military: '军事蓝图', palace: '宫殿蓝图',
};

const managementLabels: Partial<Record<ManagementView, string>> = {
  city: '城市管理', population: '人口管理', finance: '城市财政', inventory: '库存管理',
  policy: '政策管理', commerce: '商业管理', governance: '治理管理', military: '军事管理',
};

function workspacePreset(workspace: Workspace, category: DockCategory | null): HintPreset {
  const blueprint = workspace === 'blueprint';
  const task = blueprint
    ? blueprintWorkspaceLabels[category ?? 'all'] ?? '蓝图目录'
    : workspaceLabels[category ?? 'building'] ?? '设计目录';
  const id = blueprint
    ? 'workspace-blueprint-' + (category ?? 'all')
    : 'workspace-' + (category ?? 'design');
  return { id, task, rows: [
    { binding: '鼠标左键', description: blueprint ? '选择蓝图' : '选择项目', primary: true },
    { binding: '鼠标滚轮', description: '浏览目录' },
    { binding: 'Esc', description: '关闭目录' },
  ]};
}

function managementPreset(view: ManagementView): HintPreset {
  return { id: 'management-' + view, task: managementLabels[view] ?? '城市管理', rows: [
    { binding: '鼠标左键', description: '操作管理项', primary: true }, { binding: '鼠标滚轮', description: '浏览内容' },
    { binding: 'Esc', description: '返回城市' },
  ]};
}

function mapPreset(mapView: MapView, mapPanelOpen: boolean): HintPreset {
  return {
    id: mapPanelOpen ? 'information-view-picker' : 'information-view-' + mapView,
    task: mapPanelOpen ? '信息视图' : '信息图层',
    rows: [
      { binding: '鼠标左键', description: mapPanelOpen ? '选择信息视图' : '查看城市数据', primary: true },
      { binding: 'Esc', description: mapPanelOpen ? '关闭信息视图' : '返回默认视图' },
    ],
  };
}

function Keycap({ binding }: { binding: string }) {
  return <span className="operation-hints__binding"><kbd>{binding}</kbd></span>;
}
function HintRowView({ row }: { row: HintRow }) {
  return <div className={'operation-hints__row ' + (row.primary ? 'is-primary' : '')}><Keycap binding={row.binding} /><span className="operation-hints__description">{row.description}</span></div>;
}

interface Props {
  tool: Tool;
  workspace: Workspace;
  dockCategory: DockCategory | null;
  selection: WorldSelection;
  buildingSchemeOpen: boolean;
  management: ManagementView;
  contextPanel: ContextPanel;
  mapView: MapView;
  mapPanelOpen: boolean;
  worldDemolitionMode: boolean;
  buildingPlacementIntent: BuildingPlacementIntent;
  roadDrawMode: RoadDrawMode;
  terrainEditMode: TerrainEditMode;
  treePlacementMode: TreePlacementMode;
  colorToolMode: ColorToolMode;
  cityWallConstructionMode: CityWallConstructionMode;
  cityWallGatePlacementMode: CityWallGatePlacementMode;
  utilityPresent: boolean;
}

export function GameplayOperationHints(props: Props) {
  const {
    tool, workspace, dockCategory, selection, buildingSchemeOpen, management, contextPanel, mapView, mapPanelOpen,
    worldDemolitionMode, buildingPlacementIntent, roadDrawMode, terrainEditMode, treePlacementMode, colorToolMode,
    cityWallConstructionMode, cityWallGatePlacementMode, utilityPresent,
  } = props;

  let preset = gameplayPreset;
  if (tool === 'building-placement') preset = buildingPlacementPresets[buildingPlacementIntent];
  else if (tool === 'road-placement') preset = roadPresets[roadDrawMode];
  else if (tool === 'terrain-edit') preset = terrainPresets[terrainEditMode];
  else if (tool === 'tree-placement') preset = treePresets[treePlacementMode];
  else if (tool === 'city-wall-construction') preset = cityWallPresets[cityWallConstructionMode];
  else if (tool === 'city-wall-gate') preset = cityWallGatePresets[cityWallGatePlacementMode];
  else if (tool === 'city-wall-access-stair') preset = cityWallAccessStairPreset;
  else if (tool === 'city-wall-transition-stair') preset = cityWallTransitionStairPreset;
  else if (tool === 'color-tool') preset = colorPresets[colorToolMode];
  else if (tool === 'blueprint-photography') preset = blueprintPhotographyPreset;
  else if (buildingSchemeOpen && selection?.kind === 'building') preset = buildingSchemePreset;
  else if (selection?.kind === 'building') preset = buildingSelectionPreset;
  else if (workspace !== 'none') preset = workspacePreset(workspace, dockCategory);
  else if (management !== 'none') preset = managementPreset(management);
  else if (contextPanel !== 'none') preset = contextPanelPresets[contextPanel];
  else if (mapPanelOpen || mapView !== 'default') preset = mapPreset(mapView, mapPanelOpen);
  else if (worldDemolitionMode) preset = demolitionPreset;

  return (
    <aside
      className={'gameplay-operation-hints ' + (utilityPresent ? 'has-utility' : 'is-standalone')}
      data-hint-context={preset.id}
      aria-label="当前操作提示"
    >
      <div className="operation-hints__task"><strong>{preset.task}</strong></div>
      <div className="operation-hints__group">
        {preset.rows.slice(0, 8).map((row) => <HintRowView key={row.binding + '-' + row.description} row={row} />)}
      </div>
    </aside>
  );
}
