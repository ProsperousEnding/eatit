import { access } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import dishesData from './dishes.json'
import imageVariants from './image-variants.json'
import { getRecipeStepGroups } from '@/utils/recipe'

const getAllDishes = () => Object.entries(dishesData).flatMap(([group, value]) => {
  if (group === 'DISH_CHARACTERISTICS') return []
  if (Array.isArray(value)) return value
  return Object.values(value).flatMap(items => Array.isArray(items) ? items : [])
})

const requiredFields = [
  'id',
  'name',
  'image',
  'category',
  'taste',
  'cookingMethod',
  'difficulty',
  'cookingTime',
  'ingredients',
  'preparation',
  'steps',
  'source'
]

describe('dish data', () => {
  const dishes = getAllDishes()

  it('has complete and unique records', () => {
    expect(dishes).toHaveLength(152)
    expect(new Set(dishes.map(dish => dish.id)).size).toBe(dishes.length)
    expect(new Set(dishes.map(dish => dish.name)).size).toBe(dishes.length)
    expect(new Set(dishes.map(dish => dish.image)).size).toBe(dishes.length)

    dishes.forEach(dish => {
      requiredFields.forEach(field => expect(dish[field], `${dish.name}.${field}`).toBeTruthy())
      expect(Number.isInteger(dish.id), `${dish.name}.id`).toBe(true)
      expect(dish.id, `${dish.name}.id`).toBeGreaterThan(0)
      expect(dish.name, `${dish.id}.name`).toBe(dish.name.trim())
      expect(dish.image, `${dish.name}.image`).toMatch(/^\/images\/dishes\/htc-\d+\.jpg$/)
      expect(dish.cookingTime, `${dish.name}.cookingTime`).toMatch(/^\d+\s*分钟$/)
      expect(dish.ingredients.length, `${dish.name}.ingredients`).toBeGreaterThanOrEqual(2)
      expect(dish.preparation.length, `${dish.name}.preparation`).toBeGreaterThanOrEqual(2)
      expect(dish.steps.length, `${dish.name}.steps`).toBeGreaterThanOrEqual(2)
      expect(new Set(dish.ingredients).size, `${dish.name}.ingredients`).toBe(dish.ingredients.length)
      expect(new Set(dish.preparation).size, `${dish.name}.preparation`).toBe(dish.preparation.length)
      dish.ingredients.forEach(ingredient => expect(ingredient, dish.name).toBe(ingredient.trim()))
      dish.preparation.forEach(step => expect(step, dish.name).toBe(step.trim()))
      dish.steps.forEach(step => expect(step, dish.name).toBe(step.trim()))
      dish.steps.forEach(step => expect(step, dish.name).not.toMatch(/^\d+[.、]/))
      if (dish.nutrition) {
        for (const [field, value] of Object.entries(dish.nutrition)) {
          expect(['calories', 'protein', 'fat', 'carbs', 'fiber', 'vitamins'], dish.name).toContain(field)
          expect(value, `${dish.name}.nutrition.${field}`).toBeTruthy()
          expect(value, `${dish.name}.nutrition.${field}`).toBe(value.trim())
        }
      }
    })
  })

  it('keeps filter values aligned with the declared characteristics', () => {
    const characteristics = dishesData.DISH_CHARACTERISTICS
    const allowedValues = {
      category: Object.values(characteristics.CATEGORIES),
      taste: Object.values(characteristics.TASTES),
      cookingMethod: Object.values(characteristics.COOKING_METHODS),
      difficulty: Object.values(characteristics.DIFFICULTY)
    }

    dishes.forEach(dish => {
      Object.entries(allowedValues).forEach(([field, values]) => {
        expect(values, `${dish.name}.${field}: ${dish[field]}`).toContain(dish[field])
      })
    })
  })

  it('pins recipe provenance and records licensed image provenance', () => {
    const externalImages = new Map([
      ['简易红烧肉', { author: 'Kuruman from Tokyo, Japan', license: 'CC BY 2.0' }],
      ['葱烧海参', { author: 'Zheng Zhou', license: 'CC BY-SA 4.0' }],
      ['西红柿鸡蛋汤', { author: 'NNU-10-HanRongrong', license: 'CC BY 3.0' }],
      ['皮蛋瘦肉粥', { author: 'Peachyeung316', license: 'CC BY-SA 4.0' }],
      ['小米粥', { author: 'Dinkun Chen', license: 'CC BY-SA 4.0' }],
      ['蛋炒饭', { author: 'Tofu fighting', license: 'CC BY-SA 4.0' }],
      ['炸酱面', { author: 'N509FZ', license: 'CC BY-SA 4.0' }],
      ['热干面', { author: 'ZhengZhou', license: 'CC BY-SA 4.0' }],
      ['凉拌黄瓜', { author: 'John', license: 'CC BY 2.0' }]
    ])
    const additionalExternalImageNames = [
      '红烧鱼', '清蒸生蚝', '水煮鱼', '黄焖鸡', '可乐鸡翅', '辣椒炒肉', '糖醋里脊',
      '麻辣香锅', '孜然牛肉', '水煮肉片', '小酥肉', '腊八粥', '紫菜蛋花汤',
      '生汆丸子汤', '葱油拌面', '韭菜盒子', '手工水饺', '鲜肉烧卖', '扬州炒饭',
      '猪油拌饭', '红烧茄子', '皮蛋豆腐', '酸辣土豆丝', '蒜蓉西兰花',
      '上汤娃娃菜', '西红柿炒鸡蛋', '凉拌金针菇', '茶叶蛋', '水煮玉米', '牛奶燕麦',
      '香煎翘嘴鱼', '黑椒牛柳', '红烧猪蹄', '酱牛肉', '咖喱肥牛', '羊肉汤', '炒滑蛋',
      '凉拌鸡丝', '莴笋叶煎饼', '手抓饼', '煎饺', '燕麦鸡蛋饼'
    ]
    const expectedExternalImageNames = [...externalImages.keys(), ...additionalExternalImageNames]

    expect(new Set(dishes.map(dish => dish.source.revision))).toEqual(new Set([
      'c694a5c457d45e6e012ae6cd9a7724aab86e320b'
    ]))
    expect(dishes.filter(dish => dish.source.imageSource).map(dish => dish.name).sort())
      .toEqual(expectedExternalImageNames.sort())

    dishes.forEach(dish => {
      expect(dish.source.name, dish.name).toBe('HowToCook')
      expect(dish.source.repository, dish.name).toBe('Anduin2017/HowToCook')
      expect(dish.source.license, dish.name).toBe('Unlicense')
      expect(dish.source.recipePath, dish.name).toMatch(/^dishes\/.+\.md$/)
      expect(dish.source.url, dish.name).toContain(`/blob/${dish.source.revision}/`)

      if (dish.source.imageSource) {
        expect(dish.source.imageSource.name, dish.name).toBe('Wikimedia Commons')
        expect(dish.source.imageSource.imagePath, dish.name).toMatch(/^File:/)
        expect(dish.source.imageSource.author, dish.name).toBeTruthy()
        expect(dish.source.imageSource.license, dish.name).toBeTruthy()
        expect(dish.source.imageSource.url).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/)
        expect(dish.source.imageSource.licenseUrl).toMatch(/^https:\/\//)
        if (dish.source.imageSource.originalUrl) {
          expect(dish.source.imageSource.originalUrl).toMatch(/^https:\/\/upload\.wikimedia\.org\//)
        }
        expect(dish.source.imageSource.modifications).toBeTruthy()

        if (externalImages.has(dish.name)) {
          expect(dish.source.imageSource).toEqual(expect.objectContaining(externalImages.get(dish.name)))
        }
      } else {
        expect(dish.source.imagePath, dish.name).toMatch(/^dishes\/.+\.(?:jpe?g|png|webp)$/i)
        expect(dish.source.imageSource, dish.name).toBeUndefined()
      }
    })
  })

  it('keeps audited focus crops valid and restored recipes in the catalog', () => {
    const croppedDishes = dishes.filter(dish => dish.source.imageCrop)
    const restoredImageNames = [
      '荷兰豆炒腊肠',
      '香煎翘嘴鱼',
      '尖叫牛蛙',
      '淄博烧烤',
      '炒方便面',
      '蒜蓉炒芹菜',
      '葱油桂鱼',
      '西红柿鸡蛋挂面',
      '青椒土豆炒肉',
      '土豆炖排骨',
      '西红柿鸡蛋汤',
      '皮蛋瘦肉粥',
      '小米粥',
      '蛋炒饭',
      '炸酱面',
      '热干面',
      '凉拌黄瓜'
    ]

    expect(croppedDishes).toHaveLength(70)
    expect(dishes.map(dish => dish.name)).toEqual(expect.arrayContaining(restoredImageNames))
    expect(dishes.map(dish => dish.name)).toContain('简易红烧肉')

    croppedDishes.forEach(dish => {
      const [left, top, width, height] = dish.source.imageCrop
      expect(dish.source.imageCrop, dish.name).toHaveLength(4)
      expect([left, top, width, height].every(Number.isFinite), dish.name).toBe(true)
      expect(left, dish.name).toBeGreaterThanOrEqual(0)
      expect(top, dish.name).toBeGreaterThanOrEqual(0)
      expect(width, dish.name).toBeGreaterThan(0)
      expect(height, dish.name).toBeGreaterThan(0)
      expect(left + width, dish.name).toBeLessThanOrEqual(1)
      expect(top + height, dish.name).toBeLessThanOrEqual(1)
    })
  })

  it('references images that exist in public', async () => {
    await Promise.all(dishes.map(async dish => {
      const imagePath = fileURLToPath(new URL(`../../public${dish.image}`, import.meta.url))
      await expect(access(imagePath), dish.name).resolves.toBeUndefined()
    }))
  })

  it('keeps the responsive image manifest aligned with every dish image', () => {
    const imagePaths = dishes.map(dish => dish.image).sort()

    expect(Object.keys(imageVariants).sort()).toEqual(imagePaths)
    imagePaths.forEach(imagePath => {
      const variants = imageVariants[imagePath]
      expect(variants.length, imagePath).toBeGreaterThan(0)
      expect(variants.map(variant => variant.width), imagePath)
        .toEqual([...variants.map(variant => variant.width)].sort((a, b) => a - b))
      variants.forEach(variant => {
        expect(Number.isInteger(variant.width), variant.src).toBe(true)
        expect(variant.src, imagePath).toMatch(/^\/images\/dishes\/responsive\/[a-z0-9-]+\.webp$/)
      })
    })
  })

  it('separates sourced quantities from the original cooking instructions', () => {
    const quantityPattern = /(?:\d+(?:\.\d+)?|半|[一二两三四五六七八九十]+)\s*(?:克|kg|g|ml|mL|L|个|只|片|根|颗|块|斤|两|份|勺|袋|盒|瓶|条|支|张|把|朵)/i

    dishes.forEach(dish => {
      const { preparationSteps, cookingSteps } = getRecipeStepGroups(dish)
      expect(preparationSteps.length, dish.name).toBeGreaterThan(0)
      expect(cookingSteps.length, dish.name).toBeGreaterThan(0)
      expect(preparationSteps, dish.name).toEqual(dish.preparation)
      expect(cookingSteps, dish.name).toEqual(dish.steps)

      const preparationText = preparationSteps.join('')
      expect(preparationText, dish.name).toMatch(quantityPattern)
    })
  })

  it('keeps audited recipe variants, quantities, tools and intentional repeated actions', () => {
    const getDish = name => dishes.find(dish => dish.name === name)
    const scallionSeaCucumber = getDish('葱烧海参')
    const kungPaoChicken = getDish('宫保鸡丁')
    const twiceCookedPork = getDish('回锅肉')
    const stuffedPepper = getDish('青椒酿')
    const bonelessChickenFeet = getDish('无骨鸡爪')

    expect(scallionSeaCucumber.steps).toHaveLength(12)
    expect(scallionSeaCucumber.steps.join('')).toContain('葱白')
    expect(kungPaoChicken.methodVariant).toBe('简易版本')
    expect(twiceCookedPork.methodVariant).toBe('详细家常版')
    expect(twiceCookedPork.steps).toHaveLength(16)
    expect(twiceCookedPork.steps[0]).toContain('长柄夹或锅铲')
    expect(stuffedPepper.methodVariant).toBe('猪肉馅版本')
    expect(stuffedPepper.steps).toHaveLength(16)
    expect(stuffedPepper.steps.join('')).not.toContain('虾仁')
    expect(bonelessChickenFeet.cookingTime).toBe('135分钟')
    expect(bonelessChickenFeet.advanceTime).toContain('冷藏 6 小时')
    expect(bonelessChickenFeet.steps).toHaveLength(22)
    expect(getDish('白灼虾').preparation.join('')).toContain('*')
    expect(getDish('黄油煎虾').cookingTime).toBe('60分钟')
    expect(getDish('包菜炒鸡蛋粉丝').cookingTime).toBe('20分钟')
    expect(getDish('包菜炒鸡蛋粉丝').advanceTime).toContain('浸泡 1 小时')
    expect(getDish('猪皮冻').cookingTime).toBe('120分钟')
    expect(getDish('猪皮冻').advanceTime).toContain('浸泡 12 小时')
    expect(getDish('酱牛肉').steps.join('')).not.toContain('捞出牛腱子肉，捞出牛腱子肉')
  })

  it('keeps enriched household recipes measured and free of corrected unsafe guidance', () => {
    const getDish = name => dishes.find(dish => dish.name === name)
    const enrichedNames = [
      '葱油桂鱼',
      '西红柿鸡蛋挂面',
      '青椒土豆炒肉',
      '土豆炖排骨',
      '西红柿鸡蛋汤',
      '皮蛋瘦肉粥',
      '小米粥',
      '蛋炒饭',
      '炸酱面',
      '热干面',
      '凉拌黄瓜',
      '红烧鱼',
      '清蒸生蚝',
      '水煮鱼',
      '黄焖鸡',
      '可乐鸡翅',
      '辣椒炒肉',
      '糖醋里脊',
      '麻辣香锅',
      '孜然牛肉',
      '水煮肉片',
      '小酥肉',
      '腊八粥',
      '紫菜蛋花汤',
      '生汆丸子汤',
      '葱油拌面',
      '韭菜盒子',
      '手工水饺',
      '鲜肉烧卖',
      '扬州炒饭',
      '猪油拌饭',
      '红烧茄子',
      '皮蛋豆腐',
      '酸辣土豆丝',
      '蒜蓉西兰花',
      '西红柿炒鸡蛋',
      '凉拌金针菇',
      '咖喱肥牛',
      '茶叶蛋',
      '水煮玉米',
      '牛奶燕麦',
      '手抓饼',
      '煎饺',
      '燕麦鸡蛋饼'
    ]

    expect(dishes.map(dish => dish.name)).toEqual(expect.arrayContaining(enrichedNames))
    expect(getDish('西红柿鸡蛋汤').preparation).toContain('盐 3g')
    expect(getDish('蛋炒饭').preparation).toContain('白胡椒粉 0.5g')
    expect(getDish('葱油桂鱼').steps.join('')).toContain('蒸 8-10 分钟')
    expect(getDish('土豆炖排骨').ingredients).toContain('青椒（可选）')
    expect(getDish('炸酱面').cookingMethod).toBe('煮制')
    expect(getDish('水煮肉片').preparation).toContain('食用油 60ml')
    expect(getDish('腊八粥').preparation).toContain('清水 1600ml')
    expect(getDish('茶叶蛋').advanceTime).toContain('冷藏浸泡 8-12 小时')
    expect(getDish('牛奶燕麦').ingredients).not.toContain('鸡蛋')
    expect(getDish('咖喱肥牛').preparation).toContain('食用油 15ml')
    expect(getDish('蒜蓉西兰花').preparation).toContain('食用油 10ml')
    expect(getDish('手抓饼').preparation).toContain('冷水 40-50ml')
    expect(getDish('煎饺').preparation).toContain('清水 150ml')
    expect(getDish('燕麦鸡蛋饼').preparation).toContain('牛奶 80ml')

    const correctedText = enrichedNames
      .flatMap(name => [
        ...getDish(name).ingredients,
        ...getDish(name).preparation,
        ...getDish(name).steps
      ])
      .join('')
    expect(correctedText).not.toMatch(/室温自然解冻 5 小时|浸泡 2 天以上|复配食品增稠剂|菊花残|手掌隔大概 10cm|有白烟冒出|必须用热水|高并发|UI 点缀/)
  })

  it('provides a video tutorial entry for every dish without presenting rejected links as references', () => {
    const getReferences = dish => dish.videoTutorials.platforms.flatMap(platform => platform.references || [])
    const dishesWithReferences = dishes.filter(dish => getReferences(dish).length)
    const referenceCount = dishesWithReferences.reduce(
      (count, dish) => count + getReferences(dish).length,
      0
    )

    expect(dishesWithReferences.map(dish => dish.name).sort()).toEqual([
      '冬瓜酿肉',
      '柱候牛腩',
      '水煮肉片',
      '油焖大虾',
      '煮锅蒸米饭',
      '猪皮冻',
      '生汆丸子汤',
      '老式锅包肉',
      '腊八粥',
      '阳朔啤酒鱼'
    ].sort())
    expect(referenceCount).toBe(12)

    dishes.forEach(dish => {
      expect(dish.videoTutorials.platforms.map(platform => platform.key)).toEqual(['bilibili', 'douyin'])

      for (const platform of dish.videoTutorials.platforms) {
        const searchUrl = new URL(platform.searchUrl)
        const keyword = `${dish.name} 家常做法 教程`

        if (platform.key === 'bilibili') {
          expect(searchUrl.origin, dish.name).toBe('https://search.bilibili.com')
          expect(searchUrl.searchParams.get('keyword'), dish.name).toBe(keyword)
        } else {
          expect(searchUrl.origin, dish.name).toBe('https://www.douyin.com')
          expect(decodeURIComponent(searchUrl.pathname), dish.name).toBe(`/search/${keyword}`)
          expect(searchUrl.searchParams.get('type'), dish.name).toBe('video')
        }

        for (const tutorial of platform.references || []) {
          expect(tutorial.title, dish.name).toBeTruthy()
          expect(tutorial.platform, dish.name).toBe(platform.key)
          expect(tutorial.source, dish.name).toBe('HowToCook 上游参考')
          expect(tutorial.url, dish.name).toMatch(/^https:\/\/www\.bilibili\.com\/video\/BV[0-9A-Za-z]+$/)
          expect(tutorial.url, dish.name).not.toMatch(/BV1g541177cd|BV1t44y117D8/)
        }
      }
    })
  })

  it('contains only complete home-cooking records with local matched images', () => {
    dishes.forEach(dish => {
      expect(dish.steps.length, dish.name).toBeGreaterThan(1)
      expect(dish.preparation.length, dish.name).toBeGreaterThan(1)
      expect(dish.source.imagePath, dish.name).not.toMatch(/^https?:/)
      expect(dish.source.recipePath, dish.name).not.toBe(dish.source.imagePath)
    })
  })
})
