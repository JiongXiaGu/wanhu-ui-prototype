import { useEffect, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Archive,
  Box,
  Camera,
  CloudSun,
  Coins,
  Droplets,
  Eye,
  Layers3,
  Menu as MenuIcon,
  Pause,
  Route,
  ShieldCheck,
  Sparkles,
  Store,
  Users,
} from 'lucide-react';
import type { Flyout, ManagementView, MapView, Speed } from '../app/ui-state';
import { ResourceValue } from '../ui/Controls';
import { MANAGEMENT_NAV_ITEMS } from './management-model';

interface MapViewItem {
  id: MapView;
  label: string;
  icon: LucideIcon;
}

interface GameplayHUDProps {
  flyout: Flyout;
  management: ManagementView;
  mapView: MapView;
  speed: Speed;
  showManagementNavigation: boolean;
  onFlyoutChange: (flyout: Flyout) => void;
  onManagementChange: (management: ManagementView) => void;
  onMapViewChange: (mapView: MapView) => void;
  onSpeedChange: (speed: Speed) => void;
  onPause: () => void;
}

const MAP_VIEWS: MapViewItem[] = [
  { id: 'default', label: '默认', icon: Eye },
  { id: 'land-value', label: '地价', icon: Coins },
  { id: 'population', label: '人口', icon: Users },
  { id: 'commerce', label: '商业', icon: Store },
  { id: 'traffic', label: '道路', icon: Route },
  { id: 'security', label: '治安', icon: ShieldCheck },
  { id: 'water', label: '水利', icon: Droplets },
];

export function GameplayHUD({
  flyout,
  management,
  mapView,
  speed,
  showManagementNavigation,
  onFlyoutChange,
  onManagementChange,
  onMapViewChange,
  onSpeedChange,
  onPause,
}: GameplayHUDProps) {
  const [mapPanelOpen, setMapPanelOpen] = useState(false);

  useEffect(() => {
    if (!showManagementNavigation) setMapPanelOpen(false);
  }, [showManagementNavigation]);

  function openManagement(next: Exclude<ManagementView, 'none'>) {
    setMapPanelOpen(false);
    onManagementChange(next);
  }

  function toggleMapViews() {
    if (management !== 'none') onManagementChange('none');
    setMapPanelOpen((open) => !open);
  }

  return (
    <div className={`gameplay-top-shell ${showManagementNavigation ? 'has-navigation' : ''}`}>
      <div className="gameplay-top-status">
        <div className="resource-strip gameplay-top-status__resources">
          <ResourceValue icon={<Archive size={13} />} label="钱粮" value="24,680" />
          <ResourceValue icon={<Sparkles size={13} />} label="人口" value="8,426" />
          <ResourceValue icon={<Box size={13} />} label="木材" value="3,240" />
          <ResourceValue icon={<Layers3 size={13} />} label="石料" value="2,780" />
        </div>

        <i className="gameplay-top-status__separator" />

        <button
          type="button"
          className={`gameplay-top-status__button gameplay-top-status__weather ${flyout === 'weather' ? 'is-active' : ''}`}
          aria-label="天气"
          onClick={() => onFlyoutChange(flyout === 'weather' ? 'none' : 'weather')}
        >
          <CloudSun />
          <span>晴</span>
        </button>
        <span className="gameplay-top-status__clock">秋 · 14:30</span>

        <i className="gameplay-top-status__separator" />

        <button
          type="button"
          className={`gameplay-top-status__button ${flyout === 'camera' ? 'is-active' : ''}`}
          aria-label="相机"
          onClick={() => onFlyoutChange(flyout === 'camera' ? 'none' : 'camera')}
        >
          <Camera />
          <span>相机</span>
        </button>

        <i className="gameplay-top-status__separator gameplay-top-status__separator--tight" />

        <div className="gameplay-top-status__speed" aria-label="时间速度">
          <button type="button" className="gameplay-top-speed-button" aria-label="暂停时间"><Pause /></button>
          {([1, 2, 4] as Speed[]).map((value) => (
            <button
              key={value}
              type="button"
              className={`gameplay-top-speed-button ${speed === value ? 'is-active' : ''}`}
              onClick={() => onSpeedChange(value)}
            >
              ×{value}
            </button>
          ))}
        </div>

        <i className="gameplay-top-status__separator gameplay-top-status__separator--tight" />

        <button type="button" className="gameplay-top-status__button" aria-label="菜单" onClick={onPause}>
          <MenuIcon />
          <span>菜单</span>
        </button>
      </div>

      {showManagementNavigation && (
        <nav className="gameplay-top-navigation" aria-label="城市管理">
          {MANAGEMENT_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                className={management === item.id ? 'is-active' : ''}
                aria-label={item.label}
                onClick={() => openManagement(item.id)}
              >
                <Icon />
                <span>{item.shortLabel}</span>
              </button>
            );
          })}

          <i className="gameplay-top-navigation__separator" />

          <button
            type="button"
            className={`gameplay-top-navigation__map ${mapPanelOpen || mapView !== 'default' ? 'is-active' : ''}`}
            aria-label="信息视图"
            onClick={toggleMapViews}
          >
            <Layers3 />
            <span>图层</span>
            {mapView !== 'default' && <i className="gameplay-top-navigation__dot" />}
          </button>
        </nav>
      )}

      {showManagementNavigation && mapPanelOpen && (
        <aside className="gameplay-top-map-panel">
          <header><b>信息视图</b></header>
          <div className="gameplay-top-map-grid">
            {MAP_VIEWS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={mapView === item.id ? 'is-active' : ''}
                  onClick={() => {
                    onMapViewChange(item.id);
                    setMapPanelOpen(false);
                  }}
                >
                  <Icon />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
          {mapView !== 'default' && (
            <div className="gameplay-top-map-legend">
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
