import {
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  ChevronRight,
  ClipboardPaste,
  Copy,
  Palette,
  RotateCcw,
} from 'lucide-react';
import { RuntimeParameterRow } from '../../../../ui/Controls';
import { LeftContextSection } from '../../../../ui/LeftContextPanel';
import { ColorEditorPage, type ColorEditorDefinition } from '../../../../ui/color/ColorEditorPage';
import { MOTION_MS, useKeyedTransition, usePresence, type MotionPhase } from '../../../../ui/motion';
import { MATERIAL_FAMILY_LABELS, MaterialSchemeWorkspace, type MaterialFamily, type MaterialSchemeWorkspacePreset } from './MaterialSchemeWorkspace';
import { PlacementContextPanel } from '../../../placement/PlacementContextPanel';

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
  textureTiling: number;
  textureBlendSharpness: number;
}

interface ColorTargetDefinition extends ColorEditorDefinition {
  target: MaterialColorTarget;
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

interface MaterialPreset {
  id: string;
  family: MaterialFamily;
  name: string;
  source: 'builtin' | 'workshop' | 'mine';
  draft: MaterialSurfaceDraft;
}

interface MaterialSchemeState {
  id?: string;
  family?: MaterialFamily;
  name: string;
  source: 'builtin' | 'workshop' | 'saved' | 'custom';
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
  specularColor: '#0a0a0a',
  workflow: '金属',
  metallic: 0,
  smoothness: 0.5,
  occlusion: 1,
  textureTiling: 1,
  textureBlendSharpness: 1,
};

const BUILTIN_PRESETS: MaterialPreset[] = [
  {
    id: 'wood-walnut',
    family: 'wood',
    name: '深胡桃',
    source: 'builtin',
    draft: { ...DEFAULT_SURFACE_DRAFT, baseColor: '#6f5139', specularColor: '#3a3029', smoothness: 0.34, textureTiling: 1.4, textureBlendSharpness: 1.8 },
  },
  {
    id: 'wood-fir',
    family: 'wood',
    name: '旧杉木',
    source: 'builtin',
    draft: { ...DEFAULT_SURFACE_DRAFT, baseColor: '#8b6a4f', specularColor: '#392e26', smoothness: 0.26, occlusion: 0.94, textureTiling: 1.1, textureBlendSharpness: 1.5 },
  },
  {
    id: 'wood-lacquer',
    family: 'wood',
    name: '深漆木',
    source: 'builtin',
    draft: { ...DEFAULT_SURFACE_DRAFT, baseColor: '#4c332c', specularColor: '#2d2320', smoothness: 0.58, textureTiling: 1.0, textureBlendSharpness: 1.4 },
  },
  {
    id: 'tile-gray',
    family: 'masonry',
    name: '青灰瓦',
    source: 'builtin',
    draft: { ...DEFAULT_SURFACE_DRAFT, baseColor: '#566267', specularColor: '#202628', smoothness: 0.48, occlusion: 0.92, textureTiling: 1.8, textureBlendSharpness: 2.2 },
  },
  {
    id: 'tile-black',
    family: 'masonry',
    name: '乌瓦',
    source: 'builtin',
    draft: { ...DEFAULT_SURFACE_DRAFT, baseColor: '#343a3b', specularColor: '#181b1c', smoothness: 0.43, occlusion: 0.90, textureTiling: 2.0, textureBlendSharpness: 2.4 },
  },
  {
    id: 'tile-glazed',
    family: 'masonry',
    name: '黄绿琉璃',
    source: 'builtin',
    draft: { ...DEFAULT_SURFACE_DRAFT, baseColor: '#787443', specularColor: '#2a2a1d', smoothness: 0.66, textureTiling: 1.7, textureBlendSharpness: 2.0 },
  },
  {
    id: 'wall-plaster',
    family: 'plaster-earth',
    name: '素灰墙',
    source: 'builtin',
    draft: { ...DEFAULT_SURFACE_DRAFT, baseColor: '#d5d0c5', specularColor: '#10100f', smoothness: 0.22, occlusion: 0.96, textureTiling: 0.8, textureBlendSharpness: 1.2 },
  },
  {
    id: 'wall-white',
    family: 'plaster-earth',
    name: '白粉墙',
    source: 'builtin',
    draft: { ...DEFAULT_SURFACE_DRAFT, baseColor: '#e8e4da', specularColor: '#11110f', smoothness: 0.18, occlusion: 0.98, textureTiling: 0.7, textureBlendSharpness: 1.1 },
  },
  {
    id: 'wall-earth',
    family: 'plaster-earth',
    name: '夯土墙',
    source: 'builtin',
    draft: { ...DEFAULT_SURFACE_DRAFT, baseColor: '#aa8464', specularColor: '#2a211c', smoothness: 0.12, occlusion: 0.93, textureTiling: 0.9, textureBlendSharpness: 1.3 },
  },
];

const WORKSHOP_PRESETS: MaterialPreset[] = [
  {
    id: 'workshop-wood-smoked',
    family: 'wood',
    name: '烟熏旧木',
    source: 'workshop',
    draft: { ...DEFAULT_SURFACE_DRAFT, baseColor: '#5a4638', specularColor: '#312923', smoothness: 0.29, occlusion: 0.91, textureTiling: 1.25, textureBlendSharpness: 1.7 },
  },
  {
    id: 'workshop-tile-rain',
    family: 'masonry',
    name: '雨青瓦',
    source: 'workshop',
    draft: { ...DEFAULT_SURFACE_DRAFT, baseColor: '#46565b', specularColor: '#1e2527', smoothness: 0.38, occlusion: 0.90, textureTiling: 1.9, textureBlendSharpness: 2.1 },
  },
  {
    id: 'workshop-wall-warm',
    family: 'plaster-earth',
    name: '暖灰粉墙',
    source: 'workshop',
    draft: { ...DEFAULT_SURFACE_DRAFT, baseColor: '#c7beb0', specularColor: '#181614', smoothness: 0.17, occlusion: 0.95, textureTiling: 0.82, textureBlendSharpness: 1.15 },
  },
];

const INITIAL_PRESET = BUILTIN_PRESETS.find((preset) => preset.id === 'wall-plaster') ?? BUILTIN_PRESETS[0];

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
    label: '夜间发光',
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

function ColorCard({
  label,
  value,
  hdr = false,
  field,
  disabled = false,
  onOpen,
}: {
  label: string;
  value: string;
  hdr?: boolean;
  field: MaterialColorTarget;
  disabled?: boolean;
  onOpen: (field: MaterialColorTarget) => void;
}) {
  return (
    <button
      type="button"
      className={'material-color-strip__item ' + (disabled ? 'is-disabled' : '')}
      data-material-field={field}
      disabled={disabled}
      aria-label={`调整${label}`}
      onClick={() => onOpen(field)}
    >
      <span className="material-color-strip__item-title">{label}</span>
      {hdr && <em className="material-color-strip__item-meta">HDR</em>}
      <i className="material-color-strip__swatch" style={{ background: value }} aria-hidden="true" />
    </button>
  );
}

function SchemeSelector({
  scheme,
  onOpen,
}: {
  scheme: MaterialSchemeState;
  onOpen: () => void;
}) {
  return (
    <button className="material-scheme-selector" type="button" onClick={onOpen} aria-label="打开材质方案库">
      <span className="material-scheme-selector__label">方案</span>
      <span className="material-scheme-selector__type">{scheme.family ? MATERIAL_FAMILY_LABELS[scheme.family] : '自定义'}</span>
      <i className="material-scheme-selector__separator" aria-hidden="true">·</i>
      <b className="material-scheme-selector__name">{scheme.name}</b>
      <ChevronRight className="material-scheme-selector__chevron" aria-hidden="true" />
    </button>
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
  scheme,
  onUpdate,
  onOpenColor,
  onOpenPresetLibrary,
}: {
  draft: MaterialSurfaceDraft;
  scheme: MaterialSchemeState;
  onUpdate: <K extends keyof MaterialSurfaceDraft>(key: K, value: MaterialSurfaceDraft[K]) => void;
  onOpenColor: (target: MaterialColorTarget) => void;
  onOpenPresetLibrary: () => void;
}) {
  const specularWorkflow = draft.workflow === '高光';

  return (
    <div className="color-tool-surface">
      <SchemeSelector scheme={scheme} onOpen={onOpenPresetLibrary} />

      <LeftContextSection title="颜色" className="color-tool-surface-section color-tool-surface-colors">
        <div className={'material-color-strip ' + (specularWorkflow ? 'has-specular' : 'is-metallic')}>
          <ColorCard label="主色" value={draft.baseColor} field="BaseColor" onOpen={onOpenColor} />
          <ColorCard label="发光" value={draft.emissionColor} hdr field="EmissionColor" onOpen={onOpenColor} />
          <ColorCard label="夜间发光" value={draft.nightEmissionColor} hdr field="NightEmissionColor" onOpen={onOpenColor} />
          {specularWorkflow && (
            <ColorCard label="高光" value={draft.specularColor} field="SpecularColor" onOpen={onOpenColor} />
          )}
        </div>
      </LeftContextSection>

      <LeftContextSection title="材质属性" className="color-tool-surface-section color-tool-surface-properties">
        <div className="material-property-group material-property-group--surface">
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
        </div>

        <div className="material-property-group material-property-group--texture">
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
        </div>
      </LeftContextSection>

      <div className="color-tool-surface-workflow-bottom" data-material-field="Flags.SpecularSetup">
        <div className="material-workflow-field ui-parameter-row">
          <span>工作流</span>
          <MaterialWorkflowControl value={draft.workflow} onChange={(value) => onUpdate('workflow', value)} />
        </div>
      </div>
    </div>
  );
}

function pageTarget(page: MaterialPageKey): MaterialColorTarget | null {
  return page.startsWith('color:') ? page.slice('color:'.length) as MaterialColorTarget : null;
}

export function SurfaceModeOverlay({
  motionPhase = 'steady',
  onClose,
  onDirty,
}: Props) {
  const [draft, setDraft] = useState<MaterialSurfaceDraft>(() => cloneDraft(INITIAL_PRESET.draft));
  const [requestedPage, setRequestedPage] = useState<MaterialPageKey>('surface');
  const [surfaceClipboard, setSurfaceClipboard] = useState<MaterialSurfaceDraft | null>(null);
  const [colorClipboard, setColorClipboard] = useState<ColorClipboardPayload | null>(null);
  const [customPresets, setCustomPresets] = useState<MaterialPreset[]>([]);
  const [schemeWorkspaceOpen, setSchemeWorkspaceOpen] = useState(false);
  const [currentFamily, setCurrentFamily] = useState<MaterialFamily>(INITIAL_PRESET.family);
  const [currentScheme, setCurrentScheme] = useState<MaterialSchemeState>({
    id: INITIAL_PRESET.id,
    family: INITIAL_PRESET.family,
    name: INITIAL_PRESET.name,
    source: 'builtin',
  });

  const pageTransition = useKeyedTransition<MaterialPageKey>(requestedPage, MOTION_MS.surface);
  const schemeWorkspacePresence = usePresence(schemeWorkspaceOpen);
  const pageDirection = requestedPage === 'surface' ? 'back' : 'forward';
  const activeColorTarget = pageTarget(requestedPage);
  const currentDefinition = activeColorTarget ? COLOR_TARGETS[activeColorTarget] : null;
  const surfaceModified = !draftsEqual(draft, DEFAULT_SURFACE_DRAFT);

  function markCustom() {
    setCurrentScheme((current) => (
      current.family === undefined && current.source === 'custom'
        ? current
        : { name: '未保存', source: 'custom' }
    ));
  }

  function update<K extends keyof MaterialSurfaceDraft>(key: K, value: MaterialSurfaceDraft[K]) {
    if (Object.is(draft[key], value)) return;
    setDraft((current) => ({ ...current, [key]: value }));
    markCustom();
    onDirty();
  }

  function replaceDraft(next: MaterialSurfaceDraft, scheme?: MaterialSchemeState) {
    setDraft(cloneDraft(next));
    setCurrentScheme(scheme ?? { name: '未保存', source: 'custom' });
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

  function applyPreset(preset: MaterialPreset) {
    setCurrentFamily(preset.family);
    replaceDraft(preset.draft, {
      id: preset.id,
      family: preset.family,
      name: preset.name,
      source: preset.source === 'mine' ? 'saved' : preset.source,
    });
  }

  function nextCustomIndex() {
    return customPresets.reduce((highest, preset) => {
      const parsed = Number(preset.id.replace('custom-', ''));
      return Number.isFinite(parsed) ? Math.max(highest, parsed) : highest;
    }, 0) + 1;
  }

  function saveCurrentAsCustom(name: string, family: MaterialFamily) {
    const index = nextCustomIndex();
    const preset: MaterialPreset = {
      id: `custom-${index}`,
      family,
      name,
      source: 'mine',
      draft: cloneDraft(draft),
    };
    setCurrentFamily(family);
    setCustomPresets((current) => [...current, preset]);
    setCurrentScheme({ id: preset.id, family, name, source: 'saved' });
    return preset.id;
  }

  function updateCustomPresetMetadata(id: string, patch: { name?: string; family?: MaterialFamily }) {
    setCustomPresets((current) => current.map((preset) => (
      preset.id === id
        ? {
            ...preset,
            name: patch.name ?? preset.name,
            family: patch.family ?? preset.family,
          }
        : preset
    )));

    if (currentScheme.id === id) {
      if (patch.family) setCurrentFamily(patch.family);
      setCurrentScheme((current) => ({
        ...current,
        name: patch.name ?? current.name,
        family: patch.family ?? current.family,
      }));
    }
  }

  function copyCustomPreset(id: string) {
    const preset = customPresets.find((entry) => entry.id === id);
    if (preset) setSurfaceClipboard(cloneDraft(preset.draft));
  }

  function deleteCustomPreset(preset: MaterialPreset) {
    setCustomPresets((current) => current.filter((entry) => entry.id !== preset.id));
    if (currentScheme.id === preset.id) {
      setCurrentScheme({ name: '未保存', source: 'custom' });
    }
  }

  function toWorkspacePreset(preset: MaterialPreset): MaterialSchemeWorkspacePreset {
    return {
      id: preset.id,
      family: preset.family,
      name: preset.name,
      source: preset.source,
      selected: currentScheme.id === preset.id,
      colors: [preset.draft.baseColor, preset.draft.emissionColor, preset.draft.nightEmissionColor, preset.draft.specularColor],
      workflow: preset.draft.workflow,
      smoothness: preset.draft.smoothness,
      textureTiling: preset.draft.textureTiling,
    };
  }

  const systemWorkspacePresets = BUILTIN_PRESETS.map(toWorkspacePreset);
  const workshopWorkspacePresets = WORKSHOP_PRESETS.map(toWorkspacePreset);
  const customWorkspacePresets = customPresets.map(toWorkspacePreset);
  const saveInitialName = currentScheme.name !== '未保存' && currentScheme.name !== '自定义'
    ? `${currentScheme.name} 副本`
    : `我的配色 ${String(nextCustomIndex()).padStart(2, '0')}`;

  function renderPage(page: MaterialPageKey, phase: MotionPhase, outgoing = false) {
    const target = pageTarget(page);
    const pageClass = [
      'color-tool-surface-page',
      page === 'surface' ? 'is-surface-page' : 'is-color-page',
      `is-${phase}`,
      `is-${pageDirection}`,
      outgoing ? 'is-outgoing' : 'is-active-page',
    ].join(' ');

    if (page === 'surface') {
      return (
        <div className={pageClass} key={page}>
          <SurfacePage
            draft={draft}
            scheme={currentScheme}
            onUpdate={update}
            onOpenColor={(target) => {
              setSchemeWorkspaceOpen(false);
              setRequestedPage(`color:${target}`);
            }}
            onOpenPresetLibrary={() => setSchemeWorkspaceOpen((open) => !open)}
          />
        </div>
      );
    }

    if (!target) return null;
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

  const headerTitle = currentDefinition?.label ?? '表面';
  const headerSubtitle = currentDefinition ? (currentDefinition.hdr ? 'HDR 颜色' : '颜色') : '当前材质槽';

  return (
    <>
    <PlacementContextPanel
      ariaLabel={activeColorTarget ? `调整${currentDefinition?.label ?? '颜色'}` : '配色工具表面模式参数'}
      icon={Palette}
      title={headerTitle}
      subtitle={headerSubtitle}
      closeLabel="退出配色工具"
      backLabel="返回表面参数"
      onBack={activeColorTarget ? () => setRequestedPage('surface') : undefined}
      footerClassName="color-tool-surface-footer"
      footer={footer}
      className={'color-tool-surface-panel motion-left-surface is-' + motionPhase}
      bodyClassName="color-tool-surface-panel__body"
      onClose={onClose}
      dataAttributes={{
        'data-material-mode': 'surface',
        'data-material-page': requestedPage === 'surface' ? 'surface' : 'color-editor',
        'data-material-color-target': activeColorTarget ?? undefined,
        'data-material-workflow': draft.workflow === '高光' ? 'specular' : 'metallic',
        'data-material-scheme-type': currentScheme.family ? MATERIAL_FAMILY_LABELS[currentScheme.family] : '自定义',
        'data-material-scheme-family': currentScheme.family ?? 'custom',
        'data-material-scheme-name': currentScheme.name,
        'data-material-surface-clipboard': surfaceClipboard ? 'ready' : 'empty',
        'data-material-color-clipboard': colorClipboard ? 'ready' : 'empty',
        'data-material-scheme-workspace': schemeWorkspaceOpen ? 'open' : 'closed',
      }}
    >
      <div className="color-tool-surface-page-host">
        {pageTransition.outgoing && renderPage(pageTransition.outgoing, pageTransition.outgoingPhase, true)}
        {renderPage(pageTransition.active, pageTransition.activePhase)}
      </div>
    </PlacementContextPanel>

    {schemeWorkspacePresence.mounted && (
      <MaterialSchemeWorkspace
        motionPhase={schemeWorkspacePresence.phase}
        systemPresets={systemWorkspacePresets}
        workshopPresets={workshopWorkspacePresets}
        customPresets={customWorkspacePresets}
        canPasteCurrent={surfaceClipboard !== null}
        currentFamily={currentFamily}
        saveInitialName={saveInitialName}
        onClose={() => setSchemeWorkspaceOpen(false)}
        onApply={(id) => {
          const preset = [...BUILTIN_PRESETS, ...WORKSHOP_PRESETS, ...customPresets].find((entry) => entry.id === id);
          if (preset) applyPreset(preset);
        }}
        onSaveCurrent={saveCurrentAsCustom}
        onPasteCurrent={() => {
          if (surfaceClipboard) replaceDraft(surfaceClipboard);
        }}
        onUpdateMetadata={updateCustomPresetMetadata}
        onCopy={copyCustomPreset}
        onDelete={(id) => {
          const preset = customPresets.find((entry) => entry.id === id);
          if (preset) deleteCustomPreset(preset);
        }}
      />
    )}
    </>
  );
}
