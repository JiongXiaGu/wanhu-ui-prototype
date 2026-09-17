import { FINANCE_BREAKDOWN, FINANCE_TREND } from './prototype-data';

export interface TaxRates {
  field: number;
  commerce: number;
  market: number;
}

interface FinanceManagementViewProps {
  taxRates: TaxRates;
  onTaxRatesChange: (value: TaxRates) => void;
}

export function FinanceManagementView({ taxRates, onTaxRatesChange }: FinanceManagementViewProps) {
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
