import type { LucideIcon } from 'lucide-react';
import {
  Bridge,
  Building2,
  Castle,
  Columns3,
  DoorOpen,
  Fence,
  Flag,
  Flower2,
  Grid2X2,
  House,
  Landmark,
  Lamp,
  Mountain,
  Layers3,
  PanelsTopLeft,
  Route,
  Sparkles,
  Store,
  Trees,
  Waves,
} from 'lucide-react';
import type { DesignDockCategory } from '../app/ui-state';

export type DesignWorkspaceTone =
  | 'tower'
  | 'pagoda'
  | 'hall'
  | 'pavilion'
  | 'house'
  | 'gate'
  | 'waterside'
  | 'special';

export interface DesignWorkspaceRailItem {
  key: string;
  label: string;
  icon: LucideIcon;
}

export interface DesignWorkspaceFilter {
  key: string;
  label: string;
}

export interface DesignWorkspaceItem {
  id: string;
  name: string;
  primary: string;
  filters: readonly string[];
  meta: string;
  detail: string;
  tone: DesignWorkspaceTone;
}

export interface DesignWorkspaceDefinition {
  id: DesignDockCategory;
  title: string;
  icon: LucideIcon;
  railLabel: string;
  emptyLabel: string;
  primaryCategories: readonly DesignWorkspaceRailItem[];
  contextFilters: readonly DesignWorkspaceFilter[];
  items: readonly DesignWorkspaceItem[];
}

const road: DesignWorkspaceDefinition = {
  id: 'road',
  title: '道路',
  icon: Route,
  railLabel: '道路类型',
  emptyLabel: '没有符合条件的道路',
  primaryCategories: [
    { key: 'all', label: '全部道路', icon: Grid2X2 },
    { key: 'earth', label: '土路', icon: Route },
    { key: 'gravel', label: '砂石路', icon: Route },
    { key: 'stone', label: '石板路', icon: Route },
    { key: 'brick', label: '砖路', icon: Route },
    { key: 'official', label: '官道', icon: Landmark },
  ],
  contextFilters: [
    { key: 'all', label: '全部' },
    { key: 'w1', label: '一格宽' },
    { key: 'w2', label: '二格宽' },
    { key: 'w3', label: '三格宽' },
    { key: 'w4', label: '四格宽' },
  ],
  items: [
    { id: 'earth-lane', name: '夯土小路', primary: 'earth', filters: ['w1'], meta: '夯土 · 一格宽', detail: '低成本 / 巷道', tone: 'house' },
    { id: 'earth-road', name: '黄土大道', primary: 'earth', filters: ['w3'], meta: '夯土 · 三格宽', detail: '城郊 / 主路', tone: 'tower' },
    { id: 'gravel-lane', name: '碎石便道', primary: 'gravel', filters: ['w1', 'w2'], meta: '碎石 · 二格宽', detail: '城郊 / 工坊', tone: 'special' },
    { id: 'river-stone-road', name: '河卵石路', primary: 'gravel', filters: ['w2'], meta: '卵石 · 二格宽', detail: '市井 / 水岸', tone: 'waterside' },
    { id: 'blue-stone-road', name: '青石板路', primary: 'stone', filters: ['w2'], meta: '青石 · 二格宽', detail: '城区 / 耐久', tone: 'hall' },
    { id: 'granite-avenue', name: '条石大道', primary: 'stone', filters: ['w3'], meta: '条石 · 三格宽', detail: '主街 / 礼制', tone: 'pavilion' },
    { id: 'brick-street', name: '青砖街道', primary: 'brick', filters: ['w2'], meta: '青砖 · 二格宽', detail: '坊巷 / 商业', tone: 'gate' },
    { id: 'imperial-road', name: '中轴官道', primary: 'official', filters: ['w4'], meta: '石材 · 四格宽', detail: '中轴 / 礼制', tone: 'pagoda' },
  ],
};

