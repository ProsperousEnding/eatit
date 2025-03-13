# 创建Search.vue文件
<template>
  <div class="search">
    <div class="search-container">
      <el-input
        v-model="searchKeyword"
        placeholder="输入食材、菜名、烹饪方法等关键词搜索食谱..."
        class="search-input"
        @keyup.enter="handleSearch"
        @input="handleInput"
        clearable
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
        <template #append>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </template>
      </el-input>

      <!-- 搜索建议 -->
      <div v-if="showSuggestions && suggestions.length > 0" class="search-suggestions">
        <div
          v-for="suggestion in suggestions"
          :key="suggestion"
          class="suggestion-item"
          @click="selectSuggestion(suggestion)"
        >
          {{ suggestion }}
        </div>
      </div>

      <!-- 搜索历史 -->
      <div v-if="showHistory && searchHistory.length > 0" class="search-history">
        <div class="history-header">
          <span>搜索历史</span>
          <el-button type="text" @click="clearHistory">清空历史</el-button>
        </div>
        <div class="history-tags">
          <el-tag
            v-for="item in searchHistory"
            :key="item"
            class="history-tag"
            @click="selectSuggestion(item)"
          >
            {{ item }}
          </el-tag>
        </div>
      </div>
    </div>

    <!-- 筛选条件 -->
    <div v-if="recipes.length > 0" class="filter-container">
      <el-select v-model="filterCategory" placeholder="菜品类别" clearable>
        <el-option
          v-for="category in categories"
          :key="category.value"
          :label="category.label"
          :value="category.value"
        />
      </el-select>

      <el-select v-model="filterTaste" placeholder="口味" clearable>
        <el-option
          v-for="taste in tastes"
          :key="taste.value"
          :label="taste.label"
          :value="taste.value"
        />
      </el-select>

      <el-select v-model="filterDifficulty" placeholder="难度" clearable>
        <el-option
          v-for="difficulty in difficulties"
          :key="difficulty.value"
          :label="difficulty.label"
          :value="difficulty.value"
        />
      </el-select>
    </div>

    <!-- 搜索结果 -->
    <div class="search-results" v-if="filteredRecipes.length">
      <el-card 
        v-for="recipe in filteredRecipes" 
        :key="recipe.id"
        class="recipe-item"
        @click="goToDetail(recipe.id)"
      >
        <div class="recipe-content">
          <el-image 
            :src="getImageUrl(recipe.image)"
            class="recipe-thumb"
            :preview-src-list="[getImageUrl(recipe.image)]"
          />
          <div class="recipe-info">
            <h3>{{ recipe.name }}</h3>
            <div class="recipe-tags">
              <el-tag size="small" type="info">{{ recipe.category }}</el-tag>
              <el-tag size="small" type="success">{{ recipe.taste }}</el-tag>
              <el-tag size="small" type="warning">{{ recipe.difficulty }}</el-tag>
            </div>
            <p class="ingredients">
              主料: {{ recipe.ingredients.slice(0, 3).join(', ') }}
              <span v-if="recipe.ingredients.length > 3">等</span>
            </p>
            <p class="cooking-time">烹饪时间: {{ recipe.cookingTime }}</p>
          </div>
        </div>
      </el-card>
    </div>

    <el-empty 
      v-else-if="hasSearched"
      description="没有找到相关食谱"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useRecipeStore } from '@/stores/recipe'
import { storeToRefs } from 'pinia'
import { getImageUrl } from '@/utils/image'
import { Search } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const recipeStore = useRecipeStore()
const { recipes } = storeToRefs(recipeStore)

// 搜索相关
const searchKeyword = ref('')
const hasSearched = ref(false)
const showSuggestions = ref(false)
const showHistory = ref(true)

// 筛选条件
const filterCategory = ref('')
const filterTaste = ref('')
const filterDifficulty = ref('')

// 从 dishes.json 中获取分类数据
const categories = computed(() => {
  const cats = recipeStore.allDishes.DISH_CHARACTERISTICS.CATEGORIES
  return Object.entries(cats).map(([key, value]) => ({
    value: value,
    label: value
  }))
})

const tastes = computed(() => {
  const ts = recipeStore.allDishes.DISH_CHARACTERISTICS.TASTES
  return Object.entries(ts).map(([key, value]) => ({
    value: value,
    label: value
  }))
})

const difficulties = computed(() => {
  const diffs = recipeStore.allDishes.DISH_CHARACTERISTICS.DIFFICULTY
  return Object.entries(diffs).map(([key, value]) => ({
    value: value,
    label: value
  }))
})

// 搜索历史
const HISTORY_KEY = 'search_history'
const MAX_HISTORY = 10
const searchHistory = ref([])

// 搜索建议
const suggestions = ref([])

// 过滤后的搜索结果
const filteredRecipes = computed(() => {
  let results = recipes.value

  if (filterCategory.value) {
    results = results.filter(recipe => recipe.category === filterCategory.value)
  }

  if (filterTaste.value) {
    results = results.filter(recipe => recipe.taste === filterTaste.value)
  }

  if (filterDifficulty.value) {
    results = results.filter(recipe => recipe.difficulty === filterDifficulty.value)
  }

  return results
})

