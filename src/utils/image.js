/**
 * 处理图片路径，添加基础路径
 * @param {string} imagePath - 原始图片路径
 * @returns {string} - 处理后的图片路径
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/eatit/images/default-food.jpg'
  
  // 如果已经是完整的URL，直接返回
  if (imagePath.startsWith('http')) {
    return imagePath
  }
  
  // 添加基础路径
  return `/eatit${imagePath}`
}