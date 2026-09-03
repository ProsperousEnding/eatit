import { expect, test } from '@playwright/test'

test('search, detail and pairing flows work without browser errors', async ({ page }) => {
  const browserErrors = []
  page.on('pageerror', error => browserErrors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error') browserErrors.push(message.text())
  })

  await page.addInitScript(() => {
    localStorage.setItem('search_history', '{invalid json')
  })

  const responsiveImageRequest = page.waitForRequest(request =>
    request.url().includes('/images/dishes/responsive/') && request.url().endsWith('.webp')
  )

  await page.goto('./')
  await responsiveImageRequest
  await expect(page.locator('.recommend-item').first()).toHaveAttribute('href', /\/recipe\/\d+$/)
  const imageContainerBox = await page.locator('.recipe-image').first().boundingBox()
  const featuredImageBox = await page.locator('.recipe-media').boundingBox()
  expect(featuredImageBox?.width).toBeCloseTo(imageContainerBox?.width || 0, 0)
  expect(featuredImageBox?.height).toBeCloseTo(imageContainerBox?.height || 0, 0)
  await expect(page.locator('.recipe-media img')).toHaveCSS('object-fit', 'cover')
  await page.getByPlaceholder('搜索菜品、食材...').fill('鸡蛋')
  await page.getByPlaceholder('搜索菜品、食材...').press('Enter')
  await expect(page).toHaveURL(/\/search\?keyword=/)
  await expect(page.locator('.recipe-item').first()).toBeVisible()

  await page.locator('.recipe-item').first().click()
  await expect(page).toHaveURL(/\/recipe\/\d+/)
  await expect(page.locator('.recipe-detail h1')).toBeVisible()
  await expect(page.getByLabel('主要导航')).toBeVisible()
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /做法 - EatIt$/)

  await page.getByRole('button', { name: '查看搭配推荐' }).click()
  await expect(page.getByText('推荐搭配', { exact: true })).toBeVisible()
  const pairingNames = page.locator('.dish-content h3')
  const previousNames = await pairingNames.allTextContents()
  expect(previousNames.length).toBeGreaterThanOrEqual(2)
  await page.getByRole('button', { name: '换一批搭配' }).click()
  await expect.poll(async () => pairingNames.allTextContents()).not.toEqual(previousNames)
  for (const description of await page.locator('.pairing-desc').allTextContents()) {
    expect(description.trim()).not.toBe('')
  }

  expect(browserErrors).toEqual([])
})

test('restored recipe images render and keep their audited provenance', async ({ page }) => {
  const restoredRecipes = [
    { id: 2004, name: '葱烧海参', credit: 'Zheng Zhou' },
    { id: 2024, name: '香煎翘嘴鱼' },
    { id: 2073, name: '荷兰豆炒腊肠' },
    { id: 2087, name: '尖叫牛蛙' },
    { id: 2162, name: '淄博烧烤' },
    { id: 2187, name: '炒方便面' },
    { id: 2295, name: '蒜蓉炒芹菜' }
  ]

  for (const recipe of restoredRecipes) {
    await page.goto(`recipe/${recipe.id}`)
    await expect(page.locator('.recipe-detail h1')).toHaveText(recipe.name)
    await expect.poll(() => page.locator('.main-info .recipe-image img').evaluate(image => image.naturalWidth))
      .toBeGreaterThan(0)

    if (recipe.credit) {
      await expect(page.getByRole('link', { name: recipe.credit })).toHaveAttribute(
        'href',
        /commons\.wikimedia\.org/
      )
    }
  }
})

test('video tutorial links expose only the two platform choices', async ({ page }) => {
  await page.goto('recipe/2028')
  await expect(page.getByRole('heading', { name: '视频教学' })).toBeVisible()
  await expect(page.locator('.video-platform-link')).toHaveCount(2)
  await expect(page.getByRole('link', { name: '哔哩哔哩', exact: true })).toHaveAttribute(
    'href',
    /search\.bilibili\.com\/all\?keyword=/
  )
  await expect(page.getByRole('link', { name: '抖音', exact: true })).toHaveAttribute(
    'href',
    /www\.douyin\.com\/search\/.+\?type=video/
  )
  await expect(page.locator('.video-tutorials')).not.toContainText('搜索')
  await expect(page.locator('.video-tutorials')).not.toContainText('教程')
})

