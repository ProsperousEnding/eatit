<template>
  <div class="home">
    <!-- 头部区域 -->
    <div class="header">
            <!-- 搜索栏 -->
            <div class="search-section">
      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索菜品、食材、烹饪时间..."
          class="search-input"
          @keyup.enter="handleSearch"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <!-- 搜索建议 -->
        <div v-if="showSuggestions && searchSuggestions.length" class="search-suggestions">
          <div class="suggestion-group" v-if="dishSuggestions.length">
            <div class="group-title">
              <el-icon><Food /></el-icon>
              <span>菜品</span>
            </div>
            <div 
              v-for="suggestion in dishSuggestions" 
              :key="suggestion.id"
              class="suggestion-item"
              @click="handleSuggestionClick(suggestion)"
            >
              <div class="suggestion-content">
                <span class="suggestion-text">{{ suggestion.text }}</span>
                <span class="suggestion-info">{{ suggestion.category }}</span>
              </div>
            </div>
          </div>

          <div class="suggestion-group" v-if="ingredientSuggestions.length">
            <div class="group-title">
              <el-icon><Sugar /></el-icon>
              <span>食材</span>
            </div>
            <div 
              v-for="suggestion in ingredientSuggestions" 
              :key="suggestion.id"
              class="suggestion-item"
              @click="handleSuggestionClick(suggestion)"
            >
              <div class="suggestion-content">
                <span class="suggestion-text">{{ suggestion.text }}</span>
              </div>
            </div>
          </div>

          <div class="suggestion-group" v-if="timeSuggestions.length">
            <div class="group-title">
              <el-icon><Timer /></el-icon>
              <span>烹饪时间</span>
            </div>
            <div 
              v-for="suggestion in timeSuggestions" 
              :key="suggestion.id"
              class="suggestion-item"
              @click="handleSuggestionClick(suggestion)"
            >
              <div class="suggestion-content">
                <span class="suggestion-text">{{ suggestion.text }}</span>
                <span class="suggestion-info">{{ suggestion.duration }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 搜索标签 -->
      <div v-if="activeFilters.length" class="active-filters">
        <el-tag
          v-for="filter in activeFilters"
          :key="filter.value"
          closable
          :type="filter.type"
          class="filter-tag"
          @close="removeFilter(filter)"
        >
          {{ filter.label }}
        </el-tag>
      </div>
    </div>
      <h1>今天吃什么？</h1>
      <p>每天为您精选美味佳肴</p>
    </div>

    <!-- 随机推荐区域 -->
    <div class="random-recommend" v-if="currentRecipe">
      <el-card class="recipe-card">
        <div class="recipe-image">
          <img :src="currentRecipe.image" :alt="currentRecipe.name">
        </div>
        <div class="recipe-info">
          <h2>{{ currentRecipe.name }}</h2>
          <div class="recipe-tags">
            <el-tag>{{ currentRecipe.category }}</el-tag>
            <el-tag type="success">{{ currentRecipe.cookingMethod }}</el-tag>
            <el-tag type="warning">{{ currentRecipe.difficulty }}</el-tag>
          </div>
          <p class="cooking-time">
            <el-icon><Clock /></el-icon>
            烹饪时间：{{ currentRecipe.cookingTime }}
          </p>
          <div class="button-group">
            <el-button type="primary" @click="viewRecipeDetail(currentRecipe.id)">查看详情</el-button>
            <el-button @click="getNewRecommend">换一个</el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 今日推荐区域 -->
    <div class="today-recommends">
      <h2>今日推荐</h2>
      <el-row :gutter="20">
        <el-col :span="8" v-for="dish in todayRecommends" :key="dish.id">
          <el-card class="recommend-card" @click="viewRecipeDetail(dish.id)">
            <div class="recommend-image">
              <img :src="dish.image" :alt="dish.name">
            </div>
            <div class="recommend-info">
              <h3>{{ dish.name }}</h3>
              <div class="recommend-tags" v-if="dish.category || dish.cookingMethod">
                <el-tag size="small" v-if="dish.category">{{ dish.category }}</el-tag>
                <el-tag size="small" type="success" v-if="dish.cookingMethod">{{ dish.cookingMethod }}</el-tag>
              </div>
              <p class="cooking-time">
                <el-icon><Clock /></el-icon>
                {{ dish.cookingTime }}
              </p>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useRecipeStore } from '../stores/recipe'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import { Clock, Search, Food, Sugar, Timer } from '@element-plus/icons-vue'

