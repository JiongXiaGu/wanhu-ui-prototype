import type { BuildingPlacementIntent, CityWallConstructionMode, CityWallGatePlacementMode, RoadDrawMode, TerrainEditMode, Tool } from '../app/ui-state';

type HintRow = { binding: string; description: string; primary?: boolean };
type HintPreset = { task: string; rows: HintRow[] };

const gameplayPreset: HintPreset = {
  task: '操作提示',
  rows: [
    { binding: '鼠标右键', description: '旋转', primary: true },
    { binding: 'W / A / S / D', description: '移动' },
    { binding: '鼠标滚轮', description: '缩放' },
    { binding: 'Esc', description: '菜单' },
  ],
};

const buildingPlacementPresets: Record<BuildingPlacementIntent, HintPreset> = {
  new: {
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

const cityWallPresets: Record<CityWallConstructionMode, HintPreset> = {
  range: {
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
  raise: {
    task: '地形 · 抬高',
    rows: [
      { binding: '鼠标左键', description: '连续抬高', primary: true },
      { binding: '拖动', description: '连续编辑' },
      { binding: '鼠标滚轮', description: '调整笔刷半径' },
      { binding: 'Shift', description: '临时降低强度' },
      { binding: 'Ctrl + Z', description: '撤销' },
      { binding: 'Esc', description: '退出工具' },
    ],
  },
  lower: {
    task: '地形 · 降低',
    rows: [
      { binding: '鼠标左键', description: '连续降低', primary: true },
      { binding: '拖动', description: '连续编辑' },
      { binding: '鼠标滚轮', description: '调整笔刷半径' },
      { binding: 'Ctrl + Z', description: '撤销' },
      { binding: 'Esc', description: '退出工具' },
    ],
  },
  flatten: {
    task: '地形 · 整平',
    rows: [
      { binding: '鼠标左键', description: '按目标高度整平', primary: true },
      { binding: 'Alt + 左键', description: '取样高度' },
      { binding: '鼠标滚轮', description: '调整笔刷半径' },
      { binding: 'Ctrl + Z', description: '撤销' },
      { binding: 'Esc', description: '退出工具' },
    ],
  },
  smooth: {
    task: '地形 · 平滑',
    rows: [
      { binding: '鼠标左键', description: '平滑地形', primary: true },
      { binding: '拖动', description: '连续平滑' },
      { binding: '鼠标滚轮', description: '调整笔刷半径' },
      { binding: 'Ctrl + Z', description: '撤销' },
      { binding: 'Esc', description: '退出工具' },
    ],
  },
  slope: {
    task: '地形 · 坡面',
    rows: [
      { binding: '鼠标左键', description: '指定起点 / 终点', primary: true },
      { binding: '鼠标右键', description: '取消当前坡面' },
      { binding: 'Ctrl + Z', description: '撤销' },
      { binding: 'Esc', description: '退出工具' },
    ],
  },
};

function Keycap({ binding }: { binding: string }) {
  return (
    <span className="operation-hints__binding">
      <kbd>{binding}</kbd>
    </span>
  );
}

function HintRowView({ row }: { row: HintRow }) {
  return (
    <div className={'operation-hints__row ' + (row.primary ? 'is-primary' : '')}>
      <Keycap binding={row.binding} />
      <span className="operation-hints__description">{row.description}</span>
    </div>
  );
}

interface Props {
  tool: Tool;
  buildingPlacementIntent: BuildingPlacementIntent;
  roadDrawMode: RoadDrawMode;
  terrainEditMode: TerrainEditMode;
  cityWallConstructionMode: CityWallConstructionMode;
  cityWallGatePlacementMode: CityWallGatePlacementMode;
}

export function GameplayOperationHints({
  tool,
  buildingPlacementIntent,
  roadDrawMode,
  terrainEditMode,
  cityWallConstructionMode,
  cityWallGatePlacementMode,
}: Props) {
  const preset = tool === 'building-placement'
    ? buildingPlacementPresets[buildingPlacementIntent]
    : tool === 'road-placement'
      ? roadPresets[roadDrawMode]
      : tool === 'terrain-edit'
        ? terrainPresets[terrainEditMode]
        : tool === 'city-wall-construction'
          ? cityWallPresets[cityWallConstructionMode]
          : tool === 'city-wall-gate'
            ? cityWallGatePresets[cityWallGatePlacementMode]
            : tool === 'city-wall-access-stair'
              ? cityWallAccessStairPreset
              : tool === 'city-wall-transition-stair'
                ? cityWallTransitionStairPreset
                : gameplayPreset;

  return (
    <aside className="gameplay-operation-hints" aria-label="当前操作提示">
      <div className="operation-hints__task"><strong>{preset.task}</strong></div>
      <div className="operation-hints__group">
        {preset.rows.slice(0, 8).map((row) => <HintRowView key={row.binding + '-' + row.description} row={row} />)}
      </div>
    </aside>
  );
}
