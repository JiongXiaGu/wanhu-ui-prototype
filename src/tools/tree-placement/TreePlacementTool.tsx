import { useState, type Dispatch } from 'react';
import { Brush, MousePointer2, Move, RotateCcw, RotateCw, Shuffle, Trash2, Trees } from '../../ui/icons/runtime-icons.generated';
import type { GameplayUiAction, GameplayUiState } from '../../app/ui-state';
import { RuntimeParameterRow } from '../../ui/Controls';
import { LeftContextPanel, LeftContextSection } from '../../ui/LeftContextPanel';
import type { MotionPhase } from '../../ui/motion';
import { ToolActionBar, type ToolModeGroup, type ToolQuickAction } from '../ToolActionBar';

interface TreePlacementToolProps { state: GameplayUiState; motionPhase?: MotionPhase; dispatch: Dispatch<GameplayUiAction>; onExit: () => void }
const TREE_VARIANTS = [1, 2, 3, 4] as const;
const TREE_VARIANT_ROWS = [TREE_VARIANTS];

export function TreePlacementTool({ state, motionPhase = 'steady', dispatch, onExit }: TreePlacementToolProps) {
  const [radius, setRadius] = useState(18);
  const [density, setDensity] = useState(62);
  const [scaleRandomness, setScaleRandomness] = useState(18);
  const [singleScale, setSingleScale] = useState(100);
  const [singleRotation, setSingleRotation] = useState(0);
  const [singleMoved, setSingleMoved] = useState(false);
  const [singleSelected, setSingleSelected] = useState(true);
  const modeGroups: ToolModeGroup[] = [{
    id: 'tree-placement-mode', label: '树木放置模式', presentation: 'icon-label',
    items: [
      { id: 'brush', label: '刷子', icon: Brush, active: state.treePlacementMode === 'brush', onClick: () => dispatch({ type: 'SET_TREE_PLACEMENT_MODE', mode: 'brush' }) },
      { id: 'single', label: '单棵', icon: MousePointer2, active: state.treePlacementMode === 'single', onClick: () => { setSingleSelected(true); dispatch({ type: 'SET_TREE_PLACEMENT_MODE', mode: 'single' }); } },
    ],
  }];
  const singleActions: ToolQuickAction[] = state.treePlacementMode === 'single' ? [
    { id: 'move-tree', label: '移动选中树木', icon: Move, disabled: !singleSelected, onClick: () => { setSingleMoved(value => !value); dispatch({ type: 'MARK_HISTORY_DIRTY' }); } },
    { id: 'rotate-tree-left', label: '逆时针旋转', icon: RotateCcw, disabled: !singleSelected, onClick: () => { setSingleRotation(value => value - 15); dispatch({ type: 'MARK_HISTORY_DIRTY' }); } },
    { id: 'rotate-tree-right', label: '顺时针旋转', icon: RotateCw, disabled: !singleSelected, onClick: () => { setSingleRotation(value => value + 15); dispatch({ type: 'MARK_HISTORY_DIRTY' }); } },
    { id: 'delete-tree', label: '删除选中树木', icon: Trash2, disabled: !singleSelected, onClick: () => { setSingleSelected(false); dispatch({ type: 'MARK_HISTORY_DIRTY' }); } },
  ] : [];
  function selectVariant(variant: number) { setSingleSelected(true); dispatch({ type: 'SET_TREE_VARIANT', variant }); dispatch({ type: 'MARK_HISTORY_DIRTY' }); }
  const previewVariant = Math.max(1, state.treeVariant);
  return (
    <>
      <LeftContextPanel as="section" ariaLabel="树木放置参数" icon={Trees} title={state.treeSpeciesName} subtitle="树木放置" closeLabel="退出树木放置" className={'tree-placement-prototype motion-left-surface is-' + motionPhase} bodyClassName="tree-placement-prototype__body" onClose={onExit} dataAttributes={{ 'data-tree-placement-mode': state.treePlacementMode, 'data-tree-species': state.treeSpeciesId }}>
        <LeftContextSection title="树木样式">
          {state.treePlacementMode === 'brush' && (
            <button type="button" className={'tree-variant-mix ' + (state.treeVariant === 0 ? 'is-active' : '')} aria-label="随机混合四种树形" aria-pressed={state.treeVariant === 0} onClick={() => selectVariant(0)}><Shuffle aria-hidden="true" /><span>随机混合</span><small>01–04</small></button>
          )}
          <div className="tree-variant-rows" aria-label={state.treeSpeciesName + '树形样式'}>
            {TREE_VARIANT_ROWS.map((row, rowIndex) => (
              <div className="tree-variant-row" key={rowIndex}>
                {row.map(variant => (
                  <button type="button" className={'tree-variant-button tree-variant-button--' + variant + ' ' + (state.treeVariant === variant ? 'is-active' : '')} aria-label={'树木样式 ' + String(variant).padStart(2, '0')} aria-pressed={state.treeVariant === variant} key={variant} onClick={() => selectVariant(variant)}><Trees aria-hidden="true" /><span>{String(variant).padStart(2, '0')}</span></button>
                ))}
              </div>
            ))}
          </div>
        </LeftContextSection>
        {state.treePlacementMode === 'brush' ? (
          <LeftContextSection title="笔刷">
            <RuntimeParameterRow label="笔刷半径" value={radius} min={4} max={60} step={1} format={value => value.toFixed(0) + ' m'} onChange={setRadius} />
            <RuntimeParameterRow label="树木密度" value={density} min={10} max={100} step={5} format={value => value.toFixed(0) + '%'} onChange={setDensity} />
            <RuntimeParameterRow label="大小随机" value={scaleRandomness} min={0} max={35} step={1} format={value => '±' + value.toFixed(0) + '%'} onChange={setScaleRandomness} />
          </LeftContextSection>
        ) : (
          <LeftContextSection title="单棵参数" className="tree-placement-mode-section">
            <RuntimeParameterRow label="整体大小" value={singleScale} min={80} max={120} step={1} format={value => value.toFixed(0) + '%'} onChange={setSingleScale} />
            <div className="tree-single-state" aria-live="polite"><span>当前样式</span><b>{String(previewVariant).padStart(2, '0')}</b><i>{singleSelected ? '已选中' : '等待选择'}</i></div>
          </LeftContextSection>
        )}
      </LeftContextPanel>
      <div className={'tool-bottom-cluster tree-placement-toolbar-cluster motion-bottom-surface is-' + motionPhase} aria-label="树木放置主控栏" aria-busy={motionPhase !== 'steady'}>
        <ToolActionBar ariaLabel="树木放置操作栏" modeGroups={modeGroups} quickActions={singleActions} completeLabel="完成树木放置" completeShortLabel="完成" completeKind="exit" commitGroupLabel="树木放置任务" onComplete={onExit} />
      </div>
      {state.treePlacementMode === 'brush' ? (
        <div className={'tree-brush-preview tree-brush-preview--variant-' + state.treeVariant} aria-hidden="true">
          <span className="tree-brush-preview__ring" />
          {[1, 2, 3, 4, 5].map(index => <span key={index} className={'tree-brush-preview__tree tree-brush-preview__tree--' + index}><Trees /></span>)}
        </div>
      ) : (
        <div className={'tree-single-preview ' + (singleMoved ? 'is-moved ' : '') + (singleSelected ? 'is-selected' : 'is-empty')} aria-hidden="true">
          <span className="tree-single-preview__ring" />
          {singleSelected && <><Trees className={'tree-single-preview__tree tree-single-preview__tree--variant-' + previewVariant} style={{ rotate: singleRotation + 'deg', scale: singleScale / 100 }} /><span className="tree-single-preview__axis tree-single-preview__axis--x" /><span className="tree-single-preview__axis tree-single-preview__axis--z" /></>}
        </div>
      )}
    </>
  );
}
