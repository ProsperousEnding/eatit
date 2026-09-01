<template>
  <div class="home">
    <!-- 头部区域 -->
    <div class="header">
      <h1>今天吃什么？</h1>
      <p>每天为您精选美味佳肴</p>

      <!-- 搜索栏 -->
      <div class="search-section">
        <form class="search-bar" role="search" @submit.prevent="handleSearch">
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
          <el-button
            class="search-submit"
            type="primary"
            native-type="submit"
            title="搜索菜谱"
            aria-label="搜索菜谱"
          >
            <el-icon><Search /></el-icon>
          </el-button>
        </form>
      </div>
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
        <router-link class="recipe-card-link" :to="`/recipe/${currentRecipe.id}`">
          <el-card class="recipe-card">
            <div class="recipe-image">
            <ResponsiveDishImage
              :src="currentRecipe.image"
              :alt="currentRecipe.name"
              class="recipe-media"
              sizes="(max-width: 640px) calc(100vw - 48px), (max-width: 899px) calc(100vw - 64px), 800px"
              loading="eager"
              fetch-priority="high"
              fit="cover"
            />
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
            <div class="featured-details">
              <dl class="featured-meta">
                <div>
                  <dt>口味</dt>
                  <dd>{{ currentRecipe.taste }}</dd>
                </div>
                <div>
                  <dt>烹饪时间</dt>
                  <dd>{{ currentRecipe.cookingTime }}</dd>
                </div>
              </dl>
              <div class="featured-ingredients">
                <span>主要食材</span>
                <p>{{ currentRecipe.ingredients.slice(0, 4).join('、') }}</p>
              </div>
              <span class="recipe-entry-label">查看完整做法</span>
            </div>
            </div>
          </el-card>
        </router-link>
      </div>

      <!-- 分类快捷入口 -->
      <div class="category-shortcuts">
        <div class="shortcut-grid">
          <router-link
            v-for="category in categories"
            :key="category.id"
            class="shortcut-item"
            :to="{ path: '/category', query: { id: category.id } }"
          >
            <el-icon class="shortcut-icon"><component :is="category.icon" /></el-icon>
            <span>{{ category.name }}</span>
          </router-link>
        </div>
      </div>

      <!-- 今日推荐区域 -->
      <div class="today-recommends">
        <div class="section-title">
          <h2>精选推荐</h2>
          <el-button text @click="refreshRecommends">
            <el-icon><Refresh /></el-icon>
            换一批
          </el-button>
        </div>
        <div class="recommend-grid">
          <router-link
            v-for="dish in todayRecommends"
            :key="dish.id"
            class="recommend-item"
            :to="`/recipe/${dish.id}`"
          >
            <div class="recommend-image">
              <ResponsiveDishImage
                :src="dish.image"
                :alt="dish.name"
                class="recommend-media"
                sizes="(max-width: 640px) calc((100vw - 36px) / 2), (max-width: 899px) calc((100vw - 36px) / 2), 368px"
                fit="cover"
              />
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
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import '@/styles/element-plus-home.css'
import { useRouter } from 'vue-router'
import { useRecipeStore } from '../stores/recipe'
import { storeToRefs } from 'pinia'
import {
  ElButton,
  ElCard,
  ElIcon,
  ElInput,
  ElMessage,
  ElTag
} from 'element-plus'
import ResponsiveDishImage from '@/components/ResponsiveDishImage.vue'
import { RECIPE_CATEGORIES } from '@/config/categories'
import {
  Clock,
  Search,
  Refresh,
  Food,
  Chicken,
  Bowl,
  Apple
} from '@element-plus/icons-vue'

const router = useRouter()
const recipeStore = useRecipeStore()
const { homePageRecipe: currentRecipe, homePageRecommends: todayRecommends } = storeToRefs(recipeStore)
const searchKeyword = ref('')

