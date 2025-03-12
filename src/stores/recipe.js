import { defineStore } from 'pinia'
import dishesData from '../data/dishes.json'

export const useRecipeStore = defineStore('recipe', {
  state: () => ({
    recipes: [],
    currentRecipe: null,
    recommendedPairings: [],
    usedPairings: new Set(), // 记录已推荐过的搭配
    allDishes: dishesData,
    todayRecommends: [], // 今日推荐列表
    homePageRecipe: null, // 首页随机推荐的菜品
    homePageRecommends: [] // 首页今日推荐列表
  }),
  
  actions: {
    /**
     * 获取首页随机推荐
     */
    async getHomePageRecipe() {
      const recipe = await this.getRandomRecipe()
      this.homePageRecipe = recipe
      return this.homePageRecipe
    },

    /**
     * 获取首页今日推荐
     */
    async getHomePageRecommends() {
      if (this.homePageRecommends.length === 0) {
        this.homePageRecommends = await this.getTodayRecommends()
      }
      return this.homePageRecommends
    },

    /**
     * 重置首页推荐
     */
    resetHomePageRecipe() {
      this.homePageRecipe = null
    },

    /**
     * 获取随机推荐的食谱
     * @returns {Object} 随机选择的菜品
     */
    async getRandomRecipe() {
      // 将所有菜品整理成一个数组
      const allDishesArray = this.getAllDishesArray()

      // 随机选择一道菜
      const randomIndex = Math.floor(Math.random() * allDishesArray.length)
      this.currentRecipe = allDishesArray[randomIndex]

      return this.currentRecipe
    },

    /**
     * 获取所有菜品数组
     * @returns {Array} 所有菜品的数组
     */
    getAllDishesArray() {
      const allDishes = []
      
      // 遍历所有分类
      for (const category in this.allDishes) {
        if (category === 'DISH_CHARACTERISTICS') continue
        
        // 如果是对象，需要进一步遍历子分类
        if (typeof this.allDishes[category] === 'object') {
          for (const subCategory in this.allDishes[category]) {
            if (Array.isArray(this.allDishes[category][subCategory])) {
              allDishes.push(...this.allDishes[category][subCategory])
            }
          }
        }
        // 如果是数组，直接添加
        else if (Array.isArray(this.allDishes[category])) {
          allDishes.push(...this.allDishes[category])
        }
      }
      
      return allDishes
    },

    /**
     * 获取今日推荐菜品列表
     * @returns {Array} 推荐的菜品列表
     */
    async getTodayRecommends() {
      const allDishesArray = this.getAllDishesArray()

      // 清空今日推荐列表
      this.todayRecommends = []

      // 随机选择6道不重复的菜
      const selectedDishes = new Set()
      const recommendCount = 6

      while (selectedDishes.size < recommendCount && selectedDishes.size < allDishesArray.length) {
        const randomIndex = Math.floor(Math.random() * allDishesArray.length)
        const dish = allDishesArray[randomIndex]
        if (!selectedDishes.has(dish.id)) {
          selectedDishes.add(dish.id)
          this.todayRecommends.push(dish)
        }
      }

      // 确保推荐的菜品类型多样
      this.todayRecommends.sort((a, b) => {
        // 按照类别排序，使得不同类别的菜品分散显示
        const categoryOrder = {
          [this.allDishes.DISH_CHARACTERISTICS.CATEGORIES.STAPLE]: 1,
          [this.allDishes.DISH_CHARACTERISTICS.CATEGORIES.MEAT]: 2,
          [this.allDishes.DISH_CHARACTERISTICS.CATEGORIES.SEAFOOD]: 3,
          [this.allDishes.DISH_CHARACTERISTICS.CATEGORIES.VEGETABLE]: 4,
          [this.allDishes.DISH_CHARACTERISTICS.CATEGORIES.SOUP]: 5,
          'DESSERT': 6
        }
        return categoryOrder[a.category] - categoryOrder[b.category]
      })

      return this.todayRecommends
    },

    /**
     * 根据当前菜品特点，推荐搭配的菜品
     * @param {number} recipeId - 当前菜品ID
     */
    async getRecommendedPairings(recipeId) {
      const currentDish = this.currentRecipe
      if (!currentDish) return

      const pairings = []
      this.usedPairings.clear() // 清空已使用记录

      // 根据口味和烹饪方式推荐搭配
      if (currentDish.taste === this.allDishes.DISH_CHARACTERISTICS.TASTES.SPICY || 
          currentDish.taste === this.allDishes.DISH_CHARACTERISTICS.TASTES.SALTY) {
        // 如果是重口味菜品，推荐清淡的搭配
        const lightDishes = this.getAllDishesArray().filter(
          dish => dish.category === this.allDishes.DISH_CHARACTERISTICS.CATEGORIES.VEGETABLE &&
                 dish.taste === this.allDishes.DISH_CHARACTERISTICS.TASTES.LIGHT
        )
        
        if (lightDishes.length > 0) {
          const randomIndex = Math.floor(Math.random() * lightDishes.length)
          pairings.push(lightDishes[randomIndex])
        }
      }

      // 根据菜品类别推荐搭配
      if (currentDish.category === this.allDishes.DISH_CHARACTERISTICS.CATEGORIES.MEAT) {
        // 如果是荤菜，推荐素菜
        const vegetableDishes = this.getAllDishesArray().filter(
          dish => dish.category === this.allDishes.DISH_CHARACTERISTICS.CATEGORIES.VEGETABLE
        )
        
        if (vegetableDishes.length > 0) {
          const randomIndex = Math.floor(Math.random() * vegetableDishes.length)
          const dish = vegetableDishes[randomIndex]
          if (!pairings.find(p => p.id === dish.id)) {
            pairings.push(dish)
          }
        }
      } else if (currentDish.category === this.allDishes.DISH_CHARACTERISTICS.CATEGORIES.VEGETABLE) {
        // 如果是素菜，可以推荐荤菜
        const meatDishes = this.getAllDishesArray().filter(
          dish => dish.category === this.allDishes.DISH_CHARACTERISTICS.CATEGORIES.MEAT
        )
        
        if (meatDishes.length > 0) {
          const randomIndex = Math.floor(Math.random() * meatDishes.length)
          pairings.push(meatDishes[randomIndex])
        }
      }

      // 确保至少有两个推荐
      if (pairings.length < 2) {
        const allDishes = this.getAllDishesArray().filter(
          dish => dish.id !== currentDish.id && !pairings.find(p => p.id === dish.id)
        )

        while (pairings.length < 2 && allDishes.length > 0) {
          const randomIndex = Math.floor(Math.random() * allDishes.length)
          pairings.push(allDishes[randomIndex])
          allDishes.splice(randomIndex, 1)
        }
      }

      this.recommendedPairings = pairings
      return this.recommendedPairings
    },

    /**
     * 根据关键词搜索食谱
     * @param {string} keyword - 搜索关键词
     */
    async searchRecipes(keyword) {
      if (!keyword) {
        this.recipes = []
        return
      }

      const allDishesArray = this.getAllDishesArray()

      // 搜索逻辑:
      // 1. 匹配菜品名称
      // 2. 匹配食材列表
      // 3. 匹配烹饪方法
      const searchResults = allDishesArray.filter(dish => {
        const lowerKeyword = keyword.toLowerCase()
        return (
          // 匹配菜品名称
          dish.name.toLowerCase().includes(lowerKeyword) ||
          // 匹配食材列表
          dish.ingredients.some(ingredient => 
            ingredient.toLowerCase().includes(lowerKeyword)
          ) ||
          // 匹配烹饪方法
          dish.cookingMethod.toLowerCase().includes(lowerKeyword)
        )
      })

      this.recipes = searchResults
      return searchResults
    },

    /**
     * 根据ID获取菜品
     * @param {number} id - 菜品ID
     * @returns {Object} 菜品详情
     */
    async getRecipeById(id) {
      const allDishesArray = this.getAllDishesArray()

      // 查找匹配ID的菜品
      const recipe = allDishesArray.find(dish => dish.id === id)
      if (!recipe) {
        throw new Error('未找到该菜品')
      }

      this.currentRecipe = recipe
      return recipe
    }
  }
}) 