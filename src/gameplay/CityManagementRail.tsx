import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Building2,
  Coins,
  Droplets,
  Eye,
  Layers3,
  Route,
  Scale,
  ScrollText,
  Shield,
  ShieldCheck,
  Store,
  Users,
} from 'lucide-react';
import type { Flyout, MapView } from '../app/ui-state';

type ManagementFlyout = Exclude<Flyout, 'none' | 'camera' | 'weather'>;

interface ManagementItem {
  id: ManagementFlyout;
  label: string;
  icon: LucideIcon;
}

interface MapViewItem {
  id: MapView;
  label: string;
  icon: LucideIcon;
}

interface Props {
  flyout: Flyout;
  mapView: MapView;
  onFlyoutChange: (flyout: Flyout) => void;
  onMapViewChange: (mapView: MapView) => void;
}

const MANAGEMENT_ITEMS: ManagementItem[] = [
  { id: 'city', label: '城市概况', icon: Building2 },
  { id: 'population', label: '户籍民生', icon: Users },
  { id: 'finance', label: '财政税赋', icon: Coins },
  { id: 'policy', label: '政令政策', icon: ScrollText },
  { id: 'commerce', label: '商贸物流', icon: Store },
  { id: 'governance', label: '城市治理', icon: Scale },
  { id: 'military', label: '军务', icon: Shield },
];

const MAP_VIEWS: MapViewItem[] = [
  { id: 'default', label: '默认', icon: Eye },
  { id: 'land-value', label: '地价', icon: Coins },
  { id: 'population', label: '人口', icon: Users },
  { id: 'commerce', label: '商业', icon: Store },
  { id: 'traffic', label: '道路', icon: Route },
  { id: 'security', label: '治安', icon: ShieldCheck },
  { id: 'water', label: '水利', icon: Droplets },
];

export function CityManagementRail({ flyout, mapView, onFlyoutChange, onMapViewChange }: Props) {
  const [mapPanelOpen, setMapPanelOpen] = useState(false);
  const activeMapView = MAP_VIEWS.find((item) => item.id === mapView) ?? MAP_VIEWS[0];

  function toggleManagement(item: ManagementItem) {
    setMapPanelOpen(false);
    onFlyoutChange(flyout === item.id ? 'none' : item.id);
  }

  return (
    <div className="city-management-shell">
      <nav className="city-management-rail" aria-label="城市管理">
        {MANAGEMENT_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              className={`city-management-button ${flyout === item.id ? 'is-active' : ''}`}
              data-tooltip={item.label}
              aria-label={item.label}
              onClick={() => toggleManagement(item)}
            >
              <Icon />
            </button>
          );
        })}
        <i className="city-management-rail__separator" />
        <button
          type="button"
          className={`city-management-button city-management-button--map ${mapPanelOpen || mapView !== 'default' ? 'is-active' : ''}`}
          data-tooltip="信息视图"
          aria-label="信息视图"
          onClick={() => setMapPanelOpen((open) => !open)}
        >
          <Layers3 />
          {mapView !== 'default' && <span className="city-management-button__dot" />}
        </button>
      </nav>

      {mapPanelOpen && (
        <aside className="map-view-panel">
          <header>
            <div>
              <b>信息视图</b>
              <small>{activeMapView.label}</small>
            </div>
            <span>城市数据</span>
          </header>
          <div className="map-view-grid">
            {MAP_VIEWS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={mapView === item.id ? 'is-active' : ''}
                  onClick={() => onMapViewChange(item.id)}
                >
                  <Icon />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
          {mapView !== 'default' && (
            <div className="map-view-panel__legend">
              <span>低</span>
              <i />
              <span>高</span>
            </div>
          )}
        </aside>
      )}
    </div>
  );
}
