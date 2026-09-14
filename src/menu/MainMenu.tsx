import { FolderOpen, LogOut, Play, Plus, Settings, X } from 'lucide-react';

const menuItems = [
  { key: 'continue', title: '继续游戏', meta: '昭平城 · 第十二年秋', detail: '继续最近一次昭平城存档。', icon: Play },
  { key: 'new', title: '新游戏', meta: '', detail: '创建新的游戏组和城市。', icon: Plus },
  { key: 'load', title: '载入游戏', meta: '', detail: '浏览游戏组与历史存档。', icon: FolderOpen },
  { key: 'settings', title: '设置', meta: '', detail: '调整游戏设置。', icon: Settings },
  { key: 'exit', title: '退出游戏', meta: '', detail: '关闭游戏并返回桌面。', icon: LogOut },
] as const;

export type MainMenuAction = typeof menuItems[number]['key'];

interface MainMenuProps {
  background: string;
  exitNotice: boolean;
  onAction: (action: MainMenuAction) => void;
  onCloseNotice: () => void;
}

export function MainMenu({ background, exitNotice, onAction, onCloseNotice }: MainMenuProps) {
  return (
    <section className="screen main-menu-screen" style={{ backgroundImage: `url(${background})` }}>
      <div className="main-menu-shade" />
      <div className="brand-block">
        <h1>万户天工</h1>
        <div className="brand-rule" />
        <p>泛中国古代城市营造模拟</p>
      </div>

      <nav className="main-menu-list" aria-label="主菜单">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button key={item.key} title={item.detail} className={`menu-row ${index === 0 ? 'is-primary' : ''}`} onClick={() => onAction(item.key)}>
              <span className="menu-icon"><Icon size={17} /></span>
              <span className="menu-copy"><b>{item.title}</b>{item.meta && <small>{item.meta}</small>}</span>
            </button>
          );
        })}
      </nav>

      {exitNotice && (
        <div className="toast">
          原型环境不会真正退出程序。
          <button onClick={onCloseNotice} aria-label="关闭提示"><X size={14} /></button>
        </div>
      )}
    </section>
  );
}
