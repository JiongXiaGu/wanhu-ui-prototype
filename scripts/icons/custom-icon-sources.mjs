/* 项目自定义地形符号，不来自 Lucide。与通用图标共用生成器、64×64 PNG、1.7 线宽。
   只记录作者层几何；UI 的颜色、选中、焦点和背景不烘焙进资产。 */
export const CUSTOM_ICON_PATHS = Object.freeze({
  TerrainRaise: '<path d="M3 19h18M4 15h4l4-3 4 3h4M12 9V3m-3 3 3-3 3 3"/>',
  TerrainLower: '<path d="M3 19h18M4 12h4l4 3 4-3h4M12 3v6m-3-3 3 3 3-3"/>',
  TerrainFlatten: '<path d="M3 19h18M3 12h18M7 4v4m-2-2 2 2 2-2M17 4v4m-2-2 2 2 2-2"/>',
  TerrainSmooth: '<path d="M3 19h18M3 14c3 0 3-6 6-6s3 6 6 6 3-3 6-3M4 5l3-2 3 2"/>',
  TerrainSlope: '<path d="M3 19h18M5 14l14-8"/><circle cx="4" cy="15" r="2"/><circle cx="20" cy="5" r="2"/>',
});
export function renderCustomIcon(sourceName, size = 64, stroke = 1.7) {
  const body = CUSTOM_ICON_PATHS[sourceName];
  if (!body) throw new Error('Unknown custom icon: ' + sourceName);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
}
