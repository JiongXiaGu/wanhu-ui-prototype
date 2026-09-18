import { ToolActionBar, type ToolModeGroup, type ToolModeItem, type ToolQuickAction } from '../ToolActionBar';

export type PlacementModeItem = ToolModeItem;
export type PlacementModeGroup = ToolModeGroup;
export type PlacementQuickAction = ToolQuickAction;

interface PlacementActionBarProps {
  ariaLabel: string;
  modeGroups: PlacementModeGroup[];
  quickActions?: PlacementQuickAction[];
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function PlacementActionBar({
  ariaLabel,
  modeGroups,
  quickActions = [],
  confirmLabel = '完成',
  cancelLabel = '取消',
  onConfirm,
  onCancel,
}: PlacementActionBarProps) {
  return (
    <ToolActionBar
      ariaLabel={ariaLabel}
      modeGroups={modeGroups}
      quickActions={quickActions}
      completeLabel={confirmLabel}
      cancelLabel={cancelLabel}
      commitGroupLabel="放置任务"
      showCancel
      onComplete={onConfirm}
      onCancel={onCancel}
    />
  );
}
