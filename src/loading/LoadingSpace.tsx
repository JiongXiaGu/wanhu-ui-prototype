import { useEffect, useState } from 'react';
import { RefreshCw } from '../ui/icons/runtime-icons.generated';
import './loading-space.css';

interface LoadingSpaceProps {
  background: string;
  onComplete: () => void;
  durationMs?: number;
  staticProgress?: number;
}

const LOAD_KEYFRAMES: readonly [number, number][] = [
  [0, 0],
  [0.04, 4],
  [0.09, 8],
  [0.13, 8],
  [0.21, 20],
  [0.25, 20],
  [0.32, 34],
  [0.36, 34],
  [0.43, 46],
  [0.47, 46],
  [0.54, 58],
  [0.58, 58],
  [0.66, 70],
  [0.70, 70],
  [0.76, 80],
  [0.80, 80],
  [0.86, 90],
  [0.90, 90],
  [0.94, 97],
  [0.965, 97],
  [0.98, 100],
  [1, 100],
];

const LOAD_STAGES = [
  { max: 8, label: '正在准备世界数据…' },
  { max: 20, label: '正在读取地图配置…' },
  { max: 34, label: '正在构建地形…' },
  { max: 46, label: '正在生成河道与水系…' },
  { max: 58, label: '正在构建道路数据…' },
  { max: 70, label: '正在建立导航区域…' },
  { max: 80, label: '正在初始化城市系统…' },
  { max: 90, label: '正在准备居民与模拟…' },
  { max: 97, label: '正在加载场景资源…' },
  { max: 101, label: '正在进入城市…' },
];

const TIPS = [
  '城墙能够划定城市边界，但过早封闭城区也会限制后续扩张。',
  '桥梁连接两岸交通，繁忙渡口往往也是修建桥梁的好位置。',
  '居民会根据道路和目的地选择通行路线，拥堵会改变他们的选择。',
  '沿河区域适合发展水运，但洪水和地形也可能限制建设空间。',
  '建筑并不一定需要紧贴道路，合理安排院落可以形成更自然的街区。',
  '城市中的居民拥有自己的生活轨迹，他们的经历会随着时间继续发展。',
  '不同地形适合不同的城市形态，顺应地势通常比强行整平更加自然。',
  '道路层级越清晰，城市扩张后越容易维持稳定的交通组织。',
  '码头适合承担大宗货物运输，但周边道路仍需要留出足够的集散空间。',
  '第一人称视角可以帮助你从居民高度检查街巷、桥梁和建筑之间的尺度。',
];

function progressAt(ratio: number) {
  for (let index = 1; index < LOAD_KEYFRAMES.length; index += 1) {
    const [rightTime, rightValue] = LOAD_KEYFRAMES[index];
    if (ratio > rightTime) continue;
    const [leftTime, leftValue] = LOAD_KEYFRAMES[index - 1];
    const span = Math.max(0.0001, rightTime - leftTime);
    const local = Math.min(1, Math.max(0, (ratio - leftTime) / span));
    const eased = 1 - Math.pow(1 - local, 2);
    return leftValue + (rightValue - leftValue) * eased;
  }
  return 100;
}

function loadingStage(progress: number) {
  return LOAD_STAGES.find((stage) => progress < stage.max)?.label ?? LOAD_STAGES[LOAD_STAGES.length - 1].label;
}

export function LoadingSpace({ background, onComplete, durationMs = 15000, staticProgress }: LoadingSpaceProps) {
  const [progress, setProgress] = useState(staticProgress ?? 0);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    if (staticProgress !== undefined) {
      setProgress(staticProgress);
      return;
    }

    let frame = 0;
    let completionTimer = 0;
    const startedAt = performance.now();

    const tick = (now: number) => {
      const ratio = Math.min(1, (now - startedAt) / durationMs);
      setProgress(progressAt(ratio));

      if (ratio >= 1) {
        completionTimer = window.setTimeout(onComplete, 420);
        return;
      }

      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(completionTimer);
    };
  }, [durationMs, onComplete, staticProgress]);

  useEffect(() => {
    if (staticProgress !== undefined) return;
    const timer = window.setInterval(() => setTipIndex((current) => (current + 1) % TIPS.length), 6200);
    return () => window.clearInterval(timer);
  }, [staticProgress]);

  const boundedProgress = Math.min(100, Math.max(0, progress));
  const percent = Math.round(boundedProgress);
  const stage = loadingStage(boundedProgress);

  return (
    <section className="loading-space" aria-label="正在读取游戏" style={{ backgroundImage: `url(${background})` }}>
      <div className="loading-space__shade" aria-hidden="true" />

      <button
        type="button"
        className="loading-space__tip"
        aria-label="查看下一条游玩提示"
        onClick={() => setTipIndex((current) => (current + 1) % TIPS.length)}
      >
        <span key={tipIndex}>{TIPS[tipIndex]}</span>
        <RefreshCw size={13} aria-hidden="true" />
      </button>

      <div className="loading-space__progress-wrap">
        <div className="loading-space__status" aria-live="polite">
          <span>{stage}</span>
          <b>{percent}%</b>
        </div>
        <div className="loading-space__track" role="progressbar" aria-label="游戏读取进度" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
          <i style={{ width: `${boundedProgress}%` }} />
        </div>
      </div>
    </section>
  );
}
