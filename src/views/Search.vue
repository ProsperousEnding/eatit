<template>
  <div class="search">
    <div ref="searchContainer" class="search-container">
      <h1 class="search-title">搜索菜谱</h1>
      <form class="search-form" role="search" @submit.prevent="handleSearch">
        <div class="search-field">
          <el-input
            v-model="searchKeyword"
            placeholder="输入菜名、食材或烹饪方法"
            class="search-input"
            :maxlength="80"
            container-role="combobox"
            aria-label="搜索食谱"
            aria-autocomplete="list"
            aria-controls="search-suggestions"
            :aria-expanded="showSuggestions && suggestions.length > 0"
            :aria-activedescendant="activeSuggestionId"
            @keydown.esc="closeSearchPanels"
            @keydown.down.prevent="moveSuggestion(1)"
            @keydown.up.prevent="moveSuggestion(-1)"
            @keydown.enter="selectActiveSuggestion"
            @input="handleInput"
            @focus="handleFocus"
            @clear="handleClear"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>

          <!-- 搜索建议 -->
          <div
            v-if="showSuggestions && suggestions.length > 0"
            id="search-suggestions"
            class="search-suggestions"
            role="listbox"
            aria-label="搜索建议"
          >
            <button
              v-for="(suggestion, index) in suggestions"
              :key="suggestion"
              :id="`search-suggestion-${index}`"
              type="button"
              class="suggestion-item"
              role="option"
              tabindex="-1"
              :aria-selected="index === activeSuggestionIndex"
              :class="{ 'is-active': index === activeSuggestionIndex }"
              @mousemove="activeSuggestionIndex = index"
              @click="selectSuggestion(suggestion)"
            >
              {{ suggestion }}
            </button>
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
                role="button"
                tabindex="0"
                @click="selectSuggestion(item)"
                @keyup.enter="selectSuggestion(item)"
                @keyup.space.prevent="selectSuggestion(item)"
              >
                {{ item }}
              </el-tag>
            </div>
          </div>
        </div>
        <el-button class="search-submit" type="primary" native-type="submit">
          <el-icon><Search /></el-icon>
          <span class="search-submit-label">搜索</span>
        </el-button>
      </form>
    </div>

    <!-- 筛选条件 -->
    <div v-if="hasSearched" class="filter-container" aria-label="搜索筛选">
      <el-select v-model="filterCategory" placeholder="菜品类别" aria-label="菜品类别" clearable>
        <el-option
          v-for="category in categories"
          :key="category.value"
          :label="category.label"
          :value="category.value"
        />
      </el-select>

      <el-select v-model="filterTaste" placeholder="口味" aria-label="口味" clearable>
        <el-option
          v-for="taste in tastes"
          :key="taste.value"
          :label="taste.label"
          :value="taste.value"
        />
      </el-select>

      <el-select v-model="filterDifficulty" placeholder="难度" aria-label="难度" clearable>
        <el-option
          v-for="difficulty in difficulties"
          :key="difficulty.value"
          :label="difficulty.label"
          :value="difficulty.value"
        />
      </el-select>
    </div>

    <!-- 搜索结果 -->
    <div class="search-results" v-if="recipes.length">
      <router-link
        v-for="recipe in recipes"
        :key="recipe.id"
        class="recipe-item-link"
        :to="`/recipe/${recipe.id}`"
      >
        <el-card class="recipe-item">
          <div class="recipe-content">
          <ResponsiveDishImage
            :src="recipe.image"
            class="recipe-thumb"
            :alt="recipe.name"
            sizes="(max-width: 640px) 112px, 200px"
          />
          <div class="recipe-info">
            <h2>{{ recipe.name }}</h2>
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
      </router-link>
    </div>

    <el-empty
      v-else-if="hasSearched"
      description="没有找到相关食谱"
    />
    <p class="sr-only" aria-live="polite">
      {{ hasSearched ? `找到 ${recipes.length} 道食谱` : '' }}
    </p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import '@/styles/element-plus-search.css'
import { useRouter, useRoute } from 'vue-router'
import { useRecipeStore } from '@/stores/recipe'
import { storeToRefs } from 'pinia'
import ResponsiveDishImage from '@/components/ResponsiveDishImage.vue'
import { Search } from '@element-plus/icons-vue'
import {
  ElButton,
  ElCard,
  ElEmpty,
  ElIcon,
  ElInput,
  ElOption,
  ElSelect,
  ElTag
} from 'element-plus'

const router = useRouter()
const route = useRoute()
const recipeStore = useRecipeStore()
const { recipes } = storeToRefs(recipeStore)

// 搜索相关
const searchKeyword = ref('')
const hasSearched = ref(false)
const showSuggestions = ref(false)
const showHistory = ref(false)
const syncingFromRoute = ref(false)
const searchContainer = ref(null)

// 筛选条件
const filterCategory = ref('')
const filterTaste = ref('')
const filterDifficulty = ref('')

