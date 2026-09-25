import type { CSSProperties } from 'react';
import { Menu } from '../ui/icons/runtime-icons.generated';
import { tooltipFromLabel, useHoverOverlay } from '../ui/hover/HoverOverlay';

interface CompassHudProps {
  headingDegrees?: number;
  buildMode?: boolean;
}

interface SystemMenuButtonProps {
  onClick: () => void;
}

export function GameplayCompassHud({ headingDegrees = 0, buildMode = false }: CompassHudProps) {
  const style = { '--compass-heading': `${headingDegrees}deg` } as CSSProperties;

  return (
    <aside
      className={`gameplay-compass-hud ${buildMode ? 'is-build-mode' : ''}`}
      aria-label="指南针，显示东南西北方向"
      style={style}
    >
      <div className="gameplay-compass-hud__dial" aria-hidden="true">
        <div className="gameplay-compass-hud__rose">
          <span className="gameplay-compass-hud__ticks" aria-hidden="true">
            {Array.from({ length: 16 }, (_, index) => (
              <i
                className={`gameplay-compass-hud__tick ${index % 4 === 0 ? 'is-major' : ''}`}
                key={index}
                style={{ '--compass-tick-angle': `${index * 22.5}deg` } as CSSProperties}
              />
            ))}
          </span>
          <i className="gameplay-compass-hud__axis gameplay-compass-hud__axis--vertical" />
          <i className="gameplay-compass-hud__axis gameplay-compass-hud__axis--horizontal" />

          <span className="gameplay-compass-hud__cardinal gameplay-compass-hud__cardinal--north"><b>北</b></span>
          <span className="gameplay-compass-hud__cardinal gameplay-compass-hud__cardinal--east"><b>东</b></span>
          <span className="gameplay-compass-hud__cardinal gameplay-compass-hud__cardinal--south"><b>南</b></span>
          <span className="gameplay-compass-hud__cardinal gameplay-compass-hud__cardinal--west"><b>西</b></span>

          <i className="gameplay-compass-hud__needle">
            <span className="gameplay-compass-hud__needle-north" />
            <span className="gameplay-compass-hud__needle-south" />
          </i>
          <i className="gameplay-compass-hud__hub" />
        </div>
      </div>
    </aside>
  );
}

export function GameplaySystemMenuButton({ onClick }: SystemMenuButtonProps) {
  const hover = useHoverOverlay();
  return (
    <button
      type="button"
      className="gameplay-system-menu-button"
      aria-label="菜单"
      {...hover.bind(tooltipFromLabel('菜单'))}
      onClick={onClick}
    >
      <Menu />
    </button>
  );
}
