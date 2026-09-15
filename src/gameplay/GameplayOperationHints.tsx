import type { AdjustmentMode } from '../app/ui-state';

type HintRow = { binding: string; description: string; primary?: boolean };
type HintPreset = { task: string; rows: HintRow[] };

const gameplayPreset: HintPreset = {
  task: '移动镜头查看城市',
  rows: [
    { binding: '鼠标右键', description: '旋转相机', primary: true },
    { binding: 'W / A / S / D', description: '移动镜头' },
    { binding: '鼠标滚轮', description: '缩放相机' },
    { binding: 'Esc', description: '打开菜单' },
  ],
};

const toolPresets: Record<AdjustmentMode, HintPreset> = {
  position: {
    task: '确定建筑起始位置',
    rows: [
      { binding: '鼠标左键', description: '确定位置', primary: true },
      { binding: '鼠标右键', description: '旋转相机' },
      { binding: 'W / A / S / D', description: '移动镜头' },
      { binding: '鼠标滚轮', description: '缩放相机' },
      { binding: 'R', description: '顺时针旋转' },
      { binding: 'Shift + R', description: '逆时针旋转' },
      { binding: 'Ctrl + Z', description: '撤销' },
      { binding: 'Esc', description: '取消放置' },
    ],
  },
  massing: {
    task: '调整建筑体量',
    rows: [
      { binding: '鼠标左键', description: '确认调整', primary: true },
      { binding: '鼠标右键', description: '旋转相机' },
      { binding: 'W / A / S / D', description: '移动镜头' },
      { binding: 'R', description: '顺时针旋转' },
      { binding: 'Shift + R', description: '逆时针旋转' },
      { binding: 'Ctrl + Z', description: '撤销' },
      { binding: 'Esc', description: '取消调整' },
    ],
  },
  roof: {
    task: '调整屋顶形制',
    rows: [
      { binding: '鼠标左键', description: '确认调整', primary: true },
      { binding: '鼠标右键', description: '旋转相机' },
      { binding: 'W / A / S / D', description: '移动镜头' },
      { binding: 'R', description: '顺时针旋转' },
      { binding: 'Shift + R', description: '逆时针旋转' },
      { binding: 'Ctrl + Z', description: '撤销' },
      { binding: 'Esc', description: '取消调整' },
    ],
  },
  facade: {
    task: '调整建筑立面',
    rows: [
      { binding: '鼠标左键', description: '确认调整', primary: true },
      { binding: '鼠标右键', description: '旋转相机' },
      { binding: 'W / A / S / D', description: '移动镜头' },
      { binding: 'Ctrl + Z', description: '撤销' },
      { binding: 'Esc', description: '取消调整' },
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
  toolActive: boolean;
  adjustmentMode: AdjustmentMode;
}

export function GameplayOperationHints({ toolActive, adjustmentMode }: Props) {
  const preset = toolActive ? toolPresets[adjustmentMode] : gameplayPreset;
  return (
    <aside className="gameplay-operation-hints" aria-label="当前操作提示">
      <div className="operation-hints__task"><strong>{preset.task}</strong></div>
      <div className="operation-hints__group">
        {preset.rows.slice(0, 8).map((row) => <HintRowView key={`${row.binding}-${row.description}`} row={row} />)}
      </div>
    </aside>
  );
}
