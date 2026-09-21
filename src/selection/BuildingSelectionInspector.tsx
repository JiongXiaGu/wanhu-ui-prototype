import { Building2, ChevronRight } from '../ui/icons/runtime-icons.generated';
import { RuntimeParameterRow } from '../ui/Controls';
import { LeftContextPanel, LeftContextSection } from '../ui/LeftContextPanel';
import type { MotionPhase } from '../ui/motion';
import type { BuildingSelectionDefinition } from './building-selection-model';

interface Props {
  building: BuildingSelectionDefinition;
  schemeName: string;
  schemeOpen: boolean;
  weathering: number;
  motionPhase?: MotionPhase;
  onOpenScheme: () => void;
  onWeatheringChange: (value: number) => void;
  onClose: () => void;
}

export function BuildingSelectionInspector({
  building,
  schemeName,
  schemeOpen,
  weathering,
  motionPhase = 'steady',
  onOpenScheme,
  onWeatheringChange,
  onClose,
}: Props) {
  return (
    <LeftContextPanel
      ariaLabel={'建筑信息 ' + building.name}
      icon={Building2}
      title={building.name}
      subtitle={building.category + ' · ' + building.district}
      className={'building-selection-inspector motion-left-surface is-' + motionPhase}
      bodyClassName="building-selection-inspector__body"
      showClose={false}
      onClose={onClose}
      dataAttributes={{
        'data-selection-kind': 'building',
        'data-selection-id': building.id,
        'data-building-scheme-open': schemeOpen ? 'true' : 'false',
      }}
    >
      <div className="building-selection-status"><span>当前状态</span><b>{building.status}</b></div>

      {building.sections.map((section) => (
        <LeftContextSection title={section.title} key={section.title}>
          <div className="building-selection-info-list">
            {section.rows.map((row) => (
              <div className="building-selection-info-row" key={row.label}>
                <span>{row.label}</span>
                <b className={row.tone && row.tone !== 'normal' ? 'is-' + row.tone : ''}>{row.value}</b>
              </div>
            ))}
          </div>
        </LeftContextSection>
      ))}

      <LeftContextSection title="外观参数" className="building-selection-appearance-section">
        <div className="ui-parameter-row building-scheme-selector-row">
          <span>配色方案</span>
          <button
            type="button"
            className="building-scheme-selector"
            aria-label="打开当前建筑配色方案"
            aria-expanded={schemeOpen}
            onClick={onOpenScheme}
          >
            <span>{schemeName}</span>
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
        <RuntimeParameterRow
          label="做旧程度"
          value={weathering}
          min={0}
          max={1}
          step={0.01}
          format={(value) => Math.round(value * 100) + '%'}
          onChange={onWeatheringChange}
        />
      </LeftContextSection>
    </LeftContextPanel>
  );
}
