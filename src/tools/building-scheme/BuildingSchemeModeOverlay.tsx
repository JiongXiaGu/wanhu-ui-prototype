import { useState } from 'react';
import { Building2, ChevronRight, MousePointer2, Palette } from 'lucide-react';
import { RuntimeParameterRow } from '../../ui/Controls';
import { LeftContextSection } from '../../ui/LeftContextPanel';
import { usePresence, type MotionPhase } from '../../ui/motion';
import { PlacementContextPanel } from '../placement/PlacementContextPanel';
import {
  BuildingSchemeWorkspace,
  type BuildingColorScheme,
} from './BuildingSchemeWorkspace';

interface BuildingAppearanceDraft {
  id: string;
  name: string;
  x: number;
  y: number;
  weathering: number;
  schemeId: string;
}

interface Props {
  motionPhase?: MotionPhase;
  onClose: () => void;
  onDirty: () => void;
}

const COLOR_SCHEMES: readonly BuildingColorScheme[] = [
  { id: 'jiangnan-elegant', name: '江南素雅', source: 'builtin', style: 'elegant', colors: ['#d6d0c3', '#4d5554', '#74513d'] },
  { id: 'ink-restrained', name: '墨瓦沉木', source: 'builtin', style: 'restrained', colors: ['#343b3b', '#5e493b', '#a49b89'] },
  { id: 'spring-vivid', name: '春庭明彩', source: 'builtin', style: 'vivid', colors: ['#c96e4d', '#c5a75f', '#6e876b'] },
  { id: 'royal-ornate', name: '皇家朱金', source: 'builtin', style: 'ornate', colors: ['#8c3e32', '#b69145', '#d8c696'] },
  { id: 'mountain-natural', name: '山居原色', source: 'builtin', style: 'natural', colors: ['#7d664e', '#657064', '#a89c7e'] },
  { id: 'temple-gray', name: '寺观灰青', source: 'builtin', style: 'restrained', colors: ['#596568', '#7a5a45', '#bbb4a3'] },
  { id: 'white-wall', name: '粉墙黛瓦', source: 'builtin', style: 'elegant', colors: ['#dfd9cd', '#444c4d', '#84624d'] },
  { id: 'courtyard-red', name: '深院朱梁', source: 'builtin', style: 'ornate', colors: ['#753d35', '#403d39', '#a88b5e'] },
  { id: 'workshop-rain', name: '雨巷青黛', source: 'workshop', style: 'elegant', colors: ['#9ca8a5', '#3f4b50', '#5d4b42'] },
  { id: 'workshop-autumn', name: '秋庭暖木', source: 'workshop', style: 'natural', colors: ['#9b704e', '#b29b70', '#555f55'] },
  { id: 'workshop-festival', name: '灯市彩檐', source: 'workshop', style: 'vivid', colors: ['#a34f3e', '#d09c4c', '#54766f'] },
  { id: 'player-amber', name: '我的暖檐', source: 'player', style: 'vivid', colors: ['#ad6d4c', '#c6a36b', '#6f7363'] },
  { id: 'player-night', name: '夜庭深青', source: 'player', style: 'restrained', colors: ['#37484d', '#4d4140', '#817963'] },
  { id: 'player-experiment', name: '试验配色 01', source: 'player', style: 'other', colors: ['#6f5f72', '#8a7860', '#535c58'] },
];

const INITIAL_BUILDINGS: BuildingAppearanceDraft[] = [
  { id: 'tower-03', name: '重檐楼阁 03', x: 67, y: 45, weathering: 0.35, schemeId: 'jiangnan-elegant' },
  { id: 'inn-07', name: '临街客栈 07', x: 54, y: 60, weathering: 0.48, schemeId: 'ink-restrained' },
  { id: 'hall-02', name: '州衙侧殿 02', x: 77, y: 62, weathering: 0.22, schemeId: 'royal-ornate' },
  { id: 'house-12', name: '河畔民居 12', x: 43, y: 50, weathering: 0.58, schemeId: 'white-wall' },
];