const bridge: DesignWorkspaceDefinition = {
  id: 'bridge',
  title: '桥梁',
  icon: Bridge,
  railLabel: '桥梁类型',
  emptyLabel: '没有符合条件的桥梁',
  primaryCategories: [
    { key: 'all', label: '全部桥梁', icon: Grid2X2 },
    { key: 'wood', label: '木桥', icon: Bridge },
    { key: 'stone', label: '石桥', icon: Bridge },
    { key: 'arch', label: '拱桥', icon: Bridge },
    { key: 'covered', label: '廊桥', icon: PanelsTopLeft },
    { key: 'floating', label: '浮桥', icon: Waves },
  ],
  contextFilters: [
    { key: 'all', label: '全部' },
    { key: 'small', label: '小型' },
    { key: 'medium', label: '中型' },
    { key: 'large', label: '大型' },
    { key: 'water', label: '宽水面' },
  ],
  items: [
    { id: 'wood-flat', name: '木平桥', primary: 'wood', filters: ['small'], meta: '木构 · 小型', detail: '溪流 / 低成本', tone: 'waterside' },
    { id: 'wood-trestle', name: '木栈桥', primary: 'wood', filters: ['medium', 'water'], meta: '木构 · 中型', detail: '水岸 / 通行', tone: 'special' },
    { id: 'stone-beam', name: '石梁桥', primary: 'stone', filters: ['small'], meta: '石构 · 小型', detail: '沟渠 / 耐久', tone: 'hall' },
    { id: 'stone-long', name: '长跨石桥', primary: 'stone', filters: ['large', 'water'], meta: '石构 · 大型', detail: '河道 / 重载', tone: 'pavilion' },
    { id: 'arch-one', name: '单孔石拱桥', primary: 'arch', filters: ['medium'], meta: '石拱 · 中型', detail: '河道 / 景观', tone: 'gate' },
    { id: 'arch-three', name: '三孔石拱桥', primary: 'arch', filters: ['large', 'water'], meta: '石拱 · 大型', detail: '主河道 / 地标', tone: 'pagoda' },
    { id: 'covered-market', name: '市河廊桥', primary: 'covered', filters: ['medium'], meta: '木构 · 中型', detail: '商业 / 避雨', tone: 'tower' },
    { id: 'floating-chain', name: '连舟浮桥', primary: 'floating', filters: ['large', 'water'], meta: '舟桥 · 大型', detail: '临时 / 军事', tone: 'special' },
  ],
};

