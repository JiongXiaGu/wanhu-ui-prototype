import type { LucideIcon } from 'lucide-react';
import {
  Archive,
  Box,
  Building2,
  Camera,
  ChevronsRight,
  CloudSun,
  Coins,
  Droplets,
  Eye,
  FastForward,
  Landmark,
  Layers3,
  Menu as MenuIcon,
  Pause,
  Play,
  Route,
  ScrollText,
  Shield,
  ShieldCheck,
  Sparkles,
  Store,
  Users,
} from 'lucide-react';
import type { Flyout, ManagementView, MapView, Speed } from '../app/ui-state';
import { ResourceValue } from '../ui/Controls';

interface MapViewItem {
  id: MapView;
  label: string;
  icon: LucideIcon;
}

interface ManagementPrimaryItem {
  id: Exclude<ManagementView, 'none'>;
  label: string;
  icon: LucideIcon;
}

interface SpeedControlItem {
  value: Speed;
  label: string;
  icon: LucideIcon;
}

interface GameplayHUDProps {
  flyout: Flyout;
  management: ManagementView;
  mapView: MapView;
  mapPanelOpen: boolean;
  speed: Speed;
  showControlTray: boolean;
  onFlyoutChange: (flyout: Flyout) => void;
  onManagementChange: (management: ManagementView) => void;
  onToggleMapPanel: () => void;
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

const MANAGEMENT_PRIMARY: ManagementPrimaryItem[] = [
  { id: 'city', label: '城市', icon: Building2 },
  { id: 'finance', label: '经济', icon: Coins },
  { id: 'policy', label: '政策', icon: ScrollText },
  { id: 'military', label: '军事', icon: Shield },
  { id: 'governance', label: '宫殿', icon: Landmark },
];

const SPEED_CONTROLS: SpeedControlItem[] = [
  { value: 0, label: '暂停时间', icon: Pause },
  { value: 1, label: '正常速度', icon: Play },
  { value: 2, label: '加速时间', icon: ChevronsRight },
  { value: 4, label: '高速时间', icon: FastForward },
];

export function GameplayHUD({
  flyout,
  management,
  mapView,
  mapPanelOpen,
  speed,
  showControlTray,
  onFlyoutChange,
  onManagementChange,
  onToggleMapPanel,
  onMapViewChange,
  onSpeedChange,
  onPause,
}: GameplayHUDProps) {
  return (
    <div className={`gameplay-top-shell ${showControlTray ? 'has-navigation' : ''}`}>
      <div className="gameplay-top-status">
        <div className="gameplay-top-status__world-state" aria-label="天气与时间">
          <span className="gameplay-top-status__weather-state">
            <CloudSun />
            <b>晴</b>
          </span>
          <span className="gameplay-top-status__clock">秋 · 14:30</span>
        </div>

        <div className="resource-strip gameplay-top-status__resources" aria-label="城市资源">
          <ResourceValue icon={<Archive size={13} />} label="钱粮" value="24,680" />
          <ResourceValue icon={<Sparkles size={13} />} label="人口" value="8,426" />
          <ResourceValue icon={<Box size={13} />} label="木材" value="3,240" />
          <ResourceValue icon={<Layers3 size={13} />} label="石料" value="2,780" />
        </div>

        <div className="gameplay-top-status__time-controls" aria-label="时间控制">
          {SPEED_CONTROLS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              className={`gameplay-top-speed-button ${speed === value ? 'is-active' : ''}`}
              aria-label={label}
              data-tooltip={label}
              onClick={() => onSpeedChange(value)}
            >
              <Icon />
            </button>
          ))}
        </div>
      </div>

      {showControlTray && (
        <nav className="gameplay-top-navigation" aria-label="城市控制">
          <div className="gameplay-top-navigation__view">
            <button
              type="button"
              className={`gameplay-top-navigation__button gameplay-top-navigation__map ${mapPanelOpen || mapView !== 'default' ? 'is-active' : ''}`}
              aria-label="信息视图"
              data-tooltip="信息视图"
              onClick={onToggleMapPanel}
            >
              <Layers3 />
              {mapView !== 'default' && <i className="gameplay-top-navigation__dot" />}
            </button>
          </div>

          <i className="gameplay-top-navigation__separator" />

          <div className="gameplay-top-navigation__management" aria-label="城市管理">
            {MANAGEMENT_PRIMARY.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`gameplay-top-navigation__button ${management === item.id ? 'is-active' : ''}`}
                  aria-label={item.label}
                  data-tooltip={item.label}
                  onClick={() => onManagementChange(item.id)}
                >
                  <Icon />
                </button>
              );
            })}
          </div>

          <i className="gameplay-top-navigation__separator" />

          <div className="gameplay-top-navigation__scene" aria-label="场景工具">
            <button
              type="button"
              className={`gameplay-top-navigation__button ${flyout === 'camera' ? 'is-active' : ''}`}
              aria-label="相机"
              data-tooltip="相机"
              onClick={() => onFlyoutChange('camera')}
            >
              <Camera />
            </button>
            <button
              type="button"
              className={`gameplay-top-navigation__button ${flyout === 'weather' ? 'is-active' : ''}`}
              aria-label="天气控制"
              data-tooltip="天气控制"
              onClick={() => onFlyoutChange('weather')}
            >
              <CloudSun />
            </button>
            <button
              type="button"
              className="gameplay-top-navigation__button"
              aria-label="菜单"
              data-tooltip="菜单"
              onClick={onPause}
            >
              <MenuIcon />
            </button>
          </div>
        </nav>
      )}

      {showControlTray && mapPanelOpen && (
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
                  onClick={() => onMapViewChange(item.id)}
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
