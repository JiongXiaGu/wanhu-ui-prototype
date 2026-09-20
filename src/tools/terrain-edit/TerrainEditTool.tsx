import { useState, type Dispatch } from 'react';
import { ChevronDown, Minus, Mountain, Route, Waves } from '../../ui/icons/runtime-icons.generated';
import type { GameplayUiAction, GameplayUiState, TerrainEditMode } from '../../app/ui-state';
import { RuntimeParameterRow } from '../../ui/Controls';
import { LeftContextPanel, LeftContextSection } from '../../ui/LeftContextPanel';
import type { MotionPhase } from '../../ui/motion';
import { ToolActionBar, type ToolModeGroup } from '../ToolActionBar';

interface TerrainEditToolProps {
  state: GameplayUiState;
  motionPhase?: MotionPhase;
  dispatch: Dispatch<GameplayUiAction>;
  onExit: () => void;
}

export function TerrainEditTool({
  state,
  motionPhase = 'steady',
  dispatch,
  onExit,
}: TerrainEditToolProps) {
  const [radius, setRadius] = useState(24);
  const [strength, setStrength] = useState(45);
  const [falloff, setFalloff] = useState(65);
  const [targetHeight, setTargetHeight] = useState(12.5);

  const modeGroups: ToolModeGroup[] = [
    {
      id: 'terrain-edit-mode',
      label: '地形编辑模式',
      items: [
        { id: 'raise', label: '抬高', icon: Mountain, active: state.terrainEditMode === 'raise', onClick: () => dispatch({ type: 'SET_TERRAIN_EDIT_MODE', mode: 'raise' }) },
        { id: 'lower', label: '降低', icon: ChevronDown, active: state.terrainEditMode === 'lower', onClick: () => dispatch({ type: 'SET_TERRAIN_EDIT_MODE', mode: 'lower' }) },
        { id: 'flatten', label: '整平', icon: Minus, active: state.terrainEditMode === 'flatten', onClick: () => dispatch({ type: 'SET_TERRAIN_EDIT_MODE', mode: 'flatten' }) },
        { id: 'smooth', label: '平滑', icon: Waves, active: state.terrainEditMode === 'smooth', onClick: () => dispatch({ type: 'SET_TERRAIN_EDIT_MODE', mode: 'smooth' }) },
        { id: 'slope', label: '坡面', icon: Route, active: state.terrainEditMode === 'slope', onClick: () => dispatch({ type: 'SET_TERRAIN_EDIT_MODE', mode: 'slope' }) },
      ],
    },
  ];

  return (
    <>
      <LeftContextPanel
        as="section"
        ariaLabel="地形编辑参数"
        icon={Mountain}
        title="地形编辑"
        subtitle="塑形与标高"
        closeLabel="退出地形编辑"
        className={`terrain-edit-prototype motion-left-surface is-${motionPhase}`}
        bodyClassName="terrain-edit-prototype__body"
        onClose={onExit}
        dataAttributes={{ 'data-terrain-edit-mode': state.terrainEditMode }}
      >
        <LeftContextSection title="笔刷">
          <RuntimeParameterRow label="笔刷半径" value={radius} min={4} max={80} step={1} format={(value) => `${value.toFixed(0)} m`} onChange={setRadius} />
          <RuntimeParameterRow label="编辑强度" value={strength} min={5} max={100} step={5} format={(value) => `${value.toFixed(0)}%`} onChange={setStrength} />
          <RuntimeParameterRow label="边缘衰减" value={falloff} min={0} max={100} step={5} format={(value) => `${value.toFixed(0)}%`} onChange={setFalloff} />
        </LeftContextSection>

        {state.terrainEditMode === 'flatten' && (
          <LeftContextSection title="整平参数" className="terrain-edit-mode-section">
            <RuntimeParameterRow label="目标标高" value={targetHeight} min={-20} max={80} step={0.1} format={(value) => `${value.toFixed(1)} m`} onChange={setTargetHeight} />
            <button type="button" className="terrain-edit-sample-action" onClick={() => setTargetHeight(12.42)}>取样当前位置标高</button>
          </LeftContextSection>
        )}

        {state.terrainEditMode === 'slope' && (
          <LeftContextSection title="坡面参数" className="terrain-edit-mode-section">
            <div className="terrain-edit-metrics terrain-edit-metrics--slope">
              <span><small>起点高度</small><b>12.40 m</b></span>
              <span><small>终点高度</small><b>18.60 m</b></span>
              <span><small>预估坡度</small><b>7.2°</b></span>
            </div>
          </LeftContextSection>
        )}

      </LeftContextPanel>

      <div className={`tool-bottom-cluster terrain-edit-toolbar-cluster motion-bottom-surface is-${motionPhase}`} aria-label="地形编辑主控栏" aria-busy={motionPhase !== 'steady'}>
        <ToolActionBar
          ariaLabel="地形编辑操作栏"
          modeGroups={modeGroups}
          completeLabel="完成地形编辑"
          commitGroupLabel="地形编辑任务"
          onComplete={onExit}
        />
      </div>

      <div className={`terrain-brush-preview terrain-brush-preview--${state.terrainEditMode}`} aria-hidden="true">
        <span className="terrain-brush-preview__outer" />
        <span className="terrain-brush-preview__inner" style={{ width: `${Math.max(28, falloff)}%`, height: `${Math.max(28, falloff)}%` }} />
        <span className="terrain-brush-preview__cross terrain-brush-preview__cross--h" />
        <span className="terrain-brush-preview__cross terrain-brush-preview__cross--v" />
      </div>
    </>
  );
}