const building: DesignWorkspaceDefinition = {
  id: 'building',
  title: '建筑',
  icon: Building2,
  railLabel: '建筑形制',
  emptyLabel: '没有符合条件的建筑',
  primaryCategories: [
    { key: 'all', label: '全部建筑', icon: Grid2X2 },
    { key: 'tower', label: '塔', icon: Landmark },
    { key: 'hall', label: '殿', icon: Building2 },
    { key: 'pavilion', label: '楼阁', icon: PanelsTopLeft },
    { key: 'house', label: '屋舍', icon: House },
    { key: 'gate', label: '门', icon: DoorOpen },
    { key: 'gallery', label: '廊榭', icon: Waves },
    { key: 'gazebo', label: '亭', icon: House },
    { key: 'archway', label: '牌坊', icon: PanelsTopLeft },
    { key: 'special', label: '特殊', icon: Sparkles },
  ],
  contextFilters: [
    { key: 'all', label: '全部' },
    { key: 'wudian', label: '庑殿' },
    { key: 'xieshan', label: '歇山' },
    { key: 'xuanshan', label: '悬山' },
    { key: 'yingshan', label: '硬山' },
    { key: 'cuanjian', label: '攒尖' },
    { key: 'juanpeng', label: '卷棚' },
    { key: 'other', label: '其他' },
  ],
  items: [
    { id: 'tower-octagonal', name: '八角楼阁式木塔', primary: 'tower', filters: ['other'], meta: '楼阁式 · 七层', detail: '城市地标 / 寺观', tone: 'tower' },
    { id: 'tower-brick', name: '密檐砖塔', primary: 'tower', filters: ['other'], meta: '密檐 · 九层', detail: '寺观 / 地标', tone: 'pagoda' },
    { id: 'tower-five', name: '五层攒尖木塔', primary: 'tower', filters: ['cuanjian'], meta: '攒尖 · 五层', detail: '寺观 / 地标', tone: 'special' },
    { id: 'hall-wudian', name: '重檐庑殿大殿', primary: 'hall', filters: ['wudian'], meta: '庑殿 · 重檐', detail: '礼制 / 公共建筑', tone: 'hall' },
    { id: 'hall-xieshan', name: '单檐歇山正殿', primary: 'hall', filters: ['xieshan'], meta: '歇山 · 五开间', detail: '礼制建筑', tone: 'pavilion' },
    { id: 'hall-xuanshan', name: '悬山配殿', primary: 'hall', filters: ['xuanshan'], meta: '悬山 · 三开间', detail: '附属建筑', tone: 'house' },
    { id: 'pavilion-double', name: '重檐楼阁', primary: 'pavilion', filters: ['other'], meta: '重檐 · 双层', detail: '公共建筑', tone: 'pavilion' },
    { id: 'pavilion-watch', name: '临街望楼', primary: 'pavilion', filters: ['xieshan'], meta: '歇山 · 双层', detail: '城市建筑', tone: 'gate' },
    { id: 'house-three', name: '三开间民居', primary: 'house', filters: ['yingshan'], meta: '硬山 · 三开间', detail: '住宅', tone: 'house' },
    { id: 'house-five', name: '五开间厅堂', primary: 'house', filters: ['xuanshan'], meta: '悬山 · 五开间', detail: '住宅 / 会客', tone: 'tower' },
    { id: 'house-wing', name: '卷棚厢房', primary: 'house', filters: ['juanpeng'], meta: '卷棚 · 三开间', detail: '附属房屋', tone: 'waterside' },
    { id: 'gate-city', name: '城门楼阁', primary: 'gate', filters: ['other'], meta: '门楼 · 城防', detail: '城门建筑', tone: 'gate' },
    { id: 'gate-yard', name: '歇山院门', primary: 'gate', filters: ['xieshan'], meta: '歇山 · 院门', detail: '院落入口', tone: 'hall' },
    { id: 'gallery-water', name: '临水榭台', primary: 'gallery', filters: ['juanpeng'], meta: '卷棚 · 水岸', detail: '园林建筑', tone: 'waterside' },
    { id: 'gallery-corridor', name: '曲折游廊', primary: 'gallery', filters: ['xuanshan'], meta: '悬山 · 连廊', detail: '园林建筑', tone: 'pagoda' },
    { id: 'gazebo-square', name: '四角攒尖亭', primary: 'gazebo', filters: ['cuanjian'], meta: '攒尖 · 四角', detail: '园林建筑', tone: 'special' },
    { id: 'gazebo-six', name: '六角水亭', primary: 'gazebo', filters: ['cuanjian'], meta: '攒尖 · 六角', detail: '水岸建筑', tone: 'waterside' },
    { id: 'archway-three', name: '三间四柱牌坊', primary: 'archway', filters: ['other'], meta: '楼式 · 三间', detail: '街道节点', tone: 'gate' },
    { id: 'archway-stone', name: '冲天式石牌坊', primary: 'archway', filters: ['other'], meta: '冲天式 · 石构', detail: '礼制 / 地标', tone: 'pagoda' },
    { id: 'special-observatory', name: '观象台', primary: 'special', filters: ['other'], meta: '工程 · 高台', detail: '特殊工程', tone: 'special' },
  ],
};

const platform: DesignWorkspaceDefinition = {
  id: 'platform',
  title: '台基',
  icon: Layers3,
  railLabel: '台基类型',
  emptyLabel: '没有符合条件的台基',
  primaryCategories: [
    { key: 'all', label: '全部台基', icon: Grid2X2 },
    { key: 'single', label: '单层台基', icon: Layers3 },
    { key: 'multi', label: '多层台基', icon: Layers3 },
    { key: 'xumi', label: '须弥座', icon: Columns3 },
    { key: 'terrace', label: '月台', icon: Landmark },
    { key: 'stair', label: '踏道', icon: Route },
  ],
  contextFilters: [
    { key: 'all', label: '全部' },
    { key: 'one', label: '一层' },
    { key: 'two', label: '二层' },
    { key: 'three', label: '三层' },
    { key: 'palace', label: '宫殿' },
    { key: 'temple', label: '寺观' },
  ],
  items: [
    { id: 'platform-earth', name: '夯土素台基', primary: 'single', filters: ['one'], meta: '夯土 · 一层', detail: '普通建筑 / 低成本', tone: 'house' },
    { id: 'platform-brick', name: '包砖单层台基', primary: 'single', filters: ['one'], meta: '包砖 · 一层', detail: '院落 / 公共建筑', tone: 'hall' },
    { id: 'platform-double', name: '双层宫殿台基', primary: 'multi', filters: ['two', 'palace'], meta: '石作 · 二层', detail: '宫殿 / 礼制', tone: 'pavilion' },
    { id: 'platform-triple', name: '三层宫殿台基', primary: 'multi', filters: ['three', 'palace'], meta: '石作 · 三层', detail: '大殿 / 礼制', tone: 'pagoda' },
    { id: 'platform-xumi', name: '须弥座高台基', primary: 'xumi', filters: ['one', 'temple'], meta: '石作 · 须弥座', detail: '寺观 / 高等级', tone: 'special' },
    { id: 'platform-moon', name: '前置月台', primary: 'terrace', filters: ['palace'], meta: '石作 · 月台', detail: '仪典 / 集散', tone: 'tower' },
    { id: 'platform-stair', name: '御路踏道', primary: 'stair', filters: ['palace'], meta: '石作 · 踏道', detail: '宫殿 / 中轴', tone: 'gate' },
    { id: 'platform-temple', name: '寺观高台基', primary: 'multi', filters: ['two', 'temple'], meta: '砖石 · 二层', detail: '寺观 / 山地', tone: 'waterside' },
  ],
};

