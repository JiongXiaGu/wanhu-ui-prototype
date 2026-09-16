import { createPortal } from 'react-dom';
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

interface AssetInspectorOptions {
  openDelay?: number;
  closeDelay?: number;
}

interface InspectorTarget<T> {
  item: T;
  anchor: HTMLElement;
}

export interface AssetInspectorController<T> {
  item: T | null;
  anchor: HTMLElement | null;
  showPointer: (item: T, anchor: HTMLElement) => void;
  hidePointer: (anchor: HTMLElement) => void;
  showFocus: (item: T, anchor: HTMLElement) => void;
  hideFocus: (anchor: HTMLElement) => void;
  clear: () => void;
}

interface AssetInspectorPopoverProps {
  id?: string;
  open: boolean;
  anchor: HTMLElement | null;
  ariaLabel?: string;
  className?: string;
  safeEdge?: number;
  anchorGap?: number;
  children: ReactNode;
}

interface InspectorPosition {
  left: number;
  top: number;
  placement: 'right' | 'left' | 'bottom' | 'top';
  ready: boolean;
  mode: 'absolute' | 'fixed';
}

const DEFAULT_OPEN_DELAY = 280;
const DEFAULT_CLOSE_DELAY = 90;
const DEFAULT_SAFE_EDGE = 16;
const DEFAULT_ANCHOR_GAP = 12;

function clearTimer(timer: { current: number | null }) {
  if (timer.current === null) return;
  window.clearTimeout(timer.current);
  timer.current = null;
}

export function useAssetInspector<T>({
  openDelay = DEFAULT_OPEN_DELAY,
  closeDelay = DEFAULT_CLOSE_DELAY,
}: AssetInspectorOptions = {}): AssetInspectorController<T> {
  const [item, setItem] = useState<T | null>(null);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const pointerTarget = useRef<InspectorTarget<T> | null>(null);
  const focusTarget = useRef<InspectorTarget<T> | null>(null);
  const visibleItem = useRef<T | null>(null);
  const openTimer = useRef<number | null>(null);
  const closeTimer = useRef<number | null>(null);

  useEffect(() => () => {
    clearTimer(openTimer);
    clearTimer(closeTimer);
  }, []);

  function commit(target: InspectorTarget<T>) {
    clearTimer(openTimer);
    clearTimer(closeTimer);
    visibleItem.current = target.item;
    setItem(target.item);
    setAnchor(target.anchor);
  }

  function scheduleOpen(target: InspectorTarget<T>) {
    clearTimer(openTimer);
    clearTimer(closeTimer);
    openTimer.current = window.setTimeout(() => {
      openTimer.current = null;
      const current = pointerTarget.current ?? focusTarget.current;
      if (!current || current.anchor !== target.anchor) return;
      commit(current);
    }, openDelay);
  }

  function scheduleClose() {
    clearTimer(openTimer);
    clearTimer(closeTimer);
    closeTimer.current = window.setTimeout(() => {
      closeTimer.current = null;
      if (pointerTarget.current || focusTarget.current) return;
      visibleItem.current = null;
      setItem(null);
      setAnchor(null);
    }, closeDelay);
  }

  function showPointer(nextItem: T, nextAnchor: HTMLElement) {
    pointerTarget.current = { item: nextItem, anchor: nextAnchor };
    if (visibleItem.current !== null) {
      commit(pointerTarget.current);
      return;
    }
    scheduleOpen(pointerTarget.current);
  }

  function hidePointer(leavingAnchor: HTMLElement) {
    if (pointerTarget.current?.anchor === leavingAnchor) pointerTarget.current = null;
    if (focusTarget.current) {
      commit(focusTarget.current);
      return;
    }
    scheduleClose();
  }

  function showFocus(nextItem: T, nextAnchor: HTMLElement) {
    focusTarget.current = { item: nextItem, anchor: nextAnchor };
    commit(focusTarget.current);
  }

  function hideFocus(leavingAnchor: HTMLElement) {
    if (focusTarget.current?.anchor === leavingAnchor) focusTarget.current = null;
    if (pointerTarget.current) {
      commit(pointerTarget.current);
      return;
    }
    scheduleClose();
  }

  function clear() {
    clearTimer(openTimer);
    clearTimer(closeTimer);
    pointerTarget.current = null;
    focusTarget.current = null;
    visibleItem.current = null;
    setItem(null);
    setAnchor(null);
  }

  return { item, anchor, showPointer, hidePointer, showFocus, hideFocus, clear };
}