const router = useRouter()
const recipeStore = useRecipeStore()
const { homePageRecipe: currentRecipe, homePageRecommends: todayRecommends } = storeToRefs(recipeStore)
const searchKeyword = ref('')
const showSuggestions = ref(false)
const searchSuggestions = ref([])
const activeFilters = ref([])

// 计算属性：按类型分组的建议
const dishSuggestions = computed(() => 
  searchSuggestions.value.filter(s => s.type === 'dish')
)

const ingredientSuggestions = computed(() => 
  searchSuggestions.value.filter(s => s.type === 'ingredient')
)

const timeSuggestions = computed(() => 
  searchSuggestions.value.filter(s => s.type === 'time')
)

// 获取随机推荐
const getNewRecommend = async () => {
  try {
    recipeStore.resetHomePageRecipe() // 只重置随机推荐
    await recipeStore.getHomePageRecipe() // 获取新的随机推荐
  } catch (error) {
    ElMessage.error('获取推荐失败，请稍后重试')
  }
}

// 获取今日推荐
const getTodayRecommends = async () => {
  try {
    await recipeStore.getHomePageRecommends()
  } catch (error) {
    ElMessage.error('获取今日推荐失败，请稍后重试')
  }
}

// 查看菜品详情
const viewRecipeDetail = (id) => {
  router.push(`/recipe/${id}`)
}

// 监听搜索关键词变化
watch(searchKeyword, async (newValue) => {
  if (newValue.trim()) {
    // 模拟获取搜索建议
    searchSuggestions.value = await getSearchSuggestions(newValue)
    showSuggestions.value = true
  } else {
    showSuggestions.value = false
  }
})

// 获取搜索建议
const getSearchSuggestions = async (keyword) => {
  // 这里应该调用后端API获取建议
  // 目前使用模拟数据
  const suggestions = []
  
  // 菜品建议
  suggestions.push(
    { id: 1, text: '红烧肉', type: 'dish', category: '肉类' },
    { id: 2, text: '清炒西兰花', type: 'dish', category: '素菜' }
  )
  
  // 食材建议
  suggestions.push(
    { id: 3, text: '五花肉', type: 'ingredient' },
    { id: 4, text: '西兰花', type: 'ingredient' }
  )
  
  // 时间建议
  if (keyword.includes('分钟') || /\d+/.test(keyword)) {
    suggestions.push(
      { id: 5, text: '快速料理', type: 'time', duration: '15分钟以内' },
      { id: 6, text: '常规烹饪', type: 'time', duration: '15-30分钟' }
    )
  }
  
  return suggestions.filter(item => 
    item.text.toLowerCase().includes(keyword.toLowerCase()) ||
    (item.category && item.category.toLowerCase().includes(keyword.toLowerCase())) ||
    (item.duration && item.duration.toLowerCase().includes(keyword.toLowerCase()))
  )
}

// 处理建议点击
const handleSuggestionClick = (suggestion) => {
  searchKeyword.value = suggestion.text
  showSuggestions.value = false
  handleSearch()
}

// 处理搜索
const handleSearch = () => {
  if (!searchKeyword.value.trim()) {
    ElMessage.warning('请输入搜索内容')
    return
  }

  // 跳转到搜索结果页
  router.push({
    path: '/search',
    query: {
      keyword: searchKeyword.value.trim()
    }
  })
}

// 添加筛选标签
const addFilter = (filter) => {
  if (!activeFilters.value.find(f => f.value === filter.value)) {
    activeFilters.value.push(filter)
  }
}

// 移除筛选标签
const removeFilter = (filter) => {
  activeFilters.value = activeFilters.value.filter(f => f.value !== filter.value)
  if (filter.value === searchKeyword.value) {
    searchKeyword.value = ''
  }
}

