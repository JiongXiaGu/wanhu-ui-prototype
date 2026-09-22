import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FocusEventHandler,
  type PointerEventHandler,
  type ReactNode,
} from 'react';
import { useDialogSystem } from '../dialog/DialogSystem';
import { placeHoverSurface, type HoverPlacement, type HoverRect, type HoverSurfaceKind } from './hover-placement';

export interface HoverFact {
  label: string;
  value: string;
  accent?: boolean;
}

interface HoverBaseDefinition {
  id?: string;
  openDelay?: number;
  ariaLabel?: string;
}

export interface TooltipDefinition extends HoverBaseDefinition {
  kind: 'tooltip';
  title: string;
  description?: string;
  shortcut?: string;
}

export interface HoverCardDefinition extends HoverBaseDefinition {
  kind: 'card';
  title: string;
  subtitle?: string;
  description?: string;
  facts?: readonly HoverFact[];
  mediaSrc?: string;
  mediaAlt?: string;
  preferOutsideWorkspace?: boolean;
}

export type HoverDefinition = TooltipDefinition | HoverCardDefinition;

interface HoverTarget {
  definition: HoverDefinition;
  anchor: HTMLElement;
}

export interface HoverTargetBindings {
  onPointerEnter: PointerEventHandler<HTMLElement>;
  onPointerLeave: PointerEventHandler<HTMLElement>;
  onFocus: FocusEventHandler<HTMLElement>;
  onBlur: FocusEventHandler<HTMLElement>;
}

interface HoverOverlayContextValue {
  target: HoverTarget | null;
  showPointer: (definition: HoverDefinition, anchor: HTMLElement) => void;
  hidePointer: (anchor: HTMLElement) => void;
  showFocus: (definition: HoverDefinition, anchor: HTMLElement) => void;
  hideFocus: (anchor: HTMLElement) => void;
  clear: () => void;
  bind: (definition: HoverDefinition) => HoverTargetBindings;
}

interface HoverPosition {
  left: number;
  top: number;
  placement: HoverPlacement;
  ready: boolean;
  constrained: boolean;
}

const HoverOverlayContext = createContext<HoverOverlayContextValue | null>(null);

const DEFAULT_TOOLTIP_DELAY = 320;
const DEFAULT_CARD_DELAY = 460;
const DEFAULT_CLOSE_DELAY = 90;
const HOVER_SURFACE_ID = 'ui-hover-surface';

function clearTimer(timer: { current: number | null }) {
  if (timer.current === null) return;
  window.clearTimeout(timer.current);
  timer.current = null;
}

function removeDescription(anchor: HTMLElement | null) {
  if (anchor?.getAttribute('aria-describedby') === HOVER_SURFACE_ID) {
    anchor.removeAttribute('aria-describedby');
  }
}

export function tooltipFromLabel(label: string, description?: string): TooltipDefinition {
  const [title, shortcut] = label.split(' · ', 2);
  return {
    kind: 'tooltip',
    title,
    description,
    shortcut: shortcut || undefined,
  };
}