function overflowScore(left: number, top: number, width: number, height: number, boundsWidth: number, boundsHeight: number, safeEdge: number) {
  const overflowLeft = Math.max(0, safeEdge - left);
  const overflowTop = Math.max(0, safeEdge - top);
  const overflowRight = Math.max(0, left + width - (boundsWidth - safeEdge));
  const overflowBottom = Math.max(0, top + height - (boundsHeight - safeEdge));
  return overflowLeft + overflowTop + overflowRight + overflowBottom;
}

export function AssetInspectorPopover({
  id,
  open,
  anchor,
  ariaLabel,
  className = '',
  safeEdge = DEFAULT_SAFE_EDGE,
  anchorGap = DEFAULT_ANCHOR_GAP,
  children,
}: AssetInspectorPopoverProps) {
  const inspectorRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<InspectorPosition>({
    left: 0,
    top: 0,
    placement: 'right',
    ready: false,
    mode: 'absolute',
  });

  const gameplayHost = anchor?.closest('.gameplay-screen') as HTMLElement | null;
  const portalHost = gameplayHost ?? (typeof document !== 'undefined' ? document.body : null);

  useLayoutEffect(() => {
    if (!open || !anchor || !portalHost || !inspectorRef.current) {
      setPosition((current) => current.ready ? { ...current, ready: false } : current);
      return;
    }

    const inspector = inspectorRef.current;

    function reposition() {
      const anchorRect = anchor.getBoundingClientRect();
      const width = inspector.offsetWidth;
      const height = inspector.offsetHeight;
      const usesGameplayHost = portalHost !== document.body;

      let boundsWidth = window.innerWidth;
      let boundsHeight = window.innerHeight;
      let anchorLeft = anchorRect.left;
      let anchorTop = anchorRect.top;
      let anchorRight = anchorRect.right;
      let anchorBottom = anchorRect.bottom;
      let anchorWidth = anchorRect.width;
      let anchorHeight = anchorRect.height;
      let mode: InspectorPosition['mode'] = 'fixed';

      if (usesGameplayHost) {
        const hostRect = portalHost.getBoundingClientRect();
        const scaleX = hostRect.width / Math.max(1, portalHost.clientWidth);
        const scaleY = hostRect.height / Math.max(1, portalHost.clientHeight);
        boundsWidth = portalHost.clientWidth;
        boundsHeight = portalHost.clientHeight;
        anchorLeft = (anchorRect.left - hostRect.left) / scaleX;
        anchorTop = (anchorRect.top - hostRect.top) / scaleY;
        anchorRight = (anchorRect.right - hostRect.left) / scaleX;
        anchorBottom = (anchorRect.bottom - hostRect.top) / scaleY;
        anchorWidth = anchorRect.width / scaleX;
        anchorHeight = anchorRect.height / scaleY;
        mode = 'absolute';
      }

      const centerX = anchorLeft + anchorWidth / 2;
      const centerY = anchorTop + anchorHeight / 2;
      const candidates: Array<Omit<InspectorPosition, 'ready' | 'mode'>> = [
        { placement: 'right', left: anchorRight + anchorGap, top: centerY - height / 2 },
        { placement: 'left', left: anchorLeft - anchorGap - width, top: centerY - height / 2 },
        { placement: 'bottom', left: centerX - width / 2, top: anchorBottom + anchorGap },
        { placement: 'top', left: centerX - width / 2, top: anchorTop - anchorGap - height },
      ];

      const best = candidates
        .map((candidate) => ({
          ...candidate,
          score: overflowScore(candidate.left, candidate.top, width, height, boundsWidth, boundsHeight, safeEdge),
        }))
        .sort((a, b) => a.score - b.score)[0];

      const maxLeft = Math.max(safeEdge, boundsWidth - safeEdge - width);
      const maxTop = Math.max(safeEdge, boundsHeight - safeEdge - height);
      setPosition({
        left: Math.min(maxLeft, Math.max(safeEdge, best.left)),
        top: Math.min(maxTop, Math.max(safeEdge, best.top)),
        placement: best.placement,
        ready: true,
        mode,
      });
    }

    reposition();
    const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(reposition) : null;
    resizeObserver?.observe(inspector);
    window.addEventListener('resize', reposition);
    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', reposition);
    };
  }, [anchor, anchorGap, open, portalHost, safeEdge]);

  if (!open || !anchor || !portalHost) return null;

  const style: CSSProperties = {
    position: position.mode,
    left: position.left,
    top: position.top,
    visibility: position.ready ? 'visible' : 'hidden',
  };

  return createPortal(
    <aside
      ref={inspectorRef}
      id={id}
      className={`asset-inspector-popover ${className}`.trim()}
      role="tooltip"
      aria-label={ariaLabel}
      data-placement={position.placement}
      data-ready={position.ready}
      style={style}
    >
      {children}
    </aside>,
    portalHost,
  );
}
