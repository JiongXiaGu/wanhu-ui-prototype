import { useState } from 'react';
import { Palette } from 'lucide-react';
import { RuntimeParameterRow, ToggleSwitch } from '../../ui/Controls';
import { LeftContextSection } from '../../ui/LeftContextPanel';
import type { MotionPhase } from '../../ui/motion';
import { PlacementContextPanel } from '../placement/PlacementContextPanel';

type MaterialWorkflow = '金属' | '高光';

function MaterialWorkflowControl({
  value,
  onChange,
}: {
  value: MaterialWorkflow;
  onChange: (value: MaterialWorkflow) => void;
}) {
  return (
    <div className="material-workflow-control" role="group" aria-label="材质工作流">
      {(['金属', '高光'] as MaterialWorkflow[]).map((item) => {
        const active = item === value;
        return (
          <button
            key={item}
            type="button"
            className={'material-workflow-control__option ' + (active ? 'is-active' : '')}
            aria-pressed={active}
            onClick={() => onChange(item)}
          >
            <i className="material-workflow-control__indicator" aria-hidden="true" />
            <span>{item}</span>
          </button>
        );
      })}
    </div>
  );
}

interface MaterialSurfaceDraft {
  baseColor: string;
  emissionColor: string;
  nightEmissionColor: string;
  specularColor: string;
  workflow: MaterialWorkflow;
  metallic: number;
  smoothness: number;
  occlusion: number;
  specularHighlights: boolean;
  alphaClip: boolean;
  alphaClipThreshold: number;
  textureTiling: number;
  textureBlendSharpness: number;
}

interface Props {
  motionPhase?: MotionPhase;
  onClose: () => void;
  onDirty: () => void;
}

function ColorFieldRow({
  label,
  value,
  hdr = false,
  disabled = false,
  field,
  onChange,
}: {
  label: string;
  value: string;
  hdr?: boolean;
  disabled?: boolean;
  field: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className={'material-color-field ui-parameter-row ' + (disabled ? 'is-disabled' : '')} data-material-field={field}>
      <span className="material-color-field__label">{label}</span>
      <label className="material-color-field__control">
        <i className="material-color-field__swatch" style={{ background: value }} />
        <b>{value.toUpperCase()}</b>
        {hdr && <em>HDR</em>}
        <input
          type="color"
          value={value}
          disabled={disabled}
          aria-label={label}
          onChange={(event) => onChange(event.currentTarget.value)}
        />
      </label>
    </div>
  );
}

function ToggleFieldRow({
  label,
  value,
  field,
  onChange,
}: {
  label: string;
  value: boolean;
  field: string;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="material-toggle-field ui-parameter-row" data-material-field={field}>
      <span>{label}</span>
      <ToggleSwitch label={label} value={value} onChange={onChange} />
    </div>
  );
}