test('zero results and invalid categories keep useful navigation', async ({ page }) => {
  await page.goto('search?keyword=不存在的菜品')
  await expect(page.locator('.filter-container')).toBeVisible()
  await expect(page.getByText('没有找到相关食谱')).toBeVisible()
  await expect(page.getByRole('link', { name: '返回 EatIt 首页' })).toBeVisible()

  await page.goto('category?id=999')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('分类不存在')
  await expect(page.getByText('分类不存在').last()).toBeVisible()
  await expect(page.locator('.recipe-card')).toHaveCount(0)

  await page.goto('missing/page')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('页面不存在')
  await expect(page.getByRole('link', { name: '返回首页' }).last()).toBeVisible()

  await page.goto('recipe/999999')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('页面不存在')
  await expect(page).toHaveURL(/\/recipe\/999999$/)
})

test('custom-domain route handoff normalizes the redirected path', async ({ page }) => {
  await page.goto('?p=%2F%2Frecipe%2F2068')
  await expect(page).toHaveURL(/\/recipe\/2068$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('宫保鸡丁')
})

test('search suggestions support keyboard dismissal and outside clicks', async ({ page }) => {
  await page.goto('search')
  const searchInput = page.getByRole('combobox', { name: '搜索食谱' })

  await searchInput.fill('鸡')
  await expect(searchInput).toHaveAttribute('aria-expanded', 'true')
  await expect(page.getByRole('listbox', { name: '搜索建议' })).toBeVisible()
  await searchInput.press('ArrowUp')
  await expect(page.getByRole('option').last()).toHaveAttribute('aria-selected', 'true')
  await searchInput.press('ArrowDown')
  await expect(page.getByRole('option').first()).toHaveAttribute('aria-selected', 'true')
  await searchInput.press('Enter')
  await expect(page).toHaveURL(/\/search\?keyword=/)

  await searchInput.fill('鸡')
  await searchInput.press('Escape')
  await expect(searchInput).toHaveAttribute('aria-expanded', 'false')

  await searchInput.fill('鸡蛋')
  await expect(page.getByRole('listbox', { name: '搜索建议' })).toBeVisible()
  await page.locator('.app-navigation').click({ position: { x: 600, y: 28 } })
  await expect(page.getByRole('listbox', { name: '搜索建议' })).toHaveCount(0)
})

test('tablet widths keep navigation and content inside the viewport', async ({ page }) => {
  for (const width of [768, 1024]) {
    await page.setViewportSize({ width, height: 900 })
    for (const path of ['./', 'search?keyword=鸡蛋', 'category?id=4', 'recipe/2068']) {
      await page.goto(path)
      const dimensions = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        content: document.documentElement.scrollWidth
      }))
      expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport)
    }
  }
})

