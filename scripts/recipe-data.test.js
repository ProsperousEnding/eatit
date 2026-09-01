import { describe, expect, it } from 'vitest'
import { createClientRecipeData } from './recipe-data.mjs'

const sourceData = {
  DISH_CHARACTERISTICS: { CATEGORIES: { ONE: '荤菜' } },
  HOWTOCOOK_DISHES: [{
    id: 1,
    name: '测试菜',
    image: '/images/dishes/test.jpg',
    category: '荤菜',
    taste: '咸鲜',
    cookingMethod: '炒制',
    difficulty: '简单',
    cookingTime: '10分钟',
    servings: '2 人份',
    ingredients: ['鸡蛋'],
    preparation: ['鸡蛋 2 个'],
    steps: ['把鸡蛋炒熟'],
    nutrition: { calories: '100 大卡' },
    videoTutorials: {
      platforms: [{
        key: 'bilibili',
        name: '哔哩哔哩',
        searchUrl: 'https://search.bilibili.com/all?keyword=test',
        references: [{ title: '审计记录', url: 'https://example.com' }]
      }]
    },
    source: {
      name: 'HowToCook',
      repository: 'Anduin2017/HowToCook',
      revision: 'abc',
      recipePath: 'private-audit-path',
      url: 'https://example.com/recipe'
    }
  }]
}

describe('client recipe data', () => {
  it('separates list, search and detail fields', () => {
    const result = createClientRecipeData(sourceData)
    expect(result.index.RECIPES[0]).not.toHaveProperty('steps')
    expect(result.index.RECIPES[0]).not.toHaveProperty('searchText')
    expect(result.search[1]).toBe('把鸡蛋炒熟')
    expect(result.details[1].steps).toEqual(['把鸡蛋炒熟'])
  })

  it('does not ship audit-only source and video fields', () => {
    const detail = createClientRecipeData(sourceData).details[1]
    expect(detail.source).not.toHaveProperty('revision')
    expect(detail.source).not.toHaveProperty('recipePath')
    expect(detail.videoTutorials.platforms[0]).not.toHaveProperty('references')
  })
})
