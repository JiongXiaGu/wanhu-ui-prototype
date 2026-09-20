import { useState } from 'react';
import { X } from '../../ui/icons/runtime-icons.generated';
import { FinanceManagementView, type TaxRates } from './FinanceManagementView';
import { InventoryManagementView } from './InventoryManagementView';
import { MANAGEMENT_PANELS, type ManagementSection } from './management-registry';
import { OverviewManagementView } from './OverviewManagementView';
import type { MotionPhase } from '../../ui/motion';

interface ManagementSpaceProps {
  view: ManagementSection;
  motionPhase?: MotionPhase;
  onClose: () => void;
}

const DEFAULT_TAX_RATES: TaxRates = { field: 12, commerce: 8, market: 6 };

export function ManagementSpace({ view, motionPhase = 'steady', onClose }: ManagementSpaceProps) {
  const panel = MANAGEMENT_PANELS[view];
  const HeadingIcon = panel.icon;
  const [taxRates, setTaxRates] = useState(DEFAULT_TAX_RATES);

  return (
    <div className={`management-space management-space--${view} management-space--topic-${panel.topic} is-${motionPhase}`} data-management-topic={panel.topic} aria-busy={motionPhase !== 'steady'}>
      <div className="management-space__scrim" aria-hidden="true" />
      <section className="management-space__panel" role="dialog" aria-label={panel.title}>
        <header className="management-space__header">
          <div className="management-space__heading">
            <span className="management-space__heading-icon"><HeadingIcon /></span>
            <h2>{panel.title}</h2>
          </div>
          <button type="button" className="management-space__close icon-button" aria-label="关闭城市管理" onClick={onClose}><X /></button>
        </header>

        <div className="management-space__body management-space__motion-content" key={view}>
          <section className="management-metrics" aria-label="关键指标">
            {panel.stats.map((stat) => (
              <div key={stat.label} className="management-metric">
                <small>{stat.label}</small>
                <div><strong>{stat.value}</strong>{stat.delta && <em>{stat.delta}</em>}</div>
              </div>
            ))}
          </section>

          {view === 'finance' ? (
            <FinanceManagementView taxRates={taxRates} onTaxRatesChange={setTaxRates} />
          ) : view === 'inventory' ? (
            <InventoryManagementView />
          ) : (
            <OverviewManagementView view={view} />
          )}
        </div>
      </section>
    </div>
  );
}
