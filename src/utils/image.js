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

export const preloadResponsiveImage = (imageName, {
  sizes = '100vw',
  timeout = 8000
} = {}) => {
  if (typeof Image === 'undefined') return Promise.resolve(false)

  const imageData = getResponsiveImageData(imageName)

  return new Promise(resolve => {
    const image = new Image()
    let settled = false
    let loadStarted = false

    const finish = (loaded) => {
      if (settled) return
      settled = true
      clearTimeout(timeoutId)
      image.onload = null
      image.onerror = null
      resolve(loaded)
    }

    const handleLoad = async () => {
      if (loadStarted) return
      loadStarted = true

      if (typeof image.decode === 'function') {
        try {
          await image.decode()
        } catch {
          // An onload event with a valid width is still safe to display.
        }
      }
      finish(image.naturalWidth > 0)
    }

    const timeoutId = setTimeout(() => finish(false), timeout)
    image.onload = handleLoad
    image.onerror = () => finish(false)
    image.sizes = sizes
    image.fetchPriority = 'high'
    if (imageData.srcset) image.srcset = imageData.srcset
    image.src = imageData.fallback

    if (image.complete && image.naturalWidth > 0) void handleLoad()
  })
}
