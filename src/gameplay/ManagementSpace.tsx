import { useState } from 'react';
import { ChevronRight, MapPin, Truck, Warehouse, X } from 'lucide-react';
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

type InventoryTab = 'overview' | 'warehouses' | 'villages';

const INVENTORY_RESOURCES = [
  { name: '粮食', total: '12,480', city: '6,240', villages: '6,240', delta: '+186', status: '充足', tone: 'good' },
  { name: '木材', total: '3,860', city: '1,420', villages: '2,440', delta: '+58', status: '正常', tone: 'normal' },
  { name: '石料', total: '2,780', city: '1,680', villages: '1,100', delta: '+34', status: '正常', tone: 'normal' },
  { name: '铁料', total: '1,160', city: '840', villages: '320', delta: '+12', status: '偏紧', tone: 'warning' },
  { name: '布匹', total: '920', city: '720', villages: '200', delta: '+8', status: '正常', tone: 'normal' },
  { name: '陶器', total: '740', city: '520', villages: '220', delta: '+10', status: '正常', tone: 'normal' },
];

const CITY_WAREHOUSES = [
  {
    id: 'river-port',
    name: '河港总仓',
    district: '东河埠',
    used: 1860,
    capacity: 2400,
    purpose: '综合转运',
    inbound: '420 / 日',
    outbound: '368 / 日',
    contents: [
      { name: '粮食', amount: 820, share: 44 },
      { name: '木材', amount: 460, share: 25 },
      { name: '石料', amount: 320, share: 17 },
      { name: '铁料', amount: 260, share: 14 },
    ],
  },
  {
    id: 'east-market',
    name: '东市转运仓',
    district: '东市坊',
    used: 1280,
    capacity: 1600,
    purpose: '民生商货',
    inbound: '286 / 日',
    outbound: '301 / 日',
    contents: [
      { name: '粮食', amount: 520, share: 41 },
      { name: '布匹', amount: 280, share: 22 },
      { name: '陶器', amount: 190, share: 15 },
      { name: '日用品', amount: 290, share: 22 },
    ],
  },
  {
    id: 'north-garrison',
    name: '北门军需仓',
    district: '北门营',
    used: 920,
    capacity: 1200,
    purpose: '军需储备',
    inbound: '96 / 日',
    outbound: '82 / 日',
    contents: [
      { name: '粮食', amount: 360, share: 39 },
      { name: '铁料', amount: 310, share: 34 },
      { name: '木材', amount: 160, share: 17 },
      { name: '器械', amount: 90, share: 10 },
    ],
  },
  {
    id: 'west-workshop',
    name: '西作坊料仓',
    district: '西作坊',
    used: 1060,
    capacity: 1400,
    purpose: '营造原料',
    inbound: '174 / 日',
    outbound: '168 / 日',
    contents: [
      { name: '木材', amount: 520, share: 49 },
      { name: '石料', amount: 360, share: 34 },
      { name: '铁料', amount: 180, share: 17 },
    ],
  },
];

const VILLAGE_STOCKS = [
  { id: 'nantang', name: '南塘村', resource: '稻米', stock: '2,860', daily: '+92', route: '南门粮道', distance: '6.4 里', destination: '河港总仓', status: '运输正常' },
  { id: 'dongliu', name: '东柳村', resource: '木材', stock: '1,940', daily: '+58', route: '东岸林道', distance: '8.1 里', destination: '西作坊料仓', status: '运输正常' },
  { id: 'qingshi', name: '青石村', resource: '石料', stock: '1,100', daily: '+34', route: '北山石道', distance: '11.6 里', destination: '河港总仓', status: '运输正常' },
  { id: 'tielu', name: '铁炉村', resource: '铁料', stock: '320', daily: '+12', route: '北驿道', distance: '14.2 里', destination: '北门军需仓', status: '车队偏少' },
  { id: 'yunjin', name: '云锦村', resource: '布匹', stock: '200', daily: '+8', route: '西郊官道', distance: '9.7 里', destination: '东市转运仓', status: '运输正常' },
  { id: 'taoxi', name: '陶溪村', resource: '陶器', stock: '220', daily: '+10', route: '南岸水路', distance: '12.3 里', destination: '东市转运仓', status: '运输正常' },
];