// 页面加载时获取数据
onMounted(async () => {
  if (!currentRecipe.value) {
    await recipeStore.getHomePageRecipe()
  }
  if (!todayRecommends.value?.length) {
    await recipeStore.getHomePageRecommends()
  }
})
</script>

<style scoped>
.home {
  max-width: 100%;
  margin: 0;
  padding: 0;
  background: #fff;
  min-height: 100vh;
}

.header {
  background: linear-gradient(135deg, #409EFF, #66b1ff);
  padding: 80px 0;
  text-align: center;
  color: #fff;
}

.header h1 {
  font-size: 4em;
  color: #fff;
  margin-bottom: 16px;
  font-weight: 800;
  letter-spacing: -1px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.header p {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.4em;
  margin: 0 0 32px;
  font-weight: 300;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.search-section {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.search-bar {
  position: relative;
  margin-bottom: 16px;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 24px;
  padding-left: 16px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: none;
  transition: all 0.3s ease;
  height: 56px;
}

.search-input :deep(.el-input__wrapper):hover,
.search-input :deep(.el-input__wrapper.is-focus) {
  background: #fff;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2);
}

.search-input :deep(.el-input__inner) {
  height: 56px;
  font-size: 16px;
  color: #333;
}

.search-input :deep(.el-input__prefix) {
  font-size: 20px;
  color: #666;
}

.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  margin-top: 8px;
  padding: 8px 0;
  z-index: 100;
  max-height: 400px;
  overflow-y: auto;
}

.suggestion-group {
  padding: 8px 0;
}

.suggestion-group + .suggestion-group {
  border-top: 1px solid #f0f2f5;
}

.group-title {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  color: #909399;
  font-size: 13px;
}

.group-title .el-icon {
  font-size: 16px;
}

.suggestion-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.suggestion-item:hover {
  background: #f5f7fa;
}

.suggestion-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.suggestion-text {
  font-size: 14px;
  color: #333;
}

.suggestion-info {
  font-size: 12px;
  color: #909399;
  background: #f5f7fa;
  padding: 2px 8px;
  border-radius: 10px;
}

.active-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.filter-tag {
  border-radius: 16px;
  padding: 0 12px;
  height: 28px;
  line-height: 26px;
  font-size: 12px;
}

.random-recommend {
  margin: -100px auto 100px;
  position: relative;
  z-index: 10;
}

.recipe-card {
  display: flex;
  flex-direction: column;
  padding: 0;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  background: #fff;
  overflow: hidden;
  border: none;
  max-width: 400px;
  margin: 0 auto;
}

.recipe-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.1);
}

.recipe-image {
  width: 100%;
  height: 280px;
  overflow: hidden;
  position: relative;
}

.recipe-image::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.1));
  z-index: 1;
}

.recipe-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.recipe-card:hover .recipe-image img {
  transform: scale(1.03);
}

.recipe-info {
  padding: 24px;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.recipe-info h2 {
  font-size: 1.6em;
  color: #333;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.3;
}

.recipe-tags {
  margin: 12px 0;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.recipe-tags .el-tag {
  padding: 4px 12px;
  font-size: 0.85em;
  border-radius: 20px;
  font-weight: 500;
}

.cooking-time {
  color: #666;
  margin: 12px 0;
  font-size: 0.9em;
  display: flex;
  align-items: center;
  gap: 6px;
}

.cooking-time .el-icon {
  font-size: 1.1em;
  color: #909399;
}

.recipe-info .el-button {
  margin: 8px 0;
  padding: 10px 24px;
  font-size: 0.95em;
  border-radius: 25px;
  transition: all 0.3s ease;
  font-weight: 500;
  width: calc(50% - 6px);
  display: inline-block;
}

.recipe-info .button-group {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  gap: 12px;
}

.recipe-info .el-button--primary {
  background: #409EFF;
  border: none;
}

.recipe-info .el-button--primary:hover {
  background: #66b1ff;
  transform: translateY(-2px);
}

.recipe-info .el-button--default {
  border: 1px solid #dcdfe6;
  background: #fff;
}

.recipe-info .el-button--default:hover {
  border-color: #409EFF;
  color: #409EFF;
  transform: translateY(-2px);
}

.today-recommends {
  padding: 0 20px;
  max-width: 1200px;
  margin: 80px auto 0;
}

.today-recommends h2 {
  margin-bottom: 40px;
  font-size: 2em;
  color: #333;
  text-align: center;
  font-weight: 600;
  position: relative;
  padding-bottom: 15px;
}

.today-recommends h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 3px;
  background: #409EFF;
  border-radius: 2px;
}

.el-row {
  margin: -12px;
}

.el-col {
  padding: 12px;
}

.recommend-card {
  height: 100%;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: none;
  background: #fff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.recommend-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.1);
}

.recommend-image {
  height: 220px;
  overflow: hidden;
  position: relative;
}

.recommend-image::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.1));
  z-index: 1;
}

