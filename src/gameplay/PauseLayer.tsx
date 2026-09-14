interface PauseLayerProps {
  onResume: () => void;
  onMainMenu: () => void;
}

export function PauseLayer({ onResume, onMainMenu }: PauseLayerProps) {
  return (
    <div className="pause-layer">
      <div className="pause-shade" />
      <section className="pause-panel">
        <small>GAME PAUSED</small>
        <h2>暂停</h2>
        <button className="is-primary" onClick={onResume}>继续游戏</button>
        <button>保存游戏</button>
        <button>游戏设置</button>
        <button onClick={onMainMenu}>返回主菜单</button>
      </section>
    </div>
  );
}
