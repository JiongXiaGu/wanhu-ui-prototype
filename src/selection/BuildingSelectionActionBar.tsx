import { Move, Palette, X } from '../ui/icons/runtime-icons.generated';
import type { MotionPhase } from '../ui/motion';
import { ToolActionBar, type ToolQuickAction } from '../tools/ToolActionBar';

interface Props {
  motionPhase?: MotionPhase;
  schemeOpen: boolean;
  onMove: () => void;
  onToggleScheme: () => void;
  onClose: () => void;
}

export function BuildingSelectionActionBar({ motionPhase = 'steady', schemeOpen, onMove, onToggleScheme, onClose }: Props) {
  const quickActions: ToolQuickAction[] = [
    { id: 'move', label: '移动建筑', shortLabel: '移动', icon: Move, onClick: onMove },
    { id: 'scheme', label: '配色', shortLabel: '配色', icon: Palette, active: schemeOpen, pressed: schemeOpen, onClick: onToggleScheme },
  ];

  return (
    <div className={'building-selection-action-cluster motion-bottom-surface is-' + motionPhase} aria-label="选中建筑操作">
      <ToolActionBar
        ariaLabel="选中建筑操作"
        className="building-selection-action-bar building-selection-secondary-action-bar"
        modeGroups={[]}
        quickActions={quickActions}
        quickActionPresentation="icon-label"
        completeLabel="关闭建筑选择"
        completeShortLabel="关闭"
        completeKind="exit"
        completeIcon={X}
        commitGroupLabel="建筑选择"
        onComplete={onClose}
      />
    </div>
  );
}
