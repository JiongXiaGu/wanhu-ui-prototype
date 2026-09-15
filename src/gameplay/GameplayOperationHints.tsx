import type { AdjustmentMode } from '../app/ui-state';

type HintRow = { binding: string; description: string; primary?: boolean };

const presets: Record<AdjustmentMode, { task: string; rows: HintRow[] }> = {
  position: {
    task: '确定建筑起始位置',
    rows: [
      { binding: '鼠标左键', description: '确定位置', primary: true },
      { binding: 'R', description: '旋转' },
      { binding: 'Shift + R', description: '反向旋转' },
      { binding: 'Esc', description: '取消' },
    ],
  },
  massing: {
    task: '调整建筑体量',
    rows: [
      { binding: '鼠标左键', description: '确认调整', primary: true },
      { binding: 'R', description: '旋转' },
      { binding: 'Ctrl + Z', description: '撤销' },
      { binding: 'Esc', description: '取消' },
    ],
  },
  roof: {
    task: '调整屋顶形制',
    rows: [
      { binding: '鼠标左键', description: '确认调整', primary: true },
      { binding: 'R', description: '旋转' },
      { binding: 'Ctrl + Z', description: '撤销' },
      { binding: 'Esc', description: '取消' },
    ],
  },
  facade: {
    task: '调整建筑立面',
    rows: [
      { binding: '鼠标左键', description: '确认调整', primary: true },
      { binding: 'Ctrl + Z', description: '撤销' },
      { binding: 'Esc', description: '取消' },
    ],
  },
};

function Keycaps({ binding }: { binding: string }) {
  const parts = binding.split(/\s*\+\s*/g).filter(Boolean);
  return (
    <span className="operation-hints__binding">
      {parts.map((part, index) => (
        <span key={`${part}-${index}`} style={{ display: 'contents' }}>
          {index > 0 && <i>+</i>}
          <kbd>{part}</kbd>
        </span>
      ))}
    </span>
  );
}

function HintRowView({ row }: { row: HintRow }) {
  return (
    <div className={`operation-hints__row ${row.primary ? 'is-primary' : ''}`}>
      <Keycaps binding={row.binding} />
      <span className="operation-hints__description">{row.description}</span>
    </div>
  );
}

interface Props {
  adjustmentMode: AdjustmentMode;
}

export function GameplayOperationHints({ adjustmentMode }: Props) {
  const preset = presets[adjustmentMode];
  return (
    <aside className="gameplay-operation-hints" aria-label="当前操作提示">
      <div className="operation-hints__task">{preset.task}</div>
      <div className="operation-hints__group">
        {preset.rows.map((row) => <HintRowView key={`${row.binding}-${row.description}`} row={row} />)}
      </div>
    </aside>
  );
}
