import { defineStore } from 'pinia'
import recipeIndexData from '../data/client/recipe-index.json'

const recipeDetailModules = import.meta.glob('../data/client/recipes/*.json', { import: 'default' })
const recipeDetailCache = new Map()
let recipeSearchDataPromise

const loadRecipeSearchData = () => {
  recipeSearchDataPromise ||= import('../data/client/recipe-search.json').then(module => module.default)
  return recipeSearchDataPromise
}

const shuffle = (items) => {
  const result = [...items]

  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    const currentItem = result[index]
    result[index] = result[randomIndex]
    result[randomIndex] = currentItem
  }

  return result
}

const allDishesList = recipeIndexData.RECIPES
const HOME_FEATURE_HISTORY_LIMIT = 6
const HOME_RECOMMENDATION_HISTORY_LIMIT = 12
const PAIRING_HISTORY_LIMIT = 6
const PAIRING_CATEGORY_TARGETS = {
  '荤菜': [['素菜'], ['汤粥', '主食']],
  '水产': [['素菜'], ['汤粥', '主食']],
  '素菜': [['荤菜', '水产'], ['汤粥', '主食']],
  '主食': [['荤菜', '水产'], ['素菜', '汤粥']],
  '汤粥': [['荤菜', '水产'], ['素菜', '主食']]
}

const normalizeSearchValue = (value) => String(value ?? '').trim().slice(0, 80)

const appendRecentIds = (currentIds, newIds, limit) => [
  ...currentIds.filter(id => !newIds.includes(id)),
  ...newIds
].slice(-limit)

const pickHighestScored = (dishes, getScore) => shuffle(dishes)
  .sort((first, second) => getScore(second) - getScore(first))[0]

const getDiversityScore = (dish, selectedDishes) => {
  const selectedTastes = new Set(selectedDishes.map(item => item.taste))
  const selectedMethods = new Set(selectedDishes.map(item => item.cookingMethod))

  return (selectedTastes.has(dish.taste) ? 0 : 2) +
    (selectedMethods.has(dish.cookingMethod) ? 0 : 2)
}

const getPairingScore = (currentDish, pairing, selectedPairings, targetCategories) => {
  const selectedCategories = new Set(selectedPairings.map(item => item.category))
  const selectedTastes = new Set(selectedPairings.map(item => item.taste))
  const selectedMethods = new Set(selectedPairings.map(item => item.cookingMethod))

  return (targetCategories.includes(pairing.category) ? 8 : 0) +
    (pairing.category !== currentDish.category ? 2 : 0) +
    (pairing.cookingMethod !== currentDish.cookingMethod ? 2 : 0) +
    (pairing.taste !== currentDish.taste ? 1 : 0) +
    (selectedCategories.has(pairing.category) ? 0 : 5) +
    (selectedMethods.has(pairing.cookingMethod) ? 0 : 2) +
    (selectedTastes.has(pairing.taste) ? 0 : 1)
}

const getPairingReason = (currentDish, pairing) => {
  const categoryReasons = {
    '素菜': `补充一道素菜，与${currentDish.name}组成更丰富的一餐。`,
    '荤菜': `补充一道荤菜，与${currentDish.name}搭配成餐。`,
    '水产': `补充一道水产，与${currentDish.name}搭配成餐。`,
    '主食': `补充一道主食，适合与${currentDish.name}一同上桌。`,
    '汤粥': `搭配一道汤粥，让${currentDish.name}所在的一餐更完整。`
  }
  const categoryReason = pairing.category === currentDish.category
    ? `${pairing.category}中的另一种选择，适合与${currentDish.name}搭配。`
    : categoryReasons[pairing.category]

  if (['麻辣', '香辣', '酸辣'].includes(currentDish.taste) && pairing.taste === '清淡') {
    return `${categoryReason}清淡口味还能调节当前菜的浓郁味道。`
  }

  if (pairing.cookingMethod !== currentDish.cookingMethod) {
    return `${categoryReason}采用${pairing.cookingMethod}，与当前菜的${currentDish.cookingMethod}做法不同。`
  }

  if (pairing.taste !== currentDish.taste) {
    return `${categoryReason}${pairing.taste}口味与当前菜形成变化。`
  }

  return categoryReason
}

