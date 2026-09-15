import type { LucideIcon } from 'lucide-react';
import {
  Building2,
  ChevronRight,
  Coins,
  Scale,
  ScrollText,
  Shield,
  Store,
  Users,
  X,
} from 'lucide-react';
import type { Flyout } from '../app/ui-state';

type ManagementFlyoutId = Exclude<Flyout, 'none' | 'camera' | 'weather'>;

interface ManagementPanelConfig {
  title: string;
  icon: LucideIcon;
  status: string;
  stats: Array<{ label: string; value: string }>;
  rows: Array<{ label: string; value: string; description: string }>;
}

const PANELS: Record<ManagementFlyoutId, ManagementPanelConfig> = {
  city: {
    title: '城市概况',
    icon: Building2,
    status: '昭平城 · 第十二年',
    stats: [
      { label: '常住人口', value: '8,426' },
      { label: '户数', value: '2,316' },
      { label: '繁荣度', value: '72' },
      { label: '民心', value: '81' },
    ],
    rows: [
      { label: '城市发展', value: '稳步扩张', description: '城区等级、发展条件与近期需求' },
      { label: '官署效能', value: '良好', description: '行政覆盖与城市管理效率' },
      { label: '建设需求', value: '住宅偏高', description: '查看居住、商贸与生产建设需求' },
    ],
  },
  population: {
    title: '户籍民生',
    icon: Users,
    status: '人口持续净流入',
    stats: [
      { label: '人口', value: '8,426' },
      { label: '劳动力', value: '5,284' },
      { label: '就业率', value: '92%' },
      { label: '本月流入', value: '+37' },
    ],
    rows: [
      { label: '人口结构', value: '青壮为主', description: '年龄、家庭与劳动力构成' },
      { label: '居民需求', value: '基本满足', description: '居住、粮食、衣物与服务需求' },
      { label: '人口流动', value: '净流入', description: '迁入、迁出与城市吸引力' },
    ],
  },
  finance: {
    title: '财政税赋',
    icon: Coins,
    status: '本月结余 +2,280',
    stats: [
      { label: '库银', value: '24,680' },
      { label: '月收入', value: '+8,620' },
      { label: '月支出', value: '-6,340' },
      { label: '财政结余', value: '+2,280' },
    ],
    rows: [
      { label: '田赋', value: '12%', description: '田地与农业生产相关税赋' },
      { label: '商税', value: '8%', description: '市场、商铺与贸易相关税赋' },
      { label: '财政支出', value: '稳定', description: '官署、公共建设与维护支出' },
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
      { label: '夜市令', value: '施行中', description: '提高商业活跃度与夜间治安压力' },
    ],
  },
  commerce: {
    title: '商贸物流',
    icon: Store,
    status: '市场供应总体充足',
    stats: [
      { label: '商户', value: '164' },
      { label: '市场', value: '6' },
      { label: '日均货量', value: '3,480' },
      { label: '外来商队', value: '12' },
    ],
    rows: [
      { label: '市场供给', value: '充足', description: '主要商品供应与覆盖范围' },
      { label: '城内物流', value: '顺畅', description: '仓储、道路与货物流转效率' },
      { label: '对外贸易', value: '增长', description: '商路、关卡与外来商队情况' },
    ],
  },
  governance: {
    title: '城市治理',
    icon: Scale,
    status: '城区秩序良好',
    stats: [
      { label: '治安', value: '86' },
      { label: '清洁', value: '74' },
      { label: '火灾风险', value: '低' },
      { label: '官署覆盖', value: '91%' },
    ],
    rows: [
      { label: '治安巡查', value: '稳定', description: '案件、巡逻与重点区域' },
      { label: '消防防灾', value: '良好', description: '火灾风险、水源与救援覆盖' },
      { label: '环境卫生', value: '尚可', description: '污秽、排水与疾病风险' },
    ],
  },
  military: {
    title: '军务',
    icon: Shield,
    status: '城防处于常备状态',
    stats: [
      { label: '驻军', value: '1,240' },
      { label: '训练度', value: '78' },
      { label: '城防', value: '84' },
      { label: '军费/月', value: '1,180' },
    ],
    rows: [
      { label: '驻军编制', value: '正常', description: '兵员、编制与训练情况' },
      { label: '城墙防务', value: '稳固', description: '城墙、城门与防御设施' },
      { label: '军需储备', value: '62 天', description: '粮草、器械与后勤保障' },
    ],
  },
};

interface Props {
  flyout: ManagementFlyoutId;
  onClose: () => void;
}

export function ManagementFlyout({ flyout, onClose }: Props) {
  const panel = PANELS[flyout];
  const HeadingIcon = panel.icon;

  return (
    <aside className={`flyout right-edge-flyout right-edge-flyout--management management-flyout management-flyout--${flyout}`}>
      <header>
        <div className="right-edge-flyout__heading">
          <span className="right-edge-flyout__heading-icon"><HeadingIcon /></span>
          <b className="right-edge-flyout__title">{panel.title}</b>
        </div>
        <button className="icon-button" onClick={onClose} aria-label="关闭面板"><X /></button>
      </header>

      <div className="right-edge-flyout__body management-flyout__body">
        <div className="management-flyout__status">{panel.status}</div>
        <section className="management-summary-grid">
          {panel.stats.map((stat) => (
            <div key={stat.label} className="management-summary-card">
              <small>{stat.label}</small>
              <b>{stat.value}</b>
            </div>
          ))}
        </section>

        <section className="right-edge-flyout__section management-flyout__section">
          <div className="right-edge-flyout__section-title"><b>管理项目</b></div>
          <div className="management-list">
            {panel.rows.map((row) => (
              <button key={row.label} type="button" className="management-row">
                <span>
                  <b>{row.label}</b>
                  <small>{row.description}</small>
                </span>
                <em>{row.value}</em>
                <ChevronRight />
              </button>
            ))}
          </div>
        </section>
      </div>
    </aside>
  );
}
