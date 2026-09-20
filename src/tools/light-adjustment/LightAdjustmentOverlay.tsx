import { useState } from 'react';
import { ChevronRight, Lightbulb, MousePointer2 } from 'lucide-react';
import { RuntimeParameterRow } from '../../ui/Controls';
import { LeftContextSection } from '../../ui/LeftContextPanel';
import { ColorEditorPage } from '../../ui/color/ColorEditorPage';
import type { MotionPhase } from '../../ui/motion';
import { PlacementContextPanel } from '../placement/PlacementContextPanel';

type LightAdjustmentPage = 'parameters' | 'color';

interface SceneLightDraft {
  id: string;
  name: string;
  x: number;
  y: number;
  color: string;
  hdrIntensity: number;
  intensityScale: number;
  rangeScale: number;
}

interface Props {
  motionPhase?: MotionPhase;
  onClose: () => void;
  onDirty: () => void;
}

const INITIAL_LIGHTS: SceneLightDraft[] = [
  { id: 'gate-lantern-03', name: '城门灯笼 03', x: 67, y: 49, color: '#ffd39a', hdrIntensity: 1.8, intensityScale: 1, rangeScale: 1 },
  { id: 'market-lantern-07', name: '市集灯笼 07', x: 55, y: 61, color: '#ffc27f', hdrIntensity: 1.55, intensityScale: 0.9, rangeScale: 1.15 },
  { id: 'bridge-lamp-02', name: '桥头灯 02', x: 77, y: 63, color: '#f0c994', hdrIntensity: 1.35, intensityScale: 1.1, rangeScale: 0.85 },
  { id: 'courtyard-lamp-11', name: '院落灯 11', x: 45, y: 46, color: '#ffe2b5', hdrIntensity: 1.25, intensityScale: 0.8, rangeScale: 0.75 },
];

const LIGHT_COLOR_DEFINITION = {
  target: 'LightColor',
  label: '灯光颜色',
  hdr: true,
  alpha: false,
} as const;

export function LightAdjustmentOverlay({
  motionPhase = 'steady',
  onClose,
  onDirty,
}: Props) {
  const [lights, setLights] = useState<SceneLightDraft[]>(INITIAL_LIGHTS);
  const [selectedLightId, setSelectedLightId] = useState<string | null>(null);
  const [page, setPage] = useState<LightAdjustmentPage>('parameters');

  const selected = lights.find((light) => light.id === selectedLightId) ?? null;

  function selectLight(id: string) {
    setSelectedLightId(id);
    setPage('parameters');
  }

  function updateSelected(patch: Partial<Omit<SceneLightDraft, 'id' | 'name' | 'x' | 'y'>>) {
    if (!selectedLightId) return;
    setLights((current) => current.map((light) => light.id === selectedLightId ? { ...light, ...patch } : light));
    onDirty();
  }

  return (
    <>
      <div className="light-adjustment-world-layer" aria-label="场景灯光选择层">
        {lights.map((light) => {
          const active = light.id === selectedLightId;
          return (
            <button
              key={light.id}
              type="button"
              className={'light-adjustment-handle ' + (active ? 'is-selected' : '')}
              style={{ left: `${light.x}%`, top: `${light.y}%` }}
              aria-label={'选择灯光 ' + light.name}
              aria-pressed={active}
              onClick={() => selectLight(light.id)}
            >
              <i className="light-adjustment-handle__ring" aria-hidden="true" />
              <span>{light.name}</span>
            </button>
          );
        })}
      </div>

      <PlacementContextPanel
        ariaLabel={page === 'color' ? '调整灯光 HDR 颜色' : '灯光调整'}
        icon={Lightbulb}
        title={page === 'color' ? '灯光颜色' : '灯光'}
        subtitle={page === 'color' ? 'HDR 颜色' : (selected?.name ?? '请选择场景灯光')}
        closeLabel="退出灯光调整"
        backLabel="返回灯光参数"
        onBack={page === 'color' ? () => setPage('parameters') : undefined}
        className={'light-adjustment-panel motion-left-surface is-' + motionPhase}
        bodyClassName="light-adjustment-panel__body"
        onClose={onClose}
        dataAttributes={{
          'data-light-adjustment-page': page,
          'data-light-adjustment-selected': selected?.id ?? 'none',
          'data-light-intensity-scale': selected ? selected.intensityScale.toFixed(2) : undefined,
          'data-light-range-scale': selected ? selected.rangeScale.toFixed(2) : undefined,
          'data-light-hdr-intensity': selected ? selected.hdrIntensity.toFixed(2) : undefined,
        }}
      >
        {page === 'color' && selected ? (
          <ColorEditorPage
            definition={LIGHT_COLOR_DEFINITION}
            color={selected.color}
            intensity={selected.hdrIntensity}
            intensityLabel="HDR 强度"
            intensityMin={0}
            intensityMax={8}
            intensityStep={0.1}
            onColorChange={(color) => updateSelected({ color })}
            onIntensityChange={(hdrIntensity) => updateSelected({ hdrIntensity })}
          />
        ) : selected ? (
          <div className="light-adjustment-parameters">
            <LeftContextSection title="灯光参数">
              <button
                type="button"
                className="light-adjustment-color-row"
                aria-label="调整灯光颜色"
                onClick={() => setPage('color')}
              >
                <span>颜色</span>
                <span className="light-adjustment-color-row__value">
                  <i style={{ background: selected.color }} aria-hidden="true" />
                  <small>HDR</small>
                  <ChevronRight aria-hidden="true" />
                </span>
              </button>

              <RuntimeParameterRow
                label="亮度"
                value={selected.intensityScale}
                min={0}
                max={3}
                step={0.05}
                format={(value) => `${value.toFixed(2)}×`}
                onChange={(intensityScale) => updateSelected({ intensityScale })}
              />

              <RuntimeParameterRow
                label="范围"
                value={selected.rangeScale}
                min={0.25}
                max={3}
                step={0.05}
                format={(value) => `${value.toFixed(2)}×`}
                onChange={(rangeScale) => updateSelected({ rangeScale })}
              />
            </LeftContextSection>
          </div>
        ) : (
          <div className="light-adjustment-empty">
            <MousePointer2 aria-hidden="true" />
            <b>选择一盏场景灯光</b>
            <span>点击世界中的灯光标记开始调整。</span>
          </div>
        )}
      </PlacementContextPanel>
    </>
  );
}
