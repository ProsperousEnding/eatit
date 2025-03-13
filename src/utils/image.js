/**
 * 获取图片URL
 * @param {string} imageName - 图片名称
 * @returns {string} 完整的图片URL
 */
export const getImageUrl = (imageName) => {
  // 这里可以根据实际项目需求修改图片路径
  // 如果使用本地图片，可以使用 Vite 的资源导入功能
  return new URL(`../assets/images/${imageName}`, import.meta.url).href
}