// 从 dishes.json 中获取分类数据
const categories = computed(() => {
  const cats = recipeStore.allDishes.DISH_CHARACTERISTICS.CATEGORIES
  return Object.values(cats).map(value => ({
    value: value,
    label: value
  }))
})

const tastes = computed(() => {
  const ts = recipeStore.allDishes.DISH_CHARACTERISTICS.TASTES
  return Object.values(ts).map(value => ({
    value: value,
    label: value
  }))
})

const difficulties = computed(() => {
  const diffs = recipeStore.allDishes.DISH_CHARACTERISTICS.DIFFICULTY
  return Object.values(diffs).map(value => ({
    value: value,
    label: value
  }))
})

// 搜索历史
const HISTORY_KEY = 'search_history'
const MAX_HISTORY = 10
const MAX_KEYWORD_LENGTH = 80
const searchHistory = ref([])

// 搜索建议
const suggestions = ref([])
const activeSuggestionIndex = ref(-1)
const activeSuggestionId = computed(() => activeSuggestionIndex.value >= 0
  ? `search-suggestion-${activeSuggestionIndex.value}`
  : undefined)

// 加载搜索历史
const loadHistory = () => {
  try {
    const history = localStorage.getItem(HISTORY_KEY)
    if (history) {
      const parsedHistory = JSON.parse(history)
      searchHistory.value = Array.isArray(parsedHistory)
        ? [...new Set(parsedHistory
          .filter(item => typeof item === 'string')
          .map(item => item.trim().slice(0, MAX_KEYWORD_LENGTH))
          .filter(Boolean))].slice(0, MAX_HISTORY)
        : []
    }
  } catch {
    searchHistory.value = []
    try {
      localStorage.removeItem(HISTORY_KEY)
    } catch {
      // Storage can be unavailable in restricted browser contexts.
    }
  }
}

// 保存搜索历史
const saveHistory = (keyword) => {
  const normalizedKeyword = String(keyword).trim().slice(0, MAX_KEYWORD_LENGTH)
  if (!normalizedKeyword) return

  const index = searchHistory.value.indexOf(normalizedKeyword)
  if (index > -1) {
    searchHistory.value.splice(index, 1)
  }

  searchHistory.value.unshift(normalizedKeyword)

  if (searchHistory.value.length > MAX_HISTORY) {
    searchHistory.value = searchHistory.value.slice(0, MAX_HISTORY)
  }

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(searchHistory.value))
  } catch {
    // Search remains usable when storage is unavailable or full.
  }
}

// 清空搜索历史
const clearHistory = () => {
  searchHistory.value = []
  try {
    localStorage.removeItem(HISTORY_KEY)
  } catch {
    // The in-memory history has still been cleared.
  }
}

