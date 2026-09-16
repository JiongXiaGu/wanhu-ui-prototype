import { Compass, Menu } from 'lucide-react';

interface NavigationHudProps {
  background: string;
}

interface SystemMenuButtonProps {
  onClick: () => void;
}

export function GameplayNavigationHud({ background }: NavigationHudProps) {
  return (
    <aside className="gameplay-navigation-hud" aria-label="城市导航">
      <div className="gameplay-navigation-hud__map" style={{ backgroundImage: `url(${background})` }}>
        <div className="gameplay-navigation-hud__veil" />
        <span className="gameplay-navigation-hud__north" aria-hidden="true">
          <Compass />
          <b>北</b>
        </span>
        <i className="gameplay-navigation-hud__crosshair" aria-hidden="true" />
      </div>
    </aside>
  );
}

export function GameplaySystemMenuButton({ onClick }: SystemMenuButtonProps) {
  return (
    <button
      type="button"
      className="gameplay-system-menu-button"
      aria-label="菜单"
      data-tooltip="菜单"
      onClick={onClick}
    >
      <Menu />
    </button>
  );
}
