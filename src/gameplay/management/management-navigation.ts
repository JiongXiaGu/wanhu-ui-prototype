import type { LucideIcon } from '../../ui/icons/runtime-icons.generated';
import { Building2, Coins, ScrollText, Shield, Users, Warehouse } from '../../ui/icons/runtime-icons.generated';
import type { ManagementView } from '../../app/ui-state';

export interface ManagementPrimaryNavItem {
  id: Exclude<ManagementView, 'none'>;
  label: string;
  icon: LucideIcon;
}

export interface ManagementStatusQuickEntry {
  id: Exclude<ManagementView, 'none'>;
  label: string;
  targetLabel: string;
  value: string;
  icon: LucideIcon;
}

export const MANAGEMENT_PRIMARY_NAV: ManagementPrimaryNavItem[] = [
  { id: 'city', label: '城市', icon: Building2 },
  { id: 'finance', label: '经济', icon: Coins },
  { id: 'inventory', label: '库存', icon: Warehouse },
  { id: 'policy', label: '政策', icon: ScrollText },
  { id: 'military', label: '军事', icon: Shield },
];

export const MANAGEMENT_STATUS_QUICK_ENTRIES: ManagementStatusQuickEntry[] = [
  { id: 'city', label: '人口', targetLabel: '城市', value: '8,426', icon: Users },
  { id: 'finance', label: '金钱', targetLabel: '经济', value: '24,680', icon: Coins },
  { id: 'inventory', label: '贸易值', targetLabel: '库存', value: '12,430', icon: Warehouse },
  { id: 'military', label: '军事值', targetLabel: '军事', value: '68', icon: Shield },
];
