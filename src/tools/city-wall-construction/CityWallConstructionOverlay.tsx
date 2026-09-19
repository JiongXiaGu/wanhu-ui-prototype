import { useState } from 'react';
import { Castle } from 'lucide-react';
import type { CityWallDrawMode, CityWallOutsideSide } from '../../app/ui-state';
import { RuntimeParameterRow, SegmentedControl } from '../../ui/Controls';
import { LeftContextSection } from '../../ui/LeftContextPanel';
import type { MotionPhase } from '../../ui/motion';
import { PlacementContextPanel } from '../placement/PlacementContextPanel';

interface Props {
  moduleName: string;
  systemName: string;
  drawMode: CityWallDrawMode;
  outsideSide: CityWallOutsideSide;
  showTopLine: boolean;
  showNodes: boolean;
  motionPhase?: MotionPhase;
  onClose: () => void;
  onDirty: () => void;
}

const MODE_COPY: Record<CityWallDrawMode, { title: string; detail: string }> = {
  'smart-polyline': { title: '智能折线', detail: '连续放置墙体节点，并自动保持转角与连接关系，适合大多数规则城防。' },
  straight: { title: '直线', detail: '从起点到终点保持墙体轴线笔直，适合城池中轴与规则边界。' },
  curve: { title: '曲线', detail: '使用平滑路径连接墙体节点，适合山地、河岸与不规则城防。' },
};

function LabeledSegment({
  label,
  items,
  active,
  onChange,
}: {
  label: string;
  items: string[];
  active: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="city-wall-construction__segment-row left-context-panel__labeled-control">
      <span>{label}</span>
      <SegmentedControl items={items} active={active} onChange={onChange} />
    </div>
  );
}

export function CityWallConstructionOverlay({
  moduleName,
  systemName,
  drawMode,
  outsideSide,
  showTopLine,
  showNodes,
  motionPhase = 'steady',
  onClose,
  onDirty,
}: Props) {
  const [wallHeight, setWallHeight] = useState(12);
  const [terrainRelation, setTerrainRelation] = useState('随地形');
  const [baseTreatment, setBaseTreatment] = useState('自动挖填');
  const copy = MODE_COPY[drawMode];

  function updateSegment(current: string, next: string, setter: (value: string) => void) {
    if (current === next) return;
    setter(next);
    onDirty();
  }

  return (
    <>
      <PlacementContextPanel
        ariaLabel="城墙主体营造参数"
        icon={Castle}
        title={moduleName}
        subtitle={systemName + ' · 城墙'}
        closeLabel="退出城墙营造"
        className={'city-wall-construction-prototype motion-left-surface is-' + motionPhase}
        bodyClassName="city-wall-construction-prototype__body"
        onClose={onClose}
        dataAttributes={{
          'data-wall-draw-mode': drawMode,
          'data-wall-outside': outsideSide,
        }}
      >
        <div className="city-wall-construction-context">
          <LeftContextSection title={copy.title} className="city-wall-construction-summary">
            <p>{copy.detail}</p>
            <div className="city-wall-construction-summary__metrics">
              <span>预估长度 <b>74 m</b></span>
              <span>节点 <b>{drawMode === 'straight' ? '2' : '4'}</b></span>
              <span>城外 <b>{outsideSide === 'right' ? '路径右侧' : '路径左侧'}</b></span>
            </div>
          </LeftContextSection>

          <LeftContextSection title="墙体参数" className="city-wall-construction-parameters">
            <RuntimeParameterRow
              label="墙高"
              value={wallHeight}
              min={6}
              max={24}
              step={0.5}
              format={(value) => value.toFixed(1) + ' m'}
              onChange={(value) => {
                if (Object.is(value, wallHeight)) return;
                setWallHeight(value);
                onDirty();
              }}
            />
            <LabeledSegment
              label="地形关系"
              items={['随地形', '整体找平']}
              active={terrainRelation}
              onChange={(value) => updateSegment(terrainRelation, value, setTerrainRelation)}
            />
            <LabeledSegment
              label="基底处理"
              items={['自动挖填', '仅填土']}
              active={baseTreatment}
              onChange={(value) => updateSegment(baseTreatment, value, setBaseTreatment)}
            />
          </LeftContextSection>

          <LeftContextSection title="自动计算" className="city-wall-construction-metrics">
            <div>
              <span>墙体厚度 <b>7.2 m</b></span>
              <span>马道净宽 <b>4.6 m</b></span>
              <span>平均坡度 <b>{terrainRelation === '随地形' ? '6.4%' : '0.0%'}</b></span>
            </div>
          </LeftContextSection>
        </div>
      </PlacementContextPanel>

      <div className={'city-wall-path-preview city-wall-path-preview--' + drawMode + ' is-outside-' + outsideSide} aria-hidden="true">
        <span className="city-wall-path-preview__segment city-wall-path-preview__segment--1" />
        <span className="city-wall-path-preview__segment city-wall-path-preview__segment--2" />
        <span className="city-wall-path-preview__segment city-wall-path-preview__segment--3" />
        {showTopLine && <span className="city-wall-path-preview__top-line" />}
        {showNodes && (
          <>
            <i className="city-wall-path-preview__node city-wall-path-preview__node--1" />
            <i className="city-wall-path-preview__node city-wall-path-preview__node--2" />
            <i className="city-wall-path-preview__node city-wall-path-preview__node--3" />
            <i className="city-wall-path-preview__node city-wall-path-preview__node--4" />
          </>
        )}
        <span className="city-wall-path-preview__outside">城外 <b>{outsideSide === 'right' ? '→' : '←'}</b></span>
      </div>
    </>
  );
}
