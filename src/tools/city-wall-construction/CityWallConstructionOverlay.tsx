import { useState } from 'react';
import { Castle } from 'lucide-react';
import type { CityWallConstructionMode, CityWallFacingSide } from '../../app/ui-state';
import { RuntimeParameterRow, SegmentedControl } from '../../ui/Controls';
import { LeftContextSection } from '../../ui/LeftContextPanel';
import type { MotionPhase } from '../../ui/motion';
import { PlacementContextPanel } from '../placement/PlacementContextPanel';

interface Props {
  moduleName: string;
  systemName: string;
  constructionMode: CityWallConstructionMode;
  facingSide: CityWallFacingSide;
  showTopLine: boolean;
  showNodes: boolean;
  motionPhase?: MotionPhase;
  onClose: () => void;
  onDirty: () => void;
}

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
  constructionMode,
  facingSide,
  showTopLine,
  showNodes,
  motionPhase = 'steady',
  onClose,
  onDirty,
}: Props) {
  const [wallHeight, setWallHeight] = useState(12);
  const [wallThickness, setWallThickness] = useState(6);
  const [terrainRelation, setTerrainRelation] = useState('随地形');
  const [baseTreatment, setBaseTreatment] = useState('自动挖填');

  function updateSegment(current: string, next: string, setter: (value: string) => void) {
    if (current === next) return;
    setter(next);
    onDirty();
  }

  const rangeMode = constructionMode === 'range';

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
          'data-wall-construction-mode': constructionMode,
          'data-wall-facing': rangeMode ? 'outside-auto' : facingSide,
        }}
      >
        <div className="city-wall-construction-context">
          <LeftContextSection title={rangeMode ? '范围模式' : '定宽延伸'} className="city-wall-construction-summary">
            <p>
              {rangeMode
                ? '拖出一个矩形范围，一次生成四边城墙。矩形外侧自动作为城墙正面，内侧作为城内背面。'
                : '按固定墙体厚度连续延伸城墙，转角默认正交吸附，可形成 L / U / 闭合轮廓。开放路径允许交换正反面。'}
            </p>
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
            <RuntimeParameterRow
              label="墙体厚度"
              value={wallThickness}
              min={3}
              max={12}
              step={0.5}
              format={(value) => value.toFixed(1) + ' m'}
              onChange={(value) => {
                if (Object.is(value, wallThickness)) return;
                setWallThickness(value);
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

          {rangeMode ? (
            <LeftContextSection title="当前范围" className="city-wall-construction-metrics">
              <div>
                <span>宽度 <b>84 m</b></span>
                <span>长度 <b>126 m</b></span>
                <span>周长 <b>420 m</b></span>
              </div>
              <p className="city-wall-construction-note">四边正面自动朝向范围外部，不需要手动指定朝向。</p>
            </LeftContextSection>
          ) : (
            <LeftContextSection title="当前路径" className="city-wall-construction-metrics">
              <div>
                <span>长度 <b>72 m</b></span>
                <span>节点 <b>3</b></span>
                <span>状态 <b>开放</b></span>
              </div>
              <div className="city-wall-facing-summary">
                <span>正面 <b>{facingSide === 'left' ? '路径左侧' : '路径右侧'}</b></span>
                <span>背面 <b>{facingSide === 'left' ? '路径右侧' : '路径左侧'}</b></span>
              </div>
            </LeftContextSection>
          )}
        </div>
      </PlacementContextPanel>

      {rangeMode ? (
        <div className="city-wall-range-preview" aria-hidden="true">
          <span className="city-wall-range-preview__fill" />
          <span className="city-wall-range-preview__wall city-wall-range-preview__wall--top" />
          <span className="city-wall-range-preview__wall city-wall-range-preview__wall--right" />
          <span className="city-wall-range-preview__wall city-wall-range-preview__wall--bottom" />
          <span className="city-wall-range-preview__wall city-wall-range-preview__wall--left" />
          {showTopLine && <span className="city-wall-range-preview__top-line" />}
          {showNodes && (
            <>
              <i className="city-wall-range-preview__handle city-wall-range-preview__handle--tl" />
              <i className="city-wall-range-preview__handle city-wall-range-preview__handle--tr" />
              <i className="city-wall-range-preview__handle city-wall-range-preview__handle--br" />
              <i className="city-wall-range-preview__handle city-wall-range-preview__handle--bl" />
            </>
          )}
          <span className="city-wall-range-preview__front city-wall-range-preview__front--top">正面 ↑</span>
          <span className="city-wall-range-preview__front city-wall-range-preview__front--right">正面 →</span>
          <span className="city-wall-range-preview__front city-wall-range-preview__front--bottom">↓ 正面</span>
          <span className="city-wall-range-preview__front city-wall-range-preview__front--left">← 正面</span>
          <span className="city-wall-range-preview__inside">城内 / 背面</span>
        </div>
      ) : (
        <div className={'city-wall-fixed-preview is-facing-' + facingSide} aria-hidden="true">
          <span className="city-wall-fixed-preview__wall city-wall-fixed-preview__wall--horizontal" />
          <span className="city-wall-fixed-preview__wall city-wall-fixed-preview__wall--vertical" />
          <span className="city-wall-fixed-preview__inner city-wall-fixed-preview__inner--horizontal" />
          <span className="city-wall-fixed-preview__inner city-wall-fixed-preview__inner--vertical" />
          {showTopLine && (
            <>
              <span className="city-wall-fixed-preview__top-line city-wall-fixed-preview__top-line--horizontal" />
              <span className="city-wall-fixed-preview__top-line city-wall-fixed-preview__top-line--vertical" />
            </>
          )}
          {showNodes && (
            <>
              <i className="city-wall-fixed-preview__node city-wall-fixed-preview__node--1" />
              <i className="city-wall-fixed-preview__node city-wall-fixed-preview__node--2" />
              <i className="city-wall-fixed-preview__node city-wall-fixed-preview__node--3" />
            </>
          )}
          <span className="city-wall-fixed-preview__front city-wall-fixed-preview__front--horizontal">
            {facingSide === 'left' ? '正面 ↑' : '背面 ↑'}
          </span>
          <span className="city-wall-fixed-preview__back city-wall-fixed-preview__back--horizontal">
            {facingSide === 'left' ? '背面 ↓' : '正面 ↓'}
          </span>
          <span className="city-wall-fixed-preview__front city-wall-fixed-preview__front--vertical">
            {facingSide === 'left' ? '正面 →' : '背面 →'}
          </span>
          <span className="city-wall-fixed-preview__back city-wall-fixed-preview__back--vertical">
            {facingSide === 'left' ? '背面 ←' : '正面 ←'}
          </span>
        </div>
      )}
    </>
  );
}
