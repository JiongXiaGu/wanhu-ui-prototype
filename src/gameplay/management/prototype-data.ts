export const FINANCE_TREND = [
  { month: '四月', income: 61, expense: 54 },
  { month: '五月', income: 66, expense: 58 },
  { month: '六月', income: 70, expense: 56 },
  { month: '七月', income: 74, expense: 60 },
  { month: '八月', income: 78, expense: 62 },
  { month: '九月', income: 86, expense: 63 },
];

export const FINANCE_BREAKDOWN = [
  { label: '商税', value: '2,672', pct: 78 },
  { label: '田赋', value: '2,188', pct: 64 },
  { label: '市税', value: '1,466', pct: 46 },
  { label: '关津与其它', value: '2,294', pct: 68 },
];

export type InventoryTab = 'overview' | 'warehouses' | 'villages';

export const INVENTORY_RESOURCES = [
  { name: '粮食', total: '12,480', city: '6,240', villages: '6,240', delta: '+186', status: '充足', tone: 'good' },
  { name: '木材', total: '3,860', city: '1,420', villages: '2,440', delta: '+58', status: '正常', tone: 'normal' },
  { name: '石料', total: '2,780', city: '1,680', villages: '1,100', delta: '+34', status: '正常', tone: 'normal' },
  { name: '铁料', total: '1,160', city: '840', villages: '320', delta: '+12', status: '偏紧', tone: 'warning' },
  { name: '布匹', total: '920', city: '720', villages: '200', delta: '+8', status: '正常', tone: 'normal' },
  { name: '陶器', total: '740', city: '520', villages: '220', delta: '+10', status: '正常', tone: 'normal' },
];

export const CITY_WAREHOUSES = [
  {
    id: 'river-port',
    name: '河港总仓',
    district: '东河埠',
    used: 1860,
    capacity: 2400,
    purpose: '综合转运',
    inbound: '420 / 日',
    outbound: '368 / 日',
    contents: [
      { name: '粮食', amount: 820, share: 44 },
      { name: '木材', amount: 460, share: 25 },
      { name: '石料', amount: 320, share: 17 },
      { name: '铁料', amount: 260, share: 14 },
    ],
  },
  {
    id: 'east-market',
    name: '东市转运仓',
    district: '东市坊',
    used: 1280,
    capacity: 1600,
    purpose: '民生商货',
    inbound: '286 / 日',
    outbound: '301 / 日',
    contents: [
      { name: '粮食', amount: 520, share: 41 },
      { name: '布匹', amount: 280, share: 22 },
      { name: '陶器', amount: 190, share: 15 },
      { name: '日用品', amount: 290, share: 22 },
    ],
  },
  {
    id: 'north-garrison',
    name: '北门军需仓',
    district: '北门营',
    used: 920,
    capacity: 1200,
    purpose: '军需储备',
    inbound: '96 / 日',
    outbound: '82 / 日',
    contents: [
      { name: '粮食', amount: 360, share: 39 },
      { name: '铁料', amount: 310, share: 34 },
      { name: '木材', amount: 160, share: 17 },
      { name: '器械', amount: 90, share: 10 },
    ],
  },
  {
    id: 'west-workshop',
    name: '西作坊料仓',
    district: '西作坊',
    used: 1060,
    capacity: 1400,
    purpose: '营造原料',
    inbound: '174 / 日',
    outbound: '168 / 日',
    contents: [
      { name: '木材', amount: 520, share: 49 },
      { name: '石料', amount: 360, share: 34 },
      { name: '铁料', amount: 180, share: 17 },
    ],
  },
];

export const VILLAGE_STOCKS = [
  { id: 'nantang', name: '南塘村', resource: '稻米', stock: '2,860', daily: '+92', route: '南门粮道', distance: '6.4 里', destination: '河港总仓', status: '运输正常' },
  { id: 'dongliu', name: '东柳村', resource: '木材', stock: '1,940', daily: '+58', route: '东岸林道', distance: '8.1 里', destination: '西作坊料仓', status: '运输正常' },
  { id: 'qingshi', name: '青石村', resource: '石料', stock: '1,100', daily: '+34', route: '北山石道', distance: '11.6 里', destination: '河港总仓', status: '运输正常' },
  { id: 'tielu', name: '铁炉村', resource: '铁料', stock: '320', daily: '+12', route: '北驿道', distance: '14.2 里', destination: '北门军需仓', status: '车队偏少' },
  { id: 'yunjin', name: '云锦村', resource: '布匹', stock: '200', daily: '+8', route: '西郊官道', distance: '9.7 里', destination: '东市转运仓', status: '运输正常' },
  { id: 'taoxi', name: '陶溪村', resource: '陶器', stock: '220', daily: '+10', route: '南岸水路', distance: '12.3 里', destination: '东市转运仓', status: '运输正常' },
];
