import { ToolActionBar, type ToolModeGroup, type ToolModeItem } from '../ToolActionBar';
export type PlacementModeItem = ToolModeItem;
export type PlacementModeGroup = ToolModeGroup;
interface PlacementActionBarProps {
  ariaLabel: string;
  modeGroups: PlacementModeGroup[];
  confirmLabel?: string;
  confirmShortLabel?: string;
  cancelLabel?: string;
  cancelShortLabel?: string;
  completeKind?: 'commit' | 'exit';
  showCancel?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}
export function PlacementActionBar({
  ariaLabel,
  modeGroups,
  confirmLabel = '完成放置',
  confirmShortLabel = '完成',
  cancelLabel = '取消放置',
  cancelShortLabel = '取消',
  completeKind = 'commit',
  showCancel = true,
  onConfirm,
  onCancel,
}: PlacementActionBarProps) {
  const labeledModeGroups = modeGroups.map((group) => ({ ...group, presentation: 'icon-label' as const }));
  return (
    <ToolActionBar
      ariaLabel={ariaLabel}
      className="placement-main-action-bar placement-action-bar--placement"
      modeGroups={labeledModeGroups}
      completeLabel={confirmLabel}
      completeShortLabel={confirmShortLabel}
      completeKind={completeKind}
      cancelLabel={cancelLabel}
      cancelShortLabel={cancelShortLabel}
      commitGroupLabel="放置任务"
      showCancel={showCancel}
      onComplete={onConfirm}
      onCancel={onCancel}
    />
  );
}
