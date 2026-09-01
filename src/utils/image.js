import imageVariants from '@/data/image-variants.json'

/**
 * 获取图片URL
 * @param {string} imageName - 图片名称
 * @returns {string} 完整的图片URL
 */
export const getImageUrl = (imageName) => {
  const base = import.meta.env.BASE_URL || '/'
  const normalizedBase = base.endsWith('/') ? base : `${base}/`
  const normalizedImageName = imageName.replace(/^\/+/, '')

  return `${normalizedBase}${normalizedImageName}`
}

export const getResponsiveImageData = (imageName) => {
  const variants = imageVariants[imageName] || []

  return {
    fallback: getImageUrl(imageName),
    srcset: variants
      .map(variant => `${getImageUrl(variant.src)} ${variant.width}w`)
      .join(', ')
  }
}
