import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useRecipeStore } from './recipe'

describe('recipe store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('loads every dish from nested objects and top-level arrays', () => {
    const store = useRecipeStore()
    const dishes = store.getAllDishesArray()

    expect(dishes).toHaveLength(120)
    expect(new Set(dishes.map(dish => dish.id)).size).toBe(120)
    expect(new Set(dishes.map(dish => dish.category))).toEqual(new Set([
      '素菜', '荤菜', '水产', '主食', '汤粥'
    ]))
  })

  it('searches imported dishes and source categories', async () => {
    const store = useRecipeStore()

    const dishResults = await store.searchRecipes({ keyword: '宫保鸡丁' })
    const stapleResults = await store.searchRecipes({ category: '主食' })

    expect(dishResults.map(dish => dish.name)).toContain('宫保鸡丁')
    expect(stapleResults).toHaveLength(11)
  })

  it('normalizes search values and treats whitespace as an empty query', async () => {
    const store = useRecipeStore()

    await expect(store.searchRecipes({ keyword: '   ' })).resolves.toEqual([])
    await expect(store.searchRecipes({
      keyword: '  鸡蛋  ',
      category: '  素菜 '
    })).resolves.toEqual(expect.arrayContaining([
      expect.objectContaining({ name: '西葫芦炒鸡蛋' })
    ]))
  })

  it('returns diverse recommendations and avoids the two previous batches', async () => {
    const store = useRecipeStore()
    const featuredDish = await store.getHomePageRecipe()
    const firstBatch = await store.getHomePageRecommends()
    const secondBatch = await store.getHomePageRecommends(true)
    const thirdBatch = await store.getHomePageRecommends(true)

    expect(firstBatch).toHaveLength(6)
    expect(firstBatch.some(dish => dish.id === featuredDish.id)).toBe(false)
    expect(new Set(firstBatch.map(dish => dish.id)).size).toBe(6)
    expect(new Set(firstBatch.map(dish => dish.category)).size).toBeGreaterThanOrEqual(5)
    expect(secondBatch).toHaveLength(6)
    expect(new Set(secondBatch.map(dish => dish.id)).size).toBe(6)
    expect(secondBatch.some(dish => firstBatch.some(previous => previous.id === dish.id))).toBe(false)
    expect(new Set(secondBatch.map(dish => dish.category)).size).toBeGreaterThanOrEqual(5)
    expect(new Set(secondBatch.map(dish => dish.taste)).size).toBeGreaterThanOrEqual(3)
    expect(new Set(secondBatch.map(dish => dish.cookingMethod)).size).toBeGreaterThanOrEqual(3)
    expect(thirdBatch).toHaveLength(6)
    expect(thirdBatch.some(dish => [...firstBatch, ...secondBatch].some(previous => previous.id === dish.id))).toBe(false)
  })

  it('stages a new featured recipe without exposing it before commit', async () => {
    const store = useRecipeStore()
    const currentRecipe = await store.getHomePageRecipe()
    const currentHistory = [...store.recentHomeFeatureIds]
    const nextRecipe = store.getNextHomePageRecipe()

    expect(nextRecipe.id).not.toBe(currentRecipe.id)
    expect(store.homePageRecipe.id).toBe(currentRecipe.id)
    expect(store.recentHomeFeatureIds).toEqual(currentHistory)

    store.setHomePageRecipe(nextRecipe)

    expect(store.homePageRecipe.id).toBe(nextRecipe.id)
    expect(store.recentHomeFeatureIds.at(-1)).toBe(nextRecipe.id)
  })

  it('builds complementary meal pairings with truthful reasons', async () => {
    const store = useRecipeStore()
    const currentDish = await store.getRecipeById(2068)

    const pairings = await store.getRecommendedPairings(2068)
    const refreshedPairings = await store.getRecommendedPairings(2068, pairings.map(pairing => pairing.id))
    const thirdPairings = await store.getRecommendedPairings(2068, refreshedPairings.map(pairing => pairing.id))

    expect(pairings).toHaveLength(2)
    expect(pairings.every(pairing => pairing.id !== 2068)).toBe(true)
    expect(pairings.every(pairing => pairing.pairingReason?.trim())).toBe(true)
    expect(pairings.map(pairing => pairing.category)).toContain('素菜')
    expect(pairings.some(pairing => ['汤粥', '主食'].includes(pairing.category))).toBe(true)
    expect(new Set(pairings.map(pairing => pairing.category)).size).toBe(2)
    for (const pairing of pairings) {
      if (pairing.pairingReason.includes('做法')) {
        expect(pairing.cookingMethod).not.toBe(currentDish.cookingMethod)
      }
    }
    expect(refreshedPairings).toHaveLength(2)
    expect(refreshedPairings.some(pairing => pairings.some(previous => previous.id === pairing.id))).toBe(false)
    expect(thirdPairings.some(pairing => [...pairings, ...refreshedPairings].some(previous => previous.id === pairing.id))).toBe(false)
  })

  it.each([
    { id: 2001, primary: ['素菜'], secondary: ['汤粥', '主食'] },
    { id: 2254, primary: ['荤菜', '水产'], secondary: ['汤粥', '主食'] }
  ])('uses meal roles when pairing recipe $id', async ({ id, primary, secondary }) => {
    const store = useRecipeStore()
    const pairings = await store.getRecommendedPairings(id)

    expect(pairings.some(pairing => primary.includes(pairing.category))).toBe(true)
    expect(pairings.some(pairing => secondary.includes(pairing.category))).toBe(true)
    expect(new Set(pairings.map(pairing => pairing.category)).size).toBe(2)
  })

  it('keeps meal-role composition valid for every recipe', async () => {
    const store = useRecipeStore()
    const targetGroupsByCategory = {
      '荤菜': [['素菜'], ['汤粥', '主食']],
      '水产': [['素菜'], ['汤粥', '主食']],
      '素菜': [['荤菜', '水产'], ['汤粥', '主食']],
      '主食': [['荤菜', '水产'], ['素菜', '汤粥']],
      '汤粥': [['荤菜', '水产'], ['素菜', '主食']]
    }

    for (const recipe of store.getAllDishesArray()) {
      const pairings = await store.getRecommendedPairings(recipe.id)
      const targetGroups = targetGroupsByCategory[recipe.category]

      expect(pairings).toHaveLength(2)
      expect(new Set(pairings.map(pairing => pairing.id)).size).toBe(2)
      expect(pairings.every(pairing => pairing.id !== recipe.id)).toBe(true)
      expect(targetGroups.every(group => pairings.some(pairing => group.includes(pairing.category)))).toBe(true)
      for (const pairing of pairings) {
        if (pairing.pairingReason.includes('做法不同')) {
          expect(pairing.cookingMethod).not.toBe(recipe.cookingMethod)
        }
      }
    }
  })

  it('clears stale pairing state when the recipe does not exist', async () => {
    const store = useRecipeStore()
    await store.getRecommendedPairings(2068)

    await expect(store.getRecommendedPairings(999999)).resolves.toEqual([])
    expect(store.recommendedPairings).toEqual([])
  })
})
