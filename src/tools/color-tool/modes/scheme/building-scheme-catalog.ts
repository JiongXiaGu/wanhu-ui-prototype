import type { BuildingColorScheme } from './BuildingSchemeWorkspace';

export const BUILDING_COLOR_SCHEMES: readonly BuildingColorScheme[] = [
  { id: 'jiangnan-elegant', name: '江南素雅', source: 'builtin', style: 'elegant', colors: ['#d6d0c3', '#4d5554', '#74513d'] },
  { id: 'ink-restrained', name: '墨瓦沉木', source: 'builtin', style: 'restrained', colors: ['#343b3b', '#5e493b', '#a49b89'] },
  { id: 'spring-vivid', name: '春庭明彩', source: 'builtin', style: 'vivid', colors: ['#c96e4d', '#c5a75f', '#6e876b'] },
  { id: 'royal-ornate', name: '皇家朱金', source: 'builtin', style: 'ornate', colors: ['#8c3e32', '#b69145', '#d8c696'] },
  { id: 'mountain-natural', name: '山居原色', source: 'builtin', style: 'natural', colors: ['#7d664e', '#657064', '#a89c7e'] },
  { id: 'temple-gray', name: '寺观灰青', source: 'builtin', style: 'restrained', colors: ['#596568', '#7a5a45', '#bbb4a3'] },
  { id: 'white-wall', name: '粉墙黛瓦', source: 'builtin', style: 'elegant', colors: ['#dfd9cd', '#444c4d', '#84624d'] },
  { id: 'courtyard-red', name: '深院朱梁', source: 'builtin', style: 'ornate', colors: ['#753d35', '#403d39', '#a88b5e'] },
  { id: 'workshop-rain', name: '雨巷青黛', source: 'workshop', style: 'elegant', colors: ['#9ca8a5', '#3f4b50', '#5d4b42'] },
  { id: 'workshop-autumn', name: '秋庭暖木', source: 'workshop', style: 'natural', colors: ['#9b704e', '#b29b70', '#555f55'] },
  { id: 'workshop-festival', name: '灯市彩檐', source: 'workshop', style: 'vivid', colors: ['#a34f3e', '#d09c4c', '#54766f'] },
  { id: 'player-amber', name: '我的暖檐', source: 'player', style: 'vivid', colors: ['#ad6d4c', '#c6a36b', '#6f7363'] },
  { id: 'player-night', name: '夜庭深青', source: 'player', style: 'restrained', colors: ['#37484d', '#4d4140', '#817963'] },
  { id: 'player-experiment', name: '试验配色 01', source: 'player', style: 'other', colors: ['#6f5f72', '#8a7860', '#535c58'] },
];

export function getBuildingColorScheme(schemeId: string) {
  return BUILDING_COLOR_SCHEMES.find((scheme) => scheme.id === schemeId) ?? BUILDING_COLOR_SCHEMES[0];
}
