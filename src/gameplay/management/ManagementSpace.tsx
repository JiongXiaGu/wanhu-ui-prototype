import { useState } from 'react';
import { X } from 'lucide-react';
import { FinanceManagementView, type TaxRates } from './FinanceManagementView';
import { InventoryManagementView } from './InventoryManagementView';
import { MANAGEMENT_PANELS, type ManagementSection } from './management-registry';
import { OverviewManagementView } from './OverviewManagementView';

interface ManagementSpaceProps {
  view: ManagementSection;
  onClose: () => void;
}

const DEFAULT_TAX_RATES: TaxRates = { field: 12, commerce: 8, market: 6 };

export function ManagementSpace({ view, onClose }: ManagementSpaceProps) {
  const panel = MANAGEMENT_PANELS[view];
  const HeadingIcon = panel.icon;
  const [taxRates, setTaxRates] = useState(DEFAULT_TAX_RATES);

  return (
    <div className={`management-space management-space--${view} management-space--topic-${panel.topic}`} data-management-topic={panel.topic}>
      <div className="management-space__scrim" aria-hidden="true" />
      <section className="management-space__panel" role="dialog" aria-label={panel.title}>
        <header className="management-space__header">
          <div className="management-space__heading">
            <span className="management-space__heading-icon"><HeadingIcon /></span>
            <h2>{panel.title}</h2>
          </div>
          <button type="button" className="management-space__close icon-button" aria-label="关闭城市管理" onClick={onClose}><X /></button>
        </header>

        <div className="management-space__body">
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