export function HoverOverlayProvider({ children }: { children: ReactNode }) {
  const { dialog } = useDialogSystem();
  const [target, setTarget] = useState<HoverTarget | null>(null);
  const pointerTarget = useRef<HoverTarget | null>(null);
  const focusTarget = useRef<HoverTarget | null>(null);
  const visibleTarget = useRef<HoverTarget | null>(null);
  const openTimer = useRef<number | null>(null);
  const closeTimer = useRef<number | null>(null);

  const commit = useCallback((next: HoverTarget) => {
    clearTimer(openTimer);
    clearTimer(closeTimer);
    if (visibleTarget.current?.anchor !== next.anchor) removeDescription(visibleTarget.current?.anchor ?? null);
    visibleTarget.current = next;
    next.anchor.setAttribute('aria-describedby', HOVER_SURFACE_ID);
    setTarget(next);
  }, []);

  const clear = useCallback(() => {
    clearTimer(openTimer);
    clearTimer(closeTimer);
    removeDescription(visibleTarget.current?.anchor ?? null);
    pointerTarget.current = null;
    focusTarget.current = null;
    visibleTarget.current = null;
    setTarget(null);
  }, []);

  const scheduleOpen = useCallback((next: HoverTarget) => {
    clearTimer(openTimer);
    clearTimer(closeTimer);
    const delay = next.definition.openDelay
      ?? (next.definition.kind === 'tooltip' ? DEFAULT_TOOLTIP_DELAY : DEFAULT_CARD_DELAY);
    openTimer.current = window.setTimeout(() => {
      openTimer.current = null;
      const current = pointerTarget.current ?? focusTarget.current;
      if (!current || current.anchor !== next.anchor || !current.anchor.isConnected) return;
      commit(current);
    }, delay);
  }, [commit]);

  const scheduleClose = useCallback(() => {
    clearTimer(openTimer);
    clearTimer(closeTimer);
    closeTimer.current = window.setTimeout(() => {
      closeTimer.current = null;
      if (pointerTarget.current || focusTarget.current) return;
      removeDescription(visibleTarget.current?.anchor ?? null);
      visibleTarget.current = null;
      setTarget(null);
    }, DEFAULT_CLOSE_DELAY);
  }, []);

  const showPointer = useCallback((definition: HoverDefinition, anchor: HTMLElement) => {
    const next = { definition, anchor };
    pointerTarget.current = next;
    if (visibleTarget.current) {
      commit(next);
      return;
    }
    scheduleOpen(next);
  }, [commit, scheduleOpen]);

  const hidePointer = useCallback((anchor: HTMLElement) => {
    if (pointerTarget.current?.anchor === anchor) pointerTarget.current = null;
    if (focusTarget.current) {
      commit(focusTarget.current);
      return;
    }
    scheduleClose();
  }, [commit, scheduleClose]);

  const showFocus = useCallback((definition: HoverDefinition, anchor: HTMLElement) => {
    const next = { definition, anchor };
    focusTarget.current = next;
    commit(next);
  }, [commit]);

  const hideFocus = useCallback((anchor: HTMLElement) => {
    if (focusTarget.current?.anchor === anchor) focusTarget.current = null;
    if (pointerTarget.current) {
      commit(pointerTarget.current);
      return;
    }
    scheduleClose();
  }, [commit, scheduleClose]);

  const bind = useCallback((definition: HoverDefinition): HoverTargetBindings => ({
    onPointerEnter: (event) => {
      if (event.pointerType === 'touch') return;
      showPointer(definition, event.currentTarget);
    },
    onPointerLeave: (event) => hidePointer(event.currentTarget),
    onFocus: (event) => showFocus(definition, event.currentTarget),
    onBlur: (event) => hideFocus(event.currentTarget),
  }), [hideFocus, hidePointer, showFocus, showPointer]);

  useEffect(() => () => clear(), [clear]);
  useEffect(() => {
    if (dialog) clear();
  }, [clear, dialog]);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && visibleTarget.current) clear();
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [clear]);

  const value = useMemo<HoverOverlayContextValue>(() => ({
    target,
    showPointer,
    hidePointer,
    showFocus,
    hideFocus,
    clear,
    bind,
  }), [bind, clear, hideFocus, hidePointer, showFocus, showPointer, target]);

  return <HoverOverlayContext.Provider value={value}>{children}</HoverOverlayContext.Provider>;
}

export function useHoverOverlay() {
  const value = useContext(HoverOverlayContext);
  if (!value) throw new Error('useHoverOverlay must be used inside HoverOverlayProvider.');
  return value;
}

function toLogicalRect(element: HTMLElement, host: HTMLElement, hostRect: DOMRect, sx: number, sy: number): HoverRect {
  const rect = element.getBoundingClientRect();
  return {
    left: (rect.left - hostRect.left) / sx,
    top: (rect.top - hostRect.top) / sy,
    width: rect.width / sx,
    height: rect.height / sy,
  };
}