export const useRecipeStore = defineStore('recipe', {
  state: () => ({
    recipes: [],
    currentRecipe: null,
    recommendedPairings: [],
    allDishes: recipeIndexData,
    homePageRecipe: null, // 首页随机推荐的菜品
    homePageRecommends: [], // 首页今日推荐列表
    recentHomeFeatureIds: [],
    recentHomeRecommendationIds: [],
    recentPairingIdsByRecipe: {}
  }),

  actions: {
    /**
     * 选出下一道首页推荐，但暂不更新页面状态
     */
    getNextHomePageRecipe() {
      const allDishesArray = this.getAllDishesArray()
      if (!allDishesArray || allDishesArray.length === 0) {
        throw new Error('没有可用的菜品数据')
      }

      const excludedIds = new Set([
        this.homePageRecipe?.id,
        ...this.homePageRecommends.map(dish => dish.id),
        ...this.recentHomeFeatureIds
      ].filter(Boolean))
      const availableDishes = allDishesArray.filter(dish => !excludedIds.has(dish.id))
      const candidates = availableDishes.length > 0 ? availableDishes : allDishesArray
      const categories = shuffle([...new Set(candidates.map(dish => dish.category))])
      const selectedCategory = categories[0]
      const recipe = shuffle(candidates.filter(dish => dish.category === selectedCategory))[0]

      if (!recipe?.id) throw new Error('获取菜品数据失败')
      return recipe
    },

    /**
     * 将已经准备好的菜品提交为首页推荐
     */
    setHomePageRecipe(recipe) {
      if (!recipe?.id) throw new Error('获取菜品数据失败')

      this.homePageRecipe = recipe
      this.recentHomeFeatureIds = appendRecentIds(
        this.recentHomeFeatureIds,
        [recipe.id],
        HOME_FEATURE_HISTORY_LIMIT
      )
      return this.homePageRecipe
    },

    /**
     * 获取并立即提交首页随机推荐
     */
    async getHomePageRecipe() {
      try {
        return this.setHomePageRecipe(this.getNextHomePageRecipe())
      } catch (error) {
        console.error('获取首页推荐失败:', error)
        throw error
      }
    },

    /**
     * 获取首页今日推荐
     */
    async getHomePageRecommends(forceRefresh = false) {
      if (this.homePageRecommends.length === 0 || forceRefresh) {
        const excludedIds = [
          this.homePageRecipe?.id,
          ...this.recentHomeRecommendationIds
        ].filter(Boolean)
        this.homePageRecommends = await this.getTodayRecommends(excludedIds)
        this.recentHomeRecommendationIds = appendRecentIds(
          this.recentHomeRecommendationIds,
          this.homePageRecommends.map(dish => dish.id),
          HOME_RECOMMENDATION_HISTORY_LIMIT
        )
      }
      return this.homePageRecommends
    },

    /**
     * 获取随机推荐的食谱
     * @returns {Object} 随机选择的菜品
     */
    async getRandomRecipe() {
      const allDishesArray = this.getAllDishesArray()
      if (allDishesArray.length === 0) {
        this.currentRecipe = null
        throw new Error('没有可用的菜品数据')
      }

      const randomIndex = Math.floor(Math.random() * allDishesArray.length)
      this.currentRecipe = allDishesArray[randomIndex]

      return this.currentRecipe
    },

    /**
     * 获取所有菜品数组
     * @returns {Array} 所有菜品的数组
     */
    getAllDishesArray() {
      return allDishesList
    },

    /**
     * 获取今日推荐菜品列表
     * @returns {Array} 推荐的菜品列表
     */
    async getTodayRecommends(excludedIds = []) {
      const allDishesArray = this.getAllDishesArray()
      const excludedIdSet = new Set(excludedIds)
      const availableDishes = allDishesArray.filter(dish => !excludedIdSet.has(dish.id))
      const candidateDishes = availableDishes.length > 0 ? availableDishes : allDishesArray

      const recommendCount = Math.min(6, candidateDishes.length)
      const recommendations = []
      const groupedDishes = shuffle(candidateDishes).reduce((groups, dish) => {
        if (!groups[dish.category]) groups[dish.category] = []
        groups[dish.category].push(dish)
        return groups
      }, {})
      const dishesByCategory = Object.values(groupedDishes)
        .map(categoryDishes => shuffle(categoryDishes))

      while (recommendations.length < recommendCount && dishesByCategory.length > 0) {
        for (const categoryDishes of shuffle(dishesByCategory)) {
          const dish = pickHighestScored(
            categoryDishes,
            candidate => getDiversityScore(candidate, recommendations)
          )
          if (dish) {
            recommendations.push(dish)
            categoryDishes.splice(categoryDishes.findIndex(item => item.id === dish.id), 1)
          }
          if (recommendations.length === recommendCount) break
        }

        for (let index = dishesByCategory.length - 1; index >= 0; index -= 1) {
          if (dishesByCategory[index].length === 0) dishesByCategory.splice(index, 1)
        }
      }

      return recommendations
    },

    /**
     * 根据当前菜品特点，推荐搭配的菜品
     * @param {number} recipeId - 当前菜品ID
     */
    async getRecommendedPairings(recipeId, excludedIds = []) {
      const allDishes = this.getAllDishesArray()
      const currentDish = allDishes.find(dish => dish.id === recipeId)
      if (!currentDish) {
        this.recommendedPairings = []
        return this.recommendedPairings
      }

      const pairings = []
      const recentIds = this.recentPairingIdsByRecipe[recipeId] || []
      const excludedIdSet = new Set([...excludedIds, ...recentIds])
      const addPairing = (dish) => {
        if (!dish || dish.id === currentDish.id || excludedIdSet.has(dish.id) || pairings.some(item => item.id === dish.id)) return
        pairings.push({
          ...dish,
          pairingReason: getPairingReason(currentDish, dish)
        })
      }

      const availableCandidates = allDishes.filter(dish =>
        dish.id !== currentDish.id && !excludedIdSet.has(dish.id)
      )
      const categoryTargets = PAIRING_CATEGORY_TARGETS[currentDish.category] || [[], []]

      for (const targetCategories of categoryTargets) {
        const remainingCandidates = availableCandidates.filter(
          dish => !pairings.some(pairing => pairing.id === dish.id)
        )
        const targetCandidates = remainingCandidates.filter(dish => targetCategories.includes(dish.category))
        const candidates = targetCandidates.length > 0 ? targetCandidates : remainingCandidates
        const pairing = pickHighestScored(
          candidates,
          dish => getPairingScore(currentDish, dish, pairings, targetCategories)
        )
        addPairing(pairing)
      }

      // 确保至少有两个推荐
      if (pairings.length < 2) {
        const fallbackDishes = allDishes.filter(
          dish => dish.id !== currentDish.id &&
            !excludedIdSet.has(dish.id) &&
            !pairings.find(p => p.id === dish.id)
        )

        while (pairings.length < 2 && fallbackDishes.length > 0) {
          const randomIndex = Math.floor(Math.random() * fallbackDishes.length)
          addPairing(fallbackDishes[randomIndex])
          fallbackDishes.splice(randomIndex, 1)
        }
      }

      this.recommendedPairings = pairings
      this.recentPairingIdsByRecipe = {
        ...this.recentPairingIdsByRecipe,
        [recipeId]: appendRecentIds(
          recentIds,
          pairings.map(pairing => pairing.id),
          PAIRING_HISTORY_LIMIT
        )
      }
      return this.recommendedPairings
    },

    /**
     * 根据关键词搜索食谱
     * @param {Object} params - 搜索参数
     * @param {string} params.keyword - 搜索关键词
     * @param {string} [params.category] - 菜品类别
     * @param {string} [params.taste] - 口味
     * @param {string} [params.difficulty] - 难度
     */
    async searchRecipes(params) {
      const rawParams = typeof params === 'string' ? { keyword: params } : (params || {})
      const searchParams = {
        keyword: normalizeSearchValue(rawParams.keyword).toLowerCase(),
        category: normalizeSearchValue(rawParams.category),
        taste: normalizeSearchValue(rawParams.taste),
        difficulty: normalizeSearchValue(rawParams.difficulty)
      }
      const allDishesArray = this.getAllDishesArray()
      let searchResults = []

      // 如果有筛选条件但没有关键词，直接按筛选条件过滤
      if (!searchParams.keyword && (searchParams.category || searchParams.taste || searchParams.difficulty)) {
        searchResults = allDishesArray.filter(dish => {
          let matches = true
          if (searchParams.category) matches = matches && dish.category === searchParams.category
          if (searchParams.taste) matches = matches && dish.taste === searchParams.taste
          if (searchParams.difficulty) matches = matches && dish.difficulty === searchParams.difficulty
          return matches
        })
      } else if (searchParams.keyword) {
        const recipeSearchData = await loadRecipeSearchData()
        // 有关键词时的搜索逻辑
        const keywords = searchParams.keyword.split(/\s+/) // 支持多个关键词搜索

        // 搜索结果和权重
        searchResults = allDishesArray
          .map(dish => {
            let weight = 0
            const matchedKeywords = new Set()

            // 先检查是否符合筛选条件
            if (searchParams.category && dish.category !== searchParams.category) return { dish, weight: 0, matchedKeywords: 0 }
            if (searchParams.taste && dish.taste !== searchParams.taste) return { dish, weight: 0, matchedKeywords: 0 }
            if (searchParams.difficulty && dish.difficulty !== searchParams.difficulty) return { dish, weight: 0, matchedKeywords: 0 }

            keywords.forEach(kw => {
              // 1. 匹配菜品名称 (权重最高)
              if (dish.name.toLowerCase().includes(kw)) {
                weight += 100
                matchedKeywords.add(kw)
              }

              // 2. 匹配食材列表 (第二优先)
              if (dish.ingredients.some(ingredient => ingredient.toLowerCase().includes(kw))) {
                weight += 50
                matchedKeywords.add(kw)
              }

              // 3. 匹配烹饪方法 (第三优先)
              if (dish.cookingMethod.toLowerCase().includes(kw)) {
                weight += 30
                matchedKeywords.add(kw)
              }

              // 4. 匹配口味 (第四优先)
              if (dish.taste.toLowerCase().includes(kw)) {
                weight += 20
                matchedKeywords.add(kw)
              }

              // 5. 匹配难度 (第五优先)
              if (dish.difficulty.toLowerCase().includes(kw)) {
                weight += 10
                matchedKeywords.add(kw)
              }

              // 6. 匹配类别 (第六优先)
              if (dish.category.toLowerCase().includes(kw)) {
                weight += 10
                matchedKeywords.add(kw)
              }

              // 7. 匹配步骤描述 (最低优先级)
              if ((recipeSearchData[dish.id] || '').toLowerCase().includes(kw)) {
                weight += 5
                matchedKeywords.add(kw)
              }
            })

            // 如果所有关键词都匹配到了，给予额外加分
            if (matchedKeywords.size === keywords.length) {
              weight += 200
            }

            return {
              dish,
              weight,
              matchedKeywords: matchedKeywords.size
            }
          })
          // 过滤掉没有匹配的结果
          .filter(result => result.weight > 0)
          // 按权重和匹配关键词数量排序
          .sort((a, b) => {
            if (b.matchedKeywords !== a.matchedKeywords) {
              return b.matchedKeywords - a.matchedKeywords
            }
            return b.weight - a.weight
          })
          // 只返回菜品对象
          .map(result => result.dish)
      }

      this.recipes = searchResults
      return searchResults
    },

    /**
     * 根据ID获取菜品
     * @param {number} id - 菜品ID
     * @returns {Object} 菜品详情
     */
    async getRecipeById(id) {
      try {
        const detailPath = `../data/client/recipes/${id}.json`
        const loadRecipe = recipeDetailModules[detailPath]
        if (!loadRecipe) {
          const error = new Error('未找到该菜品')
          error.code = 'RECIPE_NOT_FOUND'
          throw error
        }

        const recipe = recipeDetailCache.get(id) || await loadRecipe()
        recipeDetailCache.set(id, recipe)

        return recipe
      } catch (error) {
        if (error.code !== 'RECIPE_NOT_FOUND') console.error('获取菜品详情失败:', error)
        throw error
      }
    }
  }
})