export function MaterialPaletteOverlay({
  motionPhase = 'steady',
  onClose,
  onDirty,
}: Props) {
  const [draft, setDraft] = useState<MaterialSurfaceDraft>({
    baseColor: '#ffffff',
    emissionColor: '#000000',
    nightEmissionColor: '#000000',
    // Web visual placeholder only. Unity keeps using MaterialSlotGpuDefaults.DielectricSpecularColor.
    specularColor: '#0a0a0a',
    workflow: '金属',
    metallic: 0,
    smoothness: 0.5,
    occlusion: 1,
    specularHighlights: true,
    alphaClip: false,
    alphaClipThreshold: 0,
    textureTiling: 1,
    textureBlendSharpness: 1,
  });

  function update<K extends keyof MaterialSurfaceDraft>(key: K, value: MaterialSurfaceDraft[K]) {
    if (Object.is(draft[key], value)) return;
    setDraft((current) => ({ ...current, [key]: value }));
    onDirty();
  }

  const specularWorkflow = draft.workflow === '高光';

  return (
    <PlacementContextPanel
      ariaLabel="配色工具表面模式参数"
      icon={Palette}
      title="表面"
      subtitle="当前材质槽"
      closeLabel="退出配色工具"
      className={'material-palette-prototype motion-left-surface is-' + motionPhase}
      bodyClassName="material-palette-prototype__body"
      onClose={onClose}
      dataAttributes={{
        'data-material-mode': 'surface',
        'data-material-workflow': specularWorkflow ? 'specular' : 'metallic',
        'data-material-alpha-clip': draft.alphaClip ? 'true' : 'false',
        'data-material-specular-highlights': draft.specularHighlights ? 'on' : 'off',
      }}
    >
      <div className="material-palette-surface">
        <LeftContextSection title="颜色" className="material-palette-section material-palette-colors">
          <ColorFieldRow label="主色" value={draft.baseColor} field="BaseColor" onChange={(value) => update('baseColor', value)} />
          <ColorFieldRow label="发光颜色" value={draft.emissionColor} hdr field="EmissionColor" onChange={(value) => update('emissionColor', value)} />
          <ColorFieldRow label="夜间发光颜色" value={draft.nightEmissionColor} field="NightEmissionColor" onChange={(value) => update('nightEmissionColor', value)} />
          <ColorFieldRow
            label="高光颜色"
            value={draft.specularColor}
            disabled={!specularWorkflow}
            field="SpecularColor"
            onChange={(value) => update('specularColor', value)}
          />
        </LeftContextSection>

        <LeftContextSection title="表面" className="material-palette-section material-palette-properties">
          <div className="material-workflow-field ui-parameter-row" data-material-field="Flags.SpecularSetup">
            <span>工作流</span>
            <MaterialWorkflowControl
              value={draft.workflow}
              onChange={(value) => update('workflow', value)}
            />
          </div>
          <div data-material-field="Metallic">
            <RuntimeParameterRow
              label="金属度"
              value={draft.metallic}
              min={0}
              max={1}
              step={0.01}
              disabled={specularWorkflow}
              format={(value) => value.toFixed(2)}
              onChange={(value) => update('metallic', value)}
            />
          </div>
          <div data-material-field="Smoothness">
            <RuntimeParameterRow
              label="光滑度"
              value={draft.smoothness}
              min={0}
              max={1}
              step={0.01}
              format={(value) => value.toFixed(2)}
              onChange={(value) => update('smoothness', value)}
            />
          </div>
          <div data-material-field="Occlusion">
            <RuntimeParameterRow
              label="环境遮蔽"
              value={draft.occlusion}
              min={0}
              max={1}
              step={0.01}
              format={(value) => value.toFixed(2)}
              onChange={(value) => update('occlusion', value)}
            />
          </div>

          <ToggleFieldRow
            label="高光反射"
            value={draft.specularHighlights}
            field="Flags.SpecularHighlightsOff"
            onChange={(value) => update('specularHighlights', value)}
          />
          <ToggleFieldRow
            label="Alpha 裁剪"
            value={draft.alphaClip}
            field="Flags.AlphaClip"
            onChange={(value) => update('alphaClip', value)}
          />
          {draft.alphaClip && (
            <div data-material-field="AlphaClipThreshold">
              <RuntimeParameterRow
                label="裁剪阈值"
                value={draft.alphaClipThreshold}
                min={0}
                max={1}
                step={0.01}
                format={(value) => value.toFixed(2)}
                onChange={(value) => update('alphaClipThreshold', value)}
              />
            </div>
          )}
        </LeftContextSection>

        <LeftContextSection title="贴图" className="material-palette-section material-palette-texture">
          <div data-material-field="TextureTiling">
            <RuntimeParameterRow
              label="铺贴倍率"
              value={draft.textureTiling}
              min={0.1}
              max={8}
              step={0.1}
              format={(value) => value.toFixed(1)}
              onChange={(value) => update('textureTiling', value)}
            />
          </div>
          <div data-material-field="TextureBlendSharpness">
            <RuntimeParameterRow
              label="混合锐度"
              value={draft.textureBlendSharpness}
              min={0.1}
              max={8}
              step={0.1}
              format={(value) => value.toFixed(1)}
              onChange={(value) => update('textureBlendSharpness', value)}
            />
          </div>
        </LeftContextSection>
      </div>
    </PlacementContextPanel>
  );
}
