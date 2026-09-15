import { useEffect, useState } from 'react';
import { ChevronRight, X } from 'lucide-react';
import { MANAGEMENT_PANELS, type ManagementSection } from './management-model';

interface Props {
  view: ManagementSection;
  onClose: () => void;
}

const FINANCE_TREND = [
  { month: '四月', income: 61, expense: 54 },
  { month: '五月', income: 66, expense: 58 },
  { month: '六月', income: 70, expense: 56 },
  { month: '七月', income: 74, expense: 60 },
  { month: '八月', income: 78, expense: 62 },
  { month: '九月', income: 86, expense: 63 },
];

const FINANCE_BREAKDOWN = [
  { label: '商税', value: '2,672', pct: 78 },
  { label: '田赋', value: '2,188', pct: 64 },
  { label: '市税', value: '1,466', pct: 46 },
  { label: '关津与其它', value: '2,294', pct: 68 },
];

export function ManagementSpace({ view, onClose }: Props) {
  const panel = MANAGEMENT_PANELS[view];
  const HeadingIcon = panel.icon;
  const [taxRates, setTaxRates] = useState({ field: 12, commerce: 8, market: 6 });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className={`management-space management-space--${view}`}>
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
            <FinanceContent taxRates={taxRates} onTaxRatesChange={setTaxRates} />
          ) : (
            <OverviewContent view={view} />
          )}
        </div>
      </section>
    </div>
  );
}

function OverviewContent({ view }: { view: ManagementSection }) {
  const panel = MANAGEMENT_PANELS[view];
  return (
    <div className="management-overview-grid">
      <section className="management-section management-section--primary">
        <div className="management-section__title"><b>重点事项</b><i /></div>
        <div className="management-task-list">
          {panel.rows.map((row) => (
            <button key={row.label} type="button" className="management-task-row">
              <span>
                <b>{row.label}</b>
                <small>{row.description}</small>
              </span>
              <em>{row.value}</em>
              <ChevronRight />
            </button>
          ))}
        </div>
      </section>

      <section className="management-section management-section--aside">
        <div className="management-section__title"><b>本期观察</b><i /></div>
        <div className="management-note-list">
          {panel.notes.map((note) => (
            <div key={note.label} className="management-note-row">
              <small>{note.label}</small>
              <b>{note.value}</b>
            </div>
          ))}
        </div>
        <div className="management-space__quiet-graph" aria-hidden="true">
          <span style={{ height: '32%' }} />
          <span style={{ height: '45%' }} />
          <span style={{ height: '41%' }} />
          <span style={{ height: '58%' }} />
          <span style={{ height: '64%' }} />
          <span style={{ height: '72%' }} />
          <span style={{ height: '68%' }} />
          <span style={{ height: '82%' }} />
        </div>
      </section>
    </div>
  );
}

function FinanceContent({
  taxRates,
  onTaxRatesChange,
}: {
  taxRates: { field: number; commerce: number; market: number };
  onTaxRatesChange: (value: { field: number; commerce: number; market: number }) => void;
}) {
  return (
    <div className="management-finance-layout">
      <section className="management-section management-finance-trend">
        <div className="management-section__title">
          <b>近六月收支</b>
          <span><i className="is-income" />收入 <i className="is-expense" />支出</span>
        </div>
        <div className="finance-chart" aria-label="近六月收入支出趋势">
          {FINANCE_TREND.map((item) => (
            <div key={item.month} className="finance-chart__month">
              <div className="finance-chart__bars">
                <i className="is-income" style={{ height: `${item.income}%` }} />
                <i className="is-expense" style={{ height: `${item.expense}%` }} />
              </div>
              <small>{item.month}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="management-section management-finance-breakdown">
        <div className="management-section__title"><b>本月收入构成</b><i /></div>
        <div className="finance-breakdown-list">
          {FINANCE_BREAKDOWN.map((item) => (
            <div key={item.label} className="finance-breakdown-row">
              <div><span>{item.label}</span><b>{item.value}</b></div>
              <i><em style={{ width: `${item.pct}%` }} /></i>
            </div>
          ))}
        </div>
      </section>

      <section className="management-section management-finance-tax">
        <div className="management-section__title"><b>税赋设置</b><span>调整会影响财政、民心与产业活力</span></div>
        <TaxRow label="田赋" value={taxRates.field} hint="农业与田地产出" onChange={(field) => onTaxRatesChange({ ...taxRates, field })} />
        <TaxRow label="商税" value={taxRates.commerce} hint="商铺与贸易收入" onChange={(commerce) => onTaxRatesChange({ ...taxRates, commerce })} />
        <TaxRow label="市税" value={taxRates.market} hint="城市服务与市井经营" onChange={(market) => onTaxRatesChange({ ...taxRates, market })} />
      </section>

      <section className="management-section management-finance-notes">
        <div className="management-section__title"><b>财政判断</b><i /></div>
        <div className="management-note-list">
          <div className="management-note-row"><small>最大收入来源</small><b>商税 31%</b></div>
          <div className="management-note-row"><small>最大支出项目</small><b>公共营造 28%</b></div>
          <div className="management-note-row"><small>预计下月结余</small><b>+2,460</b></div>
        </div>
      </section>
    </div>
  );
}

function TaxRow({ label, value, hint, onChange }: { label: string; value: number; hint: string; onChange: (value: number) => void }) {
  return (
    <label className="finance-tax-row">
      <span><b>{label}</b><small>{hint}</small></span>
      <input type="range" min="0" max="20" step="1" value={value} onChange={(event) => onChange(Number(event.currentTarget.value))} />
      <output>{value}%</output>
    </label>
  );
}