export function HoverOverlayHost() {
  const { target, clear } = useHoverOverlay();
  const hostRef = useRef<HTMLDivElement>(null);
  const surfaceRef = useRef<HTMLElement>(null);
  const [position, setPosition] = useState<HoverPosition>({
    left: 0,
    top: 0,
    placement: 'top',
    ready: false,
    constrained: false,
  });

  useLayoutEffect(() => {
    const host = hostRef.current;
    const surface = surfaceRef.current;
    const anchor = target?.anchor;
    const definition = target?.definition;
    if (!host || !surface || !anchor || !definition) {
      setPosition((current) => current.ready ? { ...current, ready: false } : current);
      return;
    }

    let frame = 0;
    const workspace = definition.kind === 'card' && definition.preferOutsideWorkspace !== false
      ? anchor.closest<HTMLElement>('.workspace--catalog')
      : null;

    function reposition() {
      frame = 0;
      if (!anchor.isConnected || anchor.getClientRects().length === 0) {
        clear();
        return;
      }

      const hostRect = host.getBoundingClientRect();
      const sx = hostRect.width / Math.max(1, host.clientWidth);
      const sy = hostRect.height / Math.max(1, host.clientHeight);
      if (sx <= 0 || sy <= 0) return;

      const bounds = { width: host.clientWidth, height: host.clientHeight };
      const root = host.closest<HTMLElement>('.game-canvas') ?? host;
      const avoid = definition.kind === 'card'
        ? [...root.querySelectorAll<HTMLElement>(
          '.gameplay-top-shell, .gameplay-left-context-surface, .command-bar, .tool-bottom-cluster, .context-utility-toolbar, .gameplay-operation-hints',
        )]
          .filter((element) => element !== anchor && element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden')
          .map((element) => toLogicalRect(element, host, hostRect, sx, sy))
        : [];

      const next = placeHoverSurface({
        kind: definition.kind,
        anchor: toLogicalRect(anchor, host, hostRect, sx, sy),
        workspace: workspace ? toLogicalRect(workspace, host, hostRect, sx, sy) : undefined,
        size: { width: surface.offsetWidth, height: surface.offsetHeight },
        bounds,
        avoid,
      });

      setPosition((current) => {
        const updated = { ...next, ready: true };
        return current.ready
          && current.left === updated.left
          && current.top === updated.top
          && current.placement === updated.placement
          && current.constrained === updated.constrained
          ? current
          : updated;
      });
    }

    function schedulePosition() {
      if (!frame) frame = window.requestAnimationFrame(reposition);
    }

    reposition();
    const resize = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(schedulePosition) : null;
    resize?.observe(surface);
    resize?.observe(anchor);
    resize?.observe(host);
    if (workspace) resize?.observe(workspace);

    window.addEventListener('resize', schedulePosition);
    window.addEventListener('scroll', schedulePosition, true);
    workspace?.addEventListener('transitionend', schedulePosition);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      resize?.disconnect();
      window.removeEventListener('resize', schedulePosition);
      window.removeEventListener('scroll', schedulePosition, true);
      workspace?.removeEventListener('transitionend', schedulePosition);
    };
  }, [clear, target]);

  const definition = target?.definition;
  const style: CSSProperties = {
    left: position.left,
    top: position.top,
    visibility: position.ready ? 'visible' : 'hidden',
  };

  return (
    <div ref={hostRef} className="ui-hover-overlay-host" data-ui-layer="hover">
      {definition && (
        <section
          ref={surfaceRef}
          id={HOVER_SURFACE_ID}
          className={`ui-hover-surface ${definition.kind === 'tooltip' ? 'ui-tooltip-surface' : 'ui-hover-card'}`}
          role="tooltip"
          aria-label={definition.ariaLabel ?? definition.title}
          data-hover-kind={definition.kind}
          data-placement={position.placement}
          data-ready={position.ready}
          data-constrained={position.constrained}
          style={style}
        >
          {definition.kind === 'tooltip'
            ? <TooltipContent definition={definition} />
            : <HoverCardContent definition={definition} />}
        </section>
      )}
    </div>
  );
}

function TooltipContent({ definition }: { definition: TooltipDefinition }) {
  return (
    <div className="ui-tooltip__content">
      <div className="ui-tooltip__main">
        <strong>{definition.title}</strong>
        {definition.description && <span>{definition.description}</span>}
      </div>
      {definition.shortcut && <kbd className="ui-tooltip__shortcut">{definition.shortcut}</kbd>}
    </div>
  );
}

function HoverCardContent({ definition }: { definition: HoverCardDefinition }) {
  return (
    <>
      <i className="ui-hover-card__occlusion" aria-hidden="true" />
      <i className="ui-hover-card__highlight" aria-hidden="true" />
      <div className="ui-hover-card__content">
        {definition.mediaSrc && (
          <img
            className="ui-hover-card__media"
            src={definition.mediaSrc}
            alt={definition.mediaAlt ?? ''}
          />
        )}
        <header className="ui-hover-card__header">
          <h3>{definition.title}</h3>
          {definition.subtitle && <span>{definition.subtitle}</span>}
        </header>
        {definition.facts && definition.facts.length > 0 && (
          <>
            <i className="ui-hover-card__divider" aria-hidden="true" />
            <dl className="ui-hover-card__facts">
              {definition.facts.map((fact) => (
                <div className="ui-hover-card__fact" key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd className={fact.accent ? 'is-accent' : ''}>{fact.value}</dd>
                </div>
              ))}
            </dl>
          </>
        )}
        {definition.description && (
          <>
            <i className="ui-hover-card__divider" aria-hidden="true" />
            <p className="ui-hover-card__description">{definition.description}</p>
          </>
        )}
      </div>
    </>
  );
}
