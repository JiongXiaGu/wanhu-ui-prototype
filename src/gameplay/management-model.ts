import type { LucideIcon } from 'lucide-react';
import { Building2, Coins, Scale, ScrollText, Shield, Store, Users } from 'lucide-react';
import type { ManagementView } from '../app/ui-state';

export type ManagementSection = Exclude<ManagementView, 'none'>;

export interface ManagementNavItem {
  id: ManagementSection;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
}

export interface ManagementPanelConfig {
  title: string;
  icon: LucideIcon;
  status: string;
  stats: Array<{ label: string; value: string; delta?: string }>;
  rows: Array<{ label: string; value: string; description: string }>;
  notes: Array<{ label: string; value: string }>;
}

export const MANAGEMENT_NAV_ITEMS: ManagementNavItem[] = [
  { id: 'city', label: '城市概况', shortLabel: '概况', icon: Building2 },
  { id: 'population', label: '户籍民生', shortLabel: '户籍', icon: Users },
  { id: 'finance', label: '财政税赋', shortLabel: '财政', icon: Coins },
  { id: 'policy', label: '政令政策', shortLabel: '政策', icon: ScrollText },
  { id: 'commerce', label: '商贸物流', shortLabel: '商贸', icon: Store },
  { id: 'governance', label: '城市治理', shortLabel: '治理', icon: Scale },
  { id: 'military', label: '军务', shortLabel: '军务', icon: Shield },
];