export function BuildingSchemeModeOverlay({
  motionPhase = 'steady',
  onClose,
  onDirty,
}: Props) {
  const [buildings, setBuildings] = useState<BuildingAppearanceDraft[]>(INITIAL_BUILDINGS);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const workspacePresence = usePresence(workspaceOpen);

  const selected = buildings.find((building) => building.id === selectedBuildingId) ?? null;
  const selectedScheme = COLOR_SCHEMES.find((scheme) => scheme.id === selected?.schemeId) ?? COLOR_SCHEMES[0];

  function selectBuilding(id: string) {
    setSelectedBuildingId(id);
  }

  function updateSelected(patch: Partial<Pick<BuildingAppearanceDraft, 'weathering' | 'schemeId'>>) {
    if (!selectedBuildingId) return;
    setBuildings((current) => current.map((building) => (
      building.id === selectedBuildingId ? { ...building, ...patch } : building
    )));
    onDirty();
  }

  return (
    <>
      <div className="building-scheme-world-layer" aria-label="场景建筑选择层">
        {buildings.map((building) => {
          const active = building.id === selectedBuildingId;
          return (
            <button
              key={building.id}
              type="button"
              className={'building-scheme-handle ' + (active ? 'is-selected' : '')}
              style={{ left: `${building.x}%`, top: `${building.y}%` }}
              aria-label={'选择建筑 ' + building.name}
              aria-pressed={active}
              onClick={() => selectBuilding(building.id)}
            >
              <Building2 aria-hidden="true" />
              <span>{building.name}</span>
            </button>
          );
        })}
      </div>

      <PlacementContextPanel
        ariaLabel="建筑配色方案模式"
        icon={Palette}
        title="建筑外观"
        subtitle={selected?.name ?? '请选择场景建筑'}
        closeLabel="退出配色工具"
        className={'building-scheme-panel motion-left-surface is-' + motionPhase}
        bodyClassName="building-scheme-panel__body"
        onClose={onClose}
        dataAttributes={{
          'data-building-selected': selected?.id ?? 'none',
          'data-building-scheme-id': selected?.schemeId,
          'data-building-scheme-name': selected ? selectedScheme.name : undefined,
          'data-building-weathering': selected ? selected.weathering.toFixed(2) : undefined,
          'data-building-scheme-workspace': workspaceOpen ? 'open' : 'closed',
        }}
      >
        {selected ? (
          <div className="building-scheme-panel__parameters">
            <LeftContextSection title="外观参数">
              <div className="ui-parameter-row building-scheme-selector-row">
                <span>配色方案</span>
                <button
                  type="button"
                  className="building-scheme-selector"
                  aria-label="打开建筑配色方案"
                  onClick={() => setWorkspaceOpen(true)}
                >
                  <span>{selectedScheme.name}</span>
                  <ChevronRight aria-hidden="true" />
                </button>
              </div>

              <RuntimeParameterRow
                label="做旧程度"
                value={selected.weathering}
                min={0}
                max={1}
                step={0.01}
                format={(value) => `${Math.round(value * 100)}%`}
                onChange={(weathering) => updateSelected({ weathering })}
              />
            </LeftContextSection>
          </div>
        ) : (
          <div className="building-scheme-panel__empty">
            <MousePointer2 aria-hidden="true" />
            <b>选择一栋场景建筑</b>
            <span>点击世界中的建筑标记开始管理配色方案。</span>
          </div>
        )}
      </PlacementContextPanel>

      {workspacePresence.mounted && selected && (
        <BuildingSchemeWorkspace
          motionPhase={workspacePresence.phase}
          schemes={COLOR_SCHEMES}
          selectedSchemeId={selected.schemeId}
          onApply={(schemeId) => updateSelected({ schemeId })}
          onClose={() => setWorkspaceOpen(false)}
        />
      )}
    </>
  );
}