// 加载搜索历史
const loadHistory = () => {
  const history = localStorage.getItem(HISTORY_KEY)
  if (history) {
    searchHistory.value = JSON.parse(history)
  }
}

// 保存搜索历史
const saveHistory = (keyword) => {
  if (!keyword) return
  
  const index = searchHistory.value.indexOf(keyword)
  if (index > -1) {
    searchHistory.value.splice(index, 1)
  }
  
  searchHistory.value.unshift(keyword)
  
  if (searchHistory.value.length > MAX_HISTORY) {
    searchHistory.value = searchHistory.value.slice(0, MAX_HISTORY)
  }
  
  localStorage.setItem(HISTORY_KEY, JSON.stringify(searchHistory.value))
}

// 清空搜索历史
const clearHistory = () => {
  searchHistory.value = []
  localStorage.removeItem(HISTORY_KEY)
}

// 处理输入
const handleInput = () => {
  if (!searchKeyword.value) {
    showSuggestions.value = false
    showHistory.value = true
    return
  }

  // 简单的搜索建议实现
  const allDishes = recipeStore.getAllDishesArray()
  suggestions.value = allDishes
    .filter(dish => 
      dish.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      dish.ingredients.some(i => i.toLowerCase().includes(searchKeyword.value.toLowerCase()))
    )
    .map(dish => dish.name)
    .slice(0, 5)

  showSuggestions.value = suggestions.value.length > 0
  showHistory.value = false
}

// 选择搜索建议
const selectSuggestion = (suggestion) => {
  searchKeyword.value = suggestion
  showSuggestions.value = false
  handleSearch()
}

// 监听筛选条件变化
watch([filterCategory, filterTaste, filterDifficulty], async () => {
  // 如果已经搜索过，则根据新的筛选条件重新搜索
  if (hasSearched.value) {
    await handleSearch()
  }
})

/**
 * 处理搜索
 */
const handleSearch = async () => {
  showSuggestions.value = false
  showHistory.value = false
  
  // 构建搜索参数
  const searchParams = {
    keyword: searchKeyword.value.trim(),
    category: filterCategory.value,
    taste: filterTaste.value,
    difficulty: filterDifficulty.value
  }
  
  // 如果只有筛选条件没有关键词，使用空字符串作为关键词
  if (!searchParams.keyword && (searchParams.category || searchParams.taste || searchParams.difficulty)) {
    searchParams.keyword = ''
  } else if (!searchParams.keyword) {
    return
  }

  await recipeStore.searchRecipes(searchParams)
  hasSearched.value = true
  
  if (searchParams.keyword) {
    saveHistory(searchParams.keyword)
  }

  // 更新 URL，包含筛选条件
  router.replace({
    query: {
      ...route.query,
      ...searchParams
    }
  })
}

/**
 * 跳转到详情页
 * @param {number} id - 食谱ID
 */
const goToDetail = (id) => {
  router.push(`/recipe/${id}`)
}

// 处理 URL 参数中的关键词和筛选条件
const initFromQuery = async () => {
  const { keyword, category, taste, difficulty } = route.query
  
  if (keyword) {
    searchKeyword.value = keyword
  }
  if (category) {
    filterCategory.value = category
  }
  if (taste) {
    filterTaste.value = taste
  }
  if (difficulty) {
    filterDifficulty.value = difficulty
  }
  
  if (keyword || category || taste || difficulty) {
    await handleSearch()
  }
}

// 监听路由变化
watch(
  () => route.query.keyword,
  async (newKeyword) => {
    if (newKeyword && newKeyword !== searchKeyword.value) {
      searchKeyword.value = newKeyword
      await handleSearch()
    }
  }
)

// 组件挂载时加载搜索历史和处理 URL 参数
onMounted(() => {
  loadHistory()
  initFromQuery()
})
</script>

<style scoped>
.search {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.search-container {
  position: relative;
  margin-bottom: 20px;
}

.search-input {
  margin-bottom: 10px;
}

.search-suggestions,
.search-history {
  position: absolute;
  width: 100%;
  background: white;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  z-index: 1000;
}

.suggestion-item {
  padding: 8px 16px;
  cursor: pointer;
}

.suggestion-item:hover {
  background-color: #f5f7fa;
}

.history-header {
  padding: 8px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ebeef5;
}

.history-tags {
  padding: 8px 16px;
}

.history-tag {
  margin: 4px;
  cursor: pointer;
}

.filter-container {
  margin-bottom: 20px;
  display: flex;
  gap: 16px;
}

.recipe-item {
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.recipe-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.recipe-content {
  display: flex;
  gap: 20px;
}

.recipe-thumb {
  width: 200px;
  height: 150px;
  border-radius: 4px;
  object-fit: cover;
}

.recipe-info {
  flex: 1;
}

.recipe-tags {
  margin: 8px 0;
  display: flex;
  gap: 8px;
}

.ingredients {
  color: #666;
  margin: 8px 0;
}

.cooking-time {
  color: #999;
  font-size: 14px;
}
</style> 