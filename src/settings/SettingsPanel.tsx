import { useState } from 'react';
import { Check, ChevronLeft, Monitor, SlidersHorizontal, Speaker, Gamepad2, Settings2 } from 'lucide-react';

export type SettingsContext = 'menu' | 'pause';

interface SettingsPanelProps {
  context: SettingsContext;
  onClose: () => void;
  onApply: () => void;
}

type Category = '显示' | '图形' | '音频' | '操作' | '游戏';

const categories: { key: Category; icon: typeof Monitor }[] = [
  { key: '显示', icon: Monitor },
  { key: '图形', icon: SlidersHorizontal },
  { key: '音频', icon: Speaker },
  { key: '操作', icon: Gamepad2 },
  { key: '游戏', icon: Settings2 },
];

const rows: Record<Category, { title: string; note: string; value: string }[]> = {
  显示: [
    { title: '显示模式', note: '当前窗口输出模式', value: '无边框全屏' },
    { title: '分辨率', note: '渲染输出尺寸', value: '1920 × 1080' },
    { title: '界面缩放', note: 'HUD 与面板整体缩放', value: '100%' },
    { title: '垂直同步', note: '与显示器刷新率同步', value: '开启' },
  ],
  图形: [
    { title: '图形质量', note: '控制阴影、反射与环境细节', value: '高' },
    { title: '阴影质量', note: '建筑与植被动态阴影', value: '高' },
    { title: '抗锯齿', note: '当前画面边缘平滑方式', value: 'TAA' },
    { title: '动态分辨率', note: '负载较高时稳定帧率', value: '关闭' },
  ],
  音频: [
    { title: '主音量', note: '所有声音的整体音量', value: '80%' },
    { title: '环境音量', note: '城市场景与自然环境', value: '75%' },
    { title: '界面音量', note: '按钮、提示与反馈音', value: '65%' },
    { title: '音乐音量', note: '背景音乐与事件音乐', value: '70%' },
  ],
  操作: [
    { title: '镜头灵敏度', note: '鼠标拖拽和旋转速度', value: '1.00' },
    { title: '边缘滚动', note: '鼠标靠近屏幕边缘时移动镜头', value: '开启' },
    { title: '反转旋转', note: '反转镜头旋转方向', value: '关闭' },
    { title: '快捷键方案', note: '当前键鼠映射方案', value: '默认' },
  ],
  游戏: [
    { title: '自动保存', note: '定期写入自动存档槽', value: '10 分钟' },
    { title: '操作提示', note: '显示当前工具的操作与快捷键', value: '开启' },
    { title: '确认危险操作', note: '拆除和覆盖存档前二次确认', value: '开启' },
    { title: '语言', note: '界面与文本语言', value: '简体中文' },
  ],
};

export function SettingsPanel({ context, onClose, onApply }: SettingsPanelProps) {
  const [active, setActive] = useState<Category>('显示');

  return (
    <section className={`settings-panel settings-panel--${context}`} aria-label="游戏设置">
      <header className="settings-panel__header">
        <div className="settings-panel__heading">
          <small>{context === 'pause' ? 'PAUSE SETTINGS' : 'OPTIONS'}</small>
          <div>
            <h2>{context === 'pause' ? '游戏设置' : '设置'}</h2>
            <span>{context === 'pause' ? '修改后返回暂停菜单' : '系统与游戏偏好'}</span>
          </div>
        </div>
        <button type="button" className="settings-panel__close" onClick={onClose} aria-label="返回">
          <ChevronLeft size={16} />
          <span>返回</span>
        </button>
      </header>

      <div className="settings-panel__layout">
        <nav className="settings-panel__categories" aria-label="设置分类">
          {categories.map(({ key, icon: Icon }) => (
            <button
              key={key}
              type="button"
              className={active === key ? 'is-active' : ''}
              onClick={() => setActive(key)}
            >
              <Icon size={15} />
              <span>{key}</span>
            </button>
          ))}
        </nav>

        <div className="settings-panel__body">
          <div className="settings-panel__section-heading">
            <div>
              <b>{active}</b>
              <span>{active === '显示' ? '显示与界面' : active === '图形' ? '画面质量' : active === '音频' ? '声音输出' : active === '操作' ? '键鼠与镜头' : '游戏行为'}</span>
            </div>
            <small>立即预览</small>
          </div>

          <div className="settings-panel__rows">
            {rows[active].map((row) => (
              <button key={row.title} type="button" className="settings-setting-row">
                <span className="settings-setting-row__copy">
                  <b>{row.title}</b>
                  <small>{row.note}</small>
                </span>
                <span className="settings-setting-row__value">{row.value}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <footer className="settings-panel__footer">
        <span>修改仅用于当前原型演示</span>
        <div>
          <button type="button" className="settings-panel__secondary" onClick={onClose}>取消</button>
          <button type="button" className="settings-panel__apply" onClick={onApply}><Check size={14} />应用</button>
        </div>
      </footer>
    </section>
  );
}
