import { useRef, useState, type PointerEvent as ReactPointerEvent, type WheelEvent } from 'react';
import { Camera, Check, RotateCcw, X } from '../../ui/icons/runtime-icons.generated';

export interface BlueprintPreviewCapture {
  previewAsset: string;
  previewPosition: string;
  previewSize: string;
}

interface BlueprintPhotographyToolProps {
  sceneAsset: string;
  onCancel: () => void;
  onCapture: (capture: BlueprintPreviewCapture) => void;
}

const MIN_ZOOM = 135;
const MAX_ZOOM = 220;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function BlueprintPhotographyTool({ sceneAsset, onCancel, onCapture }: BlueprintPhotographyToolProps) {
  const [zoom, setZoom] = useState(150);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const dragRef = useRef<{ pointerId: number; x: number; y: number; offsetX: number; offsetY: number } | null>(null);

  const position = `${50 + offsetX}% ${50 + offsetY}%`;
  const size = `${zoom}% auto`;

  function reset() {
    setZoom(150);
    setOffsetX(0);
    setOffsetY(0);
  }

  function handleWheel(event: WheelEvent<HTMLDivElement>) {
    event.preventDefault();
    const direction = event.deltaY > 0 ? -1 : 1;
    setZoom((current) => clamp(current + direction * 5, MIN_ZOOM, MAX_ZOOM));
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    dragRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      offsetX,
      offsetY,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = (event.clientX - drag.x) / 18;
    const dy = (event.clientY - drag.y) / 18;
    setOffsetX(clamp(drag.offsetX + dx, -20, 20));
    setOffsetY(clamp(drag.offsetY + dy, -16, 16));
  }

  function endDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  return (
    <section
      className="blueprint-photography"
      aria-label="蓝图摄影模式"
      data-blueprint-photography="active"
      style={{ backgroundImage: `url(${sceneAsset})` }}
    >
      <div className="blueprint-photography__wash" aria-hidden="true" />

      <header className="blueprint-photography__header">
        <div>
          <Camera size={18} aria-hidden="true" />
          <span>
            <b>蓝图摄影</b>
            <small>调整构图，生成 4:3 蓝图预览图</small>
          </span>
        </div>
        <button type="button" className="blueprint-photography__icon-button" aria-label="取消蓝图摄影" onClick={onCancel}>
          <X size={17} />
        </button>
      </header>

      <div className="blueprint-photography__canvas">
        <div
          className="blueprint-photography__frame"
          role="img"
          aria-label="蓝图 4 比 3 预览取景框"
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <div
            className="blueprint-photography__scene"
            style={{
              backgroundImage: `url(${sceneAsset})`,
              backgroundPosition: position,
              backgroundSize: size,
            }}
          />
          <div className="blueprint-photography__grid" aria-hidden="true">
            <i /><i /><i /><i />
          </div>
          <span className="blueprint-photography__ratio">4:3</span>
        </div>
      </div>

      <footer className="blueprint-photography__footer">
        <div className="blueprint-photography__help">
          <span><kbd>拖动</kbd> 调整画面</span>
          <span><kbd>滚轮</kbd> 缩放</span>
          <span><kbd>Esc</kbd> 取消</span>
        </div>
        <div className="blueprint-photography__actions">
          <button type="button" onClick={reset}>
            <RotateCcw size={15} aria-hidden="true" />
            <span>恢复镜头</span>
          </button>
          <span className="blueprint-photography__zoom">{zoom}%</span>
          <button
            type="button"
            className="is-primary"
            onClick={() => onCapture({
              previewAsset: sceneAsset,
              previewPosition: position,
              previewSize: size,
            })}
          >
            <Check size={16} aria-hidden="true" />
            <span>完成摄影</span>
          </button>
        </div>
      </footer>
    </section>
  );
}