const cityWall: DesignWorkspaceDefinition = {
  id: 'city-wall',
  title: '城墙',
  icon: Castle,
  railLabel: '城墙体系',
  emptyLabel: '没有符合条件的城墙构件',
  primaryCategories: [
    { key: 'all', label: '全部城墙', icon: Grid2X2 },
    { key: 'gentle-wall', label: '小倾斜角', icon: Castle },
    { key: 'steep-wall', label: '高倾斜角', icon: Castle },
    { key: 'waterside-wall', label: '临水', icon: Waves },
    { key: 'mountain-wall', label: '山地', icon: Mountain },
  ],
  contextFilters: [
    { key: 'all', label: '全部' },
    { key: 'wall', label: '城墙' },
    { key: 'gate-opening', label: '门洞' },
    { key: 'ground-access-stair', label: '登城梯' },
    { key: 'walkway-transition-stair', label: '高差楼梯' },
  ],
  items: [
    { id: 'citywall-gentle-wall', name: '标准墙段', primary: 'gentle-wall', filters: ['wall'], meta: '小倾斜角 · 城墙', detail: '一般城防 / 路径绘制', tone: 'hall' },
    { id: 'citywall-gentle-gate', name: '拱券门洞', primary: 'gentle-wall', filters: ['gate-opening'], meta: '小倾斜角 · 门洞', detail: '嵌入墙段 / 通行', tone: 'gate' },
    { id: 'citywall-gentle-ground-stair', name: '直登城梯', primary: 'gentle-wall', filters: ['ground-access-stair'], meta: '小倾斜角 · 登城梯', detail: '地面至马道 / 贴墙', tone: 'pavilion' },
    { id: 'citywall-gentle-transition-stair', name: '马道高差梯', primary: 'gentle-wall', filters: ['walkway-transition-stair'], meta: '小倾斜角 · 高差楼梯', detail: '连接马道高差 / 贴墙', tone: 'tower' },

    { id: 'citywall-steep-wall', name: '高倾角标准墙段', primary: 'steep-wall', filters: ['wall'], meta: '高倾斜角 · 城墙', detail: '高大城防 / 路径绘制', tone: 'special' },
    { id: 'citywall-steep-gate', name: '高墙拱券门洞', primary: 'steep-wall', filters: ['gate-opening'], meta: '高倾斜角 · 门洞', detail: '嵌入高墙 / 通行', tone: 'gate' },
    { id: 'citywall-steep-ground-stair', name: '高墙登城梯', primary: 'steep-wall', filters: ['ground-access-stair'], meta: '高倾斜角 · 登城梯', detail: '地面至高马道 / 贴墙', tone: 'pagoda' },
    { id: 'citywall-steep-transition-stair', name: '高墙高差梯', primary: 'steep-wall', filters: ['walkway-transition-stair'], meta: '高倾斜角 · 高差楼梯', detail: '连接高位马道 / 贴墙', tone: 'tower' },

    { id: 'citywall-waterside-wall', name: '临水标准墙段', primary: 'waterside-wall', filters: ['wall'], meta: '临水 · 城墙', detail: '滨河城防 / 路径绘制', tone: 'waterside' },
    { id: 'citywall-waterside-gate', name: '拱券水门洞', primary: 'waterside-wall', filters: ['gate-opening'], meta: '临水 · 门洞', detail: '跨水墙段 / 水门', tone: 'waterside' },
    { id: 'citywall-waterside-ground-stair', name: '临水登城梯', primary: 'waterside-wall', filters: ['ground-access-stair'], meta: '临水 · 登城梯', detail: '岸侧至马道 / 贴墙', tone: 'pavilion' },
    { id: 'citywall-waterside-transition-stair', name: '临水高差梯', primary: 'waterside-wall', filters: ['walkway-transition-stair'], meta: '临水 · 高差楼梯', detail: '连接滨水马道 / 贴墙', tone: 'tower' },

    { id: 'citywall-mountain-wall', name: '山地顺坡墙段', primary: 'mountain-wall', filters: ['wall'], meta: '山地 · 城墙', detail: '顺坡城防 / 路径绘制', tone: 'tower' },
    { id: 'citywall-mountain-gate', name: '山地拱券门洞', primary: 'mountain-wall', filters: ['gate-opening'], meta: '山地 · 门洞', detail: '嵌入坡地墙段 / 通行', tone: 'gate' },
    { id: 'citywall-mountain-ground-stair', name: '山地登城梯', primary: 'mountain-wall', filters: ['ground-access-stair'], meta: '山地 · 登城梯', detail: '坡地至马道 / 贴墙', tone: 'special' },
    { id: 'citywall-mountain-transition-stair', name: '山地高差梯', primary: 'mountain-wall', filters: ['walkway-transition-stair'], meta: '山地 · 高差楼梯', detail: '连接顺坡马道 / 贴墙', tone: 'pavilion' },
  ],
};

