import type { UiIconComponent } from '../ui/icons/runtime-icons.generated';
import {
  Camera,
  ChevronsRight,
  CloudSun,
  Coins,
  Droplets,
  Eye,
  FastForward,
  Layers3,
  Pause,
  Play,
  Route,
  ShieldCheck,
  Store,
  Users,
} from '../ui/icons/runtime-icons.generated';
import type { ContextPanel, ManagementView, MapView, Speed } from '../app/ui-state';
import { usePresence } from '../ui/motion';
import { tooltipFromLabel, useHoverOverlay } from '../ui/hover/HoverOverlay';
import { MANAGEMENT_PRIMARY_NAV, MANAGEMENT_STATUS_QUICK_ENTRIES } from './management/management-navigation';

interface MapViewItem {
  id: MapView;
  label: string;
  icon: UiIconComponent;
}

interface SpeedControlItem {
  value: Speed;
  label: string;
  icon: UiIconComponent;
}

interface GameplayHUDProps {
  contextPanel: ContextPanel;
  dayTime: number;
  management: ManagementView;
  mapView: MapView;
  mapPanelOpen: boolean;
  speed: Speed;
  showControlTray: boolean;
  controlTrayEnterDelayMs?: number;
  onContextPanelChange: (panel: ContextPanel) => void;
  onManagementChange: (management: ManagementView) => void;
  onToggleMapPanel: () => void;
  onMapViewChange: (mapView: MapView) => void;
  onSpeedChange: (speed: Speed) => void;
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

const SPEED_CONTROLS: SpeedControlItem[] = [
  { value: 0, label: '暂停时间', icon: Pause },
  { value: 1, label: '正常速度', icon: Play },
  { value: 2, label: '加速时间', icon: ChevronsRight },
  { value: 4, label: '高速时间', icon: FastForward },
];

function formatTime(value: number) {
  const totalMinutes = Math.round(value * 60) % (24 * 60);
  const hours = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
  const minutes = (totalMinutes % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function GameplayHUD({
  contextPanel,
  dayTime,
  management,
  mapView,
  mapPanelOpen,
  speed,
  showControlTray,
  controlTrayEnterDelayMs = 0,
  onContextPanelChange,
  onManagementChange,
  onToggleMapPanel,
  onMapViewChange,
  onSpeedChange,
}: GameplayHUDProps) {
  const hover = useHoverOverlay();
  const trayPresence = usePresence(showControlTray, { enterDelayMs: controlTrayEnterDelayMs });
  return (
    <div className={`gameplay-top-shell ${trayPresence.mounted ? 'has-navigation' : ''}`}>
      <div className="gameplay-top-status">
        <div className="gameplay-top-status__world-state" aria-label="天气与时间">
          <span className="gameplay-top-status__weather-state">
            <CloudSun />
            <b>晴</b>
          </span>
          <span className="gameplay-top-status__clock">秋 · {formatTime(dayTime)}</span>
        </div>

        <div className="gameplay-top-status__resources" aria-label="城市核心指标快捷入口">
          {MANAGEMENT_STATUS_QUICK_ENTRIES.map((item) => {
            const Icon = item.icon;
            const tooltip = `${item.label} · 打开${item.targetLabel}`;
            return (
              <span key={item.label} className="gameplay-top-resource-slot">
                <button
                  type="button"
                  className="gameplay-top-resource-shortcut"
                  aria-label={`${item.label} ${item.value}，打开${item.targetLabel}`}
                  {...hover.bind(tooltipFromLabel(tooltip))}
                  onClick={() => onManagementChange(item.id)}
                >
                  <Icon />
                  <b>{item.value}</b>
                </button>
              </span>
            );
          })}
        </div>

        <div className="gameplay-top-status__time-controls" aria-label="时间控制">
          {SPEED_CONTROLS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              className={`gameplay-top-speed-button ${speed === value ? 'is-active' : ''}`}
              aria-label={label}
              {...hover.bind(tooltipFromLabel(label))}
              onClick={() => onSpeedChange(value)}
            >
              <Icon />
            </button>
          ))}
        </div>
      </div>

      {trayPresence.mounted && (
        <nav className={`gameplay-top-navigation motion-top-surface is-${trayPresence.phase}`} aria-label="城市控制" aria-busy={trayPresence.phase !== 'steady'}>
          <div className="gameplay-top-navigation__scene" aria-label="场景工具">
            <button
              type="button"
              className={`gameplay-top-navigation__button ${contextPanel === 'camera' ? 'is-active' : ''}`}
              aria-label="相机"
              {...hover.bind(tooltipFromLabel("相机"))}
              onClick={() => onContextPanelChange('camera')}
            >
              <Camera />
            </button>
            <button
              type="button"
              className={`gameplay-top-navigation__button ${contextPanel === 'weather' ? 'is-active' : ''}`}
              aria-label="环境控制"
              {...hover.bind(tooltipFromLabel("环境控制"))}
              onClick={() => onContextPanelChange('weather')}
            >
              <CloudSun />
            </button>
          </div>

          <i className="gameplay-top-navigation__separator" />

          <div className="gameplay-top-navigation__management" aria-label="城市管理">
            {MANAGEMENT_PRIMARY_NAV.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`gameplay-top-navigation__button ${management === item.id ? 'is-active' : ''}`}
                  aria-label={item.label}
                  {...hover.bind(tooltipFromLabel(item.label))}
                  onClick={() => onManagementChange(item.id)}
                >
                  <Icon />
                </button>
              );
            })}
          </div>

          <i className="gameplay-top-navigation__separator" />

          <div className="gameplay-top-navigation__view">
            <button
              type="button"
              className={`gameplay-top-navigation__button gameplay-top-navigation__map ${mapPanelOpen || mapView !== 'default' ? 'is-active' : ''}`}
              aria-label="信息视图"
              {...hover.bind(tooltipFromLabel("信息视图"))}
              onClick={onToggleMapPanel}
            >
              <Layers3 />
              {mapView !== 'default' && <i className="gameplay-top-navigation__dot" />}
            </button>
          </div>
        </nav>
      )}

      {trayPresence.mounted && mapPanelOpen && (
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
