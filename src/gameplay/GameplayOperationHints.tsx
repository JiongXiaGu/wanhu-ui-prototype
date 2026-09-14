import type { AdjustmentMode, Flyout, TerrainMode } from '../app/ui-state';

type HintRow = { binding: string; description: string; primary?: boolean };

const presets: Record<AdjustmentMode, { step: string; rows: HintRow[] }> = {
  position: {
    step: '位置调整',
    rows: [
      { binding: '鼠标左键', description: '确认位置', primary: true },
      { binding: 'R', description: '旋转' },
      { binding: 'Shift + R', description: '反向旋转' },
    ],
  },
  massing: {
    step: '楼身调整',
    rows: [
      { binding: 'R', description: '旋转' },
      { binding: 'Shift + R', description: '反向旋转' },
    ],
  },
  roof: {
    step: '屋顶调整',
    rows: [
      { binding: 'R', description: '旋转' },
      { binding: 'Shift + R', description: '反向旋转' },
    ],
  },
  facade: { step: '立面调整', rows: [] },
};

const terrainLabels: Record<TerrainMode, string> = {
  'balanced-earthwork': '平衡挖填',
  'fill-only': '只填不挖',
  'manual-elevation': '手动标高',
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
  terrainMode: TerrainMode;
  adjustmentMode: AdjustmentMode;
  flyout: Flyout;
}

export function GameplayOperationHints({ terrainMode, adjustmentMode, flyout }: Props) {
  if (flyout !== 'none') return null;

  const preset = presets[adjustmentMode];
  return (
    <aside className="gameplay-operation-hints" aria-label="当前操作提示">
      <div className="operation-hints__context">
        <strong>{preset.step}</strong><i /><span>{terrainLabels[terrainMode]}</span>
      </div>

      <div className="operation-hints__group">
        {preset.rows.map((row) => <HintRowView key={`${row.binding}-${row.description}`} row={row} />)}
      </div>

      <div className="operation-hints__footer">
        <span><Keycaps binding="Ctrl + Z" />撤销</span>
        <span><Keycaps binding="Ctrl + Y" />重做</span>
        <span><Keycaps binding="Esc" />取消</span>
      </div>
    </aside>
  );
}
