/** Hover / Tooltip 只处理展示几何，不读取业务状态。坐标均为宿主逻辑像素。 */
export interface HoverRect { left: number; top: number; width: number; height: number }
export type HoverPlacement = 'right' | 'left' | 'bottom' | 'top';
export type HoverSurfaceKind = 'tooltip' | 'card';
export type HoverCardPlacementMode = 'anchor' | 'workspace-edge';

interface HoverPlacementInput {
  kind: HoverSurfaceKind;
  anchor: HoverRect;
  size: { width: number; height: number };
  bounds: { width: number; height: number };
  workspace?: HoverRect;
  placementMode?: HoverCardPlacementMode;
  avoid?: readonly HoverRect[];
  safeEdge?: number;
  gap?: number;
}

export interface HoverPlacementResult {
  left: number;
  top: number;
  placement: HoverPlacement;
  constrained: boolean;
}

function overlap(a: HoverRect, b: HoverRect) {
  return Math.max(0, Math.min(a.left + a.width, b.left + b.width) - Math.max(a.left, b.left))
    * Math.max(0, Math.min(a.top + a.height, b.top + b.height) - Math.max(a.top, b.top));
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(min, value), Math.max(min, max));

export function placeHoverSurface({
  kind,
  anchor,
  size,
  bounds,
  workspace,
  placementMode = 'anchor',
  avoid = [],
  safeEdge = 16,
  gap = kind === 'tooltip' ? 8 : 12,
}: HoverPlacementInput): HoverPlacementResult {
  const w = Math.min(size.width, Math.max(0, bounds.width - safeEdge * 2));
  const h = Math.min(size.height, Math.max(0, bounds.height - safeEdge * 2));
  const cx = anchor.left + anchor.width / 2;
  const cy = anchor.top + anchor.height / 2;
  const workspaceFrame = workspace ?? anchor;

  const tooltipCandidates: Array<{ placement: HoverPlacement; left: number; top: number }> = [
    { placement: 'top', left: cx - w / 2, top: anchor.top - gap - h },
    { placement: 'bottom', left: cx - w / 2, top: anchor.top + anchor.height + gap },
    { placement: 'right', left: anchor.left + anchor.width + gap, top: cy - h / 2 },
    { placement: 'left', left: anchor.left - gap - w, top: cy - h / 2 },
  ];

  const anchorCardCandidates: Array<{ placement: HoverPlacement; left: number; top: number }> = [
    { placement: 'right', left: anchor.left + anchor.width + gap, top: cy - h / 2 },
    { placement: 'left', left: anchor.left - gap - w, top: cy - h / 2 },
    { placement: 'top', left: cx - w / 2, top: anchor.top - gap - h },
    { placement: 'bottom', left: cx - w / 2, top: anchor.top + anchor.height + gap },
  ];

  const workspaceAnchorCandidates: Array<{ placement: HoverPlacement; left: number; top: number }> = [
    { placement: 'top', left: cx - w / 2, top: anchor.top - gap - h },
  ];

  const workspaceCardCandidates: Array<{ placement: HoverPlacement; left: number; top: number }> = [
    { placement: 'top', left: cx - w / 2, top: workspaceFrame.top - gap - h },
    { placement: 'left', left: workspaceFrame.left - gap - w, top: cy - h / 2 },
    { placement: 'right', left: workspaceFrame.left + workspaceFrame.width + gap, top: cy - h / 2 },
    { placement: 'bottom', left: cx - w / 2, top: workspaceFrame.top + workspaceFrame.height + gap },
  ];

  const cardCandidates = placementMode === 'workspace-edge' && workspace
    ? workspaceCardCandidates
    : workspace
      ? workspaceAnchorCandidates
      : anchorCardCandidates;

  const candidates = kind === 'tooltip' ? tooltipCandidates : cardCandidates;
  const blocked = kind === 'card' && placementMode === 'workspace-edge' && workspace
    ? [workspace, ...avoid]
    : avoid;

  const scored = candidates.map((candidate, index) => {
    const left = clamp(candidate.left, safeEdge, bounds.width - safeEdge - w);
    const top = clamp(candidate.top, safeEdge, bounds.height - safeEdge - h);
    const rect = { left, top, width: w, height: h };
    const blockedArea = blocked.reduce((sum, target) => sum + overlap(rect, target), 0);
    const anchorArea = overlap(rect, anchor);
    const displacement = Math.abs(left - candidate.left) + Math.abs(top - candidate.top);
    return { ...candidate, left, top, blockedArea, anchorArea, displacement, index };
  });

  scored.sort((a, b) => (
    a.anchorArea - b.anchorArea
    || a.blockedArea - b.blockedArea
    || a.displacement - b.displacement
    || a.index - b.index
  ));

  const best = scored[0];
  return {
    left: best.left,
    top: best.top,
    placement: best.placement,
    constrained: best.blockedArea > 0 || best.anchorArea > 0,
  };
}
