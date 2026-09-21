export type BuildingSelectionTone = 'normal' | 'positive' | 'warning';
export interface BuildingSelectionRow { label: string; value: string; tone?: BuildingSelectionTone; }
export interface BuildingSelectionSection { title: string; rows: readonly BuildingSelectionRow[]; }
export interface BuildingSelectionDefinition { id: string; name: string; category: string; district: string; status: string; anchor: { left: number; top: number; width: number; height: number }; sections: readonly BuildingSelectionSection[]; }
export const BUILDING_SELECTIONS: readonly BuildingSelectionDefinition[] = [
{id:'building-riverside-inn',name:'临河食肆',category:'商业',district:'南岸市坊',status:'正常营业',anchor:{left:1460,top:520,width:190,height:138},sections:[
{title:'经营概况',rows:[{label:'营业状态',value:'正常营业',tone:'positive'},{label:'今日结余',value:'+124',tone:'positive'},{label:'经营效率',value:'82%'}]},
{title:'人员',rows:[{label:'当前雇员',value:'6 / 8'},{label:'当前在岗',value:'5'},{label:'服务容量',value:'37 / 48'}]},
{title:'供应',rows:[{label:'食材库存',value:'正常',tone:'positive'},{label:'柴薪储量',value:'68%'}]},
{title:'建筑',rows:[{label:'耐久度',value:'92%'},{label:'占地',value:'3 × 4'},{label:'道路连接',value:'正常',tone:'positive'}]}]},
{id:'building-yongan-residence',name:'永安坊民居',category:'民居',district:'西坊',status:'居住稳定',anchor:{left:310,top:650,width:230,height:142},sections:[
{title:'居住',rows:[{label:'入住家庭',value:'4 / 5'},{label:'当前居民',value:'17 / 22'},{label:'入住率',value:'77%'}]},
{title:'生活',rows:[{label:'粮食保障',value:'充足',tone:'positive'},{label:'取水距离',value:'较近'},{label:'舒适度',value:'74%'}]},
{title:'建筑',rows:[{label:'耐久度',value:'88%'},{label:'占地',value:'4 × 5'},{label:'维护状态',value:'正常',tone:'positive'}]}]},
{id:'building-waterfront-workshop',name:'河埠木作坊',category:'工坊',district:'东河埠',status:'生产中',anchor:{left:1090,top:690,width:205,height:128},sections:[
{title:'生产',rows:[{label:'生产状态',value:'生产中',tone:'positive'},{label:'今日产量',value:'18 件'},{label:'生产效率',value:'79%'}]},
{title:'人员',rows:[{label:'工匠',value:'7 / 8'},{label:'当前在岗',value:'6'}]},
{title:'供应',rows:[{label:'木料',value:'64%'},{label:'成品库存',value:'41%'}]},
{title:'建筑',rows:[{label:'耐久度',value:'85%'},{label:'道路连接',value:'正常',tone:'positive'}]}]}
];
export function getBuildingSelectionDefinition(id: string | null | undefined){return BUILDING_SELECTIONS.find((building)=>building.id===id)??null;}
