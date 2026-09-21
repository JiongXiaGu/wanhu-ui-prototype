import { createPortal } from 'react-dom';
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { placeInspector, type InspectorPlacement, type InspectorRect } from './inspector-placement';

interface AssetInspectorOptions { openDelay?: number; closeDelay?: number }
interface InspectorTarget<T> { item: T; anchor: HTMLElement }
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
  id?: string; open: boolean; anchor: HTMLElement | null; ariaLabel?: string; className?: string;
  safeEdge?: number; anchorGap?: number; children: ReactNode;
}
interface InspectorPosition {
  left: number; top: number; placement: InspectorPlacement; ready: boolean;
  mode: 'absolute' | 'fixed'; constrained: boolean;
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

export function useAssetInspector<T>({ openDelay = DEFAULT_OPEN_DELAY, closeDelay = DEFAULT_CLOSE_DELAY }: AssetInspectorOptions = {}): AssetInspectorController<T> {
  const [item, setItem] = useState<T | null>(null);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const pointerTarget = useRef<InspectorTarget<T> | null>(null);
  const focusTarget = useRef<InspectorTarget<T> | null>(null);
  const visibleItem = useRef<T | null>(null);
  const openTimer = useRef<number | null>(null);
  const closeTimer = useRef<number | null>(null);
  useEffect(() => () => { clearTimer(openTimer); clearTimer(closeTimer); }, []);

  function commit(target: InspectorTarget<T>) {
    clearTimer(openTimer); clearTimer(closeTimer);
    visibleItem.current = target.item; setItem(target.item); setAnchor(target.anchor);
  }
  function scheduleOpen(target: InspectorTarget<T>) {
    clearTimer(openTimer); clearTimer(closeTimer);
    openTimer.current = window.setTimeout(() => {
      openTimer.current = null;
      const current = pointerTarget.current ?? focusTarget.current;
      if (!current || current.anchor !== target.anchor || !current.anchor.isConnected) return;
      commit(current);
    }, openDelay);
  }
  function scheduleClose() {
    clearTimer(openTimer); clearTimer(closeTimer);
    closeTimer.current = window.setTimeout(() => {
      closeTimer.current = null;
      if (pointerTarget.current || focusTarget.current) return;
      visibleItem.current = null; setItem(null); setAnchor(null);
    }, closeDelay);
  }
  function showPointer(nextItem: T, nextAnchor: HTMLElement) {
    pointerTarget.current = { item: nextItem, anchor: nextAnchor };
    if (visibleItem.current !== null) { commit(pointerTarget.current); return; }
    scheduleOpen(pointerTarget.current);
  }
  function hidePointer(leavingAnchor: HTMLElement) {
    if (pointerTarget.current?.anchor === leavingAnchor) pointerTarget.current = null;
    if (focusTarget.current) { commit(focusTarget.current); return; }
    scheduleClose();
  }
  function showFocus(nextItem: T, nextAnchor: HTMLElement) {
    focusTarget.current = { item: nextItem, anchor: nextAnchor }; commit(focusTarget.current);
  }
  function hideFocus(leavingAnchor: HTMLElement) {
    if (focusTarget.current?.anchor === leavingAnchor) focusTarget.current = null;
    if (pointerTarget.current) { commit(pointerTarget.current); return; }
    scheduleClose();
  }
  function clear() {
    clearTimer(openTimer); clearTimer(closeTimer);
    pointerTarget.current = null; focusTarget.current = null; visibleItem.current = null;
    setItem(null); setAnchor(null);
  }
  return { item, anchor, showPointer, hidePointer, showFocus, hideFocus, clear };
}

export function AssetInspectorPopover({ id, open, anchor, ariaLabel, className = '', safeEdge = DEFAULT_SAFE_EDGE, anchorGap = DEFAULT_ANCHOR_GAP, children }: AssetInspectorPopoverProps) {
  const inspectorRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<InspectorPosition>({ left: 0, top: 0, placement: 'top', ready: false, mode: 'absolute', constrained: false });
  const gameplayHost = anchor?.closest('.gameplay-screen') as HTMLElement | null;
  const portalHost = gameplayHost ?? (typeof document !== 'undefined' ? document.body : null);

  useLayoutEffect(() => {
    if (!open || !anchor || !portalHost || !inspectorRef.current) {
      setPosition(current => current.ready ? { ...current, ready: false } : current);
      return;
    }
    const activeAnchor = anchor;
    const activeHost = portalHost;
    const inspector = inspectorRef.current;
    // 这是展示几何查询，不从 DOM 推断选中、ToolOrigin 或其他业务状态。
    const workspace = activeAnchor.closest<HTMLElement>('.workspace--catalog');
    const usesGameplayHost = activeHost !== document.body;
    let frame = 0;

    function reposition() {
      frame = 0;
      if (!activeAnchor.isConnected || activeAnchor.getClientRects().length === 0) {
        setPosition(current => current.ready ? { ...current, ready: false } : current);
        return;
      }
      const hostRect = activeHost.getBoundingClientRect();
      const sx = usesGameplayHost ? hostRect.width / Math.max(1, activeHost.clientWidth) : 1;
      const sy = usesGameplayHost ? hostRect.height / Math.max(1, activeHost.clientHeight) : 1;
      if (sx <= 0 || sy <= 0) return;
      const toLogical = (element: HTMLElement): InspectorRect => {
        const rect = element.getBoundingClientRect();
        return { left: (rect.left - (usesGameplayHost ? hostRect.left : 0)) / sx, top: (rect.top - (usesGameplayHost ? hostRect.top : 0)) / sy, width: rect.width / sx, height: rect.height / sy };
      };
      const bounds = { width: usesGameplayHost ? activeHost.clientWidth : window.innerWidth, height: usesGameplayHost ? activeHost.clientHeight : window.innerHeight };
      // 将 HUD / 左侧工具视为保护区域，目录整体作为首要避让边界。
      const avoid = usesGameplayHost ? [...activeHost.querySelectorAll<HTMLElement>('.gameplay-top-shell, .gameplay-left-context-surface, .command-bar, .tool-bottom-cluster, .context-utility-toolbar')]
        .filter(element => element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden')
        .map(toLogical) : [];
      const next = placeInspector({ anchor: toLogical(activeAnchor), workspace: workspace ? toLogical(workspace) : undefined, size: { width: inspector.offsetWidth, height: inspector.offsetHeight }, bounds, avoid, safeEdge, gap: anchorGap });
      setPosition(current => {
        const updated: InspectorPosition = { ...next, ready: true, mode: usesGameplayHost ? 'absolute' : 'fixed' };
        return current.ready && current.left === updated.left && current.top === updated.top && current.placement === updated.placement && current.constrained === updated.constrained && current.mode === updated.mode ? current : updated;
      });
    }
    function schedulePosition() {
      if (!frame) frame = window.requestAnimationFrame(reposition);
    }
    reposition();
    const resize = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(schedulePosition) : null;
    resize?.observe(inspector); resize?.observe(activeAnchor); resize?.observe(activeHost);
    if (workspace) resize?.observe(workspace);
    // 仅展示层生命周期：翻页卸载目标后隐藏旧浮层，不保留悬空引用。
    const mutation = workspace ? new MutationObserver(schedulePosition) : null;
    if (workspace) mutation?.observe(workspace, { childList: true, subtree: true });
    window.addEventListener('resize', schedulePosition);
    window.addEventListener('scroll', schedulePosition, true);
    workspace?.addEventListener('transitionend', schedulePosition);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      resize?.disconnect(); mutation?.disconnect();
      window.removeEventListener('resize', schedulePosition);
      window.removeEventListener('scroll', schedulePosition, true);
      workspace?.removeEventListener('transitionend', schedulePosition);
    };
  }, [anchor, anchorGap, open, portalHost, safeEdge, children]);

  if (!open || !anchor || !portalHost) return null;
  const style: CSSProperties = { position: position.mode, left: position.left, top: position.top, visibility: position.ready ? 'visible' : 'hidden' };
  return createPortal(
    <aside ref={inspectorRef} id={id} className={`asset-inspector-popover ${className}`.trim()} role="tooltip" aria-label={ariaLabel} data-placement={position.placement} data-ready={position.ready} data-constrained={position.constrained} style={style}>
      {children}
    </aside>, portalHost,
  );
}