const wall: DesignWorkspaceDefinition = {
  id: 'wall',
  title: '围墙',
  icon: Fence,
  railLabel: '围墙类型',
  emptyLabel: '没有符合条件的围墙',
  primaryCategories: [
    { key: 'all', label: '全部围墙', icon: Grid2X2 },
    { key: 'earth', label: '夯土围墙', icon: Fence },
    { key: 'brick', label: '青砖围墙', icon: Fence },
    { key: 'white', label: '白墙', icon: Fence },
    { key: 'garden', label: '花墙', icon: Flower2 },
    { key: 'gate', label: '院门', icon: DoorOpen },
  ],
  contextFilters: [
    { key: 'all', label: '全部' },
    { key: 'low', label: '低墙' },
    { key: 'medium', label: '中墙' },
    { key: 'high', label: '高墙' },
    { key: 'garden', label: '园林' },
  ],
  items: [
    { id: 'yard-earth', name: '夯土院墙', primary: 'earth', filters: ['medium'], meta: '夯土 · 中墙', detail: '民居 / 低成本', tone: 'house' },
    { id: 'yard-brick', name: '青砖院墙', primary: 'brick', filters: ['medium'], meta: '青砖 · 中墙', detail: '民居 / 商铺', tone: 'hall' },
    { id: 'yard-brick-high', name: '高青砖围墙', primary: 'brick', filters: ['high'], meta: '青砖 · 高墙', detail: '官署 / 防护', tone: 'tower' },
    { id: 'yard-white', name: '粉墙黛瓦', primary: 'white', filters: ['medium', 'garden'], meta: '白墙 · 中墙', detail: '园林 / 江南', tone: 'waterside' },
    { id: 'yard-flower', name: '漏窗花墙', primary: 'garden', filters: ['low', 'garden'], meta: '砖石 · 花墙', detail: '园林 / 分景', tone: 'special' },
    { id: 'yard-low', name: '矮石围墙', primary: 'garden', filters: ['low'], meta: '石材 · 低墙', detail: '田园 / 边界', tone: 'pavilion' },
    { id: 'yard-gate', name: '垂花院门', primary: 'gate', filters: ['garden'], meta: '木构 · 院门', detail: '院落 / 礼序', tone: 'gate' },
    { id: 'yard-side-gate', name: '砖券侧门', primary: 'gate', filters: ['medium'], meta: '砖石 · 院门', detail: '巷道 / 后勤', tone: 'pagoda' },
  ],
};

