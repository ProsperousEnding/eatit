<template>
  <div class="home">
    <!-- 头部区域 -->
    <div class="header">
      <!-- 搜索栏 -->
      <div class="search-section">
        <div class="search-bar">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索菜品、食材..."
            class="search-input"
            @keyup.enter="handleSearch"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </div>
      <h1>今天吃什么？</h1>
      <p>每天为您精选美味佳肴</p>
    </div>

    <!-- 内容区域 -->
    <div class="content-area">
      <!-- 随机推荐区域 -->
      <div class="random-recommend" v-if="currentRecipe">
        <div class="section-title">
          <h2>今日推荐</h2>
          <el-button text @click="getNewRecommend">
            <el-icon><Refresh /></el-icon>
            换一个
          </el-button>
        </div>
        <el-card class="recipe-card" @click="viewRecipeDetail(currentRecipe.id)">
          <div class="recipe-image">
            <img :src="getImageUrl(currentRecipe.image)" :alt="currentRecipe.name">
            <div class="recipe-overlay">
              <span class="cooking-time">
                <el-icon><Clock /></el-icon>
                {{ currentRecipe.cookingTime }}
              </span>
            </div>
          </div>
          <div class="recipe-info">
            <h3>{{ currentRecipe.name }}</h3>
            <div class="recipe-tags">
              <el-tag size="small">{{ currentRecipe.category }}</el-tag>
              <el-tag size="small" type="success">{{ currentRecipe.cookingMethod }}</el-tag>
              <el-tag size="small" type="warning">{{ currentRecipe.difficulty }}</el-tag>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 分类快捷入口 -->
      <div class="category-shortcuts">
        <div class="shortcut-grid">
          <div v-for="category in categories" :key="category.id" class="shortcut-item" @click="navigateToCategory(category)">
            <el-icon class="shortcut-icon"><component :is="category.icon" /></el-icon>
            <span>{{ category.name }}</span>
          </div>
        </div>
      </div>

      <!-- 今日推荐区域 -->
      <div class="today-recommends">
        <div class="section-title">
          <h2>精选推荐</h2>
        </div>
        <div class="recommend-grid">
          <div 
            v-for="dish in todayRecommends" 
            :key="dish.id"
            class="recommend-item"
            @click="viewRecipeDetail(dish.id)"
          >
            <div class="recommend-image">
              <img :src="getImageUrl(dish.image)" :alt="dish.name">
              <div class="recommend-overlay">
                <span class="cooking-time">
                  <el-icon><Clock /></el-icon>
                  {{ dish.cookingTime }}
                </span>
              </div>
            </div>
            <div class="recommend-info">
              <h3>{{ dish.name }}</h3>
              <div class="recommend-tags">
                <el-tag size="small">{{ dish.category }}</el-tag>
                <el-tag size="small" type="success">{{ dish.cookingMethod }}</el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载更多 -->
      <div class="load-more" v-if="hasMore">
        <el-button text @click="loadMore">加载更多</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useRecipeStore } from '../stores/recipe'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import { getImageUrl } from '@/utils/image'
import { 
  Clock, 
  Search, 
  Refresh,
  Food,
  Timer,
  Chicken,
  Bowl,
  Apple,
  Coffee
} from '@element-plus/icons-vue'

const router = useRouter()
const recipeStore = useRecipeStore()
const { homePageRecipe: currentRecipe, homePageRecommends: todayRecommends } = storeToRefs(recipeStore)
const searchKeyword = ref('')
const showSuggestions = ref(false)
const searchSuggestions = ref([])
const activeFilters = ref([])
const hasMore = ref(true)
const page = ref(1)

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
  if (!id) {
    ElMessage.error('菜品ID不存在')
    return
  }
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

// 新增状态
const categories = [
  { id: 1, name: '早餐', icon: 'Coffee' },
  { id: 2, name: '午餐', icon: 'Bowl' },
  { id: 3, name: '晚餐', icon: 'Food' },
  { id: 4, name: '小食', icon: 'Apple' },
  { id: 5, name: '汤品', icon: 'Bowl' },
  { id: 6, name: '肉类', icon: 'Chicken' },
  { id: 7, name: '素食', icon: 'Food' },
  { id: 8, name: '饮品', icon: 'Coffee' }
]

// 加载更多
const loadMore = async () => {
  try {
    page.value++
    await recipeStore.getMoreRecommends(page.value)
    hasMore.value = todayRecommends.value.length < 30 // 假设最多显示30个推荐
  } catch (error) {
    ElMessage.error('加载更多失败，请稍后重试')
    page.value--
  }
}

// 导航到分类页面
const navigateToCategory = (category) => {
  router.push({
    path: '/category',
    query: { id: category.id, name: category.name }
  })
}

// 初始化数据
onMounted(async () => {
  await Promise.all([
    recipeStore.getHomePageRecipe(),
    recipeStore.getHomePageRecommends()
  ])
})
</script>

<style scoped>
.home {
  max-width: 100%;
  margin: 0;
  padding: 0;
  background: #f5f7fa;
  min-height: 100vh;
}

.header {
  background: linear-gradient(135deg, #409EFF, #66b1ff);
  padding: 40px 16px;
  text-align: center;
  color: #fff;
}

.header h1 {
  font-size: 2em;
  margin: 16px 0 8px;
  font-weight: 700;
}

.header p {
  font-size: 1em;
  margin: 0;
  opacity: 0.9;
}

.search-section {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 16px;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 20px;
  height: 44px;
  background: rgba(255, 255, 255, 0.95);
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
}

.section-title h2 {
  font-size: 1.2em;
  margin: 0;
  color: #333;
}

.category-shortcuts {
  background: #fff;
  padding: 16px;
  margin: 16px 0;
}

.shortcut-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.shortcut-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.shortcut-icon {
  font-size: 24px;
  color: #409EFF;
}

.recommend-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 0 12px;
}

.recommend-item {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.recommend-image {
  position: relative;
  padding-top: 100%;
}

.recommend-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recommend-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px;
  background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
  color: #fff;
}

.recommend-info {
  padding: 12px;
}

.recommend-info h3 {
  font-size: 1em;
  margin: 0 0 8px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recommend-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.recommend-tags .el-tag {
  font-size: 10px;
  padding: 0 6px;
  height: 20px;
}

.load-more {
  text-align: center;
  padding: 16px;
}

.recipe-card {
  margin: 0 12px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: none;
}

.recipe-image {
  position: relative;
  padding-top: 60%;
}

.recipe-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recipe-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px;
  background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
  color: #fff;
}

.cooking-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.recipe-info {
  padding: 16px;
}

.recipe-info h3 {
  font-size: 1.1em;
  margin: 0 0 12px;
  color: #333;
}

.recipe-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

@media screen and (max-width: 320px) {
  .recommend-grid {
    grid-template-columns: 1fr;
  }
  
  .shortcut-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style> 