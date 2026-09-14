import type { AdjustmentMode, Flyout, TerrainMode } from '../app/ui-state';

type HintRow = { binding: string; description: string; primary?: boolean };

const presets: Record<AdjustmentMode, { step: string; instruction: string; rows: HintRow[] }> = {
  position: {
    step: '位置调整',
    instruction: '移动建筑候选到目标位置，确认位置后继续调整或完成。',
    rows: [
      { binding: '鼠标左键', description: '确认位置', primary: true },
      { binding: 'R', description: '顺时针旋转' },
      { binding: 'Shift + R', description: '逆时针旋转' },
    ],
  },
  massing: {
    step: '楼身调整',
    instruction: '在左侧调整楼层、层高与柱网，世界候选会实时更新。',
    rows: [
      { binding: 'R', description: '顺时针旋转' },
      { binding: 'Shift + R', description: '逆时针旋转' },
    ],
  },
  roof: {
    step: '屋顶调整',
    instruction: '选择屋顶区段后调整出檐与翼角，世界候选会实时更新。',
    rows: [
      { binding: 'R', description: '顺时针旋转' },
      { binding: 'Shift + R', description: '逆时针旋转' },
    ],
  },
  facade: {
    step: '立面调整',
    instruction: '立面调整仍在设计中，当前不可用。',
    rows: [],
  },
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
  let instruction = preset.instruction;
  if (terrainMode === 'manual-elevation' && adjustmentMode === 'position') {
    instruction = '先调整相对自动标高，再移动候选并确认建筑位置。';
  } else if (terrainMode === 'fill-only' && adjustmentMode === 'position') {
    instruction = '当前只允许填高地形；移动候选并确认建筑位置。';
  }

  const primary = preset.rows.filter((row) => row.primary);
  const adjustment = preset.rows.filter((row) => !row.primary);

  return (
    <aside className="gameplay-operation-hints" aria-label="当前操作提示">
      <div className="operation-hints__header">
        <div className="operation-hints__heading"><span>当前操作</span><b>建筑放置</b></div>
        <div className="operation-hints__context"><span>{terrainLabels[terrainMode]}</span><i /><strong>{preset.step}</strong></div>
      </div>
      <p className="operation-hints__instruction">{instruction}</p>
      <div className={`operation-hints__group operation-hints__group--primary ${primary.length === 0 ? 'is-empty' : ''}`}>
        {primary.map((row) => <HintRowView key={`${row.binding}-${row.description}`} row={row} />)}
      </div>
      <div className={`operation-hints__group operation-hints__group--adjustment ${adjustment.length === 0 ? 'is-empty' : ''}`}>
        {adjustment.map((row) => <HintRowView key={`${row.binding}-${row.description}`} row={row} />)}
      </div>
      <div className="operation-hints__history">
        <div className="operation-hints__history-item"><Keycaps binding="Ctrl + Z" /><span>撤销</span></div>
        <div className="operation-hints__history-item"><Keycaps binding="Ctrl + Y" /><span>重做</span></div>
      </div>
      <div className="operation-hints__exit"><Keycaps binding="Esc" /><span>取消局部操作 / 完成建筑</span></div>
    </aside>
  );
}