export function ManagementSpace({ view, onClose }: Props) {
  const panel = MANAGEMENT_PANELS[view];
  const HeadingIcon = panel.icon;
  const [taxRates, setTaxRates] = useState({ field: 12, commerce: 8, market: 6 });

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
          ) : view === 'inventory' ? (
            <InventoryContent />
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

function InventoryContent() {
  const [tab, setTab] = useState<InventoryTab>('overview');
  const [warehouseId, setWarehouseId] = useState(CITY_WAREHOUSES[0].id);
  const [villageId, setVillageId] = useState(VILLAGE_STOCKS[0].id);
  const warehouse = CITY_WAREHOUSES.find((item) => item.id === warehouseId) ?? CITY_WAREHOUSES[0];
  const village = VILLAGE_STOCKS.find((item) => item.id === villageId) ?? VILLAGE_STOCKS[0];

  return (
    <div className="inventory-management">
      <nav className="inventory-management__tabs" aria-label="库存视图">
        <button type="button" className={tab === 'overview' ? 'is-active' : ''} onClick={() => setTab('overview')}>总览</button>
        <button type="button" className={tab === 'warehouses' ? 'is-active' : ''} onClick={() => setTab('warehouses')}>城市仓库</button>
        <button type="button" className={tab === 'villages' ? 'is-active' : ''} onClick={() => setTab('villages')}>周边村庄</button>
      </nav>

      {tab === 'overview' && (
        <div className="inventory-overview">
          <section className="management-section inventory-overview__resources">
            <div className="management-section__title"><b>资源总览</b><span>城市库存 + 周边村庄专项储量</span></div>
            <div className="inventory-resource-table">
              <div className="inventory-resource-row inventory-resource-row--head">
                <span>资源</span><span>总量</span><span>城市</span><span>村庄</span><span>日变化</span><span>状态</span>
              </div>
              {INVENTORY_RESOURCES.map((item) => (
                <div key={item.name} className="inventory-resource-row">
                  <b>{item.name}</b>
                  <strong>{item.total}</strong>
                  <span>{item.city}</span>
                  <span>{item.villages}</span>
                  <em>{item.delta}</em>
                  <i className={`inventory-status inventory-status--${item.tone}`}>{item.status}</i>
                </div>
              ))}
            </div>
          </section>

          <div className="inventory-overview__aside">
            <section className="management-section inventory-network-card">
              <div className="management-section__title"><b>仓储网络</b><i /></div>
              <div className="inventory-kpi-list">
                <div><small>城市仓库</small><b>4 座</b></div>
                <div><small>总仓容</small><b>6,600</b></div>
                <div><small>当前占用</small><b>68%</b></div>
                <div><small>在途货量</small><b>860</b></div>
              </div>
            </section>
            <section className="management-section inventory-alert-card">
              <div className="management-section__title"><b>供应判断</b><i /></div>
              <div className="inventory-judgement">
                <strong>铁料偏紧</strong>
                <p>北门军需与营造需求同时增加，现有储量约可维持 18 天。</p>
                <span><Truck /> 北驿道车队建议增派 1 队</span>
              </div>
            </section>
          </div>
        </div>
      )}

      {tab === 'warehouses' && (
        <div className="inventory-split inventory-split--warehouses">
          <section className="management-section inventory-location-list">
            <div className="management-section__title"><b>城市仓库</b><span>按实际存放地点查看</span></div>
            <div className="inventory-location-list__body">
              {CITY_WAREHOUSES.map((item) => {
                const pct = Math.round(item.used / item.capacity * 100);
                return (
                  <button key={item.id} type="button" className={warehouseId === item.id ? 'is-active' : ''} onClick={() => setWarehouseId(item.id)}>
                    <span><Warehouse /><b>{item.name}</b><small>{item.district} · {item.purpose}</small></span>
                    <em>{item.used.toLocaleString()} / {item.capacity.toLocaleString()}</em>
                    <i><u style={{ width: `${pct}%` }} /></i>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="management-section inventory-location-detail">
            <div className="inventory-location-detail__heading">
              <span><Warehouse /><div><b>{warehouse.name}</b><small>{warehouse.district} · {warehouse.purpose}</small></div></span>
              <em>{Math.round(warehouse.used / warehouse.capacity * 100)}% 占用</em>
            </div>
            <div className="inventory-location-detail__metrics">
              <div><small>已用仓容</small><b>{warehouse.used.toLocaleString()}</b></div>
              <div><small>总仓容</small><b>{warehouse.capacity.toLocaleString()}</b></div>
              <div><small>日入库</small><b>{warehouse.inbound}</b></div>
              <div><small>日出库</small><b>{warehouse.outbound}</b></div>
            </div>
            <div className="management-section__title"><b>实际存放</b><span>按当前占用量</span></div>
            <div className="inventory-content-list">
              {warehouse.contents.map((item) => (
                <div key={item.name}>
                  <span><b>{item.name}</b><small>{item.share}%</small></span>
                  <strong>{item.amount.toLocaleString()}</strong>
                  <i><em style={{ width: `${item.share}%` }} /></i>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {tab === 'villages' && (
        <div className="inventory-split inventory-split--villages">
          <section className="management-section inventory-location-list">
            <div className="management-section__title"><b>周边村庄</b><span>每个村庄仅记录一类专项资源</span></div>
            <div className="inventory-location-list__body inventory-village-list">
              {VILLAGE_STOCKS.map((item) => (
                <button key={item.id} type="button" className={villageId === item.id ? 'is-active' : ''} onClick={() => setVillageId(item.id)}>
                  <span><MapPin /><b>{item.name}</b><small>{item.resource} · {item.distance}</small></span>
                  <em>{item.stock}</em>
                  <i className="inventory-village-list__delta">{item.daily} / 日</i>
                </button>
              ))}
            </div>
          </section>

          <section className="management-section inventory-location-detail inventory-village-detail">
            <div className="inventory-location-detail__heading">
              <span><MapPin /><div><b>{village.name}</b><small>{village.distance} · {village.route}</small></div></span>
              <em>{village.status}</em>
            </div>
            <div className="inventory-village-focus">
              <small>专项资源</small>
              <b>{village.resource}</b>
              <strong>{village.stock}</strong>
              <span>日产 {village.daily}</span>
            </div>
            <div className="inventory-route-card">
              <Truck />
              <div><small>主要去向</small><b>{village.destination}</b></div>
              <span>{village.route}</span>
            </div>
            <div className="inventory-village-note">
              <small>村庄规则</small>
              <p>农村节点只维护一项专项资源储量。城市仓库负责综合存储与再分配，村庄本身不显示混合库存。</p>
            </div>
          </section>
        </div>
      )}
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
