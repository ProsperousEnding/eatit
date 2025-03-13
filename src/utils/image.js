/**
 * 获取图片URL
 * @param {string} imageName - 图片名称
 * @returns {string} 完整的图片URL
 */
export const getImageUrl = (imageName) => {
  // 图片存放在public目录下，直接使用相对于public的路径
  const base = import.meta.env.VITE_BASE_URL || '/'
  return `${base}images/dishes/${imageName}`
}