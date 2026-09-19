import {
  useEffect,
  useMemo,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { ClipboardPaste, Copy, Palette, RotateCcw } from 'lucide-react';
import { RuntimeParameterRow, TextInput, ToggleSwitch } from '../../ui/Controls';
import { LeftContextSection } from '../../ui/LeftContextPanel';
import { MOTION_MS, useKeyedTransition, type MotionPhase } from '../../ui/motion';
import { PlacementContextPanel } from '../placement/PlacementContextPanel';

type MaterialWorkflow = '金属' | '高光';
type MaterialColorTarget = 'BaseColor' | 'EmissionColor' | 'NightEmissionColor' | 'SpecularColor';
type MaterialPageKey = 'surface' | `color:${MaterialColorTarget}`;
type ColorNumericMode = 'RGB' | 'HSV';

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

interface ColorClipboardPayload {
  hex: string;
  hdr: boolean;
  alpha?: number;
  intensity?: number;
}

interface Props {
  motionPhase?: MotionPhase;
  onClose: () => void;
  onDirty: () => void;
}

const DEFAULT_SURFACE_DRAFT: MaterialSurfaceDraft = {
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
};

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

function cloneDraft(value: MaterialSurfaceDraft): MaterialSurfaceDraft {
  return { ...value };
}

function draftsEqual(left: MaterialSurfaceDraft, right: MaterialSurfaceDraft) {
  return (Object.keys(DEFAULT_SURFACE_DRAFT) as Array<keyof MaterialSurfaceDraft>)
    .every((key) => Object.is(left[key], right[key]));
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

function ColorNumericModeControl({
  value,
  onChange,
}: {
  value: ColorNumericMode;
  onChange: (value: ColorNumericMode) => void;
}) {
  return (
    <div className="material-color-model-control" role="group" aria-label="颜色数值模式">
      {(['RGB', 'HSV'] as ColorNumericMode[]).map((item) => (
        <button
          key={item}
          type="button"
          aria-pressed={value === item}
          className={value === item ? 'is-active' : ''}
          onClick={() => onChange(item)}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

function ColorFieldRow({
  label,
  value,
  hdr = false,
  field,
  onOpen,
}: {
  label: string;
  value: string;
  hdr?: boolean;
  field: MaterialColorTarget;
  onOpen: (field: MaterialColorTarget) => void;
}) {
  return (
    <div className="material-color-field ui-parameter-row" data-material-field={field}>
      <span className="material-color-field__label">{label}</span>
      <button
        className="material-color-field__control"
        type="button"
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

function MaterialClipboardFooter({
  resetLabel,
  resetDisabled,
  copyLabel,
  pasteLabel,
  pasteDisabled,
  onReset,
  onCopy,
  onPaste,
}: {
  resetLabel: string;
  resetDisabled: boolean;
  copyLabel: string;
  pasteLabel: string;
  pasteDisabled: boolean;
  onReset: () => void;
  onCopy: () => void;
  onPaste: () => void;
}) {
  return (
    <>
      <button
        className="context-panel-reset-button material-footer-reset"
        type="button"
        disabled={resetDisabled}
        onClick={onReset}
      >
        <RotateCcw aria-hidden="true" />
        <span>{resetLabel}</span>
      </button>
      <div className="material-footer-copy-group">
        <button className="material-footer-action" type="button" onClick={onCopy} aria-label={copyLabel}>
          <Copy aria-hidden="true" />
          <span>{copyLabel}</span>
        </button>
        <button
          className="material-footer-action"
          type="button"
          disabled={pasteDisabled}
          onClick={onPaste}
          aria-label={pasteLabel}
        >
          <ClipboardPaste aria-hidden="true" />
          <span>{pasteLabel}</span>
        </button>
      </div>
    </>
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
        {specularWorkflow && (
          <ColorFieldRow label="高光颜色" value={draft.specularColor} field="SpecularColor" onOpen={onOpenColor} />
        )}
      </LeftContextSection>

      <LeftContextSection title="表面" className="material-palette-section material-palette-properties">
        {!specularWorkflow && (
          <div data-material-field="Metallic">
            <RuntimeParameterRow
              label="金属度"
              value={draft.metallic}
              min={0}
              max={1}
              step={0.01}
              format={(value) => value.toFixed(2)}
              onChange={(value) => onUpdate('metallic', value)}
            />
          </div>
        )}
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

      <div className="material-palette-workflow-bottom" data-material-field="Flags.SpecularSetup">
        <div className="material-workflow-field ui-parameter-row">
          <span>工作流</span>
          <MaterialWorkflowControl value={draft.workflow} onChange={(value) => onUpdate('workflow', value)} />
        </div>
      </div>
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
}: {
  definition: ColorTargetDefinition;
  color: string;
  alpha?: number;
  intensity?: number;
  onColorChange: (value: string) => void;
  onAlphaChange?: (value: number) => void;
  onIntensityChange?: (value: number) => void;
}) {
  const hsv = useMemo(() => hexToHsv(color), [color]);
  const rgb = useMemo(() => hexToRgb(color), [color]);
  const [hexDraft, setHexDraft] = useState(color.toUpperCase());
  const [numericMode, setNumericMode] = useState<ColorNumericMode>('RGB');

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

  function updateRgb(channel: 'r' | 'g' | 'b', value: number) {
    const next = { r: rgb.r, g: rgb.g, b: rgb.b };
    next[channel] = clamp01(value / 255);
    onColorChange(rgbToHex(next.r, next.g, next.b));
  }

  function updateHsv(channel: 'h' | 's' | 'v', value: number) {
    const next = { ...hsv };
    if (channel === 'h') next.h = value;
    else next[channel] = clamp01(value / 100);
    onColorChange(hsvToHex(next.h, next.s, next.v));
  }

  return (
    <div
      className="material-color-editor"
      data-color-editor-target={definition.target}
      data-color-editor-hdr={definition.hdr ? 'true' : 'false'}
      data-color-numeric-mode={numericMode.toLowerCase()}
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

      <div className="material-color-editor__hue-row ui-parameter-row">
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
        <div className="material-color-editor__hex-field ui-parameter-row">
          <span>HEX</span>
          <div className="material-color-editor__hex-control">
            <i className="material-color-editor__preview-swatch" style={{ background: color }} aria-hidden="true" />
            <TextInput
              aria-label="十六进制颜色"
              value={hexDraft}
              onChange={(event) => setHexDraft(event.currentTarget.value)}
              onBlur={commitHex}
              onKeyDown={handleHexKeyDown}
            />
          </div>
        </div>

        <div className="material-color-model-row ui-parameter-row">
          <span>数值模式</span>
          <ColorNumericModeControl value={numericMode} onChange={setNumericMode} />
        </div>

        <div className="material-color-channel-group">
          {numericMode === 'RGB' ? (
            <>
              <div data-color-channel="R">
                <RuntimeParameterRow label="R" value={Math.round(rgb.r * 255)} min={0} max={255} step={1} format={(value) => value.toFixed(0)} onChange={(value) => updateRgb('r', value)} />
              </div>
              <div data-color-channel="G">
                <RuntimeParameterRow label="G" value={Math.round(rgb.g * 255)} min={0} max={255} step={1} format={(value) => value.toFixed(0)} onChange={(value) => updateRgb('g', value)} />
              </div>
              <div data-color-channel="B">
                <RuntimeParameterRow label="B" value={Math.round(rgb.b * 255)} min={0} max={255} step={1} format={(value) => value.toFixed(0)} onChange={(value) => updateRgb('b', value)} />
              </div>
            </>
          ) : (
            <>
              <div data-color-channel="H">
                <RuntimeParameterRow label="H" value={Math.round(hsv.h)} min={0} max={360} step={1} format={(value) => `${value.toFixed(0)}°`} onChange={(value) => updateHsv('h', value)} />
              </div>
              <div data-color-channel="S">
                <RuntimeParameterRow label="S" value={Math.round(hsv.s * 100)} min={0} max={100} step={1} format={(value) => `${value.toFixed(0)}%`} onChange={(value) => updateHsv('s', value)} />
              </div>
              <div data-color-channel="V">
                <RuntimeParameterRow label="V" value={Math.round(hsv.v * 100)} min={0} max={100} step={1} format={(value) => `${value.toFixed(0)}%`} onChange={(value) => updateHsv('v', value)} />
              </div>
            </>
          )}
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
  const [draft, setDraft] = useState<MaterialSurfaceDraft>(() => cloneDraft(DEFAULT_SURFACE_DRAFT));
  const [activeColorTarget, setActiveColorTarget] = useState<MaterialColorTarget | null>(null);
  const [surfaceClipboard, setSurfaceClipboard] = useState<MaterialSurfaceDraft | null>(null);
  const [colorClipboard, setColorClipboard] = useState<ColorClipboardPayload | null>(null);

  const requestedPage: MaterialPageKey = activeColorTarget ? `color:${activeColorTarget}` : 'surface';
  const pageTransition = useKeyedTransition<MaterialPageKey>(requestedPage, MOTION_MS.surface);
  const pageDirection = activeColorTarget ? 'forward' : 'back';
  const currentDefinition = activeColorTarget ? COLOR_TARGETS[activeColorTarget] : null;
  const specularWorkflow = draft.workflow === '高光';
  const surfaceModified = !draftsEqual(draft, DEFAULT_SURFACE_DRAFT);

  function update<K extends keyof MaterialSurfaceDraft>(key: K, value: MaterialSurfaceDraft[K]) {
    if (Object.is(draft[key], value)) return;
    setDraft((current) => ({ ...current, [key]: value }));
    onDirty();
  }

  function replaceDraft(next: MaterialSurfaceDraft) {
    setDraft(cloneDraft(next));
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
    const currentColor = colorForTarget(target);
    const currentIntensity = intensityForTarget(target);
    const currentAlpha = target === 'BaseColor' ? draft.baseAlpha : undefined;
    const nextAlpha = definition.defaultAlpha;
    const nextIntensity = definition.defaultIntensity;
    const alreadyDefault = currentColor === definition.defaultHex
      && (nextAlpha === undefined || Object.is(currentAlpha, nextAlpha))
      && (nextIntensity === undefined || Object.is(currentIntensity, nextIntensity));
    if (alreadyDefault) return;
    updateColor(target, definition.defaultHex);
    if (target === 'BaseColor') update('baseAlpha', definition.defaultAlpha ?? 1);
    if (target === 'EmissionColor') update('emissionIntensity', definition.defaultIntensity ?? 1);
    if (target === 'NightEmissionColor') update('nightEmissionIntensity', definition.defaultIntensity ?? 1);
  }

  function isColorDefault(target: MaterialColorTarget) {
    const definition = COLOR_TARGETS[target];
    if (colorForTarget(target) !== definition.defaultHex) return false;
    if (target === 'BaseColor' && !Object.is(draft.baseAlpha, definition.defaultAlpha ?? 1)) return false;
    if (target === 'EmissionColor' && !Object.is(draft.emissionIntensity, definition.defaultIntensity ?? 1)) return false;
    if (target === 'NightEmissionColor' && !Object.is(draft.nightEmissionIntensity, definition.defaultIntensity ?? 1)) return false;
    return true;
  }

  function copyCurrentColor(target: MaterialColorTarget) {
    const definition = COLOR_TARGETS[target];
    setColorClipboard({
      hex: colorForTarget(target),
      hdr: definition.hdr,
      alpha: definition.alpha && target === 'BaseColor' ? draft.baseAlpha : undefined,
      intensity: definition.hdr ? intensityForTarget(target) : undefined,
    });
  }

  function pasteCurrentColor(target: MaterialColorTarget) {
    if (!colorClipboard) return;
    updateColor(target, colorClipboard.hex);
    const definition = COLOR_TARGETS[target];
    if (definition.alpha && target === 'BaseColor' && colorClipboard.alpha !== undefined) {
      update('baseAlpha', colorClipboard.alpha);
    }
    if (definition.hdr && colorClipboard.hdr && colorClipboard.intensity !== undefined) {
      updateIntensity(target, colorClipboard.intensity);
    }
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
        />
      </div>
    );
  }

  const footer = activeColorTarget ? (
    <MaterialClipboardFooter
      resetLabel="恢复默认"
      resetDisabled={isColorDefault(activeColorTarget)}
      copyLabel="复制颜色"
      pasteLabel="粘贴颜色"
      pasteDisabled={!colorClipboard}
      onReset={() => resetColor(activeColorTarget)}
      onCopy={() => copyCurrentColor(activeColorTarget)}
      onPaste={() => pasteCurrentColor(activeColorTarget)}
    />
  ) : (
    <MaterialClipboardFooter
      resetLabel="恢复默认"
      resetDisabled={!surfaceModified}
      copyLabel="复制参数"
      pasteLabel="粘贴参数"
      pasteDisabled={!surfaceClipboard}
      onReset={() => replaceDraft(DEFAULT_SURFACE_DRAFT)}
      onCopy={() => setSurfaceClipboard(cloneDraft(draft))}
      onPaste={() => surfaceClipboard && replaceDraft(surfaceClipboard)}
    />
  );

  return (
    <PlacementContextPanel
      ariaLabel={activeColorTarget ? `调整${currentDefinition?.label ?? '颜色'}` : '配色工具表面模式参数'}
      icon={Palette}
      title={currentDefinition?.label ?? '表面'}
      subtitle={currentDefinition ? (currentDefinition.hdr ? 'HDR 颜色' : '颜色') : '当前材质槽'}
      closeLabel="退出配色工具"
      backLabel="返回表面参数"
      onBack={activeColorTarget ? () => setActiveColorTarget(null) : undefined}
      footerClassName="material-palette-footer"
      footer={footer}
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
        'data-material-surface-clipboard': surfaceClipboard ? 'ready' : 'empty',
        'data-material-color-clipboard': colorClipboard ? 'ready' : 'empty',
      }}
    >
      <div className="material-palette-page-host">
        {pageTransition.outgoing && renderPage(pageTransition.outgoing, pageTransition.outgoingPhase, true)}
        {renderPage(pageTransition.active, pageTransition.activePhase)}
      </div>
    </PlacementContextPanel>
  );
}
