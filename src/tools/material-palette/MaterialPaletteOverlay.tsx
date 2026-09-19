import {
  useEffect,
  useMemo,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { Palette, RotateCcw } from 'lucide-react';
import { RuntimeParameterRow, TextInput, ToggleSwitch } from '../../ui/Controls';
import { LeftContextSection } from '../../ui/LeftContextPanel';
import { MOTION_MS, useKeyedTransition, type MotionPhase } from '../../ui/motion';
import { PlacementContextPanel } from '../placement/PlacementContextPanel';

type MaterialWorkflow = '金属' | '高光';
type MaterialColorTarget = 'BaseColor' | 'EmissionColor' | 'NightEmissionColor' | 'SpecularColor';
type MaterialPageKey = 'surface' | `color:${MaterialColorTarget}`;

interface MaterialSurfaceDraft {
  baseColor: string;
  baseAlpha: number;
  emissionColor: string;
  emissionIntensity: number;
  nightEmissionColor: string;
  nightEmissionIntensity: number;
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

interface ColorTargetDefinition {
  target: MaterialColorTarget;
  label: string;
  hdr: boolean;
  alpha: boolean;
  defaultHex: string;
  defaultAlpha?: number;
  defaultIntensity?: number;
}

const COLOR_TARGETS: Record<MaterialColorTarget, ColorTargetDefinition> = {
  BaseColor: {
    target: 'BaseColor',
    label: '主色',
    hdr: false,
    alpha: true,
    defaultHex: '#ffffff',
    defaultAlpha: 1,
  },
  EmissionColor: {
    target: 'EmissionColor',
    label: '发光颜色',
    hdr: true,
    alpha: false,
    defaultHex: '#000000',
    defaultIntensity: 1,
  },
  NightEmissionColor: {
    target: 'NightEmissionColor',
    label: '夜间发光颜色',
    hdr: true,
    alpha: false,
    defaultHex: '#000000',
    defaultIntensity: 1,
  },
  SpecularColor: {
    target: 'SpecularColor',
    label: '高光颜色',
    hdr: false,
    alpha: false,
    defaultHex: '#0a0a0a',
  },
};

interface Props {
  motionPhase?: MotionPhase;
  onClose: () => void;
  onDirty: () => void;
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function normalizeHex(value: string) {
  const text = value.trim();
  if (!/^#[0-9a-fA-F]{6}$/.test(text)) return null;
  return text.toLowerCase();
}

function hexToRgb(hex: string) {
  const normalized = normalizeHex(hex) ?? '#000000';
  return {
    r: parseInt(normalized.slice(1, 3), 16) / 255,
    g: parseInt(normalized.slice(3, 5), 16) / 255,
    b: parseInt(normalized.slice(5, 7), 16) / 255,
  };
}

function rgbToHex(r: number, g: number, b: number) {
  const channel = (value: number) => Math.round(clamp01(value) * 255).toString(16).padStart(2, '0');
  return `#${channel(r)}${channel(g)}${channel(b)}`;
}

function hexToHsv(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let h = 0;
  if (delta > 0.00001) {
    if (max === r) h = 60 * (((g - b) / delta) % 6);
    else if (max === g) h = 60 * ((b - r) / delta + 2);
    else h = 60 * ((r - g) / delta + 4);
  }
  if (h < 0) h += 360;
  return {
    h,
    s: max <= 0.00001 ? 0 : delta / max,
    v: max,
  };
}

function hsvToHex(h: number, s: number, v: number) {
  const normalizedH = ((h % 360) + 360) % 360;
  const c = v * s;
  const x = c * (1 - Math.abs(((normalizedH / 60) % 2) - 1));
  const m = v - c;
  let r = 0;
  let g = 0;
  let b = 0;
  if (normalizedH < 60) [r, g, b] = [c, x, 0];
  else if (normalizedH < 120) [r, g, b] = [x, c, 0];
  else if (normalizedH < 180) [r, g, b] = [0, c, x];
  else if (normalizedH < 240) [r, g, b] = [0, x, c];
  else if (normalizedH < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return rgbToHex(r + m, g + m, b + m);
}

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

function ColorFieldRow({
  label,
  value,
  hdr = false,
  disabled = false,
  field,
  onOpen,
}: {
  label: string;
  value: string;
  hdr?: boolean;
  disabled?: boolean;
  field: MaterialColorTarget;
  onOpen: (field: MaterialColorTarget) => void;
}) {
  return (
    <div className={'material-color-field ui-parameter-row ' + (disabled ? 'is-disabled' : '')} data-material-field={field}>
      <span className="material-color-field__label">{label}</span>
      <button
        className="material-color-field__control"
        type="button"
        disabled={disabled}
        aria-label={`调整${label}`}
        onClick={() => onOpen(field)}
      >
        <i className="material-color-field__swatch" style={{ background: value }} />
        <b>{value.toUpperCase()}</b>
        {hdr && <em>HDR</em>}
      </button>
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

function SurfacePage({
  draft,
  onUpdate,
  onOpenColor,
}: {
  draft: MaterialSurfaceDraft;
  onUpdate: <K extends keyof MaterialSurfaceDraft>(key: K, value: MaterialSurfaceDraft[K]) => void;
  onOpenColor: (target: MaterialColorTarget) => void;
}) {
  const specularWorkflow = draft.workflow === '高光';
  return (
    <div className="material-palette-surface">
      <LeftContextSection title="颜色" className="material-palette-section material-palette-colors">
        <ColorFieldRow label="主色" value={draft.baseColor} field="BaseColor" onOpen={onOpenColor} />
        <ColorFieldRow label="发光颜色" value={draft.emissionColor} hdr field="EmissionColor" onOpen={onOpenColor} />
        <ColorFieldRow label="夜间发光颜色" value={draft.nightEmissionColor} hdr field="NightEmissionColor" onOpen={onOpenColor} />
        <ColorFieldRow
          label="高光颜色"
          value={draft.specularColor}
          disabled={!specularWorkflow}
          field="SpecularColor"
          onOpen={onOpenColor}
        />
      </LeftContextSection>

      <LeftContextSection title="表面" className="material-palette-section material-palette-properties">
        <div className="material-workflow-field ui-parameter-row" data-material-field="Flags.SpecularSetup">
          <span>工作流</span>
          <MaterialWorkflowControl
            value={draft.workflow}
            onChange={(value) => onUpdate('workflow', value)}
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
            onChange={(value) => onUpdate('metallic', value)}
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
            onChange={(value) => onUpdate('smoothness', value)}
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
            onChange={(value) => onUpdate('occlusion', value)}
          />
        </div>
        <ToggleFieldRow
          label="高光反射"
          value={draft.specularHighlights}
          field="Flags.SpecularHighlightsOff"
          onChange={(value) => onUpdate('specularHighlights', value)}
        />
        <ToggleFieldRow
          label="Alpha 裁剪"
          value={draft.alphaClip}
          field="Flags.AlphaClip"
          onChange={(value) => onUpdate('alphaClip', value)}
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
              onChange={(value) => onUpdate('alphaClipThreshold', value)}
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
            onChange={(value) => onUpdate('textureTiling', value)}
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
            onChange={(value) => onUpdate('textureBlendSharpness', value)}
          />
        </div>
      </LeftContextSection>
    </div>
  );
}

function ColorEditorPage({
  definition,
  color,
  alpha,
  intensity,
  onColorChange,
  onAlphaChange,
  onIntensityChange,
  onReset,
}: {
  definition: ColorTargetDefinition;
  color: string;
  alpha?: number;
  intensity?: number;
  onColorChange: (value: string) => void;
  onAlphaChange?: (value: number) => void;
  onIntensityChange?: (value: number) => void;
  onReset: () => void;
}) {
  const hsv = useMemo(() => hexToHsv(color), [color]);
  const [hexDraft, setHexDraft] = useState(color.toUpperCase());

  useEffect(() => setHexDraft(color.toUpperCase()), [color, definition.target]);

  function commitHex() {
    const normalized = normalizeHex(hexDraft);
    if (normalized) onColorChange(normalized);
    else setHexDraft(color.toUpperCase());
  }

  function handleHexKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    commitHex();
    event.currentTarget.blur();
  }

  function updateSvFromPointer(event: ReactPointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const s = clamp01((event.clientX - rect.left) / Math.max(rect.width, 1));
    const v = clamp01(1 - (event.clientY - rect.top) / Math.max(rect.height, 1));
    onColorChange(hsvToHex(hsv.h, s, v));
  }

  function handleSvPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    updateSvFromPointer(event);
  }

  function handleSvPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    updateSvFromPointer(event);
  }

  return (
    <div
      className="material-color-editor"
      data-color-editor-target={definition.target}
      data-color-editor-hdr={definition.hdr ? 'true' : 'false'}
    >
      <div
        className="material-color-editor__sv"
        role="slider"
        tabIndex={0}
        aria-label="饱和度与明度"
        aria-valuetext={`饱和度 ${Math.round(hsv.s * 100)}%，明度 ${Math.round(hsv.v * 100)}%`}
        style={{
          background: `linear-gradient(to top, #000 0%, transparent 100%), linear-gradient(to right, #fff 0%, hsl(${hsv.h} 100% 50%) 100%)`,
        }}
        onPointerDown={handleSvPointerDown}
        onPointerMove={handleSvPointerMove}
      >
        <i
          className="material-color-editor__sv-cursor"
          style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%` }}
          aria-hidden="true"
        />
      </div>

      <div className="material-color-editor__hue-row">
        <span>色相</span>
        <input
          className="material-color-editor__hue-range"
          type="range"
          min={0}
          max={360}
          step={1}
          value={Math.round(hsv.h)}
          aria-label="色相"
          onChange={(event) => onColorChange(hsvToHex(Number(event.currentTarget.value), hsv.s, hsv.v))}
        />
      </div>

      <LeftContextSection
        title="颜色值"
        className="material-color-editor__values"
        action={definition.hdr ? <span className="material-color-editor__hdr-badge">HDR</span> : undefined}
      >
        <div className="material-color-editor__hex-row">
          <i className="material-color-editor__preview-swatch" style={{ background: color }} aria-hidden="true" />
          <TextInput
            aria-label="十六进制颜色"
            value={hexDraft}
            onChange={(event) => setHexDraft(event.currentTarget.value)}
            onBlur={commitHex}
            onKeyDown={handleHexKeyDown}
          />
        </div>

        {definition.alpha && alpha !== undefined && onAlphaChange && (
          <div data-color-adapter="BaseColor.Alpha">
            <RuntimeParameterRow
              label="透明度"
              value={alpha}
              min={0}
              max={1}
              step={0.01}
              format={(value) => value.toFixed(2)}
              onChange={onAlphaChange}
            />
          </div>
        )}

        {definition.hdr && intensity !== undefined && onIntensityChange && (
          <div data-color-adapter={`${definition.target}.Intensity`}>
            <RuntimeParameterRow
              label="发光强度"
              value={intensity}
              min={0}
              max={8}
              step={0.1}
              format={(value) => value.toFixed(1)}
              onChange={onIntensityChange}
            />
          </div>
        )}
      </LeftContextSection>

      <button className="material-color-editor__reset" type="button" onClick={onReset}>
        <RotateCcw aria-hidden="true" />
        <span>重置颜色</span>
      </button>
    </div>
  );
}

function pageTarget(page: MaterialPageKey): MaterialColorTarget | null {
  return page.startsWith('color:') ? page.slice('color:'.length) as MaterialColorTarget : null;
}

export function MaterialPaletteOverlay({
  motionPhase = 'steady',
  onClose,
  onDirty,
}: Props) {
  const [draft, setDraft] = useState<MaterialSurfaceDraft>({
    baseColor: '#ffffff',
    baseAlpha: 1,
    emissionColor: '#000000',
    emissionIntensity: 1,
    nightEmissionColor: '#000000',
    nightEmissionIntensity: 1,
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
  const [activeColorTarget, setActiveColorTarget] = useState<MaterialColorTarget | null>(null);

  const requestedPage: MaterialPageKey = activeColorTarget ? `color:${activeColorTarget}` : 'surface';
  const pageTransition = useKeyedTransition<MaterialPageKey>(requestedPage, MOTION_MS.surface);
  const pageDirection = activeColorTarget ? 'forward' : 'back';
  const currentDefinition = activeColorTarget ? COLOR_TARGETS[activeColorTarget] : null;
  const specularWorkflow = draft.workflow === '高光';

  function update<K extends keyof MaterialSurfaceDraft>(key: K, value: MaterialSurfaceDraft[K]) {
    if (Object.is(draft[key], value)) return;
    setDraft((current) => ({ ...current, [key]: value }));
    onDirty();
  }

  function colorForTarget(target: MaterialColorTarget) {
    if (target === 'BaseColor') return draft.baseColor;
    if (target === 'EmissionColor') return draft.emissionColor;
    if (target === 'NightEmissionColor') return draft.nightEmissionColor;
    return draft.specularColor;
  }

  function updateColor(target: MaterialColorTarget, value: string) {
    if (target === 'BaseColor') update('baseColor', value);
    else if (target === 'EmissionColor') update('emissionColor', value);
    else if (target === 'NightEmissionColor') update('nightEmissionColor', value);
    else update('specularColor', value);
  }

  function intensityForTarget(target: MaterialColorTarget) {
    if (target === 'EmissionColor') return draft.emissionIntensity;
    if (target === 'NightEmissionColor') return draft.nightEmissionIntensity;
    return undefined;
  }

  function updateIntensity(target: MaterialColorTarget, value: number) {
    if (target === 'EmissionColor') update('emissionIntensity', value);
    if (target === 'NightEmissionColor') update('nightEmissionIntensity', value);
  }

  function resetColor(target: MaterialColorTarget) {
    const definition = COLOR_TARGETS[target];
    updateColor(target, definition.defaultHex);
    if (target === 'BaseColor') update('baseAlpha', definition.defaultAlpha ?? 1);
    if (target === 'EmissionColor') update('emissionIntensity', definition.defaultIntensity ?? 1);
    if (target === 'NightEmissionColor') update('nightEmissionIntensity', definition.defaultIntensity ?? 1);
  }

  function renderPage(page: MaterialPageKey, phase: MotionPhase, outgoing = false) {
    const target = pageTarget(page);
    const pageClass = [
      'material-palette-page',
      page === 'surface' ? 'is-surface-page' : 'is-color-page',
      `is-${phase}`,
      `is-${pageDirection}`,
      outgoing ? 'is-outgoing' : 'is-active-page',
    ].join(' ');

    if (!target) {
      return (
        <div className={pageClass} key={page}>
          <SurfacePage draft={draft} onUpdate={update} onOpenColor={setActiveColorTarget} />
        </div>
      );
    }

    const definition = COLOR_TARGETS[target];
    return (
      <div className={pageClass} key={page}>
        <ColorEditorPage
          definition={definition}
          color={colorForTarget(target)}
          alpha={target === 'BaseColor' ? draft.baseAlpha : undefined}
          intensity={intensityForTarget(target)}
          onColorChange={(value) => updateColor(target, value)}
          onAlphaChange={target === 'BaseColor' ? (value) => update('baseAlpha', value) : undefined}
          onIntensityChange={definition.hdr ? (value) => updateIntensity(target, value) : undefined}
          onReset={() => resetColor(target)}
        />
      </div>
    );
  }

  return (
    <PlacementContextPanel
      ariaLabel={activeColorTarget ? `调整${currentDefinition?.label ?? '颜色'}` : '配色工具表面模式参数'}
      icon={Palette}
      title={currentDefinition?.label ?? '表面'}
      subtitle={currentDefinition ? (currentDefinition.hdr ? 'HDR 颜色' : '颜色') : '当前材质槽'}
      closeLabel="退出配色工具"
      backLabel="返回表面参数"
      onBack={activeColorTarget ? () => setActiveColorTarget(null) : undefined}
      className={'material-palette-prototype motion-left-surface is-' + motionPhase}
      bodyClassName="material-palette-prototype__body"
      onClose={onClose}
      dataAttributes={{
        'data-material-mode': 'surface',
        'data-material-page': activeColorTarget ? 'color-editor' : 'surface',
        'data-material-color-target': activeColorTarget ?? undefined,
        'data-material-workflow': specularWorkflow ? 'specular' : 'metallic',
        'data-material-alpha-clip': draft.alphaClip ? 'true' : 'false',
        'data-material-specular-highlights': draft.specularHighlights ? 'on' : 'off',
      }}
    >
      <div className="material-palette-page-host">
        {pageTransition.outgoing && renderPage(pageTransition.outgoing, pageTransition.outgoingPhase, true)}
        {renderPage(pageTransition.active, pageTransition.activePhase)}
      </div>
    </PlacementContextPanel>
  );
}