.recommend-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.recommend-card:hover .recommend-image img {
  transform: scale(1.03);
}

.recommend-info {
  padding: 20px;
  background: #fff;
}

.recommend-info h3 {
  font-size: 1.2em;
  color: #333;
  margin: 0 0 12px 0;
  font-weight: 600;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recommend-tags {
  margin-bottom: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.recommend-tags .el-tag {
  padding: 3px 10px;
  font-size: 0.8em;
  border-radius: 20px;
  font-weight: 500;
}

.cooking-time {
  color: #666;
  font-size: 0.85em;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.cooking-time i {
  font-size: 1.1em;
  color: #909399;
}

@media screen and (max-width: 768px) {
  .today-recommends {
    padding: 0 16px;
    margin-top: 40px;
  }

  .today-recommends h2 {
    font-size: 1.4em;
    margin-bottom: 24px;
  }

  .header {
    padding: 40px 16px;
  }

  .header h1 {
    font-size: 2.2em;
    margin-bottom: 8px;
  }

  .header p {
    font-size: 1em;
    margin-bottom: 20px;
  }

  .search-input :deep(.el-input__inner) {
    height: 40px;
    font-size: 14px;
  }

  .search-bar {
    padding: 0 20px;
  }

  .random-recommend {
    margin: -60px auto 40px;
    padding: 0 16px;
  }

  .recipe-card {
    max-width: 100%;
  }

  .recipe-image {
    height: 240px;
  }

  .recipe-info {
    padding: 16px;
  }

  .recipe-info h2 {
    font-size: 1.4em;
    margin-bottom: 12px;
  }

  .recipe-tags {
    margin: 8px 0;
    gap: 6px;
  }

  .recipe-tags .el-tag {
    padding: 2px 10px;
    font-size: 0.8em;
  }

  .cooking-time {
    font-size: 0.85em;
    margin: 8px 0;
  }

  .recipe-info .button-group {
    flex-direction: column;
    gap: 8px;
    margin-top: 12px;
  }

  .recipe-info .el-button {
    width: 100%;
    margin: 0;
    height: 40px;
    font-size: 0.9em;
  }

  .el-col {
    width: 100%;
    padding: 8px;
  }

  .recommend-card {
    border-radius: 12px;
  }

  .recommend-image {
    height: 160px;
  }

  .recommend-info {
    padding: 12px;
  }

  .recommend-info h3 {
    font-size: 1em;
    margin-bottom: 8px;
  }

  .recommend-tags .el-tag {
    padding: 1px 8px;
    font-size: 0.75em;
  }

  .cooking-time {
    font-size: 0.8em;
  }

  .el-row {
    margin: -8px;
  }

  .search-suggestions {
    max-height: 300px;
  }

  .suggestion-item {
    padding: 8px 12px;
  }

  .suggestion-text {
    font-size: 13px;
  }

  .suggestion-info {
    font-size: 11px;
    padding: 1px 6px;
  }
}

@media screen and (min-width: 769px) and (max-width: 1200px) {
  .el-col {
    width: 50%;
    padding: 10px;
  }

  .recommend-image {
    height: 180px;
  }

  .el-row {
    margin: -10px;
  }
}
</style> 