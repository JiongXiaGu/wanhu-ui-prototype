import { useState } from 'react';
import { MapPin, Truck, Warehouse } from 'lucide-react';
import { CITY_WAREHOUSES, INVENTORY_RESOURCES, VILLAGE_STOCKS, type InventoryTab } from './prototype-data';

export function InventoryManagementView() {
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