// 处理输入
const handleInput = () => {
  activeSuggestionIndex.value = -1
  if (!searchKeyword.value.trim()) {
    showSuggestions.value = false
    showHistory.value = searchHistory.value.length > 0
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

const handleFocus = () => {
  if (!searchKeyword.value.trim() && searchHistory.value.length > 0) {
    showHistory.value = true
  }
}

const closeSearchPanels = () => {
  showSuggestions.value = false
  showHistory.value = false
  activeSuggestionIndex.value = -1
}

const moveSuggestion = (direction) => {
  if (!showSuggestions.value || suggestions.value.length === 0) return
  const count = suggestions.value.length
  if (activeSuggestionIndex.value < 0) {
    activeSuggestionIndex.value = direction > 0 ? 0 : count - 1
    return
  }
  activeSuggestionIndex.value = (activeSuggestionIndex.value + direction + count) % count
}

const selectActiveSuggestion = async (event) => {
  if (activeSuggestionIndex.value < 0) return
  event.preventDefault()
  await selectSuggestion(suggestions.value[activeSuggestionIndex.value])
}

const handleOutsidePointer = (event) => {
  if (!searchContainer.value?.contains(event.target)) closeSearchPanels()
}

const handleClear = async () => {
  showSuggestions.value = false
  activeSuggestionIndex.value = -1
  showHistory.value = searchHistory.value.length > 0
  filterCategory.value = ''
  filterTaste.value = ''
  filterDifficulty.value = ''
  recipes.value = []
  hasSearched.value = false
  await router.replace({ query: {} })
}

// 选择搜索建议
const selectSuggestion = async (suggestion) => {
  searchKeyword.value = suggestion
  showSuggestions.value = false
  await handleSearch()
}

// 监听筛选条件变化
watch([filterCategory, filterTaste, filterDifficulty], async () => {
  if (hasSearched.value && !syncingFromRoute.value) {
    await handleSearch()
  }
})

/**
 * 处理搜索
 */
const handleSearch = async () => {
  showSuggestions.value = false
  showHistory.value = false
  activeSuggestionIndex.value = -1

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
    recipes.value = []
    hasSearched.value = false
    await router.replace({ query: {} })
    return
  }

  await recipeStore.searchRecipes(searchParams)
  hasSearched.value = true

  if (searchParams.keyword) {
    saveHistory(searchParams.keyword)
  }

  // 更新 URL，包含筛选条件
  const query = Object.fromEntries(
    Object.entries(searchParams).filter(([, value]) => value)
  )
  await router.replace({ query })
}

const getQueryString = (value) => {
  if (Array.isArray(value)) return String(value.at(-1) || '').trim().slice(0, MAX_KEYWORD_LENGTH)
  return typeof value === 'string' ? value.trim().slice(0, MAX_KEYWORD_LENGTH) : ''
}

// 处理 URL 参数中的关键词和筛选条件
const syncFromQuery = async () => {
  const { keyword, category, taste, difficulty } = route.query
  const nextState = {
    keyword: getQueryString(keyword),
    category: getQueryString(category),
    taste: getQueryString(taste),
    difficulty: getQueryString(difficulty)
  }

  const isAlreadySynced = searchKeyword.value === nextState.keyword &&
    filterCategory.value === nextState.category &&
    filterTaste.value === nextState.taste &&
    filterDifficulty.value === nextState.difficulty

  if (isAlreadySynced && hasSearched.value) return

  syncingFromRoute.value = true
  try {
    searchKeyword.value = nextState.keyword
    filterCategory.value = nextState.category
    filterTaste.value = nextState.taste
    filterDifficulty.value = nextState.difficulty

    if (Object.values(nextState).some(Boolean)) {
      await recipeStore.searchRecipes(nextState)
      hasSearched.value = true
      showHistory.value = false
    } else {
      recipes.value = []
      hasSearched.value = false
    }
  } finally {
    syncingFromRoute.value = false
  }
}

// 监听路由变化
watch(
  () => route.query,
  syncFromQuery,
  { immediate: true }
)

// 组件挂载时加载搜索历史
onMounted(() => {
  loadHistory()
  document.addEventListener('pointerdown', handleOutsidePointer)
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', handleOutsidePointer)
})
</script>

<style scoped>
.search {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.search-container {
  width: min(100%, 840px);
  margin: 0 auto 24px;
}

.search-title {
  margin: 0 0 16px;
  color: #303133;
  font-size: 24px;
  line-height: 1.3;
}

.search-form {
  display: flex;
  align-items: stretch;
  gap: 8px;
}

.search-field {
  position: relative;
  min-width: 0;
  flex: 1;
}

.search-input :deep(.el-input__wrapper) {
  height: 48px;
  padding: 0 14px;
  border-radius: 8px;
}

.search-submit {
  min-width: 92px;
  height: 48px;
  padding: 0 18px;
  border-radius: 8px;
}

.search-suggestions,
.search-history {
  position: absolute;
  width: 100%;
  background: white;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  z-index: 1000;
}

.suggestion-item {
  display: block;
  width: 100%;
  padding: 8px 16px;
  border: 0;
  color: #303133;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.suggestion-item:hover {
  background-color: #f5f7fa;
}

.suggestion-item.is-active {
  background-color: #ecf5ff;
}

.recipe-item-link {
  display: block;
  color: inherit;
  text-decoration: none;
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
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.history-tag {
  max-width: 100%;
  cursor: pointer;
}

.history-tag :deep(.el-tag__content) {
  overflow: hidden;
  text-overflow: ellipsis;
}

.filter-container {
  margin-bottom: 20px;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-container .el-select {
  flex: 1 1 180px;
}

.recipe-item {
  margin-bottom: 20px;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.recipe-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.recipe-item-link:focus-visible,
.suggestion-item:focus-visible,
.history-tag:focus-visible {
  outline: 3px solid #409eff;
  outline-offset: 2px;
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
  min-width: 0;
}

.recipe-info h2 {
  margin: 0;
  font-size: 1.17em;
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
  color: #595959;
  font-size: 14px;
}

@media screen and (min-width: 960px) {
  .search {
    padding: 32px 24px 40px;
  }

  .filter-container {
    margin-bottom: 24px;
  }

  .search-results {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
  }

  .recipe-item {
    height: 100%;
    margin-bottom: 0;
  }

  .recipe-item :deep(.el-card__body),
  .recipe-content {
    height: 100%;
  }

  .recipe-thumb {
    width: 180px;
    height: 136px;
    flex: 0 0 180px;
  }
}

@media screen and (max-width: 640px) {
  .search {
    padding: 12px;
  }

  .search-container {
    margin-bottom: 20px;
  }

  .search-title {
    margin-bottom: 12px;
    font-size: 20px;
  }

  .search-submit {
    width: 48px;
    min-width: 48px;
    padding: 0;
  }

  .search-submit-label {
    display: none;
  }

  .recipe-content {
    gap: 12px;
  }

  .recipe-thumb {
    width: 112px;
    height: 112px;
    flex: 0 0 112px;
  }

  .recipe-info h2 {
    margin-top: 0;
  }

  .recipe-tags {
    gap: 4px;
    flex-wrap: wrap;
  }

  .ingredients {
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }
}
</style>
