import type { AdjustmentMode, RoadDrawMode, Tool } from '../app/ui-state';

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

const buildingPresets: Record<AdjustmentMode, HintPreset> = {
  position: {
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
  massing: {
    task: '体量调整',
    rows: [
      { binding: '鼠标左键', description: '确认调整', primary: true },
      { binding: '鼠标右键', description: '旋转镜头' },
      { binding: 'W / A / S / D', description: '移动镜头' },
      { binding: 'R', description: '顺时针旋转' },
      { binding: 'Shift + R', description: '逆时针旋转' },
      { binding: 'Ctrl + Z', description: '撤销' },
      { binding: 'Esc', description: '取消调整' },
    ],
  },
  roof: {
    task: '屋顶调整',
    rows: [
      { binding: '鼠标左键', description: '确认调整', primary: true },
      { binding: '鼠标右键', description: '旋转镜头' },
      { binding: 'W / A / S / D', description: '移动镜头' },
      { binding: 'R', description: '顺时针旋转' },
      { binding: 'Shift + R', description: '逆时针旋转' },
      { binding: 'Ctrl + Z', description: '撤销' },
      { binding: 'Esc', description: '取消调整' },
    ],
  },
  facade: {
    task: '立面调整',
    rows: [
      { binding: '鼠标左键', description: '确认调整', primary: true },
      { binding: '鼠标右键', description: '旋转镜头' },
      { binding: 'W / A / S / D', description: '移动镜头' },
      { binding: 'Ctrl + Z', description: '撤销' },
      { binding: 'Esc', description: '取消调整' },
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

function Keycap({ binding }: { binding: string }) {
  return (
    <span className="operation-hints__binding">
      <kbd>{binding}</kbd>
    </span>
  );
}

function HintRowView({ row }: { row: HintRow }) {
  return (
    <div className={`operation-hints__row ${row.primary ? 'is-primary' : ''}`}>
      <Keycap binding={row.binding} />
      <span className="operation-hints__description">{row.description}</span>
    </div>
  );
}

interface Props {
  tool: Tool;
  adjustmentMode: AdjustmentMode;
  roadDrawMode: RoadDrawMode;
}

export function GameplayOperationHints({ tool, adjustmentMode, roadDrawMode }: Props) {
  const preset = tool === 'building-placement'
    ? buildingPresets[adjustmentMode]
    : tool === 'road-placement'
      ? roadPresets[roadDrawMode]
      : gameplayPreset;

  return (
    <aside className="gameplay-operation-hints" aria-label="当前操作提示">
      <div className="operation-hints__task"><strong>{preset.task}</strong></div>
      <div className="operation-hints__group">
        {preset.rows.slice(0, 8).map((row) => <HintRowView key={`${row.binding}-${row.description}`} row={row} />)}
      </div>
    </aside>
  );
}