export const MANAGEMENT_PANELS: Record<ManagementSection, ManagementPanelConfig> = {
  city: {
    title: '城市概况',
    icon: Building2,
    status: '昭平城 · 第十二年 · 秋',
    stats: [
      { label: '常住人口', value: '8,426', delta: '+37' },
      { label: '户数', value: '2,316', delta: '+11' },
      { label: '繁荣度', value: '72', delta: '+2' },
      { label: '民心', value: '81', delta: '+1' },
    ],
    rows: [
      { label: '城市发展', value: '稳步扩张', description: '城区等级、发展条件与近期建设需求' },
      { label: '官署效能', value: '良好', description: '行政覆盖与城市管理效率' },
      { label: '建设需求', value: '住宅偏高', description: '居住、商贸与生产建设需求' },
      { label: '粮食储备', value: '126 天', description: '当前人口规模下的综合粮食保障' },
    ],
    notes: [
      { label: '城西新市', value: '人口增长最快' },
      { label: '南门商圈', value: '商业热度上升' },
      { label: '北岸工坊', value: '道路压力偏高' },
    ],
  },
  population: {
    title: '户籍民生',
    icon: Users,
    status: '人口持续净流入',
    stats: [
      { label: '人口', value: '8,426', delta: '+37' },
      { label: '劳动力', value: '5,284', delta: '+22' },
      { label: '就业率', value: '92%', delta: '+1.2%' },
      { label: '空闲住宅', value: '184', delta: '-16' },
    ],
    rows: [
      { label: '人口结构', value: '青壮为主', description: '年龄、家庭与劳动力构成' },
      { label: '居民需求', value: '基本满足', description: '居住、粮食、衣物与服务需求' },
      { label: '人口流动', value: '净流入', description: '迁入、迁出与城市吸引力' },
      { label: '居住压力', value: '中等', description: '住宅供给、拥挤度与迁入预期' },
    ],
    notes: [
      { label: '净迁入', value: '+37 / 月' },
      { label: '平均户规模', value: '3.64 人' },
      { label: '适龄劳动力', value: '62.7%' },
    ],
  },
  finance: {
    title: '财政税赋',
    icon: Coins,
    status: '本月结余 +2,280',
    stats: [
      { label: '库银', value: '24,680', delta: '+10.2%' },
      { label: '月收入', value: '8,620', delta: '+6.4%' },
      { label: '月支出', value: '6,340', delta: '+2.1%' },
      { label: '财政结余', value: '+2,280', delta: '+21.8%' },
    ],
    rows: [
      { label: '田赋', value: '12%', description: '田地与农业生产相关税赋' },
      { label: '商税', value: '8%', description: '市场、商铺与贸易相关税赋' },
      { label: '市税', value: '6%', description: '城市服务与市井经营相关税赋' },
      { label: '财政支出', value: '稳定', description: '官署、公共建设与维护支出' },
    ],
    notes: [
      { label: '最大收入来源', value: '商税 31%' },
      { label: '最大支出项目', value: '公共营造 28%' },
      { label: '预计下月结余', value: '+2,460' },
    ],
  },
  policy: {
    title: '政令政策',
    icon: ScrollText,
    status: '3 项政令正在施行',
    stats: [
      { label: '生效政令', value: '3' },
      { label: '可用槽位', value: '5' },
      { label: '民心影响', value: '+4' },
      { label: '财政影响', value: '-320' },
    ],
    rows: [
      { label: '屯粮令', value: '施行中', description: '提高粮仓储备，增加仓储开支' },
      { label: '劝农令', value: '施行中', description: '提高农业产出与农户稳定度' },
      { label: '夜市令', value: '施行中', description: '提高商业活跃度并增加夜间治安压力' },
      { label: '待议政令', value: '2 项', description: '满足条件后可进入议定流程' },
    ],
    notes: [
      { label: '农业产出', value: '+8%' },
      { label: '仓储支出', value: '+180 / 月' },
      { label: '商业活力', value: '+6' },
    ],
  },
  commerce: {
    title: '商贸物流',
    icon: Store,
    status: '市场供应总体充足',
    stats: [
      { label: '商户', value: '164', delta: '+5' },
      { label: '市场', value: '6' },
      { label: '日均货量', value: '3,480', delta: '+4.8%' },
      { label: '外来商队', value: '12', delta: '+2' },
    ],
    rows: [
      { label: '市场供给', value: '充足', description: '主要商品供应与覆盖范围' },
      { label: '城内物流', value: '顺畅', description: '仓储、道路与货物流转效率' },
      { label: '对外贸易', value: '增长', description: '商路、关卡与外来商队情况' },
      { label: '紧缺商品', value: '2 类', description: '当前价格明显高于常态的商品' },
    ],
    notes: [
      { label: '最活跃市场', value: '南门市' },
      { label: '主要输入', value: '铁料 / 布匹' },
      { label: '主要输出', value: '粮食 / 木器' },
    ],
  },
  governance: {
    title: '城市治理',
    icon: Scale,
    status: '城区秩序良好',
    stats: [
      { label: '治安', value: '86', delta: '+2' },
      { label: '清洁', value: '74', delta: '-1' },
      { label: '火灾风险', value: '低' },
      { label: '官署覆盖', value: '91%' },
    ],
    rows: [
      { label: '治安巡查', value: '稳定', description: '案件、巡逻与重点区域' },
      { label: '消防防灾', value: '良好', description: '火灾风险、水源与救援覆盖' },
      { label: '环境卫生', value: '尚可', description: '污秽、排水与疾病风险' },
      { label: '行政覆盖', value: '91%', description: '官署服务与基层治理覆盖' },
    ],
    notes: [
      { label: '治安薄弱区', value: '东码头' },
      { label: '高火险建筑', value: '23 栋' },
      { label: '排水压力', value: '城南偏高' },
    ],
  },
  military: {
    title: '军务',
    icon: Shield,
    status: '城防处于常备状态',
    stats: [
      { label: '驻军', value: '1,240' },
      { label: '训练度', value: '78', delta: '+1' },
      { label: '城防', value: '84' },
      { label: '军费/月', value: '1,180', delta: '+40' },
    ],
    rows: [
      { label: '驻军编制', value: '正常', description: '兵员、编制与训练情况' },
      { label: '城墙防务', value: '稳固', description: '城墙、城门与防御设施' },
      { label: '军需储备', value: '62 天', description: '粮草、器械与后勤保障' },
      { label: '巡防任务', value: '4 队', description: '当前城防与外围巡防部署' },
    ],
    notes: [
      { label: '北门守备', value: '加强' },
      { label: '器械完好率', value: '93%' },
      { label: '军粮储备', value: '62 天' },
    ],
  },
};
