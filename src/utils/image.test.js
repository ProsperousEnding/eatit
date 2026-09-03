// @vitest-environment happy-dom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { getResponsiveImageData, preloadResponsiveImage } from './image'

describe('responsive image utilities', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('preloads and decodes the responsive candidate before resolving', async () => {
    let createdImage

    class MockImage {
      constructor() {
        createdImage = this
        this.complete = false
        this.naturalWidth = 0
        this.decode = vi.fn().mockResolvedValue()
      }

      set src(value) {
        this.source = value
        this.complete = true
        this.naturalWidth = 720
        queueMicrotask(() => this.onload?.())
      }
    }

    vi.stubGlobal('Image', MockImage)
    const imageName = '/images/dishes/htc-2001.jpg'
    const imageData = getResponsiveImageData(imageName)

    await expect(preloadResponsiveImage(imageName, { sizes: '800px' })).resolves.toBe(true)
    expect(createdImage.source).toBe(imageData.fallback)
    expect(createdImage.srcset).toBe(imageData.srcset)
    expect(createdImage.sizes).toBe('800px')
    expect(createdImage.fetchPriority).toBe('high')
    expect(createdImage.decode).toHaveBeenCalledOnce()
  })
})