// 获取随机推荐
const getNewRecommend = async () => {
  try {
    await recipeStore.getHomePageRecipe()
  } catch {
    ElMessage.error('获取推荐失败，请稍后重试')
  }
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

const categoryIcons = { apple: Apple, bowl: Bowl, chicken: Chicken, food: Food }
const categories = computed(() => {
  const availableCategories = new Set(
    recipeStore.getAllDishesArray().map(dish => dish.category)
  )

  return RECIPE_CATEGORIES
    .filter(category => category.sourceCategories.some(sourceCategory => availableCategories.has(sourceCategory)))
    .map(category => ({ ...category, icon: categoryIcons[category.icon] }))
})

// 刷新推荐列表
const refreshRecommends = async () => {
  try {
    await recipeStore.getHomePageRecommends(true)
  } catch {
    ElMessage.error('获取推荐失败，请稍后重试')
  }
}

// 初始化数据
onMounted(async () => {
  try {
    await Promise.all([
      recipeStore.getHomePageRecipe(),
      recipeStore.getHomePageRecommends()
    ])
  } catch {
    ElMessage.error('获取推荐失败，请稍后重试')
  }
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
  padding: 32px 16px;
  text-align: center;
  color: #fff;
}

.header h1 {
  font-size: 2em;
  margin: 0 0 8px;
  font-weight: 700;
  color: #fff;
}

.header p {
  font-size: 1em;
  margin: 0;
  opacity: 0.9;
}

.content-area {
  width: min(100%, 1200px);
  margin: 0 auto;
  padding-bottom: 24px;
}

.search-section {
  max-width: 680px;
  margin: 24px auto 0;
}

.search-bar {
  display: flex;
  align-items: stretch;
  gap: 8px;
}

.search-input {
  min-width: 0;
}

.search-input :deep(.el-input__wrapper) {
  height: 48px;
  padding: 0 16px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: none;
}

.search-submit {
  width: 48px;
  height: 48px;
  flex: 0 0 48px;
  padding: 0;
  border: 0;
  border-radius: 8px;
  background: #1769aa;
}

.search-submit:hover,
.search-submit:focus {
  background: #12578f;
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
  color: inherit;
  text-decoration: none;
}

.recipe-card-link,
.recommend-item {
  display: block;
  color: inherit;
  text-decoration: none;
}

.shortcut-item:focus-visible,
.recommend-item:focus-visible,
.recipe-card-link:focus-visible {
  outline: 3px solid #409eff;
  outline-offset: 3px;
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
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  cursor: pointer;
}

.recommend-image {
  position: relative;
  padding-top: 100%;
}

.recommend-media {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
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

.recipe-card {
  margin: 0 12px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: none;
  cursor: pointer;
}

.recipe-card :deep(.el-card__body) {
  padding: 0;
}

.recipe-image {
  position: relative;
  padding-top: 60%;
}

.recipe-media {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
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

.featured-details {
  display: none;
}

@media screen and (min-width: 900px) {
  .header {
    padding: 28px 24px;
  }

  .section-title {
    padding: 20px 24px 14px;
  }

  .recipe-card {
    margin: 0 24px;
  }

  .recipe-card :deep(.el-card__body) {
    display: grid;
    grid-template-columns: minmax(0, 1.7fr) minmax(280px, 0.7fr);
  }

  .recipe-image {
    height: clamp(300px, 24vw, 360px);
    padding-top: 0;
  }

  .recipe-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 32px;
  }

  .recipe-info h3 {
    font-size: 1.5em;
  }

  .featured-details {
    display: block;
    margin-top: 24px;
  }

  .featured-meta {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    margin: 0;
  }

  .featured-meta div {
    min-width: 0;
  }

  .featured-meta dt,
  .featured-ingredients span {
    margin-bottom: 5px;
    color: #909399;
    font-size: 12px;
  }

  .featured-meta dd {
    margin: 0;
    color: #303133;
    font-weight: 600;
  }

  .featured-ingredients {
    margin-top: 20px;
  }

  .featured-ingredients p {
    margin: 6px 0 0;
    color: #606266;
    line-height: 1.6;
  }

  .recipe-entry-label {
    display: inline-block;
    margin-top: 22px;
    color: #1769aa;
    font-weight: 600;
  }

  .category-shortcuts {
    margin: 24px 24px 8px;
    padding: 20px 16px;
    border-radius: 8px;
  }

  .shortcut-grid {
    grid-template-columns: repeat(8, minmax(0, 1fr));
  }

  .recommend-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
    padding: 0 24px;
  }

  .recommend-image {
    padding-top: 75%;
  }
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