test('desktop pages use the available width with stable responsive grids', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })

  await page.goto('./')
  await expect(page.locator('.recommend-item')).toHaveCount(6)

  const homeSearchInput = await page.locator('.search-input').boundingBox()
  const homeSearchButton = await page.getByRole('button', { name: '搜索菜谱' }).boundingBox()
  expect(homeSearchInput?.height).toBe(48)
  expect(homeSearchButton?.height).toBe(48)

  const shortcutBoxes = await page.locator('.shortcut-item').evaluateAll(items =>
    items.map(item => item.getBoundingClientRect().toJSON())
  )
  expect(shortcutBoxes).toHaveLength(5)
  expect(Math.abs(shortcutBoxes[0].y - shortcutBoxes.at(-1).y)).toBeLessThan(2)

  const recommendBoxes = await page.locator('.recommend-item').evaluateAll(items =>
    items.map(item => item.getBoundingClientRect().toJSON())
  )
  expect(Math.abs(recommendBoxes[0].y - recommendBoxes[2].y)).toBeLessThan(2)
  expect(recommendBoxes[3].y).toBeGreaterThan(recommendBoxes[0].y)
  await expect(page.locator('.today-recommends .section-title')).toBeInViewport()

  const featuredImage = await page.locator('.recipe-image').first().boundingBox()
  const featuredInfo = await page.locator('.recipe-card .recipe-info').boundingBox()
  expect((featuredImage?.x || 0) + (featuredImage?.width || 0)).toBeLessThanOrEqual((featuredInfo?.x || 0) + 1)

  await page.goto('search?keyword=鸡')
  const resultSearchInput = await page.locator('.search-input').boundingBox()
  const resultSearchButton = await page.getByRole('button', { name: '搜索', exact: true }).boundingBox()
  expect(resultSearchInput?.height).toBe(48)
  expect(resultSearchButton?.height).toBe(48)
  const searchBoxes = await page.locator('.recipe-item').evaluateAll(items =>
    items.map(item => item.getBoundingClientRect().toJSON())
  )
  expect(searchBoxes.length).toBeGreaterThanOrEqual(4)
  expect(Math.abs(searchBoxes[0].y - searchBoxes[1].y)).toBeLessThan(2)
  expect(searchBoxes[2].y).toBeGreaterThan(searchBoxes[0].y)

  await page.goto('category?id=4')
  const categoryBoxes = await page.locator('.recipe-card').evaluateAll(items =>
    items.map(item => item.getBoundingClientRect().toJSON())
  )
  expect(categoryBoxes.length).toBeGreaterThan(4)
  expect(Math.abs(categoryBoxes[0].y - categoryBoxes[3].y)).toBeLessThan(2)
  expect(categoryBoxes[4].y).toBeGreaterThan(categoryBoxes[0].y)
  const lastCategoryCard = page.locator('.recipe-card').last()
  await lastCategoryCard.scrollIntoViewIfNeeded()
  await expect.poll(() => lastCategoryCard.locator('img').evaluate(image => image.naturalWidth)).toBeGreaterThan(0)

  await page.goto('recipe/2076')
  await expect(page.locator('.recipe-detail h1')).toHaveText('简易红烧肉')
  await expect.poll(() => page.locator('.main-info .recipe-image img').evaluate(image => image.naturalWidth))
    .toBeGreaterThan(0)
  await expect(page.getByRole('link', { name: 'Kuruman from Tokyo, Japan' })).toHaveAttribute(
    'href',
    /commons\.wikimedia\.org/
  )
  await expect(page.getByRole('link', { name: 'CC BY 2.0' })).toHaveAttribute(
    'href',
    'https://creativecommons.org/licenses/by/2.0/'
  )

  await page.goto('recipe/2068')
  await expect(page.locator('.recipe-detail h1')).toHaveText('宫保鸡丁')
  await expect(page.getByLabel('菜品信息')).toBeVisible()
  await expect(page.getByRole('heading', { name: '食材准备' })).toBeVisible()
  await expect(page.locator('.preparation-item')).toHaveCount(20)
  await expect(page.locator('.preparation-list')).toContainText('手枪腿（或者鸡胸脯肉）：1 支（约 350g）')
  await expect(page.locator('.steps-list .step-item').first()).toContainText('手枪腿用剪刀去骨')
  await expect(page.getByRole('heading', { name: '菜谱来源' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'HowToCook', exact: true })).toHaveAttribute('href', /github\.com\/Anduin2017\/HowToCook/)
  const detailImage = await page.locator('.main-info .recipe-image').boundingBox()
  const detailTitle = await page.locator('.main-info h1').boundingBox()
  expect((detailImage?.x || 0) + (detailImage?.width || 0)).toBeLessThan(detailTitle?.x || 0)

  await page.getByRole('button', { name: '查看搭配推荐' }).click()
  const sourceRecipeUrl = page.url()
  await page.locator('.dish-item').first().click()
  await expect(page).not.toHaveURL(sourceRecipeUrl)
  await page.goBack()
  await expect(page).toHaveURL(sourceRecipeUrl)
  await page.getByRole('button', { name: '查看搭配推荐' }).click()
  const dialogBox = await page.locator('.el-dialog').boundingBox()
  expect(dialogBox?.width || 0).toBeLessThanOrEqual(980)
  const pairingBoxes = await page.locator('.dish-item').evaluateAll(items =>
    items.map(item => item.getBoundingClientRect().toJSON())
  )
  expect(pairingBoxes.length).toBeGreaterThanOrEqual(2)
  expect(Math.abs(pairingBoxes[0].y - pairingBoxes[1].y)).toBeLessThan(2)
})

test('mobile pages remain single-column and do not overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })

  for (const [path, selector] of [
    ['./', '.home'],
    ['search?keyword=鸡蛋', '.search'],
    ['category?id=4', '.category-list'],
    ['recipe/2068', '.recipe-detail']
  ]) {
    await page.goto(path)
    await expect(page.locator(selector)).toBeVisible()
    const viewportWidth = await page.evaluate(() => document.documentElement.clientWidth)
    const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    expect(documentWidth).toBeLessThanOrEqual(viewportWidth)
  }

  const detailImage = await page.locator('.main-info .recipe-image').boundingBox()
  const detailTitle = await page.locator('.main-info h1').boundingBox()
  expect(detailTitle?.y || 0).toBeGreaterThanOrEqual((detailImage?.y || 0) + (detailImage?.height || 0) - 1)
})