const decoration: DesignWorkspaceDefinition = {
  id: 'decoration',
  title: '装饰',
  icon: Sparkles,
  railLabel: '装饰类型',
  emptyLabel: '没有符合条件的装饰',
  primaryCategories: [
    { key: 'all', label: '全部装饰', icon: Grid2X2 },
    { key: 'lamp', label: '灯具', icon: Lamp },
    { key: 'flag', label: '旗幡', icon: Flag },
    { key: 'stone', label: '石雕', icon: Landmark },
    { key: 'water', label: '水景', icon: Waves },
    { key: 'street', label: '街市摆件', icon: Store },
  ],
  contextFilters: [
    { key: 'all', label: '全部' },
    { key: 'street', label: '街道' },
    { key: 'garden', label: '园林' },
    { key: 'palace', label: '宫殿' },
    { key: 'market', label: '商业' },
    { key: 'festival', label: '节庆' },
  ],
  items: [
    { id: 'decor-lantern', name: '街巷灯笼架', primary: 'lamp', filters: ['street', 'festival'], meta: '灯具 · 街道', detail: '夜景 / 节庆', tone: 'gate' },
    { id: 'decor-palace-lamp', name: '宫灯立柱', primary: 'lamp', filters: ['palace'], meta: '灯具 · 宫殿', detail: '仪仗 / 夜景', tone: 'hall' },
    { id: 'decor-banner', name: '长街旗幡', primary: 'flag', filters: ['street', 'festival'], meta: '旗幡 · 节庆', detail: '街景 / 活动', tone: 'tower' },
    { id: 'decor-stone-lion', name: '石狮', primary: 'stone', filters: ['palace'], meta: '石雕 · 门前', detail: '礼制 / 节点', tone: 'pagoda' },
    { id: 'decor-stone-drum', name: '抱鼓石', primary: 'stone', filters: ['palace'], meta: '石雕 · 门前', detail: '府邸 / 官署', tone: 'pavilion' },
    { id: 'decor-pond', name: '小型叠水', primary: 'water', filters: ['garden'], meta: '水景 · 园林', detail: '景观 / 降温', tone: 'waterside' },
    { id: 'decor-stall', name: '临街货摊', primary: 'street', filters: ['market', 'street'], meta: '摆件 · 商业', detail: '市井 / 商业', tone: 'house' },
    { id: 'decor-sign', name: '店铺幌子', primary: 'street', filters: ['market'], meta: '摆件 · 商业', detail: '识别 / 市井', tone: 'special' },
  ],
};

const tree: DesignWorkspaceDefinition = {
  id: 'tree',
  title: '树木',
  icon: Trees,
  railLabel: '植物类型',
  emptyLabel: '没有符合条件的树木',
  primaryCategories: [
    { key: 'all', label: '全部树木', icon: Grid2X2 },
    { key: 'canopy', label: '乔木', icon: Trees },
    { key: 'fruit', label: '果树', icon: Trees },
    { key: 'bamboo', label: '竹类', icon: Trees },
    { key: 'flower', label: '花木', icon: Flower2 },
    { key: 'water', label: '水生植物', icon: Waves },
  ],
  contextFilters: [
    { key: 'all', label: '全部' },
    { key: 'evergreen', label: '常绿' },
    { key: 'deciduous', label: '落叶' },
    { key: 'flowering', label: '开花' },
    { key: 'fruiting', label: '结果' },
    { key: 'waterside', label: '水岸' },
  ],
  items: [
    { id: 'tree-pine', name: '油松', primary: 'canopy', filters: ['evergreen'], meta: '乔木 · 常绿', detail: '街道 / 园林', tone: 'tower' },
    { id: 'tree-pagoda', name: '国槐', primary: 'canopy', filters: ['deciduous'], meta: '乔木 · 落叶', detail: '街道 / 庭院', tone: 'house' },
    { id: 'tree-willow', name: '垂柳', primary: 'canopy', filters: ['deciduous', 'waterside'], meta: '乔木 · 水岸', detail: '河岸 / 湖边', tone: 'waterside' },
    { id: 'tree-jujube', name: '枣树', primary: 'fruit', filters: ['deciduous', 'fruiting'], meta: '果树 · 结果', detail: '庭院 / 农家', tone: 'hall' },
    { id: 'tree-peach', name: '桃树', primary: 'fruit', filters: ['flowering', 'fruiting'], meta: '果树 · 开花', detail: '园林 / 庭院', tone: 'special' },
    { id: 'tree-bamboo', name: '修竹', primary: 'bamboo', filters: ['evergreen'], meta: '竹类 · 常绿', detail: '园林 / 院落', tone: 'pavilion' },
    { id: 'tree-plum', name: '梅树', primary: 'flower', filters: ['flowering'], meta: '花木 · 开花', detail: '园林 / 冬景', tone: 'pagoda' },
    { id: 'tree-lotus', name: '荷花', primary: 'water', filters: ['flowering', 'waterside'], meta: '水生 · 开花', detail: '池塘 / 园林', tone: 'waterside' },
  ],
};

export const DESIGN_WORKSPACES: Record<DesignDockCategory, DesignWorkspaceDefinition> = {
  road,
  bridge,
  building,
  platform,
  'city-wall': cityWall,
  wall,
  decoration,
  tree,
};
