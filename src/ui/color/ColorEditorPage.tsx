import {
  useEffect,
  useMemo,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { RuntimeParameterRow, TextInput } from '../Controls';
import { LeftContextSection } from '../LeftContextPanel';

type ColorNumericMode = 'RGB' | 'HSV';

export interface ColorEditorDefinition {
  target: string;
  label: string;
  hdr: boolean;
  alpha?: boolean;
}

export interface ColorEditorPageProps {
  definition: ColorEditorDefinition;
  color: string;
  alpha?: number;
  intensity?: number;
  intensityLabel?: string;
  intensityMin?: number;
  intensityMax?: number;
  intensityStep?: number;
  onColorChange: (value: string) => void;
  onAlphaChange?: (value: number) => void;
  onIntensityChange?: (value: number) => void;
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

export function ColorEditorPage({
  definition,
  color,
  alpha,
  intensity,
  intensityLabel = '发光强度',
  intensityMin = 0,
  intensityMax = 8,
  intensityStep = 0.1,
  onColorChange,
  onAlphaChange,
  onIntensityChange,
}: ColorEditorPageProps) {
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
      className="material-color-editor shared-color-editor"
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
              <div data-color-channel="R"><RuntimeParameterRow label="R" value={Math.round(rgb.r * 255)} min={0} max={255} step={1} format={(value) => value.toFixed(0)} onChange={(value) => updateRgb('r', value)} /></div>
              <div data-color-channel="G"><RuntimeParameterRow label="G" value={Math.round(rgb.g * 255)} min={0} max={255} step={1} format={(value) => value.toFixed(0)} onChange={(value) => updateRgb('g', value)} /></div>
              <div data-color-channel="B"><RuntimeParameterRow label="B" value={Math.round(rgb.b * 255)} min={0} max={255} step={1} format={(value) => value.toFixed(0)} onChange={(value) => updateRgb('b', value)} /></div>
            </>
          ) : (
            <>
              <div data-color-channel="H"><RuntimeParameterRow label="H" value={Math.round(hsv.h)} min={0} max={360} step={1} format={(value) => `${value.toFixed(0)}°`} onChange={(value) => updateHsv('h', value)} /></div>
              <div data-color-channel="S"><RuntimeParameterRow label="S" value={Math.round(hsv.s * 100)} min={0} max={100} step={1} format={(value) => `${value.toFixed(0)}%`} onChange={(value) => updateHsv('s', value)} /></div>
              <div data-color-channel="V"><RuntimeParameterRow label="V" value={Math.round(hsv.v * 100)} min={0} max={100} step={1} format={(value) => `${value.toFixed(0)}%`} onChange={(value) => updateHsv('v', value)} /></div>
            </>
          )}
        </div>

        {definition.alpha && alpha !== undefined && onAlphaChange && (
          <div data-color-adapter={`${definition.target}.Alpha`}>
            <RuntimeParameterRow label="透明度" value={alpha} min={0} max={1} step={0.01} format={(value) => value.toFixed(2)} onChange={onAlphaChange} />
          </div>
        )}

        {definition.hdr && intensity !== undefined && onIntensityChange && (
          <div data-color-adapter={`${definition.target}.Intensity`}>
            <RuntimeParameterRow
              label={intensityLabel}
              value={intensity}
              min={intensityMin}
              max={intensityMax}
              step={intensityStep}
              format={(value) => value.toFixed(intensityStep < 0.1 ? 2 : 1)}
              onChange={onIntensityChange}
            />
          </div>
        )}
      </LeftContextSection>
    </div>
  );
}
